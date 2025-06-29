/**
 * ==============================================================================
 * NurseLink AI - Service de Stockage
 * ==============================================================================
 *
 * Service centralisé pour toutes les opérations de base de données
 * Implémente une interface claire avec gestion d'erreurs robuste
 *
 * Architecture :
 * - Interface IStorage pour abstraction
 * - DatabaseStorage avec Drizzle ORM
 * - Gestion d'erreurs typées
 * - Logging structuré des opérations
 * - Validation des données avec Zod
 * ==============================================================================
 */

import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  users,
  nurseProfiles,
  establishmentProfiles,
  missions,
  missionApplications,
  documents,
  invoices,
  absenceForecasts,
  missionTemplates,
  type User,
  type UpsertUser,
  type NurseProfile,
  type EstablishmentProfile,
  type Mission,
  type MissionApplication,
  type Document,
  type Invoice,
  type AbsenceForecast,
  type MissionTemplate,
  type InsertNurseProfile,
  type InsertEstablishmentProfile,
  type InsertMission,
  type InsertMissionApplication,
  type InsertMissionTemplate,
  insertNurseProfileSchema,
  insertEstablishmentProfileSchema,
  insertMissionSchema,
  insertMissionApplicationSchema,
  insertMissionTemplateSchema,
} from "@shared/schema";
import { isDevelopment } from "../config/environment";

/**
 * Interface définissant toutes les opérations de stockage
 * Cette interface permet l'abstraction et facilite les tests
 */
export interface IStorage {
  // ==================== OPÉRATIONS UTILISATEURS ====================
  // IMPORTANT: Ces opérations sont obligatoires pour Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  acceptCGU(userId: string, role: string): Promise<User>;

  // ==================== OPÉRATIONS PROFILS ====================
  getNurseProfile(userId: string): Promise<NurseProfile | undefined>;
  getEstablishmentProfile(userId: string, establishmentId?: number): Promise<EstablishmentProfile | undefined>;
  getEstablishmentBySiret(siret: string): Promise<EstablishmentProfile | undefined>;
  createOrUpdateNurseProfile(profile: InsertNurseProfile): Promise<NurseProfile>;
  createOrUpdateEstablishmentProfile(profile: InsertEstablishmentProfile): Promise<EstablishmentProfile>;

  // ==================== OPÉRATIONS MISSIONS ====================
  createMission(mission: InsertMission): Promise<Mission>;
  getMission(id: number): Promise<Mission | undefined>;
  getMissionsForNurse(nurseId: number, filters?: MissionFilters): Promise<Mission[]>;
  getMissionsForEstablishment(establishmentId: number, filters?: MissionFilters): Promise<Mission[]>;
  updateMissionStatus(missionId: number, status: string): Promise<Mission | undefined>;
  searchMissions(criteria: SearchCriteria): Promise<Mission[]>;

  // ==================== OPÉRATIONS CANDIDATURES ====================
  createMissionApplication(application: InsertMissionApplication): Promise<MissionApplication>;
  updateMissionApplicationStatus(applicationId: number, status: string): Promise<MissionApplication | undefined>;
  getMissionApplications(missionId: number): Promise<MissionApplication[]>;
  getNurseApplications(nurseId: number): Promise<MissionApplication[]>;

  // ==================== OPÉRATIONS DONNÉES RÉFÉRENCE ====================
  getAvailableNurses(criteria?: NurseSearchCriteria): Promise<NurseProfile[]>;

  // ==================== OPÉRATIONS STATISTIQUES ====================
  getNurseStats(nurseId: number): Promise<NurseStats>;
  getEstablishmentStats(establishmentId: number): Promise<EstablishmentStats>;

  // ==================== OPÉRATIONS PRÉVISIONS IA ====================
  createAbsenceForecast(forecast: any): Promise<AbsenceForecast>;
  getAbsenceForecasts(establishmentId: number): Promise<AbsenceForecast[]>;

