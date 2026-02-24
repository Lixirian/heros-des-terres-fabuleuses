# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes de développement

```bash
# Installer les dépendances (monorepo workspaces)
npm install

# Dev (frontend + backend simultanés)
npm run dev

# Frontend seul (Vite sur :5173, proxy API vers :46127)
npm run dev:client

# Backend seul (Express sur :46127)
npm run dev:server

# Build production
npm run build
```

## Déploiement NAS

- **SSH** : `ssh Lixirian@192.168.1.240` (clé SSH sans mot de passe)
- **Chemin projet NAS** : `/volume1/docker/htf`
- **Git** : pas installé sur le NAS, utiliser `scp -O` pour copier les fichiers (flag `-O` obligatoire, subsystem SFTP désactivé)
- **Rebuild** : `ssh Lixirian@192.168.1.240 "cd /volume1/docker/htf && /usr/local/bin/docker-compose up --build -d"`
- **Port** : 46127

### Workflow de déploiement

1. Modifier le code localement
2. `npm run build` dans le root pour vérifier la compilation
3. Copier les fichiers modifiés via `scp -O` vers le NAS
4. Rebuild : `docker-compose up --build -d`
5. Commit + push sur GitHub (`origin main`)

### Copie complète vers le NAS

```bash
scp -O -r packages/ Lixirian@192.168.1.240:/volume1/docker/htf/packages/
scp -O package.json Dockerfile docker-compose.yml Lixirian@192.168.1.240:/volume1/docker/htf/
scp -O -r scripts/ Lixirian@192.168.1.240:/volume1/docker/htf/scripts/
```

## Architecture

Application web self-hosted pour le jeu "Héros des Terres Fabuleuses" (Fabled Lands), déployée sur un NAS Synology via Docker.

### Stack

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion (SPA)
- **Backend** : Node.js/Express + TypeScript, sert aussi le frontend buildé en production
- **BDD** : SQLite via better-sqlite3 (fichier `/app/data/htf.db`)
- **Auth** : JWT (jsonwebtoken + bcryptjs)
- **Docker** : build multi-stage (node:20-alpine)

### Backend (packages/server/src/)

Le serveur Express écoute sur le port 46127 et expose des routes API sous `/api/` :

- `routes/auth.ts` — Register, Login JWT, Get current user
- `routes/characters.ts` — CRUD personnages (protégé par auth)
- `routes/books.ts` — Progression livres (codes visités, notes), logs de combat

**Middleware** : `middleware/auth.ts` (JWT Bearer)
**BDD** : `db/schema.ts` — Initialisation SQLite avec 4 tables (users, characters, book_progress, combat_log)

### Frontend (packages/client/src/)

SPA React avec react-router-dom v6. Routes protégées par `ProtectedRoute`.

- `hooks/useAuth.tsx` — Context d'auth global, token JWT dans localStorage
- `utils/api.ts` — Client API fetch centralisé avec auto-ajout token
- `utils/diceRoller.ts` — Lanceur de dés 2d6 et tests de compétence
- `utils/combatResolver.ts` — Moteur de combat (rounds, dégâts, équipement)
- `data/` — Données de jeu (professions, stats, prétirés, livres 1-6, équipement)

**Pages** : Accueil, Profil, Fiche personnage, Création personnage, Combat, Livres & Codes, Carte, Règles

**Design** : Thème fantasy médiéval (Tailwind custom), polices MedievalSharp + Crimson Text, animations Framer Motion

### Docker

- `docker-compose.yml` : 1 service (app)
- Port exposé : 46127
- Volume : `./data:/app/data` (persistance SQLite)
- `scripts/entrypoint.sh` lance le serveur Node.js

## GitHub

- Remote : `https://github.com/Lixirian/heros-des-terres-fabuleuses.git`
- Branche : `main`
