/**
 * ==============================================================================
 * NurseLink AI - Routes Principales
 * ==============================================================================
 *
 * Point d'entrée pour toutes les routes de l'application
 * Architecture modulaire avec services intégrés
 * ==============================================================================
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../services/storageService";

// Import des routes modulaires
import authRoutes from "./authRoutes";
import profileRoutes from "./profileRoutes";
import missionRoutes from "./missionRoutes";
import aiRoutes from "./aiRoutes";
import contractRoutes from "./contractRoutes";
import testRoutes from "./testRoutes";
import assistantRoutes from "./assistantRoutes";
import analyticsRoutes from "./analyticsRoutes";
import testModeRoutes from "./testModeRoutes";
import { contractService } from "../services/contractService";
import { establishmentSimpleRoutes } from "./establishmentSimpleRoutes";

// Types pour les sessions de test
declare module 'express-session' {
  interface SessionData {
    passport?: {
      user: any;
    };
  }
}

/**
 * Enregistrement de toutes les routes avec services intégrés
 */
export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔗 Enregistrement des routes et services...");

  // Configuration de l'authentification JWT
  console.log("🔐 Configuration authentification JWT");

  // Routes d'authentification JWT
  app.use("/api/auth", authRoutes);

  // Les autres routes
  app.use("/api/profiles", profileRoutes);
  app.use("/api/missions", missionRoutes);
  app.use("/api/ai", aiRoutes);

  // Route de santé de l'API
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        database: !!process.env.DATABASE_URL,
        openai: !!process.env.OPENAI_API_KEY,
        auth: !!process.env.REPL_ID,
      },
    });
  });

  // Routes de matching intelligent (priorité élevée)
  app.post('/api/matching/test', async (req, res) => {
    try {
      console.log('🎯 Test matching intelligent exécuté');

      const mockMatches = [
        {
          name: "Sophie Martin",
          score: 92,
          distance: 2.3,
          factors: ["Spécialisation correspondante", "Expérience 5 ans", "Note excellente (4.8/5)"]
        },
        {
          name: "Pierre Dubois",
          score: 87,
          distance: 5.1,
          factors: ["Spécialisation correspondante", "Certification BLS", "À proximité"]
        },
        {
          name: "Marie Leroy",
          score: 84,
          distance: 3.7,
          factors: ["Expérience 7 ans", "Note excellente (4.9/5)", "Certifications multiples"]
        },
        {
          name: "Thomas Bernard",
          score: 76,
          distance: 8.2,
          factors: ["Spécialisation correspondante", "Disponible immédiatement"]
        }
      ];

      res.json({
        success: true,
        message: "Test de matching réalisé avec succès",
        matches: mockMatches
      });

    } catch (error: any) {
      console.error("❌ Erreur test matching:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors du test de matching"
      });
    }
  });

  app.post('/api/matching/mission/:id', async (req, res) => {
    try {
      const missionId = parseInt(req.params.id);
      const criteria = req.body;

      console.log(`🎯 Matching pour mission ${missionId} avec critères:`, criteria);

      const mockMatches = [
        {
          nurseId: 1,
          name: "Sophie Martin",
          score: 92,
          distance: Math.round(Math.random() * (criteria.maxDistance || 30) * 10) / 10,
          experience: Math.max(criteria.minExperience || 0, Math.floor(Math.random() * 8) + 2),
          rating: 4.2 + Math.random() * 0.8,
          specializations: ["urgences", "cardiologie"],
          matchingFactors: ["Spécialisation correspondante", "Expérience suffisante", "Note excellente"],
          notificationSent: true
        },
        {
          nurseId: 2,
          name: "Pierre Dubois",
          score: 87,
          distance: Math.round(Math.random() * (criteria.maxDistance || 30) * 10) / 10,
          experience: Math.max(criteria.minExperience || 0, Math.floor(Math.random() * 6) + 3),
          rating: 4.0 + Math.random() * 1.0,
          specializations: ["urgences", "pediatrie"],
          matchingFactors: ["Spécialisation correspondante", "Certification BLS", "Disponible"],
          notificationSent: true
        },
        {
          nurseId: 3,
          name: "Marie Leroy",
          score: 84,
          distance: Math.round(Math.random() * (criteria.maxDistance || 30) * 10) / 10,
          experience: Math.max(criteria.minExperience || 0, Math.floor(Math.random() * 10) + 1),
          rating: 4.5 + Math.random() * 0.5,
          specializations: ["chirurgie", "traumatologie"],
          matchingFactors: ["Expérience élevée", "Note excellente", "Certifications multiples"],
          notificationSent: true
        }
      ].slice(0, criteria.maxCandidates || 10);

      res.json({
        success: true,
        missionId,
        totalMatches: mockMatches.length,
        matches: mockMatches,
        criteria
      });

    } catch (error: any) {
      console.error("❌ Erreur matching mission:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors du matching"
      });
    }
  });

  app.post('/api/missions/publish', async (req, res) => {
    try {
      console.log('📝 Publication mission avec matching automatique');

      const missionData = req.body;
      const mockMission = {
        id: Math.floor(Math.random() * 1000) + 1,
        ...missionData,
        createdAt: new Date().toISOString(),
        status: 'published'
      };

      // Simuler le matching automatique après publication
      const mockMatches = [
        {
          nurseId: 1,
          name: "Sophie Martin",
          score: 92,
          distance: Math.round(Math.random() * (missionData.maxDistance || 30) * 10) / 10,
          experience: Math.max(missionData.requiredExperience || 0, Math.floor(Math.random() * 8) + 2),
          rating: 4.2 + Math.random() * 0.8,
          specializations: ["urgences", "cardiologie"],
          matchingFactors: ["Spécialisation correspondante", "Expérience suffisante", "Note excellente"],
          notificationSent: true
        },
        {
          nurseId: 2,
          name: "Pierre Dubois",
          score: 87,
          distance: Math.round(Math.random() * (missionData.maxDistance || 30) * 10) / 10,
          experience: Math.max(missionData.requiredExperience || 0, Math.floor(Math.random() * 6) + 3),
          rating: 4.0 + Math.random() * 1.0,
          specializations: ["urgences", "pediatrie"],
          matchingFactors: ["Spécialisation correspondante", "Certification BLS", "Disponible"],
          notificationSent: true
        },
        {
          nurseId: 3,
          name: "Marie Leroy",
          score: 84,
          distance: Math.round(Math.random() * (missionData.maxDistance || 30) * 10) / 10,
          experience: Math.max(missionData.requiredExperience || 0, Math.floor(Math.random() * 10) + 1),
          rating: 4.5 + Math.random() * 0.5,
          specializations: ["chirurgie", "traumatologie"],
          matchingFactors: ["Expérience élevée", "Note excellente", "Certifications multiples"],
          notificationSent: true
        }
      ].slice(0, missionData.maxCandidates || 10);

      console.log(`✅ Mission ${mockMission.id} publiée, ${mockMatches.length} candidats notifiés`);

      res.json({
        ...mockMission,
        matchingResults: mockMatches
      });

    } catch (error: any) {
      console.error("❌ Erreur publication mission:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la publication"
      });
    }
  });

  // Route pour les données de référence
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

  app.get("/api/reference/establishment-types", (req, res) => {
    res.json([
      "Hôpital public",
      "Clinique privée",
      "EHPAD",
      "Maison de retraite",
      "Centre de soins",
      "Clinique spécialisée",
      "Hôpital universitaire",
      "Centre de rééducation",
      "Hôpital psychiatrique",
      "Maternité",
      "Centre d'imagerie",
      "Laboratoire d'analyses",
      "Cabinet médical",
      "Centre de dialyse",
      "Hospice",
    ]);
  });

  // Route de démonstration pour les missions
  app.get("/api/demo/missions", (req, res) => {
    const demoMissions = [
      {
        id: 1,
        title: "Infirmier de nuit - Réanimation",
        establishment: "CHU Lyon Sud",
        specialization: "Réanimation",
        shift: "Nuit",
        date: "2024-01-15",
        hourlyRate: 28,
        duration: "12h",
        urgency: "high",
        location: "Lyon",
        description: "Recherche infirmier expérimenté pour service de réanimation"
      },
      {
        id: 2,
        title: "Infirmier Urgences",
        establishment: "Clinique Saint-Joseph",
        specialization: "Urgences",
        shift: "Jour",
        date: "2024-01-16",
        hourlyRate: 25,
        duration: "8h",
        urgency: "medium",
        location: "Paris",
        description: "Remplacement temporaire aux urgences"
      },
      {
        id: 3,
        title: "Infirmier Pédiatrie",
        establishment: "Hôpital des Enfants",
        specialization: "Pédiatrie",
        shift: "Matin",
        date: "2024-01-17",
        hourlyRate: 26,
        duration: "10h",
        urgency: "low",
        location: "Marseille",
        description: "Mission longue durée en service pédiatrique"
      }
    ];

    res.json(demoMissions);
  });

  // Routes de matching intelligent
  app.post('/api/matching/test', async (req, res) => {
    try {
      console.log('🎯 Test matching intelligent exécuté');

      const mockMatches = [
        {
          name: "Sophie Martin",
          score: 92,
          distance: 2.3,
          factors: ["Spécialisation correspondante", "Expérience 5 ans", "Note excellente (4.8/5)"]
        },
        {
          name: "Pierre Dubois",
          score: 87,
          distance: 5.1,
          factors: ["Spécialisation correspondante", "Certification BLS", "À proximité"]
        },
        {
          name: "Marie Leroy",
          score: 84,
          distance: 3.7,
          factors: ["Expérience 7 ans", "Note excellente (4.9/5)", "Certifications multiples"]
        },
        {
          name: "Thomas Bernard",
          score: 76,
          distance: 8.2,
          factors: ["Spécialisation correspondante", "Disponible immédiatement"]
        }
      ];

      res.json({
        success: true,
        message: "Test de matching réalisé avec succès",
        matches: mockMatches
      });

    } catch (error: any) {
      console.error("❌ Erreur test matching:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors du test de matching"
      });
    }
  });

  app.post('/api/matching/mission/:id', async (req, res) => {
    try {
      const missionId = parseInt(req.params.id);
      const criteria = req.body;

      console.log(`🎯 Matching pour mission ${missionId} avec critères:`, criteria);

      const mockMatches = [
        {
          nurseId: 1,
          name: "Sophie Martin",
          score: 92,
          distance: Math.round(Math.random() * (criteria.maxDistance || 30) * 10) / 10,
          experience: Math.max(criteria.minExperience || 0, Math.floor(Math.random() * 8) + 2),
          rating: 4.2 + Math.random() * 0.8,
          specializations: ["urgences", "cardiologie"],
          matchingFactors: ["Spécialisation correspondante", "Expérience suffisante", "Note excellente"],
          notificationSent: true
        },
        {
          nurseId: 2,
          name: "Pierre Dubois",
          score: 87,
          distance: Math.round(Math.random() * (criteria.maxDistance || 30) * 10) / 10,
          experience: Math.max(criteria.minExperience || 0, Math.floor(Math.random() * 6) + 3),
          rating: 4.0 + Math.random() * 1.0,
          specializations: ["urgences", "pediatrie"],
          matchingFactors: ["Spécialisation correspondante", "Certification BLS", "Disponible"],
          notificationSent: true
        },
        {
          nurseId: 3,
          name: "Marie Leroy",
          score: 84,
          distance: Math.round(Math.random() * (criteria.maxDistance || 30) * 10) / 10,
          experience: Math.max(criteria.minExperience || 0, Math.floor(Math.random() * 10) + 1),
          rating: 4.5 + Math.random() * 0.5,
          specializations: ["chirurgie", "traumatologie"],
          matchingFactors: ["Expérience élevée", "Note excellente", "Certifications multiples"],
          notificationSent: true
        }
      ].slice(0, criteria.maxCandidates || 10);

      res.json({
        success: true,
        missionId,
        totalMatches: mockMatches.length,
        matches: mockMatches,
        criteria
      });

    } catch (error: any) {
      console.error("❌ Erreur matching mission:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors du matching"
      });
    }
  });

  app.post('/api/missions/publish', async (req, res) => {
    try {
      console.log('📝 Publication mission avec matching automatique');

      const missionData = req.body;
      const mockMission = {
        id: Math.floor(Math.random() * 1000) + 1,
        ...missionData,
        createdAt: new Date().toISOString(),
        status: 'published'
      };

      // Simuler le matching automatique
      const mockMatches = [
        {
          nurseId: 1,
          name: "Sophie Martin",
          score: 92,
          distance: Math.round(Math.random() * (missionData.maxDistance || 30) * 10) / 10,
          experience: Math.max(missionData.requiredExperience || 0, Math.floor(Math.random() * 8) + 2),
          rating: 4.2 + Math.random() * 0.8,
          specializations: ["urgences", "cardiologie"],
          matchingFactors: ["Spécialisation correspondante", "Expérience suffisante", "Note excellente"],
          notificationSent: true
        },
        {
          nurseId: 2,
          name: "Pierre Dubois",
          score: 87,
          distance: Math.round(Math.random() * (missionData.maxDistance || 30) * 10) / 10,
          experience: Math.max(missionData.requiredExperience || 0, Math.floor(Math.random() * 6) + 3),
          rating: 4.0 + Math.random() * 1.0,
          specializations: ["urgences", "pediatrie"],
          matchingFactors: ["Spécialisation correspondante", "Certification BLS", "Disponible"],
          notificationSent: true
        },
        {
          nurseId: 3,
          name: "Marie Leroy",
          score: 84,
          distance: Math.round(Math.random() * (missionData.maxDistance || 30) * 10) / 10,
          experience: Math.max(missionData.requiredExperience || 0, Math.floor(Math.random() * 10) + 1),
          rating: 4.5 + Math.random() * 0.5,
          specializations: ["chirurgie", "traumatologie"],
          matchingFactors: ["Expérience élevée", "Note excellente", "Certifications multiples"],
          notificationSent: true
        }
      ].slice(0, missionData.maxCandidates || 10);

      console.log(`✅ Mission ${mockMission.id} publiée, ${mockMatches.length} candidats notifiés`);

      res.json({
        ...mockMission,
        matchingResults: mockMatches
      });

    } catch (error: any) {
      console.error("❌ Erreur publication mission:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la publication"
      });
    }
  });

  // Routes de test en local (développement uniquement)
  if (process.env.NODE_ENV === 'development') {
    // Connexion rapide établissement de test
    app.get("/api/test/login-establishment", async (req, res) => {
      try {
        const establishmentData = {
          id: 'test-establishment-1',
          email: 'test-establishment@nurselink.fr',
          firstName: 'CHU',
          lastName: 'Lyon Test',
          role: 'establishment' as const,
          cguAccepted: true,
        };

        // Créer ou mettre à jour l'utilisateur
        const user = await storage.upsertUser(establishmentData);

        // Créer le profil établissement
        await storage.createOrUpdateEstablishmentProfile({
          userId: user.id,
          name: 'CHU Lyon Test',
          type: 'Hôpital Universitaire',
          address: '165 Chemin du Grand Revoyet, 69310 Pierre-Bénite',
          city: 'Pierre-Bénite',
          postalCode: '69310',
          siret: '26690045300017',
          phone: '04 72 07 17 17',
          description: 'Centre Hospitalier Universitaire - Service de test'
        });

        // Créer session de test
        const sessionData = {
          claims: { sub: user.id, email: user.email },
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600
        };

        req.session.passport = { user: sessionData };
        req.user = sessionData;

        req.session.save(() => {
          res.redirect('/dashboard');
        });
      } catch (error) {
        console.error("Erreur connexion test établissement:", error);
        res.status(500).json({ error: "Erreur lors de la connexion test" });
      }
    });

    // Connexion rapide infirmier de test
    app.get("/api/test/login-nurse", async (req, res) => {
      try {
        const nurseData = {
          id: 'test-nurse-1',
          email: 'test-nurse@nurselink.fr',
          firstName: 'Marie',
          lastName: 'Dupont Test',
          role: 'nurse' as const,
          cguAccepted: true,
        };

        // Créer ou mettre à jour l'utilisateur
        const user = await storage.upsertUser(nurseData);

        // Créer le profil infirmier
        await storage.createOrUpdateNurseProfile({
          userId: user.id,
          specializations: ['Réanimation'],
          experience: 5,
          hourlyRate: 28,
          address: 'Lyon, France',
          city: 'Lyon',
          postalCode: '69000',
          phone: '06 12 34 56 78',
          certifications: ['Diplôme d\'État infirmier', 'Formation réanimation', 'BLS'],
          availableShifts: ['matin', 'nuit'],
          isAvailable: true,
          documentsVerified: true
        });

        // Créer session de test
        const sessionData = {
          claims: { sub: user.id, email: user.email },
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600
        };

        req.session.passport = { user: sessionData };
        req.user = sessionData;

        req.session.save(() => {
          res.redirect('/dashboard');
        });
      } catch (error) {
        console.error("Erreur connexion test infirmier:", error);
        res.status(500).json({ error: "Erreur lors de la connexion test" });
      }
    });

    // Route pour créer des données de test
    app.post("/api/test/create-sample-data", async (req, res) => {
      try {
        // Créer plusieurs profils infirmiers de test
        const nurseProfiles = [
          {
            userId: 'nurse-test-2',
            email: 'jean.martin@test.fr',
            firstName: 'Jean',
            lastName: 'Martin',
            specialization: 'Urgences',
            experience: 8,
            hourlyRate: 25,
            location: 'Paris, France'
          },
          {
            userId: 'nurse-test-3',
            email: 'sophie.leroy@test.fr',
            firstName: 'Sophie',
            lastName: 'Leroy',
            specialization: 'Pédiatrie',
            experience: 3,
            hourlyRate: 26,
            location: 'Marseille, France'
          },
          {
            userId: 'nurse-test-4',
            email: 'antoine.rousseau@test.fr',
            firstName: 'Antoine',
            lastName: 'Rousseau',
            specialization: 'Bloc opératoire',
            experience: 6,
            hourlyRate: 30,
            location: 'Lyon, France'
          }
        ];

        for (const nurse of nurseProfiles) {
          await storage.upsertUser({
            id: nurse.userId,
            email: nurse.email,
            firstName: nurse.firstName,
            lastName: nurse.lastName,
            role: 'nurse',
            cguAccepted: true
          });

          await storage.createOrUpdateNurseProfile({
            userId: nurse.userId,
            specialization: nurse.specialization,
            experience: nurse.experience,
            hourlyRate: nurse.hourlyRate,
            location: nurse.location,
            phone: '06 12 34 56 78',
            certifications: ['Diplôme d\'État infirmier'],
            availableShifts: ['matin', 'apres-midi', 'nuit'],
            available: true,
            documentsVerified: true
          });
        }

        res.json({
          success: true,
          message: 'Données de test créées avec succès',
          created: {
            nurses: nurseProfiles.length
          }
        });
      } catch (error) {
        console.error("Erreur création données test:", error);
        res.status(500).json({ error: "Erreur lors de la création des données test" });
      }
    });

    // Page de test en local
    app.get("/test", (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NurseLink AI - Test Local</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2563eb; text-align: center; margin-bottom: 30px; }
            .test-section { margin: 20px 0; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px; }
            .test-section h3 { margin: 0 0 15px 0; color: #333; }
            .btn { display: inline-block; padding: 10px 20px; margin: 5px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; border: none; cursor: pointer; }
            .btn:hover { background: #1d4ed8; }
            .btn-success { background: #059669; }
            .btn-success:hover { background: #047857; }
            .btn-warning { background: #d97706; }
            .btn-warning:hover { background: #b45309; }
            .info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🏥 NurseLink AI - Test Local</h1>

            <div class="info">
              <strong>Mode Test Activé</strong><br>
              Utilisez ces outils pour tester l'application complète sans OAuth.
            </div>

            <div class="test-section">
              <h3>🔐 Connexions Rapides</h3>
              <a href="/api/test/login-establishment" class="btn">Se connecter comme Établissement</a>
              <a href="/api/test/login-nurse" class="btn">Se connecter comme Infirmier</a>
            </div>

            <div class="test-section">
              <h3>📊 Données de Test</h3>
              <button onclick="createSampleData()" class="btn btn-success">Créer des Profils Infirmiers Test</button>
              <div id="result"></div>
            </div>

            <div class="test-section">
              <h3>🧪 Scénarios de Test</h3>
              <p><strong>1. Test Établissement :</strong></p>
              <ul>
                <li>Cliquez "Se connecter comme Établissement"</li>
                <li>Créez une nouvelle mission via le dashboard</li>
                <li>Testez le matching IA</li>
              </ul>

              <p><strong>2. Test Infirmier :</strong></p>
              <ul>
                <li>Cliquez "Se connecter comme Infirmier"</li>
                <li>Consultez les missions disponibles</li>
                <li>Postulez à une mission</li>
              </ul>
            </div>

            <div class="test-section">
              <h3>🔗 Liens Utiles</h3>
              <a href="/" class="btn btn-warning">Retour à l'Accueil</a>
              <a href="/dashboard" class="btn btn-warning">Dashboard</a>
            </div>
          </div>

          <script>
            async function createSampleData() {
              const result = document.getElementById('result');
              result.innerHTML = '<p style="color: #059669;">Création des données en cours...</p>';

              try {
                const response = await fetch('/api/test/create-sample-data', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (data.success) {
                  result.innerHTML = '<p style="color: #059669;">✅ ' + data.message + '</p>';
                } else {
                  result.innerHTML = '<p style="color: #dc2626;">❌ Erreur: ' + data.error + '</p>';
                }
              } catch (error) {
                result.innerHTML = '<p style="color: #dc2626;">❌ Erreur: ' + error.message + '</p>';
              }
            }
          </script>
        </body>
        </html>
      `);
    });
  }

  // Route de test pour développement local
  app.get("/api/test/auth", (req, res) => {
    res.json({
      id: "local-test-user",
      email: "test@nurselink.local",
      firstName: "Test",
      lastName: "User",
      role: "nurse",
      cguAccepted: true,
      isLocalTest: true
    });
  });

  // Enregistrement des routes modulaires
  app.use("/api/profiles", profileRoutes);
  app.use("/api/missions", missionRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/contracts", contractRoutes);
  app.use("/api/assistant", assistantRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/test", testRoutes);
  app.use("/api/establishment", establishmentSimpleRoutes);

  // Demo publish mission route (no auth required for testing)
  app.post('/api/demo/missions/publish', async (req: any, res) => {
    try {
      console.log('🚀 Demo publish mission called with data:', req.body);

      const mission = {
        id: Date.now(),
        ...req.body,
        establishmentId: 1,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('✅ Demo mission published successfully:', mission);
      res.json({
        success: true,
        message: "Mission publiée avec succès!",
        mission: mission
      });
    } catch (error) {
      console.error("❌ Error publishing demo mission:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la publication de la mission"
      });
    }
  });

  // Route par défaut pour les API non trouvées
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      error: "Route API non trouvée",
      code: "API_ROUTE_NOT_FOUND",
      path: req.path,
    });
  });

  console.log("✅ Routes et services enregistrés avec succès");

  // Création du serveur HTTP
  const httpServer = createServer(app);
  return httpServer;
}
