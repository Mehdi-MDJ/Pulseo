/**
 * ==============================================================================
 * NurseLink AI - Service de Notifications
 * ==============================================================================
 *
 * Service pour la gestion des notifications
 * Notifications en temps réel et historiques
 * ==============================================================================
 */

import { prisma } from "../lib/prisma"

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
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        read: false,
      }
    })
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

    const where: any = { userId }
    if (unreadOnly) {
      where.read = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, read: false }
      })
    ])

    return {
      data: notifications,
      total,
      unreadCount
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    return await prisma.notification.update({
      where: {
        id: notificationId,
        userId // Sécurité : vérifier que la notification appartient à l'utilisateur
      },
      data: { read: true }
    })
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    })

    return result.count
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId // Sécurité : vérifier que la notification appartient à l'utilisateur
      }
    })

    return result.count > 0
  }

  /**
   * Obtenir les statistiques des notifications
   */
  async getNotificationStats(userId: string): Promise<any> {
    const [total, unread, today, thisWeek] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      })
    ])

    return {
      total,
      unread,
      today,
      thisWeek,
      readRate: total > 0 ? ((total - unread) / total * 100).toFixed(1) : "0"
    }
  }

  /**
   * Créer une notification pour une nouvelle candidature
   */
  async notifyNewApplication(missionId: number, nurseId: string, establishmentId: string): Promise<void> {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId }
    })

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
    const mission = await prisma.mission.findUnique({
      where: { id: missionId }
    })

    if (!mission) return

    // Notifier tous les infirmiers qui correspondent aux critères
    const nurses = await prisma.nurseProfile.findMany({
      where: {
        specializations: {
          hasSome: mission.specializations || []
        }
      }
    })

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
