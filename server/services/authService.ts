/**
 * ==============================================================================
 * NurseLink AI - Service d'Authentification
 * ==============================================================================
 *
 * Service d'authentification pour les routes
 * Gestion des middlewares d'authentification
 * ==============================================================================
 */

import { Request, Response, NextFunction } from "express"
import { authService } from "../lib/simple-auth"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    establishmentId?: string | null
  }
}

/**
 * Middleware pour vérifier l'authentification
 */
export const requireAuthentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await authService.getSession(req)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      establishmentId: session.user.establishmentId || undefined
    }
    next()
  } catch (error) {
    console.error("Erreur authentification:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
}

/**
 * Middleware pour vérifier le rôle utilisateur
 */
export const requireRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: "Accès refusé",
        code: "FORBIDDEN"
      })
    }

    next()
  }
}

/**
 * Extraire l'utilisateur depuis la requête
 */
export const getUserFromRequest = (req: AuthenticatedRequest) => {
  return req.user
}
