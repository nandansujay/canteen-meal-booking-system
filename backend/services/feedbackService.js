const { pool } = require('../config/db');

async function getBookingForFeedback(bookingId) {
  const [rows] = await pool.query(
    `SELECT b.id, b.order_id, o.user_id, o.status
     FROM bookings b
     JOIN orders o ON o.id = b.order_id
     WHERE b.id = ?`,
    [bookingId]
  );
  return rows[0];
}

async function submitFeedback(bookingId, userId, rating, comment) {
  await pool.query(
    'INSERT INTO feedback (booking_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [bookingId, userId, rating, comment || null]
  );
}

async function getMyFeedback(userId) {
  const [rows] = await pool.query('SELECT booking_id, rating, comment FROM feedback WHERE user_id = ?', [
    userId,
  ]);
  return rows;
}

module.exports = { getBookingForFeedback, submitFeedback, getMyFeedback };
