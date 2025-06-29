/**
 * ==============================================================================
 * NurseLink AI - Routes des Missions
 * ==============================================================================
 * 
 * Routes dédiées à la gestion des missions et candidatures
 * ==============================================================================
 */

import { Router } from "express";
import { requireAuthentication, getUserFromRequest } from "../services/authService";
import { storage } from "../services/storageService";
import { aiService } from "../services/aiService";
import { contractService } from "../services/contractService";
import { insertMissionSchema, insertMissionApplicationSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

/**
 * Création d'une nouvelle mission
 */
router.post("/", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    // Récupération du profil établissement
    const establishmentProfile = await storage.getEstablishmentProfile(userInfo.userId);
    if (!establishmentProfile) {
      return res.status(403).json({ 
        error: "Profil établissement requis", 
        code: "ESTABLISHMENT_PROFILE_REQUIRED" 
      });
    }

    // Validation des données
    const missionData = insertMissionSchema.parse({
      ...req.body,
      establishmentId: establishmentProfile.id,
    });

    const mission = await storage.createMission(missionData);
    res.json(mission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: error.errors,
      });
    }

    console.error("Erreur création mission:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Récupération des missions pour un établissement
 */
router.get("/establishment", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    const establishmentProfile = await storage.getEstablishmentProfile(userInfo.userId);
    if (!establishmentProfile) {
      return res.status(403).json({ 
        error: "Profil établissement requis", 
        code: "ESTABLISHMENT_PROFILE_REQUIRED" 
      });
    }

    const missions = await storage.getMissionsForEstablishment(establishmentProfile.id);
    res.json(missions);
  } catch (error) {
    console.error("Erreur récupération missions établissement:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Récupération des missions disponibles pour un infirmier
 */
router.get("/nurse", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    const nurseProfile = await storage.getNurseProfile(userInfo.userId);
    if (!nurseProfile) {
      return res.status(403).json({ 
        error: "Profil infirmier requis", 
        code: "NURSE_PROFILE_REQUIRED" 
      });
    }

    const missions = await storage.getMissionsForNurse(nurseProfile.id);
    res.json(missions);
  } catch (error) {
    console.error("Erreur récupération missions infirmier:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Récupération d'une mission spécifique
 */
router.get("/:id", requireAuthentication, async (req: any, res) => {
  try {
    const missionId = parseInt(req.params.id);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: "ID mission invalide", code: "INVALID_MISSION_ID" });
    }

    const mission = await storage.getMission(missionId);
    if (!mission) {
      return res.status(404).json({ error: "Mission non trouvée", code: "MISSION_NOT_FOUND" });
    }

    res.json(mission);
  } catch (error) {
    console.error("Erreur récupération mission:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Mise à jour du statut d'une mission
 */
router.patch("/:id/status", requireAuthentication, async (req: any, res) => {
  try {
    const missionId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(missionId)) {
      return res.status(400).json({ error: "ID mission invalide", code: "INVALID_MISSION_ID" });
    }

    const mission = await storage.updateMissionStatus(missionId, status);
    if (!mission) {
      return res.status(404).json({ error: "Mission non trouvée", code: "MISSION_NOT_FOUND" });
    }

    res.json(mission);
  } catch (error) {
    console.error("Erreur mise à jour statut mission:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Candidature à une mission
 */
router.post("/:id/apply", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    const missionId = parseInt(req.params.id);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: "ID mission invalide", code: "INVALID_MISSION_ID" });
    }

    const nurseProfile = await storage.getNurseProfile(userInfo.userId);
    if (!nurseProfile) {
      return res.status(403).json({ 
        error: "Profil infirmier requis", 
        code: "NURSE_PROFILE_REQUIRED" 
      });
    }

    // Validation des données de candidature
    const applicationData = insertMissionApplicationSchema.parse({
      ...req.body,
      missionId,
      nurseId: nurseProfile.id,
    });

    const application = await storage.createMissionApplication(applicationData);
    res.json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: error.errors,
      });
    }

    console.error("Erreur candidature mission:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Récupération des candidatures pour une mission
 */
router.get("/:id/applications", requireAuthentication, async (req: any, res) => {
  try {
    const missionId = parseInt(req.params.id);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: "ID mission invalide", code: "INVALID_MISSION_ID" });
    }

    const applications = await storage.getMissionApplications(missionId);
    res.json(applications);
  } catch (error) {
    console.error("Erreur récupération candidatures:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Mise à jour du statut d'une candidature avec génération automatique de contrat
 */
router.patch("/applications/:id/status", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    const applicationId = parseInt(req.params.id);
    const { status, feedback } = req.body;

    if (isNaN(applicationId)) {
      return res.status(400).json({ error: "ID candidature invalide", code: "INVALID_APPLICATION_ID" });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Statut invalide", code: "INVALID_STATUS" });
    }

    // Récupérer la candidature avec les données de mission et infirmier
    const currentApplication = await storage.getMissionApplication(applicationId);
    if (!currentApplication) {
      return res.status(404).json({ error: "Candidature non trouvée", code: "APPLICATION_NOT_FOUND" });
    }

    // Vérifier que l'utilisateur est l'établissement de cette mission
    const mission = await storage.getMission(currentApplication.missionId);
    if (!mission || mission.establishmentId !== userInfo.userId) {
      return res.status(403).json({ error: "Accès non autorisé", code: "UNAUTHORIZED_ACCESS" });
    }

    // Mettre à jour le statut de la candidature
    const application = await storage.updateMissionApplicationStatus(applicationId, status, feedback);
    if (!application) {
      return res.status(500).json({ error: "Erreur mise à jour candidature", code: "UPDATE_ERROR" });
    }

    // Si accepté, générer automatiquement le contrat
    let contract = null;
    if (status === 'accepted') {
      try {
        console.log(`[MissionRoutes] Génération automatique contrat pour candidature ${applicationId}`);
        
        // Récupérer l'infirmier à partir du profil de la candidature
        const nurseProfile = await storage.getNurseProfile(currentApplication.nurseId);
        if (!nurseProfile) {
          throw new Error('Profil infirmier non trouvé');
        }

        // Générer le contrat automatiquement
        contract = await contractService.generateContractOnAcceptance(
          mission.id,
          nurseProfile.userId,
          userInfo.userId
        );

        console.log(`[MissionRoutes] Contrat généré: ${contract.contractNumber}`);

        // Mettre à jour le statut de la mission
        await storage.updateMissionStatus(mission.id, 'in_progress');
        
      } catch (contractError) {
        console.error('[MissionRoutes] Erreur génération contrat:', contractError);
        // Ne pas faire échouer la candidature si le contrat échoue
        // L'établissement pourra générer le contrat manuellement
      }
    }

    res.json({
      application,
      contract,
      message: status === 'accepted' ? 
        'Candidature acceptée. Un contrat a été généré automatiquement.' : 
        'Candidature mise à jour.'
    });

  } catch (error) {
    console.error("Erreur mise à jour statut candidature:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Matching IA pour une mission
 */
router.get("/:id/ai-matching", requireAuthentication, async (req: any, res) => {
  try {
    const missionId = parseInt(req.params.id);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: "ID mission invalide", code: "INVALID_MISSION_ID" });
    }

    const matches = await aiService.matchNursesToMission(missionId);
    res.json(matches);
  } catch (error) {
    console.error("Erreur matching IA:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Recherche de missions avec critères
 */
router.post("/search", requireAuthentication, async (req: any, res) => {
  try {
    const criteria = req.body;
    const missions = await storage.searchMissions(criteria);
    res.json(missions);
  } catch (error) {
    console.error("Erreur recherche missions:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

export default router;