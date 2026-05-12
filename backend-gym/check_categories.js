const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function check() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fitgear_db'
  });
  const [rows] = await pool.query('SELECT * FROM CATEGORIES ORDER BY category_id');
  console.log('Current categories:');
  console.table(rows);
  process.exit(0);
}
check();
