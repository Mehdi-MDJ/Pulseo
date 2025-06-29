/**
 * ==============================================================================
 * NurseLink AI - Service de Notifications
 * ==============================================================================
 *
 * Service pour la gestion des notifications push vers l'app mobile
 * Gère les notifications de matching, candidatures, et mises à jour
 * ==============================================================================
 */

import { getDb } from '../db';
import { notifications, nurseProfiles, missions } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface NotificationData {
  nurseId: number;
  missionId: number;
  type: 'new_mission_match' | 'mission_accepted' | 'mission_rejected' | 'new_message' | 'payment_received';
  title: string;
  message: string;
  score?: number;
  distance?: number;
  urgency: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface PushNotificationPayload {
  to: string; // Token de l'appareil
  title: string;
  body: string;
  data: {
    type: string;
    missionId: string;
    nurseId: string;
    score?: string;
    distance?: string;
  };
  priority: 'high' | 'normal';
  sound?: string;
  badge?: number;
}

export class NotificationService {

  /**
   * Crée une nouvelle notification pour un infirmier
   */
  async createNotification(data: NotificationData): Promise<any> {
    try {
      const db = await getDb();

      const notification = {
        nurseId: data.nurseId,
        missionId: data.missionId,
        type: data.type,
        title: data.title,
        message: data.message,
        score: data.score || null,
        distance: data.distance || null,
        urgency: data.urgency,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [newNotification] = await db
        .insert(notifications)
        .values(notification)
        .returning();

      console.log(`📨 Notification créée: ${newNotification.id} pour infirmier ${data.nurseId}`);

      // Envoyer la notification push si possible
      await this.sendPushNotification(newNotification);

      return newNotification;

    } catch (error) {
      console.error("❌ Erreur création notification:", error);
      throw error;
    }
  }

  /**
   * Récupère les notifications d'un infirmier
   */
  async getNurseNotifications(nurseId: number, limit: number = 20): Promise<any[]> {
    try {
      const db = await getDb();

      const nurseNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.nurseId, nurseId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);

      return nurseNotifications;

    } catch (error) {
      console.error("❌ Erreur récupération notifications:", error);
      throw error;
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: number, nurseId: number): Promise<boolean> {
    try {
      const db = await getDb();

      const [updated] = await db
        .update(notifications)
        .set({
          read: true,
          updatedAt: new Date()
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.nurseId, nurseId)
        ))
        .returning();

      return !!updated;

    } catch (error) {
      console.error("❌ Erreur marquage notification:", error);
      throw error;
    }
  }

  /**
   * Marque toutes les notifications d'un infirmier comme lues
   */
  async markAllAsRead(nurseId: number): Promise<number> {
    try {
      const db = await getDb();

      const result = await db
        .update(notifications)
        .set({
          read: true,
          updatedAt: new Date()
        })
        .where(and(
          eq(notifications.nurseId, nurseId),
          eq(notifications.read, false)
        ));

      console.log(`✅ Toutes les notifications marquées comme lues pour infirmier ${nurseId}`);
      return 1; // Succès

    } catch (error) {
      console.error("❌ Erreur marquage notifications:", error);
      throw error;
    }
  }

  /**
   * Envoie une notification push vers l'app mobile
   */
  private async sendPushNotification(notification: any): Promise<void> {
    try {
      // TODO: Implémenter l'envoi de notifications push
      // Pour l'instant, simulation avec console.log

      const payload: PushNotificationPayload = {
        to: `nurse_${notification.nurseId}`, // Token simulé
        title: notification.title,
        body: notification.message,
        data: {
          type: notification.type,
          missionId: notification.missionId.toString(),
          nurseId: notification.nurseId.toString(),
          score: notification.score?.toString(),
          distance: notification.distance?.toString()
        },
        priority: notification.urgency === 'high' ? 'high' : 'normal',
        sound: notification.urgency === 'high' ? 'urgent.wav' : 'default.wav',
        badge: 1
      };

      console.log(`📱 Push notification envoyée:`, {
        nurseId: notification.nurseId,
        title: payload.title,
        urgency: notification.urgency,
        timestamp: new Date().toISOString()
      });

      // TODO: Intégrer avec Expo Push Notifications ou Firebase
      // await expo.sendPushNotificationsAsync([payload]);

    } catch (error) {
      console.error("❌ Erreur envoi push notification:", error);
      // Ne pas faire échouer la création de notification si le push échoue
    }
  }

  /**
   * Envoie des notifications de matching à plusieurs infirmiers
   */
  async sendMatchingNotifications(matches: any[], mission: any): Promise<void> {
    try {
      console.log(`📱 Envoi de notifications de matching à ${matches.length} candidats`);

      const notifications = matches.map(match => ({
        nurseId: match.nurseId,
        missionId: mission.id,
        type: 'new_mission_match' as const,
        title: 'Nouvelle mission correspondant à votre profil',
        message: `Mission "${mission.title}" - Score de compatibilité : ${match.totalScore}%`,
        score: match.totalScore,
        distance: Math.round(match.distance * 10) / 10,
        urgency: match.totalScore > 80 ? 'high' as const : match.totalScore > 60 ? 'medium' as const : 'low' as const,
        metadata: {
          algorithm: 'reinforced_deterministic',
          confidence: match.confidence,
          factors: match.factors
        }
      }));

      // Créer toutes les notifications en parallèle
      await Promise.all(
        notifications.map(notificationData =>
          this.createNotification(notificationData)
        )
      );

      console.log(`✅ ${notifications.length} notifications de matching envoyées`);

    } catch (error) {
      console.error("❌ Erreur envoi notifications de matching:", error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de notifications pour un infirmier
   */
  async getNotificationStats(nurseId: number): Promise<{
    total: number;
    unread: number;
    today: number;
    byType: Record<string, number>;
  }> {
    try {
      const db = await getDb();

      const allNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.nurseId, nurseId));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        total: allNotifications.length,
        unread: allNotifications.filter(n => !n.read).length,
        today: allNotifications.filter(n => new Date(n.createdAt) >= today).length,
        byType: {} as Record<string, number>
      };

      // Compter par type
      allNotifications.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error("❌ Erreur récupération stats notifications:", error);
      throw error;
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService();
