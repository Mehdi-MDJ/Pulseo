/**
 * ==============================================================================
 * NurseLink AI - Routes des Contrats
 * ==============================================================================
 * 
 * Routes dédiées à la gestion des contrats automatiques et signatures électroniques
 * ==============================================================================
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { contractService } from '../services/contractService';
import { z } from 'zod';

const router = Router();

/**
 * Récupération des contrats de l'utilisateur connecté
 */
router.get('/my-contracts', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userRole = req.user.claims.role || 'nurse'; // Fallback basé sur le profil

    const contracts = await contractService.getUserContracts(userId, userRole);
    
    res.json({
      contracts,
      count: contracts.length
    });
  } catch (error) {
    console.error('Erreur récupération contrats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des contrats' });
  }
});

/**
 * Récupération d'un contrat spécifique
 */
router.get('/:contractId', isAuthenticated, async (req: any, res) => {
  try {
    const contractId = parseInt(req.params.contractId);
    const userId = req.user.claims.sub;

    const contract = await contractService.getContractById(contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    // Vérifier que l'utilisateur a accès à ce contrat
    if (contract.nurseId !== userId && contract.establishmentId !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé à ce contrat' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Erreur récupération contrat:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du contrat' });
  }
});

/**
 * Signature électronique d'un contrat
 */
const signatureSchema = z.object({
  signature: z.string().min(1, 'Signature requise'),
  userAgent: z.string().optional()
});

router.post('/:contractId/sign', isAuthenticated, async (req: any, res) => {
  try {
    const contractId = parseInt(req.params.contractId);
    const userId = req.user.claims.sub;
    const validation = signatureSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: validation.error.errors 
      });
    }

    const { signature, userAgent } = validation.data;

    // Récupérer le contrat pour déterminer le rôle
    const contract = await contractService.getContractById(contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    // Déterminer le type d'utilisateur
    let userType: 'nurse' | 'establishment';
    if (contract.nurseId === userId) {
      userType = 'nurse';
    } else if (contract.establishmentId === userId) {
      userType = 'establishment';
    } else {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à signer ce contrat' });
    }

    // Vérifier si déjà signé par cet utilisateur
    const existingSignature = userType === 'nurse' ? contract.nurseSignature : contract.establishmentSignature;
    if (existingSignature) {
      return res.status(400).json({ error: 'Vous avez déjà signé ce contrat' });
    }

    const signatureData = {
      signature,
      signedAt: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent
    };

    const updatedContract = await contractService.signContract(contractId, userType, signatureData);

    res.json({
      message: 'Contrat signé avec succès',
      contract: updatedContract,
      isFullySigned: updatedContract.status === 'completed'
    });

  } catch (error) {
    console.error('Erreur signature contrat:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la signature du contrat' });
  }
});

/**
 * Envoi d'un contrat à l'infirmier
 */
router.post('/:contractId/send', isAuthenticated, async (req: any, res) => {
  try {
    const contractId = parseInt(req.params.contractId);
    const userId = req.user.claims.sub;

    const contract = await contractService.getContractById(contractId);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    // Seul l'établissement peut envoyer le contrat
    if (contract.establishmentId !== userId) {
      return res.status(403).json({ error: 'Seul l\'établissement peut envoyer le contrat' });
    }

    await contractService.sendContractToNurse(contractId);

    res.json({ message: 'Contrat envoyé avec succès à l\'infirmier' });

  } catch (error) {
    console.error('Erreur envoi contrat:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du contrat' });
  }
});

/**
 * Génération manuelle d'un contrat (pour les admins)
 */
router.post('/generate', isAuthenticated, async (req: any, res) => {
  try {
    const { missionId, nurseId, establishmentId } = req.body;
    const userId = req.user.claims.sub;

    // Vérifier que l'utilisateur est l'établissement concerné
    if (establishmentId !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const contract = await contractService.generateContractOnAcceptance(
      parseInt(missionId), 
      nurseId, 
      establishmentId
    );

    res.json({
      message: 'Contrat généré avec succès',
      contract
    });

  } catch (error) {
    console.error('Erreur génération manuelle contrat:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération du contrat' });
  }
});

/**
 * Statistiques des contrats pour un établissement
 */
router.get('/stats/establishment', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const contracts = await contractService.getUserContracts(userId, 'establishment');
    
    const stats = {
      total: contracts.length,
      byStatus: contracts.reduce((acc, contract) => {
        acc[contract.status] = (acc[contract.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalValue: contracts.reduce((sum, contract) => sum + parseFloat(contract.totalAmount.toString()), 0),
      averageValue: contracts.length > 0 
        ? contracts.reduce((sum, contract) => sum + parseFloat(contract.totalAmount.toString()), 0) / contracts.length 
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur statistiques contrats:', error);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
});

export default router;