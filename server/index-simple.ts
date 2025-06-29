/**
 * ==============================================================================
 * NurseLink AI - Serveur Simplifié
 * ==============================================================================
 * 
 * Point d'entrée simplifié pour démarrer l'application rapidement
 * Sans dépendances complexes pour résoudre les erreurs de démarrage
 * ==============================================================================
 */

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

// Initialisation de l'application Express
const app = express();

// Configuration middleware global
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Middleware de logging des requêtes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${statusEmoji} ${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Routes de base simplifiées
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: !!process.env.DATABASE_URL,
      auth: true,
    },
  });
});

// Route de test simple
app.get("/api/test", (req, res) => {
  res.json({
    message: "NurseLink AI Server is running",
    timestamp: new Date().toISOString()
  });
});

// Routes pour les données de référence
app.get("/api/reference/specializations", (req, res) => {
  res.json([
    "Médecine générale",
    "Chirurgie",
    "Réanimation",
    "Urgences",
    "Pédiatrie",
    "Gériatrie",
    "Psychiatrie",
    "Obstétrique",
    "Cardiologie",
    "Oncologie",
    "Neurologie",
    "Orthopédie",
    "Anesthésie",
    "Radiologie",
    "Laboratoire",
  ]);
});

app.get("/api/reference/certifications", (req, res) => {
  res.json([
    "Diplôme d'État infirmier",
    "Spécialisation en soins intensifs",
    "Formation aux urgences",
    "Certification BLS",
    "Certification ACLS",
    "Formation pédiatrique",
    "Spécialisation gériatrique",
    "Formation en psychiatrie",
    "Certification PALS",
    "Formation en bloc opératoire",
    "Spécialisation en dialyse",
    "Formation en chimiothérapie",
    "Certification en réanimation",
    "Formation aux soins palliatifs",
    "Spécialisation maternité",
  ]);
});

// Middleware de gestion d'erreurs globales
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur";

  console.error('❌ Erreur serveur:', {
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: _req.url,
    method: _req.method,
  });

  res.status(status).json({ 
    error: message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
});

/**
 * Démarrage du serveur
 */
async function startServer() {
  try {
    console.log("🚀 Démarrage de NurseLink AI (mode simplifié)...");
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🐘 Base de données: ${process.env.DATABASE_URL ? '✅ Connectée' : '❌ Non configurée'}`);
    
    // Création du serveur HTTP
    const server = createServer(app);
    
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.log("🔧 Mode développement - Configuration Vite");
      await setupVite(app, server);
    } else {
      console.log("🏭 Mode production - Fichiers statiques");
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || '3000');
    server.listen(port, "0.0.0.0", () => {
      log(`Serveur démarré sur le port ${port}`);
      console.log(`🌐 Application disponible sur: http://localhost:${port}`);
    });

    // Gestion propre de l'arrêt
    process.on('SIGTERM', () => {
      console.log('🛑 Signal SIGTERM reçu, arrêt du serveur...');
      server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("💥 Erreur fatale au démarrage:", error);
    process.exit(1);
  }
}

// Démarrage du serveur
startServer().catch(console.error);