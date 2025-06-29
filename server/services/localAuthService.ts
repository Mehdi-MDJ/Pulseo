/**
 * ==============================================================================
 * NurseLink AI - Service d'Authentification Locale
 * ==============================================================================
 * 
 * Système d'authentification par email/mot de passe pour remplacer OAuth Replit
 * Utilise bcrypt pour le hachage des mots de passe et Passport Local Strategy
 * ==============================================================================
 */

import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storageService";

const SALT_ROUNDS = 12;

/**
 * Configuration des sessions locales
 */
function createLocalSessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    },
  });
}

/**
 * Hashage sécurisé du mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Vérification du mot de passe
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Configuration de l'authentification locale
 */
export async function setupLocalAuthentication(app: Express) {
  console.log("🔐 Initialisation authentification locale (email/mot de passe)");

  // Configuration Express
  app.set("trust proxy", 1);

  // Middleware de session
  app.use(createLocalSessionMiddleware());

  // Initialisation Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configuration de la stratégie locale
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      // Récupération de l'utilisateur par email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Email non trouvé' });
      }

      // Vérification du mot de passe
      if (!user.passwordHash) {
        return done(null, false, { message: 'Authentification locale non configurée' });
      }
      
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Mot de passe incorrect' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Sérialisation des sessions
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Configuration des routes d'authentification
  setupLocalAuthRoutes(app);

  console.log("✅ Authentification locale configurée");
}

/**
 * Routes d'authentification locale
 */
function setupLocalAuthRoutes(app: Express) {
  // Inscription
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { 
        email, password, firstName, lastName, role,
        // Champs infirmiers
        rppsNumber, adeliNumber, specialization, experience,
        // Champs établissements
        establishmentName, establishmentType, siretNumber, address, contactPhone
      } = req.body;

      // Validation des données de base
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({
          error: "Tous les champs sont requis",
          code: "MISSING_FIELDS"
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Le mot de passe doit contenir au moins 6 caractères",
          code: "PASSWORD_TOO_SHORT"
        });
      }

      // Validation spécifique selon le rôle
      if (role === "nurse" && (!rppsNumber || !specialization)) {
        return res.status(400).json({
          error: "Numéro RPPS et spécialisation requis pour les infirmiers",
          code: "MISSING_NURSE_FIELDS"
        });
      }

      if (role === "establishment" && (!establishmentName || !establishmentType || !siretNumber)) {
        return res.status(400).json({
          error: "Nom, type et SIRET requis pour les établissements",
          code: "MISSING_ESTABLISHMENT_FIELDS"
        });
      }

      // Vérification que l'email n'existe pas déjà
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: "Cet email est déjà utilisé",
          code: "EMAIL_EXISTS"
        });
      }

      // Création de l'utilisateur
      const passwordHash = await hashPassword(password);
      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        role,
        passwordHash,
        cguAccepted: true
      });

      // Création du profil spécifique selon le rôle
      if (role === "nurse") {
        await storage.createOrUpdateNurseProfile({
          userId: newUser.id,
          rppsNumber,
          adeliNumber,
          specializations: [specialization],
          experience: parseInt(experience?.split('-')[0] || "0"),
          firstName,
          lastName,
          hourlyRateMin: 25,
          hourlyRateMax: 45,
          location: {
            address: "France",
            lat: 46.2276,
            lng: 2.2137
          },
          availability: {},
          isAvailable: true
        });
      } else if (role === "establishment") {
        await storage.createOrUpdateEstablishmentProfile({
          userId: newUser.id,
          name: establishmentName,
          type: establishmentType,
          siretNumber,
          address: address || "",
          contactPersonName: `${firstName} ${lastName}`,
          contactPhone: contactPhone || "",
          location: {
            address: address || "France",
            lat: 46.2276,
            lng: 2.2137
          }
        });
      }

      // Connexion automatique après inscription
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({
            error: "Erreur lors de la connexion",
            code: "LOGIN_ERROR"
          });
        }

        res.status(201).json({
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
          }
        });
      });

    } catch (error) {
      console.error("Erreur inscription:", error);
      res.status(500).json({
        error: "Erreur serveur",
        code: "SERVER_ERROR"
      });
    }
  });

  // Connexion
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({
          error: "Erreur serveur",
          code: "SERVER_ERROR"
        });
      }

      if (!user) {
        return res.status(401).json({
          error: info?.message || "Email ou mot de passe incorrect",
          code: "INVALID_CREDENTIALS"
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            error: "Erreur lors de la connexion",
            code: "LOGIN_ERROR"
          });
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      });
    })(req, res, next);
  });

  // Déconnexion
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          error: "Erreur lors de la déconnexion",
          code: "LOGOUT_ERROR"
        });
      }
      res.json({ message: "Déconnexion réussie" });
    });
  });

  // Récupération de l'utilisateur connecté
  app.get("/api/auth/user", requireLocalAuthentication, (req: any, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      cguAccepted: req.user.cguAccepted
    });
  });

  // Statut de connexion
  app.get("/api/auth/status", (req, res) => {
    res.json({
      authenticated: req.isAuthenticated(),
      user: req.isAuthenticated() ? {
        id: (req.user as any).id,
        email: (req.user as any).email,
        role: (req.user as any).role
      } : null
    });
  });
}

/**
 * Middleware d'authentification locale requis
 */
export const requireLocalAuthentication: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Non authentifié",
      code: "UNAUTHORIZED"
    });
  }
  next();
};