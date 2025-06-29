import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { notificationService } from './src/services/notificationService';
import { locationService } from './src/services/locationService';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Initialiser les services
    const initializeServices = async () => {
      try {
        // Configurer les notifications (désactivé pour Expo Go)
        // await notificationService.configure();

        // Demander les permissions de localisation
        await locationService.requestPermissions();

        console.log('Services initialisés avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des services:', error);
      }
    };

    initializeServices();

    // Nettoyer les services à la fermeture
    return () => {
      notificationService.cleanup();
      locationService.stopLocationTracking();
    };
  }, []);

  if (isLoading) {
    // Vous pouvez ajouter un écran de chargement ici
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={AppNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
