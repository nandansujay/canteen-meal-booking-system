-- ============================================================
-- Canteen Meal Pre-booking & Ticketing System
-- Full database schema: tables, constraints, triggers,
-- stored procedures, and views.
-- ============================================================

CREATE DATABASE IF NOT EXISTS canteen_system;
USE canteen_system;

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(100)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  phone         VARCHAR(15),
  role          ENUM('student','admin') NOT NULL DEFAULT 'student',
  wallet_balance DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  description  VARCHAR(255),
  image_url    VARCHAR(500),
  category     ENUM('breakfast','lunch','dinner','snacks') NOT NULL,
  price        DECIMAL(8,2) NOT NULL,
  capacity     INT NOT NULL DEFAULT 0,
  booked_count INT NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_menu_items_booked_count CHECK (booked_count >= 0 AND booked_count <= capacity)
);

CREATE TABLE counters (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  counter_id    INT NOT NULL,
  pickup_time   TIME NOT NULL,
  ticket_token  VARCHAR(64) NOT NULL UNIQUE,
  status        ENUM('placed','collected','cancelled') NOT NULL DEFAULT 'placed',
  total_amount  DECIMAL(10,2) NOT NULL,
  placed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  collected_at  TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE RESTRICT,
  CONSTRAINT chk_orders_total CHECK (total_amount > 0)
);

CREATE TABLE bookings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  subtotal     DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
  CONSTRAINT chk_bookings_quantity CHECK (quantity > 0),
  CONSTRAINT chk_bookings_subtotal CHECK (subtotal > 0)
);

CREATE TABLE wallet_transactions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  type           ENUM('credit','debit') NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  reference_type ENUM('recharge','booking','refund') NOT NULL,
  reference_id   INT,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_wallet_amount CHECK (amount > 0)
);

CREATE TABLE feedback (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id    INT NOT NULL,
  rating     TINYINT NOT NULL,
  comment    VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_booking_feedback (booking_id),
  CHECK (rating BETWEEN 1 AND 5)
);

-- ------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------

DELIMITER //

-- Keeps users.wallet_balance in sync with the wallet_transactions ledger.
CREATE TRIGGER trg_wallet_txn_after_insert
AFTER INSERT ON wallet_transactions
FOR EACH ROW
BEGIN
  IF NEW.type = 'credit' THEN
    UPDATE users SET wallet_balance = wallet_balance + NEW.amount WHERE id = NEW.user_id;
  ELSE
    UPDATE users SET wallet_balance = wallet_balance - NEW.amount WHERE id = NEW.user_id;
  END IF;
END//

-- Releases menu_items capacity for every line item when an order is cancelled.
CREATE TRIGGER trg_order_cancel_release
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE menu_items mi
    JOIN bookings b ON b.menu_item_id = mi.id
    SET mi.booked_count = mi.booked_count - b.quantity
    WHERE b.order_id = OLD.id;
  END IF;
END//

DELIMITER ;

-- ------------------------------------------------------------
-- STORED PROCEDURES
-- ------------------------------------------------------------

DELIMITER //

