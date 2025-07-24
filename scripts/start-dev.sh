#!/bin/bash

# ==============================================================================
# NurseLink AI - Script de Démarrage Dev
# ==============================================================================
#
# Script optimisé pour démarrer l'environnement de développement
# ==============================================================================

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Démarrage de NurseLink AI${NC}"
echo "=================================="

# Charger NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Vérifier les processus existants
echo -e "${YELLOW}🔍 Vérification des processus existants...${NC}"
pkill -f "ts-node.*index-minimal" || true
pkill -f "vite" || true

# Démarrer le serveur backend
echo -e "${GREEN}🔧 Démarrage du serveur backend...${NC}"
cd server
PORT=5001 npx ts-node index-minimal.ts &
BACKEND_PID=$!
cd ..

# Attendre que le serveur démarre
echo -e "${YELLOW}⏳ Attente du démarrage du serveur...${NC}"
sleep 5

# Tester le serveur
echo -e "${BLUE}🧪 Test du serveur...${NC}"
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✅ Serveur backend opérationnel${NC}"
else
    echo -e "${RED}❌ Erreur: Serveur backend non accessible${NC}"
    exit 1
fi

# Démarrer le frontend
echo -e "${GREEN}🎨 Démarrage du frontend...${NC}"
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Environnement de développement démarré !${NC}"
echo ""
echo -e "${BLUE}📊 URLs:${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:5001${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Health:   ${GREEN}http://localhost:5001/health${NC}"
echo ""
echo -e "${YELLOW}🔧 Commandes utiles:${NC}"
echo -e "   Test API:     ${GREEN}curl http://localhost:5001/health${NC}"
echo -e "   Logs backend: ${GREEN}tail -f server/logs/app.log${NC}"
echo ""
echo -e "${YELLOW}⚠️  Pour arrêter: Ctrl+C${NC}"

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt des services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "ts-node.*index-minimal" || true
    pkill -f "vite" || true
    echo -e "${GREEN}✅ Services arrêtés${NC}"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre
echo -e "${BLUE}🔄 Services en cours d'exécution...${NC}"
wait
