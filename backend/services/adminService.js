const { pool } = require('../config/db');

function parseItems(row) {
  return { ...row, items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items };
}

async function collectTicket(ticketToken) {
  await pool.query('CALL sp_collect_order(?)', [ticketToken]);
  const [rows] = await pool.query(
    'SELECT * FROM vw_order_history WHERE ticket_token = ?',
    [ticketToken]
  );
  return parseItems(rows[0]);
}

async function getCounterLoad() {
  const [rows] = await pool.query('SELECT * FROM vw_counter_load ORDER BY counter_id');
  return rows;
}

async function getDailySales() {
  const [rows] = await pool.query('SELECT * FROM vw_daily_sales LIMIT 14');
  return rows;
}

async function getSalesSummary() {
  const [rows] = await pool.query(
    `SELECT
       COALESCE(SUM(revenue), 0) AS revenue,
       COALESCE(SUM(total_orders), 0) AS total_orders,
       COALESCE(SUM(collected_orders), 0) AS collected_orders,
       COALESCE(SUM(cancelled_orders), 0) AS cancelled_orders
     FROM vw_daily_sales`
  );
  return rows[0];
}

async function getAllFeedback() {
  const [rows] = await pool.query('SELECT * FROM vw_feedback_details');
  return rows;
}

async function getAllOrders() {
  const [rows] = await pool.query('SELECT * FROM vw_order_history ORDER BY placed_at DESC');
  return rows.map(parseItems);
}

async function getAllMenuItems() {
  const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY category, name');
  return rows;
}

async function createMenuItem({ name, description, image_url, category, price, capacity }) {
  const [result] = await pool.query(
    'INSERT INTO menu_items (name, description, image_url, category, price, capacity) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description || null, image_url || null, category, price, capacity]
  );
  return result.insertId;
}

const UPDATABLE_FIELDS = ['name', 'description', 'image_url', 'category', 'price', 'capacity', 'is_available'];

async function updateMenuItem(id, updates) {
  const fields = Object.keys(updates).filter((key) => UPDATABLE_FIELDS.includes(key));
  if (fields.length === 0) return;

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => updates[f]);
  await pool.query(`UPDATE menu_items SET ${setClause} WHERE id = ?`, [...values, id]);
}

async function deleteMenuItem(id) {
  await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
}

module.exports = {
  collectTicket,
  getCounterLoad,
  getDailySales,
  getSalesSummary,
  getAllFeedback,
  getAllOrders,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
