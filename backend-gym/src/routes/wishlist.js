// Tables 16 + 17: WISHLIST + WISHLIST_ITEMS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/wishlist/:customerId - Lấy danh sách yêu thích
router.get('/:customerId', async (req, res) => {
  try {
    let [wishlists] = await pool.query('SELECT * FROM WISHLIST WHERE customer_id = ?', [req.params.customerId]);
    
    if (wishlists.length === 0) {
      const [result] = await pool.query('INSERT INTO WISHLIST (customer_id) VALUES (?)', [req.params.customerId]);
      wishlists = [{ wishlist_id: result.insertId, customer_id: parseInt(req.params.customerId) }];
    }

    const wishlist = wishlists[0];

    const [items] = await pool.query(
      `SELECT wi.*, p.name AS product_name, p.base_price, p.gender, p.material, p.category_id, p.brand_id,
              b.name AS brand_name,
              (SELECT pi.image_url FROM PRODUCT_IMAGES pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS image_url
       FROM WISHLIST_ITEMS wi
       JOIN PRODUCTS p ON wi.product_id = p.product_id AND p.is_deleted = FALSE
       LEFT JOIN BRANDS b ON p.brand_id = b.brand_id
       WHERE wi.wishlist_id = ?`,
      [wishlist.wishlist_id]
    );

    res.json({ ...wishlist, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wishlist/:customerId/items - Thêm sản phẩm vào wishlist
router.post('/:customerId/items', async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id là bắt buộc' });

    let [wishlists] = await pool.query('SELECT wishlist_id FROM WISHLIST WHERE customer_id = ?', [req.params.customerId]);
    if (wishlists.length === 0) {
      const [result] = await pool.query('INSERT INTO WISHLIST (customer_id) VALUES (?)', [req.params.customerId]);
      wishlists = [{ wishlist_id: result.insertId }];
    }
    const wishlistId = wishlists[0].wishlist_id;

    // Kiểm tra đã có trong wishlist chưa
    const [existing] = await pool.query('SELECT * FROM WISHLIST_ITEMS WHERE wishlist_id = ? AND product_id = ?', [wishlistId, product_id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Sản phẩm đã có trong danh sách yêu thích' });
    }

    const [result] = await pool.query(
      'INSERT INTO WISHLIST_ITEMS (wishlist_id, product_id) VALUES (?, ?)',
      [wishlistId, product_id]
    );
    res.status(201).json({ message: 'Thêm vào danh sách yêu thích thành công', wishlist_item_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/wishlist/items/:itemId
router.delete('/items/:itemId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM WISHLIST_ITEMS WHERE wishlist_item_id = ?', [req.params.itemId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy item' });
    res.json({ message: 'Xóa khỏi danh sách yêu thích thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
