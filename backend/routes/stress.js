const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /stress/events
router.get('/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stress_events ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur stress events:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /stress/diagnostics
router.post('/diagnostics', authMiddleware, async (req, res) => {
  const { event_ids, total_score, risk_level } = req.body;
  try {
    const diagResult = await pool.query(
      'INSERT INTO stress_diagnostics (user_id, total_score, risk_level, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [req.user.id, total_score, risk_level]
    );
    const diagnostic = diagResult.rows[0];

    for (const event_id of event_ids) {
      await pool.query(
        'INSERT INTO stress_diagnostic_events (diagnostic_id, event_id) VALUES ($1, $2)',
        [diagnostic.id, event_id]
      );
    }

    res.status(201).json(diagnostic);
  } catch (err) {
    console.error('Erreur diagnostic stress:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /stress/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM stress_diagnostics WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur history stress:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
