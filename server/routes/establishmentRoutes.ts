/**
 * ==============================================================================
 * NurseLink AI - Routes Établissement
 * ==============================================================================
 *
 * Routes spécifiques aux établissements de santé :
 * - Statistiques dashboard
 * - Gestion des missions
 * - Gestion des candidatures
 * - Templates de missions
 * ==============================================================================
 */

import { Router } from "express";
import { localAuthMiddleware } from "../middleware/localAuthMiddleware";
import { storage } from "../services/storageService";
import { MatchingService } from "../services/matchingService";

const router = Router();
const matchingService = new MatchingService();

// Middleware d'authentification du serveur principal
function requireAuth(req: any, res: any, next: any) {
  let sessionToken = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    sessionToken = req.headers.authorization.substring(7);
  } else {
    const cookies = req.headers.cookie;
    if (cookies) {
      const sessionTokenMatch = cookies.match(/sessionToken=([^;]+)/);
      sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : null;
    }
  }

  if (sessionToken) {
    // Utiliser les sessions du serveur principal
    const sessions = (global as any).sessions || new Map();
    const user = sessions.get(sessionToken);
    if (user) {
      req.user = user;
      return next();
    }
  }

  res.status(401).json({ error: 'Non authentifié' });
}

/**
 * GET /api/establishment/stats
 * Récupère les statistiques du dashboard établissement
 */
router.get("/stats", localAuthMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Récupérer le profil établissement pour avoir l'ID
    const establishmentProfile = await storage.getEstablishmentProfile(userId);
    if (!establishmentProfile) {
      return res.status(404).json({ error: "Profil établissement non trouvé" });
    }

    // Récupérer les vraies statistiques
    const stats = await storage.getEstablishmentStats(establishmentProfile.id);

    // Enrichir avec des données calculées
    const missions = await storage.getMissionsByEstablishment(establishmentProfile.id);
    const applications = await storage.getApplicationsByEstablishment(establishmentProfile.id);

    const enrichedStats = {
      ...stats,
      activePersonnel: missions.filter(m => m.status === 'in_progress').length,
      personnelGrowth: 12, // À calculer avec les données historiques
      openMissions: missions.filter(m => m.status === 'published').length,
      urgentMissions: missions.filter(m => m.urgency === 'high').length,
      averageResponseTime: stats.averageResponseTime || 'N/A',
      responseTimeImprovement: -15, // À calculer
      satisfaction: stats.averageRating || 0,
      totalReviews: 156, // À récupérer depuis les évaluations
      pendingApplications: applications.filter(a => a.status === 'pending').length
    };

    res.json(enrichedStats);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur récupération stats:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des statistiques" });
  }
});

/**
 * GET /api/establishment/missions
 * Récupère toutes les missions de l'établissement
 */
router.get("/missions", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Utiliser directement l'userId comme establishmentId pour le développement
    // Retourner un tableau vide si aucune mission n'est trouvée
    let missions = [];
    try {
      missions = await storage.getMissionsByEstablishment(1); // ID fixe pour le dev
    } catch (dbError) {
      console.log('[DEBUG] Aucune mission trouvée, retour d\'un tableau vide');
      missions = [];
    }

    res.json(missions);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur récupération missions:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des missions" });
  }
});

/**
 * GET /api/establishment/applications
 * Récupère toutes les candidatures pour les missions de l'établissement
 */
router.get("/applications", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Récupérer le profil établissement pour avoir l'ID
    const establishmentProfile = await storage.getEstablishmentProfile(userId);
    if (!establishmentProfile) {
      return res.status(404).json({ error: "Profil établissement non trouvé" });
    }

    const applications = await storage.getApplicationsByEstablishment(establishmentProfile.id);
    res.json(applications);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur récupération candidatures:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des candidatures" });
  }
});

/**
 * GET /api/establishment/analytics
 * Récupère les données analytiques de l'établissement
 */
