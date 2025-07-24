/**
 * ==============================================================================
 * NurseLink AI - Routes des Notifications
 * ==============================================================================
 *
 * Routes pour la gestion des notifications
 * Notifications en temps réel et historiques
 * ==============================================================================
 */

import { Router, Request, Response } from "express"
import { requireAuthentication, getUserFromRequest, AuthenticatedRequest } from "../services/authService"
import { notificationService } from "../services/notificationService"

const router = Router()

// ==============================================================================
// Routes des Notifications
// ==============================================================================

// Récupérer les notifications de l'utilisateur
router.get("/", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query

    const notifications = await notificationService.getUserNotifications(userInfo.id, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      unreadOnly: unreadOnly === "true"
    })

    res.json({
      notifications: notifications.data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: notifications.total,
        unread: notifications.unreadCount
      }
    })
  } catch (error) {
    console.error("Erreur récupération notifications:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Marquer une notification comme lue
router.patch("/:id/read", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const notificationId = req.params.id
    const notification = await notificationService.markAsRead(notificationId, userInfo.id)

    if (!notification) {
      return res.status(404).json({
        error: "Notification non trouvée",
        code: "NOTIFICATION_NOT_FOUND"
      })
    }

    res.json({
      message: "Notification marquée comme lue",
      notification
    })
  } catch (error) {
    console.error("Erreur marquage notification:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Marquer toutes les notifications comme lues
router.patch("/read-all", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const count = await notificationService.markAllAsRead(userInfo.id)

    res.json({
      message: `${count} notifications marquées comme lues`,
      count
    })
  } catch (error) {
    console.error("Erreur marquage notifications:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Supprimer une notification
router.delete("/:id", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const notificationId = req.params.id
    const deleted = await notificationService.deleteNotification(notificationId, userInfo.id)

    if (!deleted) {
      return res.status(404).json({
        error: "Notification non trouvée",
        code: "NOTIFICATION_NOT_FOUND"
      })
    }

    res.json({
      message: "Notification supprimée"
    })
  } catch (error) {
    console.error("Erreur suppression notification:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Statistiques des notifications
router.get("/stats", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const stats = await notificationService.getNotificationStats(userInfo.id)

    res.json(stats)
  } catch (error) {
    console.error("Erreur récupération statistiques notifications:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

export default router
