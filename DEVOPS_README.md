# 🚀 NurseLink AI - Guide DevOps

## 📋 Table des Matières

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Déploiement](#déploiement)
5. [Monitoring](#monitoring)
6. [Maintenance](#maintenance)
7. [Sécurité](#sécurité)
8. [Troubleshooting](#troubleshooting)

## 🏗️ Architecture

### Stack Technologique
- **Backend**: Node.js + Express + NextAuth.js v5
- **Base de données**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Containerisation**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

### Architecture de Production
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Nginx (SSL)   │    │   Application   │
│   (Cloudflare)  │───▶│   Reverse Proxy │───▶│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │     Redis       │
                       │   Database      │    │     Cache       │
                       └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Prometheus    │
                       │   + Grafana     │
                       └─────────────────┘
```

## 🛠️ Installation

### Prérequis
- Docker 20.10+
- Docker Compose 2.0+
- Git
- 4GB RAM minimum
- 20GB espace disque

### Installation Rapide
```bash
# Cloner le projet
git clone https://github.com/your-org/nurselink-ai.git
cd nurselink-ai

# Copier la configuration
cp env.example .env

# Configurer les variables d'environnement
nano .env

# Démarrer l'application
docker-compose -f docker-compose.prod.yml up -d
```

## ⚙️ Configuration

### Variables d'Environnement Critiques

```bash
# NextAuth.js
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=https://nurselink.ai

# Base de données
DATABASE_URL=postgresql://username:password@localhost:5432/nurselink_ai

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email (pour Magic Links)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@nurselink.ai
```

### Configuration OAuth

#### Google OAuth
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un existant
3. Activer l'API Google+ API
4. Créer des identifiants OAuth 2.0
5. Ajouter les URIs de redirection autorisés :
   - `https://nurselink.ai/api/auth/callback/google`
   - `http://localhost:5000/api/auth/callback/google` (développement)

#### GitHub OAuth
1. Aller sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Créer une nouvelle OAuth App
3. Configurer les URLs :
   - Homepage URL: `https://nurselink.ai`
   - Authorization callback URL: `https://nurselink.ai/api/auth/callback/github`

## 🚀 Déploiement

### Déploiement Automatisé
```bash
# Déploiement en production
./scripts/deploy.sh production

# Déploiement en staging
./scripts/deploy.sh staging
```

### Déploiement Manuel
```bash
# Build et démarrage
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Migrations de base de données
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Vérification
curl http://localhost:5000/health
```

### Rollback
```bash
# Rollback automatique en cas d'échec
# Le script de déploiement gère automatiquement le rollback

# Rollback manuel
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

### Métriques Disponibles
- **Application**: Temps de réponse, taux d'erreur, utilisateurs actifs
- **Base de données**: Connexions, requêtes lentes, taille des tables
- **Système**: CPU, mémoire, disque, réseau
- **Authentification**: Tentatives de connexion, échecs, nouveaux utilisateurs

### Accès aux Dashboards
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

### Alertes Configurées
- Taux d'erreur > 5%
- Temps de réponse > 2s
- Utilisation CPU > 80%
- Utilisation mémoire > 85%
- Espace disque < 10%

## 🔧 Maintenance

### Backups Automatiques
```bash
# Backup manuel
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U nurselink nurselink_ai > backup.sql

# Restauration
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U nurselink nurselink_ai < backup.sql
```

### Mises à Jour
```bash
# Mise à jour de l'application
git pull origin main
./scripts/deploy.sh production

# Mise à jour des dépendances
npm audit fix
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Logs
```bash
# Logs de l'application
docker-compose -f docker-compose.prod.yml logs -f app

# Logs de la base de données
docker-compose -f docker-compose.prod.yml logs -f postgres

# Logs Nginx
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## 🔒 Sécurité

### Bonnes Pratiques
- ✅ Secrets stockés dans des variables d'environnement
- ✅ HTTPS obligatoire en production
- ✅ Headers de sécurité configurés
- ✅ Rate limiting sur les endpoints sensibles
- ✅ Authentification multi-facteurs disponible
- ✅ Logs d'audit pour les actions sensibles

### Audit de Sécurité
```bash
# Scan de vulnérabilités
npm audit

# Scan Docker
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image nurselink-ai:latest

# Test de pénétration (optionnel)
docker run --rm -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py -t https://nurselink.ai
```

### Rotation des Secrets
```bash
# Générer un nouveau secret NextAuth
openssl rand -base64 32

# Mettre à jour les secrets
# 1. Mettre à jour .env
# 2. Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart app
```

## 🐛 Troubleshooting

### Problèmes Courants

#### Application ne démarre pas
```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs app

# Vérifier les variables d'environnement
docker-compose -f docker-compose.prod.yml exec app env | grep NEXTAUTH

# Vérifier la base de données
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U nurselink
```

#### Erreurs d'authentification
```bash
# Vérifier la configuration OAuth
curl -X GET http://localhost:5000/api/auth/providers

# Vérifier les logs d'authentification
docker-compose -f docker-compose.prod.yml logs app | grep auth
```

#### Problèmes de performance
```bash
# Vérifier les métriques
curl http://localhost:9090/api/v1/query?query=up

# Vérifier l'utilisation des ressources
docker stats

# Analyser les requêtes lentes
docker-compose -f docker-compose.prod.yml exec postgres psql -U nurselink -d nurselink_ai -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Commandes Utiles
```bash
# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart app

# Voir les processus en cours
docker-compose -f docker-compose.prod.yml ps

# Nettoyer les volumes
docker-compose -f docker-compose.prod.yml down -v

# Mettre à jour les images
docker-compose -f docker-compose.prod.yml pull
```

## 📞 Support

### Contacts
- **DevOps Lead**: devops@nurselink.ai
- **Sécurité**: security@nurselink.ai
- **Urgences**: +33 1 23 45 67 89

### Escalade
1. **Niveau 1**: Vérification des logs et redémarrage
2. **Niveau 2**: Analyse approfondie et rollback
3. **Niveau 3**: Intervention manuelle et investigation

### Documentation Supplémentaire
- [Architecture détaillée](./docs/architecture.md)
- [Guide de sécurité](./docs/security.md)
- [Procédures d'urgence](./docs/emergency.md)
