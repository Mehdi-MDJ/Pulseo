/**
 * ==============================================================================
 * NurseLink AI - Schéma de Base de Données
 * ==============================================================================
 *
 * Ce fichier définit la structure complète de la base de données SQLite
 * pour la plateforme NurseLink AI. Il utilise Drizzle ORM pour la gestion
 * des types TypeScript et des migrations.
 *
 * Architecture des données :
 * - users : Authentification et informations de base
 * - nurseProfiles : Profils complets des infirmiers
 * - establishmentProfiles : Profils des établissements de santé
 * - missions : Offres de missions temporaires
 * - missionApplications : Candidatures des infirmiers
 * - documents : Gestion des documents (CV, certifications)
 * - invoices : Facturation et paiements
 * - absenceForecasts : Prévisions IA d'absences
 * - sessions : Stockage des sessions utilisateur
 *
 * Conformité RGPD :
 * - Tous les champs sensibles sont explicitement marqués
 * - Timestamps pour audit trail complet
 * - Support du droit à l'oubli via soft delete
 * ==============================================================================
 */

import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

/**
 * ==============================================================================
 * TABLE: sessions
 * ==============================================================================
 * Stockage des sessions utilisateur pour l'authentification Replit OAuth
 * IMPORTANT: Cette table est obligatoire pour Replit Auth
 */
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: blob("sess").notNull(),
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
);

/**
 * ==============================================================================
 * TABLE: notifications
 * ==============================================================================
 * Notifications push pour l'app mobile des infirmiers
 */
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nurseId: integer("nurse_id").notNull().references(() => nurseProfiles.id, { onDelete: "cascade" }),
  missionId: integer("mission_id").references(() => missions.id, { onDelete: "cascade" }),

  // Type de notification
  type: text("type").notNull(), // 'new_mission_match', 'mission_accepted', 'mission_rejected', 'new_message', 'payment_received'

  // Contenu de la notification
  title: text("title").notNull(),
  message: text("message").notNull(),

  // Données supplémentaires (JSON)
  metadata: text("metadata").default("{}"), // Score de matching, distance, etc.

  // Statut de la notification
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  isSent: integer("is_sent", { mode: 'boolean' }).default(false),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  readAt: integer("read_at", { mode: 'timestamp' }),
  sentAt: integer("sent_at", { mode: 'timestamp' }),
});

/**
 * ==============================================================================
 * TABLE: users
 * ==============================================================================
 * Table principale des utilisateurs (infirmiers et établissements)
 * IMPORTANT: Cette table est obligatoire pour Replit Auth
 */
