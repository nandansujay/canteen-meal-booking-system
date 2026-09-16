const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function register({ name, email, password, phone, role }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, phone || null, role || 'student']
  );
  return getUserById(result.insertId);
}

async function login(email, password) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;

  return user;
}

function issueToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, wallet_balance, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

module.exports = { register, login, issueToken, getUserById };
