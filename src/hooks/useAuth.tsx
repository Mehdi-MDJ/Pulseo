/**
 * Hook d'authentification complet pour NurseLink AI
 */

import { useState, useEffect, createContext, useContext } from "react";
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const { toast } = useToast();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    console.log('[AuthProvider] Vérification de l\'authentification...');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        // Vérifier si la réponse est du JSON
        if (contentType && contentType.includes("application/json")) {
        const session = await response.json();
        if (session.user) {
          setUser(session.user);
          console.log('[AuthProvider] Utilisateur authentifié:', session.user);
        } else {
          setUser(null);
          console.log('[AuthProvider] Aucun utilisateur authentifié');
          }
        } else {
          // Si ce n'est pas du JSON (probablement du HTML), le serveur backend n'est pas démarré
          console.log('[AuthProvider] Serveur backend non disponible, utilisateur non authentifié');
          setUser(null);
        }
      } else {
        setUser(null);
        console.log('[AuthProvider] Session invalide');
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
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setUser(data.user);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.user.name || data.user.email} !`,
        });
        return { success: true };
      } else {
          // Serveur backend non disponible
        toast({
          title: "Erreur de connexion",
            description: "Le serveur backend n'est pas disponible. Veuillez le démarrer.",
          variant: "destructive",
        });
          return { success: false, error: "Serveur backend non disponible" };
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Erreur de connexion" }));
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Erreur login:", error);
      return { success: false, error: "Erreur de connexion" };
    } finally {
      setIsLoginLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsRegisterLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setUser(result.user);
      toast({
        title: "Inscription réussie",
            description: `Bienvenue ${result.user.name || result.user.email} !`,
      });
      return { success: true };
        } else {
          // Serveur backend non disponible
      toast({
        title: "Erreur d'inscription",
            description: "Le serveur backend n'est pas disponible. Veuillez le démarrer.",
        variant: "destructive",
      });
          return { success: false, error: "Serveur backend non disponible" };
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Erreur d'inscription" }));
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Erreur register:", error);
      return { success: false, error: "Erreur d'inscription" };
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erreur logout:", error);
    } finally {
      setUser(null);
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
      });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    isLoginLoading,
    isRegisterLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
