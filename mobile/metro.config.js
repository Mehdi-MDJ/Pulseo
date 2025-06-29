const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuration pour éviter les problèmes d'assets
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

// Désactiver le cache pour éviter les problèmes
config.cacheStores = [];

// Configuration pour éviter l'erreur de path
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
