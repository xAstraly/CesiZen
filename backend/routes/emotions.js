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

// GET /emotions/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT el.*, e.label as emotion_label, ec.label as category_label
       FROM emotion_logs el
       LEFT JOIN emotions e ON el.emotion_id = e.id
       LEFT JOIN emotion_categories ec ON e.category_id = ec.id
       WHERE el.user_id = $1
       ORDER BY el.logged_at DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur history emotions:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
