// Table 1: STAFF
const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/staff - Lấy tất cả nhân viên
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT staff_id, username, full_name, role, status, created_at, updated_at FROM STAFF');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/staff/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT staff_id, username, full_name, role, status, created_at, updated_at FROM STAFF WHERE staff_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/staff - Tạo nhân viên mới
router.post('/', async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ error: 'Username, mật khẩu và họ tên là bắt buộc' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO STAFF (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, role || 'staff']
    );
    res.status(201).json({ message: 'Tạo nhân viên thành công', staff_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username đã tồn tại' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/staff/:id - Cập nhật nhân viên
router.put('/:id', async (req, res) => {
  try {
    const { full_name, role, status } = req.body;
    const [result] = await pool.query(
      'UPDATE STAFF SET full_name = COALESCE(?, full_name), role = COALESCE(?, role), status = COALESCE(?, status) WHERE staff_id = ?',
      [full_name, role, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/staff/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE STAFF SET status = FALSE WHERE staff_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    res.json({ message: 'Vô hiệu hóa nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
