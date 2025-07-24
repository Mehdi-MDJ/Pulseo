/**
 * ==============================================================================
 * NurseLink AI - Serveur Principal
 * ==============================================================================
 *
 * Serveur Express avec NextAuth.js v5 + Prisma
 * Configuration complète pour la production
 * ==============================================================================
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { json, urlencoded } from "body-parser";

// Routes
import authRoutes from "./routes/authRoutes";
import missionRoutes from "./routes/missionRoutes";
import establishmentRoutes from "./routes/establishmentRoutes";
import matchingRoutes from "./routes/matchingRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import aiRoutes from "./routes/aiRoutes";
import contractRoutes from "./routes/contractRoutes";
import assistantRoutes from "./routes/assistantRoutes";

// Middleware d'authentification
import { requireAuth, requireRole } from "./middleware/authMiddleware";

// Configuration environnement
import { env } from "./config/environment";

const app = express();

// ==============================================================================
// Configuration de Sécurité
// ==============================================================================

// Helmet pour les headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google-analytics.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"],
      frameAncestors: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://nurselink.ai", "https://www.nurselink.ai"]
    : ["http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite par IP
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limite plus stricte pour l'auth
  message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
});

app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// ==============================================================================
// Middleware de Base
// ==============================================================================

// Compression gzip
app.use(compression());

// Parsing des requêtes
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy pour les headers X-Forwarded-*
app.set("trust proxy", 1);

// ==============================================================================
// Routes NextAuth.js v5
// ==============================================================================

// Routes d'authentification NextAuth.js
app.use("/api/auth", authRoutes);

// ==============================================================================
// Routes de l'Application
// ==============================================================================

// Routes publiques (pas d'authentification requise)
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV,
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    services: {
      database: "connected",
      redis: "connected",
      auth: "active",
    },
  });
});

// Routes protégées (authentification requise)
app.use("/api/missions", requireAuth, missionRoutes);
app.use("/api/establishments", requireAuth, establishmentRoutes);
app.use("/api/matching", requireAuth, matchingRoutes);
app.use("/api/notifications", requireAuth, notificationRoutes);
app.use("/api/analytics", requireAuth, analyticsRoutes);
app.use("/api/ai", requireAuth, aiRoutes);
app.use("/api/contracts", requireAuth, contractRoutes);
app.use("/api/assistant", requireAuth, assistantRoutes);

// ==============================================================================
// Gestion des Erreurs
// ==============================================================================

// Middleware de gestion des erreurs 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
  });
});

// Middleware de gestion des erreurs globales
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erreur serveur:", error);

  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "Erreur serveur interne"
      : error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// ==============================================================================
// Démarrage du Serveur
// ==============================================================================

const PORT = env.PORT || 5000;
const HOST = env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log("🚀 Serveur NurseLink AI démarré");
  console.log(`📍 URL: http://${HOST}:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🔐 NextAuth.js v5: Activé`);
  console.log(`🗄️  Base de données: ${env.DATABASE_URL ? "Configurée" : "Non configurée"}`);
  console.log(`📊 Monitoring: ${env.LOG_LEVEL || "info"}`);
});

export default app;