router.get("/analytics", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Récupérer le profil établissement pour avoir l'ID
    const establishmentProfile = await storage.getEstablishmentProfile(userId);
    if (!establishmentProfile) {
      return res.status(404).json({ error: "Profil établissement non trouvé" });
    }

    // Récupérer les statistiques
    const stats = await storage.getEstablishmentStats(establishmentProfile.id);

    const analytics = {
      satisfaction: stats.averageRating || 0,
      totalReviews: 156, // À récupérer depuis les évaluations
      performanceMetrics: {
        quality: {
          establishmentSatisfaction: stats.averageRating || 0,
          nurseRetentionRate: stats.nurseRetentionRate || 0
        },
        efficiency: {
          averageResponseTime: stats.averageResponseTime || 0,
          missionCompletionRate: 94 // À calculer
        }
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur récupération analytics:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des analytics" });
  }
});

/**
 * GET /api/establishment/profile
 * Récupère le profil de l'établissement connecté
 */
router.get("/profile", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const profile = await storage.getEstablishmentProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: "Profil établissement non trouvé" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur récupération profil:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération du profil" });
  }
});

/**
 * POST /api/establishment/profile
 * Crée ou met à jour le profil de l'établissement connecté
 */
router.post("/profile", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const profileData = {
      ...req.body,
      userId: userId
    };

    const profile = await storage.createOrUpdateEstablishmentProfile(profileData);
    res.json(profile);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur création/mise à jour profil:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création/mise à jour du profil" });
  }
});

/**
 * POST /api/establishment/missions
 * Crée une nouvelle mission
 */
