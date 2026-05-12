// Table 10: PRODUCT_SKUS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/product-skus - Lấy tất cả SKUs
router.get('/', async (req, res) => {
  try {
    const { product_id } = req.query;
    let sql = `SELECT ps.*, s.name AS size_name, cl.name AS color_name, cl.hex_code, p.name AS product_name
               FROM PRODUCT_SKUS ps 
               LEFT JOIN SIZES s ON ps.size_id = s.size_id 
               LEFT JOIN COLORS cl ON ps.color_id = cl.color_id
               LEFT JOIN PRODUCTS p ON ps.product_id = p.product_id
               WHERE ps.is_deleted = FALSE`;
    const params = [];

    if (product_id) {
      sql += ' AND ps.product_id = ?';
      params.push(product_id);
    }
    sql += ' ORDER BY ps.sku_id';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/product-skus/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ps.*, s.name AS size_name, cl.name AS color_name, cl.hex_code
       FROM PRODUCT_SKUS ps 
       LEFT JOIN SIZES s ON ps.size_id = s.size_id 
       LEFT JOIN COLORS cl ON ps.color_id = cl.color_id 
       WHERE ps.sku_id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy SKU' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/product-skus
router.post('/', async (req, res) => {
  try {
    const { product_id, size_id, color_id, sku_code, stock, price } = req.body;
    if (!product_id || !price) {
      return res.status(400).json({ error: 'product_id và price là bắt buộc' });
    }

    const [result] = await pool.query(
      'INSERT INTO PRODUCT_SKUS (product_id, size_id, color_id, sku_code, stock, price) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, size_id || null, color_id || null, sku_code || null, stock || 0, price]
    );
    res.status(201).json({ message: 'Tạo SKU thành công', sku_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'SKU code đã tồn tại' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/product-skus/:id
router.put('/:id', async (req, res) => {
  try {
    const { size_id, color_id, sku_code, stock, price, is_deleted } = req.body;
    const [result] = await pool.query(
      `UPDATE PRODUCT_SKUS SET 
        size_id = COALESCE(?, size_id), color_id = COALESCE(?, color_id),
        sku_code = COALESCE(?, sku_code), stock = COALESCE(?, stock),
        price = COALESCE(?, price), is_deleted = COALESCE(?, is_deleted)
      WHERE sku_id = ?`,
      [size_id, color_id, sku_code, stock, price, is_deleted, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy SKU' });
    res.json({ message: 'Cập nhật SKU thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/product-skus/:id - Xóa mềm
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE PRODUCT_SKUS SET is_deleted = TRUE WHERE sku_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy SKU' });
    res.json({ message: 'Ẩn SKU thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
