// Données centralisées pour éliminer les répétitions dans l'application

export const APP_CONSTANTS = {
  // Données utilisateur par défaut
  DEFAULT_USER: {
    name: 'Emma',
    level: 5,
    available: true,
    rating: 4.9,
    streak: 7,
    experience: 1250,
    nextLevel: 2000,
    rank: 'Expert',
    achievements: 8,
    totalMissions: 24,
  },

  // Mission en cours par défaut
  CURRENT_MISSION: {
    id: 1,
    title: 'Mission : Nuit Urgences',
    location: 'Hôpital Lyon Sud',
    time: '22h00 - 06h00',
    hourlyRate: 32,
    status: 'En cours',
  },

  // Statistiques rapides
  QUICK_STATS: [
    { id: 1, label: 'Missions', value: '24', icon: 'checkmark-circle', color: 'success', progress: 100 },
    { id: 2, label: 'Gains', value: '2840€', icon: 'cash', color: 'warning', progress: 75 },
    { id: 3, label: 'Note', value: '4.9', icon: 'star', color: 'warning', progress: 98 },
  ],

  // Missions à venir
  UPCOMING_MISSIONS: [
    {
      id: 1,
      title: 'Jour Urgences',
      establishment: 'CHU Lyon',
      location: 'Lyon, 69003',
      time: '08h00 - 16h00',
      hourlyRate: 28,
      matchScore: 95,
      urgency: 'high',
      bonus: '+10% bonus',
      shift: 'Jour',
      duration: '1 jour',
      specializations: ['Urgences'],
    },
    {
      id: 2,
      title: 'Nuit Réanimation',
      establishment: 'Hôpital Croix-Rousse',
      location: 'Lyon, 69004',
      time: '20h00 - 08h00',
      hourlyRate: 30,
      matchScore: 87,
      urgency: 'medium',
      bonus: '+5% bonus',
      shift: 'Nuit',
      duration: '1 nuit',
      specializations: ['Réanimation'],
    },
    {
      id: 3,
      title: 'Weekend Pédiatrie',
      establishment: 'Hôpital Femme-Mère-Enfant',
      location: 'Lyon, 69005',
      time: '08h00 - 20h00',
      hourlyRate: 26,
      matchScore: 92,
      urgency: 'low',
      bonus: null,
      shift: 'Jour',
      duration: '2 jours',
      specializations: ['Pédiatrie'],
    },
  ],

  // Défi quotidien
  DAILY_CHALLENGE: {
    title: 'Défi quotidien',
    description: 'Accepter 2 missions aujourd\'hui',
    progress: 1,
    total: 2,
    reward: '50 XP + 10€ bonus',
  },

  // Actions rapides
  QUICK_ACTIONS: [
    {
      id: 'applications',
      title: 'Mes candidatures',
      icon: 'document-text',
      color: 'primary',
      route: 'Applications',
    },
    {
      id: 'missions',
      title: 'Mes missions',
      icon: 'briefcase',
      color: 'warning',
      route: 'Missions',
    },
    {
      id: 'availability',
      title: 'Disponibilités',
      icon: 'calendar',
      color: 'secondary',
      route: 'Availability',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      color: 'info',
      route: 'Notifications',
    },
  ],

  // Onglets de navigation
  NAVIGATION_TABS: [
    {
      key: 'home',
      title: 'Accueil',
      icon: 'home-outline',
      iconFocused: 'home',
    },
    {
      key: 'missions',
      title: 'Missions',
      icon: 'briefcase-outline',
      iconFocused: 'briefcase',
      badge: 2,
    },
    {
      key: 'matches',
      title: 'Matchs',
      icon: 'heart-outline',
      iconFocused: 'heart',
      badge: 3,
    },
    {
      key: 'profile',
      title: 'Profil',
      icon: 'person-outline',
      iconFocused: 'person',
    },
  ],

  // Couleurs d'icônes pour les actions rapides
  ICON_COLORS: {
    primary: '#dbeafe',
    secondary: '#f3e8ff',
    success: '#d1fae5',
    warning: '#fef3c7',
    error: '#fee2e2',
    info: '#e0e7ff',
  },

  // Messages d'accessibilité
  ACCESSIBILITY: {
    MISSION_CARD: 'Mission {title} à {establishment}',
    MISSION_DETAILS: 'Appuyez pour voir les détails de la mission',
    APPLY_MISSION: 'Postuler à la mission',
    DECLINE_MISSION: 'Refuser la mission',
    ACCEPT_MISSION: 'Accepter la mission',
    BACK_BUTTON: 'Retour',
    BACK_HINT: 'Retourne à l\'écran précédent',
    MENU_BUTTON: 'Menu',
    MENU_HINT: 'Ouvre le menu principal',
    NOTIFICATIONS: 'Notifications ({count})',
    NOTIFICATIONS_HINT: 'Ouvre le centre de notifications',
    TAB_NAVIGATION: 'Ouvre l\'onglet {title}',
  },

  // Textes d'interface
  UI_TEXTS: {
    GREETING: 'Bonjour, {name} 👋',
    AVAILABLE: 'Disponible',
    BUSY: 'Occupé',
    STREAK_DAYS: '{count} jours consécutifs',
    LEVEL_PROGRESS: 'Niveau {level}',
    XP_PROGRESS: '{current}/{total} XP',
    NEXT_LEVEL: 'Plus que {xp} XP pour le niveau {level} !',
    VIEW_MISSION: 'Voir la mission',
    SEE_ALL: 'Voir tout',
    APPLY_NOW: 'Postuler maintenant',
    APPLY: 'Postuler',
    ACCEPT: 'Accepter',
    DECLINE: 'Refuser',
    SAVE: 'Enregistrer',
    CANCEL: 'Annuler',
    CONFIRM: 'Confirmer',
    DELETE: 'Supprimer',
    EDIT: 'Modifier',
    CLOSE: 'Fermer',
    OK: 'OK',
  },

  // Formats de date et heure
  TIME_FORMATS: {
    TIME_RANGE: '{start} - {end}',
    DURATION: '{count} {unit}',
    DATE_FORMAT: 'dd/MM/yyyy',
    TIME_FORMAT: 'HH:mm',
  },

  // Unités
  UNITS: {
    HOUR: 'h',
    DAY: 'jour',
    NIGHT: 'nuit',
    DAYS: 'jours',
    EUROS: '€',
    PER_HOUR: '€/h',
  },
};

// Types pour les données
export interface User {
  name: string;
  level: number;
  available: boolean;
  rating: number;
  streak: number;
  experience: number;
  nextLevel: number;
  rank: string;
  achievements: number;
  totalMissions: number;
}

export interface Mission {
  id: number;
  title: string;
  establishment: string;
  location: string;
  distance?: string;
  time: string;
  hourlyRate: number;
  shift: string;
  duration: string;
  matchScore: number;
  urgency: 'high' | 'medium' | 'low';
  specializations: string[];
  bonus?: string;
  status?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
}

export interface NavigationTab {
  key: string;
  title: string;
  icon: string;
  iconFocused: string;
  badge?: number;
}

export default APP_CONSTANTS;
