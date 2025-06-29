/**
 * Routes spéciales pour mode test - contournement authentification
 */

import { Router } from "express";
import { testAuthMiddleware, setupTestAuthRoutes } from "../middleware/testAuthMiddleware";

const router = Router();

// Mode test activé si NODE_ENV=development et pas de REPL_ID
const isTestMode = process.env.NODE_ENV === "development" && !process.env.REPL_ID;

if (isTestMode) {
  console.log("🧪 Mode test activé - Authentification contournée");
  
  // Middleware global pour simuler l'authentification
  router.use(testAuthMiddleware);
  
  // Routes d'authentification test
  router.get("/user", (req: any, res) => {
    res.json({
      id: "test-user-123",
      email: "test@nurselink.local",
      firstName: "Utilisateur",
      lastName: "Test",
      role: "nurse",
      cguAccepted: true,
      isTestMode: true
    });
  });

  router.get("/login", (req, res) => {
    res.redirect("/");
  });

  router.get("/logout", (req, res) => {
    res.redirect("/");
  });

  router.get("/callback", (req, res) => {
    res.redirect("/");
  });
}

export default router;