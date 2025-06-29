/**
 * ==============================================================================
 * NurseLink AI - Middleware d'Authentification Locale
 * ==============================================================================
 *
 * Middleware pour bypasser l'authentification OAuth en développement local
 * Permet de tester l'application sans Replit OAuth
 * ==============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { authConfig } from "../config/environment";
import { storage } from "../services/storageService";

// Interface pour étendre Request avec user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'establishment' | 'nurse' | 'admin';
    establishmentId?: string;
  };
}

// Sessions actives avec timestamp d'expiration
interface Session {
  userId: string;
  email: string;
  role: string;
  establishmentId?: string;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

export const activeSessions = new Map<string, Session>();

// Configuration de sécurité
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 heures
const MAX_SESSIONS_PER_USER = 3; // Limite de sessions simultanées par utilisateur
const CLEANUP_INTERVAL = 60 * 60 * 1000; // Nettoyage toutes les heures

// Nettoyage automatique des sessions expirées
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
      console.log(`🗑️ Session expirée supprimée: ${session.email}`);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Utilisateurs fictifs pour le mode développement local
 */
const LOCAL_DEV_USERS = {
  "simon@gmail.com": {
    id: "local-dev-establishment-123",
    email: "simon@gmail.com",
    firstName: "Simon",
    lastName: "Martin",
    role: "establishment",
    cguAccepted: true,
    isLocalDev: true,
    establishmentId: 1
  },
  "marie@gmail.com": {
    id: "local-dev-nurse-456",
    email: "marie@gmail.com",
    firstName: "Marie",
    lastName: "Dubois",
    role: "nurse",
    cguAccepted: true,
    isLocalDev: true,
    nurseId: 1
  },
  "default": {
    id: "local-dev-user-789",
    email: "dev@nurselink.local",
    firstName: "Développeur",
    lastName: "Local",
    role: "establishment",
    cguAccepted: true,
    isLocalDev: true,
    establishmentId: 1
  }
};

/**
 * Middleware d'authentification locale
 * Simule un utilisateur connecté en mode développement
 */
