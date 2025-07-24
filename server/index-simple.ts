/**
 * ==============================================================================
 * NurseLink AI - Serveur Express Simple
 * ==============================================================================
 *
 * Serveur minimal pour tester l'authentification
 * ==============================================================================
 */

import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import compression from "compression"
import { json, urlencoded } from "body-parser"

// Routes d'authentification
import authRoutes from "./routes/authRoutes"
import missionRoutes from "./routes/missionRoutes"
import establishmentRoutes from "./routes/establishmentRoutes"
import notificationRoutes from "./routes/notificationRoutes"

const app = express()

// ==============================================================================
// Configuration de Sécurité
// ==============================================================================

// Helmet pour les headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://nurselink.ai", "https://www.nurselink.ai"]
    : ["http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite par IP
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/api/", limiter)

// ==============================================================================
// Middleware de Base
// ==============================================================================

// Compression gzip
app.use(compression())

// Parsing des requêtes
app.use(json({ limit: "10mb" }))
app.use(urlencoded({ extended: true, limit: "10mb" }))

// Trust proxy pour les headers X-Forwarded-*
app.set("trust proxy", 1)

// ==============================================================================
// Routes
// ==============================================================================

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  })
})

// Routes d'authentification
app.use("/api/auth", authRoutes)

// Routes des missions
app.use("/api/missions", missionRoutes)

// Routes des établissements
app.use("/api/establishments", establishmentRoutes)

// Routes des notifications
app.use("/api/notifications", notificationRoutes)

// ==============================================================================
// Gestion des Erreurs
// ==============================================================================

// Middleware de gestion des erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erreur serveur:", err)
  res.status(500).json({
    error: "Erreur serveur interne",
    message: process.env.NODE_ENV === "development" ? err.message : "Une erreur est survenue"
  })
})

// Route 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.originalUrl
  })
})

// ==============================================================================
// Démarrage du Serveur
// ==============================================================================

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`🚀 Serveur NurseLink AI démarré sur le port ${PORT}`)
  console.log(`📊 Mode: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 URL: http://localhost:${PORT}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`)
})

export default app
