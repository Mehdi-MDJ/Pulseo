#!/bin/bash

# ==============================================================================
# NurseLink AI - Script de Configuration Dev
# ==============================================================================
#
# Script pour configurer l'environnement de développement
# Résout les problèmes de shell et de Node.js
# ==============================================================================

set -e

echo "🔧 Configuration de l'environnement de développement NurseLink AI"
echo "=================================================================="

# Vérifier le shell
echo "📋 Vérification du shell..."
CURRENT_SHELL=$(echo $SHELL)
echo "Shell actuel: $CURRENT_SHELL"

if [[ "$CURRENT_SHELL" != "/bin/zsh" ]]; then
    echo "⚠️  Attention: Le shell n'est pas zsh"
    echo "   Recommandé: chsh -s /bin/zsh"
fi

# Charger NVM
echo "📦 Chargement de NVM..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Vérifier Node.js
echo "🟢 Vérification de Node.js..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"

# Vérifier les dépendances
echo "📋 Vérification des dépendances..."

# Backend
echo "🔧 Configuration du backend..."
cd server
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    npm install
fi

# Générer le client Prisma
echo "🗄️  Génération du client Prisma..."
cd ..
npx prisma generate

# Frontend
echo "🎨 Configuration du frontend..."
cd client
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    npm install
fi

cd ..

echo "✅ Configuration terminée !"
echo ""
echo "🚀 Pour démarrer le serveur:"
echo "   cd server && npm run dev"
echo ""
echo "🎨 Pour démarrer le frontend:"
echo "   cd client && npm run dev"
echo ""
echo "🔍 Pour tester l'API:"
echo "   curl http://localhost:5001/health"
