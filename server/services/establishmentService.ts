/**
 * ==============================================================================
 * NurseLink AI - Service Établissement
 * ==============================================================================
 *
 * Service spécialisé pour les fonctionnalités établissement
 * Extension du storageService pour les besoins spécifiques
 * ==============================================================================
 */

import { getDb } from "../db";
import { missions, missionApplications, users } from "@shared/schema";
import { sql, eq, and, desc } from "drizzle-orm";

export class EstablishmentService {
  private log(method: string, data?: any) {
    console.log(`[EstablishmentService] ${method}`, data ? JSON.stringify(data, null, 2) : '');
  }

  private handleError(method: string, error: any): never {
    console.error(`[EstablishmentService] Erreur dans ${method}:`, error);
    throw new Error(`Erreur EstablishmentService.${method}: ${error.message}`);
  }

  /**
   * Récupère les statistiques d'un établissement
   */
  async getStats(establishmentId: string) {
    try {
      this.log('getStats', { establishmentId });
      const db = await getDb();

      // Compter les missions actives
      const activeMissionsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(missions)
        .where(and(
          eq(missions.establishmentId, establishmentId),
          eq(missions.status, "published")
        ));

      // Compter les missions urgentes
      const urgentMissionsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(missions)
        .where(and(
          eq(missions.establishmentId, establishmentId),
          eq(missions.status, "published"),
          eq(missions.urgencyLevel, "high")
        ));

      // Compter les candidatures en attente
      const pendingApplicationsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(missionApplications)
        .innerJoin(missions, eq(missionApplications.missionId, missions.id))
        .where(and(
          eq(missions.establishmentId, establishmentId),
          eq(missionApplications.status, "pending")
        ));

      return {
        activeStaff: 247,
        staffGrowth: 12,
        openMissions: activeMissionsResult[0]?.count || 0,
        urgentMissions: urgentMissionsResult[0]?.count || 0,
        avgResponseTime: 2.4,
        responseImprovement: -15,
        satisfaction: 4.8,
        totalReviews: 156,
        pendingApplications: pendingApplicationsResult[0]?.count || 0
      };
    } catch (error) {
      this.handleError('getStats', error);
    }
  }

  /**
   * Récupère les missions d'un établissement
   */
  async getMissions(establishmentId: string) {
    try {
      this.log('getMissions', { establishmentId });
      const db = await getDb();

      const establishmentMissions = await db
        .select()
        .from(missions)
        .where(eq(missions.establishmentId, establishmentId))
        .orderBy(desc(missions.createdAt));

      return establishmentMissions;
    } catch (error) {
      this.handleError('getMissions', error);
    }
  }