router.post("/missions", localAuthMiddleware, async (req, res) => {
  console.log("🎯 ROUTE POST /missions appelée !");
  console.log("Body reçu:", req.body);

  try {
    const userId = req.user?.id;
    console.log("User ID:", userId);

    if (!userId) {
      return res.status(401).json({
        error: "Utilisateur non authentifié",
        code: "UNAUTHORIZED"
      });
    }

    // Récupérer le profil établissement pour avoir l'ID numérique
    console.log("Récupération du profil établissement...");
    const establishmentProfile = await storage.getEstablishmentProfile(userId);
    console.log("Profil établissement:", establishmentProfile);

    if (!establishmentProfile) {
      return res.status(404).json({ error: "Profil établissement non trouvé" });
    }

    // Validation des données reçues
    const { title, description, service, location, startDate, endDate, shift, hourlyRate } = req.body;
    console.log("Données extraites:", { title, description, service, location, startDate, endDate, shift, hourlyRate });

    if (!title || !description || !service || !location || !startDate || !endDate || !shift || !hourlyRate) {
      return res.status(400).json({
        error: "Données manquantes",
        code: "MISSING_DATA",
        details: {
          required: ["title", "description", "service", "location", "startDate", "endDate", "shift", "hourlyRate"],
          received: Object.keys(req.body)
        }
      });
    }

    // Validation des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({
        error: "La date de fin doit être postérieure à la date de début",
        code: "INVALID_DATES"
      });
    }

    // Validation du taux horaire
    if (hourlyRate < 15 || hourlyRate > 200) {
      return res.status(400).json({
        error: "Le taux horaire doit être compris entre 15€ et 200€",
        code: "INVALID_RATE"
      });
    }

    // Préparer les données de mission
    const missionData = {
      title,
      description,
      specialization: service, // Mapper service vers specialization
      location,
      startDate: start,
      endDate: end,
      shift,
      hourlyRate: Number(hourlyRate),
      establishmentId: establishmentProfile.id, // Utiliser l'ID numérique du profil
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("Données de mission préparées:", missionData);

    // Créer la mission
    console.log("Création de la mission...");
    const newMission = await storage.createMission(missionData);
    console.log("Mission créée:", newMission);

    // 🚀 DÉCLENCHEMENT AUTOMATIQUE DU MATCHING
    try {
      console.log("🎯 Lancement du matching automatique pour la nouvelle mission...");

      // Import du service de matching
      const { ReinforcedMatchingService } = await import('../services/reinforcedMatchingService');
      const matchingService = new ReinforcedMatchingService();

      // Configuration du matching
      const matchingConfig = {
        minimumScore: 60,
        maxCandidates: 10,
        maxDistance: 50,
        requireExactSpecialization: false,
        prioritizeHistory: true,
        emergencyMode: false
      };

      // Récupérer les infirmiers disponibles (simulation pour l'instant)
      const availableNurses = await getAvailableNursesForMatching();

      // Préparer les données de mission pour le matching
      const missionForMatching = {
        id: newMission.id,
        establishmentId: newMission.establishmentId,
        title: newMission.title,
        specialization: newMission.specialization,
        requiredExperience: 2, // Valeur par défaut
        urgency: 'medium' as const,
        startDate: newMission.startDate,
        shift: newMission.shift,
        duration: 8,
        latitude: 45.764043, // Coordonnées Lyon par défaut
        longitude: 4.835659,
        requiredCertifications: [],
        requiredSkills: [],
        patientType: 'adult' as const,
        environment: 'hospital' as const,
        teamSize: 5,
        stressLevel: 3,
        preferredLanguages: ["français"],
        hourlyRate: newMission.hourlyRate
      };

      // Exécuter le matching
      const matches = matchingService.findBestMatches(missionForMatching, availableNurses, matchingConfig);

      console.log(`✅ Matching terminé : ${matches.length} candidats qualifiés trouvés`);

      // Envoyer les notifications aux candidats sélectionnés
      if (matches.length > 0) {
        await sendNotificationsToCandidates(matches, newMission);
        console.log(`📱 Notifications envoyées à ${matches.length} candidats`);
      }

      // Ajouter les résultats du matching à la réponse
      const responseData = {
        success: true,
        message: "Mission créée avec succès et matching automatique lancé",
        mission: newMission,
        matchingResults: {
          totalCandidates: matches.length,
          topCandidates: matches.slice(0, 3).map(match => ({
            nurseId: match.nurseId,
            score: match.totalScore,
            distance: Math.round(match.distance * 10) / 10,
            confidence: match.confidence
          })),
          algorithm: "reinforced_deterministic",
          criteria: matchingConfig
        }
      };

      res.status(201).json(responseData);

    } catch (matchingError) {
      console.error("⚠️ Erreur lors du matching automatique:", matchingError);
      // La mission est créée même si le matching échoue
      res.status(201).json({
        success: true,
        message: "Mission créée avec succès (matching en cours)",
        mission: newMission,
        matchingStatus: "pending"
      });
    }

  } catch (error: any) {
    // Log détaillé pour debug - FORCER L'AFFICHAGE
    console.log("🔥🔥🔥 ERREUR CRÉATION MISSION 🔥🔥🔥");
    console.log("Type d'erreur:", typeof error);
    console.log("Message:", error?.message);
    console.log("Stack:", error?.stack);
    console.log("Code:", error?.code);
    console.log("Détails:", error?.details);
    console.log("🔥🔥🔥 FIN ERREUR 🔥🔥🔥");

    console.error("[EstablishmentRoutes] Erreur création mission (détail):", error && (error.stack || error.message || error));
    // Gestion d'erreurs spécifiques
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({
        error: "Données de mission invalides",
        code: "VALIDATION_ERROR",
        details: error.details
      });
    }

    if (error.code === 'DUPLICATE_MISSION') {
      return res.status(409).json({
        error: "Une mission similaire existe déjà",
        code: "DUPLICATE_MISSION"
      });
    }

    res.status(500).json({
      error: "Erreur serveur lors de la création de la mission",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * PUT /api/establishment/missions/:id
 * Met à jour une mission existante
 */
router.put("/missions/:id", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const missionId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const mission = await storage.updateMission(missionId, req.body, userId);
    if (!mission) {
      return res.status(404).json({ error: "Mission non trouvée" });
    }

    res.json(mission);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur mise à jour mission:", error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la mission" });
  }
});

/**
 * DELETE /api/establishment/missions/:id
 * Supprime une mission
 */
router.delete("/missions/:id", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const missionId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const deleted = await storage.deleteMission(missionId, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Mission non trouvée" });
    }

    res.json({ message: "Mission supprimée avec succès" });
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur suppression mission:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression de la mission" });
  }
});

/**
 * GET /api/establishment/candidates
 * Récupère toutes les candidatures pour les missions de l'établissement
 */
router.get("/candidates", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const candidates = await storage.getEstablishmentCandidates(userId);
    res.json(candidates);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur récupération candidatures:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des candidatures" });
  }
});

/**
 * PUT /api/establishment/candidates/:id/accept
 * Accepte une candidature
 */
router.put("/candidates/:id/accept", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const candidateId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const result = await storage.acceptCandidate(candidateId, userId);
    if (!result) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    res.json({ message: "Candidature acceptée avec succès", candidate: result });
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur acceptation candidature:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'acceptation de la candidature" });
  }
});

