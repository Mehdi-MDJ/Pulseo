import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./simple-storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Route de base pour tester que le serveur fonctionne
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // Route d'authentification simplifiée pour les tests
  app.get('/api/auth/user', (req, res) => {
    res.json({ message: 'Authentication not configured yet' });
  });

  // Routes basiques pour les profils
  app.get('/api/nurse-profile', (req, res) => {
    res.json({ message: 'Nurse profile endpoint' });
  });

  app.get('/api/establishment-profile', (req, res) => {
    res.json({ message: 'Establishment profile endpoint' });
  });

  // Routes pour les missions
  app.get('/api/missions', (req, res) => {
    res.json({ missions: [] });
  });

  const httpServer = createServer(app);
  return httpServer;
}