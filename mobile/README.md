# NurseLink AI - Application Mobile

Application mobile React Native pour la plateforme NurseLink AI, permettant aux infirmiers de gérer leurs missions et aux établissements de recruter du personnel médical.

## 🚀 Fonctionnalités

### Pour les infirmiers
- **Recherche de missions** : Parcourir et filtrer les missions disponibles
- **Candidatures** : Postuler aux missions correspondant à votre profil
- **Notifications** : Recevoir les réponses des établissements en temps réel
- **Profil** : Gérer vos spécialisations, certifications et disponibilités
- **Tableau de bord** : Vue d'ensemble de vos missions et statistiques

### Fonctionnalités techniques
- Interface native iOS et Android
- Authentification sécurisée avec tokens
- Synchronisation temps réel avec l'API backend
- Design mobile-first optimisé
- Support hors-ligne partiel

## 📋 Prérequis

- Node.js 18+ et npm
- Expo CLI (`npm install -g @expo/cli`)
- Compte Expo pour les builds (gratuit)
- Pour iOS : Xcode et simulateur iOS
- Pour Android : Android Studio et émulateur

## 🔧 Installation

1. **Installation des dépendances**
```bash
cd mobile
npm install
```

2. **Configuration de l'environnement**
Modifiez l'URL de l'API dans `src/services/api.ts` :
```typescript
const API_BASE_URL = 'https://votre-app.replit.app/api';
```

3. **Lancement en développement**
```bash
# Démarrer le serveur Expo
npm start

# Ou directement sur un simulateur
npm run ios     # iOS Simulator
npm run android # Android Emulator
```

## 📱 Test sur appareil physique

1. **Installer Expo Go** sur votre téléphone
   - iOS : App Store
   - Android : Google Play Store

2. **Scanner le QR code** affiché dans le terminal après `npm start`

3. **L'application se chargera** directement sur votre appareil

## 🏗 Build pour production

### Configuration EAS (Expo Application Services)

1. **Installation EAS CLI**
```bash
npm install -g eas-cli
eas login
```

2. **Initialisation du projet**
```bash
eas build:configure
```

3. **Build Android**
```bash
# Build APK pour test
eas build --platform android --profile preview

# Build AAB pour Google Play Store
eas build --platform android --profile production
```

4. **Build iOS**
```bash
# Build pour TestFlight
eas build --platform ios --profile production
```

## 🚀 Déploiement sur les stores

### Google Play Store

1. **Créer un compte Google Play Developer** (25$ unique)
2. **Créer une nouvelle application** dans la Play Console
3. **Upload du fichier AAB** généré par EAS Build
4. **Compléter les informations** (description, captures d'écran, etc.)
5. **Soumission pour révision**

### Apple App Store

1. **Compte Apple Developer** requis (99$/an)
2. **Créer l'app** dans App Store Connect
3. **Upload via TestFlight** pour les tests
4. **Soumission App Store** après validation

## 🔐 Configuration des secrets

L'application nécessite l'accès à votre API backend. Assurez-vous que :

1. **L'API backend est déployée** et accessible publiquement
2. **Les CORS sont configurés** pour accepter les requêtes mobiles
3. **L'authentification fonctionne** avec les tokens

## 📊 Structure du projet

```
mobile/
├── src/
│   ├── screens/          # Écrans de l'application
│   │   ├── HomeScreen.tsx
│   │   ├── MissionsScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── LoginScreen.tsx
│   ├── services/         # Services API
│   │   └── api.ts
│   ├── hooks/           # Hooks React personnalisés
│   │   └── useAuth.ts
│   └── components/      # Composants réutilisables
├── App.tsx              # Point d'entrée
├── app.json            # Configuration Expo
└── package.json
```

## 🎨 Design System

- **UI Library** : React Native Paper (Material Design)
- **Navigation** : React Navigation 6
- **Icons** : Expo Vector Icons
- **State Management** : TanStack Query pour l'état serveur
- **Styling** : StyleSheet React Native

## 🔧 Scripts disponibles

```bash
npm start          # Démarrer Expo
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Version web (pour tests)
npm run build:android  # Build Android
npm run build:ios     # Build iOS
```

## 🐛 Dépannage

### Problèmes courants

**Erreur de connexion à l'API**
- Vérifiez l'URL de l'API dans `src/services/api.ts`
- Assurez-vous que le backend est déployé et accessible

**Problème de build iOS**
- Vérifiez votre profil de provisioning Apple
- Assurez-vous que le bundle identifier est unique

**Erreur Android**
- Vérifiez la configuration du keystore
- Consultez les logs avec `adb logcat`

### Logs et debugging

```bash
# Voir les logs détaillés
npx expo start --dev-client

# Logs Android
adb logcat

# Logs iOS
xcrun simctl spawn booted log stream
```

## 🤝 Contribution

1. Fork le repository principal
2. Créer une branche feature
3. Développer et tester sur émulateur
4. Soumettre une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

Pour toute question technique : [dev@nurselink.ai](mailto:dev@nurselink.ai)