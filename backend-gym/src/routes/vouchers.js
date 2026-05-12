// Table 8: VOUCHERS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/vouchers
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM VOUCHERS ORDER BY voucher_id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vouchers/check/:code - Kiểm tra mã giảm giá
router.get('/check/:code', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM VOUCHERS WHERE code = ?', [req.params.code.toUpperCase()]);
    if (rows.length === 0) return res.status(404).json({ error: 'Mã giảm giá không tồn tại' });

    const voucher = rows[0];
    if (new Date(voucher.expiry_date) < new Date()) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết hạn' });
    }
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết lượt sử dụng' });
    }
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vouchers/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM VOUCHERS WHERE voucher_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy voucher' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vouchers
router.post('/', async (req, res) => {
  try {
    const { code, discount_type, discount_value, max_discount_amount, min_order_value, expiry_date, usage_limit } = req.body;
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ error: 'Mã, loại giảm giá và giá trị là bắt buộc' });
    }

    const [result] = await pool.query(
      'INSERT INTO VOUCHERS (code, discount_type, discount_value, max_discount_amount, min_order_value, expiry_date, usage_limit) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [code.toUpperCase(), discount_type, discount_value, max_discount_amount || null, min_order_value || 0, expiry_date || null, usage_limit || null]
    );
    res.status(201).json({ message: 'Tạo voucher thành công', voucher_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Mã voucher đã tồn tại' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vouchers/:id
router.put('/:id', async (req, res) => {
  try {
    const { code, discount_type, discount_value, max_discount_amount, min_order_value, expiry_date, usage_limit } = req.body;
    const [result] = await pool.query(
      `UPDATE VOUCHERS SET 
        code = COALESCE(?, code), discount_type = COALESCE(?, discount_type), 
        discount_value = COALESCE(?, discount_value), max_discount_amount = ?,
        min_order_value = COALESCE(?, min_order_value), expiry_date = ?, usage_limit = ?
      WHERE voucher_id = ?`,
      [code, discount_type, discount_value, max_discount_amount, min_order_value, expiry_date, usage_limit, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy voucher' });
    res.json({ message: 'Cập nhật voucher thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vouchers/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM VOUCHERS WHERE voucher_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy voucher' });
    res.json({ message: 'Xóa voucher thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
