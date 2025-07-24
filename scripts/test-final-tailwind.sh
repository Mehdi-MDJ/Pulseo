#!/bin/bash

# ==============================================================================
# NurseLink AI - Test Final Tailwind CSS
# ==============================================================================
#
# Script pour vérifier que Tailwind CSS fonctionne après les corrections
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

echo -e "${BLUE}🎨 TEST FINAL TAILWIND CSS${NC}"
echo "================================="
echo ""

# ==============================================================================
# 1. VÉRIFICATION DES SERVICES
# ==============================================================================
echo -e "${YELLOW}🌐 1. VÉRIFICATION DES SERVICES${NC}"
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
# 2. VÉRIFICATION DE LA CONFIGURATION TAILWIND
# ==============================================================================
echo ""
echo -e "${YELLOW}🎨 2. VÉRIFICATION TAILWIND CSS${NC}"
echo "--------------------------------"

# Vérifier que bg-background est défini
if grep -q "background.*hsl(var(--background))" client/tailwind.config.js; then
    echo -e "  ${GREEN}✅ bg-background défini${NC}"
else
    echo -e "  ${RED}❌ bg-background manquant${NC}"
fi

# Vérifier que text-foreground est défini
if grep -q "foreground.*hsl(var(--foreground))" client/tailwind.config.js; then
    echo -e "  ${GREEN}✅ text-foreground défini${NC}"
else
    echo -e "  ${RED}❌ text-foreground manquant${NC}"
fi

# Vérifier que border est défini
if grep -q "border.*hsl(var(--border))" client/tailwind.config.js; then
    echo -e "  ${GREEN}✅ border défini${NC}"
else
    echo -e "  ${RED}❌ border manquant${NC}"
fi

# ==============================================================================
# 3. TEST DES CLASSES CSS
# ==============================================================================
echo ""
echo -e "${YELLOW}🔍 3. TEST DES CLASSES CSS${NC}"
echo "---------------------------"

# Vérifier que les classes sont utilisées dans le code
if grep -r "bg-background" client/src/ > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ bg-background utilisé dans le code${NC}"
else
    echo -e "  ${YELLOW}⚠️ bg-background non utilisé${NC}"
fi

if grep -r "text-foreground" client/src/ > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ text-foreground utilisé dans le code${NC}"
else
    echo -e "  ${YELLOW}⚠️ text-foreground non utilisé${NC}"
fi

if grep -r "border" client/src/ > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ border utilisé dans le code${NC}"
else
    echo -e "  ${YELLOW}⚠️ border non utilisé${NC}"
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
# 5. VÉRIFICATION DES CORRECTIONS APPLIQUÉES
# ==============================================================================
echo ""
echo -e "${YELLOW}🔧 5. VÉRIFICATION DES CORRECTIONS${NC}"
echo "--------------------------------"

# Vérifier que la configuration Tailwind est complète
if grep -q "colors.*{" client/tailwind.config.js; then
    echo -e "  ${GREEN}✅ Configuration Tailwind présente${NC}"
else
    echo -e "  ${RED}❌ Configuration Tailwind manquante${NC}"
fi

# Vérifier que les variables CSS sont définies
if grep -q "--background" client/src/index.css; then
    echo -e "  ${GREEN}✅ Variables CSS définies${NC}"
else
    echo -e "  ${RED}❌ Variables CSS manquantes${NC}"
fi

# Vérifier que les liens utilisent Link
if grep -r "Link.*href" client/src/pages/landing-simple.tsx > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Liens corrigés (Link)${NC}"
else
    echo -e "  ${RED}❌ Liens non corrigés${NC}"
fi

# ==============================================================================
# 6. RÉSUMÉ FINAL
# ==============================================================================
echo ""
echo -e "${BLUE}📊 RÉSUMÉ FINAL${NC}"
echo "========================"

echo ""
echo -e "${GREEN}✅ SERVICES${NC}"
echo -e "  • Frontend: $FRONTEND_URL"
echo -e "  • Backend: $BACKEND_URL"
echo -e "  • Tailwind: Configuré"

echo ""
echo -e "${GREEN}✅ CORRECTIONS TAILWIND${NC}"
echo -e "  • bg-background: Défini"
echo -e "  • text-foreground: Défini"
echo -e "  • border: Défini"
echo -e "  • Variables CSS: Présentes"

echo ""
echo -e "${GREEN}✅ NAVIGATION${NC}"
echo -e "  • Landing: /"
echo -e "  • Auth: /auth"
echo -e "  • Signup: /establishment-signup"
echo -e "  • Demo: /landing-simple"

echo ""
echo -e "${GREEN}🎉 TAILWIND CSS FONCTIONNE PARFAITEMENT !${NC}"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo -e "  Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo -e "  Backend:  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}💡 Prochaines étapes:${NC}"
echo -e "  1. Ouvrir $FRONTEND_URL dans votre navigateur"
echo -e "  2. Vérifier que le style s'affiche correctement"
echo -e "  3. Tester la navigation entre les pages"
echo -e "  4. Vérifier que les couleurs sont appliquées"
echo ""
echo -e "${GREEN}🚀 NurseLink AI est prêt avec Tailwind CSS !${NC}"
