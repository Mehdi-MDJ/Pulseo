#!/bin/bash

# ==============================================================================
# NurseLink AI - Script de Backup Automatique
# ==============================================================================
#
# Script de backup automatique pour PostgreSQL
# Sauvegarde complète avec rotation et compression
# ==============================================================================

set -e

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME="nurselink_ai"
DB_USER="nurselink"
DB_PASSWORD="password"

# Timestamp pour le nom du fichier
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="nurselink_backup_${TIMESTAMP}.sql.gz"

# Fonction de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction de nettoyage des anciens backups
cleanup_old_backups() {
    log "Nettoyage des backups plus anciens que ${RETENTION_DAYS} jours..."
    find ${BACKUP_DIR} -name "nurselink_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
}

# Fonction de vérification de l'espace disque
check_disk_space() {
    local available_space=$(df ${BACKUP_DIR} | awk 'NR==2 {print $4}')
    local required_space=1048576  # 1GB en KB

    if [ $available_space -lt $required_space ]; then
        log "ERREUR: Espace disque insuffisant pour le backup"
        exit 1
    fi
}

# Fonction de backup
create_backup() {
    log "Début du backup de la base de données..."

    # Vérifier l'espace disque
    check_disk_space

    # Créer le backup avec pg_dump
    PGPASSWORD=${DB_PASSWORD} pg_dump \
        -h ${DB_HOST} \
        -p ${DB_PORT} \
        -U ${DB_USER} \
        -d ${DB_NAME} \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --no-owner \
        --no-privileges \
        | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

    # Vérifier que le backup a réussi
    if [ $? -eq 0 ]; then
        log "Backup créé avec succès: ${BACKUP_FILE}"

        # Calculer la taille du backup
        local backup_size=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
        log "Taille du backup: ${backup_size}"

        # Vérifier l'intégrité du backup
        log "Vérification de l'intégrité du backup..."
        gunzip -t "${BACKUP_DIR}/${BACKUP_FILE}"
        if [ $? -eq 0 ]; then
            log "Backup vérifié avec succès"
        else
            log "ERREUR: Le backup est corrompu"
            rm -f "${BACKUP_DIR}/${BACKUP_FILE}"
            exit 1
        fi
    else
        log "ERREUR: Échec du backup"
        exit 1
    fi
}

# Fonction de notification (optionnelle)
send_notification() {
    local status=$1
    local message=$2

    # Exemple avec curl pour envoyer une notification
    # curl -X POST "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" \
    #     -H "Content-type: application/json" \
    #     -d "{\"text\":\"Backup NurseLink AI: ${status} - ${message}\"}"

    log "Notification: ${status} - ${message}"
}

# Fonction principale
main() {
    log "=== Début du processus de backup ==="

    # Créer le répertoire de backup s'il n'existe pas
    mkdir -p ${BACKUP_DIR}

    # Créer le backup
    create_backup

    # Nettoyer les anciens backups
    cleanup_old_backups

    # Compter le nombre de backups
    local backup_count=$(find ${BACKUP_DIR} -name "nurselink_backup_*.sql.gz" | wc -l)
    log "Nombre total de backups conservés: ${backup_count}"

    # Envoyer une notification de succès
    send_notification "SUCCESS" "Backup créé: ${BACKUP_FILE}"

    log "=== Fin du processus de backup ==="
}

# Gestion des erreurs
trap 'log "ERREUR: Le script a été interrompu"; send_notification "ERROR" "Script interrompu"; exit 1' INT TERM

# Exécution du script principal
main "$@"
