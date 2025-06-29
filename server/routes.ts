import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { 
  insertNurseProfileSchema, 
  insertEstablishmentProfileSchema, 
  insertMissionSchema,
  insertMissionApplicationSchema,
  type UserRole,
  type Mission,
  type NurseProfile,
  type EstablishmentProfile
} from "@shared/schema";
import { matchNursesToMission, generateAbsenceForecasts } from "./openai";
import { registerDemoRoutes } from "./routes/demoRoutes";
import matchingRoutes from "./routes/matchingRoutes";
import { matchingService } from "./services/matchingService";
import path from "path";
import fs from "fs";

// Déclarations globales pour TypeScript
declare global {
  var testScenarios: any;
  var demoMissions: any;
  var demoNurses: any;
  var demoEstablishments: any;
  var demoApplications: any;
  var demoNotifications: any;
  var demoReports: any;
}

// Types pour corriger les erreurs TypeScript
interface NurseProfileData {
  specializations: string[];
  certifications: string[];
  experience: number;
  rating: number;
  availability: boolean;
}

interface EstablishmentProfileData {
  name: string;
  type: string;
  address: string;
  siret: string;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  cguAccepted: boolean;
  profile: NurseProfileData | EstablishmentProfileData;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Routes de matching intelligent (priorité haute)
  app.post('/api/matching/test', async (req, res) => {
    try {
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
      
      console.log("🎯 Test matching exécuté avec succès");
      
      res.json({
        success: true,
        message: "Test de matching réalisé avec succès",
        matches: mockMatches
      });

    } catch (error) {
      console.error("❌ Erreur test matching:", error);
      res.status(500).json({ 
        error: "Erreur lors du test", 
        code: "TEST_ERROR"
      });
    }
  });

  app.post('/api/matching/mission/:id', async (req, res) => {
    try {
      const missionId = parseInt(req.params.id);
      const criteria = req.body;
      
      console.log(`🎯 Matching pour mission ${missionId} avec critères:`, criteria);
      
      // Simulation avancée avec les critères fournis
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

    } catch (error) {
      console.error("❌ Erreur matching mission:", error);
      res.status(500).json({ 
        error: "Erreur lors du matching", 
        code: "MATCHING_ERROR"
      });
    }
  });

  // Register demo routes for development testing
  registerDemoRoutes(app);





