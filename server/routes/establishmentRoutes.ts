/**
 * ==============================================================================
 * NurseLink AI - Routes des Établissements
 * ==============================================================================
 *
 * Routes pour la gestion des établissements
 * Profils, missions, statistiques
 * ==============================================================================
 */

import { Router, Request, Response } from "express"
import { z } from "zod"
import { requireAuthentication, getUserFromRequest, AuthenticatedRequest } from "../services/authService"
import { storageService } from "../services/storageService"

const router = Router()

// Schémas de validation
const establishmentProfileSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  specialties: z.array(z.string()).optional(),
  capacity: z.number().positive(),
  description: z.string().optional(),
})

// ==============================================================================
// Routes des Profils Établissements
// ==============================================================================

// Créer un profil établissement
router.post("/profile", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    // Vérifier que l'utilisateur est un établissement
    if (userInfo.role !== "ESTABLISHMENT") {
      return res.status(403).json({
        error: "Accès refusé - Seuls les établissements peuvent créer un profil",
        code: "FORBIDDEN"
      })
    }

    // Validation des données
    const validationResult = establishmentProfileSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: validationResult.error.issues,
      })
    }

    const profileData = {
      ...validationResult.data,
      userId: userInfo.id,
    }

    const profile = await storageService.createEstablishmentProfile(profileData)

    res.status(201).json({
      message: "Profil établissement créé avec succès",
      profile
    })
  } catch (error) {
    console.error("Erreur création profil établissement:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Récupérer le profil établissement
router.get("/profile", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const profile = await storageService.getEstablishmentProfile(userInfo.id)

    if (!profile) {
      return res.status(404).json({
        error: "Profil établissement non trouvé",
        code: "PROFILE_NOT_FOUND"
      })
    }

    res.json(profile)
  } catch (error) {
    console.error("Erreur récupération profil établissement:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Mettre à jour le profil établissement
router.put("/profile", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    // Validation des données
    const validationResult = establishmentProfileSchema.partial().safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: validationResult.error.issues,
      })
    }

    const profile = await storageService.updateEstablishmentProfile(userInfo.id, validationResult.data)

    if (!profile) {
      return res.status(404).json({
        error: "Profil établissement non trouvé",
        code: "PROFILE_NOT_FOUND"
      })
    }

    res.json({
      message: "Profil établissement mis à jour",
      profile
    })
  } catch (error) {
    console.error("Erreur mise à jour profil établissement:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// ==============================================================================
// Routes des Statistiques
// ==============================================================================

// Statistiques de l'établissement
router.get("/stats", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const stats = await storageService.getEstablishmentStats(userInfo.id)

    res.json(stats)
  } catch (error) {
    console.error("Erreur récupération statistiques:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// ==============================================================================
// Routes des Missions
// ==============================================================================

// Missions de l'établissement
router.get("/missions", requireAuthentication as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const { status, page = 1, limit = 10 } = req.query
    const missions = await storageService.getEstablishmentMissions(userInfo.id, {
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    })

    res.json({
      missions: missions.data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: missions.total,
        pages: Math.ceil(missions.total / parseInt(limit as string))
      }
    })
  } catch (error) {
    console.error("Erreur récupération missions:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

export default router
