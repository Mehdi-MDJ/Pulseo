#!/bin/bash

# ==============================================================================
# NurseLink AI - Audit DevOps Complet
# ==============================================================================
#
# Script d'audit pour analyser l'état du projet
# ==============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 AUDIT DEVOPS COMPLET - NURSELINK AI${NC}"
echo "================================================"
echo ""

# ==============================================================================
# 1. AUDIT ENVIRONNEMENT
# ==============================================================================
echo -e "${YELLOW}📋 1. AUDIT ENVIRONNEMENT${NC}"
echo "----------------------------------------"

echo -e "Shell: ${GREEN}$SHELL${NC}"
echo -e "Node.js: ${GREEN}$(node --version 2>/dev/null || echo 'Non installé')${NC}"
echo -e "npm: ${GREEN}$(npm --version 2>/dev/null || echo 'Non installé')${NC}"
echo -e "Git: ${GREEN}$(git --version 2>/dev/null || echo 'Non installé')${NC}"

# ==============================================================================
# 2. AUDIT DÉPENDANCES
# ==============================================================================
echo ""
echo -e "${YELLOW}📦 2. AUDIT DÉPENDANCES${NC}"
echo "----------------------------------------"

# Backend
echo -e "${BLUE}Backend:${NC}"
if [ -f "server/package.json" ]; then
    echo -e "  ✅ package.json trouvé"
    cd server
    if [ -d "node_modules" ]; then
        echo -e "  ✅ node_modules installé"
        echo -e "  📊 Dépendances: $(npm list --depth=0 | wc -l) packages"
    else
        echo -e "  ${RED}❌ node_modules manquant${NC}"
    fi
    cd ..
else
    echo -e "  ${RED}❌ package.json manquant${NC}"
fi

# Frontend
echo -e "${BLUE}Frontend:${NC}"
if [ -f "client/package.json" ]; then
    echo -e "  ✅ package.json trouvé"
    cd client
    if [ -d "node_modules" ]; then
        echo -e "  ✅ node_modules installé"
        echo -e "  📊 Dépendances: $(npm list --depth=0 | wc -l) packages"
    else
        echo -e "  ${RED}❌ node_modules manquant${NC}"
    fi
    cd ..
else
    echo -e "  ${RED}❌ package.json manquant${NC}"
fi

# ==============================================================================
# 3. AUDIT BASE DE DONNÉES
# ==============================================================================
echo ""
echo -e "${YELLOW}🗄️  3. AUDIT BASE DE DONNÉES${NC}"
echo "----------------------------------------"

if [ -f "prisma/schema.prisma" ]; then
    echo -e "  ✅ Schema Prisma trouvé"

    # Vérifier le client généré
    if [ -d "generated/prisma" ]; then
        echo -e "  ✅ Client Prisma généré"
    else
        echo -e "  ${RED}❌ Client Prisma non généré${NC}"
    fi

    # Vérifier les migrations
    if [ -d "migrations" ]; then
        echo -e "  ✅ Dossier migrations trouvé"
        echo -e "  📊 Migrations: $(ls migrations/*.sql 2>/dev/null | wc -l) fichiers"
    else
        echo -e "  ${YELLOW}⚠️  Dossier migrations manquant${NC}"
    fi
else
    echo -e "  ${RED}❌ Schema Prisma manquant${NC}"
fi

# ==============================================================================
# 4. AUDIT CODE
# ==============================================================================
echo ""
echo -e "${YELLOW}💻 4. AUDIT CODE${NC}"
echo "----------------------------------------"

# Backend
echo -e "${BLUE}Backend:${NC}"
if [ -f "server/index-minimal.ts" ]; then
    echo -e "  ✅ Serveur minimal trouvé"
    echo -e "  📊 Routes: $(grep -c "router\." server/routes/*.ts 2>/dev/null || echo '0')"
else
    echo -e "  ${RED}❌ Serveur minimal manquant${NC}"
fi

# Frontend
echo -e "${BLUE}Frontend:${NC}"
if [ -f "client/src/App.tsx" ]; then
    echo -e "  ✅ App.tsx trouvé"
    echo -e "  📊 Pages: $(ls client/src/pages/*.tsx 2>/dev/null | wc -l) fichiers"
