/**
 * ==============================================================================
 * NurseLink AI - Routes des Missions
 * ==============================================================================
 *
 * Routes pour la gestion des missions
 * CRUD complet avec authentification
 * ==============================================================================
 */

import { Router, Request, Response } from "express"
import { z } from "zod"
import { requireAuthentication, getUserFromRequest } from "../services/authService"
import { aiService } from "../services/aiService"
import { storageService } from "../services/storageService"
import { contractService } from "../services/contractService"

const router = Router()

// Schémas de validation
const insertMissionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  hourlyRate: z.number().positive(),
  requirements: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
})

const insertMissionApplicationSchema = z.object({
  coverLetter: z.string().min(1),
  availability: z.string().optional(),
  proposedRate: z.number().positive().optional(),
})

// ==============================================================================
// Routes des Missions
// ==============================================================================

// Créer une nouvelle mission (Établissement)
router.post("/", requireAuthentication as any, async (req: any, res: Response) => {
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
        error: "Accès refusé - Seuls les établissements peuvent créer des missions",
        code: "FORBIDDEN"
      })
    }

    const establishmentProfile = await storageService.getEstablishmentProfile(userInfo.id)

    if (!establishmentProfile) {
      return res.status(400).json({
        error: "Profil établissement requis pour créer une mission",
        code: "ESTABLISHMENT_PROFILE_REQUIRED"
      })
    }

    // Validation des données
    const validationResult = insertMissionSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: validationResult.error.issues,
      })
    }

    const missionData = {
      ...validationResult.data,
      establishmentId: userInfo.id,
      status: "OPEN",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mission = await storageService.createMission(missionData)

    res.status(201).json({
      message: "Mission créée avec succès",
      mission
    })
  } catch (error) {
    console.error("Erreur création mission:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Récupérer les missions d'un établissement
router.get("/establishment", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const establishmentProfile = await storageService.getEstablishmentProfile(userInfo.id)

    if (!establishmentProfile) {
      return res.status(400).json({
        error: "Profil établissement requis",
        code: "ESTABLISHMENT_PROFILE_REQUIRED"
      })
    }

    const missions = await storageService.getMissionsByEstablishment(userInfo.id)

    res.json({
      missions,
      total: missions.length
    })
  } catch (error) {
    console.error("Erreur récupération missions:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Récupérer les missions disponibles pour les infirmiers
router.get("/nurse", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const nurseProfile = await storageService.getNurseProfile(userInfo.id)

    if (!nurseProfile) {
      return res.status(400).json({
        error: "Profil infirmier requis",
        code: "NURSE_PROFILE_REQUIRED"
      })
    }

    const missions = await storageService.getAvailableMissions()

    res.json({
      missions,
      total: missions.length
    })
  } catch (error) {
    console.error("Erreur récupération missions:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Récupérer une mission spécifique
router.get("/:id", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const missionId = parseInt(req.params.id)
    if (isNaN(missionId)) {
      return res.status(400).json({
        error: "ID de mission invalide",
        code: "INVALID_MISSION_ID"
      })
    }

    const mission = await storageService.getMission(missionId)

    if (!mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
        code: "MISSION_NOT_FOUND"
      })
    }

    // Récupérer les candidatures si l'utilisateur est l'établissement propriétaire
    const userInfo = getUserFromRequest(req)
    let applications = null

    if (userInfo && userInfo.role === "ESTABLISHMENT" && mission.establishmentId === userInfo.id) {
      applications = await storageService.getMissionApplications(missionId)
    }

    res.json({
      mission,
      applications
    })
  } catch (error) {
    console.error("Erreur récupération mission:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Mettre à jour le statut d'une mission
router.patch("/:id/status", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const missionId = parseInt(req.params.id)
    const { status } = req.body

    if (isNaN(missionId)) {
      return res.status(400).json({
        error: "ID de mission invalide",
        code: "INVALID_MISSION_ID"
      })
    }

    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const mission = await storageService.getMission(missionId)
    if (!mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
        code: "MISSION_NOT_FOUND"
      })
    }

    if (mission.establishmentId !== userInfo.id) {
      return res.status(403).json({
        error: "Accès refusé",
        code: "FORBIDDEN"
      })
    }

    const updatedMission = await storageService.updateMissionStatus(missionId, status)

    res.json({
      message: "Statut de mission mis à jour",
      mission: updatedMission
    })
  } catch (error) {
    console.error("Erreur mise à jour mission:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// ==============================================================================
// Routes des Candidatures
// ==============================================================================

// Postuler à une mission
router.post("/:id/apply", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const missionId = parseInt(req.params.id)
    if (isNaN(missionId)) {
      return res.status(400).json({
        error: "ID de mission invalide",
        code: "INVALID_MISSION_ID"
      })
    }

    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    // Vérifier que l'utilisateur est un infirmier
    if (userInfo.role !== "NURSE") {
      return res.status(403).json({
        error: "Seuls les infirmiers peuvent postuler aux missions",
        code: "FORBIDDEN"
      })
    }

    const nurseProfile = await storageService.getNurseProfile(userInfo.id)

    if (!nurseProfile) {
      return res.status(400).json({
        error: "Profil infirmier requis pour postuler",
        code: "NURSE_PROFILE_REQUIRED"
      })
    }

    // Validation des données
    const validationResult = insertMissionApplicationSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: validationResult.error.issues,
      })
    }

    const applicationData = {
      ...validationResult.data,
      missionId,
      nurseId: userInfo.id,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const application = await storageService.createMissionApplication(applicationData)

    res.status(201).json({
      message: "Candidature soumise avec succès",
      application
    })
  } catch (error) {
    console.error("Erreur candidature:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Récupérer les candidatures d'une mission
router.get("/:id/applications", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const missionId = parseInt(req.params.id)
    if (isNaN(missionId)) {
      return res.status(400).json({
        error: "ID de mission invalide",
        code: "INVALID_MISSION_ID"
      })
    }

    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const mission = await storageService.getMission(missionId)
    if (!mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
        code: "MISSION_NOT_FOUND"
      })
    }

    if (mission.establishmentId !== userInfo.id) {
      return res.status(403).json({
        error: "Accès refusé",
        code: "FORBIDDEN"
      })
    }

    const applications = await storageService.getMissionApplications(missionId)

    res.json({
      applications,
      total: applications.length
    })
  } catch (error) {
    console.error("Erreur récupération candidatures:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Mettre à jour le statut d'une candidature
router.patch("/applications/:id/status", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id)
    const { status, feedback } = req.body

    if (isNaN(applicationId)) {
      return res.status(400).json({
        error: "ID de candidature invalide",
        code: "INVALID_APPLICATION_ID"
      })
    }

    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const currentApplication = await storageService.getMissionApplication(applicationId)

    if (!currentApplication) {
      return res.status(404).json({
        error: "Candidature non trouvée",
        code: "APPLICATION_NOT_FOUND"
      })
    }

    const mission = await storageService.getMission(currentApplication.missionId)
    if (!mission || mission.establishmentId !== userInfo.id) {
      return res.status(403).json({
        error: "Accès refusé",
        code: "FORBIDDEN"
      })
    }

    const application = await storageService.updateMissionApplicationStatus(applicationId, status, feedback)

    // Si la candidature est acceptée, générer un contrat
    let contract = null
    if (status === "ACCEPTED") {
      contract = await contractService.generateContractOnAcceptance(
        currentApplication.missionId,
        currentApplication.nurseId,
        userInfo.id
      )
    }

    res.json({
      message: "Statut de candidature mis à jour",
      application,
      contract
    })
  } catch (error) {
    console.error("Erreur mise à jour candidature:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// ==============================================================================
// Routes IA
// ==============================================================================

// Matching IA pour une mission
router.get("/:id/ai-matching", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const missionId = parseInt(req.params.id)
    if (isNaN(missionId)) {
      return res.status(400).json({
        error: "ID de mission invalide",
        code: "INVALID_MISSION_ID"
      })
    }

    const userInfo = getUserFromRequest(req)
    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const mission = await storageService.getMission(missionId)
    if (!mission) {
      return res.status(404).json({
        error: "Mission non trouvée",
        code: "MISSION_NOT_FOUND"
      })
    }

    if (mission.establishmentId !== userInfo.id) {
      return res.status(403).json({
        error: "Accès refusé",
        code: "FORBIDDEN"
      })
    }

    const matches = await aiService.optimizeMatching(missionId.toString(), [])

    res.json({
      matches: matches.optimizedCandidates,
      scores: matches.scores
    })
  } catch (error) {
    console.error("Erreur matching IA:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Recherche de missions avec IA
router.post("/search", requireAuthentication as any, async (req: any, res: Response) => {
  try {
    const { query, filters } = req.body
    const userInfo = getUserFromRequest(req)

    if (!userInfo) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const missions = await storageService.searchMissions(query, filters)

    res.json({
      missions,
      total: missions.length
    })
  } catch (error) {
    console.error("Erreur recherche missions:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

export default router
