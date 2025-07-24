import { z } from "zod";

/**
 * Validation améliorée du numéro SIRET
 * Vérifie la structure et l'algorithme de Luhn
 */
export const siretSchema = z.string()
  .min(1, "Le numéro SIRET est requis")
  .regex(/^\d{14}$/, "Le numéro SIRET doit contenir exactement 14 chiffres")
  .refine((siret) => {
    // Algorithme de Luhn pour valider le SIRET
    let sum = 0;
    let isEven = false;

    // Parcourir les chiffres de droite à gauche
    for (let i = siret.length - 1; i >= 0; i--) {
      let digit = parseInt(siret[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }, "Numéro SIRET invalide (algorithme de Luhn)");

/**
 * Validation du mot de passe avec politique de sécurité
 */
export const passwordSchema = z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères");

/**
 * Validation du numéro de téléphone français
 */
export const phoneSchema = z.string()
  .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Numéro de téléphone français invalide")
  .transform((phone) => {
    // Normaliser le format
    return phone.replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '');
  });

/**
 * Validation du code postal français
 */
export const postalCodeSchema = z.string()
  .regex(/^[0-9]{5}$/, "Le code postal doit contenir 5 chiffres")
  .refine((code) => {
    const num = parseInt(code);
    return num >= 1000 && num <= 99999;
  }, "Code postal invalide");

/**
 * Validation de l'email professionnel
 */
export const professionalEmailSchema = z.string()
  .email("Format d'email invalide")
  .refine((email) => {
    // Vérifier que ce n'est pas un email personnel courant
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'live.com', 'msn.com', 'aol.com', 'icloud.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return !personalDomains.includes(domain);
  }, "Veuillez utiliser une adresse email professionnelle");

/**
 * Schéma de validation pour l'inscription établissement
 */
export const establishmentSignupSchema = z.object({
  establishmentName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s\-'&.()]+$/, "Le nom contient des caractères non autorisés"),

  establishmentType: z.string()
    .min(1, "Veuillez sélectionner un type d'établissement"),

  siretNumber: siretSchema,

  address: z.string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères"),

  city: z.string()
    .min(2, "La ville doit contenir au moins 2 caractères")
    .max(50, "La ville ne peut pas dépasser 50 caractères"),

  postalCode: postalCodeSchema,

  contactFirstName: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Le prénom contient des caractères non autorisés"),

  contactLastName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Le nom contient des caractères non autorisés"),

  contactEmail: professionalEmailSchema,

  contactPhone: phoneSchema,

  contactPosition: z.string()
    .min(2, "Le poste doit contenir au moins 2 caractères")
    .max(100, "Le poste ne peut pas dépasser 100 caractères"),

  description: z.string()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .optional(),

  acceptTerms: z.boolean()
    .refine(val => val === true, "Vous devez accepter les conditions d'utilisation"),

  acceptRgpd: z.boolean()
    .refine(val => val === true, "Vous devez accepter la politique de confidentialité")
});

/**
 * Fonction utilitaire pour valider un SIRET avec l'API officielle
 * Note: Cette fonction nécessiterait une API officielle pour une validation complète
 */
export async function validateSiretWithAPI(siret: string): Promise<boolean> {
  try {
    // Simulation d'une validation API
    // En production, cela appellerait l'API SIRENE ou équivalente
    const response = await fetch(`/api/validation/siret/${siret}`);
    if (response.ok) {
      const data = await response.json();
      return data.valid;
    }
    return false;
  } catch (error) {
    console.warn('Impossible de valider le SIRET avec l\'API:', error);
    // En cas d'échec API, on se fie à la validation locale
    return true;
  }
}

/**
 * Fonction pour générer un mot de passe sécurisé temporaire
 */
export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  // Au moins une majuscule
  password += chars.charAt(Math.floor(Math.random() * 26));
  // Au moins une minuscule
  password += chars.charAt(26 + Math.floor(Math.random() * 26));
  // Au moins un chiffre
  password += chars.charAt(52 + Math.floor(Math.random() * 10));
  // Au moins un caractère spécial
  password += chars.charAt(62 + Math.floor(Math.random() * 8));

  // Compléter avec des caractères aléatoires
  for (let i = 4; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
