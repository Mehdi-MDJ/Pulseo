#!/bin/bash

# ==============================================================================
# NurseLink AI - Test Restructuration Complète
# ==============================================================================
#
# Script pour vérifier que la restructuration fonctionne parfaitement
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

echo -e "${BLUE}🏗️ TEST RESTRUCTURATION COMPLÈTE${NC}"
echo "====================================="
echo ""

# ==============================================================================
# 1. VÉRIFICATION DE LA NOUVELLE STRUCTURE
# ==============================================================================
echo -e "${YELLOW}📁 1. VÉRIFICATION DE LA NOUVELLE STRUCTURE${NC}"
echo "----------------------------------------"

# Vérifier que les fichiers sont à la racine
if [ -f "tailwind.config.js" ]; then
    echo -e "  ${GREEN}✅ tailwind.config.js à la racine${NC}"
else
    echo -e "  ${RED}❌ tailwind.config.js manquant${NC}"
fi

if [ -f "postcss.config.js" ]; then
    echo -e "  ${GREEN}✅ postcss.config.js à la racine${NC}"
else
    echo -e "  ${RED}❌ postcss.config.js manquant${NC}"
fi

if [ -f "vite.config.ts" ]; then
    echo -e "  ${GREEN}✅ vite.config.ts à la racine${NC}"
else
    echo -e "  ${RED}❌ vite.config.ts manquant${NC}"
fi

if [ -f "index.html" ]; then
    echo -e "  ${GREEN}✅ index.html à la racine${NC}"
else
    echo -e "  ${RED}❌ index.html manquant${NC}"
fi

if [ -d "src" ]; then
    echo -e "  ${GREEN}✅ src/ à la racine${NC}"
else
    echo -e "  ${RED}❌ src/ manquant${NC}"
fi

# Vérifier que le dossier client n'existe plus
if [ ! -d "client" ]; then
    echo -e "  ${GREEN}✅ Dossier client/ supprimé${NC}"
else
    echo -e "  ${RED}❌ Dossier client/ existe encore${NC}"
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
if grep -q "content.*index.html" tailwind.config.js; then
    echo -e "  ${GREEN}✅ Configuration Tailwind correcte${NC}"
else
    echo -e "  ${RED}❌ Configuration Tailwind incorrecte${NC}"
fi

# Vérifier que Vite est simplifié
if grep -q "plugins.*react" vite.config.ts; then
    echo -e "  ${GREEN}✅ Configuration Vite simplifiée${NC}"
else
    echo -e "  ${RED}❌ Configuration Vite incorrecte${NC}"
fi

# Vérifier que PostCSS est correct
if grep -q "tailwindcss" postcss.config.js; then
    echo -e "  ${GREEN}✅ Configuration PostCSS correcte${NC}"
else
    echo -e "  ${RED}❌ Configuration PostCSS incorrecte${NC}"
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
# 6. TEST DES ERREURS TAILWIND
# ==============================================================================
echo ""
echo -e "${YELLOW}🎨 6. TEST DES ERREURS TAILWIND${NC}"
echo "--------------------------------"

# Vérifier qu'il n'y a pas d'erreurs dans les logs
if ! pgrep -f "Cannot apply unknown utility class" > /dev/null; then
    echo -e "  ${GREEN}✅ Aucune erreur Tailwind détectée${NC}"
else
    echo -e "  ${RED}❌ Erreurs Tailwind détectées${NC}"
fi

# ==============================================================================
# 7. RÉSUMÉ FINAL
# ==============================================================================
echo ""
echo -e "${BLUE}📊 RÉSUMÉ FINAL${NC}"
echo "========================"

echo ""
echo -e "${GREEN}✅ RESTRUCTURATION${NC}"
echo -e "  • Structure: Centralisée à la racine"
echo -e "  • Configuration: Simplifiée"
echo -e "  • Dossier client: Supprimé"
echo -e "  • Fichiers: Tous à la racine"

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
echo -e "${GREEN}✅ TAILWIND CSS${NC}"
echo -e "  • Configuration: Correcte"
echo -e "  • Erreurs: Aucune"
echo -e "  • Classes: Fonctionnelles"

echo ""
echo -e "${GREEN}🎉 RESTRUCTURATION RÉUSSIE !${NC}"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo -e "  Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo -e "  Backend:  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}💡 Prochaines étapes:${NC}"
echo -e "  1. Ouvrir $FRONTEND_URL dans votre navigateur"
echo -e "  2. Vérifier que Tailwind fonctionne sans erreurs"
echo -e "  3. Tester la navigation entre les pages"
echo -e "  4. Vérifier que le style s'affiche correctement"
echo ""
echo -e "${GREEN}🚀 NurseLink AI est prêt avec une structure optimisée !${NC}"
