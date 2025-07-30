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

app.post("/api/auth/signup", validate(signupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role } = req.body

    const db = await getDb()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (existingUser) {
      return res.status(400).json({
        error: "Un utilisateur avec cet email existe déjà",
        code: "USER_EXISTS"
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer le nouvel utilisateur
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role.toLowerCase(), // Convertir en minuscules pour la cohérence
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning().then((users: any[]) => users[0])

    // Générer le JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Définir le cookie httpOnly
    res.cookie('sessionId', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    })

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    })
  } catch (error) {
    next(error)
  }
})

app.post("/api/auth/signin", validate(signinSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    const db = await getDb()

    // Rechercher l'utilisateur
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
        code: "INVALID_CREDENTIALS"
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
        code: "INVALID_CREDENTIALS"
      })
    }

    // Générer le JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Définir le cookie httpOnly
    res.cookie('sessionId', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    })

    res.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
})

app.post("/api/auth/signout", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('sessionId')
    res.json({ message: "Déconnexion réussie" })
  } catch (error) {
    next(error)
  }
})

app.get("/api/auth/session", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
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
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
})

// ==============================================================================
// Routes des missions
// ==============================================================================

app.get("/api/missions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await getDb()
    const allMissions = await db.query.missions.findMany({
      orderBy: [desc(missions.createdAt)]
    })

    res.json(allMissions || [])
  } catch (error) {
    next(error)
  }
})

app.post("/api/missions", validate(missionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, specialization, hourlyRate, location, startDate, endDate } = req.body

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
// Routes des profils
// ==============================================================================

// Récupérer le profil infirmier
app.get("/api/nurse-profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

    if (!user || user.role !== 'nurse') {
      return res.status(403).json({
        error: "Accès refusé",
        code: "ACCESS_DENIED"
      })
    }

    // Pour l'instant, retourner un profil simulé
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      specializations: ["Urgences", "Pédiatrie"],
      experience: "5 ans",
      availability: "Disponible",
      hourlyRate: 25.00,
      rating: 4.8,
      completedMissions: 45
    })
  } catch (error) {
    next(error)
  }
})

// Récupérer le profil établissement
app.get("/api/establishment/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

    if (!user || user.role !== 'establishment') {
      return res.status(403).json({
        error: "Accès refusé",
        code: "ACCESS_DENIED"
      })
    }

    // Pour l'instant, retourner un profil simulé
    res.json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      type: "Hôpital",
      address: "123 Rue de la Santé, 33000 Bordeaux",
      phone: "+33 5 56 12 34 56",
      specialties: ["Urgences", "Réanimation", "Gériatrie"],
      activeMissions: 8,
      totalMissions: 45
    })
  } catch (error) {
    next(error)
  }
})

// Statistiques de l'établissement
app.get("/api/establishment/stats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

    if (!user || user.role !== 'establishment') {
      return res.status(403).json({
        error: "Accès refusé",
        code: "ACCESS_DENIED"
      })
    }

    // Statistiques simulées
    res.json({
      totalMissions: 45,
      activeMissions: 8,
      completedMissions: 37,
      totalCandidates: 156,
      pendingApplications: 23,
      acceptedCandidates: 89,
      averageResponseTime: "2.3 jours",
      satisfactionRate: 4.7
    })
  } catch (error) {
    next(error)
  }
})

// Missions de l'établissement
app.get("/api/establishment/missions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

    if (!user || user.role !== 'establishment') {
      return res.status(403).json({
        error: "Accès refusé",
        code: "ACCESS_DENIED"
      })
    }

    // Récupérer les missions de l'établissement
    const establishmentMissions = await db.query.missions.findMany({
      where: eq(missions.establishmentId, user.id)
    })

    res.json(establishmentMissions || [])
  } catch (error) {
    next(error)
  }
})

