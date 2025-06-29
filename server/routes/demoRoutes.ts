/**
 * ==============================================================================
 * NurseLink AI - Routes Demo (Development Only)
 * ==============================================================================
 * 
 * Routes spécialement créées pour les tests et le développement
 * Ces endpoints n'exigent pas d'authentification pour faciliter les tests
 * 
 * IMPORTANT: Ces routes ne doivent PAS être utilisées en production
 * ==============================================================================
 */

import type { Express } from "express";

/**
 * Interface pour les données de mission demo
 */
interface DemoMissionData {
  title: string;
  description: string;
  service?: string;
  specializations?: string[];
  startDate?: string;
  endDate?: string;
  shift?: string;
  urgencyLevel?: string;
  hourlyRate?: number;
  address?: string;
  positionsCount?: number;
  requirements?: string[];
  benefits?: string[];
  contactInfo?: string;
}

/**
 * Enregistre les routes demo pour les tests
 */
export function registerDemoRoutes(app: Express): void {
  
  /**
   * POST /api/demo/missions/publish
   * 
   * Publication d'une mission en mode demo (sans authentification)
   * Utilisé pour tester le formulaire de création de missions
   * 
   * @param req.body - Données de la mission à publier
   * @returns Mission créée avec succès
   */
  app.post('/api/demo/missions/publish', async (req, res) => {
    try {
      console.log('🚀 [DEMO] Publication de mission appelée avec:', req.body);
      
      const missionData: DemoMissionData = req.body;
      
      // Validation basique
      if (!missionData.title || !missionData.description) {
        return res.status(400).json({
          success: false,
          message: "Titre et description sont requis",
          errors: {
            title: !missionData.title ? "Titre manquant" : null,
            description: !missionData.description ? "Description manquante" : null
          }
        });
      }
      
      // Simulation de création de mission
      const mission = {
        id: Date.now(), // ID unique basé sur timestamp
        ...missionData,
        establishmentId: 1, // ID demo pour les tests
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('✅ [DEMO] Mission publiée avec succès:', mission.id);
      
      res.json({
        success: true,
        message: "Mission publiée avec succès!",
        mission: mission
      });
      
    } catch (error: any) {
      console.error("❌ [DEMO] Erreur lors de la publication:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur interne du serveur",
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      });
    }
  });

  /**
   * GET /api/demo/missions
   * 
   * Récupération des missions demo (optionnel pour tests futurs)
   */
  app.get('/api/demo/missions', async (req, res) => {
    try {
      console.log('📋 [DEMO] Récupération des missions demo');
      
      // Missions demo statiques pour les tests
      const demoMissions = [
        {
          id: 1,
          title: "Infirmier DE - Service Urgences",
          description: "Mission temporaire en service d'urgences",
          service: "Urgences",
          status: "published",
          establishmentId: 1,
          createdAt: new Date(Date.now() - 86400000), // Hier
        },
        {
          id: 2,
          title: "Infirmier Nuit - Réanimation",
          description: "Renfort de nuit en service de réanimation",
          service: "Réanimation",
          status: "published",
          establishmentId: 1,
          createdAt: new Date(Date.now() - 172800000), // Avant-hier
        }
      ];
      
      res.json({
        success: true,
        missions: demoMissions,
        total: demoMissions.length
      });
      
    } catch (error: any) {
      console.error("❌ [DEMO] Erreur récupération missions:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de la récupération des missions"
      });
    }
  });

  /**
   * GET /api/demo/nurses
   * 
   * Récupération des profils infirmiers demo pour tests
   */
  app.get('/api/demo/nurses', async (req, res) => {
    try {
      console.log('👩‍⚕️ [DEMO] Récupération des profils infirmiers demo');
      
      const demoNurses = [
        {
          id: 1,
          firstName: "Marie",
          lastName: "Dupont",
          specializations: ["urgences", "réanimation"],
          experience: 5,
          rating: 4.8,
          availability: true,
          location: "Lyon"
        },
        {
          id: 2,
          firstName: "Jean",
          lastName: "Martin",
          specializations: ["pédiatrie", "chirurgie"],
          experience: 8,
          rating: 4.9,
          availability: true,
          location: "Paris"
        },
        {
          id: 3,
          firstName: "Sophie",
          lastName: "Bernard",
          specializations: ["gériatrie", "cardiologie"],
          experience: 12,
          rating: 4.7,
          availability: false,
          location: "Marseille"
        }
      ];
      
      res.json({
        success: true,
        nurses: demoNurses,
        total: demoNurses.length
      });
      
    } catch (error: any) {
      console.error("❌ [DEMO] Erreur récupération infirmiers:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de la récupération des infirmiers"
      });
    }
  });

  /**
   * GET /api/demo/establishments
   * 
   * Récupération des établissements demo pour tests
   */
  app.get('/api/demo/establishments', async (req, res) => {
    try {
      console.log('🏥 [DEMO] Récupération des établissements demo');
      
      const demoEstablishments = [
        {
          id: 1,
          name: "CHU Lyon Sud",
          type: "hospital",
          address: "165 Chemin du Grand Revoyet, 69495 Pierre-Bénite",
          siret: "26690487400027",
          verified: true,
          totalMissions: 45,
          rating: 4.6
        },
        {
          id: 2,
          name: "Clinique Saint-Joseph",
          type: "clinic",
          address: "26 Boulevard de Louvain, 13008 Marseille",
          siret: "78945612300019",
          verified: true,
          totalMissions: 23,
          rating: 4.3
        }
      ];
      
      res.json({
        success: true,
        establishments: demoEstablishments,
        total: demoEstablishments.length
      });
      
    } catch (error: any) {
      console.error("❌ [DEMO] Erreur récupération établissements:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de la récupération des établissements"
      });
    }
  });

  /**
   * POST /api/matching/test
   * 
   * Test du système de matching intelligent
   */
  app.post('/api/matching/test', async (req, res) => {
    try {
      console.log('🎯 [DEMO] Test matching intelligent exécuté');
      
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
      console.error("❌ [DEMO] Erreur test matching:", error);
      res.status(500).json({ 
        success: false,
        error: "Erreur lors du test de matching"
      });
    }
  });

  /**
   * POST /api/missions/publish
   * 
   * Publication de mission avec matching automatique
   */
  app.post('/api/missions/publish', async (req, res) => {
    try {
      console.log('📝 [DEMO] Publication mission avec matching automatique');
      
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

      console.log(`✅ [DEMO] Mission ${mockMission.id} publiée, ${mockMatches.length} candidats notifiés`);
      
      res.json({
        ...mockMission,
        matchingResults: mockMatches
      });

    } catch (error: any) {
      console.error("❌ [DEMO] Erreur publication mission:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de la publication"
      });
    }
  });

  /**
   * POST /api/matching/mission/:id
   * 
   * Matching pour mission spécifique
   */
  app.post('/api/matching/mission/:id', async (req, res) => {
    try {
      const missionId = parseInt(req.params.id);
      const criteria = req.body;
      
      console.log(`🎯 [DEMO] Matching pour mission ${missionId} avec critères:`, criteria);
      
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
      console.error("❌ [DEMO] Erreur matching mission:", error);
      res.status(500).json({ 
        success: false,
        error: "Erreur lors du matching"
      });
    }
  });

  console.log('✅ Routes demo enregistrées avec succès');
}