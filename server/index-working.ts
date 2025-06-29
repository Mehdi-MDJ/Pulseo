/**
 * Serveur NurseLink AI avec routes API fonctionnelles
 */

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Configuration middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS pour les requêtes frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Logging des requêtes
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${statusEmoji} ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Store des utilisateurs en mémoire pour le développement
const users = new Map<string, any>();
const sessions = new Map<string, any>();

// Helper pour générer un token de session simple
function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware d'authentification
function requireAuth(req: any, res: Response, next: NextFunction) {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  const session = sessionToken ? sessions.get(sessionToken) : null;
  
  if (session && session.userId) {
    req.user = users.get(session.userId);
    return next();
  }
  
  res.status(401).json({ error: 'Non authentifié' });
}

// === ROUTES API ===

// Santé de l'API
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    users: users.size,
    sessions: sessions.size
  });
});

// Obtenir l'utilisateur actuel
app.get("/api/auth/user", (req, res) => {
  const authHeader = req.headers.authorization;
  const sessionToken = req.headers.cookie?.split('session=')[1]?.split(';')[0];
  
  if (sessionToken && sessions.has(sessionToken)) {
    const session = sessions.get(sessionToken);
    const user = users.get(session.userId);
    return res.json(user);
  }
  
  // Retourner un utilisateur par défaut pour simplifier les tests
  res.json({
    id: "default-user",
    email: "test@nurselink.ai",
    firstName: "Utilisateur",
    lastName: "Test",
    role: "establishment",
    cguAccepted: true
  });
});

// Connexion
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    // Rechercher ou créer l'utilisateur
    let user = Array.from(users.values()).find(u => u.email === email);
    
    if (!user) {
      // Créer automatiquement l'utilisateur s'il n'existe pas
      const userId = `user-${Date.now()}`;
      user = {
        id: userId,
        email: email,
        firstName: "Utilisateur",
        lastName: "Test",
        role: "establishment",
        cguAccepted: true,
        password: password
      };
      users.set(userId, user);
    }

    // Vérifier le mot de passe
    if (user.password !== password) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // Créer une session
    const sessionToken = generateSessionToken();
    sessions.set(sessionToken, { userId: user.id, createdAt: new Date() });

    // Définir le cookie de session
    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: false, // false en développement
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userResponse } = user;
    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Inscription
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà" });
    }

    // Créer le nouvel utilisateur
    const userId = `user-${Date.now()}`;
    const user = {
      id: userId,
      email,
      firstName,
      lastName,
      role,
      cguAccepted: true,
      password,
      createdAt: new Date()
    };
    
    users.set(userId, user);

    // Créer une session
    const sessionToken = generateSessionToken();
    sessions.set(sessionToken, { userId: user.id, createdAt: new Date() });

    // Définir le cookie de session
    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userResponse } = user;
    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Déconnexion
app.post("/api/auth/logout", (req, res) => {
  const sessionToken = req.headers.cookie?.split('session=')[1]?.split(';')[0];
  
  if (sessionToken) {
    sessions.delete(sessionToken);
  }
  
  res.clearCookie('session');
  res.json({ success: true, message: "Déconnexion réussie" });
});

// Routes de données de référence
app.get("/api/reference/specializations", (req, res) => {
  res.json([
    "Médecine générale", "Chirurgie", "Réanimation", "Urgences", "Pédiatrie",
    "Gériatrie", "Psychiatrie", "Obstétrique", "Cardiologie", "Oncologie",
    "Neurologie", "Orthopédie", "Anesthésie", "Radiologie", "Laboratoire"
  ]);
});

app.get("/api/reference/certifications", (req, res) => {
  res.json([
    "Diplôme d'État infirmier", "Spécialisation en soins intensifs",
    "Formation aux urgences", "Certification BLS", "Certification ACLS",
    "Formation pédiatrique", "Spécialisation gériatrique", "Formation en psychiatrie",
    "Certification PALS", "Formation en bloc opératoire", "Spécialisation en dialyse",
    "Formation en chimiothérapie", "Certification en réanimation",
    "Formation aux soins palliatifs", "Spécialisation maternité"
  ]);
});

// Routes protégées
app.get("/api/user/profile", requireAuth, (req: any, res) => {
  res.json(req.user);
});

// Gestion d'erreurs
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message: err.message
  });
});

// Démarrage du serveur
async function startServer() {
  try {
    console.log("🚀 Démarrage de NurseLink AI...");
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    
    const server = createServer(app);
    
    // Configuration Vite en dernier pour éviter l'interception des routes API
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔧 Configuration Vite...");
      await setupVite(app, server);
    } else {
      console.log("🏭 Mode production");
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || '5000');
    server.listen(port, "0.0.0.0", () => {
      console.log(`🌐 Serveur démarré sur le port ${port}`);
      console.log(`🔗 API disponible sur: http://localhost:${port}/api`);
    });

  } catch (error) {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);