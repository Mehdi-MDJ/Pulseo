/**
 * ==============================================================================
 * NurseLink AI - Serveur Minimal (Version ESM)
 * ==============================================================================
 *
 * Serveur Express minimal pour tester l'API
 * Configuration ESM native avec Drizzle ORM et JWT
 * ==============================================================================
 */

import 'dotenv/config'
import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import compression from "compression"
import cookieParser from "cookie-parser"
import { getDb } from "./db.js"
import { users, missions, notifications } from "../shared/schema.js"
import { eq, and, desc } from "drizzle-orm"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { signupSchema, signinSchema, missionSchema } from '../shared/validation.js'

const app = express()

// ==============================================================================
// Configuration JWT
// ==============================================================================

// Vérification de la clé JWT
if (!process.env.JWT_SECRET) {
  throw new Error("La variable d'environnement JWT_SECRET est manquante.");
}

const JWT_SECRET = process.env.JWT_SECRET

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

// Body parsing (Express 4.16+)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Cookie parsing
app.use(cookieParser())

// ==============================================================================
// Middleware de validation
// ==============================================================================

const validate = (schema: z.ZodObject<any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Données invalides",
          details: error.errors
        });
      }
      next(error);
    }
  };

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
app.post("/api/auth/signup", validate(signupSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        error: "Tous les champs sont requis",
        code: "MISSING_FIELDS"
      })
    }

    const db = await getDb()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (existingUser) {
      return res.status(409).json({
        error: "Un utilisateur avec cet email existe déjà",
        code: "USER_ALREADY_EXISTS"
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur (l'ID sera généré automatiquement par cuid2)
    const newUser = await db.insert(users).values({
      email,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      role: role.toLowerCase(),
      cguAccepted: true,
      cguAcceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().then((users: any[]) => users[0])

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
    next(error)
  }
})

// Route d'authentification
app.post("/api/auth/signin", validate(signinSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: "Email et mot de passe requis",
        code: "MISSING_CREDENTIALS"
      })
    }

    const db = await getDb()

    // Rechercher l'utilisateur
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      return res.status(401).json({
        error: "Identifiants invalides",
        code: "INVALID_CREDENTIALS"
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '')

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
    next(error)
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
app.get("/api/auth/session", async (req, res) => {
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

    const db = await getDb()

    // Récupérer l'utilisateur depuis la base de données
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

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
    next(error)
  }
})

// ==============================================================================
// Routes des missions
// ==============================================================================

// Récupérer les missions
app.get("/api/missions", async (req, res) => {
  try {
    const db = await getDb()

    const allMissions = await db.query.missions.findMany({
      orderBy: [desc(missions.createdAt)]
    })

    res.json({
      missions: allMissions,
      total: allMissions.length
    })
  } catch (error) {
    next(error)
  }
})

// Créer une mission
app.post("/api/missions", async (req, res) => {
  try {
    const { title, description, location, hourlyRate, specialization, startDate, endDate } = req.body

    if (!title || !description || !location || !hourlyRate || !specialization) {
      return res.status(400).json({
        error: "Données manquantes",
        code: "MISSING_DATA"
      })
    }

    const db = await getDb()

    const newMission = await db.insert(missions).values({
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
    }).returning().then((missions: any[]) => missions[0])

    res.status(201).json({
      message: "Mission créée avec succès",
      mission: newMission
    })
  } catch (error) {
    next(error)
  }
})

// ==============================================================================
// Routes des notifications
// ==============================================================================

app.get("/api/notifications", async (req, res) => {
  try {
    const db = await getDb()

    const allNotifications = await db.query.notifications.findMany({
      orderBy: [desc(notifications.createdAt)]
    })

    res.json({
      notifications: allNotifications,
      total: allNotifications.length,
      unread: allNotifications.filter((n: any) => !n.isRead).length
    })
  } catch (error) {
    next(error)
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
