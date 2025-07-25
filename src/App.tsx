import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Importation des pages nécessaires
import AuthPage from '@/pages/auth-page';
import DashboardPage from '@/pages/dashboard';
import HomePage from '@/pages/home';
import NotFound from '@/pages/not-found';

/**
 * Composant de Route Protégée
 * Ce composant gère l'accès aux routes qui nécessitent une authentification.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  // Étape 1 : Gérer l'état de chargement.
  // Affiche un message pendant que la session utilisateur est en cours de vérification.
  // C'est la correction clé pour éviter les boucles de redirection.
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement de votre session...</div>;
  }

  // Étape 2 : Gérer l'utilisateur non authentifié.
  // Si le chargement est terminé et qu'il n'y a pas d'utilisateur, rediriger vers la page de connexion.
  if (!user) {
    return <Navigate to="/auth-page" replace />;
  }

  // Étape 3 : Autoriser l'accès.
  // Si le chargement est terminé et que l'utilisateur existe, afficher la page demandée.
  return <>{children}</>;
};

/**
 * Composant principal de l'application qui définit toute la logique de routage.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique pour la connexion et l'inscription */}
        <Route path="/auth-page" element={<AuthPage />} />

        {/* Route par défaut - redirige vers home ou dashboard selon l'utilisateur */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Route du dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* === AJOUTEZ VOS AUTRES ROUTES PROTÉGÉES ICI === */}
        {/* Exemple : <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} /> */}

        {/* Route "catch-all" pour les pages non trouvées */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
