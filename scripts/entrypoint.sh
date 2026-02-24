#!/bin/bash
set -e

echo "=== Héros des Terres Fabuleuses - Démarrage ==="

# Créer le dossier data s'il n'existe pas
mkdir -p /app/data

echo "[1/1] Démarrage du serveur Node.js..."
exec node packages/server/dist/index.js
