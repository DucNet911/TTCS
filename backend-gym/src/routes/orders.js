// Tables 18 + 19: ORDERS + ORDER_ITEMS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/orders - Lấy tất cả đơn hàng (Admin)
router.get('/', async (req, res) => {
  try {
    const { customer_id, status } = req.query;
    let sql = `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
                      v.code AS voucher_code,
                      p.status AS payment_status, p.payment_id
               FROM ORDERS o
               JOIN CUSTOMERS c ON o.customer_id = c.customer_id
               LEFT JOIN VOUCHERS v ON o.voucher_id = v.voucher_id
               LEFT JOIN PAYMENTS p ON o.order_id = p.order_id`;
    const conditions = [];
    const params = [];

    if (customer_id) {
      conditions.push('o.customer_id = ?');
      params.push(customer_id);
    }
    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY o.order_date DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/stats/top-products - Top sản phẩm bán chạy
router.get('/stats/top-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await pool.query(`
      SELECT 
        p.product_id,
        p.name AS product_name,
        p.base_price,
        SUM(oi.quantity) AS total_sold,
        SUM(oi.quantity * oi.price_at_order) AS total_revenue,
        COUNT(DISTINCT o.order_id) AS order_count,
        (SELECT pi.image_url FROM PRODUCT_IMAGES pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS image_url,
        cat.name AS category_name
      FROM ORDER_ITEMS oi
      JOIN PRODUCT_SKUS ps ON oi.sku_id = ps.sku_id
      JOIN PRODUCTS p ON ps.product_id = p.product_id
      JOIN ORDERS o ON oi.order_id = o.order_id
      LEFT JOIN CATEGORIES cat ON p.category_id = cat.category_id
      WHERE o.status = 'Completed'
      GROUP BY p.product_id
      ORDER BY total_sold DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id - Chi tiết đơn hàng kèm items
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone, c.address AS customer_address,
              v.code AS voucher_code, v.discount_type, v.discount_value
       FROM ORDERS o
       JOIN CUSTOMERS c ON o.customer_id = c.customer_id
       LEFT JOIN VOUCHERS v ON o.voucher_id = v.voucher_id
       WHERE o.order_id = ?`, [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    const [items] = await pool.query(
      `SELECT oi.*, ps.sku_code, ps.product_id, p.name AS product_name,
              s.name AS size_name, cl.name AS color_name, cl.hex_code,
              (SELECT pi.image_url FROM PRODUCT_IMAGES pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS image_url
       FROM ORDER_ITEMS oi
       JOIN PRODUCT_SKUS ps ON oi.sku_id = ps.sku_id
       JOIN PRODUCTS p ON ps.product_id = p.product_id
       LEFT JOIN SIZES s ON ps.size_id = s.size_id
       LEFT JOIN COLORS cl ON ps.color_id = cl.color_id
       WHERE oi.order_id = ?`, [req.params.id]
    );

    // Lấy thông tin thanh toán và vận chuyển
    const [payments] = await pool.query('SELECT * FROM PAYMENTS WHERE order_id = ?', [req.params.id]);
    const [shipping] = await pool.query('SELECT * FROM SHIPPING WHERE order_id = ?', [req.params.id]);

    res.json({
      ...orders[0],
      items,
      payment: payments[0] || null,
      shipping: shipping[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders - Tạo đơn hàng mới
// Sử dụng Pessimistic Locking (SELECT ... FOR UPDATE) để ngăn race condition
// khi nhiều người đặt hàng cùng lúc trên sản phẩm có tồn kho thấp
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { customer_id, staff_id, voucher_id, items, shipping_address, payment_method, discount_amount } = req.body;
    
    if (!customer_id || !items || items.length === 0 || !shipping_address || !payment_method) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // ===== BƯỚC 1: KHÓA + KIỂM TRA TỒN KHO (Pessimistic Locking) =====
    // SELECT ... FOR UPDATE sẽ khóa các dòng SKU ở mức row-level.
    // Nếu transaction khác cũng SELECT FOR UPDATE trên cùng dòng → phải CHỜ
    // cho đến khi transaction này COMMIT hoặc ROLLBACK.
    for (const item of items) {
      const [skuRows] = await conn.query(
        'SELECT sku_id, stock FROM PRODUCT_SKUS WHERE sku_id = ? AND is_deleted = FALSE FOR UPDATE',
        [item.sku_id]
      );

      if (skuRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({
          error: `SKU ${item.sku_id} không tồn tại hoặc đã bị xóa`
        });
      }

      if (skuRows[0].stock < item.quantity) {
        await conn.rollback();
        return res.status(409).json({
          error: `Sản phẩm (SKU: ${item.sku_id}) chỉ còn ${skuRows[0].stock} sản phẩm, không đủ ${item.quantity} sản phẩm yêu cầu`,
          available_stock: skuRows[0].stock,
          requested_quantity: item.quantity,
          sku_id: item.sku_id
        });
      }
    }

    // ===== BƯỚC 2: TÍNH TỔNG TIỀN =====
    let total_amount = 0;
    for (const item of items) {
      total_amount += item.price_at_order * item.quantity;
    }

    // ===== BƯỚC 3: TẠO ĐƠN HÀNG =====
    const [orderResult] = await conn.query(
      `INSERT INTO ORDERS (customer_id, staff_id, voucher_id, total_amount, discount_amount, shipping_address, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, staff_id || null, voucher_id || null, total_amount, discount_amount || 0, shipping_address, payment_method]
    );
    const orderId = orderResult.insertId;

    // ===== BƯỚC 4: THÊM SẢN PHẨM + GIẢM TỒN KHO =====
    for (const item of items) {
      await conn.query(
        'INSERT INTO ORDER_ITEMS (order_id, sku_id, quantity, price_at_order) VALUES (?, ?, ?, ?)',
        [orderId, item.sku_id, item.quantity, item.price_at_order]
      );

      // Giảm tồn kho + kiểm tra kết quả (lớp bảo vệ thứ 2)
      const [updateResult] = await conn.query(
        'UPDATE PRODUCT_SKUS SET stock = stock - ? WHERE sku_id = ? AND stock >= ?', 
        [item.quantity, item.sku_id, item.quantity]
      );

      // Double-check: nếu affectedRows = 0 thì có race condition xảy ra
      if (updateResult.affectedRows === 0) {
        await conn.rollback();
        return res.status(409).json({
          error: `Sản phẩm (SKU: ${item.sku_id}) vừa hết hàng, vui lòng thử lại`,
          sku_id: item.sku_id
        });
      }
    }

    // ===== BƯỚC 5: XỬ LÝ VOUCHER =====
    if (voucher_id) {
      await conn.query('UPDATE VOUCHERS SET used_count = used_count + 1 WHERE voucher_id = ?', [voucher_id]);
    }

    // Tự động tạo payment record
    await conn.query(
      'INSERT INTO PAYMENTS (order_id, amount, status) VALUES (?, ?, ?)',
      [orderId, total_amount - (discount_amount || 0), payment_method === 'COD' ? 'Pending' : 'Pending']
    );

    // Tự động tạo shipping record
    await conn.query(
      'INSERT INTO SHIPPING (order_id, shipping_method, shipping_fee) VALUES (?, ?, ?)',
      [orderId, 'Standard', total_amount >= 2000000 ? 0 : 30000]
    );

    // Xóa giỏ hàng sau khi đặt hàng
    const [carts] = await conn.query('SELECT cart_id FROM CARTS WHERE customer_id = ?', [customer_id]);
    if (carts.length > 0) {
      await conn.query('DELETE FROM CART_ITEMS WHERE cart_id = ?', [carts[0].cart_id]);
    }

    await conn.commit();
    res.status(201).json({ message: 'Đặt hàng thành công', order_id: orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (tuần tự)
router.put('/:id/status', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { status } = req.body;

    // Lấy đơn hàng hiện tại
    const [orders] = await conn.query('SELECT * FROM ORDERS WHERE order_id = ?', [req.params.id]);
    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    const currentStatus = orders[0].status;
    const paymentMethod = orders[0].payment_method;

    // Kiểm tra chuyển trạng thái tuần tự
    const validTransitions = {
      'Pending': ['Confirmed', 'Canceled'],
      'Confirmed': ['Shipping', 'Canceled'],
      'Shipping': ['Completed', 'Canceled'],
      'Completed': [],
      'Canceled': [],
    };

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
      await conn.rollback();
      return res.status(400).json({ error: `Không thể chuyển từ "${currentStatus}" sang "${status}"` });
    }

    // Cập nhật trạng thái đơn hàng
    await conn.query('UPDATE ORDERS SET status = ? WHERE order_id = ?', [status, req.params.id]);

    // Đồng bộ trạng thái SHIPPING
    const shippingMap = {
      'Confirmed': 'Preparing',
      'Shipping': 'In Transit',
      'Completed': 'Delivered',
      'Canceled': 'Returned',
    };
    if (shippingMap[status]) {
      const updates = ['status = ?'];
      const params = [shippingMap[status]];
      if (status === 'Shipping') {
        updates.push('ship_date = NOW()');
      }
      if (status === 'Completed') {
        updates.push('delivery_date = NOW()');
      }
      params.push(req.params.id);
      await conn.query(`UPDATE SHIPPING SET ${updates.join(', ')} WHERE order_id = ?`, params);
    }

    // Đồng bộ trạng thái PAYMENTS
    if (status === 'Completed') {
      // COD: tự động xác nhận thanh toán khi giao thành công
      if (paymentMethod === 'COD') {
        await conn.query('UPDATE PAYMENTS SET status = "Success" WHERE order_id = ?', [req.params.id]);
      }
      // Bank Transfer: cũng auto-confirm khi hoàn thành (admin đã xác nhận trước đó)
      if (paymentMethod === 'Bank Transfer') {
        await conn.query('UPDATE PAYMENTS SET status = "Success" WHERE order_id = ?', [req.params.id]);
      }
    }
    if (status === 'Canceled') {
      await conn.query('UPDATE PAYMENTS SET status = "Failed" WHERE order_id = ?', [req.params.id]);
      // Hoàn lại tồn kho
      const [items] = await conn.query('SELECT sku_id, quantity FROM ORDER_ITEMS WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        await conn.query('UPDATE PRODUCT_SKUS SET stock = stock + ? WHERE sku_id = ?', [item.quantity, item.sku_id]);
      }
    }

    await conn.commit();
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Kiểm tra đơn hàng tồn tại
    const [orders] = await conn.query('SELECT * FROM ORDERS WHERE order_id = ?', [req.params.id]);
    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    const order = orders[0];

    // Hoàn lại tồn kho nếu đơn hàng CHƯA bị hủy (Canceled đã hoàn kho rồi)
    if (order.status !== 'Canceled') {
      const [items] = await conn.query('SELECT sku_id, quantity FROM ORDER_ITEMS WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        await conn.query('UPDATE PRODUCT_SKUS SET stock = stock + ? WHERE sku_id = ?', [item.quantity, item.sku_id]);
      }
    }

    // Hoàn lại lượt sử dụng voucher (nếu có)
    if (order.voucher_id) {
      await conn.query('UPDATE VOUCHERS SET used_count = GREATEST(used_count - 1, 0) WHERE voucher_id = ?', [order.voucher_id]);
    }

    // Xóa các bản ghi liên quan (ORDER_ITEMS sẽ tự cascade nếu có FK, nếu không thì xóa thủ công)
    await conn.query('DELETE FROM PAYMENTS WHERE order_id = ?', [req.params.id]);
    await conn.query('DELETE FROM SHIPPING WHERE order_id = ?', [req.params.id]);
    await conn.query('DELETE FROM ORDER_ITEMS WHERE order_id = ?', [req.params.id]);
    await conn.query('DELETE FROM ORDERS WHERE order_id = ?', [req.params.id]);

    await conn.commit();
    res.json({ message: 'Xóa đơn hàng thành công, đã hoàn lại tồn kho' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
