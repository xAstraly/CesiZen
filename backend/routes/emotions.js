const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /emotions/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emotion_categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur categories:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /emotions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT e.*, ec.label as category_label FROM emotions e LEFT JOIN emotion_categories ec ON e.category_id = ec.id ORDER BY ec.id, e.id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur emotions:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /emotions/log
router.post('/log', authMiddleware, async (req, res) => {
  const { emotion_id, note, commentaire } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO emotion_logs (user_id, emotion_id, note, commentaire, logged_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [req.user.id, emotion_id, note, commentaire]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur log emotion:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /emotions/history?period=week|month|quarter|year
router.get('/history', authMiddleware, async (req, res) => {
  const { period } = req.query;
  const intervals = { week: '7 days', month: '1 month', quarter: '3 months', year: '1 year' };
  const interval = intervals[period];
  try {
    const query = `
      SELECT el.*, e.label as emotion_label, ec.label as category_label
      FROM emotion_logs el
      LEFT JOIN emotions e ON el.emotion_id = e.id
      LEFT JOIN emotion_categories ec ON e.category_id = ec.id
      WHERE el.user_id = $1
      ${interval ? `AND el.logged_at >= NOW() - INTERVAL '${interval}'` : ''}
      ORDER BY el.logged_at DESC
      LIMIT 100`;
    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur history emotions:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /emotions/stats?period=week|month|quarter|year
router.get('/stats', authMiddleware, async (req, res) => {
  const { period } = req.query;
  const intervals = { week: '7 days', month: '1 month', quarter: '3 months', year: '1 year' };
  const interval = intervals[period] || '1 month';
  try {
    const [countRes, topRes, avgRes, byDayRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as total FROM emotion_logs WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '${interval}'`,
        [req.user.id]
      ),
      pool.query(
        `SELECT e.label, ec.label as category_label, COUNT(*) as count
         FROM emotion_logs el
         LEFT JOIN emotions e ON el.emotion_id = e.id
         LEFT JOIN emotion_categories ec ON e.category_id = ec.id
         WHERE el.user_id = $1 AND el.logged_at >= NOW() - INTERVAL '${interval}'
         GROUP BY e.label, ec.label ORDER BY count DESC LIMIT 3`,
        [req.user.id]
      ),
      pool.query(
        `SELECT ROUND(AVG(note), 1) as avg_note FROM emotion_logs WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '${interval}'`,
        [req.user.id]
      ),
      pool.query(
        `SELECT ec.label as category_label, COUNT(*) as count
         FROM emotion_logs el
         LEFT JOIN emotions e ON el.emotion_id = e.id
         LEFT JOIN emotion_categories ec ON e.category_id = ec.id
         WHERE el.user_id = $1 AND el.logged_at >= NOW() - INTERVAL '${interval}'
         GROUP BY ec.label ORDER BY count DESC`,
        [req.user.id]
      ),
    ]);
    res.json({
      total: parseInt(countRes.rows[0].total),
      avg_note: parseFloat(avgRes.rows[0].avg_note) || 0,
      top_emotions: topRes.rows,
      by_category: byDayRes.rows,
    });
  } catch (err) {
    console.error('Erreur stats emotions:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
