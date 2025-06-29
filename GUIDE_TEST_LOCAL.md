# Guide pour Tester NurseLink AI en Local

## Problème
L'authentification OAuth Replit ne fonctionne qu'avec l'infrastructure Replit. Pour tester en local, vous avez besoin d'un mode de développement.

## Solution : Mode Développement Local

### Étape 1 : Configuration
Créez un fichier `.env` à la racine du projet avec ce contenu :

```bash
# Base de données (utilisez votre PostgreSQL local)
DATABASE_URL=postgresql://postgres:password@localhost:5432/nurselink_ai

# Clé OpenAI (optionnelle pour tester)
OPENAI_API_KEY=sk-votre-cle-openai-ici

# Secret de session (requis)
SESSION_SECRET=super-secret-development-key-minimum-32-characters-long

# IMPORTANT: Active le mode développement local
LOCAL_DEV_MODE=true

# Configuration serveur
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Fonctionnalités IA
AI_MATCHING_ENABLED=true
AI_FORECASTING_ENABLED=true
```

### Étape 2 : Base de données locale
1. Installez PostgreSQL sur votre machine
2. Créez une base de données `nurselink_ai`
3. Lancez les migrations : `npm run db:push`

### Étape 3 : Démarrage
```bash
npm install
npm run dev
```

## Ce qui change en mode local

### Authentification automatique
- Pas besoin de se connecter
- Utilisateur fictif automatiquement créé :
  - ID: `local-dev-user-123`
  - Email: `dev@nurselink.local`
  - Nom: `Développeur Local`

### Routes disponibles
- `http://localhost:5000` - Page d'accueil
- `http://localhost:5000/api/auth/user` - Info utilisateur
- Toutes les fonctionnalités sont accessibles sans connexion

### Limitations
- Pas de vraie gestion d'utilisateurs multiples
- Les données sont locales à votre machine
- Certaines fonctionnalités Replit peuvent ne pas marcher

## Retour en mode production
Pour revenir au mode production Replit :
1. Changez `LOCAL_DEV_MODE=false` dans `.env`
2. Ajoutez vos vraies variables Replit (`REPL_ID`, `REPLIT_DOMAINS`)
3. Redémarrez le serveur

## Avantages du mode local
✅ Test rapide sans configuration OAuth  
✅ Développement offline  
✅ Debug facilité  
✅ Pas de dépendance externe  

## Alternative : Authentification simple
Si vous préférez un système de connexion classique (email/mot de passe), je peux l'implémenter à la place de l'OAuth Replit.