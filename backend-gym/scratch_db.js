const pool = require('./src/config/db');
async function fix() {
  try {
    const [fks] = await pool.query(
      `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'fitgear_db' AND TABLE_NAME = 'REVIEWS' AND COLUMN_NAME = 'order_id' AND REFERENCED_TABLE_NAME = 'ORDERS'`
    );
    if (fks.length > 0) {
      await pool.query(`ALTER TABLE REVIEWS DROP FOREIGN KEY ${fks[0].CONSTRAINT_NAME}`);
      console.log('Dropped foreign key:', fks[0].CONSTRAINT_NAME);
    }
    await pool.query('ALTER TABLE REVIEWS MODIFY order_id INT NULL');
    console.log('Made order_id nullable');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
fix();
