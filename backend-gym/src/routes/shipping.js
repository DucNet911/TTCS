// Table 21: SHIPPING
const router = require('express').Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { order_id } = req.query;
    let sql = 'SELECT * FROM SHIPPING';
    const params = [];
    if (order_id) { sql += ' WHERE order_id = ?'; params.push(order_id); }
    sql += ' ORDER BY shipping_id DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM SHIPPING WHERE shipping_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { shipping_method, shipping_fee, ship_date, delivery_date, tracking_number, status } = req.body;
    const [result] = await pool.query(
      `UPDATE SHIPPING SET shipping_method = COALESCE(?, shipping_method), shipping_fee = COALESCE(?, shipping_fee),
        ship_date = COALESCE(?, ship_date), delivery_date = COALESCE(?, delivery_date),
        tracking_number = COALESCE(?, tracking_number), status = COALESCE(?, status) WHERE shipping_id = ?`,
      [shipping_method, shipping_fee, ship_date, delivery_date, tracking_number, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
