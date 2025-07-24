import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specializations: string[];
  experience: string;
  rating: number;
  missionsCompleted: number;
  level: number;
  rank: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

class AuthService {
  private baseURL = process.env.NODE_ENV === 'production'
    ? 'https://nurselink.ai/api'
    : 'http://localhost:5000/api';
  private tokenKey = '@nurselink_token';
  private userKey = '@nurselink_user';

  // Connexion
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${this.baseURL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Email ou mot de passe incorrect');
      }

      const data = await response.json();

      // Stockage du token et des données utilisateur
      await this.storeToken(data.token);
      await this.storeUser(data.user);

      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw new Error('Erreur de connexion. Veuillez réessayer.');
    }
  }

  // Inscription
  async signUp(signUpData: SignUpData): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${this.baseURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la création du compte');
      }

      const data = await response.json();

      await this.storeToken(data.token);
      await this.storeUser(data.user);

      return data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw new Error('Erreur lors de la création du compte. Veuillez réessayer.');
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.tokenKey, this.userKey]);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Obtenir le token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.tokenKey);
    } catch (error) {
      return null;
    }
  }

  // Obtenir les données utilisateur
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Stocker le token
  private async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Erreur lors du stockage du token:', error);
    }
  }

  // Stocker les données utilisateur
  private async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Erreur lors du stockage des données utilisateur:', error);
    }
  }

  // Mettre à jour les données utilisateur
  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      const currentUser = await this.getUser();
      if (!currentUser) {
        throw new Error('Utilisateur non trouvé');
      }

      const updatedUser = { ...currentUser, ...userData };
      await this.storeUser(updatedUser);

      return updatedUser;
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }

  // Rafraîchir le token
  async refreshToken(): Promise<string> {
    try {
      const currentToken = await this.getToken();
      if (!currentToken) {
        throw new Error('Aucun token trouvé');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du rafraîchissement du token');
      }

      const data = await response.json();
      await this.storeToken(data.token);

      return data.token;
    } catch (error) {
      throw new Error('Erreur lors du rafraîchissement du token');
    }
  }

  // Mot de passe oublié
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
      }
    } catch (error) {
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }

  // Réinitialiser le mot de passe
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (error) {
      throw new Error('Erreur lors de la réinitialisation du mot de passe');
    }
  }
}

export const authService = new AuthService();
