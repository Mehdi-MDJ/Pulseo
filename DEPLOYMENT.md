# Guide de déploiement NurseLink AI

Ce guide vous explique comment déployer votre application NurseLink AI en production.

## 📋 Prérequis

### Comptes nécessaires
- Compte GitHub pour le code source
- Compte OpenAI pour l'API GPT-4o
- Service d'hébergement (Replit, Vercel, Railway, etc.)
- Base de données PostgreSQL en production

### Clés d'API requises
- `OPENAI_API_KEY` : Clé API OpenAI
- `DATABASE_URL` : URL de connexion PostgreSQL
- `SESSION_SECRET` : Clé secrète pour les sessions
- Variables d'authentification Replit (si utilisé)

## 🚀 Déploiement depuis Replit

### 1. Déploiement web automatique
- Votre application NurseLink AI est configurée et prête pour Replit Deployments
- Cliquez sur "Deploy" dans l'interface Replit pour déployer instantanément
- L'application sera automatiquement disponible sur `nurselink-ai.replit.app`
- La base de données PostgreSQL et l'authentification sont déjà configurées

### 2. Configuration domaine personnalisé
1. Dans les paramètres de déploiement Replit
2. Ajoutez votre nom de domaine
3. Configurez les enregistrements DNS selon les instructions

## 📱 Application mobile React Native

### Structure recommandée
```
nurselink-mobile/
├── src/
│   ├── screens/
│   ├── components/
│   ├── services/     # API calls vers votre backend
│   └── navigation/
├── app.json
└── package.json
```

### Configuration API
```typescript
// services/api.ts
const API_BASE_URL = 'https://votre-app.replit.app/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
```

### Déploiement stores

#### iOS App Store
1. **Prérequis** : Compte Apple Developer (99$/an)
2. **Build** : `expo build:ios` ou EAS Build
3. **TestFlight** : Version beta pour tests
4. **App Store** : Soumission finale

#### Google Play Store
1. **Prérequis** : Compte Google Developer (25$ unique)
2. **Build** : `expo build:android` ou EAS Build
3. **Play Console** : Upload du fichier APK/AAB
4. **Publication** : Après validation Google

## 🔄 CI/CD avec GitHub Actions

### Configuration automatique
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Replit
        # Configuration spécifique à votre hébergeur
        
  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and deploy mobile
        # EAS Build ou autres outils
```

## 🛡️ Sécurité production

### Variables d'environnement
```env
# Production uniquement
NODE_ENV=production
SESSION_SECRET=votre-clé-super-sécurisée-256-bits
DATABASE_URL=postgresql://user:pass@prod-server:5432/nurselink
OPENAI_API_KEY=sk-votre-clé-production
```

### Bonnes pratiques
- Utilisez HTTPS uniquement
- Configurez les CORS correctement
- Limitez les taux d'API
- Surveillez les logs d'erreur
- Backup automatique de la base de données

## 📊 Monitoring production

### Métriques à surveiller
- Temps de réponse API
- Taux d'erreur 5xx
- Utilisation CPU/RAM
- Connexions base de données
- Coût API OpenAI

### Outils recommandés
- **Logs** : Winston + service de logs
- **Erreurs** : Sentry
- **Performance** : New Relic ou similaire
- **Uptime** : Pingdom ou UptimeRobot

## 🔧 Mise à jour continue

### Workflow recommandé
1. **Développement local** ou sur Replit
2. **Push vers GitHub** pour sauvegarde
3. **Tests automatiques** via GitHub Actions
4. **Déploiement automatique** en production
5. **Tests post-déploiement**

### Rollback rapide
- Gardez toujours la version précédente
- Testez le rollback en staging
- Procédure documentée pour l'équipe

## 📞 Support utilisateurs

### Channels de support
- Email : support@nurselink.ai
- Documentation : docs.nurselink.ai
- Status page : status.nurselink.ai

### Métriques utilisateurs
- NPS (Net Promoter Score)
- Temps de matching moyen
- Taux de satisfaction missions
- Retention utilisateurs

---

**Important** : Testez toujours en environnement de staging avant la production !