  // ==================== OPÉRATIONS REQUISES POUR SERVICES IA ====================
  getAllMissions(): Promise<Mission[]>;
  getAllUsers(): Promise<User[]>;
  getAllNurseProfiles(): Promise<NurseProfile[]>;
  getAllEstablishmentProfiles(): Promise<EstablishmentProfile[]>;
  getMissionsByEstablishment(establishmentId: number): Promise<Mission[]>;
  getApplicationsByEstablishment(establishmentId: number): Promise<MissionApplication[]>;

  // ==================== OPÉRATIONS MATCHING ET CANDIDATURES ====================
  getEstablishmentCandidates(userId: string): Promise<any[]>;
  acceptCandidate(candidateId: string, userId: string): Promise<any>;
  rejectCandidate(candidateId: string, userId: string): Promise<any>;
  updateMission(missionId: string, data: any, userId: string): Promise<any>;
  deleteMission(missionId: string, userId: string): Promise<boolean>;

  // ==================== OPÉRATIONS TEMPLATES ====================
  createTemplate(template: InsertMissionTemplate): Promise<MissionTemplate>;
  getTemplates(establishmentId: number): Promise<MissionTemplate[]>;
  getTemplate(templateId: number): Promise<MissionTemplate | undefined>;
  updateTemplate(templateId: number, data: Partial<InsertMissionTemplate>): Promise<MissionTemplate | undefined>;
  deleteTemplate(templateId: number): Promise<boolean>;
  publishTemplateAsMission(templateId: number, establishmentId: number, customData?: Partial<InsertMission>): Promise<Mission>;
}

/**
 * Types pour les filtres et recherches
 */
export interface MissionFilters {
  status?: string[];
  specialization?: string;
  startDate?: Date;
  endDate?: Date;
  urgency?: string;
  maxDistance?: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
}

export interface SearchCriteria {
  keywords?: string;
  location?: { latitude: number; longitude: number; radius: number };
  specializations?: string[];
  experience?: number;
  availability?: { startDate: Date; endDate: Date };
}

export interface NurseSearchCriteria {
  specializations?: string[];
  minExperience?: number;
  location?: { latitude: number; longitude: number; radius: number };
  availability?: boolean;
  verified?: boolean;
}

export interface NurseStats {
  totalMissions: number;
  completedMissions: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number;
  successRate: number;
}

export interface EstablishmentStats {
  totalMissions: number;
  activeMissions: number;
  averageResponseTime: number;
  nurseRetentionRate: number;
  averageRating: number;
  totalSpent: number;
}

/**
 * Implémentation du service de stockage avec PostgreSQL et Drizzle ORM
 */
