# CesiZen

Application mobile de bien-être mental développée dans le cadre d'un projet CESI. Elle propose des exercices de respiration, un suivi émotionnel, un diagnostic de stress et des articles de santé mentale.

---

## Fonctionnalités

- **Respiration** — exercices guidés avec minuteur animé (cohérence cardiaque, 4-7-8, box breathing…)
- **Émotions** — journal de suivi quotidien avec historique
- **Stress** — diagnostic basé sur l'échelle de Holmes & Rahe
- **Articles** — ressources bien-être avec filtre par catégorie
- **Authentification** — inscription, connexion, modification du profil
- **Espace admin** — gestion des utilisateurs et des rôles (admin, writer)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Application mobile | React Native + Expo SDK 54 |
| Routing | Expo Router v6 |
| Backend | Node.js + Express |
| Base de données | PostgreSQL |
| Authentification | JWT + bcrypt |
| Client HTTP | Fetch API natif |

---

## Structure du projet

```
CesiZen/
├── app/                    # Pages de l'application (Expo Router)
│   ├── _layout.tsx         # Layout racine avec AuthContext
│   ├── index.jsx           # Page d'accueil
│   ├── login.tsx           # Connexion
│   ├── signup.tsx          # Inscription
│   ├── profile.tsx         # Profil utilisateur
│   ├── articles.jsx        # Liste des articles
│   ├── articles/[id].jsx   # Détail d'un article
│   ├── emotions.jsx        # Suivi émotionnel
│   ├── respiration.jsx     # Exercices de respiration
│   ├── stress.jsx          # Diagnostic de stress
│   ├── admin/              # Espace administration
│   ├── cgu.jsx             # Conditions générales d'utilisation
│   ├── mentions-legales.jsx
│   └── politique-confidentialite.jsx
│
├── backend/                # Serveur API REST
│   ├── server.js           # Point d'entrée Express
│   ├── db.js               # Pool de connexion PostgreSQL
│   ├── .env.example        # Exemple de configuration
│   ├── middleware/
│   │   └── auth.js         # Vérification JWT
│   └── routes/
│       ├── auth.js         # Login, register, profil
│       ├── articles.js     # CRUD articles
│       ├── emotions.js     # Émotions et historique
│       ├── stress.js       # Diagnostic de stress
│       ├── breathing.js    # Exercices de respiration
│       └── admin.js        # Gestion utilisateurs
│
├── components/             # Composants réutilisables
│   ├── header.tsx
│   └── footer.tsx
│
├── constants/
│   └── api.js              # URL du backend
│
├── context/
│   └── AuthContext.tsx     # Gestion de la session utilisateur
│
└── docs/
    └── INSTALLATION.md     # Guide d'installation complet
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

Créer la base et l'utilisateur PostgreSQL :

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

### 4. Configurer l'IP du backend

Ouvrir `constants/api.js` et renseigner l'IP de la machine qui fait tourner le backend :

```js
export const API_URL = 'http://<votre-ip>:3001';
```

> Sur Windows, retrouver son IP avec `ipconfig` (chercher "Adresse IPv4").

### 5. Lancer l'application

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

---

## Variables d'environnement

Copier `backend/.env.example` en `backend/.env` et renseigner les valeurs :

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

## Documentation

Le guide d'installation détaillé (création des tables SQL, données de référence, résolution des problèmes) est disponible dans [docs/INSTALLATION.md](docs/INSTALLATION.md).
