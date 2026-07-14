# 🍽️ Nuvia — Online Hackathon Edition

> *"De l'inspiration à l'assiette."*

**Nuvia** est une plateforme web culinaire nouvelle génération développée dans le cadre du Hackathon en ligne. Ce dépôt contient la version **Online Hackathon** du projet, axée sur l'authentification sécurisée et le tableau de bord administrateur.

---

## ✨ Fonctionnalités Clés

### 🔐 Authentification Complète
- **Inscription avec OTP** : L'utilisateur saisit son email, reçoit un code OTP à 6 chiffres par email, et valide son compte.
- **Connexion Email / Mot de Passe** : Authentification classique avec JWT.
- **Google OAuth** : Connexion instantanée via le bouton Google (propulsé par `@react-oauth/google`).

### 📊 Dashboard d'Administration
- Affichage de tous les utilisateurs enregistrés en temps réel.
- Avatars dynamiques générés via **DiceBear API**.
- Suppression d'utilisateurs avec confirmation modale.
- Visualisation des détails de chaque compte.

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Usage |
|---|---|
| **React.js + Vite** | Framework UI |
| **React Router DOM** | Navigation entre les pages |
| **@react-oauth/google** | Authentification Google |
| **CSS Modulaire** | Glassmorphism + design premium |

### Backend (partagé avec `server/app.py`)
| Technologie | Usage |
|---|---|
| **FastAPI** | API REST (Auth, Admin) |
| **SQLite** (`users.db`) | Base de données utilisateurs |
| **Uvicorn** | Serveur ASGI |
| **smtplib** | Envoi des emails OTP |

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- Node.js v18+
- Python 3.8+

### 2. Backend (FastAPI)
```bash
cd server
pip install fastapi uvicorn pandas
python app.py
```
> Le serveur tourne sur **http://localhost:8000**

### 3. Frontend (React/Vite)
```bash
cd "Online Hachathon/Online Hachathon/Nuvia"
npm install
npm run dev
```
> La plateforme est accessible sur **http://localhost:5173**

---

## 🗺️ Pages Disponibles

| Page | URL | Description |
|---|---|---|
| 🏠 Accueil | `/` | Page d'accueil Nuvia |
| 🔑 Connexion | `/login` | Login email/Google |
| 📝 Inscription | `/register` | Inscription + OTP |
| 🛡️ Admin | `/admin` | Dashboard administrateur |

---

## 🔄 Flux d'Authentification OTP

```
1. Utilisateur → Saisit Name / Email / Password
2. Clic "Send OTP Code" → POST /api/auth/send-otp
3. Backend → Génère OTP 6 chiffres → Envoie email
4. Utilisateur → Saisit le code reçu par email
5. Clic "Verify & Create Account" → POST /api/auth/register
6. Succès → Redirigé vers /profile
```

---

## 📂 Architecture du Projet

```text
Online Hachathon/Online Hachathon/Nuvia/
├── src/
│   ├── components/
│   │   └── navbar/       # Barre de navigation
│   ├── pages/
│   │   ├── Auth/         # AuthModal.jsx (Login + Register + OTP + Google)
│   │   ├── Admin/        # AdminDashboard.jsx + .css
│   │   ├── Home/         # Page d'accueil
│   │   ├── Explore/      # Exploration de recettes
│   │   ├── Profile/      # Profil utilisateur
│   │   └── Planner/      # Planificateur de repas
│   └── App.jsx           # Routeur principal (avec GoogleOAuthProvider)
├── .env                  # VITE_API_URL + VITE_GROQ_API_KEY
└── package.json
```

---

## 🌐 Variables d'Environnement

```env
VITE_API_URL=http://localhost:8000
VITE_GROQ_API_KEY=your_groq_api_key
```

---

## 🏆 Points Forts pour la Présentation Hackathon

- ✅ **OTP par email** fonctionnel (SMTP Gmail)
- ✅ **Google OAuth** intégré
- ✅ **Admin Dashboard** avec gestion des utilisateurs en temps réel
- ✅ **JWT** sécurisé côté backend
- ✅ **Build Vite** sans erreurs (389 modules compilés)

---

*Nuvia Online Hackathon — Conçu avec passion pour transformer l'expérience culinaire numérique.* 👨‍🍳✨
