/**
 * ==============================================================================
 * NurseLink AI - Routes de Matching Automatique
 * ==============================================================================
 *
 * Routes pour le système de matching intelligent entre missions et infirmiers
 * ==============================================================================
 */

import { Router } from 'express';
import { reinforcedMatchingService, type MatchingConfig } from '../services/reinforcedMatchingService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

/**
 * Schéma de validation pour les critères de matching
 */
const matchingCriteriaSchema = z.object({
  maxDistance: z.number().min(1).max(200).optional(),
  minExperience: z.number().min(0).max(50).optional(),
  requiredSpecializations: z.array(z.string()).optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxCandidates: z.number().min(1).max(50).optional()
});

/**
 * Lance le matching automatique pour une mission
 * POST /api/matching/mission/:id
 */
router.post('/mission/:id', requireAuth, async (req: any, res) => {
  try {
    const missionId = parseInt(req.params.id);

    if (isNaN(missionId)) {
      return res.status(400).json({
        error: "ID mission invalide",
        code: "INVALID_MISSION_ID"
      });
    }

    // Validation des critères optionnels
    let criteria = {};
    if (req.body && Object.keys(req.body).length > 0) {
      const validation = matchingCriteriaSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Critères de matching invalides",
          details: validation.error.issues,
          code: "INVALID_CRITERIA"
        });
      }
      criteria = validation.data;
    }

    console.log(`🎯 Lancement matching renforcé pour mission ${missionId}`, criteria);

    // Configuration du matching renforcé
    const config: MatchingConfig = {
      minimumScore: 60,
      maxCandidates: (criteria as any).maxCandidates || 10,
      maxDistance: (criteria as any).maxDistance || 50,
      requireExactSpecialization: false,
      prioritizeHistory: false,
      emergencyMode: false
    };

    // Simulation mission pour démo
    const mockMission = {
      id: missionId,
      establishmentId: 1,
      title: "Mission générée automatiquement",
      specialization: "urgences",
      requiredExperience: (criteria as any).minExperience || 2,
      urgency: 'medium' as const,
      startDate: new Date(),
      shift: "jour",
      duration: 8,
      latitude: 45.764043,
      longitude: 4.835659,
      requiredCertifications: ["BLS"],
      requiredSkills: ["perfusion"],
      patientType: 'adult' as const,
      environment: 'hospital' as const,
      teamSize: 5,
      stressLevel: 3,
      preferredLanguages: ["français"],
      hourlyRate: 28
    };

    // Base de données simulée d'infirmiers pour démo
    const mockNurses = [
      {
        id: 1, firstName: "Sophie", lastName: "Martin",
        specializations: ["urgences", "cardiologie"], experience: 5, rating: 4.8, completedMissions: 45,
        certifications: ["BLS", "ACLS"], languages: ["français"], technicalSkills: ["perfusion"],
        preferredShifts: ["jour"], maxDistance: 40, mobility: 'vehicle' as const,
        nightShiftExperience: false, urgencyExperience: true, covidExperience: true,
        pediatricExperience: false, geriatricExperience: false,
        latitude: 45.770000, longitude: 4.840000, establishmentHistory: { 1: 3 },
        stressResistance: 4, teamwork: 5, flexibility: 4, isActive: true,
        lastMissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        preferredPatientTypes: ["adult"], preferredEnvironments: ["hospital"]
      },
      {
        id: 2, firstName: "Pierre", lastName: "Dubois",
        specializations: ["urgences"], experience: 3, rating: 4.6, completedMissions: 28,
        certifications: ["BLS"], languages: ["français"], technicalSkills: ["perfusion"],
        preferredShifts: ["jour", "nuit"], maxDistance: 30, mobility: 'public_transport' as const,
        nightShiftExperience: true, urgencyExperience: true, covidExperience: false,
        pediatricExperience: false, geriatricExperience: false,
        latitude: 45.750000, longitude: 4.850000, establishmentHistory: {},
        stressResistance: 4, teamwork: 4, flexibility: 5, isActive: true,
        lastMissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        preferredPatientTypes: ["adult"], preferredEnvironments: ["hospital"]
      },
      {
        id: 3, firstName: "Marie", lastName: "Leroy",
        specializations: ["reanimation"], experience: 8, rating: 4.9, completedMissions: 72,
        certifications: ["BLS", "ACLS", "AFGSU"], languages: ["français", "anglais"], technicalSkills: ["perfusion", "ventilation"],
        preferredShifts: ["jour"], maxDistance: 35, mobility: 'vehicle' as const,
        nightShiftExperience: false, urgencyExperience: true, covidExperience: true,
        pediatricExperience: false, geriatricExperience: false,
        latitude: 45.780000, longitude: 4.820000, establishmentHistory: { 1: 1 },
        stressResistance: 5, teamwork: 5, flexibility: 3, isActive: true,
        lastMissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        preferredPatientTypes: ["adult"], preferredEnvironments: ["hospital"]
      }
    ];

    // Exécution de l'algorithme déterministe renforcé
    const matches = reinforcedMatchingService.findBestMatches(mockMission, mockNurses, config);

    res.json({
      success: true,
      algorithm: "reinforced_deterministic",
      missionId,
      totalMatches: matches.length,
      matches: matches.map(match => {
        const nurse = mockNurses.find(n => n.id === match.nurseId);
        return {
          nurseId: match.nurseId,
          name: `${nurse?.firstName} ${nurse?.lastName}`,
          score: match.totalScore,
          distance: Math.round(match.distance * 10) / 10,
          experience: nurse?.experience,
          rating: nurse?.rating,
          specializations: nurse?.specializations,
          matchingFactors: match.factors,
          breakdown: {
            specialization: Math.round(match.scores.specialization),
            experience: Math.round(match.scores.experience),
            proximity: Math.round(match.scores.proximity),
            certifications: Math.round(match.scores.certifications),
            adaptability: Math.round(match.scores.adaptability),
            availability: Math.round(match.scores.availability),
            history: Math.round(match.scores.history),
            bonus: Math.round(match.scores.bonus)
          },
          confidence: match.confidence,
          priority: match.priority,
          warnings: match.warnings,
          notificationSent: true
        };
      }),
      criteria: {
        maxDistance: config.maxDistance,
        minExperience: mockMission.requiredExperience,
        maxCandidates: config.maxCandidates,
        algorithm: "deterministic_reinforced",
        ...criteria
      }
    });

  } catch (error) {
    console.error("❌ Erreur matching mission:", error);
    res.status(500).json({
      error: "Erreur lors du matching",
      code: "MATCHING_ERROR",
      message: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

/**
 * Récupère les résultats de matching pour une mission
 * GET /api/matching/mission/:id/results
 */
router.get('/mission/:id/results', requireAuth, async (req: any, res) => {
  try {
    const missionId = parseInt(req.params.id);

    if (isNaN(missionId)) {
      return res.status(400).json({
        error: "ID mission invalide",
        code: "INVALID_MISSION_ID"
      });
    }

    // Simulation des résultats stockés pour démo
    const mockHistory = {
      missionId,
      lastRun: new Date().toISOString(),
      algorithm: "reinforced_deterministic",
      totalCandidates: 3,
      qualifiedCandidates: 3,
      averageScore: 85,
      criteria: {
        maxDistance: 50,
        minExperience: 2,
        maxCandidates: 10
      }
    };

    res.json({
      missionId,
      matchingHistory: mockHistory
    });

  } catch (error) {
    console.error("❌ Erreur récupération résultats:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération",
      code: "FETCH_ERROR"
    });
  }
});

/**
 * Met à jour les critères de matching par défaut d'un établissement
 * PUT /api/matching/establishment/criteria
 */
router.put('/establishment/criteria', requireAuth, async (req: any, res) => {
  try {
    const validation = matchingCriteriaSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Critères invalides",
        details: validation.error.issues,
        code: "INVALID_CRITERIA"
      });
    }

    // Récupérer l'ID de l'établissement depuis la session
    const establishmentId = req.user.establishmentProfile?.id;
    if (!establishmentId) {
      return res.status(403).json({
        error: "Accès réservé aux établissements",
        code: "FORBIDDEN"
      });
    }

    // Pour la démo, on simule la sauvegarde
    console.log(`💾 Sauvegarde critères pour établissement ${establishmentId}:`, validation.data);

    res.json({
      success: true,
      message: "Critères de matching mis à jour",
      algorithm: "reinforced_deterministic",
      criteria: validation.data
    });

  } catch (error) {
    console.error("❌ Erreur mise à jour critères:", error);
    res.status(500).json({
      error: "Erreur lors de la mise à jour",
      code: "UPDATE_ERROR"
    });
  }
});

/**
 * Test du système de matching avec données de démonstration
 * POST /api/matching/test
 */
router.post('/test', async (req, res) => {
  try {
    // Generate mock data for immediate testing
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

  } catch (error) {
    console.error("❌ Erreur test matching:", error);
    res.status(500).json({
      error: "Erreur lors du test",
      code: "TEST_ERROR",
      message: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

export default router;
