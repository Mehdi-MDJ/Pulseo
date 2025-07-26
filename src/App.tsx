import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// --- Importation des composants ---
import AuthPage from '@/pages/auth-page';
import DashboardLayout from '@/components/ui/sidebar'; // Le layout principal avec la sidebar
import DashboardPage from '@/pages/dashboard';
import HomePage from '@/pages/home';
import NotFound from '@/pages/not-found';

/**
 * Composant de Route Protégée
 * Gère l'accès aux routes nécessitant une authentification.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth(); // Utilise isLoading comme corrigé précédemment

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }
  if (!user) {
    return <Navigate to="/auth-page" replace />;
  }
  return <>{children}</>;
};

/**
 * Composant de Layout Principal
 * Ce composant est la clé : il affiche le layout commun (avec la sidebar)
 * et injecte les pages enfants (Dashboard, Settings, etc.) via le composant <Outlet />.
 */
const AppLayout = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

/**
 * Composant principal de l'application
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique */}
        <Route path="/auth-page" element={<AuthPage />} />

        {/* Routes privées qui partagent toutes le même layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Route "index" -> ce qui s'affiche pour "/" */}
          <Route index element={<HomePage />} />

          {/* Autres routes enfants qui s'afficheront à l'intérieur du layout */}
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Exemple pour le futur : <Route path="settings" element={<SettingsPage />} /> */}
        </Route>

        {/* Route pour les pages non trouvées */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
