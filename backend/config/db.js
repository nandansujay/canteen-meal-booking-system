require('dotenv').config();
const mysql = require('mysql2/promise');

if (!process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
  throw new Error('DB_PASSWORD must be set in .env');
}

const pool = mysql.createPool({
  host:               process.env.DB_HOST || '127.0.0.1',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER || 'root',
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME || 'canteen_system',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully.');
    conn.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
