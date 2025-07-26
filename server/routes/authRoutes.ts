/**
 * ==============================================================================
 * NurseLink AI - Routes d'Authentification
 * ==============================================================================
 *
 * Routes d'authentification avec service personnalisé
 * Gestion des sessions, connexion, déconnexion, etc.
 * ==============================================================================
 */

import { Router } from "express"
import { authService } from "../lib/simple-auth"
import { getDb } from "../db"
import { users, nurseProfiles, establishmentProfiles } from "@shared/schema"
import { eq } from "drizzle-orm"

const router = Router()

// Route pour récupérer la session utilisateur
router.get("/session", async (req, res) => {
  try {
    const session = await authService.getSession(req)
    res.json(session)
  } catch (error) {
    console.error("Erreur récupération session:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Route pour la connexion
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: "Email et mot de passe requis",
        code: "MISSING_CREDENTIALS"
      })
    }

    const user = await authService.authenticateUser(email, password)

    if (!user) {
      return res.status(401).json({
        error: "Identifiants invalides",
        code: "INVALID_CREDENTIALS"
      })
    }

    const token = authService.createToken(user)

    res.json({
      user,
      token,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  } catch (error) {
    console.error("Erreur connexion:", error)
    res.status(500).json({ error: "Erreur de connexion" })
  }
})

// Route pour la déconnexion
router.post("/signout", async (req, res) => {
  try {
    // En JWT, la déconnexion se fait côté client en supprimant le token
    res.json({ message: "Déconnexion réussie" })
  } catch (error) {
    console.error("Erreur déconnexion:", error)
    res.status(500).json({ error: "Erreur de déconnexion" })
  }
})

// Route pour récupérer l'utilisateur connecté
router.get("/user", async (req, res) => {
  try {
    const session = await authService.getSession(req)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    // Récupérer les informations complètes de l'utilisateur
    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
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
    const session = await authService.getSession(req)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const { name, role } = req.body
    const db = await getDb()

    const updatedUser = await db.update(users)
      .set({
        firstName: name?.split(' ')[0] || undefined,
        lastName: name?.split(' ').slice(1).join(' ') || undefined,
        role: role,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))
      .returning()
      .then(users => users[0])

    if (!updatedUser) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND"
      })
    }

    // Récupérer les profils associés
    const nurseProfile = await db.query.nurseProfiles.findFirst({
      where: eq(nurseProfiles.userId, updatedUser.id)
    })

    const establishmentProfile = await db.query.establishmentProfiles.findFirst({
      where: eq(establishmentProfiles.userId, updatedUser.id)
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
    const session = await authService.getSession(req)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const { specializations, experience, certifications, availability, hourlyRate } = req.body
    const db = await getDb()

    const nurseProfile = await db.insert(nurseProfiles).values({
      userId: session.user.id,
      specializations: JSON.stringify(specializations || []),
      experience: experience || 0,
      certifications: JSON.stringify(certifications || []),
      availability: availability ? JSON.stringify(availability) : null,
      hourlyRateMin: hourlyRate || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().then(profiles => profiles[0])

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
    const session = await authService.getSession(req)

    if (!session?.user) {
      return res.status(401).json({
        error: "Non authentifié",
        code: "UNAUTHORIZED"
      })
    }

    const { name, type, address, phone, specialties, capacity, description } = req.body
    const db = await getDb()

    const establishmentProfile = await db.insert(establishmentProfiles).values({
      userId: session.user.id,
      name,
      type,
      address,
      phone,
      specialties: JSON.stringify(specialties || []),
      capacity,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().then(profiles => profiles[0])

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
