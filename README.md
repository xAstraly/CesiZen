# CesiZen

Application mobile de bien-être mental développée dans le cadre d'un projet CESI. Elle propose des exercices de respiration, un suivi émotionnel, un diagnostic de stress, des activités de détente et des articles de santé mentale.

---

## Fonctionnalités

### Utilisateur
- **Respiration** — exercices guidés avec minuteur animé (cohérence cardiaque, 4-7-8, box breathing…)
- **Émotions** — saisie quotidienne avec intensité, note libre et catégorie
- **Stress** — diagnostic basé sur l'échelle de Holmes & Rahe
- **Activités de détente** — 6 activités (méditation, yoga, lecture, musique, promenade, étirements) avec timer et barre de progression animée
- **Articles** — ressources bien-être avec filtre par catégorie
- **Historique centralisé** — toutes les activités (émotions, respiration, stress, détente) accessibles depuis l'onglet *Historique* du profil
- **Rapport émotionnel** — statistiques par période (semaine / mois / trimestre / année) : total, intensité moyenne, top émotion, répartition par catégorie
- **Authentification à deux facteurs (2FA TOTP)** — activation via QR code, vérification à la connexion, désactivation avec code

### Administration
- **Gestion des utilisateurs** — attribution des rôles admin / writer, activation / désactivation des comptes
- **Gestion des événements de stress** — CRUD complet sur l'échelle Holmes & Rahe, organisé par catégorie
- **Gestion des catégories d'articles** — ajout et suppression de catégories depuis le back-office (stockées en base de données)
- **Rédaction d'articles** — création et édition avec catégorie (chip selector), lien source facultatif

### Sécurité
- JWT (7 jours) + token temporaire 5 min pour le flux 2FA
- Hachage des mots de passe avec bcrypt (cost 10)
- TOTP RFC 6238 (speakeasy) avec fenêtre de 1 pas
- Requêtes SQL paramétrées (protection injection)
- Contrôle d'accès par rôle sur chaque route protégée

---

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Application mobile | React Native + Expo SDK | ~54.0.33 |
| Routing | Expo Router | v4 |
| Backend | Node.js + Express | ^4.19.2 |
| Base de données | PostgreSQL | 14+ |
| Authentification | JWT + bcrypt | ^9.0.2 / ^5.1.1 |
| 2FA | speakeasy + qrcode | ^2.0.0 / ^1.5.4 |
| Client HTTP | Fetch API natif | — |
| Tests | Jest + Supertest | ^29 / ^7 |

---

## Structure du projet

```
CesiZen/
├── app/                          # Pages de l'application (Expo Router)
│   ├── _layout.tsx               # Layout racine avec AuthContext
│   ├── index.jsx                 # Page d'accueil
│   ├── login.tsx                 # Connexion (avec étape 2FA)
│   ├── signup.tsx                # Inscription
│   ├── profile.tsx               # Profil — onglets Infos / Historique / Sécurité
│   ├── articles.jsx              # Liste des articles avec filtres
│   ├── articles/[id].jsx         # Détail d'un article
│   ├── emotions.jsx              # Saisie d'émotion
│   ├── respiration.jsx           # Exercices de respiration
│   ├── stress.jsx                # Diagnostic de stress
│   ├── detente.jsx               # Activités de détente avec timer
│   ├── admin/
│   │   ├── index.jsx             # Rédaction articles + gestion catégories
│   │   ├── users.jsx             # Gestion des utilisateurs
│   │   └── stress-events.jsx     # CRUD événements Holmes & Rahe
│   ├── cgu.jsx
│   ├── mentions-legales.jsx
│   └── politique-confidentialite.jsx
│
├── backend/                      # Serveur API REST
│   ├── server.js                 # Point d'entrée Express
│   ├── db.js                     # Pool de connexion PostgreSQL
│   ├── .env.example
│   ├── middleware/
│   │   └── auth.js               # Vérification JWT (bloque tokens 2fa_pending)
│   ├── routes/
│   │   ├── auth.js               # Login, register, profil, 2FA
│   │   ├── articles.js           # CRUD articles + gestion catégories
│   │   ├── emotions.js           # Émotions, historique filtré, statistiques
│   │   ├── stress.js             # Diagnostic + CRUD événements (admin)
│   │   ├── breathing.js          # Sessions de respiration
│   │   ├── detente.js            # Logs activités de détente
│   │   └── admin.js              # Gestion utilisateurs
│   └── __tests__/
│       ├── auth.test.js          # 6 tests
│       ├── articles.test.js      # 4 tests
│       └── stress.test.js        # 4 tests
│
├── components/
│   ├── header.tsx                # Navigation principale avec rafraîchissement des rôles
│   └── footer.tsx
│
├── constants/
│   └── api.js                    # URL backend (détection auto IP pour mobile)
│
├── context/
│   └── AuthContext.tsx           # Session + refreshUser + AppState listener
│
├── docs/
│   └── INSTALLATION.md           # Guide d'installation complet
│
└── DOCUMENTATION_TECHNIQUE.md   # Documentation technique complète (soutenance)
```

---

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org) 18+
- [PostgreSQL](https://www.postgresql.org/download) 14+
- [Expo Go](https://expo.dev/go) sur le téléphone (Android ou iOS)

### 1. Cloner le projet

```bash
git clone https://github.com/xAstraly/CesiZen.git
cd CesiZen
```

### 2. Configurer la base de données

```bash
psql -U postgres
```

```sql
CREATE USER cesizen_user WITH PASSWORD 'secure_password';
CREATE DATABASE cesizen OWNER cesizen_user;
GRANT ALL PRIVILEGES ON DATABASE cesizen TO cesizen_user;
\q
```

> Le guide complet avec le script SQL de création des tables est dans [docs/INSTALLATION.md](docs/INSTALLATION.md).

### 3. Lancer le backend

```bash
cd backend
cp .env.example .env   # puis éditer .env avec vos valeurs
npm install
node server.js
```

Le serveur démarre sur `http://localhost:3001`.

### 4. Lancer l'application

```bash
# Depuis la racine du projet
npm install
npx expo start
```

| Plateforme | Action |
|---|---|
| Téléphone | Scanner le QR code avec Expo Go |
| Navigateur | Appuyer sur `w` ou ouvrir `http://localhost:8081` |
| Émulateur Android | Appuyer sur `a` |

> L'URL du backend est détectée automatiquement via `expo-constants` — aucune configuration manuelle nécessaire pour le mobile sur le même réseau local.

---

## Variables d'environnement

Copier `backend/.env.example` en `backend/.env` :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cesizen
DB_USER=cesizen_user
DB_PASSWORD=your_password_here
JWT_SECRET=change_this_to_a_random_secret_key
PORT=3001
```

> Ne jamais committer le fichier `.env` — il est exclu par le `.gitignore`.

---

## Tests

```bash
cd backend
npm test
```

**Résultats : 14 tests — 14 réussis — 0 échecs**

| Suite | Tests |
|---|---|
| `auth.test.js` | Login validation, register validation, route /me protégée |
| `articles.test.js` | GET liste, GET catégories, 404, POST sans auth |
| `stress.test.js` | GET événements, structure réponse, POST auth requis, GET historique auth requis |

---

## Documentation

- Guide d'installation détaillé : [docs/INSTALLATION.md](docs/INSTALLATION.md)
- Documentation technique complète (architecture, sécurité, API, BDD, tests) : [DOCUMENTATION_TECHNIQUE.md](DOCUMENTATION_TECHNIQUE.md)
