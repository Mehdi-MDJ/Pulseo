# Guide Développeur - NurseLink AI

## Démarrage rapide

### Installation et lancement
```bash
npm install
npm run dev          # Lance serveur + client
npm run db:push      # Met à jour le schéma DB
```

### Variables d'environnement requises
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SESSION_SECRET=your-session-secret
REPL_ID=your-replit-id
```

## Fonctionnalités principales implémentées

### 1. Système de contrats automatiques ✅
**Localisation**: `server/services/contractService.ts`
- Génération automatique lors de l'acceptation de candidatures
- Templates HTML professionnels via OpenAI GPT-4o
- Calculs financiers automatiques (salaire, charges, net)
- Numérotation unique des contrats
- Signature électronique

**Test**: Accéder à `/contract-demo` pour la démonstration complète

### 2. Authentification OAuth Replit ✅
**Localisation**: `server/replitAuth.ts`
- Gestion des sessions sécurisées en base
- Rôles utilisateur (nurse/establishment)
- Middleware de protection des routes

### 3. Intelligence artificielle ✅
**Localisation**: `server/openai.ts`
- Matching intelligent infirmier-mission
- Prévisions d'absences
- Génération de contrats

### 4. Base de données PostgreSQL ✅
**Localisation**: `shared/schema.ts`
- Schémas Drizzle complets
- Relations explicites
- Types TypeScript générés

## Architecture des routes

### Routes d'authentification
```typescript
GET  /api/auth/user           # Informations utilisateur
POST /api/auth/accept-terms   # Acceptation CGU + rôle
GET  /api/auth/status         # Statut d'authentification
```

### Routes de contrats
```typescript
GET    /api/contracts         # Liste des contrats utilisateur
GET    /api/contracts/:id     # Affichage contrat spécifique
POST   /api/contracts/:id/sign # Signature électronique
POST   /api/contracts/generate # Génération manuelle (admin)
```

### Routes IA
```typescript
POST /api/ai/forecasts/:establishmentId # Prévisions d'absences
GET  /api/ai/forecasts/:establishmentId # Récupération prévisions
POST /api/ai/analyze-profile            # Analyse profil infirmier
GET  /api/ai/health                     # Santé service IA
```

## Patterns de développement

### Validation des données
Toujours utiliser Zod pour la validation côté serveur:
```typescript
const schema = z.object({
  missionId: z.number(),
  nurseId: z.string()
});
const validatedData = schema.parse(req.body);
```

### Gestion des erreurs
Middleware centralisé pour les erreurs:
```typescript
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});
```

### Frontend avec TanStack Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['/api/contracts'],
  retry: false,
});

const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/contracts', 'POST', data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/contracts'] }),
});
```

## Services modulaires

### Structure recommandée
```
server/services/
├── contractService.ts      # Génération contrats ✅
├── authService.ts         # Authentification
├── aiService.ts          # Intelligence artificielle ✅
├── storageService.ts     # Interface stockage ✅
└── missionService.ts     # Gestion missions
```

### Interface IStorage
Tous les services utilisent l'interface standardisée pour l'accès aux données:
```typescript
interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Autres méthodes CRUD
}
```

## Tests et démonstration

### Contrats automatiques
1. Aller sur `/contract-demo`
2. Processus 4 étapes: Mission → Candidature → Acceptation → Contrat
3. Contrat généré automatiquement avec calculs

### Authentification
1. Cliquer "Se connecter" sur la page d'accueil
2. OAuth Replit automatique
3. Sélection du rôle (infirmier/établissement)

## Configuration base de données

### Migrations
```bash
npm run db:push  # Applique les changements de schema.ts
```

### Schémas principaux
- `users` - Authentification OAuth
- `nurseProfiles` - Profils infirmiers détaillés
- `establishmentProfiles` - Profils établissements
- `missions` - Offres de missions
- `contracts` - Contrats générés

## Sécurité

### Protection des routes
```typescript
app.get('/api/protected', isAuthenticated, (req, res) => {
  // Route protégée
});
```

### Variables d'environnement
Toutes les clés sensibles via variables d'environnement uniquement.

## Debug et logs

### Côté serveur
Les logs sont visibles dans la console du workflow "Start application"

### Côté client
Utiliser les outils de développement du navigateur (Console, Network)

### Erreurs courantes
1. **401 Unauthorized**: Problème d'authentification
2. **Validation Zod**: Données invalides envoyées
3. **Base de données**: Vérifier DATABASE_URL

## Prochaines étapes recommandées

### Fonctionnalités à implémenter
1. **Assistant IA conversationnel** - Différenciation concurrentielle
2. **Analytics prédictives** - Valeur ajoutée établissements
3. **Marketplace formations** - Écosystème complet
4. **Système réputation** - Confiance utilisateurs

### Optimisations techniques
1. **Cache Redis** pour les performances
2. **WebSockets** pour temps réel
3. **Tests unitaires** avec Jest
4. **CI/CD** avec GitHub Actions

Le système actuel est fonctionnel et prêt pour la production avec les contrats automatiques comme avantage concurrentiel majeur.