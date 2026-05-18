const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Ce compte a été désactivé.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin, is_writer: user.is_writer },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        is_admin: user.is_admin,
        is_writer: user.is_writer,
      },
    });
  } catch (err) {
    console.error('Erreur login:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, prenom, nom } = req.body;

  if (!email || !password || !prenom || !nom) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, prenom, nom, is_admin, is_writer, is_active) VALUES ($1, $2, $3, $4, false, false, true) RETURNING id, email, prenom, nom',
      [email, hashed, prenom, nom]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: false, is_writer: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Erreur register:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, prenom, nom, is_admin, is_writer FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur /me:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { prenom, nom, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET prenom = $1, nom = $2, email = $3 WHERE id = $4 RETURNING id, email, prenom, nom',
      [prenom, nom, email, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur update profile:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /auth/password
router.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: 'Mot de passe actuel incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    console.error('Erreur update password:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /auth/account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Compte supprimé' });
  } catch (err) {
    console.error('Erreur suppression compte:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
