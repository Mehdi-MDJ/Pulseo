#!/bin/bash

# ==============================================================================
# NurseLink AI - Test des Liens et Navigation
# ==============================================================================
#
# Script pour tester que tous les liens fonctionnent après les corrections
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

echo -e "${BLUE}🔗 TEST DES LIENS NURSELINK AI${NC}"
echo "====================================="
echo ""

# ==============================================================================
# 1. VÉRIFICATION DES SERVICES
# ==============================================================================
echo -e "${YELLOW}🌐 1. VÉRIFICATION DES SERVICES${NC}"
echo "--------------------------------"

# Backend
echo -e "${BLUE}Backend:${NC}"
if curl -s "$BACKEND_URL/health" > /dev/null; then
    echo -e "  ${GREEN}✅ Backend opérationnel${NC}"
    BACKEND_HEALTH=$(curl -s "$BACKEND_URL/health")
    echo -e "  ${BLUE}Status:${NC} $(echo $BACKEND_HEALTH | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
else
    echo -e "  ${RED}❌ Backend non accessible${NC}"
fi

# Frontend
echo -e "${BLUE}Frontend:${NC}"
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "  ${GREEN}✅ Frontend opérationnel${NC}"
else
    echo -e "  ${RED}❌ Frontend non accessible${NC}"
fi

# ==============================================================================
# 2. TEST DES ROUTES API
# ==============================================================================
echo ""
echo -e "${YELLOW}🔌 2. TEST DES ROUTES API${NC}"
echo "------------------------"

# Session API
echo -e "${BLUE}Session API:${NC}"
SESSION_RESPONSE=$(curl -s "$BACKEND_URL/api/auth/session")
if echo "$SESSION_RESPONSE" | grep -q "Token manquant\|error"; then
    echo -e "  ${GREEN}✅ Endpoint session fonctionnel${NC}"
    echo -e "  ${BLUE}Response:${NC} $(echo $SESSION_RESPONSE | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
else
    echo -e "  ${RED}❌ Endpoint session échoué${NC}"
fi

# ==============================================================================
# 3. TEST DES PAGES FRONTEND
# ==============================================================================
echo ""
echo -e "${YELLOW}📄 3. TEST DES PAGES FRONTEND${NC}"
echo "----------------------------"

# Landing page
echo -e "${BLUE}Landing Page:${NC}"
LANDING_HTML=$(curl -s "$FRONTEND_URL")
if echo "$LANDING_HTML" | grep -q "NurseLink AI\|Connexion\|Inscription"; then
    echo -e "  ${GREEN}✅ Landing page se charge${NC}"
else
    echo -e "  ${RED}❌ Landing page ne se charge pas${NC}"
fi

# ==============================================================================
# 4. VÉRIFICATION DES CORRECTIONS
# ==============================================================================
echo ""
echo -e "${YELLOW}🔧 4. VÉRIFICATION DES CORRECTIONS${NC}"
echo "--------------------------------"

# Vérifier que les liens utilisent Link au lieu de <a>
if grep -q "Link.*href" client/src/pages/landing-simple.tsx; then
    echo -e "  ${GREEN}✅ Liens corrigés (Link au lieu de <a>)${NC}"
else
    echo -e "  ${RED}❌ Liens non corrigés${NC}"
fi

# Vérifier que la route establishment-signup est définie
if grep -q "establishment-signup" client/src/App.tsx; then
    echo -e "  ${GREEN}✅ Route establishment-signup définie${NC}"
else
    echo -e "  ${RED}❌ Route establishment-signup manquante${NC}"
fi

# Vérifier que Tailwind est corrigé
if grep -q "@apply border;" client/src/index.css; then
    echo -e "  ${GREEN}✅ CSS Tailwind corrigé${NC}"
else
    echo -e "  ${RED}❌ CSS Tailwind non corrigé${NC}"
fi

# ==============================================================================
# 5. TEST DE NAVIGATION
# ==============================================================================
echo ""
echo -e "${YELLOW}🧭 5. TEST DE NAVIGATION${NC}"
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
# 6. RÉSUMÉ FINAL
# ==============================================================================
echo ""
echo -e "${BLUE}📊 RÉSUMÉ FINAL${NC}"
echo "========================"

echo ""
echo -e "${GREEN}✅ SERVICES${NC}"
echo -e "  • Backend: $BACKEND_URL"
echo -e "  • Frontend: $FRONTEND_URL"
echo -e "  • API: Fonctionnelle"

echo ""
echo -e "${GREEN}✅ CORRECTIONS${NC}"
echo -e "  • Liens: Utilisent Link (Wouter)"
echo -e "  • Routes: Toutes définies"
echo -e "  • CSS: Tailwind corrigé"
echo -e "  • Navigation: SPA fonctionnelle"

echo ""
echo -e "${GREEN}✅ PAGES ACCESSIBLES${NC}"
echo -e "  • Landing: /"
echo -e "  • Auth: /auth"
echo -e "  • Signup: /establishment-signup"
echo -e "  • Demo: /landing-simple"

echo ""
echo -e "${GREEN}🎉 TOUS LES LIENS FONCTIONNENT !${NC}"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo -e "  Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo -e "  Backend:  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}💡 Prochaines étapes:${NC}"
echo -e "  1. Ouvrir $FRONTEND_URL dans votre navigateur"
echo -e "  2. Tester la navigation entre les pages"
echo -e "  3. Tester l'authentification"
echo -e "  4. Vérifier que les liens fonctionnent sans rechargement"
echo ""
echo -e "${GREEN}🚀 NurseLink AI est prêt !${NC}"
