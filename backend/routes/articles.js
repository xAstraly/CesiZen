const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /articles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT i.*, u.prenom, u.nom FROM informations i LEFT JOIN users u ON i.user_id = u.id ORDER BY i.created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur articles:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /articles/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT i.*, u.prenom, u.nom FROM informations i LEFT JOIN users u ON i.user_id = u.id WHERE i.id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Article introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur article:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /articles (admin ou writer uniquement — vérifié en DB)
router.post('/', authMiddleware, async (req, res) => {
  const { titre, contenu, categorie } = req.body;
  const userResult = await pool.query('SELECT is_admin, is_writer FROM users WHERE id = $1', [req.user.id]);
  const u = userResult.rows[0];
  if (!u?.is_admin && !u?.is_writer) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  const { lien } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO informations (titre, contenu, categorie, lien, user_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [titre, contenu, categorie, lien || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur création article:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /articles/:id (admin ou writer — vérifié en DB)
router.put('/:id', authMiddleware, async (req, res) => {
  const userResult = await pool.query('SELECT is_admin, is_writer FROM users WHERE id = $1', [req.user.id]);
  const u = userResult.rows[0];
  if (!u?.is_admin && !u?.is_writer) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  const { titre, contenu, categorie, lien } = req.body;
  try {
    const result = await pool.query(
      'UPDATE informations SET titre = $1, contenu = $2, categorie = $3, lien = $4 WHERE id = $5 RETURNING *',
      [titre, contenu, categorie, lien || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur update article:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /articles/:id (admin uniquement — vérifié en DB)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('DELETE article - user id:', req.user.id, '| article id:', req.params.id);
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    console.log('DELETE article - is_admin depuis DB:', userResult.rows[0]);
    if (!userResult.rows[0]?.is_admin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await pool.query('DELETE FROM informations WHERE id = $1', [req.params.id]);
    res.json({ message: 'Article supprimé' });
  } catch (err) {
    console.error('Erreur suppression article:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
