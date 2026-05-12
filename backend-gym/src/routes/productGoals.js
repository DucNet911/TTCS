// Table 12: PRODUCT_GOALS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/product-goals?product_id=
router.get('/', async (req, res) => {
  try {
    const { product_id } = req.query;
    let sql = `SELECT pg.*, fg.name AS goal_name, fg.description AS goal_description 
               FROM PRODUCT_GOALS pg 
               JOIN FITNESS_GOALS fg ON pg.goal_id = fg.goal_id`;
    const params = [];

    if (product_id) {
      sql += ' WHERE pg.product_id = ?';
      params.push(product_id);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/product-goals
router.post('/', async (req, res) => {
  try {
    const { product_id, goal_id } = req.body;
    if (!product_id || !goal_id) {
      return res.status(400).json({ error: 'product_id và goal_id là bắt buộc' });
    }

    const [result] = await pool.query(
      'INSERT INTO PRODUCT_GOALS (product_id, goal_id) VALUES (?, ?)',
      [product_id, goal_id]
    );
    res.status(201).json({ message: 'Gán mục tiêu cho sản phẩm thành công', pg_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/product-goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM PRODUCT_GOALS WHERE pg_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ message: 'Xóa mục tiêu sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/product-goals/:productId - Cập nhật (ghi đè) toàn bộ mục tiêu cho sản phẩm
router.put('/:productId', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { goal_ids } = req.body;
    const productId = req.params.productId;

    // Xóa tất cả mục tiêu cũ
    await conn.query('DELETE FROM PRODUCT_GOALS WHERE product_id = ?', [productId]);

    // Thêm mục tiêu mới
    if (goal_ids && goal_ids.length > 0) {
      const values = goal_ids.map((gid) => [productId, gid]);
      await conn.query('INSERT INTO PRODUCT_GOALS (product_id, goal_id) VALUES ?', [values]);
    }

    await conn.commit();
    res.json({ message: 'Cập nhật mục tiêu sản phẩm thành công' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
