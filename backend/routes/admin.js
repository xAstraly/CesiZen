const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Accès refusé' });
  next();
};

// GET /admin/users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, prenom, nom, is_admin, is_writer, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur list users:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /admin/users/:id
router.put('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  const { is_admin, is_writer, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET is_admin = $1, is_writer = $2, is_active = $3 WHERE id = $4 RETURNING id, email, prenom, nom, is_admin, is_writer, is_active',
      [is_admin, is_writer, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur update user:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /admin/users/:id
router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  if (String(req.params.id) === String(req.user.id)) {
    return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
  }
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error('Erreur delete user:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