export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    // Initialisation différée de la base de données
    this.db = null;
  }

  private async getDatabase() {
    if (!this.db) {
      this.db = await getDb();
    }
    return this.db;
  }

  /**
   * Log les opérations en mode développement
   */
  private log(operation: string, data?: any) {
    if (isDevelopment) {
      console.log(`[StorageService] ${operation}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  /**
   * Gestion centralisée des erreurs de base de données
   */
  private handleError(operation: string, error: unknown): never {
    console.error(`[StorageService] Erreur ${operation}:`, error);

    if (error instanceof Error) {
      // Erreurs spécifiques de contraintes PostgreSQL
      if (error.message.includes('unique constraint')) {
        throw new Error(`Conflit de données: un enregistrement similaire existe déjà`);
      }
      if (error.message.includes('foreign key constraint')) {
        throw new Error(`Référence invalide: l'entité liée n'existe pas`);
      }
      if (error.message.includes('not null constraint')) {
        throw new Error(`Données manquantes: tous les champs requis doivent être renseignés`);
      }
    }

    throw new Error(`Erreur lors de l'opération ${operation}: ${error}`);
  }

  // ==================== IMPLÉMENTATION OPÉRATIONS UTILISATEURS ====================

  async getUser(id: string): Promise<User | undefined> {
    try {
      const db = await this.getDatabase();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      this.handleError('getUser', error);
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const db = await this.getDatabase();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      this.handleError('getUserByEmail', error);
    }
  }

  async createUser(userData: any): Promise<User> {
    try {
      const db = await this.getDatabase();
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    } catch (error) {
      this.handleError('createUser', error);
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const db = await this.getDatabase();
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      this.handleError('upsertUser', error);
    }
  }

  async acceptCGU(userId: string, role: string): Promise<User> {
    try {
      const db = await this.getDatabase();
      const [user] = await db
        .update(users)
        .set({
          cguAccepted: true,
          cguAcceptedAt: new Date(),
          role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return user;
    } catch (error) {
      this.handleError('acceptCGU', error);
    }
  }

  // ==================== IMPLÉMENTATION OPÉRATIONS PROFILS ====================

  async getNurseProfile(userId: string): Promise<NurseProfile | undefined> {
    try {
      const db = await this.getDatabase();
      const [profile] = await db
        .select()
        .from(nurseProfiles)
        .where(eq(nurseProfiles.userId, userId));
      return profile || undefined;
    } catch (error) {
      this.handleError('getNurseProfile', error);
    }
  }

  async getEstablishmentProfile(userId: string, establishmentId?: number): Promise<EstablishmentProfile | undefined> {
    try {
      this.log('getEstablishmentProfile', { userId });
      const db = await this.getDatabase();

      if (establishmentId) {
        const [profile] = await db
          .select()
          .from(establishmentProfiles)
          .where(eq(establishmentProfiles.id, establishmentId));
        return profile || undefined;
      }
      // Sinon, chercher par userId
      const [profile] = await db
        .select()
        .from(establishmentProfiles)
        .where(eq(establishmentProfiles.userId, userId));
      return profile || undefined;
    } catch (error) {
      this.handleError('getEstablishmentProfile', error);
    }
  }

  async getEstablishmentBySiret(siret: string): Promise<EstablishmentProfile | undefined> {
    try {
      this.log('getEstablishmentBySiret', { siret });
      const db = await this.getDatabase();
      const [profile] = await db
        .select()
        .from(establishmentProfiles)
        .where(eq(establishmentProfiles.siret, siret));

      return profile || undefined;
    } catch (error) {
      this.handleError('getEstablishmentBySiret', error);
    }
  }

  async createOrUpdateNurseProfile(profileData: InsertNurseProfile): Promise<NurseProfile> {
    try {
      // Validation des données avec Zod
      const validatedData = insertNurseProfileSchema.parse(profileData);
      this.log('createOrUpdateNurseProfile', { userId: validatedData.userId });
      const db = await this.getDatabase();
      const [profile] = await db
        .insert(nurseProfiles)
        .values(validatedData)
        .onConflictDoUpdate({
          target: nurseProfiles.userId,
          set: {
            ...validatedData,
            updatedAt: new Date(),
          },
        })
        .returning();

      return profile;
    } catch (error) {
      this.handleError('createOrUpdateNurseProfile', error);
    }
  }

  async createOrUpdateEstablishmentProfile(profileData: InsertEstablishmentProfile): Promise<EstablishmentProfile> {
    try {
      // Validation des données avec Zod
      const validatedData = insertEstablishmentProfileSchema.parse(profileData);
      this.log('createOrUpdateEstablishmentProfile', { userId: validatedData.userId });
      const db = await this.getDatabase();
      const [profile] = await db
        .insert(establishmentProfiles)
        .values(validatedData)
        .onConflictDoUpdate({
          target: [establishmentProfiles.userId],
          set: {
            ...validatedData,
            updatedAt: new Date(),
          },
        })
        .returning();

      return profile;
    } catch (error) {
      this.handleError('createOrUpdateEstablishmentProfile', error);
    }
  }

  // ==================== IMPLÉMENTATION OPÉRATIONS MISSIONS ====================

  async createMission(missionData: InsertMission): Promise<Mission> {
    try {
      // Validation des données avec Zod
      const validatedData = insertMissionSchema.parse(missionData);
      this.log('createMission', { title: validatedData.title, establishmentId: validatedData.establishmentId });
      const db = await this.getDatabase();
      const [mission] = await db
        .insert(missions)
        .values(validatedData)
        .returning();

      return mission;
    } catch (error) {
      this.handleError('createMission', error);
    }
  }

  async getMission(id: number): Promise<Mission | undefined> {
    try {
      this.log('getMission', { id });
      const db = await this.getDatabase();
      const [mission] = await db
        .select()
        .from(missions)
        .where(eq(missions.id, id));
      return mission || undefined;
    } catch (error) {
      this.handleError('getMission', error);
    }
  }

  async getMissionsForNurse(nurseId: number, filters?: MissionFilters): Promise<Mission[]> {
    try {
      this.log('getMissionsForNurse', { nurseId, filters });
      const db = await this.getDatabase();
      let query = db.select().from(missions);

      // Appliquer les filtres
      if (filters?.status && filters.status.length > 0) {
        query = query.where(sql`${missions.status} IN (${filters.status.join(',')})`);
      }

      const results = await query
        .orderBy(desc(missions.createdAt));

      return results;
    } catch (error) {
      this.handleError('getMissionsForNurse', error);
    }
  }

  async getMissionsForEstablishment(establishmentId: number, filters?: MissionFilters): Promise<Mission[]> {
    try {
      this.log('getMissionsForEstablishment', { establishmentId, filters });
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(missions)
        .where(eq(missions.establishmentId, establishmentId))
        .orderBy(desc(missions.createdAt));

      return results;
    } catch (error) {
      this.handleError('getMissionsForEstablishment', error);
    }
  }

  async updateMissionStatus(missionId: number, status: string): Promise<Mission | undefined> {
    try {
      this.log('updateMissionStatus', { missionId, status });
      const db = await this.getDatabase();
      const [mission] = await db
        .update(missions)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(missions.id, missionId))
        .returning();

      return mission || undefined;
    } catch (error) {
      this.handleError('updateMissionStatus', error);
    }
  }

  async searchMissions(criteria: SearchCriteria): Promise<Mission[]> {
    try {
      this.log('searchMissions', criteria);
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(missions)
        .where(sql`${missions.status} = 'published'`)
        .orderBy(desc(missions.createdAt));

      return results;
    } catch (error) {
      this.handleError('searchMissions', error);
    }
  }

  // ==================== IMPLÉMENTATION OPÉRATIONS CANDIDATURES ====================

  async createMissionApplication(applicationData: InsertMissionApplication): Promise<MissionApplication> {
    try {
      // Validation des données avec Zod
      const validatedData = insertMissionApplicationSchema.parse(applicationData);
      this.log('createMissionApplication', { missionId: validatedData.missionId, nurseId: validatedData.nurseId });
      const db = await this.getDatabase();
      const [application] = await db
        .insert(missionApplications)
        .values(validatedData)
        .returning();

      return application;
    } catch (error) {
      this.handleError('createMissionApplication', error);
    }
  }

  async updateMissionApplicationStatus(applicationId: number, status: string): Promise<MissionApplication | undefined> {
    try {
      this.log('updateMissionApplicationStatus', { applicationId, status });
      const db = await this.getDatabase();
      const [application] = await db
        .update(missionApplications)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(missionApplications.id, applicationId))
        .returning();

      return application || undefined;
    } catch (error) {
      this.handleError('updateMissionApplicationStatus', error);
    }
  }

  async getMissionApplications(missionId: number): Promise<MissionApplication[]> {
    try {
      this.log('getMissionApplications', { missionId });
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(missionApplications)
        .where(eq(missionApplications.missionId, missionId))
        .orderBy(desc(missionApplications.createdAt));

      return results;
    } catch (error) {
      this.handleError('getMissionApplications', error);
    }
  }

  async getNurseApplications(nurseId: number): Promise<MissionApplication[]> {
    try {
      this.log('getNurseApplications', { nurseId });
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(missionApplications)
        .where(eq(missionApplications.nurseId, nurseId))
        .orderBy(desc(missionApplications.createdAt));

      return results;
    } catch (error) {
      this.handleError('getNurseApplications', error);
    }
  }

  // ==================== IMPLÉMENTATION DONNÉES RÉFÉRENCE ====================

  async getAvailableNurses(criteria?: NurseSearchCriteria): Promise<NurseProfile[]> {
    try {
      this.log('getAvailableNurses', criteria);
      const db = await this.getDatabase();
      let query = db.select().from(nurseProfiles);

      if (criteria?.specializations && criteria.specializations.length > 0) {
        query = query.where(sql`${nurseProfiles.specializations} IN (${criteria.specializations.join(',')})`);
      }

      if (criteria?.minExperience) {
        query = query.where(gte(nurseProfiles.experience, criteria.minExperience));
      }

      const results = await query.orderBy(desc(nurseProfiles.rating));
      return results;
    } catch (error) {
      this.handleError('getAvailableNurses', error);
    }
  }

  // ==================== IMPLÉMENTATION STATISTIQUES ====================

  async getNurseStats(nurseId: number): Promise<NurseStats> {
    try {
      this.log('getNurseStats', { nurseId });
      const db = await this.getDatabase();

      // Récupérer les missions du nurse
      const nurseMissions = await db
        .select()
        .from(missions)
        .where(eq(missions.nurseId, nurseId));

      const totalMissions = nurseMissions.length;
      const completedMissions = nurseMissions.filter(m => m.status === 'completed').length;
      const totalEarnings = nurseMissions
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + (m.hourlyRate * m.duration || 0), 0);
      const averageRating = nurseMissions.length > 0
        ? nurseMissions.reduce((sum, m) => sum + (m.rating || 0), 0) / nurseMissions.length
        : 0;

      return {
        totalMissions,
        completedMissions,
        totalEarnings,
        averageRating,
        responseTime: 24, // Valeur par défaut
        successRate: totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0
      };
    } catch (error) {
      this.handleError('getNurseStats', error);
    }
  }

  private calculateDistance(loc1: any, loc2: any): number {
    // Formule de Haversine pour calculer la distance entre deux points
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async getEstablishmentStats(establishmentId: number): Promise<EstablishmentStats> {
    try {
      this.log('getEstablishmentStats', { establishmentId });
      const db = await this.getDatabase();

      // Récupérer les missions de l'établissement
      const establishmentMissions = await db
        .select()
        .from(missions)
        .where(eq(missions.establishmentId, establishmentId));

      const totalMissions = establishmentMissions.length;
      const activeMissions = establishmentMissions.filter(m => m.status === 'active').length;
      const averageRating = establishmentMissions.length > 0
        ? establishmentMissions.reduce((sum, m) => sum + (m.rating || 0), 0) / establishmentMissions.length
        : 0;
      const totalSpent = establishmentMissions
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + (m.hourlyRate * m.duration || 0), 0);

      return {
        totalMissions,
        activeMissions,
        averageResponseTime: 48, // Valeur par défaut
        nurseRetentionRate: 85, // Valeur par défaut
        averageRating,
        totalSpent
      };
    } catch (error) {
      this.handleError('getEstablishmentStats', error);
    }
  }

  // ==================== IMPLÉMENTATION PRÉVISIONS IA ====================

  async createAbsenceForecast(forecastData: any): Promise<AbsenceForecast> {
    try {
      this.log('createAbsenceForecast', forecastData);
      const db = await this.getDatabase();
      const [forecast] = await db
        .insert(absenceForecasts)
        .values(forecastData)
        .returning();

      return forecast;
    } catch (error) {
      this.handleError('createAbsenceForecast', error);
    }
  }

  async getAbsenceForecasts(establishmentId: number): Promise<AbsenceForecast[]> {
    try {
      this.log('getAbsenceForecasts', { establishmentId });
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(absenceForecasts)
        .where(eq(absenceForecasts.establishmentId, establishmentId))
        .orderBy(desc(absenceForecasts.createdAt));

      return results;
    } catch (error) {
      this.handleError('getAbsenceForecasts', error);
    }
  }

  // ==================== MÉTHODES REQUISES POUR SERVICES IA ====================

  async getAllMissions(): Promise<Mission[]> {
    try {
      this.log('getAllMissions');
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(missions)
        .orderBy(desc(missions.createdAt));

      return results;
    } catch (error) {
      this.handleError('getAllMissions', error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      this.log('getAllUsers');
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));

      return results;
    } catch (error) {
      this.handleError('getAllUsers', error);
    }
  }

  async getAllNurseProfiles(): Promise<NurseProfile[]> {
    try {
      this.log('getAllNurseProfiles');
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(nurseProfiles)
        .orderBy(desc(nurseProfiles.createdAt));

      return results;
    } catch (error) {
      this.handleError('getAllNurseProfiles', error);
    }
  }

  async getAllEstablishmentProfiles(): Promise<EstablishmentProfile[]> {
    try {
      this.log('getAllEstablishmentProfiles');
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(establishmentProfiles)
        .orderBy(desc(establishmentProfiles.createdAt));

      return results;
    } catch (error) {
      this.handleError('getAllEstablishmentProfiles', error);
    }
  }

  async getMissionsByEstablishment(establishmentId: number): Promise<Mission[]> {
    try {
      this.log('getMissionsByEstablishment', { establishmentId });
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(missions)
        .where(eq(missions.establishmentId, establishmentId))
        .orderBy(desc(missions.createdAt));

      return results;
    } catch (error) {
      this.handleError('getMissionsByEstablishment', error);
    }
  }

  async getApplicationsByEstablishment(establishmentId: number): Promise<MissionApplication[]> {
    try {
      this.log('getApplicationsByEstablishment', { establishmentId });
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(missionApplications)
        .innerJoin(missions, eq(missionApplications.missionId, missions.id))
        .where(eq(missions.establishmentId, establishmentId))
        .orderBy(desc(missionApplications.createdAt));

      return results.map(r => r.missionApplications);
    } catch (error) {
      this.handleError('getApplicationsByEstablishment', error);
    }
  }

  // ==================== OPÉRATIONS MATCHING ET CANDIDATURES ====================

  async getEstablishmentCandidates(userId: string): Promise<any[]> {
    try {
      this.log('getEstablishmentCandidates', { userId });
      const db = await this.getDatabase();

      // Récupérer le profil de l'établissement
      const establishmentProfile = await this.getEstablishmentProfile(userId);
      if (!establishmentProfile) {
        return [];
      }

      // Récupérer toutes les candidatures pour les missions de cet établissement
      const candidates = await db
        .select({
          application: missionApplications,
          mission: missions,
          nurse: nurseProfiles,
          user: users
        })
        .from(missionApplications)
        .innerJoin(missions, eq(missionApplications.missionId, missions.id))
        .innerJoin(nurseProfiles, eq(missionApplications.nurseId, nurseProfiles.id))
        .innerJoin(users, eq(nurseProfiles.userId, users.id))
        .where(eq(missions.establishmentId, establishmentProfile.id))
        .orderBy(desc(missionApplications.createdAt));

      return candidates.map(candidate => ({
        id: candidate.application.id,
        missionId: candidate.mission.id,
        missionTitle: candidate.mission.title,
        nurseId: candidate.nurse.id,
        nurseName: `${candidate.user.firstName} ${candidate.user.lastName}`,
        nurseEmail: candidate.user.email,
        nurseSpecializations: candidate.nurse.specializations,
        nurseExperience: candidate.nurse.experience,
        nurseRating: candidate.nurse.rating,
        applicationStatus: candidate.application.status,
        applicationDate: candidate.application.createdAt,
        hourlyRate: candidate.application.hourlyRate,
        availability: candidate.application.availability
      }));
    } catch (error) {
      this.handleError('getEstablishmentCandidates', error);
    }
  }

  async acceptCandidate(candidateId: string, userId: string): Promise<any> {
    try {
      this.log('acceptCandidate', { candidateId, userId });
      const db = await this.getDatabase();

      const [application] = await db
        .update(missionApplications)
        .set({
          status: 'accepted',
          updatedAt: new Date(),
        })
        .where(eq(missionApplications.id, parseInt(candidateId)))
        .returning();

      return application;
    } catch (error) {
      this.handleError('acceptCandidate', error);
    }
  }

  async rejectCandidate(candidateId: string, userId: string): Promise<any> {
    try {
      this.log('rejectCandidate', { candidateId, userId });
      const db = await this.getDatabase();

      const [application] = await db
        .update(missionApplications)
        .set({
          status: 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(missionApplications.id, parseInt(candidateId)))
        .returning();

      return application;
    } catch (error) {
      this.handleError('rejectCandidate', error);
    }
  }

  async updateMission(missionId: string, data: any, userId: string): Promise<any> {
    try {
      this.log('updateMission', { missionId, data, userId });
      const db = await this.getDatabase();

      const [mission] = await db
        .update(missions)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(missions.id, parseInt(missionId)))
        .returning();

      return mission;
    } catch (error) {
      this.handleError('updateMission', error);
    }
  }

  async deleteMission(missionId: string, userId: string): Promise<boolean> {
    try {
      this.log('deleteMission', { missionId, userId });
      const db = await this.getDatabase();

      await db
        .delete(missions)
        .where(eq(missions.id, parseInt(missionId)));

      return true;
    } catch (error) {
      this.handleError('deleteMission', error);
    }
  }

  // ==================== OPÉRATIONS TEMPLATES ====================

  async createTemplate(template: InsertMissionTemplate): Promise<MissionTemplate> {
    try {
      this.log('createTemplate', { title: template.title });
      const db = await this.getDatabase();
      const [newTemplate] = await db
        .insert(missionTemplates)
        .values(template)
        .returning();

      return newTemplate;
    } catch (error) {
      this.handleError('createTemplate', error);
    }
  }

  async getTemplates(establishmentId: number): Promise<MissionTemplate[]> {
    try {
      this.log('getTemplates', { establishmentId });
      const db = await this.getDatabase();
      const results = await db
        .select()
        .from(missionTemplates)
        .where(eq(missionTemplates.establishmentId, establishmentId))
        .orderBy(desc(missionTemplates.createdAt));

      return results;
    } catch (error) {
      this.handleError('getTemplates', error);
    }
  }

  async getTemplate(templateId: number): Promise<MissionTemplate | undefined> {
    try {
      this.log('getTemplate', { templateId });
      const db = await this.getDatabase();
      const [template] = await db
        .select()
        .from(missionTemplates)
        .where(eq(missionTemplates.id, templateId));

      return template || undefined;
    } catch (error) {
      this.handleError('getTemplate', error);
    }
  }

  async updateTemplate(templateId: number, data: Partial<InsertMissionTemplate>): Promise<MissionTemplate | undefined> {
    try {
      this.log('updateTemplate', { templateId, data });
      const db = await this.getDatabase();
      const [template] = await db
        .update(missionTemplates)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(missionTemplates.id, templateId))
        .returning();

      return template || undefined;
    } catch (error) {
      this.handleError('updateTemplate', error);
    }
  }

  async deleteTemplate(templateId: number): Promise<boolean> {
    try {
      this.log('deleteTemplate', { templateId });
      const db = await this.getDatabase();

      await db
        .delete(missionTemplates)
        .where(eq(missionTemplates.id, templateId));

      return true;
    } catch (error) {
      this.handleError('deleteTemplate', error);
    }
  }

  async publishTemplateAsMission(templateId: number, establishmentId: number, customData?: Partial<InsertMission>): Promise<Mission> {
    try {
      this.log('publishTemplateAsMission', { templateId, establishmentId });
      const db = await this.getDatabase();

      // Récupérer le template
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template non trouvé');
      }

      // Créer la mission à partir du template
      const missionData: InsertMission = {
        title: customData?.title || template.title,
        description: customData?.description || template.description,
        service: customData?.service || template.service,
        location: customData?.location || template.location,
        startDate: customData?.startDate || template.startDate,
        endDate: customData?.endDate || template.endDate,
        shift: customData?.shift || template.shift,
        hourlyRate: customData?.hourlyRate || template.hourlyRate,
        establishmentId,
        status: 'published',
        urgency: customData?.urgency || template.urgency,
        requirements: customData?.requirements || template.requirements
      };

      const [mission] = await db
        .insert(missions)
        .values(missionData)
        .returning();

      return mission;
    } catch (error) {
      this.handleError('publishTemplateAsMission', error);
    }
  }
}

/**
 * Instance singleton du service de stockage
 * Exportée pour utilisation dans toute l'application
 */
export const storage = new DatabaseStorage();
