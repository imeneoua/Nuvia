# 🍽️ Nuvia - La Plateforme Culinaire Nouvelle Génération

**Nuvia** est une plateforme web complète conçue pour révolutionner la gestion quotidienne des repas. Bien plus qu'un simple recueil de recettes, Nuvia est un véritable écosystème culinaire développé pour le Hackathon. Elle accompagne les utilisateurs de l'inspiration jusqu'à la planification, tout en intégrant une intelligence artificielle de pointe.

---

## ✨ Les Fonctionnalités de la Plateforme

Nuvia propose une expérience utilisateur riche à travers plusieurs modules interconnectés :

### 1. 🍳 Découverte et Exploration (Explore & Recipes)
- **Bibliothèque Massive :** Un catalogue interactif permettant d'explorer des recettes variées.
- **Base de données Locale :** Intégration d'un dataset filtré d'un million de recettes (1M_Final.csv) pour fournir des résultats exhaustifs.

### 2. 📅 Planification des Repas (Planner)
- Un outil de planification interactif pour organiser les repas de la semaine.
- Aide les utilisateurs à mieux s'organiser, réduire le gaspillage alimentaire et gagner du temps au quotidien.

### 3. 🤖 Assistant Culinaire Intelligent (Chatbot IA)
- **Mode Vocal & Textuel :** Une interface flottante (façon ChatGPT Voice) accessible à tout moment pour discuter avec l'IA.
- **RAG & Multilinguisme :** Propulsé par l'API Groq (Llama-3.1-8b), l'assistant cherche dans nos données locales et traduit à la volée en Français, Anglais ou Arabe.

### 4. 👤 Espace Utilisateur (Profile & Auth)
- **Sécurité et Fluidité :** Authentification sécurisée par email/mot de passe (OTP) ou via **Google OAuth**.
- **Gestion de Profil :** Un espace dédié pour sauvegarder les préférences de l'utilisateur.

### 5. 📊 Dashboard d'Administration (Admin)
- **Gestion Centralisée :** Un tableau de bord premium (intégré nativement en React) pour les administrateurs.
- **Interface Avancée :** Affichage des utilisateurs avec avatars dynamiques (Dicebear), informations de connexion, et suppression sécurisée liée à notre base de données SQLite.

---

## 🛠️ Stack Technique Globale

### Frontend (Application Client - React/Vite)
- **Framework & Routage :** React.js, Vite, React Router DOM (pour la navigation entre Home, Explore, Planner, Profile, Admin).
- **Design System :** CSS modulaire, approche Glassmorphism, typographie moderne (Inter).
- **Intégrations :** Web Speech API (Voix), Google OAuth.

### Backend (Serveur API - Python/FastAPI)
- **API Rapide :** FastAPI pour gérer l'authentification et les requêtes complexes.
- **Data & RAG :** Utilisation de `pandas` pour la recherche rapide dans notre immense base CSV locale.
- **Base de Données :** SQLite (`users.db`) pour un stockage persistant et léger des comptes utilisateurs.

---

## 🚀 Installation & Démarrage (Local)

### 1. Prérequis
- **Node.js** (v18+)
- **Python** (3.8+)
- Une clé API **Groq** (`VITE_GROQ_API_KEY`)

### 2. Lancement du Serveur Backend (FastAPI)
Ouvrez un terminal dans le dossier principal :
```bash
cd server
pip install fastapi uvicorn pandas
python app.py
```
> Le serveur backend (port 8000) gère l'authentification, les recherches IA, et les requêtes du Dashboard Admin.

### 3. Lancement de la Plateforme (React)
Ouvrez un second terminal :
```bash
cd Nuvia-main/Nuvia-main
npm install
npm run dev
```
> La plateforme complète est maintenant accessible sur `http://localhost:5173`. Naviguez librement entre l'Accueil, le Planner, l'Explore, et l'Admin !

---

## 📂 Architecture de la Plateforme

```text
Hackathon imene/
├── 1M_Final_Cleaned_V3.csv     # Base de données massive des recettes
├── users.db                    # Base SQLite de la plateforme
├── server/
│   └── app.py                  # API Backend (Auth, RAG, Admin API)
└── Nuvia-main/Nuvia-main/      # Application Front-End (React)
    ├── src/
    │   ├── components/         # Composants globaux (Navbar, Footer, Hero, Chatbot)
    │   ├── pages/              
    │   │   ├── Auth/           # Inscription et Connexion Google
    │   │   ├── Explore/        # Exploration des recettes
    │   │   ├── Planner/        # Planification des repas
    │   │   ├── Profile/        # Espace Utilisateur
    │   │   └── Admin/          # Dashboard d'administration complet
    │   └── App.jsx             # Routeur de la plateforme
    └── vite.config.js          # Configuration
```

---
*Nuvia - Conçu avec passion pour transformer l'expérience culinaire numérique.* 👨‍🍳✨
