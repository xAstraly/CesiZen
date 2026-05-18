# Guide d'installation — CesiZen

## Architecture du projet

```
Téléphone / Navigateur
        │
        ▼
Application Expo (React Native)
  → constants/api.js  →  IP du backend
        │
        ▼
Serveur Backend Node.js (Express) — port 3001
  → backend/.env  →  IP de la base de données
        │
        ▼
Base de données PostgreSQL — port 5432
```

---

## Prérequis

Installer les outils suivants sur le PC avant de commencer :

| Outil | Version minimale | Lien |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | (inclus avec Node.js) |
| PostgreSQL | 14+ | https://www.postgresql.org/download |
| Git | toute version | https://git-scm.com |
| Expo Go (téléphone) | dernière version | App Store / Google Play |

> Pour vérifier les versions installées :
> ```bash
> node -v
> npm -v
> psql --version
> ```

---

## Étape 1 — Récupérer le projet

Copier le dossier `CesiZen` sur le nouveau PC, ou cloner depuis le dépôt Git :

```bash
git clone <url-du-depot>
cd CesiZen
```

---

## Étape 2 — Installer PostgreSQL et créer la base de données

### 2.1 — Créer l'utilisateur et la base de données

Ouvrir un terminal et se connecter à PostgreSQL en tant qu'administrateur :

```bash
psql -U postgres
```

Puis exécuter les commandes suivantes :

```sql
-- Créer l'utilisateur
CREATE USER cesizen_user WITH PASSWORD 'secure_password';

-- Créer la base de données
CREATE DATABASE cesizen OWNER cesizen_user;

-- Accorder tous les droits
GRANT ALL PRIVILEGES ON DATABASE cesizen TO cesizen_user;

-- Quitter
\q
```

### 2.2 — Créer les tables

Se connecter à la base de données :

```bash
psql -U cesizen_user -d cesizen
```

Puis exécuter le script SQL suivant pour créer toutes les tables :

```sql
-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    is_writer BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des articles / informations
CREATE TABLE informations (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    categorie VARCHAR(100),
    lien VARCHAR(500),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des catégories d'émotions
CREATE TABLE emotion_categories (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL
);

-- Table des émotions
CREATE TABLE emotions (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES emotion_categories(id) ON DELETE CASCADE
);

-- Table des journaux d'émotions (historique utilisateur)
CREATE TABLE emotion_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emotion_id INTEGER REFERENCES emotions(id) ON DELETE CASCADE,
    note INTEGER,
    commentaire TEXT,
    logged_at TIMESTAMP DEFAULT NOW()
);

-- Table des événements de stress (questionnaire Holmes & Rahe)
CREATE TABLE stress_events (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    score INTEGER NOT NULL
);

-- Table des diagnostics de stress
CREATE TABLE stress_diagnostics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table de liaison diagnostics ↔ événements
CREATE TABLE stress_diagnostic_events (
    id SERIAL PRIMARY KEY,
    diagnostic_id INTEGER REFERENCES stress_diagnostics(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES stress_events(id) ON DELETE CASCADE
);

-- Table des exercices de respiration
CREATE TABLE breathing_exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    inhale_duration INTEGER,
    hold_duration INTEGER,
    exhale_duration INTEGER,
    cycles INTEGER,
    is_active BOOLEAN DEFAULT true
);

-- Table des sessions de respiration (historique utilisateur)
CREATE TABLE breathing_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 — Insérer les données de référence

Toujours dans le terminal `psql`, insérer les données nécessaires au fonctionnement :

```sql
-- Catégories d'émotions
INSERT INTO emotion_categories (label) VALUES
    ('Joie'),
    ('Tristesse'),
    ('Colère'),
    ('Peur'),
    ('Dégoût'),
    ('Surprise');

-- Quelques émotions par catégorie
INSERT INTO emotions (label, category_id) VALUES
    ('Heureux', 1), ('Enthousiaste', 1), ('Serein', 1), ('Reconnaissant', 1),
    ('Triste', 2), ('Mélancolique', 2), ('Désespéré', 2), ('Solitaire', 2),
    ('Énervé', 3), ('Frustré', 3), ('Irrité', 3), ('Furieux', 3),
    ('Anxieux', 4), ('Inquiet', 4), ('Paniqué', 4), ('Effrayé', 4),
    ('Dégoûté', 5), ('Répugné', 5),
    ('Surpris', 6), ('Stupéfait', 6);

