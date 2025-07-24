#!/bin/bash

# ==============================================================================
# NurseLink AI - Démarrage Complet
# ==============================================================================
#
# Script pour démarrer le backend et le frontend
# ==============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration PATH pour Node.js
export PATH="/Users/medjoumehdi/.nvm/versions/node/v20.19.1/bin:$PATH"

echo -e "${BLUE}🚀 DÉMARRAGE COMPLET NURSELINK AI${NC}"
echo "====================================="
echo ""

# ==============================================================================
# 1. VÉRIFICATION DE L'ENVIRONNEMENT
# ==============================================================================
echo -e "${YELLOW}🔍 1. VÉRIFICATION DE L'ENVIRONNEMENT${NC}"
echo "----------------------------------------"

# Vérifier Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "  ${RED}❌ Node.js non trouvé${NC}"
    exit 1
fi

# Vérifier npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "  ${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "  ${RED}❌ npm non trouvé${NC}"
    exit 1
fi

# ==============================================================================
# 2. ARRÊTER LES PROCESSUS EXISTANTS
# ==============================================================================
echo ""
echo -e "${YELLOW}🛑 2. ARRÊT DES PROCESSUS EXISTANTS${NC}"
echo "----------------------------------------"

# Arrêter le backend
if lsof -ti:5001 > /dev/null 2>&1; then
    echo -e "  ${BLUE}Arrêt du backend sur le port 5001...${NC}"
    lsof -ti:5001 | xargs kill -9
    sleep 2
fi

# Arrêter le frontend
if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "  ${BLUE}Arrêt du frontend sur le port 5173...${NC}"
    lsof -ti:5173 | xargs kill -9
    sleep 2
fi

echo -e "  ${GREEN}✅ Processus arrêtés${NC}"

# ==============================================================================
# 3. DÉMARRAGE DU BACKEND
# ==============================================================================
echo ""
echo -e "${YELLOW}🔧 3. DÉMARRAGE DU BACKEND${NC}"
echo "------------------------------"

cd server

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo -e "  ${BLUE}Installation des dépendances backend...${NC}"
    npm install
fi

# Démarrer le backend
echo -e "  ${BLUE}Démarrage du backend...${NC}"
PORT=5001 npx ts-node index-minimal.ts &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo -e "  ${BLUE}Attente du démarrage du backend...${NC}"
sleep 5

# Vérifier que le backend fonctionne
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "  ${GREEN}✅ Backend démarré avec succès${NC}"
else
    echo -e "  ${RED}❌ Échec du démarrage du backend${NC}"
    exit 1
fi

cd ..

# ==============================================================================
# 4. DÉMARRAGE DU FRONTEND
# ==============================================================================
echo ""
echo -e "${YELLOW}🎨 4. DÉMARRAGE DU FRONTEND${NC}"
echo "-------------------------------"

cd client

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo -e "  ${BLUE}Installation des dépendances frontend...${NC}"
    npm install
fi

# Démarrer le frontend
echo -e "  ${BLUE}Démarrage du frontend...${NC}"
npm run dev &
FRONTEND_PID=$!

# Attendre que le frontend soit prêt
echo -e "  ${BLUE}Attente du démarrage du frontend...${NC}"
sleep 8

# Vérifier que le frontend fonctionne
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "  ${GREEN}✅ Frontend démarré avec succès${NC}"
else
    echo -e "  ${RED}❌ Échec du démarrage du frontend${NC}"
    exit 1
fi

cd ..

# ==============================================================================
# 5. VÉRIFICATION FINALE
# ==============================================================================
echo ""
echo -e "${YELLOW}✅ 5. VÉRIFICATION FINALE${NC}"
echo "------------------------"

# Test backend
BACKEND_HEALTH=$(curl -s http://localhost:5001/health)
if echo "$BACKEND_HEALTH" | grep -q "OK"; then
    echo -e "  ${GREEN}✅ Backend: Opérationnel${NC}"
else
    echo -e "  ${RED}❌ Backend: Problème détecté${NC}"
fi

# Test frontend
FRONTEND_HTML=$(curl -s http://localhost:5173)
if echo "$FRONTEND_HTML" | grep -q "NurseLink\|React\|Vite"; then
    echo -e "  ${GREEN}✅ Frontend: Opérationnel${NC}"
else
    echo -e "  ${RED}❌ Frontend: Problème détecté${NC}"
fi

# ==============================================================================
# 6. RÉSUMÉ FINAL
# ==============================================================================
echo ""
echo -e "${BLUE}🎉 DÉMARRAGE RÉUSSI !${NC}"
echo "========================"
echo ""
echo -e "${GREEN}✅ Backend: http://localhost:5001${NC}"
echo -e "${GREEN}✅ Frontend: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}📋 Commandes utiles:${NC}"
echo -e "  • Voir les logs: tail -f logs/app.log"
echo -e "  • Arrêter tout: pkill -f 'ts-node\|vite'"
echo -e "  • Redémarrer: ./scripts/start-all.sh"
echo ""
echo -e "${BLUE}🌐 Ouvrez votre navigateur sur:${NC}"
echo -e "  ${GREEN}http://localhost:5173${NC}"
echo ""

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt des services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services arrêtés${NC}"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

echo -e "${BLUE}💡 Appuyez sur Ctrl+C pour arrêter les services${NC}"
echo ""

# Attendre indéfiniment
wait
