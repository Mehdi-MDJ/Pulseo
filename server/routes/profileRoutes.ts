/**
 * ==============================================================================
 * NurseLink AI - Routes des Profils
 * ==============================================================================
 * 
 * Routes dédiées à la gestion des profils infirmiers et établissements
 * ==============================================================================
 */

import { Router } from "express";
import { requireAuthentication, getUserFromRequest } from "../services/authService";
import { storage } from "../services/storageService";
import { insertNurseProfileSchema, insertEstablishmentProfileSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

/**
 * Routes pour les profils infirmiers
 */

// Récupération du profil infirmier
router.get("/nurse", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    const profile = await storage.getNurseProfile(userInfo.userId);
    res.json(profile || null);
  } catch (error) {
    console.error("Erreur récupération profil infirmier:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

// Création/mise à jour du profil infirmier
router.post("/nurse", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    // Validation des données
    const profileData = insertNurseProfileSchema.parse({
      ...req.body,
      userId: userInfo.userId,
    });

    const profile = await storage.createOrUpdateNurseProfile(profileData);
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: error.errors,
      });
    }

    console.error("Erreur sauvegarde profil infirmier:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Routes pour les profils établissements
 */

// Récupération du profil établissement
router.get("/establishment/:id?", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    const establishmentId = req.params.id ? parseInt(req.params.id) : undefined;
    const profile = await storage.getEstablishmentProfile(userInfo.userId, establishmentId);
    res.json(profile || null);
  } catch (error) {
    console.error("Erreur récupération profil établissement:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

// Création/mise à jour du profil établissement
router.post("/establishment", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Non authentifié", code: "UNAUTHORIZED" });
    }

    // Validation des données
    const profileData = insertEstablishmentProfileSchema.parse({
      ...req.body,
      userId: userInfo.userId,
    });

    const profile = await storage.createOrUpdateEstablishmentProfile(profileData);
    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: error.errors,
      });
    }

    console.error("Erreur sauvegarde profil établissement:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Route pour récupérer les statistiques de profil
 */
router.get("/stats/:type/:id", requireAuthentication, async (req: any, res) => {
  try {
    const { type, id } = req.params;
    const profileId = parseInt(id);

    if (isNaN(profileId)) {
      return res.status(400).json({ error: "ID invalide", code: "INVALID_ID" });
    }

    let stats;
    if (type === "nurse") {
      stats = await storage.getNurseStats(profileId);
    } else if (type === "establishment") {
      stats = await storage.getEstablishmentStats(profileId);
    } else {
      return res.status(400).json({ error: "Type invalide", code: "INVALID_TYPE" });
    }

    res.json(stats);
  } catch (error) {
    console.error("Erreur récupération statistiques:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

/**
 * Route publique pour récupérer tous les profils (utilisée par l'app demo)
 */
router.get("/", async (req, res) => {
  try {
    // Pour la démonstration, on retourne des profils fictifs réalistes
    const nurses = [
      {
        id: 1,
        name: "Marie Dupont",
        specialization: "Réanimation",
        experience: 5,
        rating: 4.8,
        availability: true,
        location: "Lyon"
      },
      {
        id: 2,
        name: "Jean Martin",
        specialization: "Urgences",
        experience: 8,
        rating: 4.9,
        availability: true,
        location: "Paris"
      },
      {
        id: 3,
        name: "Sophie Leroy",
        specialization: "Pédiatrie",
        experience: 3,
        rating: 4.7,
        availability: false,
        location: "Marseille"
      }
    ];

    const establishments = [
      {
        id: 1,
        name: "CHU Lyon Sud",
        type: "Hôpital Universitaire",
        location: "Lyon",
        rating: 4.6
      },
      {
        id: 2,
        name: "Clinique Saint-Joseph",
        type: "Clinique privée",
        location: "Paris",
        rating: 4.4
      }
    ];

    res.json({ nurses, establishments });
  } catch (error) {
    console.error("Erreur récupération profils:", error);
    res.status(500).json({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
  }
});

export default router;