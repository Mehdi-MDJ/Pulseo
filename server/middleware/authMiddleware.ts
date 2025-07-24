/**
 * ==============================================================================
 * NurseLink AI - Middleware d'Authentification NextAuth.js v5
 * ==============================================================================
 *
 * Middleware pour protéger les routes avec NextAuth.js v5
 * Gestion des rôles et permissions
 * ==============================================================================
 */

import { Request, Response, NextFunction } from "express"
import { handlers } from "../lib/auth"

/**
 * Middleware d'authentification de base
 * Vérifie si l'utilisateur est connecté
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await handlers.GET(req, res)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || "",
      role: session.user.role || "NURSE",
      establishmentId: session.user.establishmentId,
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
export const requireNurse = requireRole(["NURSE"])

/**
 * Middleware pour les établissements uniquement
 */
export const requireEstablishment = requireRole(["ESTABLISHMENT"])

/**
 * Middleware pour les administrateurs uniquement
 */
export const requireAdmin = requireRole(["ADMIN"])

/**
 * Middleware pour les infirmiers et établissements
 */
export const requireNurseOrEstablishment = requireRole(["NURSE", "ESTABLISHMENT"])

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
      const { prisma } = await import("../lib/prisma")

      let isOwner = false

      switch (resourceType) {
        case "mission":
          const mission = await prisma.mission.findUnique({
            where: { id: resourceId },
            include: { establishment: true }
          })
          isOwner = mission?.establishment.userId === req.user.id
          break

        case "profile":
          if (req.user.role === "NURSE") {
            const nurseProfile = await prisma.nurseProfile.findUnique({
              where: { id: resourceId }
            })
            isOwner = nurseProfile?.userId === req.user.id
          } else if (req.user.role === "ESTABLISHMENT") {
            const establishmentProfile = await prisma.establishmentProfile.findUnique({
              where: { id: resourceId }
            })
            isOwner = establishmentProfile?.userId === req.user.id
          }
          break

        case "application":
          const application = await prisma.missionApplication.findUnique({
            where: { id: resourceId },
            include: { mission: { include: { establishment: true } } }
          })
          isOwner = application?.nurseId === req.user.id ||
                    application?.mission.establishment.userId === req.user.id
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
    const { prisma } = await import("../lib/prisma")

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
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

    const hasProfile = (req.user.role === "NURSE" && user.nurseProfile) ||
                      (req.user.role === "ESTABLISHMENT" && user.establishmentProfile)

    if (!hasProfile) {
      return res.status(403).json({
        error: "Profil incomplet - Veuillez compléter votre profil",
        code: "INCOMPLETE_PROFILE",
        requiredProfile: req.user.role === "NURSE" ? "nurse" : "establishment"
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
 * Middleware pour vérifier les permissions d'établissement
 */
export const requireEstablishmentAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Non authentifié",
      code: "UNAUTHORIZED"
    })
  }

  // Les admins ont accès à tout
  if (req.user.role === "ADMIN") {
    return next()
  }

  // Les établissements peuvent accéder à leurs propres données
  if (req.user.role === "ESTABLISHMENT") {
    return next()
  }

  // Les infirmiers ne peuvent pas accéder aux données d'établissement
  return res.status(403).json({
    error: "Accès interdit - Seuls les établissements peuvent accéder à ces données",
    code: "ESTABLISHMENT_ACCESS_REQUIRED"
  })
}
