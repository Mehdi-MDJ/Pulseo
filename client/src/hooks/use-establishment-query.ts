import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface EstablishmentQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  retryCount?: number;
  refetchInterval?: number;
}

/**
 * Hook personnalisé pour standardiser les requêtes côté établissement
 * Gère automatiquement l'authentification et les erreurs communes
 */
export function useEstablishmentQuery<T>(
  queryKey: string,
  options: EstablishmentQueryOptions<T> = {}
) {
  const { user, isAuthenticated } = useAuth();

  const {
    retryCount = 2,
    refetchInterval = 30000,
    enabled = true,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const headers: any = {};
      const sessionToken = localStorage.getItem('sessionToken');

      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      const response = await fetch(queryKey, {
        headers,
        credentials: "include",
      });

      // Gestion standardisée des erreurs
      if (response.status === 401) {
        // Token expiré ou invalide
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('tokenExpiry');
        throw new Error('AUTH_REQUIRED');
      }

      if (response.status === 403) {
        // Accès interdit - pas un établissement
        throw new Error('FORBIDDEN');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API_ERROR: ${response.status} - ${errorText}`);
      }

      return response.json();
    },
    enabled: enabled && isAuthenticated && user?.role === 'establishment',
    retry: (failureCount, error: any) => {
      // Ne pas retry sur les erreurs d'authentification
      if (error?.message === 'AUTH_REQUIRED' || error?.message === 'FORBIDDEN') {
        return false;
      }
      return failureCount < retryCount;
    },
    refetchInterval: (query) => {
      // Ne pas refetch si il y a une erreur d'authentification
      if (query.state.error?.message === 'AUTH_REQUIRED' || query.state.error?.message === 'FORBIDDEN') {
        return false;
      }
      return refetchInterval;
    },
    staleTime: 0, // Toujours considérer les données comme obsolètes
    refetchOnWindowFocus: true,
    ...queryOptions
  });
}

/**
 * Hook pour les mutations côté établissement avec gestion d'erreurs standardisée
 */
export function useEstablishmentMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: any = {}
) {
  const { user } = useAuth();

  return useMutation({
    mutationFn,
    onError: (error: any) => {
      // Gestion standardisée des erreurs de mutation
      if (error?.message === 'AUTH_REQUIRED') {
        // Rediriger vers la page de connexion
        window.location.href = '/auth';
        return;
      }

      if (error?.message === 'FORBIDDEN') {
        // Afficher un message d'accès interdit
        console.error('Accès interdit - rôle établissement requis');
        return;
      }

      // Appeler le callback d'erreur personnalisé si fourni
      if (options.onError) {
        options.onError(error);
      }
    },
    ...options
  });
}