-- Événements de stress (échelle Holmes & Rahe)
INSERT INTO stress_events (label, score) VALUES
    ('Décès du conjoint', 100),
    ('Divorce', 73),
    ('Séparation conjugale', 65),
    ('Emprisonnement', 63),
    ('Décès d''un proche', 63),
    ('Blessure ou maladie grave', 53),
    ('Mariage', 50),
    ('Licenciement', 47),
    ('Réconciliation conjugale', 45),
    ('Retraite', 45),
    ('Maladie grave d''un membre de la famille', 44),
    ('Grossesse', 40),
    ('Difficultés sexuelles', 39),
    ('Arrivée d''un nouveau membre dans la famille', 39),
    ('Réorganisation professionnelle', 39),
    ('Changement de situation financière', 38),
    ('Décès d''un ami proche', 37),
    ('Changement d''orientation professionnelle', 36),
    ('Mésentente avec le conjoint', 35),
    ('Emprunt immobilier important', 31),
    ('Saisie d''un bien hypothéqué', 30),
    ('Changement de responsabilités professionnelles', 29),
    ('Départ d''un enfant du foyer', 29),
    ('Difficultés avec la belle-famille', 29),
    ('Réussite personnelle exceptionnelle', 28),
    ('Début ou fin d''activité professionnelle du conjoint', 26),
    ('Début ou fin de scolarité', 26),
    ('Changement de conditions de vie', 25),
    ('Révision des habitudes personnelles', 24),
    ('Difficultés avec un supérieur', 23),
    ('Changement de conditions ou d''horaires de travail', 20),
    ('Déménagement', 20),
    ('Changement d''école', 20),
    ('Changement d''activité de loisirs', 19),
    ('Changement d''activités religieuses', 19),
    ('Changement d''activités sociales', 18),
    ('Emprunt modéré', 17),
    ('Changement des habitudes de sommeil', 16),
    ('Changement du nombre de réunions familiales', 15),
    ('Changement des habitudes alimentaires', 15),
    ('Vacances', 13),
    ('Fêtes de fin d''année', 12),
    ('Infraction mineure à la loi', 11);

-- Exercices de respiration
INSERT INTO breathing_exercises (name, description, inhale_duration, hold_duration, exhale_duration, cycles, is_active) VALUES
    ('Cohérence cardiaque', 'Respiration équilibrée pour réduire le stress et réguler le système nerveux.', 5, 0, 5, 6, true),
    ('Respiration 4-7-8', 'Technique de relaxation profonde pour calmer l''anxiété.', 4, 7, 8, 4, true),
    ('Box Breathing', 'Respiration carrée utilisée par les forces spéciales pour rester calme sous pression.', 4, 4, 4, 4, true),
    ('Respiration abdominale', 'Respiration lente et profonde pour activer le système parasympathique.', 4, 0, 6, 5, true);

-- Créer un compte administrateur par défaut
-- Mot de passe : Admin1234! (hashé avec bcrypt)
INSERT INTO users (email, password, prenom, nom, is_admin, is_writer, is_active)
VALUES (
    'admin@cesizen.fr',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'CesiZen',
    true,
    true,
    true
);
```

> **Note :** Le mot de passe du compte admin par défaut est `password`. Changer ce mot de passe après la première connexion via l'interface de l'application.

Quitter psql :
```bash
\q
```

---

## Étape 3 — Configurer et lancer le backend

### 3.1 — Installer les dépendances

```bash
cd CesiZen/backend
npm install
```

### 3.2 — Configurer les variables d'environnement

Ouvrir le fichier `backend/.env` et adapter les valeurs :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cesizen
DB_USER=cesizen_user
DB_PASSWORD=secure_password
JWT_SECRET=cesizen_jwt_secret_key_change_me
PORT=3001
```