// Candidats de l'établissement
app.get("/api/establishment/candidates", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

    if (!user || user.role !== 'establishment') {
      return res.status(403).json({
        error: "Accès refusé",
        code: "ACCESS_DENIED"
      })
    }

    // Candidatures simulées
    res.json({
      "Infirmier DE - Service Réanimation": [
        {
          id: 1,
          candidateName: "Marie Dubois",
          appliedDate: "14 Jan 2025",
          status: "pending",
          experience: "8 ans",
          rating: 4.9,
          specialization: "Réanimation",
          cv: "cv_marie_dubois.pdf"
        },
        {
          id: 4,
          candidateName: "Pierre Dupont",
          appliedDate: "11 Jan 2025",
          status: "pending",
          experience: "10 ans",
          rating: 4.6,
          specialization: "Réanimation",
          cv: "cv_pierre_dupont.pdf"
        }
      ],
      "Aide-soignant - Service Gériatrie": [
        {
          id: 2,
          candidateName: "Thomas Martin",
          appliedDate: "13 Jan 2025",
          status: "accepted",
          experience: "5 ans",
          rating: 4.7,
          specialization: "Gériatrie",
          cv: "cv_thomas_martin.pdf"
        }
      ]
    })
  } catch (error) {
    next(error)
  }
})

// Templates de l'établissement
app.get("/api/establishment/templates", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

    if (!user || user.role !== 'establishment') {
      return res.status(403).json({
        error: "Accès refusé",
        code: "ACCESS_DENIED"
      })
    }

    // Templates simulés
    res.json([
      {
        id: 1,
        name: "Infirmier DE - Réanimation",
        service: "Réanimation",
        salary: "28€/heure",
        duration: "3 mois",
        skills: ["Réanimation", "Ventilation mécanique", "Cathéters"],
        description: "Template pour poste en réanimation"
      },
      {
        id: 2,
        name: "Infirmier DE - Urgences",
        service: "Urgences",
        salary: "30€/heure",
        duration: "6 mois",
        skills: ["Urgences", "Traumatologie", "Réanimation"],
        description: "Template pour poste en urgences"
      }
    ])
  } catch (error) {
    next(error)
  }
})

// Analytics de l'établissement
app.get("/api/analytics/establishment", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

    if (!user || user.role !== 'establishment') {
      return res.status(403).json({
        error: "Accès refusé",
        code: "ACCESS_DENIED"
      })
    }

    // Données analytiques simulées
    res.json({
      monthlyStats: [
        { month: "Jan", missions: 12, candidates: 45, completions: 8 },
        { month: "Fév", missions: 15, candidates: 52, completions: 11 },
        { month: "Mar", missions: 18, candidates: 67, completions: 14 },
        { month: "Avr", missions: 14, candidates: 48, completions: 12 },
        { month: "Mai", missions: 20, candidates: 73, completions: 16 },
        { month: "Juin", missions: 22, candidates: 81, completions: 19 }
      ],
      topSpecializations: [
        { name: "Réanimation", count: 15 },
        { name: "Urgences", count: 12 },
        { name: "Gériatrie", count: 8 },
        { name: "Pédiatrie", count: 6 }
      ],
      responseTime: "2.3 jours",
      satisfactionRate: 4.7
    })
  } catch (error) {
    next(error)
  }
})

// Métriques en temps réel
app.get("/api/analytics/metrics/realtime", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    })

    if (!user || user.role !== 'establishment') {
      return res.status(403).json({
        error: "Accès refusé",
        code: "ACCESS_DENIED"
      })
    }

    // Métriques en temps réel simulées
    res.json({
      activeMissions: 8,
      pendingApplications: 23,
      onlineCandidates: 12,
      averageResponseTime: "2.3 jours",
      lastUpdate: new Date().toISOString()
    })
  } catch (error) {
    next(error)
  }
})

// ==============================================================================
// Routes des notifications
// ==============================================================================

app.get("/api/notifications", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.cookies

    if (!sessionId) {
      return res.status(401).json({
        error: "Session non trouvée",
        code: "NO_SESSION"
      })
    }

    const decoded = jwt.verify(sessionId, JWT_SECRET) as any
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
        code: "INVALID_SESSION"
      })
    }

    const db = await getDb()
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, decoded.userId),
      orderBy: [desc(notifications.createdAt)]
    })

    res.json(userNotifications || [])
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