export const localAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Laisser passer les routes d'authentification
  if (
    req.originalUrl.startsWith('/api/auth/refresh') ||
    req.originalUrl.startsWith('/api/auth/login') ||
    req.originalUrl.startsWith('/api/auth/register')
  ) {
    return next();
  }

  // Vérifier si c'est une route qui ne commence pas par /api/ (pour le frontend)
  if (!req.originalUrl.startsWith('/api/')) {
    return next();
  }

  // Pour les routes API, vérifier l'authentification
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token d\'authentification manquant',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // DEBUG : afficher le token reçu et les sessions actives
    console.log('[DEBUG] Token reçu:', token);

    // Utiliser la Map sessions du serveur principal
    const sessions = (global as any).sessions || new Map();
    console.log('[DEBUG] Sessions actives (serveur principal):', Array.from(sessions.keys()));

    // Vérifier si le token existe dans les sessions du serveur principal
    const session = sessions.get(token);

    if (!session) {
      return res.status(401).json({
        error: 'Session invalide ou expirée',
        code: 'INVALID_SESSION'
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role as 'establishment' | 'nurse' | 'admin',
      establishmentId: session.user.establishmentId
    };

    // Créer automatiquement le profil établissement si nécessaire
    if (session.user.role === 'establishment' && session.user.id) {
      try {
        const existingProfile = await storage.getEstablishmentProfile(session.user.id);
        if (!existingProfile) {
          console.log(`🔧 Création automatique du profil établissement pour: ${session.user.email}`);
          await storage.createOrUpdateEstablishmentProfile({
            userId: session.user.id,
            name: `Établissement ${session.user.email.split('@')[0]}`,
            type: 'hospital',
            address: '123 Rue de la Santé',
            city: 'Paris',
            postalCode: '75001',
            phone: '+33123456789',
            siret: `123456789${Date.now()}`,
            contactPerson: session.user.email.split('@')[0],
            isActive: true
          });
        }
      } catch (error) {
        console.error('⚠️ Erreur création automatique profil établissement:', error);
        // Ne pas faire échouer l'authentification si la création échoue
      }
    }

    next();
  } catch (error) {
    console.error('Erreur middleware d\'authentification:', error);
    return res.status(500).json({
      error: 'Erreur interne d\'authentification',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware pour protéger les routes en mode local
 * Compatible avec l'interface existante
 */
export const requireAuthenticationLocal = async (req: any, res: Response, next: NextFunction) => {
  if (authConfig.localDevMode) {
    // Vérifier la session
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
                        req.cookies?.sessionToken ||
                        req.session?.token;

    if (sessionToken && activeSessions.has(sessionToken)) {
      req.user = activeSessions.get(sessionToken);
      return next();
    }

    // Si pas de session valide, créer une session par défaut
    const defaultUser = LOCAL_DEV_USERS["simon@gmail.com"];
    const newToken = `local-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    activeSessions.set(newToken, defaultUser);
    req.user = defaultUser;
    req.session = req.session || {};
    req.session.token = newToken;
    req.session.user = defaultUser;

    console.log(`🔧 Session automatique créée pour: ${defaultUser.email}`);
    return next();
  }

  // En mode production, on utilise la logique d'authentification normale
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      error: "Non authentifié",
      code: "UNAUTHORIZED"
    });
  }

  next();
};

/**
 * Routes d'authentification locale pour le développement
 */
export const setupLocalAuthRoutes = (app: any) => {
  if (!authConfig.localDevMode) {
    return;
  }

  console.log("🔧 Configuration des routes d'authentification locale");

  // Route pour simuler une connexion
  app.get("/api/auth/login", (req: any, res: Response) => {
    const email = req.query.email || "simon@gmail.com";
    const user = LOCAL_DEV_USERS[email] || LOCAL_DEV_USERS["default"];

    const { token: sessionToken, expiresAt } = createSession(user);

    req.user = user;
    req.session = req.session || {};
    req.session.token = sessionToken;
    req.session.user = user;

    res.cookie('sessionToken', sessionToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log(`🔧 Connexion simulée pour: ${user.email}`);
    res.redirect("/");
  });

  // Route POST pour la connexion (compatible avec le script de test)
  app.post("/api/auth/login", async (req: any, res: Response) => {
    const { email, password } = req.body;

    // Vérifier les credentials
    const user = LOCAL_DEV_USERS[email];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Création automatique du profil établissement si besoin
    if (user.role === 'establishment' && user.id) {
      try {
        const existingProfile = await storage.getEstablishmentProfile(user.id);
        if (!existingProfile) {
          await storage.createOrUpdateEstablishmentProfile({
            userId: user.id,
            name: `Établissement ${user.email.split('@')[0]}`,
            type: 'hospital',
            address: '123 Rue de la Santé',
            city: 'Paris',
            postalCode: '75001',
            phone: '+33123456789',
            siret: `123456789${Date.now()}`,
            contactPerson: user.email.split('@')[0],
            isActive: true
          });
        }
      } catch (error) {
        console.error('⚠️ Erreur création automatique profil établissement (login):', error);
      }
    }

    const { token: sessionToken, expiresAt } = createSession(user);

    // DEBUG : afficher le token généré et les sessions actives
    console.log('[DEBUG][LOGIN] Token généré:', sessionToken);
    console.log('[DEBUG][LOGIN] Sessions actives:', Array.from(activeSessions.keys()));

    res.cookie('sessionToken', sessionToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log(`🔧 Connexion POST simulée pour: ${user.email}`);

    // Retourner l'utilisateur et le token
    const { password: _, ...userResponse } = user;
    res.json({
      success: true,
      user: userResponse,
      sessionToken: sessionToken
    });
  });

  // Route pour récupérer l'utilisateur local
  app.get("/api/auth/user", (req: any, res: Response) => {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
                        req.cookies?.sessionToken ||
                        req.session?.token;

    if (sessionToken && activeSessions.has(sessionToken)) {
      const user = activeSessions.get(sessionToken);
      console.log(`🔧 Utilisateur récupéré: ${user.email}`);
      return res.json(user);
    }

    // Utilisateur par défaut si pas de session
    const defaultUser = LOCAL_DEV_USERS["simon@gmail.com"];
    console.log(`🔧 Utilisateur par défaut: ${defaultUser.email}`);
    res.json(defaultUser);
  });

  // Route pour renouveler la session
  app.post("/api/auth/refresh", (req: any, res: Response) => {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
                        req.cookies?.sessionToken ||
                        req.session?.token;

    if (!sessionToken) {
      return res.status(401).json({
        error: 'Token de session manquant',
        code: 'MISSING_TOKEN'
      });
    }

    // Utiliser la Map sessions du serveur principal
    const sessions = (global as any).sessions || new Map();
    const session = sessions.get(sessionToken);

    if (!session) {
      return res.status(401).json({
        error: 'Session invalide ou expirée',
        code: 'INVALID_SESSION'
      });
    }

    // Générer un nouveau token
    const newToken = generateSecureToken();
    const now = Date.now();
    const expiresAt = now + SESSION_TIMEOUT;

    // Créer une nouvelle session avec le même utilisateur
    const newSession = {
      user: session.user,
      createdAt: now,
      lastAccess: now
    };

    // Supprimer l'ancienne session et créer la nouvelle
    sessions.delete(sessionToken);
    sessions.set(newToken, newSession);

    console.log('[DEBUG][REFRESH] Nouveau token généré:', newToken);
    console.log('[DEBUG][REFRESH] Sessions actives:', Array.from(sessions.keys()));

    res.json({
      success: true,
      sessionToken: newToken,
      expiresAt: expiresAt,
      message: 'Session renouvelée'
    });
  });

  // Route pour simuler une déconnexion
  app.get("/api/auth/logout", (req: any, res: Response) => {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
                        req.cookies?.sessionToken ||
                        req.session?.token;

    if (sessionToken) {
      activeSessions.delete(sessionToken);
    }

    req.user = null;
    req.session.destroy(() => {
      res.clearCookie('sessionToken');
      res.redirect("/");
    });
  });

  // Route de callback (pour compatibilité)
  app.get("/api/auth/callback", (req: any, res: Response) => {
    const email = req.query.email || "simon@gmail.com";
    const user = LOCAL_DEV_USERS[email] || LOCAL_DEV_USERS["default"];

    const { token: sessionToken, expiresAt } = createSession(user);

    req.user = user;
    req.session = req.session || {};
    req.session.token = sessionToken;
    req.session.user = user;

    res.cookie('sessionToken', sessionToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect("/");
  });

  // Route pour changer d'utilisateur en développement
  app.post("/api/auth/switch-user", (req: any, res: Response) => {
    const { email } = req.body;
    const user = LOCAL_DEV_USERS[email];

    if (!user) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    const { token: sessionToken, expiresAt } = createSession(user);

    req.user = user;
    req.session = req.session || {};
    req.session.token = sessionToken;
    req.session.user = user;

    res.cookie('sessionToken', sessionToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log(`🔧 Changement d'utilisateur vers: ${user.email}`);
    res.json({ success: true, user });
  });
};

/**
 * Fonction utilitaire pour obtenir les sessions actives (debug)
 */
export const getActiveSessions = () => {
  return Array.from(activeSessions.keys());
};

// Fonction pour créer une nouvelle session
export const createSession = (user: any): { token: string; expiresAt: number } => {
  // Nettoyer les anciennes sessions de cet utilisateur
  const userSessions = Array.from(activeSessions.entries())
    .filter(([_, session]) => session.userId === user.id);

  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    // Supprimer la session la plus ancienne
    const oldestSession = userSessions.reduce((oldest, current) =>
      current[1].createdAt < oldest[1].createdAt ? current : oldest
    );
    activeSessions.delete(oldestSession[0]);
  }

  // Générer un token sécurisé
  const token = generateSecureToken();
  const now = Date.now();
  const expiresAt = now + SESSION_TIMEOUT;

  const session: Session = {
    userId: user.id,
    email: user.email,
    role: user.role,
    establishmentId: user.establishmentId,
    createdAt: now,
    lastActivity: now,
    expiresAt
  };

  activeSessions.set(token, session);

  console.log(`✅ Nouvelle session créée pour ${user.email} (${activeSessions.size} sessions actives)`);

  return { token, expiresAt };
};

// Fonction pour supprimer une session
export const removeSession = (token: string): boolean => {
  const removed = activeSessions.delete(token);
  if (removed) {
    console.log(`🗑️ Session supprimée (${activeSessions.size} sessions restantes)`);
  }
  return removed;
};

// Fonction pour renouveler une session
export const refreshSession = (token: string): { newToken?: string; expiresAt?: number } => {
  const session = activeSessions.get(token);

  if (!session) {
    return {};
  }

  const now = Date.now();

  // Vérifier si la session peut être renouvelée (pas trop ancienne)
  const sessionAge = now - session.createdAt;
  const maxRenewalAge = SESSION_TIMEOUT * 0.8; // 80% de la durée de session

  if (sessionAge > maxRenewalAge) {
    // Session trop ancienne, créer une nouvelle
    const newToken = generateSecureToken();
    const newExpiresAt = now + SESSION_TIMEOUT;

    const newSession: Session = {
      ...session,
      createdAt: now,
      lastActivity: now,
      expiresAt: newExpiresAt
    };

    activeSessions.delete(token); // Supprimer l'ancien token
    activeSessions.set(newToken, newSession); // Stocker le nouveau

    console.log(`🔄 Session renouvelée pour ${session.email}`);

    return { newToken, expiresAt: newExpiresAt };
  } else {
    // Renouveler la session existante
    session.lastActivity = now;
    session.expiresAt = now + SESSION_TIMEOUT;

    console.log(`⏰ Session prolongée pour ${session.email}`);

    return { expiresAt: session.expiresAt };
  }
};

// Fonction pour authentifier un utilisateur
export const authenticateUser = (email: string, password: string) => {
  const user = LOCAL_DEV_USERS[email];

  if (!user || user.password !== password) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    establishmentId: user.establishmentId,
    name: `${user.firstName} ${user.lastName}`,
    cguAccepted: user.cguAccepted,
    isLocalDev: user.isLocalDev,
    establishment: user.establishment
  };
};

// Fonction utilitaire pour générer un token sécurisé
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Fonction pour obtenir les statistiques des sessions (debug)
export const getSessionStats = () => {
  const now = Date.now();
  const stats = {
    totalSessions: activeSessions.size,
    activeSessions: 0,
    expiredSessions: 0,
    sessionsByUser: {} as Record<string, number>
  };

  for (const [_, session] of activeSessions) {
    if (now <= session.expiresAt) {
      stats.activeSessions++;
      stats.sessionsByUser[session.email] = (stats.sessionsByUser[session.email] || 0) + 1;
    } else {
      stats.expiredSessions++;
    }
  }

  return stats;
};