else
    echo -e "  ${RED}❌ App.tsx manquant${NC}"
fi

# ==============================================================================
# 5. AUDIT SÉCURITÉ
# ==============================================================================
echo ""
echo -e "${YELLOW}🔒 5. AUDIT SÉCURITÉ${NC}"
echo "----------------------------------------"

# Variables d'environnement
if [ -f ".env" ]; then
    echo -e "  ✅ Fichier .env trouvé"
    ENV_VARS=$(grep -c "=" .env 2>/dev/null || echo "0")
    echo -e "  📊 Variables: $ENV_VARS"
else
    echo -e "  ${YELLOW}⚠️  Fichier .env manquant${NC}"
fi

# Secrets dans le code
SECRETS=$(grep -r "password\|secret\|key" server/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "TODO\|FIXME" | wc -l)
if [ "$SECRETS" -gt 0 ]; then
    echo -e "  ${RED}⚠️  $SECRETS secrets potentiels dans le code${NC}"
else
    echo -e "  ✅ Aucun secret détecté dans le code"
fi

# ==============================================================================
# 6. AUDIT PERFORMANCE
# ==============================================================================
echo ""
echo -e "${YELLOW}⚡ 6. AUDIT PERFORMANCE${NC}"
echo "----------------------------------------"

# Taille des node_modules
BACKEND_SIZE=$(du -sh server/node_modules 2>/dev/null | cut -f1 || echo "N/A")
FRONTEND_SIZE=$(du -sh client/node_modules 2>/dev/null | cut -f1 || echo "N/A")
echo -e "  📦 Backend node_modules: $BACKEND_SIZE"
echo -e "  📦 Frontend node_modules: $FRONTEND_SIZE"

# ==============================================================================
# 7. AUDIT DÉPLOIEMENT
# ==============================================================================
echo ""
echo -e "${YELLOW}🚀 7. AUDIT DÉPLOIEMENT${NC}"
echo "----------------------------------------"

if [ -f "Dockerfile" ]; then
    echo -e "  ✅ Dockerfile trouvé"
else
    echo -e "  ${YELLOW}⚠️  Dockerfile manquant${NC}"
fi

if [ -f "docker-compose.yml" ]; then
    echo -e "  ✅ docker-compose.yml trouvé"
else
    echo -e "  ${YELLOW}⚠️  docker-compose.yml manquant${NC}"
fi

# ==============================================================================
# 8. RÉSUMÉ ET RECOMMANDATIONS
# ==============================================================================
echo ""
echo -e "${BLUE}📊 RÉSUMÉ DE L'AUDIT${NC}"
echo "----------------------------------------"

# Compter les erreurs
ERRORS=0
WARNINGS=0

# Vérifications critiques
if [ ! -f "server/package.json" ]; then ((ERRORS++)); fi
if [ ! -f "client/package.json" ]; then ((ERRORS++)); fi
if [ ! -f "prisma/schema.prisma" ]; then ((ERRORS++)); fi
if [ ! -d "generated/prisma" ]; then ((WARNINGS++)); fi
if [ ! -f ".env" ]; then ((WARNINGS++)); fi

echo -e "  ${RED}❌ Erreurs critiques: $ERRORS${NC}"
echo -e "  ${YELLOW}⚠️  Avertissements: $WARNINGS${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Projet prêt pour le développement${NC}"
else
    echo -e "${RED}❌ Projet nécessite des corrections${NC}"
fi

echo ""
echo -e "${BLUE}🎯 RECOMMANDATIONS${NC}"
echo "----------------------------------------"

if [ ! -d "generated/prisma" ]; then
    echo -e "  🔧 Générer le client Prisma: npx prisma generate"
fi

if [ ! -f ".env" ]; then
    echo -e "  🔧 Créer le fichier .env: cp env.example .env"
fi

if [ ! -d "server/node_modules" ]; then
    echo -e "  📦 Installer les dépendances backend: cd server && npm install"
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "  📦 Installer les dépendances frontend: cd client && npm install"
fi

echo ""
echo -e "${GREEN}✅ Audit terminé${NC}"
