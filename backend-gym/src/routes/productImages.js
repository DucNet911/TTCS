// Table 11: PRODUCT_IMAGES
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/product-images?product_id=
router.get('/', async (req, res) => {
  try {
    const { product_id } = req.query;
    let sql = 'SELECT * FROM PRODUCT_IMAGES';
    const params = [];

    if (product_id) {
      sql += ' WHERE product_id = ?';
      params.push(product_id);
    }
    sql += ' ORDER BY is_primary DESC, image_id';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/product-images
router.post('/', async (req, res) => {
  try {
    const { product_id, image_url, is_primary } = req.body;
    if (!product_id || !image_url) {
      return res.status(400).json({ error: 'product_id và image_url là bắt buộc' });
    }

    // Nếu đặt làm ảnh chính, bỏ flag ảnh chính cũ
    if (is_primary) {
      await pool.query('UPDATE PRODUCT_IMAGES SET is_primary = FALSE WHERE product_id = ?', [product_id]);
    }

    const [result] = await pool.query(
      'INSERT INTO PRODUCT_IMAGES (product_id, image_url, is_primary) VALUES (?, ?, ?)',
      [product_id, image_url, is_primary || false]
    );
    res.status(201).json({ message: 'Thêm ảnh thành công', image_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/product-images/:id
router.put('/:id', async (req, res) => {
  try {
    const { image_url, is_primary } = req.body;

    // Nếu đặt làm ảnh chính, bỏ flag ảnh chính cũ của sản phẩm đó
    if (is_primary) {
      const [img] = await pool.query('SELECT product_id FROM PRODUCT_IMAGES WHERE image_id = ?', [req.params.id]);
      if (img.length > 0) {
        await pool.query('UPDATE PRODUCT_IMAGES SET is_primary = FALSE WHERE product_id = ?', [img[0].product_id]);
      }
    }

    const [result] = await pool.query(
      'UPDATE PRODUCT_IMAGES SET image_url = COALESCE(?, image_url), is_primary = COALESCE(?, is_primary) WHERE image_id = ?',
      [image_url, is_primary, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy ảnh' });
    res.json({ message: 'Cập nhật ảnh thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/product-images/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM PRODUCT_IMAGES WHERE image_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy ảnh' });
    res.json({ message: 'Xóa ảnh thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