  // Mobile demo route (public access)
  app.get("/mobile-app", async (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NurseLink AI - Application Mobile</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; max-width: 375px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 50px 20px 20px; text-align: center; }
        .header h1 { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .tab-bar { display: flex; background: white; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 10; }
        .tab { flex: 1; padding: 16px; text-align: center; background: none; border: none; cursor: pointer; font-size: 14px; color: #6b7280; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
        .content { padding: 20px; }
        .section-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }
        .card { background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .mission-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .mission-title { font-size: 18px; font-weight: 600; color: #1f2937; flex: 1; margin-right: 8px; }
        .urgency-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; color: white; }
        .urgency-high { background-color: #ef4444; }
        .urgency-medium { background-color: #f59e0b; }
        .mission-info { margin: 4px 0; color: #6b7280; font-size: 14px; }
        .mission-rate { font-size: 20px; font-weight: bold; color: #059669; margin: 4px 0; }
        .mission-description { color: #6b7280; line-height: 1.5; margin: 8px 0 12px; }
        .apply-button { background: #2563eb; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 600; width: 100%; cursor: pointer; transition: background 0.2s; }
        .apply-button:hover { background: #1d4ed8; }
        .notification-card { border-left: 4px solid; padding: 16px; }
        .notification-success { border-left-color: #10b981; }
        .notification-info { border-left-color: #2563eb; }
        .notification-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .notification-title { font-size: 16px; font-weight: 600; color: #1f2937; }
        .notification-time { font-size: 12px; color: #9ca3af; }
        .notification-message { color: #374151; line-height: 1.5; }
        .profile-card { text-align: center; padding: 20px; }
        .profile-name { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 4px; }
        .profile-role { color: #6b7280; margin-bottom: 20px; }
        .profile-stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
        .stat-item { text-align: center; }
        .stat-number { font-size: 20px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .specializations { border-top: 1px solid #e5e7eb; padding-top: 16px; }
        .specialization-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px; text-align: left; }
        .tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { background: #eff6ff; color: #2563eb; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 NurseLink AI</h1>
        <p>Plateforme de missions médicales</p>
    </div>

    <div class="tab-bar">
        <button class="tab active" onclick="showTab('missions')">💼 Missions</button>
        <button class="tab" onclick="showTab('notifications')">🔔 Notifications</button>
        <button class="tab" onclick="showTab('profile')">👤 Profil</button>
    </div>

    <div class="content">
        <div id="missions-tab" class="tab-content">
            <h2 class="section-title">Missions disponibles (3)</h2>
            
            <div class="card">
                <div class="mission-header">
                    <div class="mission-title">Infirmier de nuit - CHU Lyon</div>
                    <div class="urgency-badge urgency-high">Urgent</div>
                </div>
                <div class="mission-info">📍 Lyon, 69003</div>
                <div class="mission-rate">💰 28€/h</div>
                <div class="mission-info">🕐 Début: 2025-01-15</div>
                <div class="mission-description">Mission de remplacement en service des urgences pour équipe de nuit.</div>
                <button class="apply-button" onclick="applyToMission('CHU Lyon')">Postuler</button>
            </div>

            <div class="card">
                <div class="mission-header">
                    <div class="mission-title">Infirmier urgences - Villeurbanne</div>
                    <div class="urgency-badge urgency-medium">Modéré</div>
                </div>
                <div class="mission-info">📍 Villeurbanne, 69100</div>
                <div class="mission-rate">💰 25€/h</div>
                <div class="mission-info">🕐 Début: 2025-01-18</div>
                <div class="mission-description">Renfort d'équipe pour service d'urgences pédiatriques.</div>
                <button class="apply-button" onclick="applyToMission('Villeurbanne')">Postuler</button>
            </div>

            <div class="card">
                <div class="mission-header">
                    <div class="mission-title">Infirmier réanimation - Hôpital Lyon Sud</div>
                    <div class="urgency-badge urgency-high">Urgent</div>
                </div>
                <div class="mission-info">📍 Pierre-Bénite, 69310</div>
                <div class="mission-rate">💰 30€/h</div>
                <div class="mission-info">🕐 Début: 2025-01-20</div>
                <div class="mission-description">Mission en réanimation médicale, expérience requise.</div>
                <button class="apply-button" onclick="applyToMission('Lyon Sud')">Postuler</button>
            </div>
        </div>

        <div id="notifications-tab" class="tab-content hidden">
            <h2 class="section-title">Notifications (2)</h2>
            
            <div class="card notification-card notification-success">
                <div class="notification-header">
                    <div class="notification-title">Candidature acceptée</div>
                    <div class="notification-time">Il y a 2h</div>
                </div>
                <div class="notification-message">Votre candidature pour la mission CHU Lyon a été acceptée !</div>
            </div>

            <div class="card notification-card notification-info">
                <div class="notification-header">
                    <div class="notification-title">Nouvelle mission</div>
                    <div class="notification-time">Il y a 4h</div>
                </div>
                <div class="notification-message">Une mission correspondant à votre profil est disponible à Villeurbanne</div>
            </div>
        </div>

        <div id="profile-tab" class="tab-content hidden">
            <h2 class="section-title">Mon Profil</h2>
            
            <div class="card profile-card">
                <div class="profile-name">Marie Dupont</div>
                <div class="profile-role">Infirmière Diplômée d'État</div>
                
                <div class="profile-stats">
                    <div class="stat-item">
                        <div class="stat-number">42</div>
                        <div class="stat-label">Missions</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">4.8/5</div>
                        <div class="stat-label">Note</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">5 ans</div>
                        <div class="stat-label">Expérience</div>
                    </div>
                </div>
                
                <div class="specializations">
                    <div class="specialization-title">Spécialisations:</div>
                    <div class="tags">
                        <div class="tag">Urgences</div>
                        <div class="tag">Réanimation</div>
                        <div class="tag">Soins intensifs</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.add('hidden');
            });
            
            document.querySelectorAll('.tab').forEach(button => {
                button.classList.remove('active');
            });
            
            document.getElementById(tabName + '-tab').classList.remove('hidden');
            event.target.classList.add('active');
        }

        function applyToMission(missionName) {
            if (confirm('Voulez-vous postuler pour la mission ' + missionName + ' ?')) {
                alert('Candidature envoyée avec succès !');
            }
        }
    </script>
</body>
</html>`);
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get profile based on role
      let profile = null;
      if (user.role === 'nurse') {
        profile = await storage.getNurseProfile(userId);
      } else if (user.role === 'establishment') {
        profile = await storage.getEstablishmentProfile(userId);
      }
      
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // CGU/CGV acceptance
  app.post('/api/auth/accept-cgu', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!role || !['nurse', 'establishment'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.acceptCGU(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error accepting CGU:", error);
      res.status(500).json({ message: "Failed to accept CGU" });
    }
  });

  // Nurse profile routes
  app.post('/api/nurse/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertNurseProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const profile = await storage.createOrUpdateNurseProfile(validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating nurse profile:", error);
      res.status(500).json({ message: "Failed to create nurse profile" });
    }
  });

  app.get('/api/nurse/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getNurseProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching nurse profile:", error);
      res.status(500).json({ message: "Failed to fetch nurse profile" });
    }
  });

  // Establishment profile routes
  app.post('/api/establishment/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEstablishmentProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const profile = await storage.createOrUpdateEstablishmentProfile(validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating establishment profile:", error);
      res.status(500).json({ message: "Failed to create establishment profile" });
    }
  });

  app.get('/api/establishment/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getEstablishmentProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching establishment profile:", error);
      res.status(500).json({ message: "Failed to fetch establishment profile" });
    }
  });

  // Demo mission route (without auth for testing)
  app.post('/api/demo/missions', async (req: any, res) => {
    try {
      // Use the existing CHU SUD Lyon establishment (ID 1)
      const establishmentId = 1;

      const validatedData = insertMissionSchema.parse({
        ...req.body,
        establishmentId: establishmentId
      });
      
      const mission = await storage.createMission(validatedData);
      
      // Trigger AI matching in background
      matchNursesToMission(mission.id).catch(console.error);
      
      res.json(mission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error details:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating demo mission:", error);
      res.status(500).json({ message: "Failed to create mission" });
    }
  });

  // Get all missions for demo
  app.get('/api/demo/missions', async (req: any, res) => {
    try {
      const allMissions = await storage.getMissionsForEstablishment(1);
      res.json(allMissions);
    } catch (error) {
      console.error("Error fetching demo missions:", error);
      res.status(500).json({ message: "Failed to fetch missions" });
    }
  });

  // Mission routes
  app.post('/api/missions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const establishment = await storage.getEstablishmentProfile(userId);
      
      if (!establishment) {
        return res.status(403).json({ message: "Only establishments can create missions" });
      }

      const validatedData = insertMissionSchema.parse({
        ...req.body,
        establishmentId: establishment.id
      });
      
      const mission = await storage.createMission(validatedData);
      
      // Trigger AI matching in background
      matchNursesToMission(mission.id).catch(console.error);
      
      res.json(mission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating mission:", error);
      res.status(500).json({ message: "Failed to create mission" });
    }
  });



  // Test mission publish route for demo
  app.post('/api/missions/publish', async (req: any, res) => {
    try {
      // Simulate mission creation for demo
      const missionData = req.body;
      const mockMission = {
        id: Math.floor(Math.random() * 1000) + 1,
        ...missionData,
        createdAt: new Date().toISOString(),
        status: 'published'
      };

      console.log('Mission de test créée:', mockMission);
      
      // Simulate automatic matching trigger
      setTimeout(async () => {
        try {
          await matchingService.matchNursesToMission(mockMission.id, {
            maxDistance: missionData.maxDistance || 50,
            minExperience: missionData.requiredExperience || 0,
            requiredSpecializations: [missionData.specialization],
            minRating: 3.0,
            maxCandidates: missionData.maxCandidates || 15
          });
        } catch (err) {
          console.error('Erreur matching simulé:', err);
        }
      }, 100);
      
      res.json(mockMission);
    } catch (error) {
      console.error("Erreur publication mission test:", error);
      res.status(500).json({ message: "Erreur lors de la publication" });
    }
  });

  app.get('/api/missions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let missions;
      if (user?.role === 'nurse') {
        const nurse = await storage.getNurseProfile(userId);
        if (nurse) {
          missions = await storage.getMissionsForNurse(nurse.id);
        }
      } else if (user?.role === 'establishment') {
        const establishment = await storage.getEstablishmentProfile(userId);
        if (establishment) {
          missions = await storage.getMissionsForEstablishment(establishment.id);
        }
      }
      
      res.json(missions || []);
    } catch (error) {
      console.error("Error fetching missions:", error);
      res.status(500).json({ message: "Failed to fetch missions" });
    }
  });

  app.get('/api/missions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const missionId = parseInt(req.params.id);
      const mission = await storage.getMission(missionId);
      
      if (!mission) {
        return res.status(404).json({ message: "Mission not found" });
      }
      
      res.json(mission);
    } catch (error) {
      console.error("Error fetching mission:", error);
      res.status(500).json({ message: "Failed to fetch mission" });
    }
  });

  // Mission application routes
  app.post('/api/missions/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const nurse = await storage.getNurseProfile(userId);
      
      if (!nurse) {
        return res.status(403).json({ message: "Only nurses can apply to missions" });
      }

      const missionId = parseInt(req.params.id);
      const applicationData = insertMissionApplicationSchema.parse({
        missionId,
        nurseId: nurse.id
      });
      
      const application = await storage.createMissionApplication(applicationData);
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error applying to mission:", error);
      res.status(500).json({ message: "Failed to apply to mission" });
    }
  });

  app.post('/api/missions/:id/applications/:applicationId/respond', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const establishment = await storage.getEstablishmentProfile(userId);
      
      if (!establishment) {
        return res.status(403).json({ message: "Only establishments can respond to applications" });
      }

      const applicationId = parseInt(req.params.applicationId);
      const { status } = req.body;
      
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const application = await storage.updateMissionApplicationStatus(applicationId, status);
      
      // If accepted, update mission status and notify other applicants
      if (status === 'accepted' && application) {
        await storage.updateMissionStatus(application.missionId, 'accepted');
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error responding to application:", error);
      res.status(500).json({ message: "Failed to respond to application" });
    }
  });

  // Dashboard and analytics routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let stats;
      if (user?.role === 'establishment') {
        const establishment = await storage.getEstablishmentProfile(userId);
        if (establishment) {
          stats = await storage.getEstablishmentStats(establishment.id);
        }
      } else if (user?.role === 'nurse') {
        const nurse = await storage.getNurseProfile(userId);
        if (nurse) {
          stats = await storage.getNurseStats(nurse.id);
        }
      }
      
      res.json(stats || {});
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // AI-powered absence forecasts for establishments
  app.get('/api/dashboard/forecasts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const establishment = await storage.getEstablishmentProfile(userId);
      
      if (!establishment) {
        return res.status(403).json({ message: "Only establishments can access forecasts" });
      }
      
      const forecasts = await storage.getAbsenceForecasts(establishment.id);
      res.json(forecasts);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      res.status(500).json({ message: "Failed to fetch forecasts" });
    }
  });

  // Trigger AI forecast generation
  app.post('/api/dashboard/generate-forecasts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const establishment = await storage.getEstablishmentProfile(userId);
      
      if (!establishment) {
        return res.status(403).json({ message: "Only establishments can generate forecasts" });
      }
      
      // Generate forecasts using AI
      await generateAbsenceForecasts(establishment.id);
      
      res.json({ message: "Forecasts generation started" });
    } catch (error) {
      console.error("Error generating forecasts:", error);
      res.status(500).json({ message: "Failed to generate forecasts" });
    }
  });

  // AI Matching Test Scenario
  app.post('/api/test/create-matching-scenario', async (req, res) => {
    try {
      console.log("🚀 Création du scénario de test IA...");
      
      // Créer 5 profils d'infirmiers avec différentes spécialisations
      const testNurses = [
        {
          id: "test-nurse-1",
          firstName: "Marie",
          lastName: "Dupont",
          email: "marie.dupont@test.com",
          specializations: ["urgences", "pediatrie"],
          experience: 5,
          rating: 4.8,
          location: { lat: 45.7640, lng: 4.8357 }, // Lyon centre
          certifications: ["BLS", "PALS"],
          availability: true
        },
        {
          id: "test-nurse-2", 
          firstName: "Pierre",
          lastName: "Martin",
          email: "pierre.martin@test.com",
          specializations: ["cardiologie", "soins_intensifs"],
          experience: 8,
          rating: 4.9,
          location: { lat: 45.7489, lng: 4.8467 }, // Lyon 3ème
          certifications: ["ACLS", "BLS"],
          availability: true
        },
        {
          id: "test-nurse-3",
          firstName: "Sophie",
          lastName: "Bernard",
          email: "sophie.bernard@test.com", 
          specializations: ["urgences", "traumatologie"],
          experience: 3,
          rating: 4.6,
          location: { lat: 45.7578, lng: 4.8320 }, // Lyon 1er
          certifications: ["BLS", "ATLS"],
          availability: true
        },
        {
          id: "test-nurse-4",
          firstName: "Lucas",
          lastName: "Moreau",
          email: "lucas.moreau@test.com",
          specializations: ["pediatrie", "neonatologie"],
          experience: 6,
          rating: 4.7,
          location: { lat: 45.7797, lng: 4.8252 }, // Lyon 4ème
          certifications: ["NRP", "PALS"],
          availability: true
        },
        {
          id: "test-nurse-5",
          firstName: "Emma",
          lastName: "Leroy",
          email: "emma.leroy@test.com",
          specializations: ["geriatrie", "soins_palliatifs"],
          experience: 4,
          rating: 4.5,
          location: { lat: 45.7311, lng: 4.8667 }, // Lyon 7ème
          certifications: ["BLS"],
          availability: true
        }
      ];

      // Créer une mission urgente pour tester le matching
      const testMission = {
        id: "test-mission-ai",
        title: "Infirmier(ère) Urgences - CHU Lyon",
        establishmentName: "CHU Lyon Sud",
        department: "Service des Urgences",
        specializations: ["urgences", "traumatologie"],
        requiredCertifications: ["BLS"],
        preferredCertifications: ["ATLS"],
        location: { lat: 45.7640, lng: 4.8357 },
        address: "165 Chemin du Grand Revoyet, 69310 Pierre-Bénite",
        shift: "nuit",
        startDate: "2024-02-01",
        endDate: "2024-02-01", 
        startTime: "20:00",
        endTime: "08:00",
        hourlyRate: 28,
        urgencyLevel: "high",
        description: "Recherche infirmier(ère) expérimenté(e) pour service d'urgences. Mission de nuit avec forte affluence prévue.",
        requirements: [
          "Minimum 3 ans d'expérience en urgences",
          "Certification BLS obligatoire", 
          "Autonomie et gestion du stress"
        ],
        status: "open"
      };

      // Stocker en variable globale pour les tests
      if (!global.testScenarios) {
        global.testScenarios = {};
      }
      
      global.testScenarios.matching = {
        nurses: testNurses,
        mission: testMission,
        applications: [],
        matchingResults: null,
        notifications: []
      };

      console.log("✅ Scénario créé avec 5 infirmiers et 1 mission");
      
      res.json({
        success: true,
        message: "Scénario de test créé avec succès",
        data: {
          nursesCount: testNurses.length,
          mission: testMission,
          nurses: testNurses.map(n => ({
            id: n.id,
            name: `${n.firstName} ${n.lastName}`,
            specializations: n.specializations,
            rating: n.rating,
            experience: n.experience
          }))
        }
      });
    } catch (error) {
      console.error("❌ Erreur création scénario:", error);
      res.status(500).json({ error: "Erreur lors de la création du scénario" });
    }
  });

  // Déclencher le matching IA
  app.post('/api/test/trigger-ai-matching', async (req, res) => {
    try {
      if (!global.testScenarios?.matching) {
        return res.status(400).json({ error: "Aucun scénario de test trouvé. Créez d'abord un scénario." });
      }

      const { mission, nurses } = global.testScenarios.matching;
      
      console.log("🤖 Déclenchement du matching IA...");
      
      // Utiliser l'API OpenAI pour calculer les scores de matching
      const matchingResults = await matchNursesToMission(mission.id);
      
      // Simuler les résultats de matching avec scores
      const mockResults = nurses.map((nurse: any) => {
        let score = 0;
        let factors: string[] = [];
        
        // Score basé sur la spécialisation
        const hasRequiredSpec = nurse.specializations.some((spec: string) => 
          mission.specializations.includes(spec)
        );
        if (hasRequiredSpec) {
          score += 40;
          factors.push("Spécialisation correspondante");
        }
        
        // Score basé sur l'expérience
        if (nurse.experience >= 3) {
          score += 20;
          factors.push("Expérience suffisante");
        }
        
        // Score basé sur les certifications
        const hasBLS = nurse.certifications.includes("BLS");
        if (hasBLS) {
          score += 15;
          factors.push("Certification BLS");
        }
        
        // Score basé sur la note
        score += nurse.rating * 5;
        factors.push(`Note excellente (${nurse.rating}/5)`);
        
        // Score basé sur la géolocalisation (distance)
        const distance = Math.sqrt(
          Math.pow(nurse.location.lat - mission.location.lat, 2) +
          Math.pow(nurse.location.lng - mission.location.lng, 2)
        ) * 111; // Approximation en km
        
        if (distance < 5) {
          score += 15;
          factors.push("Proximité géographique");
        } else if (distance < 10) {
          score += 10;
          factors.push("Distance acceptable");
        }
        
        return {
          nurseId: nurse.id,
          nurseName: `${nurse.firstName} ${nurse.lastName}`,
          score: Math.min(100, Math.round(score)),
          factors,
          distance: Math.round(distance * 10) / 10,
          recommended: score >= 70
        };
      }).sort((a: any, b: any) => b.score - a.score);

      // Stocker les résultats
      global.testScenarios.matching.matchingResults = mockResults;
      
      // Créer des notifications pour les 3 meilleurs candidats
      const topCandidates = mockResults.slice(0, 3);
      const notifications = topCandidates.map((candidate: any) => ({
        nurseId: candidate.nurseId,
        nurseName: candidate.nurseName,
        missionId: mission.id,
        missionTitle: mission.title,
        score: candidate.score,
        status: "sent",
        sentAt: new Date().toISOString()
      }));
      
      global.testScenarios.matching.notifications = notifications;
      
      console.log("✅ Matching terminé:", mockResults.length, "candidats analysés");
      
      res.json({
        success: true,
        message: "Matching IA terminé avec succès",
        results: mockResults,
        notifications: notifications,
        topCandidates: topCandidates.length
      });
    } catch (error) {
      console.error("❌ Erreur matching IA:", error);
      res.status(500).json({ error: "Erreur lors du matching IA" });
    }
  });

  // Simuler les réponses des infirmiers (3 acceptent, 2 refusent)
  app.post('/api/test/simulate-nurse-responses', async (req, res) => {
    try {
      if (!global.testScenarios?.matching?.notifications) {
        return res.status(400).json({ error: "Aucune notification trouvée" });
      }

      const notifications = global.testScenarios.matching.notifications;
      
      // Simuler les réponses : les 3 premiers acceptent (scores les plus élevés)
      const responses = notifications.map((notif: any, index: number) => {
        const accepted = index < 3; // Les 3 premiers acceptent
        return {
          nurseId: notif.nurseId,
          nurseName: notif.nurseName,
          missionId: notif.missionId,
          response: accepted ? "accepted" : "declined",
          respondedAt: new Date().toISOString(),
          reason: accepted ? null : index === 3 ? "Déjà pris" : "Non disponible"
        };
      });

      global.testScenarios.matching.applications = responses;
      
      console.log("✅ Réponses simulées:", responses.filter((r: any) => r.response === "accepted").length, "acceptations");
      
      res.json({
        success: true,
        message: "Réponses des infirmiers simulées",
        responses,
        accepted: responses.filter((r: any) => r.response === "accepted").length,
        declined: responses.filter((r: any) => r.response === "declined").length
      });
    } catch (error) {
      console.error("❌ Erreur simulation réponses:", error);
      res.status(500).json({ error: "Erreur lors de la simulation" });
    }
  });

  // Récupérer le statut du scénario de test
  app.get('/api/test/matching-scenario-status', async (req, res) => {
    try {
      const scenario = global.testScenarios?.matching;
      
      if (!scenario) {
        return res.json({ exists: false });
      }
      
      res.json({
        exists: true,
        mission: scenario.mission,
        nurses: scenario.nurses,
        matchingResults: scenario.matchingResults,
        notifications: scenario.notifications,
        applications: scenario.applications,
        status: {
          scenarioCreated: !!scenario.mission,
          matchingCompleted: !!scenario.matchingResults,
          notificationsSent: scenario.notifications?.length > 0,
          responsesReceived: scenario.applications?.length > 0
        }
      });
    } catch (error) {
      console.error("❌ Erreur récupération statut:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du statut" });
    }
  });

  // API pour la connexion avec les utilisateurs de test
  app.post('/api/test/login/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Définir les utilisateurs de test
      const testUsers = {
        'nurse-1': {
          id: 'nurse-1',
          email: 'sophie.martin@infirmiere.fr',
          firstName: 'Sophie',
          lastName: 'Martin',
          role: 'nurse',
          cguAccepted: true,
          profile: {
            specializations: ['Urgences', 'Cardiologie'],
            certifications: ['BLS', 'ATLS'],
            experience: 5,
            rating: 4.8,
            availability: true
          }
        },
        'nurse-2': {
          id: 'nurse-2',
          email: 'marie.leroy@infirmiere.fr', 
          firstName: 'Marie',
          lastName: 'Leroy',
          role: 'nurse',
          cguAccepted: true,
          profile: {
            specializations: ['Chirurgie', 'Traumatologie'],
            certifications: ['BLS', 'ATLS', 'ACLS'],
            experience: 7,
            rating: 4.9,
            availability: true
          }
        },
        'nurse-3': {
          id: 'nurse-3',
          email: 'thomas.dubois@infirmier.fr',
          firstName: 'Thomas', 
          lastName: 'Dubois',
          role: 'nurse',
          cguAccepted: true,
          profile: {
            specializations: ['Réanimation', 'Soins intensifs'],
            certifications: ['BLS', 'ACLS', 'PALS'],
            experience: 3,
            rating: 4.5,
            availability: true
          }
        },
        'nurse-4': {
          id: 'nurse-4',
          email: 'camille.rousseau@infirmiere.fr',
          firstName: 'Camille',
          lastName: 'Rousseau', 
          role: 'nurse',
          cguAccepted: true,
          profile: {
            specializations: ['Pédiatrie', 'Néonatologie'],
            certifications: ['BLS', 'PALS', 'NRP'],
            experience: 6,
            rating: 4.7,
            availability: true
          }
        },
        'nurse-5': {
          id: 'nurse-5',
          email: 'antoine.moreau@infirmier.fr',
          firstName: 'Antoine',
          lastName: 'Moreau',
          role: 'nurse', 
          cguAccepted: true,
          profile: {
            specializations: ['Bloc opératoire', 'Anesthésie'],
            certifications: ['BLS', 'ACLS'],
            experience: 4,
            rating: 4.6,
            availability: true
          }
        },
        'establishment-1': {
          id: 'establishment-1',
          email: 'hopital@chu-lyon.fr',
          firstName: 'CHU',
          lastName: 'Lyon Sud',
          role: 'establishment',
          cguAccepted: true,
          profile: {
            name: 'CHU Lyon Sud',
            type: 'Hôpital Universitaire',
            address: '165 Chemin du Grand Revoyet, 69310 Pierre-Bénite',
            siret: '26690045300017'
          }
        }
      };

      const userData = testUsers[userId as keyof typeof testUsers];
      if (!userData) {
        return res.status(404).json({ message: "Utilisateur de test non trouvé" });
      }

      // Créer ou mettre à jour l'utilisateur
      await storage.upsertUser({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role as "nurse" | "establishment",
        cguAccepted: userData.cguAccepted
      });

      // Créer le profil selon le rôle
      if (userData.role === 'nurse' && userData.profile) {
        const nurseProfile = userData.profile as NurseProfileData;
        await storage.createOrUpdateNurseProfile({
          userId: userData.id,
          specializations: nurseProfile.specializations,
          experience: nurseProfile.experience,
          availability: {} // Utiliser un objet vide par défaut
        });
      } else if (userData.role === 'establishment' && userData.profile) {
        const establishmentProfile = userData.profile as EstablishmentProfileData;
        await storage.createOrUpdateEstablishmentProfile({
          userId: userData.id,
          name: establishmentProfile.name,
          type: establishmentProfile.type,
          address: establishmentProfile.address,
          city: "Paris", // Valeur par défaut
          postalCode: "75000" // Valeur par défaut
        });
      }

      // Créer une session compatible avec le système d'authentification
      const sessionData = {
        claims: { sub: userData.id },
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };

      // Stocker dans la session
      req.session.passport = { user: sessionData };
      req.user = sessionData;

      // Sauvegarder la session avant de répondre
      req.session.save((err: any) => {
        if (err) {
          console.error("Erreur sauvegarde session:", err);
          return res.status(500).json({ message: "Erreur lors de la connexion" });
        }
        res.json({ success: true, user: userData });
      });
    } catch (error) {
      console.error("Erreur connexion utilisateur test:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  // Routes pour la création de profils
  app.post('/api/profiles/nurse', async (req, res) => {
    try {
      console.log("Creating nurse profile with data:", req.body);
      const profileData = req.body;
      
      // Créer l'utilisateur dans la table users
      const userData = {
        id: `nurse-${Date.now()}`,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: 'nurse' as const,
        cguAccepted: true,
        profileImageUrl: null,
      };
      
      console.log("Creating user with data:", userData);
      const user = await storage.upsertUser(userData);
      console.log("User created:", user);
      
      // Créer le profil infirmier
      const nurseProfileData = {
        userId: user.id,
        specialization: profileData.specialization,
        experience: profileData.experience,
        certifications: profileData.certifications,
        availableShifts: profileData.availableShifts,
        hourlyRate: profileData.hourlyRate,
        location: profileData.location,
        phone: profileData.phone,
        documentsVerified: false,
        available: true,
      };
      
      console.log("Creating nurse profile with data:", nurseProfileData);
      const profile = await storage.createOrUpdateNurseProfile(nurseProfileData);
      console.log("Nurse profile created:", profile);
      
      res.json({ success: true, user, profile });
    } catch (error: any) {
      console.error("Error creating nurse profile:", error);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ message: "Failed to create nurse profile", error: error?.message });
    }
  });

  app.post('/api/profiles/establishment', async (req, res) => {
    try {
      const profileData = req.body;
      
      // Créer l'utilisateur dans la table users
      const userData = {
        id: `establishment-${Date.now()}`,
        email: profileData.email,
        firstName: profileData.contactPerson.split(' ')[0] || 'Contact',
        lastName: profileData.contactPerson.split(' ')[1] || 'Person',
        role: 'establishment' as const,
        cguAccepted: true,
        profileImageUrl: null,
      };
      
      const user = await storage.upsertUser(userData);
      
      // Créer le profil établissement
      const establishmentProfileData = {
        userId: user.id,
        name: profileData.name,
        type: profileData.type,
        address: profileData.address,
        city: "Paris", // Valeur par défaut
        postalCode: "75000", // Valeur par défaut
        phone: profileData.phone,
      };
      
      const profile = await storage.createOrUpdateEstablishmentProfile(establishmentProfileData);
      
      res.json({ success: true, user, profile });
    } catch (error: any) {
      console.error("Error creating establishment profile:", error);
      res.status(500).json({ message: "Failed to create establishment profile" });
    }
  });

  app.get('/api/profiles', async (req, res) => {
    try {
      // Récupérer tous les profils depuis la base de données via storage
      const nurses = await storage.getAvailableNurses();
      const establishments: any[] = []; // Pour l'instant on récupère via une méthode manuelle
      
      res.json({ nurses, establishments });
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Stockage en mémoire des réponses aux missions
  const missionResponses = new Map();

  // Route pour accepter une mission
  app.post("/api/missions/:id/accept", async (req, res) => {
    try {
      const missionId = parseInt(req.params.id);
      const { nurseId } = req.body;

      if (!missionId || !nurseId) {
        return res.status(400).json({ message: "Mission ID and Nurse ID are required" });
      }

      // Stocker la réponse
      const key = `${missionId}-${nurseId}`;
      missionResponses.set(key, {
        missionId,
        nurseId,
        status: "accepted",
        timestamp: new Date().toISOString()
      });

      console.log(`Mission ${missionId} acceptée par l'infirmier ${nurseId}`);
      
      res.json({ 
        success: true, 
        message: "Mission acceptée avec succès",
        missionId,
        nurseId,
        status: "accepted"
      });
    } catch (error) {
      console.error("Error accepting mission:", error);
      res.status(500).json({ message: "Failed to accept mission" });
    }
  });

  // Route pour refuser une mission
  app.post("/api/missions/:id/refuse", async (req, res) => {
    try {
      const missionId = parseInt(req.params.id);
      const { nurseId } = req.body;

      if (!missionId || !nurseId) {
        return res.status(400).json({ message: "Mission ID and Nurse ID are required" });
      }

      // Stocker la réponse
      const key = `${missionId}-${nurseId}`;
      missionResponses.set(key, {
        missionId,
        nurseId,
        status: "refused",
        timestamp: new Date().toISOString()
      });

      console.log(`Mission ${missionId} refusée par l'infirmier ${nurseId}`);
      
      res.json({ 
        success: true, 
        message: "Mission refusée",
        missionId,
        nurseId,
        status: "refused"
      });
    } catch (error) {
      console.error("Error refusing mission:", error);
      res.status(500).json({ message: "Failed to refuse mission" });
    }
  });

  // Route pour récupérer les réponses aux missions
  app.get("/api/missions/responses", async (req, res) => {
    try {
      const responses = Array.from(missionResponses.values());
      res.json(responses);
    } catch (error) {
      console.error("Error fetching mission responses:", error);
      res.status(500).json({ message: "Failed to fetch mission responses" });
    }
  });

  // Demo mobile direct route
  app.get('/demo-mobile', (req, res) => {
    const mobileHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NurseLink AI - Demo Mobile</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .mobile-container { max-width: 375px; margin: 0 auto; min-height: 100vh; }
        .tab-active { background-color: #059669; color: white; }
        .tab-inactive { background-color: #f3f4f6; color: #6b7280; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="mobile-container bg-white shadow-lg">
        <div class="bg-green-600 text-white p-4">
            <h1 class="text-lg font-bold">NurseLink AI</h1>
            <p class="text-green-100 text-sm">Demo Mobile</p>
        </div>
        <div id="content" class="p-4 pb-20">
            <div id="missions-content">
                <h2 class="text-xl font-bold mb-4">Missions Disponibles</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-gray-900">Infirmier de nuit - CHU Lyon</h3>
                        <span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Urgent</span>
                    </div>
                    <p class="text-gray-600 text-sm mb-2">Lyon, 69003 • Urgences</p>
                    <p class="text-gray-700 text-sm mb-3">Mission de remplacement en service des urgences pour équipe de nuit.</p>
                    <div class="flex justify-between items-center">
                        <span class="text-green-600 font-bold">28€/h</span>
                        <button onclick="applyToMission(1)" class="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                            Postuler
                        </button>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-gray-900">Infirmier urgences - Villeurbanne</h3>
                        <span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Modéré</span>
                    </div>
                    <p class="text-gray-600 text-sm mb-2">Villeurbanne, 69100 • Pédiatrie</p>
                    <p class="text-gray-700 text-sm mb-3">Renfort d'équipe pour service d'urgences pédiatriques.</p>
                    <div class="flex justify-between items-center">
                        <span class="text-green-600 font-bold">25€/h</span>
                        <button onclick="applyToMission(2)" class="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                            Postuler
                        </button>
                    </div>
                </div>
            </div>
            <div id="notifications-content" class="hidden">
                <h2 class="text-xl font-bold mb-4">Notifications</h2>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-3">
                    <p class="text-sm text-blue-700"><strong>Nouvelle mission disponible</strong><br>CHU Lyon recherche un infirmier de nuit</p>
                    <p class="text-xs text-blue-600 mt-1">Il y a 5 minutes</p>
                </div>
                <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-3">
                    <p class="text-sm text-green-700"><strong>Candidature acceptée</strong><br>Votre candidature pour la mission Hôpital Édouard Herriot a été acceptée</p>
                    <p class="text-xs text-green-600 mt-1">Il y a 2 heures</p>
                </div>
            </div>
            <div id="profile-content" class="hidden">
                <h2 class="text-xl font-bold mb-4">Mon Profil</h2>
                <div class="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white mb-6">
                    <div class="flex items-center">
                        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">MJ</div>
                        <div class="ml-4">
                            <h3 class="text-lg font-bold">Marie Joubert</h3>
                            <p class="text-green-100">Infirmière diplômée d'État</p>
                            <div class="flex items-center mt-1">
                                <span class="text-yellow-300">★★★★★</span>
                                <span class="ml-2 text-sm">4.9/5</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-white p-4 rounded-lg border">
                        <div class="text-2xl font-bold text-green-600">127</div>
                        <div class="text-sm text-gray-600">Missions réalisées</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg border">
                        <div class="text-2xl font-bold text-blue-600">15,420€</div>
                        <div class="text-sm text-gray-600">Gains totaux</div>
                    </div>
                </div>
                <div class="mb-6">
                    <h4 class="font-semibold mb-3">Certifications</h4>
                    <div class="flex flex-wrap gap-2">
                        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Urgences</span>
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Pédiatrie</span>
                        <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Soins intensifs</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
            <div class="flex">
                <button onclick="showTab('missions')" id="tab-missions" class="flex-1 py-3 px-4 text-center text-sm font-medium tab-active">Missions</button>
                <button onclick="showTab('notifications')" id="tab-notifications" class="flex-1 py-3 px-4 text-center text-sm font-medium tab-inactive">Notifications</button>
                <button onclick="showTab('profile')" id="tab-profile" class="flex-1 py-3 px-4 text-center text-sm font-medium tab-inactive">Profil</button>
            </div>
        </div>
    </div>
    <script>
        function showTab(tabName) {
            document.getElementById('missions-content').classList.add('hidden');
            document.getElementById('notifications-content').classList.add('hidden');
            document.getElementById('profile-content').classList.add('hidden');
            document.getElementById(tabName + '-content').classList.remove('hidden');
            const tabs = ['missions', 'notifications', 'profile'];
            tabs.forEach(tab => {
                const tabElement = document.getElementById('tab-' + tab);
                if (tab === tabName) {
                    tabElement.className = 'flex-1 py-3 px-4 text-center text-sm font-medium tab-active';
                } else {
                    tabElement.className = 'flex-1 py-3 px-4 text-center text-sm font-medium tab-inactive';
                }
            });
        }
        function applyToMission(missionId) {
            alert('Candidature envoyée pour la mission ' + missionId + ' !\\n\\nVous recevrez une notification dès que l\\'établissement aura examiné votre candidature.');
        }
        showTab('missions');
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(mobileHTML);
  });

  const httpServer = createServer(app);
  return httpServer;
}
