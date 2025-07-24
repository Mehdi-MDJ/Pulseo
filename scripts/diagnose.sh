#!/bin/bash

# ==============================================================================
# NurseLink AI - Diagnostic Environnement
# ==============================================================================
#
# Script pour diagnostiquer les problèmes d'environnement
# ==============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 DIAGNOSTIC ENVIRONNEMENT NURSELINK AI${NC}"
echo "============================================="
echo ""

# ==============================================================================
# 1. VÉRIFICATION DU SHELL
# ==============================================================================
echo -e "${YELLOW}🐚 1. VÉRIFICATION DU SHELL${NC}"
echo "------------------------------"

echo -e "  ${BLUE}Shell actuel:${NC} $SHELL"
echo -e "  ${BLUE}Processus parent:${NC} $(ps -p $PPID -o comm=)"

if [[ "$SHELL" == *"zsh"* ]]; then
    echo -e "  ${GREEN}✅ Shell Zsh détecté${NC}"
else
    echo -e "  ${YELLOW}⚠️  Shell différent de Zsh${NC}"
fi

# ==============================================================================
# 2. VÉRIFICATION DE NVM
# ==============================================================================
echo ""
echo -e "${YELLOW}📦 2. VÉRIFICATION DE NVM${NC}"
echo "------------------------------"

if [ -d "$HOME/.nvm" ]; then
    echo -e "  ${GREEN}✅ NVM installé${NC}"

    # Charger NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    if command -v nvm &> /dev/null; then
        echo -e "  ${GREEN}✅ NVM chargé${NC}"
        echo -e "  ${BLUE}Version NVM:${NC} $(nvm --version)"
        echo -e "  ${BLUE}Node actuel:${NC} $(nvm current)"
    else
        echo -e "  ${RED}❌ NVM non chargé${NC}"
    fi
else
    echo -e "  ${RED}❌ NVM non installé${NC}"
fi

# ==============================================================================
# 3. VÉRIFICATION DE NODE.JS
# ==============================================================================
echo ""
echo -e "${YELLOW}🟢 3. VÉRIFICATION DE NODE.JS${NC}"
echo "-------------------------------"

# Essayer différents chemins
NODE_PATHS=(
    "/Users/medjoumehdi/.nvm/versions/node/v20.19.1/bin/node"
    "/usr/local/bin/node"
    "/opt/homebrew/bin/node"
    "$(which node 2>/dev/null)"
)

NODE_FOUND=false
for path in "${NODE_PATHS[@]}"; do
    if [ -x "$path" ]; then
        echo -e "  ${GREEN}✅ Node.js trouvé: $path${NC}"
        echo -e "  ${BLUE}Version:${NC} $($path --version)"
        export PATH="$(dirname $path):$PATH"
        NODE_FOUND=true
        break
    fi
done

if [ "$NODE_FOUND" = false ]; then
    echo -e "  ${RED}❌ Node.js non trouvé${NC}"
    echo -e "  ${YELLOW}💡 Solutions:${NC}"
    echo -e "    • Installer NVM: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo -e "    • Installer Node.js: nvm install 20"
fi

# ==============================================================================
# 4. VÉRIFICATION DE NPM
# ==============================================================================
echo ""
echo -e "${YELLOW}📦 4. VÉRIFICATION DE NPM${NC}"
echo "------------------------------"

if command -v npm &> /dev/null; then
    echo -e "  ${GREEN}✅ npm trouvé${NC}"
    echo -e "  ${BLUE}Version:${NC} $(npm --version)"
else
    echo -e "  ${RED}❌ npm non trouvé${NC}"
    echo -e "  ${YELLOW}💡 Solution:${NC} Réinstaller Node.js avec NVM"
fi

# ==============================================================================
# 5. VÉRIFICATION DES DÉPENDANCES
# ==============================================================================
echo ""
echo -e "${YELLOW}📚 5. VÉRIFICATION DES DÉPENDANCES${NC}"
echo "--------------------------------"

