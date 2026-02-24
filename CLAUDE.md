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
- **Docker** : le binaire est à `/usr/local/bin/docker` et `/usr/local/bin/docker-compose` (pas dans le PATH par défaut)
- **Port** : 46127

### Workflow de déploiement

1. Modifier le code localement
2. `npm run build` dans le root (compile server + client)
3. Copier les fichiers vers le NAS (voir section ci-dessous)
4. Rebuild Docker sur le NAS
5. Commit + push sur GitHub (`origin main`)

### Copie vers le NAS — IMPORTANT

Le Dockerfile copie les dossiers `dist/` pré-compilés (pas les sources TS). Il faut donc copier :
- Les **fichiers de config** (package.json, Dockerfile, docker-compose.yml)
- Les **dist compilés** (packages/server/dist/ et packages/client/dist/)

**Pièges à éviter :**
- `scp -O -r packages/client/dist/` vers un dossier `dist/` existant crée un sous-dossier `dist/dist/`. Il faut d'abord **supprimer le contenu distant** puis copier.
- `scp -O -r packages/` ne garantit pas l'écrasement des fichiers existants (notamment package.json). Toujours copier les fichiers critiques **individuellement**.
- Si `packages/server/package.json` a changé (nouvelle dépendance), le layer Docker `npm install` est en cache avec l'ancien. Il faut un `docker-compose build --no-cache`.

### Commandes de déploiement

```bash
# 1. Build local
npm run build

# 2. Nettoyer les anciens dist sur le NAS
ssh Lixirian@192.168.1.240 "rm -rf /volume1/docker/htf/packages/server/dist /volume1/docker/htf/packages/client/dist"

# 3. Copier les dist compilés
scp -O -r packages/server/dist Lixirian@192.168.1.240:/volume1/docker/htf/packages/server/dist
scp -O -r packages/client/dist Lixirian@192.168.1.240:/volume1/docker/htf/packages/client/dist

# 4. Copier les fichiers de config (toujours, au cas où ils ont changé)
scp -O packages/server/package.json Lixirian@192.168.1.240:/volume1/docker/htf/packages/server/package.json
scp -O package.json Dockerfile docker-compose.yml Lixirian@192.168.1.240:/volume1/docker/htf/

# 5. Rebuild Docker
# - Si package.json serveur a changé (nouvelle dépendance) :
ssh Lixirian@192.168.1.240 "cd /volume1/docker/htf && /usr/local/bin/docker-compose build --no-cache && /usr/local/bin/docker-compose up -d"
# - Sinon (juste du code) :
ssh Lixirian@192.168.1.240 "cd /volume1/docker/htf && /usr/local/bin/docker-compose up --build -d"

# 6. Vérifier que le container tourne
ssh Lixirian@192.168.1.240 "/usr/local/bin/docker logs htf-app-1 --tail 3"
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
