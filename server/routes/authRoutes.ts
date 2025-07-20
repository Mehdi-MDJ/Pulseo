/**
 * ==============================================================================
 * NurseLink AI - Routes d'Authentification NextAuth.js v5
 * ==============================================================================
 *
 * Routes d'authentification pour NextAuth.js v5
 * Gestion des sessions, connexion, déconnexion, etc.
 * ==============================================================================
 */

import { Router } from "express"
import { handlers } from "../lib/auth"

const router = Router()

// Route pour récupérer la session utilisateur
router.get("/session", async (req, res) => {
  try {
    const session = await handlers.GET(req, res)
    res.json(session)
  } catch (error) {
    console.error("Erreur récupération session:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Route pour la connexion
router.post("/signin", async (req, res) => {
  try {
    const result = await handlers.POST(req, res)
    res.json(result)
  } catch (error) {
    console.error("Erreur connexion:", error)
    res.status(500).json({ error: "Erreur de connexion" })
  }
})

// Route pour la déconnexion
router.post("/signout", async (req, res) => {
  try {
    const result = await handlers.POST(req, res)
    res.json(result)
  } catch (error) {
    console.error("Erreur déconnexion:", error)
    res.status(500).json({ error: "Erreur de déconnexion" })
  }
})

// Route pour récupérer l'utilisateur connecté
router.get("/user", async (req, res) => {
  try {
    const session = await handlers.GET(req, res)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    // Récupérer les informations complètes de l'utilisateur
    const { prisma } = await import("../lib/prisma")
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      nurseProfile: user.nurseProfile,
      establishmentProfile: user.establishmentProfile,
    })
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Route pour mettre à jour le profil utilisateur
router.put("/user", async (req, res) => {
  try {
    const session = await handlers.GET(req, res)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const { name, role } = req.body
    const { prisma } = await import("../lib/prisma")

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        role: role || undefined,
      },
      include: {
        nurseProfile: true,
        establishmentProfile: true,
      }
    })

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      image: updatedUser.image,
      nurseProfile: updatedUser.nurseProfile,
      establishmentProfile: updatedUser.establishmentProfile,
    })
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Route pour créer un profil infirmier
router.post("/nurse-profile", async (req, res) => {
  try {
    const session = await handlers.GET(req, res)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const { specializations, experience, certifications, availability, hourlyRate } = req.body
    const { prisma } = await import("../lib/prisma")

    const nurseProfile = await prisma.nurseProfile.create({
      data: {
        userId: session.user.id,
        specializations: specializations || [],
        experience: experience || 0,
        certifications: certifications || [],
        availability: availability || null,
        hourlyRate: hourlyRate || null,
      }
    })

    res.json(nurseProfile)
  } catch (error) {
    console.error("Erreur création profil infirmier:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

// Route pour créer un profil établissement
router.post("/establishment-profile", async (req, res) => {
  try {
    const session = await handlers.GET(req, res)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const { name, type, address, phone, specialties, capacity, description } = req.body
    const { prisma } = await import("../lib/prisma")

    const establishmentProfile = await prisma.establishmentProfile.create({
      data: {
        userId: session.user.id,
        name,
        type,
        address,
        phone,
        specialties: specialties || [],
        capacity,
        description,
      }
    })

    res.json(establishmentProfile)
  } catch (error) {
    console.error("Erreur création profil établissement:", error)
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    })
  }
})

export default router