-- Places a multi-item order atomically: validates stock and wallet balance,
-- assigns a counter/pickup time via round-robin (once per order, not per
-- item), inserts the order + line items, updates stock, and debits the
-- wallet. Rolls back completely on any failure.
CREATE PROCEDURE sp_place_order(
  IN  p_user_id INT,
  IN  p_items_json JSON,
  OUT p_ticket_token VARCHAR(64),
  OUT p_counter_name VARCHAR(50),
  OUT p_pickup_time TIME,
  OUT p_total_amount DECIMAL(10,2)
)
BEGIN
  DECLARE v_wallet DECIMAL(10,2);
  DECLARE v_invalid_count INT;
  DECLARE v_seq INT;
  DECLARE v_counter_id INT;
  DECLARE v_order_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Lock every menu_item row referenced in this order in one shot
  SELECT id FROM menu_items
  WHERE id IN (
    SELECT menu_item_id FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS(
      menu_item_id INT PATH '$.menu_item_id'
    )) AS jt
  )
  FOR UPDATE;

  -- Validate every line item: exists, available, enough stock, sane quantity
  SELECT COUNT(*) INTO v_invalid_count
  FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS(
         menu_item_id INT PATH '$.menu_item_id',
         quantity     INT PATH '$.quantity'
       )) AS jt
  LEFT JOIN menu_items mi ON mi.id = jt.menu_item_id
  WHERE jt.quantity <= 0
     OR mi.id IS NULL
     OR mi.is_available = FALSE
     OR (mi.capacity - mi.booked_count) < jt.quantity;

  IF v_invalid_count > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'One or more items are unavailable in the requested quantity';
  END IF;

  SELECT SUM(mi.price * jt.quantity) INTO p_total_amount
  FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS(
         menu_item_id INT PATH '$.menu_item_id',
         quantity     INT PATH '$.quantity'
       )) AS jt
  JOIN menu_items mi ON mi.id = jt.menu_item_id;

  SELECT wallet_balance INTO v_wallet FROM users WHERE id = p_user_id FOR UPDATE;

  IF v_wallet IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
  END IF;

  IF v_wallet < p_total_amount THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance. Please top up your wallet.';
  END IF;

  -- Round robin counts ORDERS (checkouts), not individual line items
  SELECT COUNT(*) INTO v_seq FROM orders WHERE DATE(placed_at) = CURDATE() AND status != 'cancelled';
  SET v_counter_id = (v_seq MOD 4) + 1;
  SET p_pickup_time = ADDTIME('12:00:00', SEC_TO_TIME(FLOOR(v_seq / 4) * 300));
  SET p_ticket_token = UUID();

  INSERT INTO orders (user_id, counter_id, pickup_time, ticket_token, total_amount)
  VALUES (p_user_id, v_counter_id, p_pickup_time, p_ticket_token, p_total_amount);

  SET v_order_id = LAST_INSERT_ID();

  INSERT INTO bookings (order_id, menu_item_id, quantity, subtotal)
  SELECT v_order_id, jt.menu_item_id, jt.quantity, mi.price * jt.quantity
  FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS(
         menu_item_id INT PATH '$.menu_item_id',
         quantity     INT PATH '$.quantity'
       )) AS jt
  JOIN menu_items mi ON mi.id = jt.menu_item_id;

  UPDATE menu_items mi
  JOIN JSON_TABLE(p_items_json, '$[*]' COLUMNS(
         menu_item_id INT PATH '$.menu_item_id',
         quantity     INT PATH '$.quantity'
       )) AS jt ON jt.menu_item_id = mi.id
  SET mi.booked_count = mi.booked_count + jt.quantity;

  INSERT INTO wallet_transactions (user_id, type, amount, reference_type, reference_id)
  VALUES (p_user_id, 'debit', p_total_amount, 'booking', v_order_id);

  SELECT name INTO p_counter_name FROM counters WHERE id = v_counter_id;

  COMMIT;
END//

-- Verifies a ticket token and marks the order collected. Rejects invalid,
-- already-collected, or cancelled tickets.
CREATE PROCEDURE sp_collect_order(
  IN p_ticket_token VARCHAR(64)
)
BEGIN
  DECLARE v_order_id INT DEFAULT NULL;
  DECLARE v_status VARCHAR(20);
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_order_id = NULL;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT id, status INTO v_order_id, v_status
    FROM orders WHERE ticket_token = p_ticket_token
    FOR UPDATE;

  IF v_order_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid ticket';
  ELSEIF v_status = 'collected' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ticket already collected';
  ELSEIF v_status = 'cancelled' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This order was cancelled';
  ELSE
    UPDATE orders SET status = 'collected', collected_at = NOW() WHERE id = v_order_id;
  END IF;

  COMMIT;
END//

-- Cancels an active order and refunds its total to the user's wallet.
-- The trg_order_cancel_release trigger releases menu_items capacity.
CREATE PROCEDURE sp_cancel_order(
  IN p_order_id INT
)
BEGIN
  DECLARE v_user_id INT;
  DECLARE v_amount DECIMAL(10,2);
  DECLARE v_status VARCHAR(20);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT user_id, total_amount, status INTO v_user_id, v_amount, v_status
    FROM orders WHERE id = p_order_id FOR UPDATE;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found';
  ELSEIF v_status <> 'placed' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only active orders can be cancelled';
  END IF;

  UPDATE orders SET status = 'cancelled' WHERE id = p_order_id;

  INSERT INTO wallet_transactions (user_id, type, amount, reference_type, reference_id)
  VALUES (v_user_id, 'credit', v_amount, 'refund', p_order_id);

  COMMIT;
