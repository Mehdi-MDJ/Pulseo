# 🏥 NurseLink AI

Plateforme de matching intelligent entre infirmiers et établissements de santé.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
npm install
```

### Démarrage du serveur
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

### Interface Web
L'interface web est automatiquement servie sur `http://localhost:3000`

## 📁 Structure du Projet

```
NurseLinkAI_Test/
├── client/                 # Interface web React
├── server/                 # API backend Express
├── mobile/                 # Application mobile React Native
├── shared/                 # Schémas partagés
└── migrations/             # Migrations base de données
```

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env` à la racine :

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./dev.db
```

## 📊 Base de Données

La base de données SQLite est automatiquement créée au premier démarrage.

### Migrations
```bash
npm run db:push
```

## 🧪 Tests

Les tests ont été simplifiés pour se concentrer sur les fonctionnalités principales.

## 📱 Application Mobile

L'application mobile React Native est dans le dossier `mobile/`.

```bash
cd mobile
npm install
npx expo start
```

## 🔒 Authentification

Le système supporte :
- Authentification locale (développement)
- OAuth Replit (production)

## 📈 Fonctionnalités

- ✅ Inscription/Connexion établissements
- ✅ Création et gestion de missions
- ✅ Templates de missions
- ✅ Matching IA intelligent
- ✅ Gestion des candidatures
- ✅ Notifications en temps réel
- ✅ Interface mobile

## 🛠️ Développement

### Scripts disponibles
- `npm run dev` - Démarrage en mode développement
- `npm run build` - Compilation TypeScript
- `npm run start` - Démarrage en production
- `npm run lint` - Vérification du code
- `npm run type-check` - Vérification des types

## 📄 Licence

MIT
