/**
 * ==============================================================================
 * NurseLink AI - Routes de Notifications
 * ==============================================================================
 *
 * Routes API pour la gestion des notifications dans l'app mobile
 * Permet aux infirmiers de récupérer et gérer leurs notifications
 * ==============================================================================
 */

import { Router } from 'express';
import { notificationService } from '../services/notificationService';
import { localAuthMiddleware } from '../middleware/localAuthMiddleware';

const router = Router();

/**
 * GET /api/notifications
 * Récupère les notifications d'un infirmier connecté
 */
router.get('/', localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // TODO: Récupérer l'ID infirmier depuis le profil utilisateur
    const nurseId = parseInt(userId.replace('user-', '')) || 1; // Simulation

    const limit = parseInt(req.query.limit as string) || 20;
    const notifications = await notificationService.getNurseNotifications(nurseId, limit);

    res.json({
      success: true,
      notifications,
      total: notifications.length
    });

  } catch (error) {
    console.error("[NotificationRoutes] Erreur récupération notifications:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des notifications" });
  }
});

/**
 * GET /api/notifications/stats
 * Récupère les statistiques de notifications d'un infirmier
 */
router.get('/stats', localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const nurseId = parseInt(userId.replace('user-', '')) || 1; // Simulation
    const stats = await notificationService.getNotificationStats(nurseId);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("[NotificationRoutes] Erreur récupération stats:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des statistiques" });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Marque une notification comme lue
 */
router.put('/:id/read', localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: "ID de notification invalide" });
    }

    const nurseId = parseInt(userId.replace('user-', '')) || 1; // Simulation
    const success = await notificationService.markAsRead(notificationId, nurseId);

    if (!success) {
      return res.status(404).json({ error: "Notification non trouvée" });
    }

    res.json({
      success: true,
      message: "Notification marquée comme lue"
    });

  } catch (error) {
    console.error("[NotificationRoutes] Erreur marquage notification:", error);
    res.status(500).json({ error: "Erreur serveur lors du marquage de la notification" });
  }
});

/**
 * PUT /api/notifications/read-all
 * Marque toutes les notifications d'un infirmier comme lues
 */
router.put('/read-all', localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const nurseId = parseInt(userId.replace('user-', '')) || 1; // Simulation
    await notificationService.markAllAsRead(nurseId);

    res.json({
      success: true,
      message: "Toutes les notifications marquées comme lues"
    });

  } catch (error) {
    console.error("[NotificationRoutes] Erreur marquage notifications:", error);
    res.status(500).json({ error: "Erreur serveur lors du marquage des notifications" });
  }
});

/**
 * DELETE /api/notifications/:id
 * Supprime une notification
 */
router.delete('/:id', localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: "ID de notification invalide" });
    }

    // TODO: Implémenter la suppression de notification
    console.log(`🗑️ Suppression notification ${notificationId} pour utilisateur ${userId}`);

    res.json({
      success: true,
      message: "Notification supprimée"
    });

  } catch (error) {
    console.error("[NotificationRoutes] Erreur suppression notification:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression de la notification" });
  }
});

/**
 * POST /api/notifications/test
 * Route de test pour créer une notification de démonstration
 */
router.post('/test', localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const nurseId = parseInt(userId.replace('user-', '')) || 1; // Simulation

    // Créer une notification de test
    const testNotification = await notificationService.createNotification({
      nurseId,
      missionId: 1,
      type: 'new_mission_match',
      title: 'Mission de test disponible',
      message: 'Une nouvelle mission correspondant à votre profil est disponible !',
      score: 85,
      distance: 12.5,
      urgency: 'high',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: "Notification de test créée",
      notification: testNotification
    });

  } catch (error) {
    console.error("[NotificationRoutes] Erreur création notification test:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création de la notification de test" });
  }
});

export default router;
