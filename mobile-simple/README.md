# NurseLink AI - Application Mobile

Application mobile ultra-simplifiée pour Expo Go avec interface complète de gestion des missions infirmières.

## Instructions de test local

### 1. Prérequis
- Node.js installé sur votre ordinateur
- Application Expo Go sur votre téléphone
- Téléphone et ordinateur sur le même réseau WiFi

### 2. Installation et démarrage
```bash
# Naviguez dans le dossier
cd mobile-simple

# Nettoyage complet
rm -rf node_modules
rm -rf .expo
rm -rf package-lock.json

# Installation propre
npm install

# Démarrage
npm start --clear
```

### 3. Test avec Expo Go
1. Ouvrez l'application Expo Go sur votre téléphone
2. Scannez le QR code qui s'affiche dans votre terminal
3. L'application se chargera automatiquement

### 4. Fonctionnalités disponibles

#### 📋 Onglet Missions
- Affichage de 3 missions d'exemple avec détails complets
- Boutons de candidature avec alertes de confirmation
- Badges d'urgence (Urgent/Modéré)
- Prix horaire, localisation et descriptions

#### 🔔 Onglet Notifications  
- 2 notifications d'exemple
- Types : succès (vert) et info (bleu)
- Horodatage des notifications

#### 👤 Onglet Profil
- Profil infirmière : Marie Dupont
- Statistiques : 42 missions, note 4.8/5, 5 ans d'expérience
- Spécialisations : Urgences, Réanimation, Soins intensifs

## 🎨 Design
- Interface moderne avec navigation par onglets
- Couleurs professionnelles (bleu médical)
- Cards avec ombres et design Material
- Emojis pour améliorer l'expérience utilisateur
- Compatible iOS et Android

## 🔧 Architecture technique
- React Native avec TypeScript
- Expo Go compatible
- Composants natifs uniquement (pas de dépendances externes)
- Gestion d'état avec React hooks

## ⚠️ Résolution de problèmes

### Erreur "Failed to resolve plugin for module expo-secure-store"
Cette erreur est normale et corrigée avec ces étapes :
```bash
# Supprimez complètement les caches
rm -rf node_modules
rm -rf .expo
rm -rf node_modules/.cache

# Réinstallez proprement
npm install

# Démarrez avec cache vide
npm start --clear
```

### L'application ne se charge pas
1. Vérifiez que votre téléphone et ordinateur sont sur le même WiFi
2. Redémarrez le serveur avec `npm start -- --clear`
3. Essayez le mode tunnel : `npm start -- --tunnel`

### Erreur "Something went wrong"
1. Fermez Expo Go complètement
2. Relancez `npm start`
3. Scannez à nouveau le QR code

### Test en mode web
Si vous avez des problèmes avec Expo Go, testez dans le navigateur :
```bash
npm start -- --web
```

## 📞 Support
L'application fonctionne de manière autonome avec des données d'exemple intégrées. Aucune connexion backend n'est requise pour le test.