/**
 * Middleware de test simple pour contourner l'authentification en développement
 */

import { Request, Response, NextFunction } from "express";

const TEST_USER = {
  claims: {
    sub: "test-user-123",
    email: "test@nurselink.local",
    name: "Utilisateur Test",
    given_name: "Utilisateur",
    family_name: "Test"
  }
};

export const testAuthMiddleware = (req: any, res: Response, next: NextFunction) => {
  // Force l'authentification en mode test
  req.user = TEST_USER;
  req.isAuthenticated = () => true;
  next();
};

export const setupTestAuthRoutes = (app: any) => {
  // Route pour récupérer l'utilisateur test
  app.get("/api/auth/user", (req: any, res: Response) => {
    res.json({
      id: TEST_USER.claims.sub,
      email: TEST_USER.claims.email,
      firstName: TEST_USER.claims.given_name,
      lastName: TEST_USER.claims.family_name,
      role: "nurse",
      cguAccepted: true,
      isTestMode: true
    });
  });

  // Routes de connexion/déconnexion pour compatibilité
  app.get("/api/auth/login", (req: any, res: Response) => {
    res.redirect("/");
  });

  app.get("/api/auth/logout", (req: any, res: Response) => {
    res.redirect("/");
  });

  app.get("/api/auth/callback", (req: any, res: Response) => {
    res.redirect("/");
  });
};