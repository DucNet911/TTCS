// Table 4: BRANDS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/brands
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM BRANDS ORDER BY brand_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/brands/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM BRANDS WHERE brand_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy thương hiệu' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/brands
router.post('/', async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên thương hiệu là bắt buộc' });

    const [result] = await pool.query(
      'INSERT INTO BRANDS (name, description, logo) VALUES (?, ?, ?)',
      [name, description || null, logo || null]
    );
    res.status(201).json({ message: 'Tạo thương hiệu thành công', brand_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/brands/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    const [result] = await pool.query(
      'UPDATE BRANDS SET name = COALESCE(?, name), description = COALESCE(?, description), logo = COALESCE(?, logo) WHERE brand_id = ?',
      [name, description, logo, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy thương hiệu' });
    res.json({ message: 'Cập nhật thương hiệu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/brands/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM BRANDS WHERE brand_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy thương hiệu' });
    res.json({ message: 'Xóa thương hiệu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
