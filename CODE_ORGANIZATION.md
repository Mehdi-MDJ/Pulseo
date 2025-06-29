# Organisation du Code - NurseLink AI

## Structure du Projet

```
NurseLink-AI/
├── client/                    # Interface utilisateur React
│   ├── src/
│   │   ├── components/        # Composants réutilisables UI
│   │   ├── hooks/             # Hooks React personnalisés
│   │   ├── lib/               # Utilitaires et configuration
│   │   ├── pages/             # Pages de l'application
│   │   └── App.tsx           # Routeur principal
├── server/                    # Backend Node.js/Express
│   ├── config/               # Configuration environnement
│   ├── middleware/           # Middlewares Express
│   ├── routes/               # Routes organisées par domaine
│   ├── services/             # Services métier
│   ├── utils/                # Utilitaires serveur
│   ├── db.ts                 # Configuration base de données
│   ├── index.ts              # Point d'entrée serveur
│   └── routes.ts             # Routeur principal
├── shared/                    # Code partagé client/serveur
│   └── schema.ts             # Schémas base de données
├── mobile/                    # Application mobile React Native
└── docs/                     # Documentation
```

## Organisation des Routes

### Routes Principales (`server/routes.ts`)
- Point d'entrée principal pour l'enregistrement des routes
- Gestion de l'authentification OAuth
- Routes publiques et protégées
- Middleware de sécurité

### Routes Demo (`server/routes/demoRoutes.ts`)
- **Objectif**: Tests et développement uniquement
- **Accès**: Public (sans authentification)
- **Endpoints**:
  - `POST /api/demo/missions/publish` - Publication test de missions
  - `GET /api/demo/missions` - Récupération des missions demo
- **Important**: Ne pas utiliser en production

### Routes Spécialisées
- `server/routes/aiRoutes.ts` - Intelligence artificielle
- `server/routes/missionRoutes.ts` - Gestion des missions
- `server/routes/userRoutes.ts` - Gestion des utilisateurs

## Services Organisés

### Service de Stockage (`server/services/storageService.ts`)
- Interface `IStorage` pour abstraction
- Implémentation `DatabaseStorage` avec Drizzle ORM
- Méthodes CRUD typées et sécurisées

### Service IA (`server/services/aiAssistantService.ts`)
- Intégration OpenAI GPT-4o
- Matching intelligent infirmiers-missions
- Prévisions d'absences
- Assistant conversationnel

### Service Analytics (`server/services/analyticsService.ts`)
- Métriques temps réel
- Dashboards établissements
- Analyse de performance
- Rapports automatisés

## Standards de Code

### TypeScript
```typescript
// Interfaces strictes
interface MissionData {
  title: string;
  description: string;
  service?: string;
  // ... autres propriétés
}

// Types partagés depuis shared/schema.ts
import type { Mission, InsertMission } from "@shared/schema";

// Validation avec Zod
const missionSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20)
});
```

### Gestion d'Erreurs
```typescript
try {
  const result = await operation();
  res.json({ success: true, data: result });
} catch (error) {
  console.error("Erreur contextualisée:", error);
  res.status(500).json({ 
    success: false,
    message: "Message utilisateur",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

### Logging Structuré
```typescript
// Logs avec contexte et emojis pour la lisibilité
console.log('🚀 [SERVICE] Action démarrée');
console.log('✅ [SERVICE] Action réussie');
console.error('❌ [SERVICE] Erreur détectée');
```

## Conventions de Nommage

### Fichiers
- `camelCase` pour les fichiers TypeScript
- `kebab-case` pour les fichiers de configuration
- Suffixes descriptifs: `Service.ts`, `Routes.ts`, `Types.ts`

### Variables et Fonctions
```typescript
// Variables: camelCase
const missionData = {};
const userProfile = {};

// Fonctions: camelCase descriptif
async function publishMission(data: MissionData): Promise<Mission> {}
async function getUserProfile(userId: string): Promise<UserProfile> {}

// Constantes: UPPER_SNAKE_CASE
const API_ENDPOINTS = {
  MISSIONS: '/api/missions',
  USERS: '/api/users'
};
```

### Composants React
```typescript
// PascalCase pour les composants
export function MissionCreator() {}
export function UserDashboard() {}

// Hooks: use + PascalCase
export function useAuth() {}
export function useMissionData() {}
```

## Bonnes Pratiques

### 1. Séparation des Responsabilités
- **Routes**: Validation des entrées, appel des services
- **Services**: Logique métier, appels API externes
- **Storage**: Accès aux données, persistance
- **Components**: Interface utilisateur, gestion des états

### 2. Gestion des États
```typescript
// React Query pour les données serveur
const { data: missions, isLoading } = useQuery({
  queryKey: ['/api/missions'],
  enabled: isAuthenticated
});

// useState pour l'état local
const [formData, setFormData] = useState<MissionData>({});
```

### 3. Validation Centralisée
```typescript
// Schémas Zod partagés
export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Validation côté client et serveur
const validatedData = insertMissionSchema.parse(rawData);
```

### 4. Configuration Environnement
```typescript
// Variables centralisées dans server/config/environment.ts
export const env = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};
```

## Workflow de Développement

### 1. Ajout de Nouvelles Fonctionnalités
1. Définir les types dans `shared/schema.ts`
2. Créer les routes dans `server/routes/`
3. Implémenter les services dans `server/services/`
4. Créer les composants dans `client/src/pages/`
5. Ajouter les tests appropriés

### 2. Modification des APIs
1. Mettre à jour les schémas de validation
2. Modifier les endpoints correspondants
3. Mettre à jour la documentation
4. Tester avec les routes demo

### 3. Debugging
1. Vérifier les logs structurés
2. Utiliser les routes demo pour isoler les problèmes
3. Tester les endpoints avec curl/Postman
4. Vérifier la console développeur pour le frontend

## Documentation

### Fichiers de Documentation
- `README.md` - Vue d'ensemble du projet
- `CODE_ORGANIZATION.md` - Ce fichier
- `MISSION_CREATOR_GUIDE.md` - Guide spécifique au créateur de missions
- `DEVELOPER_GUIDE.md` - Guide développeur complet
- `DEPLOYMENT.md` - Instructions de déploiement

### Commentaires dans le Code
```typescript
/**
 * ==============================================================================
 * Description du module
 * ==============================================================================
 * 
 * Explication détaillée du rôle et de l'utilisation
 * 
 * @param parameter Description du paramètre
 * @returns Description du retour
 * @throws Description des erreurs possibles
 */
```

## Maintenance

### Tâches Régulières
- Mise à jour des dépendances NPM
- Nettoyage des logs de développement
- Révision des performances des requêtes
- Mise à jour de la documentation

### Monitoring
- Logs d'erreurs centralisés
- Métriques de performance API
- Surveillance de l'utilisation de la base de données
- Alertes sur les erreurs critiques

Cette organisation assure la maintenabilité, la scalabilité et la facilité de collaboration pour l'équipe de développement.