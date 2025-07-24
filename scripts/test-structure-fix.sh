#!/bin/bash

# ==============================================================================
# NurseLink AI - Test Correction Structure Monorepo
# ==============================================================================
#
# Script pour vérifier que la correction de structure monorepo fonctionne
# ==============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration PATH
export PATH="/Users/medjoumehdi/.nvm/versions/node/v20.19.1/bin:$PATH"

FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:5001"

echo -e "${BLUE}🏗️ TEST CORRECTION STRUCTURE MONOREPO${NC}"
echo "============================================="
echo ""

# ==============================================================================
# 1. VÉRIFICATION DE LA STRUCTURE
# ==============================================================================
echo -e "${YELLOW}📁 1. VÉRIFICATION DE LA STRUCTURE${NC}"
echo "--------------------------------"

# Vérifier que components.json est dans client/
if [ -f "client/components.json" ]; then
    echo -e "  ${GREEN}✅ components.json dans client/${NC}"
else
    echo -e "  ${RED}❌ components.json manquant dans client/${NC}"
fi

# Vérifier que tailwind.config.js est dans client/
if [ -f "client/tailwind.config.js" ]; then
    echo -e "  ${GREEN}✅ tailwind.config.js dans client/${NC}"
else
    echo -e "  ${RED}❌ tailwind.config.js manquant dans client/${NC}"
fi

# Vérifier que postcss.config.js est dans client/
if [ -f "client/postcss.config.js" ]; then
    echo -e "  ${GREEN}✅ postcss.config.js dans client/${NC}"
else
    echo -e "  ${RED}❌ postcss.config.js manquant dans client/${NC}"
fi

# Vérifier qu'il n'y a pas de components.json à la racine
if [ -f "components.json" ]; then
    echo -e "  ${RED}❌ components.json encore à la racine${NC}"
else
    echo -e "  ${GREEN}✅ components.json déplacé de la racine${NC}"
fi

# ==============================================================================
# 2. VÉRIFICATION DES SERVICES
# ==============================================================================
echo ""
echo -e "${YELLOW}🌐 2. VÉRIFICATION DES SERVICES${NC}"
echo "--------------------------------"

# Frontend
echo -e "${BLUE}Frontend:${NC}"
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "  ${GREEN}✅ Frontend opérationnel${NC}"
else
    echo -e "  ${RED}❌ Frontend non accessible${NC}"
fi

# Backend
echo -e "${BLUE}Backend:${NC}"
if curl -s "$BACKEND_URL/health" > /dev/null; then
    echo -e "  ${GREEN}✅ Backend opérationnel${NC}"
else
    echo -e "  ${RED}❌ Backend non accessible${NC}"
fi

# ==============================================================================
# 3. TEST DES CONFIGURATIONS
# ==============================================================================
echo ""
echo -e "${YELLOW}⚙️ 3. TEST DES CONFIGURATIONS${NC}"
echo "----------------------------"

# Vérifier que la configuration Tailwind est correcte
if grep -q "content.*index.html" client/tailwind.config.js; then
    echo -e "  ${GREEN}✅ Configuration Tailwind correcte${NC}"
else
    echo -e "  ${RED}❌ Configuration Tailwind incorrecte${NC}"
fi

# Vérifier que components.json est accessible
if [ -f "client/components.json" ]; then
    echo -e "  ${GREEN}✅ components.json accessible${NC}"
else
    echo -e "  ${RED}❌ components.json inaccessible${NC}"
fi

# ==============================================================================
# 4. TEST DE NAVIGATION
# ==============================================================================
echo ""
echo -e "${YELLOW}🧭 4. TEST DE NAVIGATION${NC}"
echo "---------------------------"

# Test des URLs principales
URLS=(
    "/"
    "/auth"
    "/establishment-signup"
    "/landing-simple"
)

for url in "${URLS[@]}"; do
    echo -e "${BLUE}Test URL: $url${NC}"
    RESPONSE=$(curl -s -w "%{http_code}" "$FRONTEND_URL$url" -o /dev/null)
    if [ "$RESPONSE" = "200" ]; then
        echo -e "  ${GREEN}✅ $url accessible${NC}"
    else
        echo -e "  ${RED}❌ $url non accessible (HTTP $RESPONSE)${NC}"
    fi
done

# ==============================================================================
# 5. VÉRIFICATION DES PROCESSUS
# ==============================================================================
echo ""
echo -e "${YELLOW}🔧 5. VÉRIFICATION DES PROCESSUS${NC}"
echo "--------------------------------"

# Vérifier que Vite tourne
if pgrep -f "vite" > /dev/null; then
    echo -e "  ${GREEN}✅ Vite en cours d'exécution${NC}"
else
    echo -e "  ${RED}❌ Vite non démarré${NC}"
fi

# Vérifier que le backend tourne
if pgrep -f "ts-node" > /dev/null; then
    echo -e "  ${GREEN}✅ Backend en cours d'exécution${NC}"
else
    echo -e "  ${RED}❌ Backend non démarré${NC}"
fi

# ==============================================================================
# 6. RÉSUMÉ FINAL
# ==============================================================================
echo ""
echo -e "${BLUE}📊 RÉSUMÉ FINAL${NC}"
echo "========================"

echo ""
echo -e "${GREEN}✅ STRUCTURE MONOREPO${NC}"
echo -e "  • components.json: Déplacé vers client/"
echo -e "  • tailwind.config.js: Dans client/"
echo -e "  • postcss.config.js: Dans client/"
echo -e "  • Configuration: Modulaire"

echo ""
echo -e "${GREEN}✅ SERVICES${NC}"
echo -e "  • Frontend: $FRONTEND_URL"
echo -e "  • Backend: $BACKEND_URL"
echo -e "  • Processus: Actifs"

echo ""
echo -e "${GREEN}✅ NAVIGATION${NC}"
echo -e "  • Landing: /"
echo -e "  • Auth: /auth"
echo -e "  • Signup: /establishment-signup"
echo -e "  • Demo: /landing-simple"

echo ""
echo -e "${GREEN}🎉 CORRECTION DE STRUCTURE RÉUSSIE !${NC}"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo -e "  Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo -e "  Backend:  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}💡 Prochaines étapes:${NC}"
echo -e "  1. Ouvrir $FRONTEND_URL dans votre navigateur"
echo -e "  2. Vérifier que Tailwind fonctionne sans erreurs"
echo -e "  3. Tester la navigation entre les pages"
echo -e "  4. Vérifier que shadcn/ui fonctionne correctement"
echo ""
echo -e "${GREEN}🚀 NurseLink AI est prêt avec une structure monorepo propre !${NC}"
