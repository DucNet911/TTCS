// Tables 14 + 15: CARTS + CART_ITEMS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/carts/:customerId - Lấy giỏ hàng của khách hàng
router.get('/:customerId', async (req, res) => {
  try {
    // Tìm hoặc tạo giỏ hàng
    let [carts] = await pool.query('SELECT * FROM CARTS WHERE customer_id = ?', [req.params.customerId]);
    
    if (carts.length === 0) {
      const [result] = await pool.query('INSERT INTO CARTS (customer_id) VALUES (?)', [req.params.customerId]);
      carts = [{ cart_id: result.insertId, customer_id: parseInt(req.params.customerId) }];
    }

    const cart = carts[0];

    // Lấy các items trong giỏ kèm thông tin sản phẩm
    const [items] = await pool.query(
      `SELECT ci.*, ps.sku_code, ps.price, ps.stock, ps.product_id,
              p.name AS product_name, p.base_price, p.gender, p.category_id,
              s.name AS size_name, cl.name AS color_name, cl.hex_code,
              (SELECT pi.image_url FROM PRODUCT_IMAGES pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS image_url
       FROM CART_ITEMS ci
       JOIN PRODUCT_SKUS ps ON ci.sku_id = ps.sku_id
       JOIN PRODUCTS p ON ps.product_id = p.product_id
       LEFT JOIN SIZES s ON ps.size_id = s.size_id
       LEFT JOIN COLORS cl ON ps.color_id = cl.color_id
       WHERE ci.cart_id = ?`,
      [cart.cart_id]
    );

    res.json({ ...cart, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/carts/:customerId/items - Thêm sản phẩm vào giỏ hàng
router.post('/:customerId/items', async (req, res) => {
  try {
    const { sku_id, quantity } = req.body;
    if (!sku_id) return res.status(400).json({ error: 'sku_id là bắt buộc' });
    const addQty = quantity || 1;

    // Kiểm tra tồn kho
    const [skuRows] = await pool.query('SELECT stock FROM PRODUCT_SKUS WHERE sku_id = ?', [sku_id]);
    if (skuRows.length === 0) return res.status(404).json({ error: 'Không tìm thấy SKU' });
    const stock = skuRows[0].stock;

    // Tìm hoặc tạo giỏ hàng
    let [carts] = await pool.query('SELECT cart_id FROM CARTS WHERE customer_id = ?', [req.params.customerId]);
    if (carts.length === 0) {
      const [result] = await pool.query('INSERT INTO CARTS (customer_id) VALUES (?)', [req.params.customerId]);
      carts = [{ cart_id: result.insertId }];
    }
    const cartId = carts[0].cart_id;

    // Kiểm tra item đã tồn tại trong giỏ chưa
    const [existing] = await pool.query('SELECT * FROM CART_ITEMS WHERE cart_id = ? AND sku_id = ?', [cartId, sku_id]);
    
    if (existing.length > 0) {
      const newQty = existing[0].quantity + addQty;
      if (newQty > stock) {
        return res.status(400).json({ error: `Không thể thêm. Trong giỏ đã có ${existing[0].quantity}, kho chỉ còn ${stock} sản phẩm.` });
      }
      // Tăng số lượng
      await pool.query('UPDATE CART_ITEMS SET quantity = ? WHERE cart_item_id = ?', 
        [newQty, existing[0].cart_item_id]);
      res.json({ message: 'Cập nhật số lượng trong giỏ hàng' });
    } else {
      if (addQty > stock) {
        return res.status(400).json({ error: `Số lượng vượt quá tồn kho. Kho chỉ còn ${stock} sản phẩm.` });
      }
      // Thêm mới
      const [result] = await pool.query(
        'INSERT INTO CART_ITEMS (cart_id, sku_id, quantity) VALUES (?, ?, ?)',
        [cartId, sku_id, addQty]
      );
      res.status(201).json({ message: 'Thêm vào giỏ hàng thành công', cart_item_id: result.insertId });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/carts/items/:itemId - Cập nhật số lượng
router.put('/items/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Số lượng phải >= 1' });

    // Kiểm tra tồn kho trước khi cập nhật
    const [itemRows] = await pool.query(
      `SELECT ci.sku_id, ps.stock FROM CART_ITEMS ci
       JOIN PRODUCT_SKUS ps ON ci.sku_id = ps.sku_id
       WHERE ci.cart_item_id = ?`, [req.params.itemId]
    );
    if (itemRows.length === 0) return res.status(404).json({ error: 'Không tìm thấy item' });
    if (quantity > itemRows[0].stock) {
      return res.status(400).json({ error: `Số lượng vượt quá tồn kho. Kho chỉ còn ${itemRows[0].stock} sản phẩm.` });
    }

    const [result] = await pool.query('UPDATE CART_ITEMS SET quantity = ? WHERE cart_item_id = ?', [quantity, req.params.itemId]);
    res.json({ message: 'Cập nhật số lượng thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/carts/items/:itemId - Xóa item khỏi giỏ
router.delete('/items/:itemId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM CART_ITEMS WHERE cart_item_id = ?', [req.params.itemId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy item' });
    res.json({ message: 'Xóa khỏi giỏ hàng thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/carts/:customerId - Xóa toàn bộ giỏ hàng
router.delete('/:customerId', async (req, res) => {
  try {
    const [carts] = await pool.query('SELECT cart_id FROM CARTS WHERE customer_id = ?', [req.params.customerId]);
    if (carts.length === 0) return res.status(404).json({ error: 'Không tìm thấy giỏ hàng' });

    await pool.query('DELETE FROM CART_ITEMS WHERE cart_id = ?', [carts[0].cart_id]);
    res.json({ message: 'Xóa toàn bộ giỏ hàng thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
