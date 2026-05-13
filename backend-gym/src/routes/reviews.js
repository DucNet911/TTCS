// Table 22: REVIEWS
const router = require('express').Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { product_id, customer_id } = req.query;
    let sql = `SELECT r.*, c.name AS customer_name, p.name AS product_name 
               FROM REVIEWS r 
               JOIN CUSTOMERS c ON r.customer_id = c.customer_id
               JOIN PRODUCTS p ON r.product_id = p.product_id`;
    const conditions = [];
    const params = [];
    if (product_id) { conditions.push('r.product_id = ?'); params.push(product_id); }
    if (customer_id) { conditions.push('r.customer_id = ?'); params.push(customer_id); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY r.review_date DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { product_id, customer_id, rating, comment } = req.body;
    if (!product_id || !customer_id || !rating) {
      return res.status(400).json({ error: 'product_id, customer_id, rating required' });
    }
    const [result] = await pool.query(
      'INSERT INTO REVIEWS (product_id, customer_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [product_id, customer_id, null, rating, comment || null]
    );

    // Fetch the newly created review with customer_name
    const [newReview] = await pool.query(
      `SELECT r.*, c.name AS customer_name 
       FROM REVIEWS r 
       JOIN CUSTOMERS c ON r.customer_id = c.customer_id 
       WHERE r.review_id = ?`,
      [result.insertId]
    );

    res.status(201).json(newReview[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const [result] = await pool.query(
      'UPDATE REVIEWS SET rating = COALESCE(?, rating), comment = COALESCE(?, comment) WHERE review_id = ?',
      [rating, comment, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM REVIEWS WHERE review_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
