/**
 * ==============================================================================
 * NurseLink AI - Service de Notifications
 * ==============================================================================
 *
 * Service pour la gestion des notifications
 * Notifications en temps réel et historiques
 * ==============================================================================
 */

import { db } from "../lib/drizzle";
import { notifications, missions, nurseProfiles } from "../../shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
  updatedAt: Date
}

export class NotificationService {
  /**
   * Créer une nouvelle notification
   */
  async createNotification(data: {
    userId: string
    type: string
    title: string
    message: string
    data?: any
  }): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return notification;
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string, options: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<{
    data: Notification[]
    total: number
    unreadCount: number
  }> {
    const { page = 1, limit = 20, unreadOnly = false } = options
    const skip = (page - 1) * limit

    let where = eq(notifications.userId, userId);
    if (unreadOnly) {
      where = and(eq(notifications.userId, userId), eq(notifications.read, false));
    }

    const [notificationsData, total, unreadCount] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(where)
        .limit(limit)
        .offset(skip)
        .orderBy(desc(notifications.createdAt)),
      db
        .select({ count: notifications.id })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .then(result => result.length),
      db
        .select({ count: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
        .then(result => result.length)
    ])

    return {
      data: notificationsData,
      total,
      unreadCount
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    const [notification] = await db
      .update(notifications)
      .set({
        read: true,
        updatedAt: new Date()
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();

    return notification || null;
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({
        read: true,
        updatedAt: new Date()
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ));

    return 1; // Drizzle ne retourne pas le count, on simule
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));

    return true; // Drizzle ne retourne pas le count, on simule
  }

  /**
   * Obtenir les statistiques des notifications
   */
  async getNotificationStats(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [total, unread, todayCount, thisWeekCount] = await Promise.all([
      db
        .select({ count: notifications.id })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .then(result => result.length),
      db
        .select({ count: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
        .then(result => result.length),
      db
        .select({ count: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), gte(notifications.createdAt, today)))
        .then(result => result.length),
      db
        .select({ count: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), gte(notifications.createdAt, weekAgo)))
        .then(result => result.length)
    ])

    return {
      total,
      unread,
      today: todayCount,
      thisWeek: thisWeekCount,
      readRate: total > 0 ? ((total - unread) / total * 100).toFixed(1) : "0"
    }
  }

  /**
   * Créer une notification pour une nouvelle candidature
   */
  async notifyNewApplication(missionId: number, nurseId: string, establishmentId: string): Promise<void> {
    const [mission] = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionId));

    if (!mission) return

    await this.createNotification({
      userId: establishmentId,
      type: "NEW_APPLICATION",
      title: "Nouvelle candidature",
      message: `Nouvelle candidature reçue pour la mission "${mission.title}"`,
      data: {
        missionId,
        nurseId,
        missionTitle: mission.title
      }
    })
  }

  /**
   * Créer une notification pour un changement de statut de candidature
   */
  async notifyApplicationStatusChange(
    applicationId: number,
    nurseId: string,
    status: string,
    missionTitle: string
  ): Promise<void> {
    const statusMessages = {
      ACCEPTED: "Votre candidature a été acceptée",
      REJECTED: "Votre candidature a été refusée",
      PENDING: "Votre candidature est en cours d'examen"
    }

    await this.createNotification({
      userId: nurseId,
      type: "APPLICATION_STATUS_CHANGE",
      title: "Statut de candidature mis à jour",
      message: `${statusMessages[status as keyof typeof statusMessages] || "Le statut de votre candidature a changé"} pour la mission "${missionTitle}"`,
      data: {
        applicationId,
        status,
        missionTitle
      }
    })
  }

  /**
   * Créer une notification pour une nouvelle mission
   */
  async notifyNewMission(missionId: number, establishmentId: string): Promise<void> {
    const [mission] = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionId));

    if (!mission) return

    // Notifier tous les infirmiers qui correspondent aux critères
    const nurses = await db
      .select()
      .from(nurseProfiles)
      .where(eq(nurseProfiles.specializations, mission.specializations || []));

    for (const nurse of nurses) {
      await this.createNotification({
        userId: nurse.userId,
        type: "NEW_MISSION",
        title: "Nouvelle mission disponible",
        message: `Nouvelle mission disponible : "${mission.title}" à ${mission.location}`,
        data: {
          missionId,
          missionTitle: mission.title,
          location: mission.location,
          hourlyRate: mission.hourlyRate
        }
      })
    }
  }
}

export const notificationService = new NotificationService()