export const users = sqliteTable("users", {
  // Identifiant unique (peut être fourni par OAuth ou généré localement)
  id: text("id").primaryKey().notNull(),

  // Informations personnelles (RGPD sensible)
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),

  // Authentification locale (optionnelle si OAuth utilisé)
  passwordHash: text("password_hash"), // Hash bcrypt pour auth locale

  // Rôle utilisateur : détermine les fonctionnalités accessibles
  role: text("role").notNull().default("nurse"),

  // Langue préférée de l'utilisateur
  language: text("language").default("fr"),

  // Conformité RGPD : consentement aux conditions générales
  cguAccepted: integer("cgu_accepted", { mode: 'boolean' }).default(false),
  cguAcceptedAt: integer("cgu_accepted_at", { mode: 'timestamp' }),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: nurseProfiles
 * ==============================================================================
 * Profils détaillés des infirmiers avec compétences et disponibilités
 */
export const nurseProfiles = sqliteTable("nurse_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Informations personnelles étendues
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"), // SQLite n'a pas de type date natif
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),

  // Informations professionnelles
  licenseNumber: text("license_number").unique(), // Numéro ADELI
  experience: integer("experience").default(0), // Années d'expérience
  specializations: text("specializations").default("[]"), // JSON string
  certifications: text("certifications").default("[]"), // JSON string

  // Système de notation et performance
  rating: real("rating").default(0.0),
  completedMissions: integer("completed_missions").default(0),
  totalEarnings: real("total_earnings").default(0.0),

  // Disponibilités et préférences
  availability: text("availability").default("{}"), // JSON string
  maxDistance: integer("max_distance").default(50), // Distance max en km
  hourlyRateMin: real("hourly_rate_min"),
  hourlyRateMax: real("hourly_rate_max"),

  // Préférences de mission
  preferredShifts: text("preferred_shifts").default("[]"), // JSON string
  preferredSpecializations: text("preferred_specializations").default("[]"), // JSON string

  // Statut du profil
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  isVerified: integer("is_verified", { mode: 'boolean' }).default(false), // Vérification des documents

  // Coordonnées géographiques pour le matching
  latitude: real("latitude"),
  longitude: real("longitude"),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: establishmentProfiles
 * ==============================================================================
 * Profils des établissements de santé
 */
export const establishmentProfiles = sqliteTable("establishment_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Informations légales
  name: text("name").notNull(),
  siret: text("siret").unique(), // Numéro SIRET
  type: text("type").notNull(), // "hospital", "clinic", "ehpad", etc.

  // Informations de contact
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  phone: text("phone"),
  website: text("website"),

  // Contact RH
  contactPersonName: text("contact_person_name"),
  contactPersonEmail: text("contact_person_email"),
  contactPersonPhone: text("contact_person_phone"),

  // Informations sur l'établissement
  capacity: integer("capacity"), // Nombre de lits
  bedCount: integer("bed_count"), // Nombre de lits (alias pour compatibilité)
  specialties: text("specialties").default("[]"), // JSON string
  specializations: text("specializations").default("[]"), // JSON string
  services: text("services").default("[]"), // JSON string
  description: text("description"), // Description de l'établissement

  // Système de notation
  rating: real("rating").default(0.0),
  totalMissions: integer("total_missions").default(0),

  // Coordonnées géographiques
  latitude: real("latitude"),
  longitude: real("longitude"),

  // Configuration de scoring personnalisé
  customScoringEnabled: integer("custom_scoring_enabled", { mode: 'boolean' }).default(false),
  selectedCriteria: text("selected_criteria").default("[]"), // JSON string
  customWeights: text("custom_weights").default("{}"), // JSON string
  specificCriterion: text("specific_criterion"), // Critère unique de l'établissement
  specificCriterionWeight: integer("specific_criterion_weight").default(10), // Poids du critère spécifique

  // Statut
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  isVerified: integer("is_verified", { mode: 'boolean' }).default(false),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: missions
 * ==============================================================================
 * Offres de missions temporaires publiées par les établissements
 */
export const missions = sqliteTable("missions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  establishmentId: integer("establishment_id").notNull().references(() => establishmentProfiles.id),

  // Informations de base
  title: text("title").notNull(),
  description: text("description").notNull(),
  specialization: text("specialization").notNull(),

  // Détails temporels
  startDate: integer("start_date", { mode: 'timestamp' }).notNull(),
  endDate: integer("end_date", { mode: 'timestamp' }).notNull(),
  startTime: text("start_time"), // Format "HH:MM"
  endTime: text("end_time"), // Format "HH:MM"
  shift: text("shift"), // "matin", "apres-midi", "nuit", "jour"
  hoursPerDay: real("hours_per_day").default(8.0),
  durationDays: integer("duration_days").default(1),

  // Rémunération
  hourlyRate: real("hourly_rate").notNull(),
  totalHours: real("total_hours"),

  // Exigences
  requiredExperience: integer("required_experience").default(0),
  requiredCertifications: text("required_certifications").default("[]"), // JSON string
  urgencyLevel: text("urgency_level").default("medium"), // "low", "medium", "high"

  // Statut et matching
  status: text("status").default("draft"), // "draft", "published", "in_progress", "completed", "cancelled"
  selectedNurseId: integer("selected_nurse_id").references(() => nurseProfiles.id),
  aiMatchingScore: real("ai_matching_score"), // Score de compatibilité IA
  applicationCount: integer("application_count").default(0),

  // Localisation
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  latitude: real("latitude"),
  longitude: real("longitude"),

  // Type de contrat
  contractType: text("contract_type").default("cdd"), // "cdd", "cdi", "liberal"

  // Template
  isTemplate: integer("is_template", { mode: 'boolean' }).default(false),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: missionApplications
 * ==============================================================================
 * Candidatures des infirmiers aux missions
 */
export const missionApplications = sqliteTable("mission_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  missionId: integer("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  nurseId: integer("nurse_id").notNull().references(() => nurseProfiles.id, { onDelete: "cascade" }),

  // Statut de la candidature
  status: text("status").default("pending"), // "pending", "accepted", "rejected", "withdrawn"

  // Contenu de la candidature
  coverLetter: text("cover_letter"),
  establishmentFeedback: text("establishment_feedback"),

  // Scoring IA
  aiScore: real("ai_score"), // Score de compatibilité IA (0-1)
  aiReasons: text("ai_reasons").default("[]"), // Raisons du score IA

  // Timestamps
  appliedAt: integer("applied_at", { mode: 'timestamp' }).defaultNow(),
  respondedAt: integer("responded_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: documents
 * ==============================================================================
 * Gestion des documents (CV, certificats, etc.)
 */
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Métadonnées du document
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),

  // Type et statut
  type: text("type", { enum: ["cv", "certificate", "license", "photo", "other"] }).notNull(),
  isVerified: integer("is_verified", { mode: 'boolean' }).default(false),

  // Stockage
  url: text("url"), // URL de stockage (cloud)

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: invoices
 * ==============================================================================
 * Facturation et paiements
 */
export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  missionId: integer("mission_id").notNull().references(() => missions.id),
  nurseId: integer("nurse_id").notNull().references(() => nurseProfiles.id),
  establishmentId: integer("establishment_id").notNull().references(() => establishmentProfiles.id),

  // Informations financières
  amount: real("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("EUR"),
  taxRate: real("tax_rate", { precision: 5, scale: 4 }).default(0.20),
  taxAmount: real("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: real("total_amount", { precision: 10, scale: 2 }).notNull(),

  // Statut et dates
  status: text("status", { enum: ["draft", "sent", "paid", "overdue", "cancelled"] }).default("draft"),
  issuedAt: integer("issued_at", { mode: 'timestamp' }),
  dueAt: integer("due_at", { mode: 'timestamp' }),
  paidAt: integer("paid_at", { mode: 'timestamp' }),

  // Références
  invoiceNumber: text("invoice_number").unique(),
  paymentReference: text("payment_reference"),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: absenceForecasts
 * ==============================================================================
 * Prévisions d'absences générées par l'IA
 */
export const absenceForecasts = sqliteTable("absence_forecasts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  establishmentId: integer("establishment_id").notNull().references(() => establishmentProfiles.id),

  // Prévision
  forecastDate: integer("forecast_date", { mode: 'timestamp' }).notNull(),
  expectedAbsences: integer("expected_absences").notNull(),
  confidence: real("confidence", { precision: 5, scale: 4 }).notNull(),

  // Détails par service/spécialisation
  specialization: text("specialization"),
  shift: text("shift"), // "matin", "apres-midi", "nuit", "jour"

  // Facteurs de prévision
  factors: text("factors").default("{}"), // Facteurs identifiés par l'IA

  // Statut
  isActive: integer("is_active", { mode: 'boolean' }).default(true),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: contracts
 * ==============================================================================
 * Contrats générés automatiquement lors de l'acceptation d'une mission
 */
export const contracts = sqliteTable("contracts", {
  id: text("id").primaryKey(),

  // Relations
  missionId: integer("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  nurseId: text("nurse_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  establishmentId: text("establishment_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Informations du contrat
  contractNumber: text("contract_number", { length: 50 }).unique().notNull(),
  title: text("title", { length: 200 }).notNull(),

  // Détails de la mission
  startDate: integer("start_date", { mode: 'timestamp' }).notNull(),
  endDate: integer("end_date", { mode: 'timestamp' }).notNull(),
  hourlyRate: real("hourly_rate", { precision: 8, scale: 2 }).notNull(),
  totalHours: real("total_hours", { precision: 6, scale: 2 }).notNull(),
  totalAmount: real("total_amount", { precision: 10, scale: 2 }).notNull(),

  // Contenu du contrat
  contractContent: text("contract_content").notNull(), // HTML du contrat généré
  contractPdf: text("contract_pdf"), // Base64 du PDF ou URL de stockage

  // Statut du contrat
  status: text("status", {
    enum: ["generated", "sent", "signed_nurse", "signed_establishment", "completed", "cancelled"]
  }).default("generated").notNull(),

  // Signatures électroniques
  nurseSignature: text("nurse_signature"), // { signature: base64, signedAt: timestamp, ip: string }
  establishmentSignature: text("establishment_signature"),

  // Métadonnées légales
  legalTerms: text("legal_terms"), // Termes et conditions appliqués
  governingLaw: text("governing_law", { length: 100 }).default("Droit français"),

  // Notifications
  sentToNurseAt: integer("sent_to_nurse_at", { mode: 'timestamp' }),
  sentToEstablishmentAt: integer("sent_to_establishment_at", { mode: 'timestamp' }),
  remindersSent: integer("reminders_sent").default(0),

  // Audit trail
  generatedAt: integer("generated_at", { mode: 'timestamp' }).defaultNow(),
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: contractTemplates
 * ==============================================================================
 * Templates de contrats personnalisables par établissement
 */
export const contractTemplates = sqliteTable("contract_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Relations
  establishmentId: text("establishment_id").references(() => users.id, { onDelete: "cascade" }),

  // Informations du template
  name: text("name", { length: 100 }).notNull(),
  description: text("description"),
  isDefault: integer("is_default", { mode: 'boolean' }).default(false),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),

  // Contenu du template
  templateHtml: text("template_html").notNull(), // Template HTML avec variables {{}}
  headerContent: text("header_content"), // En-tête personnalisé
  footerContent: text("footer_content"), // Pied de page personnalisé

  // Variables disponibles
  availableVariables: text("available_variables"), // Liste des variables utilisables

  // Configuration
  signatureRequired: integer("signature_required", { mode: 'boolean' }).default(true),
  autoSend: integer("auto_send", { mode: 'boolean' }).default(true),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * TABLE: missionTemplates
 * ==============================================================================
 * Templates de missions personnalisables par établissement
 * Permet de créer rapidement des missions récurrentes
 */
export const missionTemplates = sqliteTable("mission_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Relations
  establishmentId: text("establishment_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Informations du template
  name: text("name", { length: 100 }).notNull(),
  description: text("description"),
  category: text("category", { length: 50 }), // "urgences", "pediatrie", "geriatrie", etc.
  isDefault: integer("is_default", { mode: 'boolean' }).default(false),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),

  // Détails de la mission
  title: text("title", { length: 200 }).notNull(),
  specialization: text("specialization", { length: 100 }).notNull(),
  requirements: text("requirements"), // Compétences requises
  responsibilities: text("responsibilities"), // Responsabilités

  // Conditions de travail
  hourlyRate: real("hourly_rate", { precision: 8, scale: 2 }),
  shiftDuration: integer("shift_duration").default(8), // Durée en heures
  preferredShifts: text("preferred_shifts").default("[]"), // ["matin", "apres-midi", "nuit"]
  urgencyLevel: text("urgency_level", { enum: ["low", "medium", "high", "critical"] }).default("medium"),

  // Configuration du matching
  minExperience: integer("min_experience").default(0),
  requiredCertifications: text("required_certifications").default("[]"),
  preferredSpecializations: text("preferred_specializations").default("[]"),

  // Métadonnées
  tags: text("tags").default("[]"), // Tags pour la recherche
  estimatedDuration: integer("estimated_duration"), // Durée estimée en jours
  maxDistance: integer("max_distance").default(50), // Distance max en km

  // Statistiques d'utilisation
  usageCount: integer("usage_count").default(0), // Nombre de fois utilisé
  lastUsedAt: integer("last_used_at", { mode: 'timestamp' }),

  // Audit trail
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

/**
 * ==============================================================================
 * RELATIONS
 * ==============================================================================
 * Définition des relations entre tables pour Drizzle ORM
 */

export const usersRelations = relations(users, ({ one, many }) => ({
  nurseProfile: one(nurseProfiles, {
    fields: [users.id],
    references: [nurseProfiles.userId],
  }),
  establishmentProfile: one(establishmentProfiles, {
    fields: [users.id],
    references: [establishmentProfiles.userId],
  }),
}));

export const nurseProfilesRelations = relations(nurseProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [nurseProfiles.userId],
    references: [users.id],
  }),
  applications: many(missionApplications),
  invoices: many(invoices),
}));

export const establishmentProfilesRelations = relations(establishmentProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [establishmentProfiles.userId],
    references: [users.id],
  }),
  missions: many(missions),
  invoices: many(invoices),
  forecasts: many(absenceForecasts),
  missionTemplates: many(missionTemplates),
}));

export const missionsRelations = relations(missions, ({ one, many }) => ({
  establishment: one(establishmentProfiles, {
    fields: [missions.establishmentId],
    references: [establishmentProfiles.id],
  }),
  selectedNurse: one(nurseProfiles, {
    fields: [missions.selectedNurseId],
    references: [nurseProfiles.id],
  }),
  applications: many(missionApplications),
  invoices: many(invoices),
}));

export const missionApplicationsRelations = relations(missionApplications, ({ one }) => ({
  mission: one(missions, {
    fields: [missionApplications.missionId],
    references: [missions.id],
  }),
  nurse: one(nurseProfiles, {
    fields: [missionApplications.nurseId],
    references: [nurseProfiles.id],
  }),
}));

export const missionTemplatesRelations = relations(missionTemplates, ({ one }) => ({
  establishment: one(users, {
    fields: [missionTemplates.establishmentId],
    references: [users.id],
  }),
}));

/**
 * ==============================================================================
 * VALIDATION SCHEMAS
 * ==============================================================================
 * Schémas Zod pour la validation des données d'entrée
 */

// Schéma pour l'insertion d'utilisateurs
export const insertUserSchema = createInsertSchema(users);

// Schéma pour l'insertion de profils infirmiers
export const insertNurseProfileSchema = createInsertSchema(nurseProfiles);

// Schéma pour l'insertion de profils établissements
export const insertEstablishmentProfileSchema = createInsertSchema(establishmentProfiles);

// Schéma pour l'insertion de missions
export const insertMissionSchema = createInsertSchema(missions);

// Schéma pour l'insertion de candidatures
export const insertMissionApplicationSchema = createInsertSchema(missionApplications);

// Schéma pour l'insertion de templates de missions
export const insertMissionTemplateSchema = createInsertSchema(missionTemplates);

/**
 * ==============================================================================
 * TYPES TYPESCRIPT
 * ==============================================================================
 * Types TypeScript générés automatiquement à partir des schémas Drizzle
 */

// Types de base pour les opérations CRUD
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type NurseProfile = typeof nurseProfiles.$inferSelect;
export type EstablishmentProfile = typeof establishmentProfiles.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type MissionApplication = typeof missionApplications.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type AbsenceForecast = typeof absenceForecasts.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type MissionTemplate = typeof missionTemplates.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Types pour les insertions avec validation Zod
export type InsertNurseProfile = z.infer<typeof insertNurseProfileSchema>;
export type InsertEstablishmentProfile = z.infer<typeof insertEstablishmentProfileSchema>;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type InsertMissionApplication = z.infer<typeof insertMissionApplicationSchema>;
export type InsertMissionTemplate = z.infer<typeof insertMissionTemplateSchema>;

/**
 * ==============================================================================
 * CONSTANTES ET ENUMS
 * ==============================================================================
 * Constantes utilisées dans l'application pour la cohérence des données
 */

export const USER_ROLES = ["nurse", "establishment"] as const;
export const MISSION_STATUSES = ["draft", "published", "in_progress", "completed", "cancelled"] as const;
export const APPLICATION_STATUSES = ["pending", "accepted", "rejected", "withdrawn"] as const;
export const SHIFTS = ["matin", "apres-midi", "nuit", "jour"] as const;
export const URGENCY_LEVELS = ["low", "medium", "high"] as const;
export const CONTRACT_TYPES = ["cdd", "cdi", "liberal"] as const;
export const LANGUAGES = ["fr", "en"] as const;

export type UserRole = typeof USER_ROLES[number];
export type MissionStatus = typeof MISSION_STATUSES[number];
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];
export type Shift = typeof SHIFTS[number];
export type UrgencyLevel = typeof URGENCY_LEVELS[number];
export type ContractType = typeof CONTRACT_TYPES[number];
export type Language = typeof LANGUAGES[number];
