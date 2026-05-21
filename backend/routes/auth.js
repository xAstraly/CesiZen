const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
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

    if (user.totp_enabled && user.totp_secret) {
      const tempToken = jwt.sign(
        { id: user.id, type: '2fa_pending' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({ requires_2fa: true, temp_token: tempToken });
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

// POST /auth/2fa/verify-login
router.post('/2fa/verify-login', async (req, res) => {
  const { temp_token, code } = req.body;
  if (!temp_token || !code) {
    return res.status(400).json({ message: 'Token temporaire et code requis' });
  }
  try {
    const decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
    if (decoded.type !== '2fa_pending') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });

    const valid = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!valid) return res.status(401).json({ message: 'Code invalide ou expiré' });

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
    console.error('Erreur 2fa verify-login:', err.message);
    res.status(401).json({ message: 'Token expiré ou invalide' });
  }
});

// POST /auth/2fa/setup
router.post('/2fa/setup', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    const secret = speakeasy.generateSecret({ name: `CESIZen (${user.email})` });
    await pool.query('UPDATE users SET totp_secret = $1, totp_enabled = false WHERE id = $2', [secret.base32, req.user.id]);
    const qr_code_url = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ qr_code_url });
  } catch (err) {
    console.error('Erreur 2fa setup:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /auth/2fa/activate
router.post('/2fa/activate', authMiddleware, async (req, res) => {
  const { code } = req.body;
  try {
    const result = await pool.query('SELECT totp_secret FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user?.totp_secret) return res.status(400).json({ message: 'Lancez d\'abord la configuration' });

    const valid = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!valid) return res.status(401).json({ message: 'Code invalide. Vérifiez votre application.' });

    await pool.query('UPDATE users SET totp_enabled = true WHERE id = $1', [req.user.id]);
    res.json({ message: '2FA activé avec succès' });
  } catch (err) {
    console.error('Erreur 2fa activate:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /auth/2fa/disable
router.post('/2fa/disable', authMiddleware, async (req, res) => {
  const { code } = req.body;
  try {
    const result = await pool.query('SELECT totp_secret FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user?.totp_secret) return res.status(400).json({ message: '2FA non configuré' });

    const valid = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!valid) return res.status(401).json({ message: 'Code invalide' });

    await pool.query('UPDATE users SET totp_enabled = false, totp_secret = NULL WHERE id = $1', [req.user.id]);
    res.json({ message: '2FA désactivé' });
  } catch (err) {
    console.error('Erreur 2fa disable:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /auth/2fa/status
router.get('/2fa/status', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT totp_enabled FROM users WHERE id = $1', [req.user.id]);
    res.json({ totp_enabled: result.rows[0]?.totp_enabled || false });
  } catch (err) {
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

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis' });
  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!result.rows[0]) {
      // Ne pas révéler si l'email existe
      return res.json({ message: 'Si cet email existe, un code a été envoyé.' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
      [code, expires, result.rows[0].id]
    );
    // En production : envoyer code par email. Ici retourné pour le dev.
    res.json({ message: 'Si cet email existe, un code a été envoyé.', dev_code: code });
  } catch (err) {
    console.error('Erreur forgot-password:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code et nouveau mot de passe requis' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
  }
  try {
    const result = await pool.query(
      'SELECT id, reset_token, reset_expires FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user || user.reset_token !== code) {
      return res.status(400).json({ message: 'Code invalide' });
    }
    if (new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ message: 'Ce code a expiré' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
      [hashed, user.id]
    );
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    console.error('Erreur reset-password:', err.message);
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
