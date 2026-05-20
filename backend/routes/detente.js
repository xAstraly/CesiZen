const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// POST /detente/log
router.post('/log', authMiddleware, async (req, res) => {
  const { activity_name, duration_seconds } = req.body;
  if (!activity_name) return res.status(400).json({ message: 'Activité requise' });
  try {
    await pool.query(
      'INSERT INTO relaxation_logs (user_id, activity_name, duration_seconds, completed_at) VALUES ($1, $2, $3, NOW())',
      [req.user.id, activity_name, duration_seconds || null]
    );
    res.status(201).json({ message: 'Activité enregistrée' });
  } catch (err) {
    console.error('Erreur log detente:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /detente/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM relaxation_logs WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur history detente:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
