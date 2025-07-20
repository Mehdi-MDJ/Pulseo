import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { authService } from './authService';

// Configuration API - URL du backend
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://workspace--5000.replit.dev/api'
  : 'http://localhost:3000/api';

// Instance Axios configurée
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter les tokens d'authentification
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, supprimer le token local
      await SecureStore.deleteItemAsync('authToken');
      // Rediriger vers l'écran de connexion
      // Navigation sera gérée par le hook useAuth
    }
    return Promise.reject(error);
  }
);

// Types pour les API
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
  avatar?: string;
  bio?: string;
  availability?: any[];
  documents?: any[];
  certifications?: any[];
}

export interface Mission {
  id: string;
  title: string;
  establishment: string;
  location: string;
  distance: string;
  hourlyRate: number;
  shift: string;
  duration: string;
  matchScore: number;
  urgency: 'high' | 'medium' | 'low';
  specializations: string[];
  latitude?: number;
  longitude?: number;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NurseProfile {
  id: number;
  userId: string;
  specializations: string[];
  experience: number;
  certifications: string[];
  rating: number;
  location: string;
  availability: boolean;
}

// Interface pour les données de connexion
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface pour les données d'inscription
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'nurse' | 'establishment';
  // Champs spécifiques aux infirmiers
  rppsNumber?: string;
  adeliNumber?: string;
  specialization?: string;
  experience?: string;
}

// Services API
export const authService = {
  // Récupérer l'utilisateur connecté
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/user');
    return response.data.user || response.data;
  },

  // Connexion avec email/mot de passe
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await apiClient.post('/auth/login', credentials);

    // Stocker le token si fourni (pour une future utilisation)
    if (response.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }

    return response.data.user || response.data;
  },

  // Inscription
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post('/auth/register', data);

    // Stocker le token si fourni
    if (response.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }

    return response.data.user || response.data;
  },

  // Déconnexion
  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
    return apiClient.post('/auth/logout');
  },
};

export const profileService = {
  // Récupérer les profils (infirmiers et établissements)
  getProfiles: async () => {
    const response = await apiClient.get('/profiles');
    return response.data;
  },

  // Récupérer le profil d'un infirmier
  getNurseProfile: async (userId: string): Promise<NurseProfile> => {
    const response = await apiClient.get(`/profiles/nurse/${userId}`);
    return response.data;
  },

  // Mettre à jour le profil infirmier
  updateNurseProfile: async (profileData: Partial<NurseProfile>) => {
    const response = await apiClient.put('/profiles/nurse', profileData);
    return response.data;
  },
};

export const missionService = {
  // Récupérer les missions disponibles
  getMissions: async (): Promise<Mission[]> => {
    const response = await apiClient.get('/demo/missions');
    return response.data;
  },

  // Récupérer une mission par ID
  getMission: async (id: number): Promise<Mission> => {
    const response = await apiClient.get(`/missions/${id}`);
    return response.data;
  },

  // Postuler à une mission
  applyToMission: async (missionId: number, nurseId: number) => {
    const response = await apiClient.post(`/missions/${missionId}/apply`, {
      nurseId,
    });
    return response.data;
  },

  // Accepter une mission
  acceptMission: async (missionId: number, nurseId: number) => {
    const response = await apiClient.post(`/missions/${missionId}/accept`, {
      nurseId,
    });
    return response.data;
  },

  // Refuser une mission
  refuseMission: async (missionId: number, nurseId: number) => {
    const response = await apiClient.post(`/missions/${missionId}/refuse`, {
      nurseId,
    });
    return response.data;
  },
};

export const notificationService = {
  // Récupérer les notifications
  getNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId: number) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
};

