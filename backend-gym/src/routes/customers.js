// Table 2: CUSTOMERS
const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/customers - Lấy tất cả khách hàng
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT customer_id, name, email, phone, address, birth_date, gender, status, register_date, updated_at FROM CUSTOMERS'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT customer_id, name, email, phone, address, birth_date, gender, status, register_date, updated_at FROM CUSTOMERS WHERE customer_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, address, birth_date, gender } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tên, email và mật khẩu là bắt buộc' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO CUSTOMERS (name, email, password_hash, phone, address, birth_date, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, address, birth_date, gender]
    );
    res.status(201).json({ message: 'Tạo khách hàng thành công', customer_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email đã tồn tại' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address, birth_date, gender, status } = req.body;
    const [result] = await pool.query(
      `UPDATE CUSTOMERS SET 
        name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address),
        birth_date = COALESCE(?, birth_date), gender = COALESCE(?, gender), status = COALESCE(?, status)
      WHERE customer_id = ?`,
      [name, phone, address, birth_date, gender, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customers/:id (Soft delete - đổi status)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE CUSTOMERS SET status = "Banned" WHERE customer_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    res.json({ message: 'Vô hiệu hóa khách hàng thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ CUSTOMER GOALS (Mục tiêu thể hình) ============

// GET /api/customers/:id/goals - Lấy danh sách mục tiêu của khách hàng
router.get('/:id/goals', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cg.cg_id, cg.goal_id, cg.start_date, fg.name, fg.description
       FROM CUSTOMER_GOALS cg
       JOIN FITNESS_GOALS fg ON cg.goal_id = fg.goal_id
       WHERE cg.customer_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id/goals - Cập nhật (ghi đè) danh sách mục tiêu
// Body: { goal_ids: [1, 2, 3] }
router.put('/:id/goals', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { goal_ids } = req.body;
    const customerId = req.params.id;

    // Xóa tất cả mục tiêu cũ
    await conn.query('DELETE FROM CUSTOMER_GOALS WHERE customer_id = ?', [customerId]);

    // Thêm mục tiêu mới
    if (goal_ids && goal_ids.length > 0) {
      const values = goal_ids.map((gid) => [customerId, gid, new Date()]);
      await conn.query(
        'INSERT INTO CUSTOMER_GOALS (customer_id, goal_id, start_date) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.json({ message: 'Cập nhật mục tiêu thành công' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/customers/:id/recommendations - Gợi ý sản phẩm theo mục tiêu cá nhân
// Sử dụng JOIN 4 bảng: CUSTOMER_GOALS → FITNESS_GOALS ← PRODUCT_GOALS → PRODUCTS
router.get('/:id/recommendations', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT p.*, b.name AS brand_name, c.name AS category_name,
              (SELECT pi.image_url FROM PRODUCT_IMAGES pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS primary_image,
              (SELECT AVG(rating) FROM REVIEWS WHERE product_id = p.product_id) AS average_rating,
              GROUP_CONCAT(DISTINCT fg.name SEPARATOR ', ') AS matched_goals
       FROM PRODUCTS p
       JOIN PRODUCT_GOALS pg ON p.product_id = pg.product_id
       JOIN CUSTOMER_GOALS cg ON pg.goal_id = cg.goal_id
       JOIN FITNESS_GOALS fg ON cg.goal_id = fg.goal_id
       LEFT JOIN BRANDS b ON p.brand_id = b.brand_id
       LEFT JOIN CATEGORIES c ON p.category_id = c.category_id
       WHERE cg.customer_id = ? AND p.is_deleted = FALSE
       GROUP BY p.product_id
       ORDER BY COUNT(DISTINCT fg.goal_id) DESC, p.created_at DESC
       LIMIT 10`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
