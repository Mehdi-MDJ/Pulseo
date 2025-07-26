/**
 * ==============================================================================
 * NurseLink AI - Serveur Minimal
 * ==============================================================================
 *
 * Serveur Express minimal pour tester l'API
 * Sans les problèmes de types complexes
 * ==============================================================================
 */

import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import compression from "compression"
import { json, urlencoded } from "body-parser"

const app = express()

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

// Route d'inscription
app.post("/api/auth/signup", (req, res) => {
  const { email, password, firstName, lastName, role } = req.body

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({
      error: "Tous les champs sont requis",
      code: "MISSING_FIELDS"
    })
  }

  // Simulation d'inscription réussie
  res.status(201).json({
    user: {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      role: role.toUpperCase(),
      name: `${firstName} ${lastName}`
    },
    token: "fake-jwt-token-" + Date.now(),
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    message: "Inscription réussie"
  })
})

// Route d'authentification simple
app.post("/api/auth/signin", (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: "Email et mot de passe requis",
      code: "MISSING_CREDENTIALS"
    })
  }

  // Simulation d'authentification
  if (email === "test@example.com" && password === "password") {
    res.json({
      user: {
        id: "1",
        email: "test@example.com",
        role: "NURSE",
        name: "Test User"
      },
      token: "fake-jwt-token",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  } else {
    res.status(401).json({
      error: "Identifiants invalides",
      code: "INVALID_CREDENTIALS"
    })
  }
})

// Route de déconnexion
app.post("/api/auth/signout", (req, res) => {
  res.json({
    message: "Déconnexion réussie"
  })
})

// Route de session
app.get("/api/auth/session", (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token manquant",
      code: "MISSING_TOKEN"
    })
  }

  // Simulation de vérification de session
  res.json({
    user: {
      id: "1",
      email: "test@example.com",
      role: "NURSE",
      name: "Test User"
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  })
})

// ==============================================================================
// Routes des missions (simplifiées)
// ==============================================================================

// Récupérer les missions
app.get("/api/missions", (req, res) => {
  const mockMissions = [
    {
      id: 1,
      title: "Infirmier en soins intensifs",
      description: "Mission en réanimation",
      location: "Paris",
      hourlyRate: 45,
      status: "OPEN",
      startDate: "2024-01-15",
      endDate: "2024-02-15"
    },
    {
      id: 2,
      title: "Infirmier en pédiatrie",
      description: "Mission en pédiatrie",
      location: "Lyon",
      hourlyRate: 40,
      status: "OPEN",
      startDate: "2024-01-20",
      endDate: "2024-02-20"
    }
  ]

  res.json({
    missions: mockMissions,
    total: mockMissions.length
  })
})

// Créer une mission
app.post("/api/missions", (req, res) => {
  const { title, description, location, hourlyRate } = req.body

  if (!title || !description || !location || !hourlyRate) {
    return res.status(400).json({
      error: "Données manquantes",
      code: "MISSING_DATA"
    })
  }

  const newMission = {
    id: Date.now(),
    title,
    description,
    location,
    hourlyRate,
    status: "OPEN",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  res.status(201).json({
    message: "Mission créée avec succès",
    mission: newMission
  })
})

// ==============================================================================
// Routes des notifications (simplifiées)
// ==============================================================================

app.get("/api/notifications", (req, res) => {
  const mockNotifications = [
    {
      id: "1",
      type: "NEW_MISSION",
      title: "Nouvelle mission disponible",
      message: "Une nouvelle mission correspond à votre profil",
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      type: "APPLICATION_ACCEPTED",
      title: "Candidature acceptée",
      message: "Votre candidature a été acceptée",
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  res.json({
    notifications: mockNotifications,
    total: mockNotifications.length,
    unread: mockNotifications.filter(n => !n.read).length
  })
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
