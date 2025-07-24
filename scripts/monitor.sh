#!/bin/bash

# ==============================================================================
# NurseLink AI - Script de Monitoring
# ==============================================================================
#
# Script de monitoring pour surveiller l'application
# ==============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:5173"
LOG_FILE="logs/monitor.log"

# Créer le dossier de logs
mkdir -p logs

echo -e "${BLUE}📊 MONITORING NURSELINK AI${NC}"
echo "================================"
echo ""

# Fonction de log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Fonction de vérification d'endpoint
check_endpoint() {
    local url=$1
    local name=$2

    if curl -s "$url" > /dev/null; then
        echo -e "  ${GREEN}✅ $name${NC}"
        log "SUCCESS: $name accessible"
        return 0
    else
        echo -e "  ${RED}❌ $name${NC}"
        log "ERROR: $name inaccessible"
        return 1
    fi
}

# Fonction de vérification de processus
check_process() {
    local process=$1
    local name=$2

    if pgrep -f "$process" > /dev/null; then
        echo -e "  ${GREEN}✅ $name${NC}"
        log "SUCCESS: $name en cours d'exécution"
        return 0
    else
        echo -e "  ${RED}❌ $name${NC}"
        log "ERROR: $name arrêté"
        return 1
    fi
}

# Fonction de vérification de port
check_port() {
    local port=$1
    local name=$2

    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $name (port $port)${NC}"
        log "SUCCESS: Port $port ouvert"
        return 0
    else
        echo -e "  ${RED}❌ $name (port $port)${NC}"
        log "ERROR: Port $port fermé"
        return 1
    fi
}

# ==============================================================================
# MONITORING SYSTÈME
# ==============================================================================
echo -e "${YELLOW}🖥️  MONITORING SYSTÈME${NC}"
echo "------------------------"

# CPU et mémoire
CPU_USAGE=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
MEMORY_USAGE=$(top -l 1 | grep "PhysMem" | awk '{print $2}' | sed 's/[^0-9]//g')

echo -e "  📊 CPU: ${CPU_USAGE}%"
echo -e "  📊 Mémoire: ${MEMORY_USAGE}MB"

if [ "$CPU_USAGE" -gt 80 ]; then
    echo -e "  ${RED}⚠️  CPU élevé${NC}"
    log "WARNING: CPU usage élevé: ${CPU_USAGE}%"
fi

# ==============================================================================
# MONITORING PROCESSUS
# ==============================================================================
echo ""
echo -e "${YELLOW}🔧 MONITORING PROCESSUS${NC}"
echo "------------------------"

BACKEND_OK=0
FRONTEND_OK=0

check_process "ts-node.*index-minimal" "Backend (ts-node)" || BACKEND_OK=1
check_process "vite" "Frontend (vite)" || FRONTEND_OK=1

# ==============================================================================
# MONITORING PORTS
# ==============================================================================
echo ""
echo -e "${YELLOW}🔌 MONITORING PORTS${NC}"
echo "---------------------"

check_port "5001" "Backend" || BACKEND_OK=1
check_port "5173" "Frontend" || FRONTEND_OK=1

# ==============================================================================
# MONITORING ENDPOINTS
# ==============================================================================
echo ""
echo -e "${YELLOW}🌐 MONITORING ENDPOINTS${NC}"
echo "------------------------"

if [ $BACKEND_OK -eq 0 ]; then
    check_endpoint "$BACKEND_URL/health" "Health Check"
    check_endpoint "$BACKEND_URL/api/test" "Test API"
    check_endpoint "$BACKEND_URL/api/auth/session" "Auth Session"
else
    echo -e "  ${YELLOW}⚠️  Backend non accessible, skip des endpoints${NC}"
fi

# ==============================================================================
# MONITORING BASE DE DONNÉES
# ==============================================================================
echo ""
echo -e "${YELLOW}🗄️  MONITORING BASE DE DONNÉES${NC}"
echo "----------------------------"

if [ -f "prisma/schema.prisma" ]; then
    echo -e "  ✅ Schema Prisma trouvé"

    if [ -d "generated/prisma" ]; then
        echo -e "  ✅ Client Prisma généré"
    else
        echo -e "  ${RED}❌ Client Prisma manquant${NC}"
        log "ERROR: Client Prisma non généré"
    fi
else
    echo -e "  ${RED}❌ Schema Prisma manquant${NC}"
    log "ERROR: Schema Prisma non trouvé"
fi

# ==============================================================================
# MONITORING LOGS
# ==============================================================================
echo ""
echo -e "${YELLOW}📝 MONITORING LOGS${NC}"
echo "---------------------"

# Vérifier les logs récents
if [ -f "$LOG_FILE" ]; then
    ERROR_COUNT=$(grep -c "ERROR" "$LOG_FILE" 2>/dev/null || echo "0")
    WARNING_COUNT=$(grep -c "WARNING" "$LOG_FILE" 2>/dev/null || echo "0")

    echo -e "  📊 Erreurs récentes: $ERROR_COUNT"
    echo -e "  📊 Avertissements: $WARNING_COUNT"

    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "  ${RED}⚠️  Erreurs détectées${NC}"
        echo -e "  📋 Dernières erreurs:"
        grep "ERROR" "$LOG_FILE" | tail -3 | while read line; do
            echo -e "    $line"
        done
    fi
else
    echo -e "  📝 Aucun log disponible"
fi

# ==============================================================================
# RÉSUMÉ ET ALERTES
# ==============================================================================
echo ""
echo -e "${BLUE}📊 RÉSUMÉ DU MONITORING${NC}"
echo "=============================="

if [ $BACKEND_OK -eq 0 ] && [ $FRONTEND_OK -eq 0 ]; then
    echo -e "  ${GREEN}✅ Système opérationnel${NC}"
    log "INFO: Système opérationnel"
else
    echo -e "  ${RED}❌ Problèmes détectés${NC}"
    log "ERROR: Problèmes détectés dans le système"

    if [ $BACKEND_OK -eq 1 ]; then
        echo -e "  ${RED}  - Backend arrêté${NC}"
    fi

    if [ $FRONTEND_OK -eq 1 ]; then
        echo -e "  ${RED}  - Frontend arrêté${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}💡 RECOMMANDATIONS${NC}"
echo "---------------------"

if [ $BACKEND_OK -eq 1 ]; then
    echo -e "  🔧 Redémarrer le backend: cd server && npm run dev"
fi

if [ $FRONTEND_OK -eq 1 ]; then
    echo -e "  🎨 Redémarrer le frontend: cd client && npm run dev"
fi

if [ ! -d "generated/prisma" ]; then
    echo -e "  🗄️  Régénérer Prisma: npx prisma generate"
fi

echo ""
echo -e "${GREEN}✅ Monitoring terminé${NC}"
echo -e "�� Logs: $LOG_FILE"
