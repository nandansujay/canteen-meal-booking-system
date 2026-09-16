const { pool } = require('../config/db');

async function getBalance(userId) {
  const [rows] = await pool.query('SELECT wallet_balance FROM users WHERE id = ?', [userId]);
  return rows[0];
}

async function recharge(userId, amount) {
  await pool.query('CALL sp_recharge_wallet(?, ?)', [userId, amount]);
  return getBalance(userId);
}

async function getTransactions(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

module.exports = { getBalance, recharge, getTransactions };
