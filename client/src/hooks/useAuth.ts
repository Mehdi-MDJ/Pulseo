import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Si il y a une erreur 401, l'utilisateur n'est pas authentifié
  const isUnauthenticated = error && error.message.includes('401');

  return {
    user: isUnauthenticated ? null : user,
    isLoading,
    isAuthenticated: !!user && !isUnauthenticated,
  };
}
