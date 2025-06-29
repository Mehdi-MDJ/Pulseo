import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const sessionToken = localStorage.getItem('sessionToken');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (sessionToken) {
    defaultHeaders['Authorization'] = `Bearer ${sessionToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(`/api${endpoint}`, config);

    // Gestion spécifique des codes d'erreur HTTP
    if (!response.ok) {
      let errorMessage = 'Erreur inconnue';
      let errorDetails = null;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Erreur ${response.status}`;
        errorDetails = errorData.details || errorData;
      } catch {
        // Si le parsing JSON échoue, utiliser le message par défaut
        switch (response.status) {
          case 400:
            errorMessage = 'Données invalides - vérifiez les informations saisies';
            break;
          case 401:
            errorMessage = 'Session expirée - veuillez vous reconnecter';
            // Rediriger vers la page de connexion si nécessaire
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sessionToken');
              localStorage.removeItem('tokenExpiry');
              window.location.href = '/auth';
            }
            break;
          case 403:
            errorMessage = 'Accès refusé - vous n\'avez pas les permissions nécessaires';
            break;
          case 404:
            errorMessage = 'Ressource introuvable - vérifiez l\'URL ou l\'identifiant';
            break;
          case 409:
            errorMessage = 'Conflit - cette ressource existe déjà ou est en conflit';
            break;
          case 422:
            errorMessage = 'Données de validation incorrectes';
            break;
          case 429:
            errorMessage = 'Trop de requêtes - veuillez patienter avant de réessayer';
            break;
          case 500:
            errorMessage = 'Erreur serveur - veuillez réessayer plus tard';
            break;
          case 503:
            errorMessage = 'Service temporairement indisponible';
            break;
          default:
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorDetails;
      throw error;
    }

    // Vérifier si la réponse est vide
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null; // Pas de contenu
    } else {
      return await response.text();
    }

  } catch (error: any) {
    // Gestion des erreurs réseau
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Erreur de connexion - vérifiez votre connexion internet');
      (networkError as any).isNetworkError = true;
      throw networkError;
    }

    // Répercuter les erreurs déjà formatées
    if (error.status) {
      throw error;
    }

    // Erreur générique
    const genericError = new Error('Erreur lors de la communication avec le serveur');
    (genericError as any).originalError = error;
    throw genericError;
  }
}