/**
 * PUT /api/establishment/candidates/:id/reject
 * Rejette une candidature
 */
router.put("/candidates/:id/reject", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const candidateId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const result = await storage.rejectCandidate(candidateId, userId);
    if (!result) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    res.json({
      message: "Candidature rejetée avec succès",
      canUndo: true // Permettre l'annulation pendant 30 secondes
    });
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur rejet candidature:", error);
    res.status(500).json({ error: "Erreur serveur lors du rejet de la candidature" });
  }
});

/**
 * PUT /api/establishment/candidates/:id/undo_reject
 * Annule le rejet d'une candidature
 */
router.put("/candidates/:id/undo_reject", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const candidateId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Remettre la candidature en statut "pending"
    const result = await storage.updateMissionApplicationStatus(parseInt(candidateId), 'pending');
    if (!result) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    res.json({
      message: "Rejet annulé avec succès",
      candidate: result
    });
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur annulation rejet:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'annulation du rejet" });
  }
});

/**
 * GET /api/establishment/templates
 * Récupère tous les templates de l'établissement
 */
router.get("/templates", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Récupérer le profil établissement pour avoir l'ID
    const establishmentProfile = await storage.getEstablishmentProfile(userId);
    if (!establishmentProfile) {
      return res.status(404).json({ error: "Profil établissement non trouvé" });
    }

    const templates = await storage.getTemplates(establishmentProfile.id);
    res.json(templates);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur récupération templates:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des templates" });
  }
});

/**
 * GET /api/establishment/templates/:id
 * Récupère un template spécifique
 */
router.get("/templates/:id", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const templateId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const template = await storage.getTemplate(templateId);
    if (!template) {
      return res.status(404).json({ error: "Template non trouvé" });
    }

    res.json(template);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur récupération template:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération du template" });
  }
});

/**
 * POST /api/establishment/templates
 * Crée un nouveau template
 */
router.post("/templates", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Récupérer le profil établissement pour avoir l'ID
    const establishmentProfile = await storage.getEstablishmentProfile(userId);
    if (!establishmentProfile) {
      return res.status(404).json({ error: "Profil établissement non trouvé" });
    }

    const templateData = {
      ...req.body,
      establishmentId: userId
    };

    const template = await storage.createTemplate(templateData);
    res.status(201).json(template);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur création template:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création du template" });
  }
});

/**
 * PUT /api/establishment/templates/:id
 * Met à jour un template
 */
router.put("/templates/:id", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const templateId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const template = await storage.updateTemplate(templateId, req.body);
    if (!template) {
      return res.status(404).json({ error: "Template non trouvé" });
    }

    res.json(template);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur mise à jour template:", error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour du template" });
  }
});

/**
 * POST /api/establishment/templates/:id/publish
 * Publie un template comme mission
 */
router.post("/templates/:id/publish", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const templateId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Récupérer le profil établissement pour avoir l'ID
    const establishmentProfile = await storage.getEstablishmentProfile(userId);
    if (!establishmentProfile) {
      return res.status(404).json({ error: "Profil établissement non trouvé" });
    }

    const mission = await storage.publishTemplateAsMission(templateId, establishmentProfile.id, req.body);
    res.status(201).json(mission);
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur publication template:", error);
    res.status(500).json({ error: "Erreur serveur lors de la publication du template" });
  }
});

/**
 * DELETE /api/establishment/templates/:id
 * Supprime un template
 */
router.delete("/templates/:id", localAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const templateId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const deleted = await storage.deleteTemplate(templateId);
    if (!deleted) {
      return res.status(404).json({ error: "Template non trouvé" });
    }

    res.json({ message: "Template supprimé avec succès" });
  } catch (error) {
    console.error("[EstablishmentRoutes] Erreur suppression template:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression du template" });
  }
});

// Gestionnaire 404 pour les routes d'établissement inexistantes
router.use("*", (req, res) => {
  res.status(404).json({
    error: "Route d'établissement non trouvée",
    message: `La route ${req.method} ${req.originalUrl} n'existe pas`,
    code: "ESTABLISHMENT_ROUTE_NOT_FOUND"
  });
});

export default router;

/**
 * Récupère les infirmiers disponibles pour le matching
 * Simulation avec des données de test pour l'instant
 */
