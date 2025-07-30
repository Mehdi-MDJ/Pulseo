import { z } from 'zod';

// Schéma de validation pour l'inscription
export const signupSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  firstName: z.string().min(2, { message: "Le prénom est requis" }),
  lastName: z.string().min(2, { message: "Le nom de famille est requis" }),
  role: z.enum(['nurse', 'facility'], { message: "Le rôle n'est pas valide" }),
});

// Schéma de validation pour la connexion
export const signinSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

// Schéma de validation pour la création de mission
export const missionSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères" }),
  location: z.string().min(3, { message: "La localisation est requise" }),
  hourlyRate: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Le taux horaire doit être un nombre valide" }),
  specialization: z.string().min(2, { message: "La spécialisation est requise" }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
