/**
 * ==============================================================================
 * NurseLink AI - Routes Assistant IA Conversationnel
 * ==============================================================================
 *
 * API endpoints pour l'assistant IA intelligent
 * ==============================================================================
 */

import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { aiAssistantService } from "../services/aiAssistantService";

const router = Router();

/**
 * Schéma de validation pour message de conversation
 */
const messageSchema = z.object({
  message: z.string().min(1).max(1000),
});

/**
 * Schéma de validation pour négociation de tarif
 */
const negotiationSchema = z.object({
  missionId: z.number(),
  proposedRate: z.number().min(15).max(100),
});

/**
 * Traitement d'un message utilisateur
 */
router.post("/chat", requireAuth, async (req: any, res) => {
  try {
    const { message } = messageSchema.parse(req.body);
    const userId = req.user.claims.sub;

    const response = await aiAssistantService.processMessage(userId, message);

    res.json(response);
  } catch (error) {
    console.error("Erreur chat assistant:", error);
    res.status(500).json({
      message: "Erreur lors du traitement du message",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

/**
 * Recommandations de missions personnalisées
 */
router.get("/recommendations/missions", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const filters = req.query;

    const missions = await aiAssistantService.recommendMissions(userId, filters);

    res.json({
      missions,
      count: missions.length,
      message: `${missions.length} missions recommandées pour votre profil`
    });
  } catch (error) {
    console.error("Erreur recommandations missions:", error);
    res.status(500).json({
      message: "Erreur lors de la génération des recommandations"
    });
  }
});

/**
 * Négociation automatique de tarifs
 */
router.post("/negotiate", requireAuth, async (req: any, res) => {
  try {
    const { missionId, proposedRate } = negotiationSchema.parse(req.body);
    const userId = req.user.claims.sub;

    const result = await aiAssistantService.negotiateRate(missionId, userId, proposedRate);

    res.json(result);
  } catch (error) {
    console.error("Erreur négociation:", error);
    res.status(500).json({
      message: "Erreur lors de la négociation"
    });
  }
});

/**
 * Planification de carrière personnalisée
 */
router.get("/career-plan", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const careerPlan = await aiAssistantService.planCareer(userId);

    res.json({
      careerPlan,
      message: "Plan de carrière généré avec succès"
    });
  } catch (error) {
    console.error("Erreur planification carrière:", error);
    res.status(500).json({
      message: "Erreur lors de la planification de carrière"
    });
  }
});

/**
 * Historique des conversations
 */
router.get("/conversations", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    // Pour l'instant, retourne un historique basique
    // À implémenter avec stockage en base de données
    res.json({
      conversations: [
        {
          id: 1,
          timestamp: new Date(),
          preview: "Dernière conversation avec l'assistant",
          messageCount: 5
        }
      ],
      message: "Historique des conversations récupéré"
    });
  } catch (error) {
    console.error("Erreur historique conversations:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'historique"
    });
  }
});

export default router;
