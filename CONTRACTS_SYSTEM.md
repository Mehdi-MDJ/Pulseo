# Système de Contrats Automatiques - Documentation Technique

## Vue d'ensemble
Le système de contrats automatiques génère des contrats professionnels instantanément lors de l'acceptation d'une candidature de mission. Il utilise l'IA OpenAI GPT-4o pour créer des templates HTML avec calculs financiers automatiques.

## Architecture

### Services impliqués
```typescript
server/services/contractService.ts    // Service principal de génération
server/routes/contractRoutes.ts       // API endpoints
client/src/pages/contract-demo.tsx    // Interface de démonstration
client/src/pages/contracts.tsx        // Gestion des contrats
```

### Flux de génération automatique
1. **Déclencheur**: Acceptation d'une candidature (`acceptApplication`)
2. **Données collectées**: Mission, infirmier, établissement
3. **Génération IA**: Template HTML avec OpenAI GPT-4o
4. **Calculs automatiques**: Salaire total, charges, net à payer
5. **Stockage**: Contrat enregistré en base avec numéro unique
6. **Notification**: Contrat disponible immédiatement

## Implémentation technique

### Service de génération (contractService.ts)
```typescript
export async function generateContract(data: ContractGenerationData): Promise<Contract> {
  // 1. Génération du numéro de contrat unique
  const contractNumber = await generateUniqueContractNumber();
  
  // 2. Calculs financiers automatiques
  const totalSalary = mission.hourlyRate * mission.hoursPerDay * mission.durationDays;
  const charges = totalSalary * 0.23; // 23% charges sociales
  const netToPay = totalSalary - charges;
  
  // 3. Génération template HTML avec IA
  const htmlContent = await generateContractHTML({
    contractNumber,
    mission,
    nurse,
    establishment,
    financials: { totalSalary, charges, netToPay }
  });
  
  // 4. Sauvegarde en base
  return await storage.createContract({
    missionId: mission.id,
    nurseId: nurse.id,
    establishmentId: establishment.id,
    contractNumber,
    htmlContent,
    status: 'generated'
  });
}
```

### Template HTML généré par IA
Le template utilise OpenAI GPT-4o pour créer un contrat professionnel avec:
- **En-tête institutionnel** avec logos et coordonnées
- **Parties contractantes** avec informations complètes
- **Conditions de mission** détaillées et spécifiques
- **Rémunération** avec calculs automatiques
- **Clauses légales** conformes au droit du travail
- **Signature électronique** avec horodatage

### API Endpoints

#### POST /api/contracts/generate
Génération manuelle d'un contrat (admin uniquement)
```typescript
{
  missionId: number,
  nurseId: string,
  establishmentId: string
}
```

#### GET /api/contracts
Récupération des contrats de l'utilisateur connecté
```typescript
Response: Contract[]
```

#### GET /api/contracts/:id
Affichage d'un contrat spécifique
```typescript
Response: Contract avec htmlContent
```

#### POST /api/contracts/:id/sign
Signature électronique d'un contrat
```typescript
{
  signatureData: string,
  ipAddress: string
}
```

## Démonstration système

### Interface /contract-demo
Processus complet en 4 étapes:
1. **Création mission** - Établissement publie une offre
2. **Candidature infirmier** - Application automatique
3. **Acceptation candidature** - Validation par établissement
4. **Contrat généré** - Template HTML professionnel créé

### Données de test
```typescript
// Mission de démonstration
{
  title: "Infirmier de nuit - Service Urgences",
  establishment: "CHU Lyon Sud",
  hourlyRate: 28,
  hoursPerDay: 12,
  durationDays: 7,
  specialization: "Urgences"
}

// Calculs automatiques
totalSalary: 2352€ (28€ × 12h × 7j)
charges: 541€ (23%)
netToPay: 1811€
```

## Sécurité et conformité

### Validation des données
- **Zod schemas** pour validation stricte
- **Authentification** requise pour toutes les opérations
- **Autorisation** par rôle (nurse/establishment)

### Traçabilité
- **Horodatage** de toutes les opérations
- **Logs** de génération et signature
- **Audit trail** complet

### Conformité légale
- **RGPD** - Gestion des données personnelles
- **Code du travail** - Clauses conformes
- **Signature électronique** - Valeur juridique

## Extensions possibles

### 1. Signature électronique avancée
- Intégration DocuSign/HelloSign
- Certificats numériques
- Horodatage qualifié

### 2. Templates personnalisables
- Éditeur visuel pour établissements
- Variables dynamiques
- Modèles par spécialisation

### 3. Workflow d'approbation
- Validation hiérarchique
- Négociation de termes
- Historique des modifications

### 4. Intégration comptable
- Export vers systèmes ERP
- Facturation automatique
- Déclarations sociales

## Avantages concurrentiels

1. **Automatisation complète** - Zéro intervention manuelle
2. **IA générative** - Templates professionnels uniques
3. **Calculs automatiques** - Élimination des erreurs
4. **Instantané** - Contrat disponible immédiatement
5. **Conformité garantie** - Clauses légales à jour
6. **Traçabilité totale** - Audit trail complet

Le système de contrats automatiques représente une innovation majeure qui différencie NurseLink AI des plateformes concurrentes traditionnelles.