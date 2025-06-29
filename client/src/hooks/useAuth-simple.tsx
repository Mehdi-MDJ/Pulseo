/**
 * Hook d'authentification simple et stable
 */

import { useState, useEffect } from "react";
import { useToast } from "./use-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "nurse" | "establishment";
  cguAccepted: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "nurse" | "establishment";
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const { toast } = useToast();

  // Vérifier l'authentification au chargement et écouter les changements de localStorage
  useEffect(() => {
    checkAuth();

    // Écouter les changements de localStorage pour synchroniser entre onglets
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionToken') {
        if (e.newValue) {
          checkAuth();
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuth = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');

      // Si pas de token, pas besoin de faire l'appel API
      if (!sessionToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const headers: any = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionToken}`
      };

      const response = await fetch("/api/auth/user", {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        // Vérifier si le token est proche de l'expiration
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        if (tokenExpiry) {
          const expiryTime = new Date(tokenExpiry).getTime();
          const currentTime = new Date().getTime();
          const timeUntilExpiry = expiryTime - currentTime;

          // Si le token expire dans moins de 5 minutes, le renouveler
          if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
            console.log('🔄 Renouvellement automatique du token...');
            await refreshToken();
          }
        }
      } else if (response.status === 401) {
        // 401 = pas authentifié, supprimer le token
        setUser(null);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('tokenExpiry');
      } else {
        // Autres erreurs, garder l'état actuel
        console.warn('Erreur API non-401:', response.status);
      }
    } catch (error) {
      // Erreur réseau ou parsing - ne pas changer l'état utilisateur
      // Ignorer silencieusement pour éviter les promesses non gérées
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sessionToken) {
          localStorage.setItem('sessionToken', data.sessionToken);
          if (data.expiresAt) {
            localStorage.setItem('tokenExpiry', data.expiresAt);
          }
        }
      } else {
        // Si le refresh échoue, déconnecter l'utilisateur
        setUser(null);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('tokenExpiry');
      }
    } catch (error) {
      console.error('Erreur lors du refresh du token:', error);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoginLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        // Stocker le token de session dans localStorage
        if (data.sessionToken) {
          localStorage.setItem('sessionToken', data.sessionToken);
        }

        setUser(data.user);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.user.firstName} !`,
        });
        // Redirection vers le dashboard
        window.location.href = "/dashboard";
      } else {
        const errorText = await response.text();
        toast({
          title: "Erreur de connexion",
          description: errorText || "Identifiants incorrects",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsRegisterLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (response.ok) {
        const responseData = await response.json();

        // Stocker le token de session dans localStorage
        if (responseData.token) {
          localStorage.setItem('sessionToken', responseData.token);
        }

        setUser(responseData.user);
        toast({
          title: "Inscription réussie",
          description: `Bienvenue ${responseData.user.firstName} !`,
        });
        // Redirection vers le dashboard
        window.location.href = "/dashboard";
      } else {
        const errorText = await response.text();
        toast({
          title: "Erreur d'inscription",
          description: errorText || "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      toast({
        title: "Déconnexion",
        description: "À bientôt !",
      });
    } catch (error) {
      // Déconnexion locale même en cas d'erreur
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    isLoginLoading,
    isRegisterLoading,
    isLogoutLoading: false,
  };
}
