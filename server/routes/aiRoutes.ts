/**
 * ==============================================================================
 * NurseLink AI - Routes Intelligence Artificielle
 * ==============================================================================
 * 
 * Routes dédiées aux fonctionnalités d'IA
 * ==============================================================================
 */

import { Router } from "express";
import { requireAuthentication, getUserFromRequest } from "../services/authService";
import { storage } from "../services/storageService";
import { aiService } from "../services/aiService";

const router = Router();

/**
 * Prévisions d'absences pour un établissement
 */
router.post("/forecasts", requireAuthentication, async (req: any, res) => {
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

    const forecasts = await aiService.generateAbsenceForecasts(establishmentProfile.id);
    
    // Sauvegarde des prévisions en base
    for (const forecast of forecasts) {
      await storage.createAbsenceForecast({
        establishmentId: forecast.establishmentId,
        forecastDate: new Date(forecast.date),
        expectedAbsences: forecast.expectedAbsences,
        confidenceLevel: forecast.confidence,
        factors: forecast.factors,
        recommendations: forecast.recommendations,
        modelVersion: "gpt-4o-v1",
        isActive: true,
      });
    }

    res.json(forecasts);
  } catch (error) {
    console.error("Erreur génération prévisions IA:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Récupération des prévisions existantes
 */
router.get("/forecasts", requireAuthentication, async (req: any, res) => {
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

    const forecasts = await storage.getAbsenceForecasts(establishmentProfile.id);
    res.json(forecasts);
  } catch (error) {
    console.error("Erreur récupération prévisions:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Analyse de profil infirmier avec recommandations
 */
router.post("/analyze-profile", requireAuthentication, async (req: any, res) => {
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

    const recommendations = await aiService.analyzeNurseProfile(nurseProfile);
    res.json({ recommendations });
  } catch (error) {
    console.error("Erreur analyse profil IA:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Vérification de la santé du service IA
 */
router.get("/health", requireAuthentication, async (req: any, res) => {
  try {
    const isHealthy = await aiService.healthCheck();
    res.json({ 
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur health check IA:", error);
    res.status(500).json({ 
      status: "error",
      error: "Erreur serveur", 
      code: "INTERNAL_ERROR" 
    });
  }
});

export default router;