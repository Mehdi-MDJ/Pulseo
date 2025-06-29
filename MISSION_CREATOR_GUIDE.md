# Guide du Créateur de Missions - NurseLink AI

## Vue d'ensemble

Le créateur de missions permet aux établissements de santé de publier des offres de missions temporaires pour recruter des infirmiers. Ce système comprend un formulaire multi-étapes avec validation, pré-remplissage automatique pour les tests, et publication via API.

## Architecture

### Frontend
- **Fichier principal**: `client/src/pages/mission-creator.tsx`
- **Framework**: React avec TypeScript
- **Validation**: React Hook Form + Zod
- **UI**: Shadcn/ui + Tailwind CSS

### Backend
- **Route principale**: `/api/demo/missions/publish` (mode démo sans authentification)
- **Route protégée**: `/api/missions/publish` (avec authentification)
- **Fichier**: `server/routes/index.ts`

## Fonctionnalités

### 1. Formulaire Multi-étapes
- **Étape 1**: Informations de base (titre, description, service)
- **Étape 2**: Détails de la mission (dates, tarif, adresse)
- **Étape 3**: Exigences et avantages
- **Étape 4**: Révision finale et publication

### 2. Validation
```typescript
// Schéma de validation principal
const missionSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  service: z.string().min(1, "Veuillez sélectionner un service"),
  // ... autres champs
});
```

### 3. Fonctionnalités de Test
- **Bouton "Pré-remplir Test"**: Remplit automatiquement tous les champs
- **Bouton "Test Validation"**: Vérifie la validation sans publier
- **Bouton "Test API"**: Teste la connexion au serveur

## API Endpoints

### Publication de Mission (Demo)
```http
POST /api/demo/missions/publish
Content-Type: application/json

{
  "title": "Infirmier DE - Nuit",
  "description": "Mission en service d'urgences...",
  "service": "Urgences",
  "specializations": ["Infirmier DE", "AFGSU 2"],
  "startDate": "2025-06-16",
  "endDate": "2025-06-18",
  "shift": "nuit",
  "urgencyLevel": "high",
  "hourlyRate": 34,
  "address": "68 Rue Philippe de Girard 75018 Paris",
  "positionsCount": 1,
  "requirements": ["Diplôme d'État infirmier"],
  "benefits": ["Prime de nuit"],
  "contactInfo": "Madame Dupont : 06.51.07.49.12"
}
```

### Réponse de Succès
```json
{
  "success": true,
  "message": "Mission publiée avec succès!",
  "mission": {
    "id": 1749423685469,
    "title": "Infirmier DE - Nuit",
    "status": "published",
    "establishmentId": 1,
    "createdAt": "2025-06-08T23:01:25.469Z",
    "updatedAt": "2025-06-08T23:01:25.469Z"
  }
}
```

## Débogage

### Logs Frontend
Les logs sont disponibles dans la console du navigateur :
```javascript
console.log("Publish button clicked");
console.log("Form is valid:", form.formState.isValid);
console.log("Form errors:", form.formState.errors);
console.log("Publishing mission with data:", formData);
```

### Logs Backend
Les logs serveur incluent :
```
🚀 Demo publish mission called with data: { ... }
✅ Demo mission published successfully: { ... }
```

## Problèmes Courants et Solutions

### 1. Erreur 404 "Route API non trouvée"
**Cause**: L'endpoint n'est pas correctement enregistré dans le routeur
**Solution**: Vérifier que l'endpoint est défini dans `server/routes/index.ts` AVANT le middleware catch-all

### 2. Validation qui échoue
**Cause**: Champs manquants ou incorrects
**Solution**: Utiliser le bouton "Test Validation" pour identifier les erreurs

### 3. Formulaire vide lors du test
**Cause**: Les valeurs ne sont pas correctement assignées au formulaire
**Solution**: Utiliser `form.setValue()` pour chaque champ :
```typescript
form.setValue("title", "Valeur de test");
form.setValue("description", "Description de test");
```

## Tests

### Test Manuel Complet
1. Naviguer vers `/mission-creator`
2. Cliquer sur "Pré-remplir Test"
3. Vérifier que tous les champs sont remplis
4. Cliquer sur "Publier la mission"
5. Vérifier le message de succès

### Test API Direct
```bash
curl -X POST http://localhost:5000/api/demo/missions/publish \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test description"}'
```

## Maintenance

### Ajouter de Nouveaux Champs
1. Mettre à jour le schéma Zod dans `mission-creator.tsx`
2. Ajouter les champs au formulaire
3. Mettre à jour la fonction de pré-remplissage
4. Adapter l'endpoint API si nécessaire

### Modifications de l'API
- Les endpoints demo ne nécessitent pas d'authentification
- Les endpoints production utilisent le middleware `isAuthenticated`
- Toujours valider les données côté serveur

## Fichiers Importants

```
client/src/pages/mission-creator.tsx    # Interface utilisateur principale
server/routes/index.ts                  # Routes API et logique serveur
shared/schema.ts                        # Schémas de données partagés
client/src/lib/queryClient.ts           # Configuration des requêtes API
```

## Notes pour les Développeurs

- Le système utilise React Hook Form pour la gestion des formulaires
- La validation est centralisée avec Zod
- Les routes demo permettent le test sans authentification
- Tous les logs sont structurés pour faciliter le débogage
- Le code suit les conventions TypeScript strictes