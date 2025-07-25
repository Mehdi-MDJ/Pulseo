import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  console.log('[ProtectedRoute] Statut:', {
    user: user?.email,
    isLoading,
    isAuthenticated: !!user
  });

  // Si la vérification de la session est en cours, afficher un état de chargement.
  // C'est cette vérification qui corrige la boucle.
  if (isLoading) {
    console.log('[ProtectedRoute] Affichage du skeleton de chargement');
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <p className="text-muted-foreground">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  // Si le chargement est terminé et qu'il n'y a pas d'utilisateur, rediriger vers la page de connexion.
  if (!user) {
    console.log('[ProtectedRoute] Redirection vers /auth-page - utilisateur non authentifié');
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold">Accès requis</h2>
          <p className="text-muted-foreground">Vous devez vous connecter pour accéder à cette page.</p>
          <a
            href="/auth-page"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  // Si le chargement est terminé et que l'utilisateur est présent, afficher la page demandée.
  console.log('[ProtectedRoute] Accès autorisé pour:', user.email);
  return <>{children}</>;
};