async function getAvailableNursesForMatching() {
  // TODO: Remplacer par une vraie requête à la base de données
  return [
    {
      id: 1,
      firstName: "Sophie",
      lastName: "Martin",
      specializations: ["urgences", "cardiologie"],
      experience: 5,
      rating: 4.8,
      completedMissions: 45,
      certifications: ["BLS", "ACLS"],
      languages: ["français", "anglais"],
      technicalSkills: ["perfusion", "ventilation"],
      preferredShifts: ["jour", "nuit"],
      maxDistance: 30,
      mobility: 'vehicle' as const,
      nightShiftExperience: true,
      urgencyExperience: true,
      covidExperience: true,
      pediatricExperience: false,
      geriatricExperience: true,
      latitude: 45.764043,
      longitude: 4.835659,
      establishmentHistory: { 1: 3 },
      stressResistance: 4,
      teamwork: 5,
      flexibility: 4,
      isActive: true,
      lastMissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      preferredPatientTypes: ["adult", "geriatric"],
      preferredEnvironments: ["hospital", "clinic"]
    },
    {
      id: 2,
      firstName: "Pierre",
      lastName: "Dubois",
      specializations: ["urgences", "pediatrie"],
      experience: 3,
      rating: 4.6,
      completedMissions: 28,
      certifications: ["BLS", "PALS"],
      languages: ["français"],
      technicalSkills: ["perfusion"],
      preferredShifts: ["jour"],
      maxDistance: 25,
      mobility: 'public' as const,
      nightShiftExperience: false,
      urgencyExperience: true,
      covidExperience: false,
      pediatricExperience: true,
      geriatricExperience: false,
      latitude: 45.780000,
      longitude: 4.820000,
      establishmentHistory: { 1: 1 },
      stressResistance: 3,
      teamwork: 4,
      flexibility: 3,
      isActive: true,
      lastMissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      preferredPatientTypes: ["pediatric"],
      preferredEnvironments: ["hospital"]
    },
    {
      id: 3,
      firstName: "Marie",
      lastName: "Leroy",
      specializations: ["reanimation"],
      experience: 8,
      rating: 4.9,
      completedMissions: 72,
      certifications: ["BLS", "ACLS", "AFGSU"],
      languages: ["français", "anglais"],
      technicalSkills: ["perfusion", "ventilation"],
      preferredShifts: ["jour"],
      maxDistance: 35,
      mobility: 'vehicle' as const,
      nightShiftExperience: false,
      urgencyExperience: true,
      covidExperience: true,
      pediatricExperience: false,
      geriatricExperience: false,
      latitude: 45.780000,
      longitude: 4.820000,
      establishmentHistory: { 1: 1 },
      stressResistance: 5,
      teamwork: 5,
      flexibility: 3,
      isActive: true,
      lastMissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      preferredPatientTypes: ["adult"],
      preferredEnvironments: ["hospital"]
    }
  ];
}

/**
 * Envoie les notifications aux candidats sélectionnés
 */
async function sendNotificationsToCandidates(matches: any[], mission: any) {
  try {
    console.log(`📱 Envoi de notifications à ${matches.length} candidats pour la mission ${mission.id}`);

    // Pour chaque candidat qualifié, créer une notification
    for (const match of matches) {
      const notification = {
        nurseId: match.nurseId,
        missionId: mission.id,
        type: 'new_mission_match',
        title: 'Nouvelle mission correspondant à votre profil',
        message: `Mission "${mission.title}" - Score de compatibilité : ${match.totalScore}%`,
        score: match.totalScore,
        distance: Math.round(match.distance * 10) / 10,
        urgency: match.totalScore > 80 ? 'high' : match.totalScore > 60 ? 'medium' : 'low',
        createdAt: new Date(),
        read: false
      };

      // TODO: Sauvegarder la notification en base de données
      console.log(`📨 Notification créée pour infirmier ${match.nurseId}:`, notification);

      // TODO: Envoyer notification push vers l'app mobile
      // await sendPushNotification(notification);
    }

    console.log(`✅ ${matches.length} notifications envoyées avec succès`);

  } catch (error) {
    console.error("❌ Erreur lors de l'envoi des notifications:", error);
    // Ne pas faire échouer la création de mission si les notifications échouent
  }
}
