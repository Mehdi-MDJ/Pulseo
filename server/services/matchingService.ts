/**
 * ==============================================================================
 * NurseLink AI - Service de Matching Intelligent
 * ==============================================================================
 *
 * Service avancé pour le matching automatique entre missions et infirmiers
 * Prend en compte : géolocalisation, spécialisations, expérience, scores, disponibilités
 * ==============================================================================
 */

import { getDb } from '../db';
import { nurseProfiles, missions, users, missionApplications } from '../../shared/schema';
import { eq, and, gte, inArray, sql } from 'drizzle-orm';
import { env } from '../config/environment';

interface MatchingCriteria {
  missionId: number;
  maxDistance: number; // en km
  minExperience: number; // en années
  requiredSpecializations: string[];
  minRating: number;
  maxCandidates: number; // nombre max d'infirmiers à notifier
}

interface NurseMatch {
  nurseId: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  specializations: string[];
  experience: number;
  rating: number;
  location: { lat: number; lng: number };
  distance: number;
  score: number;
  matchingFactors: string[];
  available: boolean;
}

interface NotificationPayload {
  nurseId: number;
  missionId: number;
  score: number;
  message: string;
  urgency: 'low' | 'medium' | 'high';
}

export class MatchingService {
  /**
   * Lance le processus de matching automatique pour une nouvelle mission
   */
  async matchNursesToMission(missionId: number, criteria?: Partial<MatchingCriteria>): Promise<NurseMatch[]> {
    try {
      const db = await getDb();

      // Récupérer les détails de la mission
      const [mission] = await db
        .select()
        .from(missions)
        .where(eq(missions.id, missionId));

      if (!mission) {
        throw new Error(`Mission ${missionId} introuvable`);
      }

      // Critères de matching par défaut
      const matchingCriteria: MatchingCriteria = {
        missionId,
        maxDistance: criteria?.maxDistance || 50, // 50km par défaut
        minExperience: criteria?.minExperience || mission.requiredExperience || 0,
        requiredSpecializations: criteria?.requiredSpecializations || [mission.specialization] || [],
        minRating: criteria?.minRating || 3.0,
        maxCandidates: criteria?.maxCandidates || 10,
        ...criteria
      };

      console.log(`🎯 Démarrage matching pour mission ${missionId}:`, matchingCriteria);

      // Récupérer tous les infirmiers disponibles
      const availableNurses = await this.getAvailableNurses(mission.startDate, mission.endDate);

      if (availableNurses.length === 0) {
        console.log("⚠️ Aucun infirmier disponible trouvé");
        return [];
      }

      console.log(`📋 ${availableNurses.length} infirmiers disponibles trouvés`);

      // Calculer les scores de matching
      const matches = await this.calculateMatchingScores(mission, availableNurses, matchingCriteria);

      // Filtrer et trier les meilleurs candidats
      const qualifiedMatches = matches
        .filter(match => match.score >= 60) // Score minimum de 60%
        .sort((a, b) => b.score - a.score)
        .slice(0, matchingCriteria.maxCandidates);

      console.log(`✅ ${qualifiedMatches.length} candidats qualifiés trouvés`);

      // Notifier chaque infirmier matché
      for (const match of qualifiedMatches) {
        await this.notifyMatchedNurse(match, mission);
      }

      return qualifiedMatches;

    } catch (error) {
      console.error("❌ Erreur matching:", error);
      return [];
    }
  }

  /**
   * Récupère les infirmiers disponibles pour une période donnée
   */
  private async getAvailableNurses(startDate: Date, endDate: Date) {
    const db = await getDb();

    const nurses = await db
      .select({
        nurse: nurseProfiles,
        user: users
      })
      .from(nurseProfiles)
      .innerJoin(users, eq(nurseProfiles.userId, users.id))
      .where(eq(nurseProfiles.isAvailable, true));

    // Filtrer ceux qui n'ont pas de conflits de planning
    return nurses.map(result => ({
      ...result.nurse,
      user: result.user
    })).filter(nurse => {
      // Pour l'instant, on considère que tous les infirmiers "isAvailable: true" sont disponibles
      return true;
    });
  }

