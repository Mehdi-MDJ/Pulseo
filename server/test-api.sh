#!/bin/bash

# Script de test pour l'API NurseLink AI
# Usage: ./test-api.sh

BASE_URL="http://localhost:5001"

echo "🧪 Test de l'API NurseLink AI"
echo "================================"

# Test 1: Health check
echo "1. Test du health check..."
curl -s "$BASE_URL/health" | jq '.' || echo "❌ Health check échoué"

echo ""
echo "2. Test de l'authentification..."
# Test de connexion (sans données valides, juste pour tester l'endpoint)
curl -s -X POST "$BASE_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' | jq '.' || echo "❌ Signin échoué"

echo ""
echo "3. Test des routes d'établissements..."
curl -s "$BASE_URL/api/establishments/profile" | jq '.' || echo "❌ Route établissements échoué"

echo ""
echo "4. Test des notifications..."
curl -s "$BASE_URL/api/notifications" | jq '.' || echo "❌ Route notifications échoué"

echo ""
echo "✅ Tests terminés"
