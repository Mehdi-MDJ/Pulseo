export default {
  expo: {
    name: 'NurseLink AI',
    slug: 'nurselink-ai-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#2563eb'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.nurselinkai.mobile',
      buildNumber: '1',
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "NurseLink AI utilise votre localisation pour vous proposer des missions à proximité.",
        NSCameraUsageDescription: "NurseLink AI utilise la caméra pour scanner vos documents.",
        NSPhotoLibraryUsageDescription: "NurseLink AI accède à votre galerie pour sélectionner des documents.",
        NSMicrophoneUsageDescription: "NurseLink AI utilise le microphone pour les appels vocaux.",
        NSFaceIDUsageDescription: "NurseLink AI utilise Face ID pour sécuriser votre connexion."
      }
    },
    android: {
      package: 'com.nurselinkai.mobile',
      versionCode: 1,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'RECORD_AUDIO',
        'INTERNET',
        'WAKE_LOCK',
        'VIBRATE'
      ],
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#2563eb'
      }
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-location',
      'expo-notifications',
      'expo-secure-store'
    ],
    extra: {
      eas: {
        projectId: "nurselink-ai-mobile"
      }
    },
    owner: 'nurselinkai'
  }
};
