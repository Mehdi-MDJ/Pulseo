export type Language = "fr" | "en";

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": {
    fr: "Accueil",
    en: "Home"
  },
  "nav.features": {
    fr: "Fonctionnalités",
    en: "Features"
  },
  "nav.pricing": {
    fr: "Tarifs",
    en: "Pricing"
  },
  "nav.login": {
    fr: "Connexion",
    en: "Login"
  },
  "nav.signup": {
    fr: "Inscription",
    en: "Sign Up"
  },

  // Hero Section
  "hero.title": {
    fr: "Matching Intelligent",
    en: "Intelligent Matching"
  },
  "hero.subtitle": {
    fr: "Infirmiers & Établissements",
    en: "Nurses & Healthcare Facilities"
  },
  "hero.description": {
    fr: "Plateforme de mise en relation révolutionnaire utilisant l'IA pour optimiser les affectations temporaires dans le secteur de la santé. Conformité RGPD garantie.",
    en: "Revolutionary platform using AI to optimize temporary assignments in healthcare. GDPR compliance guaranteed."
  },
  "hero.btn.nurse": {
    fr: "Je suis Infirmier(e)",
    en: "I'm a Nurse"
  },
  "hero.btn.establishment": {
    fr: "Je suis Établissement",
    en: "I'm a Healthcare Facility"
  },

  // Features
  "features.certified": {
    fr: "Certifié RGPD",
    en: "GDPR Certified"
  },
  "features.matching": {
    fr: "Matching en 24h",
    en: "24h Matching"
  },
  "features.satisfaction": {
    fr: "98% Satisfaction",
    en: "98% Satisfaction"
  },

  // Mobile App
  "mobile.title": {
    fr: "Application Mobile pour les",
    en: "Mobile Application for"
  },
  "mobile.nurses": {
    fr: "Infirmiers",
    en: "Nurses"
  },
  "mobile.description": {
    fr: "Interface intuitive avec géolocalisation, matching IA, et gestion complète des missions",
    en: "Intuitive interface with geolocation, AI matching, and complete mission management"
  },

  // Dashboard
  "dashboard.title": {
    fr: "Dashboard IA pour les",
    en: "AI Dashboard for"
  },
  "dashboard.establishments": {
    fr: "Établissements",
    en: "Healthcare Facilities"
  },
  "dashboard.description": {
    fr: "Prédictions d'absences, matching intelligent et gestion complète des équipes temporaires",
    en: "Absence predictions, intelligent matching and complete temporary team management"
  },

  // Mission Status
  "mission.status.open": {
    fr: "Ouvert",
    en: "Open"
  },
  "mission.status.pending": {
    fr: "En attente",
    en: "Pending"
  },
  "mission.status.accepted": {
    fr: "Accepté",
    en: "Accepted"
  },
  "mission.status.in_progress": {
    fr: "En cours",
    en: "In Progress"
  },
  "mission.status.completed": {
    fr: "Terminé",
    en: "Completed"
  },
  "mission.status.cancelled": {
    fr: "Annulé",
    en: "Cancelled"
  },

  // Common Actions
  "action.accept": {
    fr: "Accepter",
    en: "Accept"
  },
  "action.refuse": {
    fr: "Refuser",
    en: "Refuse"
  },
  "action.apply": {
    fr: "Postuler",
    en: "Apply"
  },
  "action.manage": {
    fr: "Gérer",
    en: "Manage"
  },
  "action.create": {
    fr: "Créer",
    en: "Create"
  },
  "action.edit": {
    fr: "Modifier",
    en: "Edit"
  },
  "action.save": {
    fr: "Enregistrer",
    en: "Save"
  },
  "action.cancel": {
    fr: "Annuler",
    en: "Cancel"
  },

  // Form Labels
  "form.email": {
    fr: "Email",
    en: "Email"
  },
  "form.password": {
    fr: "Mot de passe",
    en: "Password"
  },
  "form.firstName": {
    fr: "Prénom",
    en: "First Name"
  },
  "form.lastName": {
    fr: "Nom",
    en: "Last Name"
  },
  "form.phone": {
    fr: "Téléphone",
    en: "Phone"
  },
  "form.address": {
    fr: "Adresse",
    en: "Address"
  },

  // Errors and Messages
  "error.generic": {
    fr: "Une erreur s'est produite. Veuillez réessayer.",
    en: "An error occurred. Please try again."
  },
  "success.saved": {
    fr: "Enregistré avec succès",
    en: "Successfully saved"
  },
  "success.created": {
    fr: "Créé avec succès",
    en: "Successfully created"
  },
  "success.updated": {
    fr: "Mis à jour avec succès",
    en: "Successfully updated"
  },

  // Specializations
  "specialization.general": {
    fr: "Médecine générale",
    en: "General Medicine"
  },
  "specialization.cardiology": {
    fr: "Cardiologie",
    en: "Cardiology"
  },
  "specialization.emergency": {
    fr: "Urgences",
    en: "Emergency"
  },
  "specialization.icu": {
    fr: "Réanimation",
    en: "ICU"
  },
  "specialization.pediatrics": {
    fr: "Pédiatrie",
    en: "Pediatrics"
  },
  "specialization.surgery": {
    fr: "Chirurgie",
    en: "Surgery"
  },
  "specialization.geriatrics": {
    fr: "Gériatrie",
    en: "Geriatrics"
  },
  "specialization.psychiatry": {
    fr: "Psychiatrie",
    en: "Psychiatry"
  },
  "specialization.oncology": {
    fr: "Oncologie",
    en: "Oncology"
  },
  "specialization.maternity": {
    fr: "Maternité",
    en: "Maternity"
  }
};

