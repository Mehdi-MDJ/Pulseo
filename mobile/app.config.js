export default {
  expo: {
    name: 'NurseLinkAI',
    slug: 'nurselink-ai-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#2563eb'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.nurselinkai.mobile'
    },
    android: {
      package: 'com.nurselinkai.mobile'
    },
    web: {
      bundler: 'metro'
    }
  }
};
