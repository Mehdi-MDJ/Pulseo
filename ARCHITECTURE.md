# Architecture NurseLink AI

## Vue d'ensemble
NurseLink AI est une plateforme de recrutement d'infirmiers utilisant l'IA pour optimiser les correspondances entre professionnels et établissements de santé.

## Structure du projet

```
├── client/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Composants UI réutilisables
│   │   ├── hooks/         # Hooks React personnalisés
│   │   ├── lib/           # Utilitaires et configuration
│   │   └── pages/         # Pages de l'application
│   └── index.html         # Point d'entrée HTML
├── server/                # Backend Node.js + Express
│   ├── config/           # Configuration environnement
│   ├── middleware/       # Middleware Express
│   ├── routes/          # Routes API organisées par domaine
│   ├── services/        # Services métier
│   └── utils/           # Utilitaires serveur
├── shared/              # Code partagé client/serveur
│   └── schema.ts        # Schémas de base de données Drizzle
└── mobile/             # Application mobile React Native
```

## Technologies principales

### Frontend
- **React 18** avec TypeScript
- **Wouter** pour le routage
- **TanStack Query** pour la gestion d'état
- **Tailwind CSS** + **shadcn/ui** pour l'UI
- **React Hook Form** + **Zod** pour les formulaires

### Backend
- **Node.js** + **Express**
- **Drizzle ORM** avec PostgreSQL
- **OpenAI GPT-4o** pour l'IA
- **Passport.js** avec OAuth Replit
- **WebSocket** pour temps réel

### Base de données
- **PostgreSQL** avec schémas Drizzle
- **Sessions** stockées en base
- **Relations** explicites pour l'intégrité

## Fonctionnalités clés

### 1. Système d'authentification
- OAuth via Replit
- Gestion des rôles (infirmier/établissement)
- Sessions sécurisées

### 2. Matching intelligent
- Algorithme IA pour correspondances
- Scoring basé sur compétences/localisation
- Prévisions d'absences

### 3. Contrats automatiques
- Génération automatique lors d'acceptation
- Templates HTML professionnels
- Calculs financiers automatiques
- Signature électronique

### 4. Interface mobile
- Application React Native Expo
- Design mobile-first
- Synchronisation temps réel

## Points d'entrée

### Développement
```bash
npm run dev          # Démarre serveur + client
npm run db:push      # Met à jour le schéma DB
```

### URLs principales
- `/` - Page d'accueil (selon auth)
- `/dashboard` - Tableau de bord utilisateur
- `/contracts` - Gestion des contrats
- `/contract-demo` - Démonstration du système

## Variables d'environnement requises
- `DATABASE_URL` - Connexion PostgreSQL
- `OPENAI_API_KEY` - Clé API OpenAI
- `SESSION_SECRET` - Secret des sessions
- `REPL_ID` - ID Replit pour OAuth

## Architecture de sécurité
- Validation stricte avec Zod
- Middleware d'authentification
- Protection CSRF
- Sessions sécurisées
- Gestion des erreurs centralisée