class I18n {
  private currentLanguage: Language = "fr";

  constructor() {
    // Get language from localStorage or browser preference
    const savedLanguage = localStorage.getItem("nurselink-language") as Language;
    if (savedLanguage && ["fr", "en"].includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0];
      this.currentLanguage = ["fr", "en"].includes(browserLang) ? browserLang as Language : "fr";
    }
  }

  setLanguage(language: Language) {
    this.currentLanguage = language;
    localStorage.setItem("nurselink-language", language);
    
    // Dispatch custom event for language change
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: language }));
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  t(key: string, fallback?: string): string {
    const translation = translations[key];
    if (translation && translation[this.currentLanguage]) {
      return translation[this.currentLanguage];
    }
    
    // Return fallback or key if translation not found
    return fallback || key;
  }

  // Helper method for pluralization (basic implementation)
  tn(key: string, count: number, fallback?: string): string {
    const singular = this.t(key, fallback);
    const pluralKey = `${key}.plural`;
    const plural = this.t(pluralKey, singular);
    
    return count === 1 ? singular : plural;
  }

  // Format date according to current language
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const locale = this.currentLanguage === "fr" ? "fr-FR" : "en-US";
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    
    return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
  }

  // Format currency according to current language
  formatCurrency(amount: number): string {
    const locale = this.currentLanguage === "fr" ? "fr-FR" : "en-US";
    const currency = "EUR"; // Always EUR for this app
    
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  }

  // Get available languages
  getAvailableLanguages(): { code: Language; name: string; flag: string }[] {
    return [
      { code: "fr", name: "Français", flag: "🇫🇷" },
      { code: "en", name: "English", flag: "🇬🇧" },
    ];
  }
}

// Export singleton instance
export const i18n = new I18n();

// Export hook for React components
import { useState, useEffect } from "react";

export function useTranslation() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    return () => window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  return {
    t: i18n.t.bind(i18n),
    tn: i18n.tn.bind(i18n),
    language: i18n.getLanguage(),
    setLanguage: i18n.setLanguage.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    availableLanguages: i18n.getAvailableLanguages(),
  };
}

// Export default instance
export default i18n;