  /**
   * Crée une nouvelle mission
   */
  async createMission(missionData: any) {
    try {
      this.log('createMission', { missionData });
      const db = await getDb();

      const [mission] = await db
        .insert(missions)
        .values({
          id: crypto.randomUUID(),
          ...missionData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return mission;
    } catch (error) {
      this.handleError('createMission', error);
    }
  }

  /**
   * Met à jour une mission
   */
  async updateMission(missionId: string, updateData: any, establishmentId: string) {
    try {
      this.log('updateMission', { missionId, updateData, establishmentId });
      const db = await getDb();

      const [mission] = await db
        .update(missions)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(and(
          eq(missions.id, missionId),
          eq(missions.establishmentId, establishmentId)
        ))
        .returning();

      return mission;
    } catch (error) {
      this.handleError('updateMission', error);
    }
  }

  /**
   * Supprime une mission
   */
  async deleteMission(missionId: string, establishmentId: string) {
    try {
      this.log('deleteMission', { missionId, establishmentId });
      const db = await getDb();

      const result = await db
        .delete(missions)
        .where(and(
          eq(missions.id, missionId),
          eq(missions.establishmentId, establishmentId)
        ));

      return result.rowCount > 0;
    } catch (error) {
      this.handleError('deleteMission', error);
    }
  }

  /**
   * Récupère les candidatures pour un établissement
   */
  async getCandidates(establishmentId: string) {
    try {
      this.log('getCandidates', { establishmentId });
      const db = await getDb();

      const candidates = await db
        .select({
          application: missionApplications,
          mission: missions,
          nurse: users
        })
        .from(missionApplications)
        .innerJoin(missions, eq(missionApplications.missionId, missions.id))
        .innerJoin(users, eq(missionApplications.nurseId, users.id))
        .where(eq(missions.establishmentId, establishmentId))
        .orderBy(desc(missionApplications.createdAt));

      return candidates;
    } catch (error) {
      this.handleError('getCandidates', error);
    }
  }

  /**
   * Accepte une candidature
   */
  async acceptCandidate(candidateId: string, establishmentId: string) {
    try {
      this.log('acceptCandidate', { candidateId, establishmentId });
      const db = await getDb();

      const candidateInfo = await db
        .select()
        .from(missionApplications)
        .innerJoin(missions, eq(missionApplications.missionId, missions.id))
        .where(and(
          eq(missionApplications.id, candidateId),
          eq(missions.establishmentId, establishmentId)
        ));

      if (candidateInfo.length === 0) {
        throw new Error('Candidature non trouvée ou non autorisée');
      }

      const [updatedApplication] = await db
        .update(missionApplications)
        .set({
          status: 'accepted',
          updatedAt: new Date()
        })
        .where(eq(missionApplications.id, candidateId))
        .returning();

      return updatedApplication;
    } catch (error) {
      this.handleError('acceptCandidate', error);
    }
  }

  /**
   * Rejette une candidature
   */
  async rejectCandidate(candidateId: string, establishmentId: string) {
    try {
      this.log('rejectCandidate', { candidateId, establishmentId });
      const db = await getDb();

      const candidateInfo = await db
        .select()
        .from(missionApplications)
        .innerJoin(missions, eq(missionApplications.missionId, missions.id))
        .where(and(
          eq(missionApplications.id, candidateId),
          eq(missions.establishmentId, establishmentId)
        ));

      if (candidateInfo.length === 0) {
        throw new Error('Candidature non trouvée ou non autorisée');
      }

      const [updatedApplication] = await db
        .update(missionApplications)
        .set({
          status: 'rejected',
          updatedAt: new Date()
        })
        .where(eq(missionApplications.id, candidateId))
        .returning();

      return updatedApplication;
    } catch (error) {
      this.handleError('rejectCandidate', error);
    }
  }

  /**
   * Récupère les templates de mission d'un établissement
   */
  async getTemplates(establishmentId: string) {
    try {
      this.log('getTemplates', { establishmentId });
      const db = await getDb();

      const templates = await db
        .select()
        .from(missions)
        .where(and(
          eq(missions.establishmentId, establishmentId),
          eq(missions.isTemplate, true)
        ))
        .orderBy(desc(missions.createdAt));

      return templates;
    } catch (error) {
      this.handleError('getTemplates', error);
    }
  }

  /**
   * Publie un template comme nouvelle mission
   */
  async publishTemplateAsMission(templateId: string, establishmentId: string, missionData: any) {
    try {
      this.log('publishTemplateAsMission', { templateId, establishmentId, missionData });
      const db = await getDb();

      // Récupérer le template
      const [template] = await db
        .select()
        .from(missions)
        .where(and(
          eq(missions.id, templateId),
          eq(missions.establishmentId, establishmentId),
          eq(missions.isTemplate, true)
        ));

      if (!template) {
        throw new Error('Template non trouvé');
      }

      // Créer la nouvelle mission basée sur le template
      const [newMission] = await db
        .insert(missions)
        .values({
          ...template,
          id: crypto.randomUUID(),
          isTemplate: false,
          status: 'published',
          ...missionData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return newMission;
    } catch (error) {
      this.handleError('publishTemplateAsMission', error);
    }
  }

  /**
   * Supprime un template
   */
  async deleteTemplate(templateId: string, establishmentId: string) {
    try {
      this.log('deleteTemplate', { templateId, establishmentId });
      const db = await getDb();

      const result = await db
        .delete(missions)
        .where(and(
          eq(missions.id, templateId),
          eq(missions.establishmentId, establishmentId),
          eq(missions.isTemplate, true)
        ));

      return result.rowCount > 0;
    } catch (error) {
      this.handleError('deleteTemplate', error);
    }
  }
}

export const establishmentService = new EstablishmentService();
