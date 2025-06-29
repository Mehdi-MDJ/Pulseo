/**
 * ==============================================================================
 * NurseLink AI - Middleware de Validation et Sanitization
 * ==============================================================================
 *
 * Validation et sanitization de toutes les entrées utilisateur
 * Protection contre les injections et attaques XSS
 * ==============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from '../services/loggerService';

// Schémas de validation pour les établissements
const establishmentSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),

  siret: z.string()
    .regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres')
    .transform(val => val.replace(/\s/g, '')),

  address: z.object({
    street: z.string()
      .min(5, 'L\'adresse doit contenir au moins 5 caractères')
      .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
      .transform(val => DOMPurify.sanitize(val.trim())),

    city: z.string()
      .min(2, 'La ville doit contenir au moins 2 caractères')
      .max(100, 'La ville ne peut pas dépasser 100 caractères')
      .transform(val => DOMPurify.sanitize(val.trim())),

    postalCode: z.string()
      .regex(/^\d{5}$/, 'Le code postal doit contenir exactement 5 chiffres'),

    country: z.string()
      .default('France')
      .transform(val => DOMPurify.sanitize(val.trim())),
  }),

  phone: z.string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Format de téléphone invalide')
    .transform(val => val.replace(/\s/g, '')),

  email: z.string()
    .email('Format d\'email invalide')
    .transform(val => val.toLowerCase().trim()),

  type: z.enum(['hospital', 'clinic', 'nursing_home', 'private_practice', 'other']),

  specialties: z.array(z.string())
    .min(1, 'Au moins une spécialité doit être sélectionnée')
    .max(10, 'Maximum 10 spécialités autorisées')
    .transform(val => val.map(s => DOMPurify.sanitize(s.trim()))),

  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .transform(val => val ? DOMPurify.sanitize(val.trim()) : undefined),

  website: z.string()
    .url('Format d\'URL invalide')
    .optional()
    .transform(val => val ? DOMPurify.sanitize(val.trim()) : undefined),
});

// Schémas de validation pour les missions
const missionSchema = z.object({
  title: z.string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),

  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),

  location: z.object({
    address: z.string()
      .min(5, 'L\'adresse doit contenir au moins 5 caractères')
      .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
      .transform(val => DOMPurify.sanitize(val.trim())),

    city: z.string()
      .min(2, 'La ville doit contenir au moins 2 caractères')
      .max(100, 'La ville ne peut pas dépasser 100 caractères')
      .transform(val => DOMPurify.sanitize(val.trim())),

    postalCode: z.string()
      .regex(/^\d{5}$/, 'Le code postal doit contenir exactement 5 chiffres'),
  }),

  startDate: z.string()
    .datetime('Format de date invalide')
    .refine(date => new Date(date) > new Date(), 'La date de début doit être dans le futur'),

  endDate: z.string()
    .datetime('Format de date invalide')
    .optional(),

  duration: z.number()
    .min(1, 'La durée doit être d\'au moins 1 heure')
    .max(168, 'La durée ne peut pas dépasser 168 heures (1 semaine)'),

  hourlyRate: z.number()
    .min(15, 'Le taux horaire minimum est de 15€')
    .max(200, 'Le taux horaire maximum est de 200€'),

  requiredSkills: z.array(z.string())
    .min(1, 'Au moins une compétence requise')
    .max(20, 'Maximum 20 compétences autorisées')
    .transform(val => val.map(s => DOMPurify.sanitize(s.trim()))),

  urgency: z.enum(['low', 'medium', 'high', 'critical']),

  shiftType: z.enum(['day', 'night', 'mixed']),

  maxCandidates: z.number()
    .min(1, 'Au moins 1 candidat requis')
    .max(50, 'Maximum 50 candidats autorisés')
    .default(10),

  additionalRequirements: z.string()
    .max(500, 'Les exigences supplémentaires ne peuvent pas dépasser 500 caractères')
    .optional()
    .transform(val => val ? DOMPurify.sanitize(val.trim()) : undefined),
});

// Schémas de validation pour l'authentification
const authSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .transform(val => val.toLowerCase().trim()),

  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
           'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
});

// Schémas de validation pour les profils infirmiers
const nurseProfileSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),

  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),

  email: z.string()
    .email('Format d\'email invalide')
    .transform(val => val.toLowerCase().trim()),

  phone: z.string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Format de téléphone invalide')
    .transform(val => val.replace(/\s/g, '')),

  address: z.object({
    street: z.string()
      .min(5, 'L\'adresse doit contenir au moins 5 caractères')
      .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
      .transform(val => DOMPurify.sanitize(val.trim())),

    city: z.string()
      .min(2, 'La ville doit contenir au moins 2 caractères')
      .max(100, 'La ville ne peut pas dépasser 100 caractères')
      .transform(val => DOMPurify.sanitize(val.trim())),

    postalCode: z.string()
      .regex(/^\d{5}$/, 'Le code postal doit contenir exactement 5 chiffres'),
  }),

  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .refine(date => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 70;
    }, 'L\'âge doit être compris entre 18 et 70 ans'),

  licenseNumber: z.string()
    .regex(/^\d{11}$/, 'Le numéro de licence doit contenir exactement 11 chiffres'),

  experience: z.number()
    .min(0, 'L\'expérience ne peut pas être négative')
    .max(50, 'L\'expérience ne peut pas dépasser 50 ans'),

  specialties: z.array(z.string())
    .min(1, 'Au moins une spécialité doit être sélectionnée')
    .max(15, 'Maximum 15 spécialités autorisées')
    .transform(val => val.map(s => DOMPurify.sanitize(s.trim()))),

  availability: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }),

  hourlyRate: z.number()
    .min(15, 'Le taux horaire minimum est de 15€')
    .max(200, 'Le taux horaire maximum est de 200€'),

  bio: z.string()
    .max(1000, 'La biographie ne peut pas dépasser 1000 caractères')
    .optional()
    .transform(val => val ? DOMPurify.sanitize(val.trim()) : undefined),
});

// Schémas de validation pour les candidatures
const applicationSchema = z.object({
  missionId: z.string()
    .uuid('ID de mission invalide'),

  coverLetter: z.string()
    .min(50, 'La lettre de motivation doit contenir au moins 50 caractères')
    .max(2000, 'La lettre de motivation ne peut pas dépasser 2000 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),

  proposedRate: z.number()
    .min(15, 'Le taux proposé minimum est de 15€')
    .max(200, 'Le taux proposé maximum est de 200€'),

  availability: z.object({
    startDate: z.string()
      .datetime('Format de date invalide'),

    endDate: z.string()
      .datetime('Format de date invalide')
      .optional(),
  }),

  additionalInfo: z.string()
    .max(500, 'Les informations supplémentaires ne peuvent pas dépasser 500 caractères')
    .optional()
    .transform(val => val ? DOMPurify.sanitize(val.trim()) : undefined),
});

// Schémas de validation pour les templates
const templateSchema = z.object({
  name: z.string()
    .min(3, 'Le nom du template doit contenir au moins 3 caractères')
    .max(100, 'Le nom du template ne peut pas dépasser 100 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),

  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .transform(val => val ? DOMPurify.sanitize(val.trim()) : undefined),

  missionData: missionSchema,
});

// Schémas de validation pour les contrats
const contractSchema = z.object({
  missionId: z.string()
    .uuid('ID de mission invalide'),

  nurseId: z.string()
    .uuid('ID d\'infirmier invalide'),

  startDate: z.string()
    .datetime('Format de date invalide'),

  endDate: z.string()
    .datetime('Format de date invalide')
    .optional(),

  hourlyRate: z.number()
    .min(15, 'Le taux horaire minimum est de 15€')
    .max(200, 'Le taux horaire maximum est de 200€'),

  terms: z.string()
    .min(50, 'Les conditions doivent contenir au moins 50 caractères')
    .max(5000, 'Les conditions ne peuvent pas dépasser 5000 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),
});

// Schémas de validation pour les requêtes d'IA
const aiRequestSchema = z.object({
  prompt: z.string()
    .min(10, 'Le prompt doit contenir au moins 10 caractères')
    .max(2000, 'Le prompt ne peut pas dépasser 2000 caractères')
    .transform(val => DOMPurify.sanitize(val.trim())),

  context: z.object({
    missionId: z.string().uuid().optional(),
    establishmentId: z.string().uuid().optional(),
    nurseId: z.string().uuid().optional(),
  }).optional(),

  maxTokens: z.number()
    .min(100, 'Le nombre minimum de tokens est 100')
    .max(4000, 'Le nombre maximum de tokens est 4000')
    .default(1000),

  temperature: z.number()
    .min(0, 'La température minimum est 0')
    .max(2, 'La température maximum est 2')
    .default(0.7),
});

// Fonction utilitaire pour créer un middleware de validation
function createValidationMiddleware(schema: z.ZodSchema, field: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[field];

      // Validation et transformation
      const validatedData = await schema.parseAsync(data);

      // Remplacer les données originales par les données validées
      req[field] = validatedData;

      // Logger la validation réussie
      logger.debug('Validation réussie', {
        endpoint: req.path,
        method: req.method,
        userId: req.user?.id,
      });

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formater les erreurs de validation
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Erreur de validation', {
          endpoint: req.path,
          method: req.method,
          userId: req.user?.id,
          errors: formattedErrors,
        });

        return res.status(400).json({
          error: 'Données invalides',
          message: 'Les données fournies ne respectent pas le format attendu',
          details: formattedErrors,
        });
      }

      logger.error('Erreur de validation inattendue', {
        endpoint: req.path,
        method: req.method,
        userId: req.user?.id,
        error: error,
      });

      return res.status(500).json({
        error: 'Erreur de validation',
        message: 'Une erreur est survenue lors de la validation des données',
      });
    }
  };
}

// Middlewares de validation spécifiques
export const validateEstablishment = createValidationMiddleware(establishmentSchema);
export const validateMission = createValidationMiddleware(missionSchema);
export const validateAuth = createValidationMiddleware(authSchema);
export const validateNurseProfile = createValidationMiddleware(nurseProfileSchema);
export const validateApplication = createValidationMiddleware(applicationSchema);
export const validateTemplate = createValidationMiddleware(templateSchema);
export const validateContract = createValidationMiddleware(contractSchema);
export const validateAiRequest = createValidationMiddleware(aiRequestSchema);

// Middleware de validation générique pour les IDs UUID
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uuidSchema = z.string().uuid('Format UUID invalide');

    try {
      const validatedId = uuidSchema.parse(req.params[paramName]);
      req.params[paramName] = validatedId;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('UUID invalide', {
          endpoint: req.path,
          method: req.method,
          paramName,
          value: req.params[paramName],
        });

        return res.status(400).json({
          error: 'ID invalide',
          message: `Le format de l'ID ${paramName} est invalide`,
        });
      }
      next(error);
    }
  };
};

// Middleware de sanitization générale
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitizer les paramètres de requête
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = DOMPurify.sanitize(req.query[key] as string);
        }
      });
    }

    // Sanitizer les paramètres d'URL
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = DOMPurify.sanitize(req.params[key]);
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Erreur de sanitization', {
      endpoint: req.path,
      method: req.method,
      error: error,
    });
    next(error);
  }
};

// Middleware de validation des headers
export const validateHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Valider le Content-Type uniquement pour les requêtes POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('application/json')) {
      logger.warn('Content-Type invalide', {
        endpoint: req.path,
        method: req.method,
        contentType,
      });

      return res.status(400).json({
        error: 'Content-Type invalide',
        message: 'Le Content-Type doit être application/json pour les requêtes POST/PUT/PATCH',
      });
    }
  }

  next();
};

// Export des schémas pour utilisation dans les tests
export {
  establishmentSchema,
  missionSchema,
  authSchema,
  nurseProfileSchema,
  applicationSchema,
  templateSchema,
  contractSchema,
  aiRequestSchema,
};
