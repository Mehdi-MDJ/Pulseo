/**
 * ==============================================================================
 * NurseLink AI - Serveur Minimal (Version Simplifiée)
 * ==============================================================================
 *
 * Serveur Express minimal pour tester l'API
 * Version simplifiée sans imports problématiques
 * ==============================================================================
 */

import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import compression from "compression"
import { json, urlencoded } from "body-parser"
import cookieParser from "cookie-parser"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const app = express()

// ==============================================================================
// Configuration JWT
// ==============================================================================

// JWT Secret (à configurer via variable d'environnement en production)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// ==============================================================================
// Données en mémoire (temporaire)
// ==============================================================================

// Stockage des utilisateurs en mémoire (à remplacer par une DB)
const users = new Map<string, any>()

// Stockage des missions en mémoire (à remplacer par une DB)
const missions = new Map<string, any>()

// Stockage des notifications en mémoire (à remplacer par une DB)
const notifications = new Map<string, any>()

// ==============================================================================
// Configuration de sécurité
// ==============================================================================

// Headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://nurselinkai.com"]
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: {
    error: "Trop de requêtes, veuillez réessayer plus tard",
    code: "RATE_LIMIT_EXCEEDED"
  }
})
app.use(limiter)

// Compression
app.use(compression())

// Body parsing
app.use(json({ limit: "10mb" }))
app.use(urlencoded({ extended: true, limit: "10mb" }))

// Cookie parsing
app.use(cookieParser())

// ==============================================================================
// Routes de base
// ==============================================================================

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  })
})

// Route de test
app.get("/api/test", (req, res) => {
  res.json({
    message: "API NurseLink AI fonctionne !",
    timestamp: new Date().toISOString()
  })
})

// ==============================================================================
// Routes d'authentification
// ==============================================================================

// Route d'inscription
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        error: "Tous les champs sont requis",
        code: "MISSING_FIELDS"
      })
    }

    // Vérifier si l'utilisateur existe déjà
    if (users.has(email)) {
      return res.status(409).json({
        error: "Un utilisateur avec cet email existe déjà",
        code: "USER_ALREADY_EXISTS"
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const newUser = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      role: role.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Stocker l'utilisateur
    users.set(email, newUser)

    // Générer un JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    // Créer le cookie de session
    res.cookie('sessionId', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    })

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        name: `${newUser.firstName} ${newUser.lastName}`
      },
      token,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: "Inscription réussie"
    })
  } catch (error) {
    console.error("Erreur inscription:", error)
    res.status(500).json({
      error: "Erreur lors de l'inscription",
      code: "INTERNAL_ERROR"
    })
  }
})

// Route d'authentification
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: "Email et mot de passe requis",
        code: "MISSING_CREDENTIALS"
      })
    }

    // Rechercher l'utilisateur
    const user = users.get(email)

    if (!user) {
      return res.status(401).json({
        error: "Identifiants invalides",
        code: "INVALID_CREDENTIALS"
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Identifiants invalides",
        code: "INVALID_CREDENTIALS"
      })
    }

    // Générer un JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    // Créer le cookie de session
    res.cookie('sessionId', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      },
      token,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  } catch (error) {
    console.error("Erreur connexion:", error)
    res.status(500).json({
      error: "Erreur lors de la connexion",
      code: "INTERNAL_ERROR"
    })
  }
})

// Route de déconnexion
app.post("/api/auth/signout", (req, res) => {
  // En JWT, on ne stocke pas de session côté serveur
  // Le cookie sera supprimé côté client
  res.clearCookie('sessionId')

  res.json({
    message: "Déconnexion réussie"
  })
})

// Route de session
app.get("/api/auth/session", (req, res) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    // Vérifier le JWT
    const decoded = jwt.verify(sessionId, JWT_SECRET) as any

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    // Récupérer l'utilisateur depuis la mémoire
    const user = Array.from(users.values()).find(u => u.id === decoded.userId)

    if (!user) {
      return res.status(401).json({
        error: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND"
      })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  } catch (error) {
    console.error("Erreur session:", error)
    res.status(401).json({
      error: "Session invalide",
      code: "INVALID_SESSION"
    })
  }
})

// ==============================================================================
// Routes des missions
// ==============================================================================

// Récupérer les missions
app.get("/api/missions", (req, res) => {
  try {
    const allMissions = Array.from(missions.values())

    res.json({
      missions: allMissions,
      total: allMissions.length
    })
  } catch (error) {
    console.error("Erreur récupération missions:", error)
    res.status(500).json({
      error: "Erreur lors de la récupération des missions",
      code: "INTERNAL_ERROR"
    })
  }
})

// Créer une mission
app.post("/api/missions", (req, res) => {
  try {
    const { title, description, location, hourlyRate, specialization, startDate, endDate } = req.body

    if (!title || !description || !location || !hourlyRate || !specialization) {
      return res.status(400).json({
        error: "Données manquantes",
        code: "MISSING_DATA"
      })
    }

    const newMission = {
      id: Date.now().toString(),
      title,
      description,
      specialization,
      hourlyRate: parseFloat(hourlyRate),
      address: location,
      city: location.split(',')[0]?.trim() || location,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Stocker la mission
    missions.set(newMission.id, newMission)

    res.status(201).json({
      message: "Mission créée avec succès",
      mission: newMission
    })
  } catch (error) {
    console.error("Erreur création mission:", error)
    res.status(500).json({
      error: "Erreur lors de la création de la mission",
      code: "INTERNAL_ERROR"
    })
  }
})

// ==============================================================================
// Routes des notifications
// ==============================================================================

app.get("/api/notifications", (req, res) => {
  try {
    const allNotifications = Array.from(notifications.values())

    res.json({
      notifications: allNotifications,
      total: allNotifications.length,
      unread: allNotifications.filter((n: any) => !n.isRead).length
    })
  } catch (error) {
    console.error("Erreur récupération notifications:", error)
    res.status(500).json({
      error: "Erreur lors de la récupération des notifications",
      code: "INTERNAL_ERROR"
    })
  }
})

// ==============================================================================
// Gestion d'erreurs
// ==============================================================================

// Middleware de gestion d'erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erreur serveur:", err)

  res.status(500).json({
    error: "Erreur serveur interne",
    code: "INTERNAL_ERROR",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  })
})

// Route 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    code: "NOT_FOUND",
    path: req.originalUrl
  })
})

// ==============================================================================
// Démarrage du serveur
// ==============================================================================

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log("🚀 Serveur NurseLink AI minimal démarré")
  console.log(`📊 Mode: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 URL: http://localhost:${PORT}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`)
  console.log(`📋 Missions API: http://localhost:${PORT}/api/missions`)
  console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`)
})

export default app
