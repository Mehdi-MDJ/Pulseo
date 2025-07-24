/**
 * Hook d'authentification complet pour NurseLink AI
 */

import { useState, useEffect } from "react";
import { useToast } from "./use-toast";

interface User {
  id: string;
  email: string;
  name?: string;
  role: "NURSE" | "ESTABLISHMENT" | "ADMIN";
  establishmentId?: string;
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
  role: "NURSE" | "ESTABLISHMENT";
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
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (response.ok) {
        const session = await response.json();
        if (session.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erreur vérification auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoginLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
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
          description: `Bienvenue ${data.user.name || data.user.email} !`,
        });
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({ error: "Erreur de connexion" }));
        toast({
          title: "Erreur de connexion",
          description: errorData.error || "Identifiants incorrects",
          variant: "destructive",
        });
        return { success: false, error: errorData.error };
      }
    } catch (error: any) {
      console.error("Erreur login:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive",
      });
      return { success: false, error: "Erreur réseau" };
    } finally {
      setIsLoginLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsRegisterLoading(true);
    try {
      // Simuler l'inscription pour le moment
      // TODO: Implémenter l'endpoint d'inscription
      const mockUser = {
        id: "user_" + Date.now(),
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        role: data.role,
      };

      setUser(mockUser);
      toast({
        title: "Inscription réussie",
        description: `Bienvenue ${mockUser.name} !`,
      });
      return { success: true };
    } catch (error: any) {
      console.error("Erreur register:", error);
      toast({
        title: "Erreur d'inscription",
        description: "Impossible de créer le compte",
        variant: "destructive",
      });
      return { success: false, error: "Erreur réseau" };
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Pour JWT, on déconnecte côté client
      setUser(null);
      toast({
        title: "Déconnexion",
        description: "À bientôt !",
      });
    } catch (error) {
      console.error("Erreur logout:", error);
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
  };
}
