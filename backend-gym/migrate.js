const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function migrate() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fitgear_db'
    });
    console.log('Connecting...');
    await pool.query('ALTER TABLE PRODUCT_IMAGES MODIFY image_url LONGTEXT');
    await pool.query('ALTER TABLE BRANDS MODIFY logo LONGTEXT');
    console.log('Altered columns to LONGTEXT successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
migrate();
