/**
 * ==============================================================================
 * NurseLink AI - Routes des Contrats
 * ==============================================================================
 *
 * Routes dédiées à la gestion des contrats automatiques et signatures électroniques
 * ==============================================================================
 */

import express from 'express';
import { contractService } from '../services/contractService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { Request, Response } from 'express';
import { logger } from '../services/loggerService';
import { z } from 'zod';
import { storage } from '../services/storageService';
import { contracts } from '../../shared/schema';
import { desc } from 'drizzle-orm';

const router = express.Router();

// Schéma de validation pour la signature
const SignatureSchema = z.object({
  contractId: z.string(),
  consent: z.boolean(),
  userAgent: z.string().optional(),
  ip: z.string().optional()
});

// Schéma de validation pour l'acceptation de candidature
const AcceptApplicationSchema = z.object({
  applicationId: z.string(),
  message: z.string().optional()
});

/**
 * POST /api/contracts/test-create
 * Route de test pour créer un contrat directement (développement uniquement)
 */
router.post('/test-create', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Route de test disponible uniquement en développement'
      });
    }

    logger.info('Création de contrat de test demandée', {
      userId: 'test-user'
    });

    // Créer un contrat de test
    const testContract = {
      id: `contract_test_${Date.now()}`,
      missionId: 1, // ID numérique pour la contrainte de clé étrangère
      nurseId: "user-marie-candidat", // Utilise l'ID d'un utilisateur existant
      establishmentId: "user-test-etablissement", // Utilise l'ID utilisateur de l'établissement existant
      status: 'draft',
      terms: {
        hourlyRate: 26,
        startDate: '2025-07-15',
        endDate: '2025-07-20',
        shift: 'day',
        location: 'Paris',
        responsibilities: [
          'Soins infirmiers en cardiologie',
          'Surveillance des patients',
          'Collaboration avec l\'équipe médicale'
        ],
        requirements: [
          'Diplôme d\'État infirmier',
          'Formation en cardiologie',
          'Certification BLS/ACLS'
        ]
      },
      legalClauses: {
        confidentiality: true,
        insurance: true,
        compliance: true
      },
      signatures: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Sauvegarder le contrat
    const savedContract = await storage.createContract(testContract);

    res.status(201).json({
      success: true,
      message: 'Contrat de test créé avec succès',
      contract: {
        id: savedContract.id,
        contractNumber: savedContract.contractNumber,
        status: savedContract.status,
        terms: testContract.terms
      }
    });

  } catch (error) {
    logger.error('Erreur création contrat de test', { error, userId: 'test-user' });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du contrat de test',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/contracts/test-list
 * Route de test pour lister les contrats (développement uniquement)
 */
router.get('/test-list', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Route de test disponible uniquement en développement'
      });
    }

    logger.info('Liste des contrats de test demandée');

    // Récupérer tous les contrats de test
    const db = await storage.getDatabase();
    const results = await db
      .select()
      .from(contracts)
      .orderBy(desc(contracts.createdAt))
      .limit(10);

    const contractsList = results.map(contract => {
      try {
        const parsedContent = JSON.parse(contract.contractContent);
        return {
          ...contract,
          ...parsedContent
        };
      } catch {
        return contract;
      }
    });

    res.json({
      success: true,
      contracts: contractsList.map(contract => ({
        id: contract.id,
        contractNumber: contract.contractNumber,
        status: contract.status,
        missionId: contract.missionId,
        nurseId: contract.nurseId,
        establishmentId: contract.establishmentId,
        terms: contract.terms,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt
      }))
    });

  } catch (error) {
    logger.error('Erreur récupération contrats de test', { error });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contrats de test',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/contracts/generate
 * Génère automatiquement un contrat lors de l'acceptation d'une candidature
 */
router.post('/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    logger.info('Génération de contrat demandée', {
      userId: req.user?.id,
      body: req.body
    });

    const { applicationId } = AcceptApplicationSchema.parse(req.body);

    // Générer le contrat automatiquement
    const contract = await contractService.generateContractFromApplication(applicationId);

    res.status(201).json({
      success: true,
      message: 'Contrat généré et envoyé avec succès',
      contract: {
        id: contract.id,
        status: contract.status,
        expiresAt: contract.expiresAt,
        terms: contract.terms
      }
    });

  } catch (error) {
    logger.error('Erreur génération contrat', { error, userId: req.user?.id });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du contrat',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/contracts/:contractId/sign
 * Signature électronique du contrat par l'infirmier
 */
router.post('/:contractId/sign', requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { consent } = req.body;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip;
    if (typeof consent !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Consentement requis' });
    }
    // Appeler le service de signature
    const contract = await contractService.signContractByNurse(contractId, { ip, userAgent, consent });
    res.json({ success: true, message: 'Contrat signé avec succès', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

/**
 * POST /api/contracts/:contractId/sign-establishment
 * Signature électronique du contrat par l'établissement
 */
router.post('/:contractId/sign-establishment', requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { consent } = req.body;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip;
    if (typeof consent !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Consentement requis' });
    }
    // Appeler le service de signature établissement
    const contract = await contractService.signContractByEstablishment(contractId, { ip, userAgent, consent });
    res.json({ success: true, message: 'Contrat signé par l’établissement', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

/**
 * GET /api/contracts/establishment
 * Récupère tous les contrats d'un établissement
 */
router.get('/establishment', requireAuth, async (req, res) => {
  try {
    const establishmentId = req.user?.id;
    if (!establishmentId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    logger.info('Récupération des contrats établissement', { establishmentId });

    const contracts = await contractService.getEstablishmentContracts(establishmentId);

    res.json({
      success: true,
      contracts: contracts.map(contract => ({
        id: contract.id,
        status: contract.status,
        missionId: contract.missionId,
        nurseId: contract.nurseId,
        terms: contract.terms,
        signatures: contract.signatures,
        createdAt: contract.createdAt,
        expiresAt: contract.expiresAt
      }))
    });

  } catch (error) {
    logger.error('Erreur récupération contrats établissement', { error, userId: req.user?.id });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contrats',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/contracts/nurse
 * Récupère tous les contrats d'un candidat
 */
router.get('/nurse', requireAuth, async (req, res) => {
  try {
    const nurseId = req.user?.id;
    if (!nurseId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    logger.info('Récupération des contrats candidat', { nurseId });

    const contracts = await contractService.getNurseContracts(nurseId);

    res.json({
      success: true,
      contracts: contracts.map(contract => ({
        id: contract.id,
        status: contract.status,
        missionId: contract.missionId,
        establishmentId: contract.establishmentId,
        terms: contract.terms,
        signatures: contract.signatures,
        createdAt: contract.createdAt,
        expiresAt: contract.expiresAt
      }))
    });

  } catch (error) {
    logger.error('Erreur récupération contrats candidat', { error, userId: req.user?.id });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contrats',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/contracts/:contractId
 * Récupère les détails d'un contrat spécifique
 */
router.get('/:contractId', requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;

    logger.info('Récupération détails contrat', { contractId, userId });

    // Récupérer le contrat
    const contract = await contractService.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    // Vérifier que l'utilisateur a accès à ce contrat
    if (contract.nurseId !== userId && contract.establishmentId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    res.json({
      success: true,
      contract: {
        id: contract.id,
        status: contract.status,
        missionId: contract.missionId,
        nurseId: contract.nurseId,
        establishmentId: contract.establishmentId,
        terms: contract.terms,
        legalClauses: contract.legalClauses,
        signatures: contract.signatures,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        expiresAt: contract.expiresAt
      }
    });

  } catch (error) {
    logger.error('Erreur récupération contrat', { error, userId: req.user?.id });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du contrat',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/contracts/:contractId/cancel
 * Annule un contrat
 */
router.post('/:contractId/cancel', requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Raison d\'annulation requise'
      });
    }

    logger.info('Annulation de contrat demandée', { contractId, userId, reason });

    // Vérifier que l'utilisateur peut annuler ce contrat
    const contract = await contractService.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    if (contract.nurseId !== userId && contract.establishmentId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    // Annuler le contrat
    await contractService.cancelContract(contractId, reason);

    res.json({
      success: true,
      message: 'Contrat annulé avec succès'
    });

  } catch (error) {
    logger.error('Erreur annulation contrat', { error, userId: req.user?.id });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation du contrat',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/contracts/:contractId/pdf
 * Génère et retourne le PDF du contrat
 */
router.get('/:contractId/pdf', requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;

    logger.info('Génération PDF contrat demandée', { contractId, userId });

    // Récupérer le contrat
    const contract = await contractService.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrat non trouvé'
      });
    }

    // Vérifier l'accès
    if (contract.nurseId !== userId && contract.establishmentId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce contrat'
      });
    }

    // Générer le PDF
    const pdfBuffer = await contractService.generateContractPDF(contract);

    // Retourner le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="contrat_${contractId}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    logger.error('Erreur génération PDF contrat', { error, userId: req.user?.id });

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;