// Utilitaires
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Une erreur inattendue s\'est produite';
};

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'mission_match' | 'new_message' | 'payment_received' | 'mission_reminder' | 'system';
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseURL = 'http://localhost:3000/api'; // Remplacez par votre URL d'API
  private timeout = 10000; // 10 secondes

  // Méthode générique pour les requêtes HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = await authService.getToken();

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré, essayer de le rafraîchir
          try {
            await authService.refreshToken();
            // Réessayer la requête avec le nouveau token
            return this.request<T>(endpoint, options);
          } catch (refreshError) {
            // Échec du rafraîchissement, déconnecter l'utilisateur
            await authService.logout();
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Délai d\'attente dépassé');
        }
        throw error;
      }
      throw new Error('Erreur réseau');
    }
  }

  // === MISSIONS ===

  // Obtenir toutes les missions
  async getMissions(filters?: {
    urgency?: string;
    specializations?: string[];
    maxDistance?: number;
    minRate?: number;
    shift?: string;
  }): Promise<Mission[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return this.request<Mission[]>(`/missions?${params.toString()}`);
  }

  // Obtenir une mission par ID
  async getMission(id: string): Promise<Mission> {
    return this.request<Mission>(`/missions/${id}`);
  }

  // Postuler à une mission
  async applyToMission(missionId: string, coverLetter?: string): Promise<void> {
    return this.request<void>(`/missions/${missionId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverLetter }),
    });
  }

  // Obtenir les missions recommandées
  async getRecommendedMissions(): Promise<Mission[]> {
    return this.request<Mission[]>('/missions/recommended');
  }

  // === UTILISATEURS ===

  // Obtenir le profil utilisateur
  async getUserProfile(): Promise<User> {
    return this.request<User>('/user/profile');
  }

  // Mettre à jour le profil utilisateur
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Mettre à jour la disponibilité
  async updateAvailability(availability: any[]): Promise<void> {
    return this.request<void>('/user/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    });
  }

  // Télécharger un document
  async uploadDocument(file: any, type: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<void>('/user/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  // === NOTIFICATIONS ===

  // Obtenir les notifications
  async getNotifications(limit?: number): Promise<Notification[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<Notification[]>(`/notifications${params}`);
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Marquer toutes les notifications comme lues
  async markAllNotificationsAsRead(): Promise<void> {
    return this.request<void>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<void> {
    return this.request<void>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // === CHAT ===

  // Obtenir les conversations
  async getChats(): Promise<Chat[]> {
    return this.request<Chat[]>('/chats');
  }

  // Obtenir les messages d'une conversation
  async getChatMessages(chatId: string, limit?: number): Promise<ChatMessage[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<ChatMessage[]>(`/chats/${chatId}/messages${params}`);
  }

  // Envoyer un message
  async sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<ChatMessage> {
    return this.request<ChatMessage>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  // Marquer les messages comme lus
  async markMessagesAsRead(chatId: string): Promise<void> {
    return this.request<void>(`/chats/${chatId}/read`, {
      method: 'PUT',
    });
  }

  // === PAIEMENTS ===

  // Obtenir l'historique des paiements
  async getPaymentHistory(): Promise<any[]> {
    return this.request<any[]>('/payments/history');
  }

  // Obtenir le solde du compte
  async getAccountBalance(): Promise<{ balance: number; currency: string }> {
    return this.request<{ balance: number; currency: string }>('/payments/balance');
  }

  // Demander un retrait
  async requestWithdrawal(amount: number, bankAccount: any): Promise<void> {
    return this.request<void>('/payments/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, bankAccount }),
    });
  }

  // === ANALYTICS ===

  // Obtenir les statistiques
  async getStats(): Promise<{
    totalMissions: number;
    completedMissions: number;
    totalEarnings: number;
    averageRating: number;
    monthlyStats: any[];
  }> {
    return this.request<any>('/analytics/stats');
  }

  // Obtenir les performances
  async getPerformance(): Promise<{
    responseTime: number;
    acceptanceRate: number;
    completionRate: number;
    customerSatisfaction: number;
  }> {
    return this.request<any>('/analytics/performance');
  }

  // === RECHERCHE ET FILTRES ===

  // Rechercher des missions
  async searchMissions(query: string): Promise<Mission[]> {
    return this.request<Mission[]>(`/missions/search?q=${encodeURIComponent(query)}`);
  }

  // Obtenir les spécialisations disponibles
  async getSpecializations(): Promise<string[]> {
    return this.request<string[]>('/specializations');
  }

  // Obtenir les établissements
  async getEstablishments(): Promise<any[]> {
    return this.request<any[]>('/establishments');
  }

  // === FAVORIS ===

  // Ajouter une mission aux favoris
  async addToFavorites(missionId: string): Promise<void> {
    return this.request<void>(`/missions/${missionId}/favorite`, {
      method: 'POST',
    });
  }

  // Retirer une mission des favoris
  async removeFromFavorites(missionId: string): Promise<void> {
    return this.request<void>(`/missions/${missionId}/favorite`, {
      method: 'DELETE',
    });
  }

  // Obtenir les missions favorites
  async getFavoriteMissions(): Promise<Mission[]> {
    return this.request<Mission[]>('/missions/favorites');
  }

  // === ÉVALUATIONS ===

  // Évaluer une mission
  async rateMission(missionId: string, rating: number, comment?: string): Promise<void> {
    return this.request<void>(`/missions/${missionId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  // Obtenir les évaluations reçues
  async getReceivedRatings(): Promise<any[]> {
    return this.request<any[]>('/ratings/received');
  }

  // === SUPPORT ===

  // Contacter le support
  async contactSupport(subject: string, message: string, category: string): Promise<void> {
    return this.request<void>('/support/contact', {
      method: 'POST',
      body: JSON.stringify({ subject, message, category }),
    });
  }

  // Obtenir la FAQ
  async getFAQ(): Promise<any[]> {
    return this.request<any[]>('/support/faq');
  }

  // === VERSION ET MAINTENANCE ===

  // Vérifier la version de l'application
  async checkAppVersion(): Promise<{
    version: string;
    requiresUpdate: boolean;
    forceUpdate: boolean;
    changelog: string;
  }> {
    return this.request<any>('/app/version');
  }

  // Vérifier le statut du serveur
  async checkServerStatus(): Promise<{
    status: 'online' | 'maintenance' | 'offline';
    message?: string;
    estimatedDowntime?: string;
  }> {
    return this.request<any>('/app/status');
  }
}

export const apiService = new ApiService();