# Backend
echo -e "${BLUE}Backend:${NC}"
if [ -d "server/node_modules" ]; then
    echo -e "  ${GREEN}✅ node_modules présent${NC}"
else
    echo -e "  ${RED}❌ node_modules manquant${NC}"
    echo -e "  ${YELLOW}💡 Solution:${NC} cd server && npm install"
fi

# Frontend
echo -e "${BLUE}Frontend:${NC}"
if [ -d "client/node_modules" ]; then
    echo -e "  ${GREEN}✅ node_modules présent${NC}"
else
    echo -e "  ${RED}❌ node_modules manquant${NC}"
    echo -e "  ${YELLOW}💡 Solution:${NC} cd client && npm install"
fi

# ==============================================================================
# 6. VÉRIFICATION DES PORTS
# ==============================================================================
echo ""
echo -e "${YELLOW}🔌 6. VÉRIFICATION DES PORTS${NC}"
echo "------------------------------"

# Port 5001 (Backend)
if lsof -ti:5001 > /dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠️  Port 5001 utilisé par:${NC}"
    lsof -ti:5001 | xargs ps -p
else
    echo -e "  ${GREEN}✅ Port 5001 libre${NC}"
fi

# Port 5173 (Frontend)
if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠️  Port 5173 utilisé par:${NC}"
    lsof -ti:5173 | xargs ps -p
else
    echo -e "  ${GREEN}✅ Port 5173 libre${NC}"
fi

# ==============================================================================
# 7. VÉRIFICATION DES FICHIERS CRITIQUES
# ==============================================================================
echo ""
echo -e "${YELLOW}📁 7. VÉRIFICATION DES FICHIERS CRITIQUES${NC}"
echo "----------------------------------------"

CRITICAL_FILES=(
    "server/index-minimal.ts"
    "server/package.json"
    "client/package.json"
    "client/src/App.tsx"
    "client/src/hooks/useAuth.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅ $file${NC}"
    else
        echo -e "  ${RED}❌ $file manquant${NC}"
    fi
done

# ==============================================================================
# 8. TEST DE COMMANDES
# ==============================================================================
echo ""
echo -e "${YELLOW}🧪 8. TEST DE COMMANDES${NC}"
echo "------------------------"

# Test ts-node
if command -v npx &> /dev/null; then
    echo -e "  ${GREEN}✅ npx disponible${NC}"
else
    echo -e "  ${RED}❌ npx non disponible${NC}"
fi

# Test vite
cd client
if npm run dev --dry-run > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ npm run dev fonctionne${NC}"
else
    echo -e "  ${RED}❌ npm run dev échoue${NC}"
fi
cd ..

# ==============================================================================
# 9. RÉSUMÉ ET RECOMMANDATIONS
# ==============================================================================
echo ""
echo -e "${BLUE}📊 RÉSUMÉ DU DIAGNOSTIC${NC}"
echo "================================"

echo ""
echo -e "${YELLOW}💡 RECOMMANDATIONS:${NC}"
echo ""

if ! command -v node &> /dev/null; then
    echo -e "  ${RED}🔧 1. Installer Node.js:${NC}"
    echo -e "     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo -e "     source ~/.zshrc"
    echo -e "     nvm install 20"
    echo -e "     nvm use 20"
fi

if [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo -e "  ${RED}📦 2. Installer les dépendances:${NC}"
    echo -e "     cd server && npm install"
    echo -e "     cd client && npm install"
fi

if lsof -ti:5001 > /dev/null 2>&1 || lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "  ${RED}🔌 3. Libérer les ports:${NC}"
    echo -e "     lsof -ti:5001 | xargs kill -9"
    echo -e "     lsof -ti:5173 | xargs kill -9"
fi

echo ""
echo -e "  ${GREEN}🚀 4. Démarrer l'application:${NC}"
echo -e "     ./scripts/start-all.sh"
echo ""

echo -e "${GREEN}✅ Diagnostic terminé !${NC}"
