// Table 20: PAYMENTS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const { order_id } = req.query;
    let sql = 'SELECT * FROM PAYMENTS';
    const params = [];

    if (order_id) {
      sql += ' WHERE order_id = ?';
      params.push(order_id);
    }
    sql += ' ORDER BY payment_date DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM PAYMENTS WHERE payment_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy thanh toán' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/payments/:id - Cập nhật trạng thái thanh toán
router.put('/:id', async (req, res) => {
  try {
    const { status, transaction_id } = req.body;
    const [result] = await pool.query(
      'UPDATE PAYMENTS SET status = COALESCE(?, status), transaction_id = COALESCE(?, transaction_id) WHERE payment_id = ?',
      [status, transaction_id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy thanh toán' });
    res.json({ message: 'Cập nhật thanh toán thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
