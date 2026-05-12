const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// POST /api/auth/login/customer - Đăng nhập khách hàng
router.post('/login/customer', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }

    const [rows] = await pool.query('SELECT * FROM CUSTOMERS WHERE email = ? AND status = "Active"', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const customer = rows[0];
    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    // Không trả về password_hash
    const { password_hash, ...customerData } = customer;
    res.json({ message: 'Đăng nhập thành công', user: customerData, role: 'customer' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login/staff - Đăng nhập nhân viên/admin
router.post('/login/staff', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username và mật khẩu là bắt buộc' });
    }

    const [rows] = await pool.query('SELECT * FROM STAFF WHERE username = ? AND status = TRUE', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username hoặc mật khẩu không chính xác' });
    }

    const staff = rows[0];
    const isMatch = await bcrypt.compare(password, staff.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Username hoặc mật khẩu không chính xác' });
    }

    const { password_hash, ...staffData } = staff;
    res.json({ message: 'Đăng nhập thành công', user: staffData, role: staff.role || 'staff' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register - Đăng ký khách hàng
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, birth_date, gender } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tên, email và mật khẩu là bắt buộc' });
    }

    // Kiểm tra email đã tồn tại
    const [existing] = await pool.query('SELECT customer_id FROM CUSTOMERS WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO CUSTOMERS (name, email, password_hash, phone, address, birth_date, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, address || null, birth_date || null, gender || null]
    );

    res.status(201).json({ message: 'Đăng ký thành công', customer_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
