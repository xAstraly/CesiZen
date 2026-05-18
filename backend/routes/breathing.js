const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /breathing/exercises
router.get('/exercises', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM breathing_exercises WHERE is_active = true ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur exercises:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /breathing/log
router.post('/log', authMiddleware, async (req, res) => {
  const { exercise_name } = req.body;
  try {
    await pool.query(
      'INSERT INTO breathing_logs (user_id, exercise_name, completed_at) VALUES ($1, $2, NOW())',
      [req.user.id, exercise_name]
    );
    res.status(201).json({ message: 'Session enregistrée' });
  } catch (err) {
    console.error('Erreur log breathing:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /breathing/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM breathing_logs WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur history breathing:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
