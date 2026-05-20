# CESIZen — Documentation Technique Complète

> Application de santé mentale développée dans le cadre du projet CESI.  
> Auteur : Mathieu Couillard  
> Date : Mai 2026

---

## Sommaire

1. [Présentation du projet](#1-présentation-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Technologies utilisées](#3-technologies-utilisées)
4. [Structure du projet](#4-structure-du-projet)
5. [Base de données — MLD](#5-base-de-données--mld)
6. [API REST — Routes disponibles](#6-api-rest--routes-disponibles)
7. [Fonctionnalités développées](#7-fonctionnalités-développées)
8. [Sécurité mise en place](#8-sécurité-mise-en-place)
9. [Tests — Résultats complets](#9-tests--résultats-complets)
10. [Installation et démarrage](#10-installation-et-démarrage)
11. [Points clés pour la soutenance](#11-points-clés-pour-la-soutenance)

---

## 1. Présentation du projet

**CESIZen** est une application mobile et web de santé mentale destinée aux employés CESI. Elle propose des outils de gestion du stress, de suivi émotionnel, d'exercices de respiration, d'activités de détente, et d'accès à des ressources informatives.

### Objectifs
- Permettre aux utilisateurs de suivre leur état émotionnel dans le temps
- Proposer des outils concrets de gestion du stress (diagnostic, respiration, détente)
- Fournir un espace d'information sur la santé mentale
- Offrir aux administrateurs un back-office complet de gestion

### Public cible
- **Utilisateurs** : employés CESI souhaitant gérer leur bien-être
- **Rédacteurs** : contributeurs qui publient des articles
- **Administrateurs** : gestionnaires de la plateforme

---

## 2. Architecture technique

### Choix d'architecture : Client/Serveur REST (retenu)

| Critère | Client/Serveur REST | Monolithique | Microservices |
|---|---|---|---|
| Complexité | Moyenne | Faible | Élevée |
| Scalabilité | Bonne | Limitée | Excellente |
| Délai de dév. | Court | Très court | Long |
| Maintenance | Facile | Facile | Complexe |
| **Adapté au projet** | **✅ Oui** | Trop simple | Sur-dimensionné |

**Justification** : L'architecture REST sépare clairement le frontend (Expo/React Native) du backend (Express/Node.js), permettant de cibler web et mobile depuis une même API sans complexité inutile.

### Schéma d'architecture

```
┌─────────────────────────────────────┐
│         CLIENT (Expo / React Native) │
│  Web (localhost:8081)                │
│  iOS / Android (Expo Go)             │
└──────────────┬──────────────────────┘
               │ HTTP REST / JSON
               │ Bearer Token JWT
┌──────────────▼──────────────────────┐
│      BACKEND (Node.js / Express)     │
│      localhost:3001                  │
│  Routes : /auth /articles /emotions  │
│           /stress /breathing /detente│
│           /admin                     │
└──────────────┬──────────────────────┘
               │ pg (node-postgres)
┌──────────────▼──────────────────────┐
│      BASE DE DONNÉES (PostgreSQL)    │
│      localhost:5432                  │
│      Base : cesizen                  │
└─────────────────────────────────────┘
```

---

## 3. Technologies utilisées

### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| React Native | 0.81.5 | Framework mobile/web |
| Expo | ~54.0.33 | Toolchain et build |
| Expo Router | ~6.0.23 | Navigation basée sur les fichiers |
| React | 19.1.0 | Librairie UI |
| AsyncStorage | 2.2.0 | Persistance locale du token JWT |
| Expo Constants | ~18.0.13 | Détection dynamique de l'IP serveur |
| React Native Reanimated | ~4.1.1 | Animations (cercle respiration) |
| Expo Vector Icons | ^15.0.3 | Icônes (Ionicons) |

### Backend
| Technologie | Version | Rôle |
|---|---|---|
| Node.js | LTS | Runtime JavaScript serveur |
| Express | ^4.19.2 | Framework HTTP REST |
| PostgreSQL | 16 | Base de données relationnelle |
| node-postgres (pg) | ^8.12.0 | Connecteur PostgreSQL |
| bcrypt | ^5.1.1 | Hachage des mots de passe |
| jsonwebtoken | ^9.0.2 | Génération et vérification des JWT |
| speakeasy | ^2.0.0 | Génération TOTP (2FA) |
| qrcode | ^1.5.4 | Génération de QR codes (2FA setup) |
| dotenv | ^16.4.5 | Gestion des variables d'environnement |
| cors | ^2.8.5 | Gestion des requêtes cross-origin |

### Tests
| Technologie | Version | Rôle |
|---|---|---|
| Jest | ^30.4.2 | Framework de tests |
| Supertest | ^7.2.2 | Tests d'intégration HTTP |

---

## 4. Structure du projet

```
CesiZen/
├── app/                          # Pages (Expo Router — file-based routing)
│   ├── _layout.tsx               # Layout racine (Header + Footer)
│   ├── index.jsx                 # Page d'accueil
│   ├── login.tsx                 # Connexion (+ étape 2FA)
│   ├── signup.tsx                # Inscription
│   ├── profile.tsx               # Profil utilisateur (4 onglets)
│   ├── articles.jsx              # Liste des articles + filtres
│   ├── articles/[id].jsx         # Détail d'un article
│   ├── emotions.jsx              # Tracker d'émotions
│   ├── stress.jsx                # Diagnostic de stress (Holmes & Rahe)
│   ├── respiration.jsx           # Exercices de respiration guidés
│   ├── detente.jsx               # Activités de détente
│   ├── forgot-password.jsx       # Mot de passe oublié
│   ├── cgu.jsx                   # Conditions générales
│   ├── mentions-legales.jsx      # Mentions légales
│   ├── politique-confidentialite.jsx
│   └── admin/
│       ├── index.jsx             # Panel rédaction articles
│       ├── users.jsx             # Gestion utilisateurs (admin)
│       └── stress-events.jsx     # Gestion événements de stress (admin)
│
├── backend/
│   ├── server.js                 # Point d'entrée Express
│   ├── db.js                     # Connexion PostgreSQL (Pool)
│   ├── .env                      # Variables d'environnement (non versionné)
│   ├── middleware/
│   │   └── auth.js               # Middleware JWT
│   ├── routes/
│   │   ├── auth.js               # Authentification + 2FA
│   │   ├── articles.js           # Articles + catégories
│   │   ├── emotions.js           # Émotions + stats + historique
│   │   ├── stress.js             # Diagnostic de stress
│   │   ├── breathing.js          # Exercices de respiration
│   │   ├── detente.js            # Activités de détente
│   │   └── admin.js              # Gestion utilisateurs (admin)
│   ├── __tests__/
│   │   ├── auth.test.js
│   │   ├── articles.test.js
│   │   └── stress.test.js
│   └── jest.config.js
│
├── components/
│   ├── header.tsx                # Navigation responsive (desktop + mobile)
│   └── footer.tsx                # Pied de page
│
├── constants/
│   └── api.js                    # URL API dynamique (localhost ↔ IP réseau)
│
└── context/
    └── AuthContext.tsx           # Contexte React : user, token, login, logout, refreshUser
```

---

## 5. Base de données — MLD

### Tables et relations

**`users`** — Comptes utilisateurs
```
id (PK), email (UNIQUE), password (hash bcrypt), prenom, nom,
is_admin (BOOL), is_writer (BOOL), is_active (BOOL),
totp_secret (VARCHAR), totp_enabled (BOOL)
```

**`informations`** — Articles
```
id (PK), titre, contenu, categorie, lien, user_id (FK→users), created_at
```

**`article_categories`** — Catégories d'articles (gérées en admin)
```
id (PK), name (UNIQUE)
```
> Catégories : Santé mentale, Prévention, Gestion du stress, Bien-être, Ressources, Actualités, Santé

**`emotion_categories`** — Familles d'émotions
```
id (PK), label
```

**`emotions`** — Émotions individuelles
```
id (PK), label, category_id (FK→emotion_categories)
```

**`emotion_logs`** — Journal d'émotions utilisateur
```
id (PK), user_id (FK→users), emotion_id (FK→emotions),
note (1–10), commentaire, logged_at
```

**`stress_events`** — Événements de l'échelle Holmes & Rahe
```
id (PK), label, points, category
```
> 43 événements en base

**`stress_diagnostics`** — Résultats de diagnostics
```
id (PK), user_id (FK→users), total_score, risk_level, created_at
```

**`stress_diagnostic_events`** — Événements cochés par diagnostic
```
id (PK), diagnostic_id (FK→stress_diagnostics), event_id (FK→stress_events)
```

**`breathing_exercises`** — Exercices de respiration (référentiel)
```
id (PK), name, description, is_active
```

**`breathing_logs`** — Sessions de respiration effectuées
```
id (PK), user_id (FK→users), exercise_name, completed_at
```

**`relaxation_logs`** — Activités de détente effectuées
```
id (PK), user_id (FK→users), activity_name, duration_seconds, completed_at
```

**`activities`** / **`user_favorites`** — Activités et favoris (infrastructure)

### Relations clés
```
users ──< emotion_logs >── emotions >── emotion_categories
users ──< stress_diagnostics >──< stress_diagnostic_events >── stress_events
users ──< breathing_logs
users ──< relaxation_logs
informations >── users (auteur)
```

---

## 6. API REST — Routes disponibles

### Authentification `/auth`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Non | Connexion (retourne JWT ou temp_token si 2FA) |
| POST | `/auth/register` | Non | Inscription |
| GET | `/auth/me` | JWT | Données de l'utilisateur connecté |
| PUT | `/auth/profile` | JWT | Mise à jour du profil |
| PUT | `/auth/password` | JWT | Changement de mot de passe |
| DELETE | `/auth/account` | JWT | Suppression du compte |
| GET | `/auth/2fa/status` | JWT | Statut 2FA |
| POST | `/auth/2fa/setup` | JWT | Génère secret + QR code |
| POST | `/auth/2fa/activate` | JWT | Active la 2FA (vérifie le 1er code) |
| POST | `/auth/2fa/disable` | JWT | Désactive la 2FA |
| POST | `/auth/2fa/verify-login` | temp_token | Vérifie le code 2FA à la connexion |

### Articles `/articles`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/articles` | Non | Liste tous les articles |
| GET | `/articles/:id` | Non | Détail d'un article |
| POST | `/articles` | Writer/Admin | Créer un article |
| PUT | `/articles/:id` | Writer/Admin | Modifier un article |
| DELETE | `/articles/:id` | Admin | Supprimer un article |
| GET | `/articles/categories` | Non | Liste des catégories |
| POST | `/articles/categories` | Admin | Créer une catégorie |
| DELETE | `/articles/categories/:id` | Admin | Supprimer une catégorie |

### Émotions `/emotions`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/emotions` | Non | Liste des émotions |
| GET | `/emotions/categories` | Non | Familles d'émotions |
| POST | `/emotions/log` | JWT | Enregistrer une émotion |
| GET | `/emotions/history?period=` | JWT | Historique filtré (week/month/quarter/year) |
| GET | `/emotions/stats?period=` | JWT | Statistiques par période |

### Stress `/stress`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/stress/events` | Non | Liste des 43 événements Holmes & Rahe |
| POST | `/stress/events` | Admin | Créer un événement |
| PUT | `/stress/events/:id` | Admin | Modifier un événement |
| DELETE | `/stress/events/:id` | Admin | Supprimer un événement |
| POST | `/stress/diagnostics` | JWT | Soumettre un diagnostic |
| GET | `/stress/history` | JWT | Historique des diagnostics |

### Respiration `/breathing`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/breathing/exercises` | Non | Exercices disponibles |
| POST | `/breathing/log` | JWT | Enregistrer une session |
| GET | `/breathing/history` | JWT | Historique des sessions |

### Détente `/detente`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/detente/log` | JWT | Enregistrer une activité terminée |
| GET | `/detente/history` | JWT | Historique des activités |

### Administration `/admin`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | Admin | Liste des utilisateurs |
| PUT | `/admin/users/:id` | Admin | Modifier rôles/statut |
| DELETE | `/admin/users/:id` | Admin | Supprimer un compte |

---

## 7. Fonctionnalités développées

### Module Comptes utilisateurs
- Inscription avec hachage bcrypt (salt rounds : 10)
- Connexion avec JWT (expiration : 7 jours)
- Profil utilisateur (4 onglets : Informations, Historique, Sécurité, Suppression)
- 3 rôles : Utilisateur, Rédacteur (`is_writer`), Administrateur (`is_admin`)
- Mise à jour des rôles en temps réel (refresh au changement de page via `refreshUser`)

### Module Authentification à deux facteurs (A2F / TOTP)
- Génération de secret via `speakeasy` (algorithme TOTP RFC 6238)
- QR code généré en base64 pour scan avec Google Authenticator / Authy
- Token temporaire (`2fa_pending`) valable 5 minutes lors de la connexion
- Activation / désactivation sécurisée (vérification du code requis)
- Protection : impossible d'activer depuis un téléphone (impossibilité de scanner son propre écran)

### Module Articles / Informations
- CRUD complet (admin et rédacteurs)
- 7 catégories fixes gérables en admin : Santé mentale, Prévention, Gestion du stress, Bien-être, Ressources, Actualités, Santé
- Ajout de catégories personnalisées par les admins
- Filtrage par catégorie et recherche textuelle
- Affichage en liste et vue détaillée

### Module Diagnostic de stress (Holmes & Rahe)
- 43 événements de vie répartis par catégorie
- Calcul du score total et niveau de risque : Faible (< 150), Modéré (150–299), Élevé (≥ 300)
- Score affiché en temps réel lors de la sélection
- Résultat enregistré en base avec les événements cochés
- Historique des 10 derniers diagnostics

### Module Exercices de respiration
- 3 techniques : Cohérence cardiaque (4-4-4), Anti-stress (4-7-8), Box Breathing (4-4-4-4)
- Animation de cercle synchronisée avec les phases (Inspire / Retiens / Expire / Pause)
- Enregistrement automatique à chaque session complétée

### Module Activités de détente
- 6 activités guidées : Méditation, Scan corporel, Visualisation positive, Étirements, Pleine conscience, Relaxation musculaire
- Timer avec barre de progression animée
- Durées : 2 à 7 minutes selon l'activité
- Enregistrement de la durée effectuée

### Module Tracker d'émotions
- Sélection en 3 étapes : famille → émotion spécifique → intensité (1–10)
- 8 familles d'émotions colorées : Joie, Tristesse, Peur, Colère, Surprise, Dégoût, Confiance, Anticipation
- Barre visuelle d'intensité interactive
- Commentaire facultatif

### Module Historique (profil)
- **Journal d'émotions** avec filtre par période (Semaine / Mois / Trimestre / Année)
- **Statistiques** : total d'entrées, intensité moyenne, émotion principale, répartition par catégorie
- Sessions de respiration (20 dernières)
- Activités de détente (20 dernières)
- Diagnostics de stress (10 derniers) avec score et niveau de risque

### Back-office Administration
- **Gestion des utilisateurs** : liste complète, toggle actif/inactif, rédacteur, admin
- **Gestion des articles** : CRUD avec sélecteur de catégorie
- **Gestion des catégories d'articles** : ajout/suppression en direct
- **Gestion des événements de stress** : CRUD complet avec catégorisation

---

## 8. Sécurité mise en place

### Authentification et autorisation

**JWT (JSON Web Token)**
- Algorithme : HS256
- Payload : `{ id, email, is_admin, is_writer }`
- Expiration : 7 jours
- Stockage côté client : `AsyncStorage` (React Native)
- Transmis via header `Authorization: Bearer <token>`

**Token temporaire 2FA**
- Payload : `{ id, type: '2fa_pending' }`
- Expiration : **5 minutes**
- Rejeté par le middleware sur toutes les routes protégées normales

**Middleware `auth.js`**
```js
// Bloque les tokens 2FA_pending sur les routes normales
if (decoded.type === '2fa_pending') → 401 Authentification incomplète
```

### Hachage des mots de passe
- Librairie : `bcrypt` avec `saltRounds: 10`
- Aucun mot de passe en clair en base de données

### 2FA — TOTP (RFC 6238)
- Secret généré via `speakeasy.generateSecret()`
- Encodage : base32
- Fenêtre de tolérance : ±1 intervalle (30 secondes)
- QR code transmis une seule fois lors du setup
- Secret supprimé si 2FA désactivé

### Contrôle d'accès par rôle
| Ressource | Utilisateur | Rédacteur | Administrateur |
|---|---|---|---|
| Articles (lecture) | ✅ | ✅ | ✅ |
| Articles (création/édition) | ❌ | ✅ | ✅ |
| Articles (suppression) | ❌ | ❌ | ✅ |
| Catégories (gestion) | ❌ | ❌ | ✅ |
| Utilisateurs (gestion) | ❌ | ❌ | ✅ |
| Événements stress (gestion) | ❌ | ❌ | ✅ |
| Tracker émotions / respiration | ✅ | ✅ | ✅ |

### CORS
- `app.use(cors())` — autorise toutes les origines (contexte développement)
- En production : restreindre aux domaines autorisés

### Variables d'environnement
- Fichier `.env` non versionné (`.gitignore`)
- Contient : `DB_PASSWORD`, `JWT_SECRET`, ports
- `JWT_SECRET` : clé secrète unique par déploiement

### Validation des entrées
- Vérification de la présence des champs obligatoires sur chaque route
- Requêtes SQL paramétrées (protection contre l'injection SQL via `pg`)
- Gestion des conflits (UNIQUE constraints PostgreSQL → HTTP 409)

### Désactivation des comptes
- `is_active = false` → connexion refusée (HTTP 403) même avec bon mot de passe
- Gérable par l'admin en temps réel

---

## 9. Tests — Résultats complets

### Framework et outils
- **Jest** v30.4.2 — framework de tests
- **Supertest** v7.2.2 — simulation de requêtes HTTP
- Configuration : `backend/jest.config.js`
- Commande : `npm test` (dans le dossier `backend/`)

### Résultats d'exécution

```
Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        ~2.3 s
```

**✅ Tous les tests passent.**

---

### Détail des tests

#### `auth.test.js` — Module Authentification (7 tests)

| # | Test | Résultat | Code HTTP attendu |
|---|---|---|---|
| 1 | POST /auth/login sans email ni mot de passe | ✅ PASS | 400 |
| 2 | POST /auth/login avec identifiants incorrects | ✅ PASS | 401 |
| 3 | POST /auth/login sans mot de passe | ✅ PASS | 400 |
| 4 | POST /auth/register avec champs manquants | ✅ PASS | 400 |
| 5 | GET /auth/me sans token | ✅ PASS | 401 |
| 6 | GET /auth/me avec token invalide | ✅ PASS | 401 |

#### `articles.test.js` — Module Articles (4 tests)

| # | Test | Résultat | Code HTTP attendu |
|---|---|---|---|
| 1 | GET /articles retourne un tableau | ✅ PASS | 200 |
| 2 | GET /articles/categories retourne un tableau | ✅ PASS | 200 |
| 3 | GET /articles/99999 retourne 404 | ✅ PASS | 404 |
| 4 | POST /articles sans token (accès refusé) | ✅ PASS | 401 |

#### `stress.test.js` — Module Diagnostic de stress (4 tests)

| # | Test | Résultat | Code HTTP attendu |
|---|---|---|---|
| 1 | GET /stress/events retourne la liste | ✅ PASS | 200 |
| 2 | Chaque événement possède `label` et `points` | ✅ PASS | — |
| 3 | POST /stress/diagnostics sans token (accès refusé) | ✅ PASS | 401 |
| 4 | GET /stress/history sans token (accès refusé) | ✅ PASS | 401 |

### Scénarios de tests manuels validés

| Scénario | Résultat |
|---|---|
| Inscription → Connexion → Accès profil | ✅ OK |
| Connexion avec mauvais mot de passe | ✅ Message d'erreur affiché |
| Activation 2FA (desktop) → Connexion avec code TOTP | ✅ OK |
| Tentative d'activation 2FA sur mobile | ✅ Bloqué avec message explicatif |
| Admin change rôle rédacteur → menu mis à jour à la navigation suivante | ✅ OK |
| Tracker d'émotions → visible dans historique (filtre Mois) | ✅ OK |
| Exercice de respiration → enregistré dans historique | ✅ OK |
| Activité de détente complète → durée enregistrée | ✅ OK |
| Diagnostic de stress → score et niveau de risque corrects | ✅ OK |
| Rédacteur crée un article → visible dans la liste | ✅ OK |
| Admin supprime un article → disparaît de la liste | ✅ OK |
| Admin ajoute une catégorie → disponible dans le formulaire | ✅ OK |
| Compte désactivé → connexion refusée | ✅ OK |
| Accès page /admin sans rôle → redirection | ✅ OK |

---

## 10. Installation et démarrage

### Prérequis
- Node.js (LTS)
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)

### 1. Base de données PostgreSQL

```sql
-- Créer l'utilisateur
CREATE USER cesizen_user WITH PASSWORD 'votre_mot_de_passe';

-- Créer la base
CREATE DATABASE cesizen OWNER cesizen_user;

-- Accorder les droits
GRANT ALL PRIVILEGES ON DATABASE cesizen TO cesizen_user;
```

Puis importer le schéma SQL (tables + données initiales).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Éditer .env avec les bons identifiants PostgreSQL et un JWT_SECRET fort
npm install
node server.js
```

Le serveur démarre sur **http://localhost:3001**  
Message attendu : `Serveur démarré sur http://localhost:3001` + `Connecté à PostgreSQL`

### 3. Frontend

```bash
# Depuis la racine du projet
npm install
npx expo start --web
```

L'application est accessible sur **http://localhost:8081**

### 4. Tests

```bash
cd backend
npm test
```

### Variables d'environnement (backend/.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cesizen
DB_USER=cesizen_user
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=clé_secrète_aléatoire_longue
PORT=3001
```

### Compatibilité mobile (Expo Go)

L'URL de l'API est automatiquement résolue grâce à `expo-constants` :

```js
// constants/api.js
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
export const API_URL = `http://${host}:3001`;
```

- Sur **navigateur web** → `http://localhost:3001`
- Sur **téléphone physique** → `http://192.168.x.x:3001` (IP du PC détectée automatiquement)

**Prérequis** : téléphone et PC sur le même réseau Wi-Fi.

---

## 11. Points clés pour la soutenance

### Parcours de démonstration recommandé

1. **Page d'accueil** → présenter l'interface publique
2. **Inscription** d'un nouvel utilisateur
3. **Connexion** → token JWT stocké
4. **Tracker d'émotions** → sélectionner une émotion, noter l'intensité, enregistrer
5. **Exercice de respiration** → lancer la cohérence cardiaque, montrer l'animation
6. **Activité de détente** → lancer une méditation, montrer le timer
7. **Diagnostic de stress** → cocher quelques événements, voir le score en temps réel, soumettre
8. **Profil → Historique** → montrer les filtres par période, les stats d'émotions
9. **Admin → Gestion utilisateurs** → changer un rôle, naviguer → mise à jour en direct
10. **Admin → Événements de stress** → ajouter/modifier un événement
11. **Profil → Sécurité → A2F** → montrer le QR code et le flux d'activation (depuis un navigateur)

### Chiffres clés à retenir
- **14 tables** en base de données
- **35+ routes API REST**
- **14 tests automatisés** — 100% de réussite
- **43 événements** dans l'échelle Holmes & Rahe
- **6 activités** de détente guidées
- **3 techniques** de respiration
- **8 familles** d'émotions, **40+ émotions** référencées
- **3 niveaux de rôles** utilisateur

### Fonctionnalités différenciantes
- **2FA TOTP** avec QR code (Google Authenticator / Authy)
- **Rapport émotionnel par période** (semaine / mois / trimestre / année) avec statistiques
- **URL API auto-adaptative** (localhost en web, IP réseau sur mobile)
- **Rôles mis à jour en temps réel** sans reconnexion

### Conformité cahier des charges
| Module | Obligatoire | Statut |
|---|---|---|
| Comptes utilisateurs | ✅ Obligatoire | ✅ Développé |
| Informations / Articles | ✅ Obligatoire | ✅ Développé |
| Diagnostic de stress (Holmes & Rahe) | Au choix | ✅ Développé |
| Exercices de respiration | Au choix | ✅ Développé |
| Activités de détente | Au choix | ✅ Développé |
| Tracker d'émotions | Au choix | ✅ Développé |
| Rapport d'émotions par période | — | ✅ Développé (bonus) |
| Back-office admin complet | — | ✅ Développé (bonus) |
| Authentification 2FA | — | ✅ Développé (bonus) |

---

*Documentation générée le 20 mai 2026 — CESIZen v1.0*
