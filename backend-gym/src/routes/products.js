// Table 9: PRODUCTS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/products - Lấy tất cả sản phẩm (không bao gồm đã xóa mềm)
router.get('/', async (req, res) => {
  try {
    const { gender, category_id, brand_id, include_deleted } = req.query;
    
    let sql = `SELECT p.*, b.name AS brand_name, c.name AS category_name,
               (SELECT pi.image_url FROM PRODUCT_IMAGES pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS primary_image,
               (SELECT AVG(rating) FROM REVIEWS WHERE product_id = p.product_id) AS average_rating
               FROM PRODUCTS p 
               LEFT JOIN BRANDS b ON p.brand_id = b.brand_id 
               LEFT JOIN CATEGORIES c ON p.category_id = c.category_id`;
    const conditions = [];
    const params = [];

    if (!include_deleted) {
      conditions.push('p.is_deleted = FALSE');
    }
    if (gender) {
      conditions.push('p.gender = ?');
      params.push(gender);
    }
    if (category_id) {
      conditions.push('p.category_id = ?');
      params.push(category_id);
    }
    if (brand_id) {
      conditions.push('p.brand_id = ?');
      params.push(brand_id);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY p.product_id DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id - Chi tiết sản phẩm kèm SKUs, Images, Goals
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [products] = await pool.query(
      `SELECT p.*, b.name AS brand_name, c.name AS category_name,
       (SELECT pi.image_url FROM PRODUCT_IMAGES pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS primary_image
       FROM PRODUCTS p 
       LEFT JOIN BRANDS b ON p.brand_id = b.brand_id 
       LEFT JOIN CATEGORIES c ON p.category_id = c.category_id 
       WHERE p.product_id = ?`, [id]
    );
    if (products.length === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    const [skus] = await pool.query(
      `SELECT ps.*, s.name AS size_name, cl.name AS color_name, cl.hex_code 
       FROM PRODUCT_SKUS ps 
       LEFT JOIN SIZES s ON ps.size_id = s.size_id 
       LEFT JOIN COLORS cl ON ps.color_id = cl.color_id 
       WHERE ps.product_id = ? AND ps.is_deleted = FALSE`, [id]
    );
    const [images] = await pool.query('SELECT * FROM PRODUCT_IMAGES WHERE product_id = ?', [id]);
    const [goals] = await pool.query(
      `SELECT pg.*, fg.name AS goal_name, fg.description AS goal_description 
       FROM PRODUCT_GOALS pg 
       JOIN FITNESS_GOALS fg ON pg.goal_id = fg.goal_id 
       WHERE pg.product_id = ?`, [id]
    );
    const [reviews] = await pool.query(
      `SELECT r.*, c.name AS customer_name 
       FROM REVIEWS r 
       JOIN CUSTOMERS c ON r.customer_id = c.customer_id 
       WHERE r.product_id = ? ORDER BY r.review_date DESC`, [id]
    );

    res.json({
      ...products[0],
      skus,
      images,
      goals,
      reviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, description, base_price, material, gender, brand_id, category_id, staff_id } = req.body;
    if (!name || !base_price || !gender) {
      return res.status(400).json({ error: 'Tên, giá và giới tính là bắt buộc' });
    }

    const [result] = await pool.query(
      'INSERT INTO PRODUCTS (name, description, base_price, material, gender, brand_id, category_id, staff_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, base_price, material, gender, brand_id || null, category_id || null, staff_id || null]
    );
    res.status(201).json({ message: 'Tạo sản phẩm thành công', product_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, base_price, material, gender, brand_id, category_id, is_deleted } = req.body;
    const [result] = await pool.query(
      `UPDATE PRODUCTS SET 
        name = COALESCE(?, name), description = COALESCE(?, description), 
        base_price = COALESCE(?, base_price), material = COALESCE(?, material),
        gender = COALESCE(?, gender), brand_id = COALESCE(?, brand_id), 
        category_id = COALESCE(?, category_id), is_deleted = COALESCE(?, is_deleted)
      WHERE product_id = ?`,
      [name, description, base_price, material, gender, brand_id, category_id, is_deleted, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Cập nhật sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id - Xóa mềm (Soft Delete)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE PRODUCTS SET is_deleted = TRUE WHERE product_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Ẩn sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/restore - Khôi phục sản phẩm
router.patch('/:id/restore', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE PRODUCTS SET is_deleted = FALSE WHERE product_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Khôi phục sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
