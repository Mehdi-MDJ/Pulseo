import { storage } from './storageService';
import { logger } from './loggerService';
import { z } from 'zod';

// Schémas de validation pour les contrats
const ContractSchema = z.object({
  missionId: z.string(),
  nurseId: z.string(),
  establishmentId: z.string(),
  terms: z.object({
    hourlyRate: z.number().positive(),
    startDate: z.string(),
    endDate: z.string(),
    shift: z.enum(['day', 'night', 'mixed']),
    location: z.string(),
    responsibilities: z.array(z.string()),
    requirements: z.array(z.string())
  }),
  legalClauses: z.object({
    confidentiality: z.boolean(),
    insurance: z.boolean(),
    compliance: z.boolean()
  })
});

// Types pour les contrats
export interface ContractData {
  id: string;
  missionId: string;
  nurseId: string;
  establishmentId: string;
  status: 'draft' | 'sent' | 'signed_nurse' | 'signed_establishment' | 'completed' | 'cancelled';
  terms: {
    hourlyRate: number;
    startDate: string;
    endDate: string;
    shift: 'day' | 'night' | 'mixed';
    location: string;
    responsibilities: string[];
    requirements: string[];
  };
  legalClauses: {
    confidentiality: boolean;
    insurance: boolean;
    compliance: boolean;
  };
  signatures: {
    nurse?: {
      date: string;
      ip: string;
      userAgent: string;
      consent: boolean;
    };
    establishment?: {
      date: string;
      ip: string;
      userAgent: string;
      consent: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: 'mission' | 'permanent' | 'temporary';
  content: string;
  variables: string[];
  legalRequirements: string[];
}

class ContractService {
  /**
   * Génère automatiquement un contrat lors de l'acceptation d'une candidature
   */
  async generateContractFromApplication(applicationId: string): Promise<ContractData> {
    try {
      logger.info('Génération automatique de contrat', { applicationId });

      // Récupérer la candidature
      const application = await storage.getApplication(applicationId);
      if (!application) {
        throw new Error('Candidature non trouvée');
      }

      // Récupérer la mission
      const mission = await storage.getMission(application.missionId);
      if (!mission) {
        throw new Error('Mission non trouvée');
      }

      // Récupérer les profils
      const nurse = await storage.getNurseProfile(application.nurseId);
      const establishment = await storage.getEstablishmentProfile(mission.establishmentId);

      if (!nurse || !establishment) {
        throw new Error('Profils manquants');
      }

      // Générer les termes du contrat
      const contractTerms = this.generateContractTerms(mission, nurse, establishment);

      // Créer le contrat
      const contract: ContractData = {
        id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        missionId: mission.id,
        nurseId: nurse.userId,
        establishmentId: establishment.userId,
        status: 'draft',
        terms: contractTerms,
        legalClauses: {
          confidentiality: true,
          insurance: true,
          compliance: true
        },
        signatures: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      };

      // Sauvegarder le contrat
      await storage.createContract(contract);

      // Envoyer le contrat au candidat
      await this.sendContractToNurse(contract);

      logger.info('Contrat généré et envoyé avec succès', {
        contractId: contract.id,
        nurseId: nurse.userId
      });

      return contract;

    } catch (error) {
      logger.error('Erreur génération contrat', { error, applicationId });
      throw error;
    }
  }

  /**
   * Génère les termes du contrat basés sur la mission et les profils
   */
  private generateContractTerms(mission: any, nurse: any, establishment: any) {
    return {
      hourlyRate: mission.hourlyRate,
      startDate: mission.startDate,
      endDate: mission.endDate,
      shift: mission.shift,
      location: mission.location || establishment.address,
      responsibilities: this.generateResponsibilities(mission.specialization),
      requirements: this.generateRequirements(mission.specialization, nurse.specializations)
    };
  }

  /**
   * Génère les responsabilités selon la spécialisation
   */
  private generateResponsibilities(specialization: string): string[] {
    const responsibilitiesMap: Record<string, string[]> = {
      'cardiology': [
        'Surveillance des paramètres cardiaques',
        'Administration des traitements cardiologiques',
        'Participation aux soins intensifs cardiologiques',
        'Collaboration avec l\'équipe médicale cardiologique'
      ],
      'emergency': [
        'Accueil et triage des patients',
        'Soins d\'urgence immédiats',
        'Collaboration avec l\'équipe de réanimation',
        'Participation aux protocoles d\'urgence'
      ],
      'surgery': [
        'Préparation préopératoire des patients',
        'Assistance en salle d\'opération',
        'Soins postopératoires',
        'Surveillance des complications'
      ],
      'pediatrics': [
        'Soins spécialisés pédiatriques',
        'Communication avec les familles',
        'Surveillance de la croissance et développement',
        'Application des protocoles pédiatriques'
      ]
    };

    return responsibilitiesMap[specialization] || [
      'Soins infirmiers spécialisés',
      'Surveillance des patients',
      'Collaboration avec l\'équipe médicale',
      'Respect des protocoles de soins'
    ];
  }

  /**
   * Génère les exigences selon la spécialisation
   */
  private generateRequirements(specialization: string, nurseSpecializations: string[]): string[] {
    const baseRequirements = [
      'Diplôme d\'État d\'Infirmier',
      'Inscription au tableau de l\'Ordre',
      'Formation continue à jour',
      'Certification BLS/ACLS'
    ];

    const specializationRequirements: Record<string, string[]> = {
      'cardiology': ['Formation en cardiologie', 'Certification en monitoring cardiaque'],
      'emergency': ['Formation en réanimation', 'Certification ATLS'],
      'surgery': ['Formation en bloc opératoire', 'Certification en asepsie'],
      'pediatrics': ['Formation en pédiatrie', 'Certification PALS']
    };

    const specificRequirements = specializationRequirements[specialization] || [];

    return [...baseRequirements, ...specificRequirements];
  }

  /**
   * Envoie le contrat au candidat accepté
   */
  private async sendContractToNurse(contract: ContractData): Promise<void> {
    try {
      // Générer le PDF du contrat
      const contractPDF = await this.generateContractPDF(contract);

      // Envoyer par email avec lien de signature
      await this.sendContractEmail(contract, contractPDF);

      // Mettre à jour le statut
      contract.status = 'sent';
      await storage.updateContract(contract.id, contract);

      logger.info('Contrat envoyé au candidat', {
        contractId: contract.id,
        nurseId: contract.nurseId
      });

    } catch (error) {
      logger.error('Erreur envoi contrat', { error, contractId: contract.id });
      throw error;
    }
  }

  /**
   * Génère le PDF du contrat
   */
  private async generateContractPDF(contract: ContractData): Promise<Buffer> {
    // TODO: Implémenter la génération PDF avec une bibliothèque comme PDFKit
    // Pour l'instant, retourner un buffer vide
    return Buffer.from('PDF du contrat à générer');
  }

  /**
   * Envoie l'email avec le contrat
   */
  private async sendContractEmail(contract: ContractData, pdfBuffer: Buffer): Promise<void> {
    // TODO: Implémenter l'envoi d'email avec le PDF en pièce jointe
    // et le lien de signature électronique
    logger.info('Email de contrat à envoyer', { contractId: contract.id });
  }

  /**
   * Traite la signature électronique du candidat
   */
  async signContractByNurse(contractId: string, signatureData: {
    ip: string;
    userAgent: string;
    consent: boolean;
  }): Promise<ContractData> {
    try {
      const contract = await storage.getContract(contractId);
      if (!contract) {
        throw new Error('Contrat non trouvé');
      }

      if (contract.status !== 'sent') {
        throw new Error('Contrat non disponible pour signature');
      }

      // Vérifier la validité de la signature électronique
      const isValidSignature = await this.validateElectronicSignature(signatureData);
      if (!isValidSignature) {
        throw new Error('Signature électronique invalide');
      }

      // Enregistrer la signature
      contract.signatures.nurse = {
        date: new Date().toISOString(),
        ip: signatureData.ip,
        userAgent: signatureData.userAgent,
        consent: signatureData.consent
      };

      contract.status = 'signed_nurse';
      contract.updatedAt = new Date().toISOString();

      await storage.updateContract(contractId, contract);

      // Notifier l'établissement
      await this.notifyEstablishmentOfSignature(contract);

      logger.info('Contrat signé par le candidat', {
        contractId,
        nurseId: contract.nurseId
      });

      return contract;

    } catch (error) {
      logger.error('Erreur signature contrat', { error, contractId });
      throw error;
    }
  }

  /**
   * Valide la signature électronique
   */
  private async validateElectronicSignature(signatureData: any): Promise<boolean> {
    // TODO: Implémenter la validation selon les standards eIDAS
    // Vérification de l'identité, horodatage, etc.
    return true; // Pour l'instant
  }

  /**
   * Notifie l'établissement de la signature
   */
  private async notifyEstablishmentOfSignature(contract: ContractData): Promise<void> {
    // TODO: Envoyer notification à l'établissement
    logger.info('Notification de signature à envoyer à l\'établissement', {
      contractId: contract.id
    });
  }

  /**
   * Récupère les contrats d'un établissement
   */
  async getEstablishmentContracts(establishmentId: string): Promise<ContractData[]> {
    return await storage.getContractsByEstablishment(establishmentId);
  }

  /**
   * Récupère les contrats d'un candidat
   */
  async getNurseContracts(nurseId: string): Promise<ContractData[]> {
    return await storage.getContractsByNurse(nurseId);
  }

  /**
   * Annule un contrat
   */
  async cancelContract(contractId: string, reason: string): Promise<void> {
    const contract = await storage.getContract(contractId);
    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    contract.status = 'cancelled';
    contract.updatedAt = new Date().toISOString();

    await storage.updateContract(contractId, contract);

    // Notifier les parties
    await this.notifyContractCancellation(contract, reason);

    logger.info('Contrat annulé', { contractId, reason });
  }

  /**
   * Notifie l'annulation du contrat
   */
  private async notifyContractCancellation(contract: ContractData, reason: string): Promise<void> {
    // TODO: Envoyer notifications d'annulation
    logger.info('Notification d\'annulation à envoyer', {
      contractId: contract.id,
      reason
    });
  }
}

export const contractService = new ContractService();
