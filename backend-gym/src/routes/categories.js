// Table 3: CATEGORIES
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM CATEGORIES ORDER BY category_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM CATEGORIES WHERE category_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, description, parent_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });

    const [result] = await pool.query(
      'INSERT INTO CATEGORIES (name, description, parent_id) VALUES (?, ?, ?)',
      [name, description || null, parent_id || null]
    );
    res.status(201).json({ message: 'Tạo danh mục thành công', category_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, parent_id } = req.body;
    const [result] = await pool.query(
      'UPDATE CATEGORIES SET name = COALESCE(?, name), description = COALESCE(?, description), parent_id = ? WHERE category_id = ?',
      [name, description, parent_id !== undefined ? parent_id : null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM CATEGORIES WHERE category_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
