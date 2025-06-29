/**
 * ==============================================================================
 * NurseLink AI - Service d'Authentification
 * ==============================================================================
 * 
 * Service centralisé pour la gestion de l'authentification OAuth Replit
 * Intègre la gestion des sessions, la validation des tokens et les middlewares
 * 
 * Fonctionnalités :
 * - Configuration OAuth automatique
 * - Gestion sécurisée des sessions
 * - Middleware d'authentification
 * - Refresh automatique des tokens
 * - Logging sécurisé (sans exposition des secrets)
 * ==============================================================================
 */

import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";

import { authConfig, databaseConfig, isDevelopment } from "../config/environment";
import { storage } from "./storageService";
import { localAuthMiddleware, setupLocalAuthRoutes } from "../middleware/localAuthMiddleware";

/**
 * Configuration OpenID Connect mise en cache
 * Le cache évite les appels répétés au serveur d'autorisation
 */
const getOidcConfig = memoize(
  async () => {
    console.log("🔐 Initialisation configuration OpenID Connect...");
    return await client.discovery(
      new URL(authConfig.issuerUrl),
      authConfig.replId
    );
  },
  { maxAge: 3600 * 1000 } // Cache pendant 1 heure
);

/**
 * Configuration sécurisée des sessions
 * Utilise PostgreSQL pour la persistance en production
 */
export function createSessionMiddleware() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 semaine
  
  // Configuration du store de session PostgreSQL
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: databaseConfig.url,
    createTableIfMissing: false, // La table sessions existe déjà dans le schéma
    ttl: sessionTtl,
    tableName: "sessions",
  });

  console.log("🛡️ Configuration sessions sécurisées activée");

  return session({
    secret: authConfig.sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !isDevelopment, // HTTPS obligatoire en production
      maxAge: sessionTtl,
      sameSite: "lax", // Protection CSRF
    },
    name: "nurselink.sid", // Nom personnalisé pour la sécurité
  });
}

/**
 * Met à jour les données de session utilisateur avec les nouveaux tokens
 */
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
  
  if (isDevelopment) {
    console.log("🔄 Session utilisateur mise à jour:", {
      userId: user.claims?.sub,
      expiresAt: new Date(user.expires_at * 1000).toISOString(),
    });
  }
}

/**
 * Crée ou met à jour le profil utilisateur lors de l'authentification
 */
async function upsertUserProfile(claims: any) {
  try {
    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
    
    console.log("👤 Profil utilisateur synchronisé:", {
      userId: claims["sub"],
      email: claims["email"] ? "***@***.***" : null,
    });
  } catch (error) {
    console.error("❌ Erreur synchronisation profil utilisateur:", error);
    throw error;
  }
}

/**
 * Configuration complète de l'authentification OAuth
 */
export async function setupAuthentication(app: Express) {
  console.log("🚀 Initialisation du système d'authentification...");

  // Configuration Express pour les proxies (Replit/production)
  app.set("trust proxy", 1);

  // Middleware de session
  app.use(createSessionMiddleware());

  // Middleware d'authentification locale pour le développement
  app.use(localAuthMiddleware);

  // Si mode développement local, on configure les routes locales et on arrête ici
  if (authConfig.localDevMode) {
    console.log("🔧 Mode développement local activé - Contournement OAuth Replit");
    setupLocalAuthRoutes(app);
    console.log("🔐 Système d'authentification local configuré avec succès");
    return;
  }

  // Initialisation Passport (seulement en mode production/Replit)
  app.use(passport.initialize());
  app.use(passport.session());

  // Configuration OpenID Connect
  const config = await getOidcConfig();

  /**
   * Fonction de vérification Passport
   * Appelée lors de chaque authentification réussie
   */
  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUserProfile(tokens.claims());
      verified(null, user);
    } catch (error) {
      console.error("❌ Erreur lors de la vérification OAuth:", error);
      verified(error, false);
    }
  };

  // Configuration des stratégies pour chaque domaine Replit
  for (const domain of authConfig.domains) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/auth/callback`,
      },
      verify,
    );
    
    passport.use(strategy);
    console.log(`✅ Stratégie OAuth configurée pour: ${domain}`);
  }

  // Sérialisation/désérialisation des sessions
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Routes d'authentification
  setupAuthRoutes(app);

  console.log("🔐 Système d'authentification configuré avec succès");
}

/**
 * Configuration des routes d'authentification
 */
function setupAuthRoutes(app: Express) {
  // Route de connexion
  app.get("/api/auth/login", (req, res, next) => {
    const strategy = `replitauth:${req.hostname}`;
    passport.authenticate(strategy, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  // Route de callback OAuth
  app.get("/api/auth/callback", (req, res, next) => {
    const strategy = `replitauth:${req.hostname}`;
    passport.authenticate(strategy, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/auth/login",
    })(req, res, next);
  });

  // Route de déconnexion
  app.get("/api/auth/logout", async (req, res) => {
    try {
      const config = await getOidcConfig();
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: authConfig.replId,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
      res.redirect("/");
    }
  });

  // Route pour récupérer les informations utilisateur
  app.get("/api/auth/user", requireAuthentication, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ 
          error: "Utilisateur non trouvé",
          code: "USER_NOT_FOUND" 
        });
      }

      res.json(user);
    } catch (error) {
      console.error("❌ Erreur récupération utilisateur:", error);
      res.status(500).json({ 
        error: "Erreur serveur",
        code: "INTERNAL_ERROR" 
      });
    }
  });
}

/**
 * Middleware d'authentification requis
 * Compatible avec le mode développement local et OAuth Replit
 */
export const requireAuthentication: RequestHandler = async (req, res, next) => {
  // En mode développement local, on utilise l'utilisateur fictif
  if (authConfig.localDevMode) {
    (req as any).user = {
      claims: {
        sub: "local-dev-user-123",
        email: "dev@nurselink.local",
        name: "Développeur Local",
        given_name: "Développeur",
        family_name: "Local"
      }
    };
    return next();
  }

  const user = req.user as any;

  // Vérification de l'authentification de base
  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ 
      error: "Non authentifié",
      code: "UNAUTHORIZED" 
    });
  }

  const now = Math.floor(Date.now() / 1000);
  
  // Token encore valide
  if (now <= user.expires_at) {
    return next();
  }

  // Tentative de refresh du token
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ 
      error: "Session expirée",
      code: "SESSION_EXPIRED" 
    });
  }

  try {
    console.log("🔄 Refresh automatique du token d'accès...");
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    
    updateUserSession(user, tokenResponse);
    
    console.log("✅ Token d'accès renouvelé avec succès");
    return next();
  } catch (error) {
    console.error("❌ Erreur lors du refresh du token:", error);
    return res.status(401).json({ 
      error: "Impossible de renouveler la session",
      code: "REFRESH_FAILED" 
    });
  }
};

/**
 * Middleware d'authentification optionnel
 * N'interrompt pas la requête si l'utilisateur n'est pas connecté
 */
export const optionalAuthentication: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }

  // Appliquer la même logique que requireAuthentication mais sans bloquer
  try {
    await new Promise<void>((resolve, reject) => {
      requireAuthentication(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    req.logout?.(() => {});
  }

  next();
};

/**
 * Utilitaire pour extraire les informations utilisateur de la requête
 */
export function getUserFromRequest(req: any): { userId: string; claims: any } | null {
  if (!req.isAuthenticated() || !req.user?.claims?.sub) {
    return null;
  }

  return {
    userId: req.user.claims.sub,
    claims: req.user.claims,
  };
}