> **Si PostgreSQL est sur une autre machine du réseau**, remplacer `localhost` par l'adresse IP de cette machine (ex: `192.168.1.50`).

> **Important :** Changer la valeur de `JWT_SECRET` par une chaîne aléatoire longue en production.

### 3.3 — Lancer le backend

```bash
node server.js
```

Le message suivant confirme que tout fonctionne :

```
Serveur démarré sur http://localhost:3001
Connecté à PostgreSQL
```

> Pour garder le serveur actif en arrière-plan, utiliser `nodemon` (redémarre automatiquement) :
> ```bash
> npx nodemon server.js
> ```

---

## Étape 4 — Configurer et lancer l'application Expo

### 4.1 — Installer les dépendances

Depuis la racine du projet :

```bash
cd CesiZen
npm install
```

### 4.2 — Configurer l'adresse IP du backend

Ouvrir le fichier `constants/api.js` et remplacer l'adresse IP par celle de la machine qui fait tourner le backend :

```js
export const API_URL = 'http://<IP-du-backend>:3001';
```

Pour trouver l'IP du PC sur le réseau local :

- **Windows :** `ipconfig` → chercher "Adresse IPv4"
- **Mac/Linux :** `ifconfig` ou `ip a`

> **Exemple :** Si le backend tourne sur le PC avec l'IP `192.168.1.42` :
> ```js
> export const API_URL = 'http://192.168.1.42:3001';
> ```

> **Si tout est sur le même PC** (backend + app web dans le navigateur) :
> ```js
> export const API_URL = 'http://localhost:3001';
> ```

### 4.3 — Lancer l'application

```bash
npx expo start
```

Un QR code s'affiche dans le terminal. Plusieurs options pour tester :

| Plateforme | Action |
|---|---|
| Téléphone Android/iOS | Scanner le QR code avec l'app **Expo Go** |
| Navigateur (PC) | Appuyer sur `w` dans le terminal, ou aller sur `http://localhost:8081` |
| Émulateur Android | Appuyer sur `a` (nécessite Android Studio) |
| Simulateur iOS | Appuyer sur `i` (macOS uniquement, nécessite Xcode) |

---

## Étape 5 — Vérification

Tester que tout fonctionne en ouvrant ces URL dans un navigateur (sur la machine du backend) :

| URL | Résultat attendu |
|---|---|
| `http://localhost:3001/` | `{"message":"CesiZen API en ligne"}` |
| `http://localhost:3001/articles` | Liste JSON des articles (vide si aucun créé) |
| `http://localhost:3001/emotions` | Liste JSON des émotions |
| `http://localhost:3001/stress/events` | Liste JSON des événements de stress |
| `http://localhost:3001/breathing/exercises` | Liste JSON des exercices de respiration |

---

## Résolution des problèmes courants

### "Impossible de contacter le serveur" dans l'app

- Vérifier que le backend est bien lancé (`node server.js`)
- Vérifier que l'IP dans `constants/api.js` est correcte et à jour
- Vérifier que le pare-feu Windows autorise le port 3001 :
  ```powershell
  netsh advfirewall firewall add rule name="CesiZen Backend" dir=in action=allow protocol=TCP localport=3001
  ```

### "Erreur connexion PostgreSQL" dans la console backend

- Vérifier que PostgreSQL est lancé
- Vérifier les valeurs dans `backend/.env` (host, port, user, password, database)
- Vérifier que l'utilisateur `cesizen_user` a bien les droits sur la base `cesizen`

### L'app se lance mais les pages sont vides

- Vérifier que les données de référence ont bien été insérées (étape 2.3)
- Ouvrir `http://localhost:3001/emotions` dans le navigateur pour confirmer que le backend répond avec des données

### Port déjà utilisé

Si le port 3001 ou 8081 est déjà occupé :
```bash
# Changer le port du backend dans backend/.env
PORT=3002

# Puis mettre à jour constants/api.js
export const API_URL = 'http://localhost:3002';
```

---

## Récapitulatif des fichiers à modifier lors d'un déploiement sur un nouveau PC

| Fichier | Ce qu'il faut changer |
|---|---|
| `backend/.env` | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` |
| `constants/api.js` | L'adresse IP du backend |
