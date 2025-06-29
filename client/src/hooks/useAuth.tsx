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

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
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
        setUser(data.user);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.user.firstName} !`,
        });
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
        setUser(responseData.user);
        toast({
          title: "Inscription réussie",
          description: `Bienvenue ${responseData.user.firstName} !`,
        });
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