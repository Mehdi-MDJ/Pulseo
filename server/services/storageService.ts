/**
 * ==============================================================================
 * NurseLink AI - Service de Stockage
 * ==============================================================================
 *
 * Service centralisé pour les interactions avec la base de données
 * Utilise Prisma comme ORM
 * ==============================================================================
 */

import { db } from '../lib/drizzle';
import {
  users,
  nurseProfiles,
  establishmentProfiles,
  missions,
  missionApplications,
  documents,
  contracts,
  notifications
} from '../../shared/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import type {
  User,
  NurseProfile,
  EstablishmentProfile,
  Mission,
  MissionApplication,
  Document,
  Contract,
  Notification
} from '../../shared/schema';

// Types pour la compatibilité
export type { User, NurseProfile, EstablishmentProfile, Mission, MissionApplication, Document, Contract, Notification };

// Constantes pour les statuts
export const MissionStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const ApplicationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
} as const;

export const UserRole = {
  NURSE: 'nurse',
  ESTABLISHMENT: 'establishment'
} as const;

export interface Mission {
  id: string
  title: string
  description: string
  establishmentId: string
  specializations: string[]
  duration: number
  hourlyRate: number
  startDate: Date
  endDate: Date | null
  location: string
  requirements: string | null
  status: MissionStatus
  createdAt: Date
  updatedAt: Date
}

export interface MissionApplication {
  id: string
  missionId: string
  nurseId: string
  coverLetter: string | null
  proposedRate: number | null
  status: ApplicationStatus
  createdAt: Date
  updatedAt: Date
}

export interface EstablishmentProfile {
  id: string
  userId: string
  name: string
  type: string
  address: string
  phone: string
  specialties: string[]
  capacity: number | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface NurseProfile {
  id: string
  userId: string
  specializations: string[]
  experience: number
  certifications: string[]
  availability: any
  hourlyRate: number | null
  rating: number
  missionsCompleted: number
  level: number
  rank: string
  createdAt: Date
  updatedAt: Date
}

export class StorageService {
  // ==============================================================================
  // Missions
  // ==============================================================================

  async createMission(data: any): Promise<Mission> {
    return await db.insert(missions).returning().execute().then(res => res.items[0]);
  }

  async getMission(id: string): Promise<Mission | null> {
    return await db.select().from(missions).where(eq(missions.id, id)).execute().then(res => res.items[0]);
  }

  async getMissionsByEstablishment(establishmentId: string): Promise<Mission[]> {
    return await db.select().from(missions).where(eq(missions.establishmentId, establishmentId)).execute();
  }

  async getAvailableMissions(): Promise<Mission[]> {
    return await db.select().from(missions).where(eq(missions.status, MissionStatus.PUBLISHED)).execute();
  }

  async updateMissionStatus(id: string, status: MissionStatus): Promise<Mission> {
    return await db.update(missions).set({ status }).where(eq(missions.id, id)).returning().execute().then(res => res.items[0]);
  }

  async searchMissions(query: string, filters: any): Promise<Mission[]> {
    const where = [
      and(eq(missions.title, query), eq(missions.status, MissionStatus.PUBLISHED)),
      and(eq(missions.description, query), eq(missions.status, MissionStatus.PUBLISHED)),
      and(eq(missions.location, query), eq(missions.status, MissionStatus.PUBLISHED))
    ];
    return await db.select().from(missions).where(or(...where)).execute();
  }

  // ==============================================================================
  // Candidatures
  // ==============================================================================

  async createMissionApplication(data: any): Promise<MissionApplication> {
    return await db.insert(missionApplications).returning().execute().then(res => res.items[0]);
  }

  async getMissionApplication(id: string): Promise<MissionApplication | null> {
    return await db.select().from(missionApplications).where(eq(missionApplications.id, id)).execute().then(res => res.items[0]);
  }

  async getMissionApplications(missionId: string): Promise<MissionApplication[]> {
    return await db.select().from(missionApplications).where(eq(missionApplications.missionId, missionId)).execute();
  }

  async updateMissionApplicationStatus(
    id: string,
    status: ApplicationStatus,
    feedback?: string
  ): Promise<MissionApplication> {
    return await db.update(missionApplications).set({ status }).where(eq(missionApplications.id, id)).returning().execute().then(res => res.items[0]);
  }

  // ==============================================================================
  // Profils
  // ==============================================================================

  async getEstablishmentProfile(userId: string): Promise<EstablishmentProfile | null> {
    return await db.select().from(establishmentProfiles).where(eq(establishmentProfiles.userId, userId)).execute().then(res => res.items[0]);
  }

  async createEstablishmentProfile(data: any): Promise<EstablishmentProfile> {
    return await db.insert(establishmentProfiles).returning().execute().then(res => res.items[0]);
  }

  async updateEstablishmentProfile(userId: string, data: any): Promise<EstablishmentProfile | null> {
    return await db.update(establishmentProfiles).set({
      name: data.name,
      type: data.type,
      address: data.address,
      phone: data.phone,
      specialties: data.specializations,
      capacity: data.capacity,
      description: data.description,
    }).where(eq(establishmentProfiles.userId, userId)).returning().execute().then(res => res.items[0]);
  }

  async getNurseProfile(userId: string): Promise<NurseProfile | null> {
    return await db.select().from(nurseProfiles).where(eq(nurseProfiles.userId, userId)).execute().then(res => res.items[0]);
  }

  // ==============================================================================
  // Statistiques
  // ==============================================================================

  async getEstablishmentStats(establishmentId: string): Promise<any> {
    const missions = await db.select().from(missions).count().where(eq(missions.establishmentId, establishmentId));
    const activeMissions = await db.select().from(missions).count().where(and(eq(missions.establishmentId, establishmentId), eq(missions.status, MissionStatus.PUBLISHED)));
    const applications = await db.select().from(missionApplications).count();
    const pendingApplications = await db.select().from(missionApplications).count().where(eq(missionApplications.status, ApplicationStatus.PENDING));

    return {
      totalMissions: missions,
      activeMissions,
      totalApplications: applications,
      pendingApplications,
      completionRate: missions > 0 ? ((missions - activeMissions) / missions * 100).toFixed(1) : "0"
    }
  }

  async getEstablishmentMissions(establishmentId: string, options: any): Promise<any> {
    const { status, page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const where: any = { establishmentId }
    if (status) {
      where.status = status
    }

    const [missions, total] = await Promise.all([
      db.select().from(missions).where(eq(missions.establishmentId, establishmentId)).execute(),
      db.select().from(missions).count().where(eq(missions.establishmentId, establishmentId))
    ])

    return {
      data: missions,
      total
    }
  }

  // ==============================================================================
  // Utilitaires
  // ==============================================================================

  async getMissionWithApplications(missionId: string): Promise<any> {
    return await db.select().from(missions).where(eq(missions.id, missionId)).execute().then(res => {
      const mission = res.items[0];
      return {
        ...mission,
        applications: res.items.map(app => ({
          ...app,
          nurse: {
            ...app.nurse,
            nurseProfile: app.nurse.nurseProfile
          }
        }))
      };
    });
  }
}

export const storageService = new StorageService()
