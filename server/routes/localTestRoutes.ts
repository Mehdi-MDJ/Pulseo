/**
 * Routes de test pour développement local
 * Contourne l'authentification OAuth Replit
 */

import { Router } from "express";

const router = Router();

// Utilisateur fictif pour les tests locaux
const LOCAL_TEST_USER = {
  id: "local-test-user",
  email: "test@nurselink.local",
  firstName: "Test",
  lastName: "User",
  role: "nurse",
  cguAccepted: true,
  isLocalTest: true
};

// Middleware pour simuler l'authentification
router.use((req: any, res, next) => {
  req.user = {
    claims: {
      sub: LOCAL_TEST_USER.id,
      email: LOCAL_TEST_USER.email,
      given_name: LOCAL_TEST_USER.firstName,
      family_name: LOCAL_TEST_USER.lastName
    }
  };
  req.isAuthenticated = () => true;
  next();
});

// Route utilisateur
router.get("/user", (req, res) => {
  res.json(LOCAL_TEST_USER);
});

// Routes d'authentification pour compatibilité
router.get("/login", (req, res) => res.redirect("/"));
router.get("/logout", (req, res) => res.redirect("/"));
router.get("/callback", (req, res) => res.redirect("/"));

// Route de statut
router.get("/status", (req, res) => {
  res.json({
    authenticated: true,
    user: LOCAL_TEST_USER,
    mode: "local-test"
  });
});

export default router;