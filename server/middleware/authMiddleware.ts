/**
 * ==============================================================================
 * NurseLink AI - Middleware d'Authentification Personnalisé
 * ==============================================================================
 *
 * Middleware pour protéger les routes avec notre système d'auth personnalisé
 * Gestion des rôles et permissions avec Drizzle ORM
 * ==============================================================================
 */

import { Request, Response, NextFunction } from "express"
import { getDb } from "../db"
import { users, missions, nurseProfiles, establishmentProfiles, missionApplications } from "@shared/schema"
import { eq } from "drizzle-orm"

// Étendre le type Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        role: string
        establishmentId?: string
      }
      establishmentProfile?: any
    }
  }
}

/**
 * Middleware d'authentification de base
 * Vérifie si l'utilisateur est connecté via les cookies
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    // Vérifier la session (simulation pour l'instant)
    // En production, on vérifierait la session dans la base de données
    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionId) // Simplification pour l'exemple
    })

    if (!user) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      role: user.role,
    }

    next()
  } catch (error) {
    console.error("Erreur middleware authentification:", error)
    return res.status(401).json({
      error: "Erreur d'authentification",
      code: "AUTH_ERROR"
    })
  }
}

/**
 * Middleware pour vérifier les rôles
 * @param roles - Rôles autorisés
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Accès interdit",
        code: "FORBIDDEN",
        requiredRoles: roles,
        userRole: req.user.role
      })
    }

    next()
  }
}

/**
 * Middleware pour les infirmiers uniquement
 */
export const requireNurse = requireRole(["nurse"])

/**
 * Middleware pour les établissements uniquement
 */
export const requireEstablishment = requireRole(["establishment"])

/**
 * Middleware pour les administrateurs uniquement
 */
export const requireAdmin = requireRole(["admin"])

/**
 * Middleware pour les infirmiers et établissements
 */
export const requireNurseOrEstablishment = requireRole(["nurse", "establishment"])

/**
 * Middleware pour vérifier la propriété d'une ressource
 * @param resourceIdField - Champ contenant l'ID de la ressource
 * @param resourceType - Type de ressource (mission, profile, etc.)
 */
export const requireOwnership = (resourceIdField: string, resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const resourceId = req.params[resourceIdField] || req.body[resourceIdField]

    if (!resourceId) {
      return res.status(400).json({
        error: "ID de ressource manquant",
        code: "MISSING_RESOURCE_ID"
      })
    }

    try {
      const db = await getDb()
      let isOwner = false

      switch (resourceType) {
        case "mission":
          const mission = await db.query.missions.findFirst({
            where: eq(missions.id, parseInt(resourceId)),
            with: {
              establishment: true
            }
          })
          isOwner = mission?.establishment?.userId === req.user.id
          break

        case "profile":
          if (req.user.role === "nurse") {
            const nurseProfile = await db.query.nurseProfiles.findFirst({
              where: eq(nurseProfiles.id, parseInt(resourceId))
            })
            isOwner = nurseProfile?.userId === req.user.id
          } else if (req.user.role === "establishment") {
            const establishmentProfile = await db.query.establishmentProfiles.findFirst({
              where: eq(establishmentProfiles.id, parseInt(resourceId))
            })
            isOwner = establishmentProfile?.userId === req.user.id
          }
          break

        case "application":
          const application = await db.query.missionApplications.findFirst({
            where: eq(missionApplications.id, parseInt(resourceId)),
            with: {
              mission: {
                with: {
                  establishment: true
                }
              }
            }
          })
          isOwner = application?.nurseId === req.user.id ||
                    application?.mission?.establishment?.userId === req.user.id
          break

        default:
          return res.status(400).json({
            error: "Type de ressource non supporté",
            code: "UNSUPPORTED_RESOURCE_TYPE"
          })
      }

      if (!isOwner) {
        return res.status(403).json({
          error: "Accès interdit - Vous n'êtes pas propriétaire de cette ressource",
          code: "NOT_OWNER"
        })
      }

      next()
    } catch (error) {
      console.error("Erreur vérification propriété:", error)
      return res.status(500).json({
        error: "Erreur serveur",
        code: "INTERNAL_ERROR"
      })
    }
  }
}

/**
 * Middleware pour vérifier si l'utilisateur a un profil complet
 */
export const requireCompleteProfile = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Non authentifié",
      code: "UNAUTHORIZED"
    })
  }

  try {
    const db = await getDb()

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
      with: {
        nurseProfile: true,
        establishmentProfile: true,
      }
    })

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND"
      })
    }

    const hasProfile = (req.user.role === "nurse" && user.nurseProfile) ||
                      (req.user.role === "establishment" && user.establishmentProfile)

    if (!hasProfile) {
      return res.status(403).json({
        error: "Profil incomplet - Veuillez compléter votre profil",
        code: "INCOMPLETE_PROFILE"
      })
    }

    next()
  } catch (error) {
    console.error("Erreur vérification profil:", error)
    return res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
}

/**
 * Middleware pour vérifier l'accès aux établissements
 */
export const requireEstablishmentAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Non authentifié",
      code: "UNAUTHORIZED"
    })
  }

  if (req.user.role !== "establishment") {
    return res.status(403).json({
      error: "Accès réservé aux établissements",
      code: "ESTABLISHMENT_ONLY"
    })
  }

  try {
    const db = await getDb()
    const establishmentProfile = await db.query.establishmentProfiles.findFirst({
      where: eq(establishmentProfiles.userId, req.user.id)
    })

    if (!establishmentProfile) {
      return res.status(403).json({
        error: "Profil établissement requis",
        code: "ESTABLISHMENT_PROFILE_REQUIRED"
      })
    }

    // Ajouter le profil établissement à la requête
    req.establishmentProfile = establishmentProfile
    next()
  } catch (error) {
    console.error("Erreur vérification établissement:", error)
    return res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
}
