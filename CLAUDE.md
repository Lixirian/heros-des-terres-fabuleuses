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

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion (SPA + PWA)
- **Backend** : Node.js/Express + TypeScript, sert aussi le frontend buildé en production
- **BDD** : SQLite via better-sqlite3 (fichier `/app/data/htf.db`, mode WAL)
- **Auth** : JWT 7 jours (jsonwebtoken + bcryptjs)
- **Docker** : single-stage node:20-alpine (TS compilé localement, pas dans Docker)
- **Pas de tests ni de linting configurés** — TypeScript strict est le seul filet de sécurité

### Backend (packages/server/src/)

Le serveur Express écoute sur le port 46127 et expose des routes API sous `/api/` :

- `routes/auth.ts` — Register, Login JWT (`login` accepte username OU email), Get current user
- `routes/characters.ts` — CRUD personnages (protégé par auth), upload portrait via multer (2 Mo, JPEG/PNG/WebP)
- `routes/books.ts` — Progression livres (codes visités, notes), logs de combat (50 derniers)

**Middleware** : `middleware/auth.ts` — JWT Bearer, attache `req.userId` via interface `AuthRequest`
**BDD** : `db/schema.ts` — Init idempotente (`CREATE TABLE IF NOT EXISTS`) + migrations additives via `PRAGMA table_info`

#### Pièges importants du backend

- **Champs JSON en SQLite** : `blessings`, `titles`, `equipment`, `codewords`, `temp_bonuses` sont stockés comme strings JSON. Le serveur fait `JSON.stringify` à l'écriture. Le client reçoit des strings brutes et doit les parser. Côté serveur, il faut `JSON.parse` explicitement si besoin.
- **Upload portrait en 2 étapes** : `POST /characters/:id/portrait` upload le fichier et retourne l'URL, mais n'écrit PAS en BDD. Il faut ensuite faire `PUT /characters/:id` avec `{ portrait: url }`.
- **Toggle code livre** : `POST /books/:charId/:book/:code` — si le code existe et qu'un `notes` est fourni → update notes ; si pas de notes → supprime (dé-visite) ; si n'existe pas → insert.
- **Fichiers statiques** : `/uploads` sert depuis `path.dirname(DB_PATH)` (= `/app/data` en Docker). Les portraits sont dans `data/portraits/`.
- **PUT /characters/:id** : utilise deux listes (`fields` pour scalaires, `jsonFields` pour arrays/objects) pour construire dynamiquement le UPDATE SQL.

### Frontend (packages/client/src/)

SPA React avec react-router-dom v6. Routes protégées par `ProtectedRoute`. Alias `@` → `packages/client/src/`.

- `hooks/useAuth.tsx` — Context d'auth global, token JWT dans `localStorage` (clé `htf_token`)
- `utils/api.ts` — Client API fetch centralisé avec auto-ajout token (URL relative `/api`, fonctionne en dev et prod)
- `utils/diceRoller.ts` — Lanceur de dés 2d6 et tests de compétence
- `utils/combatResolver.ts` — Moteur de combat pur (pas d'effets de bord) : rounds, dégâts, bonus équipement/bénédictions, fuite
- `data/` — Données de jeu statiques en TS (professions, stats par rang, prétirés, livres 1-6, équipement 60+ items, mots de code Alkonost, dieux)

**Pages** : Accueil (liste persos), Profil, Fiche personnage, Création personnage, Combat, Livres & Codes, Carte, Règles

**Design** : Thème fantasy médiéval — couleurs custom Tailwind (`parchment-*`, `fantasy-*`), polices `font-medieval` (MedievalSharp) + `font-body` (Crimson Text), composants CSS custom (`.parchment-card`, `.fantasy-button`, `.stat-badge`, dés 3D CSS)

### Docker

- `docker-compose.yml` : 1 service (app), `restart: unless-stopped`
- Port exposé : 46127
- Volume : `./data:/app/data` (persistance SQLite + portraits uploadés)
- Le Dockerfile copie les `dist/` pré-compilés — le TypeScript n'est PAS compilé dans Docker

## GitHub

- Remote : `https://github.com/Lixirian/heros-des-terres-fabuleuses.git`
- Branche : `main`