  /**
   * Calcule les scores de matching pour chaque infirmier
   */
  private async calculateMatchingScores(
    mission: any,
    nurses: any[],
    criteria: MatchingCriteria
  ): Promise<NurseMatch[]> {
    const matches: NurseMatch[] = [];

    for (const nurse of nurses) {
      let score = 0;
      const matchingFactors: string[] = [];

      // 1. Score basé sur les spécialisations (40 points max)
      const hasRequiredSpecialization = criteria.requiredSpecializations.some(spec =>
        nurse.specializations?.includes(spec)
      );
      if (hasRequiredSpecialization) {
        score += 40;
        matchingFactors.push("Spécialisation correspondante");
      }

      // 2. Score basé sur l'expérience (25 points max)
      const experienceScore = Math.min((nurse.experience / 10) * 25, 25);
      score += experienceScore;
      if (nurse.experience >= criteria.minExperience) {
        matchingFactors.push(`${nurse.experience} ans d'expérience`);
      }

      // 3. Score basé sur la note (20 points max)
      const ratingScore = (nurse.rating / 5) * 20;
      score += ratingScore;
      if (nurse.rating >= 4.0) {
        matchingFactors.push(`Excellente note (${nurse.rating}/5)`);
      }

      // 4. Score basé sur la géolocalisation (15 points max)
      const distance = this.calculateDistance(
        mission.location,
        nurse.location
      );

      if (distance <= criteria.maxDistance) {
        const distanceScore = Math.max(15 - (distance / criteria.maxDistance) * 15, 0);
        score += distanceScore;
        matchingFactors.push(`À ${distance.toFixed(1)}km`);
      } else {
        // Infirmier trop éloigné, on l'exclut
        continue;
      }

      // 5. Bonus pour disponibilité immédiate et certifications
      if (nurse.certifications?.length > 0) {
        score += 5;
        matchingFactors.push("Certifications validées");
      }

      matches.push({
        nurseId: nurse.id,
        userId: nurse.userId,
        firstName: nurse.user.firstName,
        lastName: nurse.user.lastName,
        email: nurse.user.email,
        specializations: nurse.specializations || [],
        experience: nurse.experience || 0,
        rating: nurse.rating || 0,
        location: nurse.location || { lat: 0, lng: 0 },
        distance,
        score,
        matchingFactors,
        available: true
      });
    }

    return matches;
  }

  /**
   * Calcule la distance entre deux points géographiques (formule de Haversine)
   */
  private calculateDistance(point1: any, point2: any): number {
    if (!point1 || !point2) return 999; // Distance très élevée si pas de coordonnées

    const lat1 = this.toRadians(point1.lat || point1.latitude || 0);
    const lon1 = this.toRadians(point1.lng || point1.longitude || 0);
    const lat2 = this.toRadians(point2.lat || point2.latitude || 0);
    const lon2 = this.toRadians(point2.lng || point2.longitude || 0);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c; // Rayon de la Terre en km

    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Envoie les notifications de matching aux infirmiers
   */
  private async sendMatchingNotifications(matches: NurseMatch[], mission: any): Promise<void> {
    const notifications: NotificationPayload[] = matches.map(match => ({
      nurseId: match.nurseId,
      missionId: mission.id,
      score: match.score,
      message: `Nouvelle mission disponible : ${mission.title} - Score de compatibilité : ${match.score}%`,
      urgency: match.score > 80 ? 'high' : match.score > 60 ? 'medium' : 'low'
    }));

    await this.processNotifications(notifications);
  }

  /**
   * Traite les notifications (pour l'instant, juste un log)
   */
  private async processNotifications(notifications: NotificationPayload[]): Promise<void> {
    for (const notification of notifications) {
      console.log(`📧 Notification envoyée à l'infirmier ${notification.nurseId}: ${notification.message}`);
      // TODO: Implémenter l'envoi réel de notifications (email, push, etc.)
    }
  }

  /**
   * Récupère l'historique des matchings pour une mission
   */
  async getMatchingHistory(missionId: number) {
    const db = await getDb();

    return await db
      .select()
      .from(missionApplications)
      .where(eq(missionApplications.missionId, missionId))
      .orderBy(missionApplications.createdAt);
  }

  /**
   * Met à jour les critères de matching d'un établissement
   */
  async updateEstablishmentCriteria(establishmentId: number, criteria: Partial<MatchingCriteria>) {
    // TODO: Implémenter la sauvegarde des critères personnalisés
    console.log(`🔧 Critères de matching mis à jour pour l'établissement ${establishmentId}:`, criteria);
  }

  /**
   * Notifie un infirmier qu'il a été matché avec une mission
   */
  private async notifyMatchedNurse(nurse: any, mission: any) {
    console.log(`🎯 Infirmier ${nurse.firstName} ${nurse.lastName} matché avec la mission ${mission.title}`);
    // TODO: Implémenter la notification réelle
  }
}

export const matchingService = new MatchingService();
