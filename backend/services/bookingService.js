const { pool } = require('../config/db');

async function getMenu() {
  const [rows] = await pool.query(
    'SELECT * FROM vw_menu_availability WHERE is_available = 1 ORDER BY category, name'
  );
  return rows;
}

async function placeOrder(userId, items) {
  const conn = await pool.getConnection();
  try {
    const itemsJson = JSON.stringify(items); // [{ menu_item_id, quantity }]
    await conn.query('CALL sp_place_order(?, ?, @token, @counter, @time, @total)', [
      userId,
      itemsJson,
    ]);
    const [rows] = await conn.query(
      'SELECT @token AS ticket_token, @counter AS counter_name, @time AS pickup_time, @total AS total_amount'
    );
    return rows[0];
  } finally {
    conn.release();
  }
}

function parseItems(row) {
  return { ...row, items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items };
}

async function getMyOrders(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM vw_order_history WHERE user_id = ? ORDER BY placed_at DESC',
    [userId]
  );
  return rows.map(parseItems);
}

async function getOrderOwner(orderId) {
  const [rows] = await pool.query('SELECT user_id, status FROM orders WHERE id = ?', [orderId]);
  return rows[0];
}

async function cancelOrder(orderId) {
  await pool.query('CALL sp_cancel_order(?)', [orderId]);
}

module.exports = { getMenu, placeOrder, getMyOrders, getOrderOwner, cancelOrder };
