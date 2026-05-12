// Tables 5, 6, 7: SIZES, COLORS, FITNESS_GOALS
const router = require('express').Router();
const pool = require('../config/db');

// ========== SIZES (Table 5) ==========
// GET /api/catalog/sizes
router.get('/sizes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM SIZES ORDER BY size_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/catalog/sizes
router.post('/sizes', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên size là bắt buộc' });
    const [result] = await pool.query('INSERT INTO SIZES (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Tạo size thành công', size_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/catalog/sizes/:id
router.put('/sizes/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query('UPDATE SIZES SET name = ? WHERE size_id = ?', [name, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy size' });
    res.json({ message: 'Cập nhật size thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/catalog/sizes/:id
router.delete('/sizes/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM SIZES WHERE size_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy size' });
    res.json({ message: 'Xóa size thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== COLORS (Table 6) ==========
// GET /api/catalog/colors
router.get('/colors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM COLORS ORDER BY color_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/catalog/colors
router.post('/colors', async (req, res) => {
  try {
    const { name, hex_code } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên màu là bắt buộc' });
    const [result] = await pool.query('INSERT INTO COLORS (name, hex_code) VALUES (?, ?)', [name, hex_code || null]);
    res.status(201).json({ message: 'Tạo màu thành công', color_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/catalog/colors/:id
router.put('/colors/:id', async (req, res) => {
  try {
    const { name, hex_code } = req.body;
    const [result] = await pool.query(
      'UPDATE COLORS SET name = COALESCE(?, name), hex_code = COALESCE(?, hex_code) WHERE color_id = ?',
      [name, hex_code, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy màu' });
    res.json({ message: 'Cập nhật màu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/catalog/colors/:id
router.delete('/colors/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM COLORS WHERE color_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy màu' });
    res.json({ message: 'Xóa màu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== FITNESS_GOALS (Table 7) ==========
// GET /api/catalog/fitness-goals
router.get('/fitness-goals', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FITNESS_GOALS ORDER BY goal_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/catalog/fitness-goals
router.post('/fitness-goals', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên mục tiêu là bắt buộc' });
    const [result] = await pool.query('INSERT INTO FITNESS_GOALS (name, description) VALUES (?, ?)', [name, description || null]);
    res.status(201).json({ message: 'Tạo mục tiêu thành công', goal_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/catalog/fitness-goals/:id
router.put('/fitness-goals/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'UPDATE FITNESS_GOALS SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE goal_id = ?',
      [name, description, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
    res.json({ message: 'Cập nhật mục tiêu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/catalog/fitness-goals/:id
router.delete('/fitness-goals/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM FITNESS_GOALS WHERE goal_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
    res.json({ message: 'Xóa mục tiêu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
