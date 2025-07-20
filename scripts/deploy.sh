#!/bin/bash

# ==============================================================================
# NurseLink AI - Script de Déploiement
# ==============================================================================
#
# Script de déploiement automatisé pour la production
# Gestion des migrations, health checks, et rollback
# ==============================================================================

set -e

# Configuration
ENVIRONMENT=${1:-production}
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_BEFORE_DEPLOY=true
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ON_FAILURE=true

# Fonction de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction de vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."

    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        log "ERREUR: Docker n'est pas installé"
        exit 1
    fi

    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log "ERREUR: Docker Compose n'est pas installé"
        exit 1
    fi

    # Vérifier les variables d'environnement
    if [ -z "$NEXTAUTH_SECRET" ]; then
        log "ERREUR: NEXTAUTH_SECRET n'est pas défini"
        exit 1
    fi

    if [ -z "$DATABASE_URL" ]; then
        log "ERREUR: DATABASE_URL n'est pas défini"
        exit 1
    fi

    log "Prérequis vérifiés avec succès"
}

# Fonction de backup avant déploiement
create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" = true ]; then
        log "Création d'un backup avant déploiement..."
        docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T postgres pg_dump -U nurselink nurselink_ai | gzip > "backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql.gz"
        log "Backup créé avec succès"
    fi
}

# Fonction de pull des images
pull_images() {
    log "Récupération des images Docker..."
    docker-compose -f ${DOCKER_COMPOSE_FILE} pull
    log "Images récupérées avec succès"
}

# Fonction de build de l'application
build_application() {
    log "Build de l'application..."
    docker-compose -f ${DOCKER_COMPOSE_FILE} build app
    log "Build terminé avec succès"
}

# Fonction de déploiement
deploy_application() {
    log "Déploiement de l'application..."

    # Arrêter les services existants
    docker-compose -f ${DOCKER_COMPOSE_FILE} down

    # Démarrer les services
    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d

    log "Déploiement terminé"
}

# Fonction de migration de base de données
run_migrations() {
    log "Exécution des migrations de base de données..."

    # Attendre que PostgreSQL soit prêt
    log "Attente que PostgreSQL soit prêt..."
    timeout 60 bash -c 'until docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T postgres pg_isready -U nurselink; do sleep 2; done'

    # Exécuter les migrations
    docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T app npx prisma migrate deploy

    log "Migrations terminées avec succès"
}

# Fonction de health check
health_check() {
    log "Vérification de la santé de l'application..."

    local start_time=$(date +%s)
    local timeout=$HEALTH_CHECK_TIMEOUT

    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))

        if [ $elapsed -gt $timeout ]; then
            log "ERREUR: Timeout lors du health check"
            return 1
        fi

        if curl -f -s http://localhost:5000/health > /dev/null; then
            log "Health check réussi"
            return 0
        fi

        log "Health check en cours... (${elapsed}s/${timeout}s)"
        sleep 5
    done
}

# Fonction de rollback
rollback() {
    log "Déclenchement du rollback..."

    # Arrêter les services
    docker-compose -f ${DOCKER_COMPOSE_FILE} down

    # Restaurer le backup si disponible
    local latest_backup=$(ls -t backup_pre_deploy_*.sql.gz 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        log "Restauration du backup: $latest_backup"
        gunzip -c "$latest_backup" | docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T postgres psql -U nurselink nurselink_ai
    fi

    # Redémarrer les services
    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d

    log "Rollback terminé"
}

# Fonction de notification
send_notification() {
    local status=$1
    local message=$2

    # Exemple avec curl pour envoyer une notification
    # curl -X POST "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" \
    #     -H "Content-type: application/json" \
    #     -d "{\"text\":\"Déploiement NurseLink AI: ${status} - ${message}\"}"

    log "Notification: ${status} - ${message}"
}

# Fonction principale
main() {
    log "=== Début du déploiement NurseLink AI ==="
    log "Environnement: ${ENVIRONMENT}"

    # Vérifier les prérequis
    check_prerequisites

    # Créer un backup
    create_backup

    # Pull des images
    pull_images

    # Build de l'application
    build_application

    # Déployer l'application
    deploy_application

    # Exécuter les migrations
    run_migrations

    # Health check
    if health_check; then
        log "Déploiement réussi!"
        send_notification "SUCCESS" "Déploiement terminé avec succès"
    else
        log "ERREUR: Health check échoué"

        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            rollback
            send_notification "ERROR" "Déploiement échoué, rollback effectué"
        else
            send_notification "ERROR" "Déploiement échoué"
        fi

        exit 1
    fi

    log "=== Fin du déploiement ==="
}

# Gestion des erreurs
trap 'log "ERREUR: Le script a été interrompu"; send_notification "ERROR" "Script interrompu"; exit 1' INT TERM

# Exécution du script principal
main "$@"