END//

-- Credits a user's wallet (admin/manual top-up).
CREATE PROCEDURE sp_recharge_wallet(
  IN p_user_id INT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  IF p_amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Recharge amount must be positive';
  END IF;

  INSERT INTO wallet_transactions (user_id, type, amount, reference_type)
  VALUES (p_user_id, 'credit', p_amount, 'recharge');
END//

DELIMITER ;

-- ------------------------------------------------------------
-- VIEWS
-- ------------------------------------------------------------

-- Live stock and average rating per menu item.
CREATE VIEW vw_menu_availability AS
SELECT
  mi.id,
  mi.name,
  mi.description,
  mi.image_url,
  mi.category,
  mi.price,
  mi.capacity,
  mi.booked_count,
  (mi.capacity - mi.booked_count) AS available_units,
  mi.is_available,
  ROUND(AVG(f.rating), 1) AS avg_rating,
  COUNT(f.id) AS review_count
FROM menu_items mi
LEFT JOIN bookings b ON b.menu_item_id = mi.id
LEFT JOIN feedback f ON f.booking_id = b.id
GROUP BY mi.id, mi.name, mi.description, mi.image_url, mi.category, mi.price, mi.capacity, mi.booked_count, mi.is_available;

-- One row per order, with its line items bundled as a JSON array.
CREATE VIEW vw_order_history AS
SELECT
  o.id AS order_id,
  o.user_id,
  u.name AS user_name,
  u.email AS user_email,
  o.status,
  o.ticket_token,
  c.name AS counter_name,
  o.pickup_time,
  o.total_amount,
  o.placed_at,
  o.collected_at,
  JSON_ARRAYAGG(JSON_OBJECT(
    'booking_id', b.id,
    'item_name', mi.name,
    'quantity', b.quantity,
    'subtotal', b.subtotal
  )) AS items
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN counters c ON c.id = o.counter_id
JOIN bookings b ON b.order_id = o.id
JOIN menu_items mi ON mi.id = b.menu_item_id
GROUP BY o.id, o.user_id, u.name, u.email, o.status, o.ticket_token, c.name, o.pickup_time, o.total_amount, o.placed_at, o.collected_at;

-- Orders and units handled per counter, today only.
CREATE VIEW vw_counter_load AS
SELECT
  c.id AS counter_id,
  c.name AS counter_name,
  COUNT(DISTINCT o.id) AS orders_today,
  COALESCE(SUM(b.quantity), 0) AS units_today
FROM counters c
LEFT JOIN orders o
  ON o.counter_id = c.id AND DATE(o.placed_at) = CURDATE() AND o.status != 'cancelled'
LEFT JOIN bookings b ON b.order_id = o.id
GROUP BY c.id, c.name;

-- Revenue and order counts grouped by day.
CREATE VIEW vw_daily_sales AS
SELECT
  DATE(placed_at) AS sale_date,
  COUNT(*) AS total_orders,
  SUM(CASE WHEN status = 'collected' THEN 1 ELSE 0 END) AS collected_orders,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
  SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) AS revenue
FROM orders
GROUP BY DATE(placed_at)
ORDER BY sale_date DESC;

-- Every review, with reviewer name, dish, and order — for the admin dashboard.
CREATE VIEW vw_feedback_details AS
SELECT
  f.id AS feedback_id,
  f.rating,
  f.comment,
  f.created_at,
  u.name AS user_name,
  mi.name AS item_name,
  o.id AS order_id
FROM feedback f
JOIN users u ON u.id = f.user_id
JOIN bookings b ON b.id = f.booking_id
JOIN menu_items mi ON mi.id = b.menu_item_id
JOIN orders o ON o.id = b.order_id
ORDER BY f.created_at DESC;
