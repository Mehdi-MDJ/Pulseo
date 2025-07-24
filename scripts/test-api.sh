#!/bin/bash

# ==============================================================================
# NurseLink AI - Tests API Complets
# ==============================================================================
#
# Script de test pour vérifier tous les endpoints de l'API
# ==============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:5001"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${BLUE}🧪 TESTS API COMPLETS - NURSELINK AI${NC}"
echo "=============================================="
echo ""

# Fonction de test
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local data=$4
    local description=$5

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -e "${YELLOW}Test: $description${NC}"
    echo -e "  $method $endpoint"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi

    http_code="${response: -3}"

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ PASS${NC} (Status: $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        if [ -f /tmp/response.json ]; then
            echo -e "  ${YELLOW}Response:${NC}"
            cat /tmp/response.json | head -3
        fi
    fi
    echo ""
}

# Vérifier que le serveur est en cours d'exécution
echo -e "${BLUE}🔍 Vérification du serveur...${NC}"
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Serveur non accessible sur $BASE_URL${NC}"
    echo -e "${YELLOW}💡 Démarrez le serveur avec: cd server && npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Serveur accessible${NC}"
echo ""

# ==============================================================================
# TESTS DE BASE
# ==============================================================================
echo -e "${BLUE}📋 TESTS DE BASE${NC}"
echo "----------------------"

test_endpoint "GET" "/health" "200" "" "Health check"
test_endpoint "GET" "/api/test" "200" "" "Test endpoint"

# ==============================================================================
# TESTS D'AUTHENTIFICATION
# ==============================================================================
echo -e "${BLUE}🔐 TESTS D'AUTHENTIFICATION${NC}"
echo "----------------------------"

# Test de connexion sans données
test_endpoint "POST" "/api/auth/signin" "400" "" "Signin sans données"

# Test de connexion avec données invalides
test_endpoint "POST" "/api/auth/signin" "401" '{"email":"invalid@test.com","password":"wrong"}' "Signin avec données invalides"

# Test de connexion avec données valides (simulation)
test_endpoint "POST" "/api/auth/signin" "200" '{"email":"test@example.com","password":"password"}' "Signin avec données valides"

# Test de session sans token
test_endpoint "GET" "/api/auth/session" "401" "" "Session sans token"

# ==============================================================================
# TESTS DES MISSIONS
# ==============================================================================
echo -e "${BLUE}📋 TESTS DES MISSIONS${NC}"
echo "----------------------"

test_endpoint "GET" "/api/missions" "200" "" "Récupération des missions"

# Test de création de mission sans authentification
test_endpoint "POST" "/api/missions" "401" '{"title":"Test Mission"}' "Création mission sans auth"

# ==============================================================================
# TESTS DES NOTIFICATIONS
# ==============================================================================
echo -e "${BLUE}🔔 TESTS DES NOTIFICATIONS${NC}"
echo "---------------------------"

test_endpoint "GET" "/api/notifications" "200" "" "Récupération des notifications"

# ==============================================================================
# TESTS DE PERFORMANCE
# ==============================================================================
echo -e "${BLUE}⚡ TESTS DE PERFORMANCE${NC}"
echo "------------------------"

echo -e "${YELLOW}Test de latence...${NC}"
start_time=$(date +%s%N)
curl -s "$BASE_URL/health" > /dev/null
end_time=$(date +%s%N)
latency=$(( (end_time - start_time) / 1000000 ))
echo -e "  Latence: ${GREEN}${latency}ms${NC}"

# ==============================================================================
# RÉSUMÉ DES TESTS
# ==============================================================================
echo ""
echo -e "${BLUE}📊 RÉSUMÉ DES TESTS${NC}"
echo "========================"
echo -e "  ${GREEN}✅ Tests réussis: $PASSED_TESTS${NC}"
echo -e "  ${RED}❌ Tests échoués: $FAILED_TESTS${NC}"
echo -e "  📊 Total: $TOTAL_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS !${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $FAILED_TESTS TESTS ONT ÉCHOUÉ${NC}"
    exit 1
fi
