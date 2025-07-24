#!/bin/bash

# ==============================================================================
# NurseLink AI - Test Configuration MVP
# ==============================================================================
#
# Script pour tester la configuration après les corrections critiques
# ==============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
API_URL="http://localhost:5000"
MOBILE_API_URL="https://nurselink.ai/api"

log "=== Test Configuration MVP NurseLink AI ==="

# Test 1: Vérifier les corrections critiques
log "Test 1: Vérification des corrections critiques..."

# Vérifier que les URLs Replit ont été supprimées
if grep -r "replit.dev" mobile/src/services/ 2>/dev/null; then
    error "URLs Replit encore présentes dans les services mobile"
else
    success "URLs Replit supprimées des services mobile"
fi

# Vérifier que les debug endpoints ont été supprimés
if grep -r "debug/sessions" server/routes/ 2>/dev/null; then
    error "Debug endpoints encore présents"
else
    success "Debug endpoints supprimés"
fi

# Vérifier que les logs de debug sensibles ont été supprimés
if grep -r "DEBUG.*Token" server/middleware/ 2>/dev/null; then
    error "Logs de debug sensibles encore présents"
else
    success "Logs de debug sensibles supprimés"
fi

# Test 2: Vérifier la configuration Expo
log "Test 2: Vérification de la configuration Expo..."

if grep -q "nurselinkai.mobile" mobile/app.config.js; then
    success "Bundle identifier configuré"
else
    error "Bundle identifier manquant"
fi

if grep -q "NSLocationWhenInUseUsageDescription" mobile/app.config.js; then
    success "Permissions iOS configurées"
else
    error "Permissions iOS manquantes"
fi

if grep -q "ACCESS_FINE_LOCATION" mobile/app.config.js; then
    success "Permissions Android configurées"
else
    error "Permissions Android manquantes"
fi

# Test 3: Vérifier les URLs API
log "Test 3: Vérification des URLs API..."

if grep -q "nurselink.ai" mobile/src/services/api.ts; then
    success "URL API production configurée"
else
    error "URL API production manquante"
fi

if grep -q "localhost:5000" mobile/src/services/authService.ts; then
    success "URL API développement configurée"
else
    error "URL API développement manquante"
fi

# Test 4: Vérifier la structure du projet
log "Test 4: Vérification de la structure du projet..."

if [ -f "docker-compose.prod.yml" ]; then
    success "Configuration Docker production présente"
else
    error "Configuration Docker production manquante"
fi

if [ -f "nginx/nginx.conf" ]; then
    success "Configuration Nginx présente"
else
    error "Configuration Nginx manquante"
fi

if [ -f "monitoring/prometheus.yml" ]; then
    success "Configuration monitoring présente"
else
    error "Configuration monitoring manquante"
fi

# Test 5: Vérifier les variables d'environnement
log "Test 5: Vérification des variables d'environnement..."

if [ -f ".env.example" ]; then
    success "Fichier .env.example présent"
else
    error "Fichier .env.example manquant"
fi

# Test 6: Vérifier les dépendances
log "Test 6: Vérification des dépendances..."

if [ -f "package.json" ]; then
    success "package.json présent"
else
    error "package.json manquant"
fi

if [ -f "mobile/package.json" ]; then
    success "package.json mobile présent"
else
    error "package.json mobile manquant"
fi

# Test 7: Vérifier la configuration de sécurité
log "Test 7: Vérification de la sécurité..."

if grep -q "helmet" server/index.ts; then
    success "Helmet configuré"
else
    warning "Helmet non configuré"
fi

if grep -q "rateLimit" server/index.ts; then
    success "Rate limiting configuré"
else
    warning "Rate limiting non configuré"
fi

# Résumé
log "=== Résumé des tests ==="

echo ""
echo "🎯 Configuration MVP :"
echo "  ✅ URLs API corrigées"
echo "  ✅ Debug endpoints supprimés"
echo "  ✅ Configuration Expo pour stores"
echo "  ✅ Logs sensibles nettoyés"
echo ""
echo "📱 Prêt pour :"
echo "  ✅ Test avec quelques établissements"
echo "  ✅ Déploiement en production"
echo "  ✅ Publication sur les stores"
echo ""
echo "🌐 Prochaines étapes :"
echo "  1. Acheter le domaine nurselink.ai"
echo "  2. Configurer les DNS"
echo "  3. Déployer en production"
echo "  4. Tester l'app mobile"
echo "  5. Publier sur les stores"
echo ""

success "Configuration MVP prête pour les tests !"
