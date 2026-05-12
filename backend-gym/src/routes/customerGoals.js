// Table 13: CUSTOMER_GOALS
const router = require('express').Router();
const pool = require('../config/db');

// GET /api/customer-goals?customer_id=
router.get('/', async (req, res) => {
  try {
    const { customer_id } = req.query;
    let sql = `SELECT cg.*, fg.name AS goal_name, fg.description AS goal_description 
               FROM CUSTOMER_GOALS cg 
               JOIN FITNESS_GOALS fg ON cg.goal_id = fg.goal_id`;
    const params = [];

    if (customer_id) {
      sql += ' WHERE cg.customer_id = ?';
      params.push(customer_id);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customer-goals
router.post('/', async (req, res) => {
  try {
    const { customer_id, goal_id, start_date } = req.body;
    if (!customer_id || !goal_id) {
      return res.status(400).json({ error: 'customer_id và goal_id là bắt buộc' });
    }

    const [result] = await pool.query(
      'INSERT INTO CUSTOMER_GOALS (customer_id, goal_id, start_date) VALUES (?, ?, ?)',
      [customer_id, goal_id, start_date || new Date()]
    );
    res.status(201).json({ message: 'Gán mục tiêu cho khách hàng thành công', cg_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customer-goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM CUSTOMER_GOALS WHERE cg_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ message: 'Xóa mục tiêu khách hàng thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
