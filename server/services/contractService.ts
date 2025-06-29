/**
 * ==============================================================================
 * NurseLink AI - Service de Génération de Contrats
 * ==============================================================================
 *
 * Service automatisé pour la génération, envoi et signature de contrats
 * Déclenché automatiquement lors de l'acceptation d'une candidature
 *
 * Fonctionnalités :
 * - Génération automatique de contrats à partir de templates
 * - Substitution de variables dynamiques
 * - Génération de PDF
 * - Système de signature électronique
 * - Notifications automatiques
 * - Suivi des statuts
 * ==============================================================================
 */

import { getDb } from '../db';
import {
  contracts,
  contractTemplates,
  missions,
  missionApplications,
  users,
  nurseProfiles,
  establishmentProfiles,
  type Contract,
  type ContractTemplate,
  type Mission,
  type User,
  type NurseProfile,
  type EstablishmentProfile
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContractGenerationData {
  mission: Mission;
  nurse: User;
  nurseProfile: NurseProfile;
  establishment: User;
  establishmentProfile: EstablishmentProfile;
  application: any;
}

interface SignatureData {
  signature: string; // Base64 de la signature
  signedAt: string;
  ip: string;
  userAgent?: string;
}

/**
 * Service principal de gestion des contrats
 */
export class ContractService {

  /**
   * Génère automatiquement un contrat lors de l'acceptation d'une candidature
   */
  async generateContractOnAcceptance(missionId: number, nurseId: string, establishmentId: string): Promise<Contract> {
    console.log(`[ContractService] Génération automatique contrat - Mission: ${missionId}, Infirmier: ${nurseId}`);

    try {
      const db = await getDb();

      // Récupérer toutes les données nécessaires
      const contractData = await this.gatherContractData(missionId, nurseId, establishmentId);

      // Récupérer le template de contrat selon le type
      const template = await this.getContractTemplate(establishmentId, contractData.mission.contractType || 'cdd');

      // Générer le numéro de contrat unique
      const contractNumber = await this.generateContractNumber();

      // Calculer les détails financiers
      const financialDetails = this.calculateFinancialDetails(contractData.mission);

      // Générer le contenu HTML du contrat
      const contractContent = await this.generateContractContent(template, contractData, financialDetails);

      // Créer l'enregistrement du contrat
      const [contract] = await db.insert(contracts).values({
        missionId: contractData.mission.id,
        nurseId,
        establishmentId,
        contractNumber,
        title: `Contrat de mission - ${contractData.mission.title}`,
        startDate: contractData.mission.startDate,
        endDate: contractData.mission.endDate,
        hourlyRate: contractData.mission.hourlyRate,
        totalHours: financialDetails.totalHours.toString(),
        totalAmount: financialDetails.totalAmount.toString(),
        contractContent,
        status: 'generated',
        legalTerms: {
          template: template.name,
          generatedAt: new Date().toISOString(),
          governingLaw: 'Droit français',
          jurisdiction: 'Tribunaux français'
        }
      }).returning();

      console.log(`[ContractService] Contrat généré avec succès: ${contract.contractNumber}`);

      // Envoyer automatiquement si configuré
      if (template.autoSend) {
        await this.sendContractToNurse(contract.id);
      }

      return contract;

    } catch (error: any) {
      console.error('[ContractService] Erreur génération contrat:', error);
      throw new Error(`Erreur lors de la génération du contrat: ${error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Rassemble toutes les données nécessaires pour générer le contrat
   */
  private async gatherContractData(missionId: number, nurseId: string, establishmentId: string): Promise<ContractGenerationData> {
    const db = await getDb();

    const [mission] = await db.select().from(missions).where(eq(missions.id, missionId));
    if (!mission) throw new Error('Mission non trouvée');

    const [nurse] = await db.select().from(users).where(eq(users.id, nurseId));
    if (!nurse) throw new Error('Infirmier non trouvé');

    const [nurseProfile] = await db.select().from(nurseProfiles).where(eq(nurseProfiles.userId, nurseId));
    if (!nurseProfile) throw new Error('Profil infirmier non trouvé');

    const [establishment] = await db.select().from(users).where(eq(users.id, establishmentId));
    if (!establishment) throw new Error('Établissement non trouvé');

    const [establishmentProfile] = await db.select().from(establishmentProfiles).where(eq(establishmentProfiles.userId, establishmentId));
    if (!establishmentProfile) throw new Error('Profil établissement non trouvé');

    const [application] = await db.select().from(missionApplications)
      .where(and(
        eq(missionApplications.missionId, missionId),
        eq(missionApplications.nurseId, nurseProfile.id)
      ));

    return {
      mission,
      nurse,
      nurseProfile,
      establishment,
      establishmentProfile,
      application
    };
  }

  /**
   * Récupère le template de contrat pour l'établissement selon le type
   */
  private async getContractTemplate(establishmentId: string, contractType: string = 'cdd'): Promise<ContractTemplate> {
    const db = await getDb();

    // Chercher un template spécifique à l'établissement
    const [customTemplate] = await db.select().from(contractTemplates)
      .where(and(
        eq(contractTemplates.establishmentId, establishmentId),
        eq(contractTemplates.isActive, true)
      ));

    if (customTemplate) {
      return customTemplate;
    }

    // Utiliser le template par défaut selon le type de contrat
    const [defaultTemplate] = await db.select().from(contractTemplates)
      .where(and(
        eq(contractTemplates.isDefault, true),
        eq(contractTemplates.isActive, true)
      ));

    if (defaultTemplate) {
      return defaultTemplate;
    }

    // Créer un template selon le type de contrat
    return await this.createContractTemplateByType(contractType);
  }

  /**
   * Crée un template de contrat selon le type
   */
  private async createContractTemplateByType(contractType: string): Promise<ContractTemplate> {
    switch (contractType) {
      case 'cdi':
        return this.createCDITemplate();
      case 'liberal':
        return this.createLiberalTemplate();
      case 'cdd':
      default:
        return this.createCDDTemplate();
    }
  }

  /**
   * Crée un template de contrat CDD
   */
  private async createCDDTemplate(): Promise<ContractTemplate> {
    const db = await getDb();

    const [template] = await db.insert(contractTemplates).values({
      name: 'Template CDD Standard',
      description: 'Contrat à durée déterminée pour missions temporaires',
      contractType: 'cdd',
      isDefault: true,
      isActive: true,
      content: `
        <h1>CONTRAT À DURÉE DÉTERMINÉE</h1>
        <p>Entre les soussignés :</p>
        <p><strong>{{establishment.name}}</strong>, établissement de santé, représenté par {{establishment.contactPerson}},</p>
        <p>Et</p>
        <p><strong>{{nurse.firstName}} {{nurse.lastName}}</strong>, infirmier(ère),</p>
        <p>Il a été convenu ce qui suit :</p>

        <h2>Article 1 - Objet</h2>
        <p>Le présent contrat a pour objet l'exécution de la mission : {{mission.title}}</p>

        <h2>Article 2 - Durée</h2>
        <p>Le contrat prend effet le {{mission.startDate}} et se termine le {{mission.endDate}}.</p>

        <h2>Article 3 - Rémunération</h2>
        <p>Taux horaire : {{mission.hourlyRate}}€/heure<br>
        Total estimé : {{financial.totalAmount}}€ pour {{financial.totalHours}} heures</p>

        <h2>Article 4 - Conditions</h2>
        <p>L'infirmier s'engage à respecter les règles de l'établissement et la déontologie professionnelle.</p>

        <p>Fait à {{establishment.city}}, le {{currentDate}}</p>
      `,
      variables: {
        establishment: ['name', 'contactPerson', 'city'],
        nurse: ['firstName', 'lastName', 'rppsNumber'],
        mission: ['title', 'startDate', 'endDate', 'hourlyRate'],
        financial: ['totalAmount', 'totalHours'],
        currentDate: 'auto'
      },
      autoSend: true,
      requiresSignature: true
    }).returning();

    return template;
  }

  /**
   * Crée un template de contrat CDI
   */
  private async createCDITemplate(): Promise<ContractTemplate> {
    const db = await getDb();

    const [template] = await db.insert(contractTemplates).values({
      name: 'Template CDI Standard',
      description: 'Contrat à durée indéterminée pour missions longues',
      contractType: 'cdi',
      isDefault: true,
      isActive: true,
      content: `
        <h1>CONTRAT À DURÉE INDÉTERMINÉE</h1>
        <p>Entre les soussignés :</p>
        <p><strong>{{establishment.name}}</strong>, établissement de santé, représenté par {{establishment.contactPerson}},</p>
        <p>Et</p>
        <p><strong>{{nurse.firstName}} {{nurse.lastName}}</strong>, infirmier(ère),</p>
        <p>Il a été convenu ce qui suit :</p>

        <h2>Article 1 - Objet</h2>
        <p>Le présent contrat a pour objet l'embauche en CDI pour la mission : {{mission.title}}</p>

        <h2>Article 2 - Durée</h2>
        <p>Le contrat prend effet le {{mission.startDate}} pour une durée indéterminée.</p>

        <h2>Article 3 - Rémunération</h2>
        <p>Taux horaire : {{mission.hourlyRate}}€/heure<br>
        Salaire mensuel estimé : {{financial.monthlySalary}}€</p>

        <h2>Article 4 - Conditions</h2>
        <p>L'infirmier s'engage à respecter les règles de l'établissement et la déontologie professionnelle.</p>

        <p>Fait à {{establishment.city}}, le {{currentDate}}</p>
      `,
      variables: {
        establishment: ['name', 'contactPerson', 'city'],
        nurse: ['firstName', 'lastName', 'rppsNumber'],
        mission: ['title', 'startDate', 'hourlyRate'],
        financial: ['monthlySalary'],
        currentDate: 'auto'
      },
      autoSend: true,
      requiresSignature: true
    }).returning();

    return template;
  }

  /**
   * Crée un template de contrat libéral
   */
  private async createLiberalTemplate(): Promise<ContractTemplate> {
    const db = await getDb();

    const [template] = await db.insert(contractTemplates).values({
      name: 'Template Libéral Standard',
      description: 'Contrat pour infirmiers libéraux',
      contractType: 'liberal',
      isDefault: true,
      isActive: true,
      content: `
        <h1>CONTRAT DE PRESTATION DE SERVICES</h1>
        <p>Entre les soussignés :</p>
        <p><strong>{{establishment.name}}</strong>, établissement de santé, représenté par {{establishment.contactPerson}},</p>
        <p>Et</p>
        <p><strong>{{nurse.firstName}} {{nurse.lastName}}</strong>, infirmier(ère) libéral(e),</p>
        <p>Il a été convenu ce qui suit :</p>

        <h2>Article 1 - Objet</h2>
        <p>Le présent contrat a pour objet la prestation de services pour la mission : {{mission.title}}</p>

        <h2>Article 2 - Durée</h2>
        <p>La prestation prend effet le {{mission.startDate}} et se termine le {{mission.endDate}}.</p>

        <h2>Article 3 - Rémunération</h2>
        <p>Taux horaire : {{mission.hourlyRate}}€/heure<br>
        Total estimé : {{financial.totalAmount}}€ pour {{financial.totalHours}} heures</p>

        <h2>Article 4 - Conditions</h2>
        <p>L'infirmier libéral s'engage à respecter les règles de l'établissement et la déontologie professionnelle.</p>

        <p>Fait à {{establishment.city}}, le {{currentDate}}</p>
      `,
      variables: {
        establishment: ['name', 'contactPerson', 'city'],
        nurse: ['firstName', 'lastName', 'rppsNumber'],
        mission: ['title', 'startDate', 'endDate', 'hourlyRate'],
        financial: ['totalAmount', 'totalHours'],
        currentDate: 'auto'
      },
      autoSend: true,
      requiresSignature: true
    }).returning();

    return template;
  }

  /**
   * Génère un numéro de contrat unique
   */
  private async generateContractNumber(): Promise<string> {
    const db = await getDb();

    const count = await db.select().from(contracts)
      .where(eq(contracts.status, 'generated'));

    const contractNumber = `CONTRACT-${new Date().getFullYear()}-${String(count.length + 1).padStart(6, '0')}`;
    return contractNumber;
  }

  /**
   * Calcule les détails financiers du contrat
   */
  private calculateFinancialDetails(mission: Mission) {
    const startDate = new Date(mission.startDate);
    const endDate = new Date(mission.endDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalHours = daysDiff * 8; // 8h par jour par défaut
    const totalAmount = totalHours * mission.hourlyRate;

    return {
      totalHours,
      totalAmount,
      dailyRate: mission.hourlyRate * 8,
      monthlySalary: totalAmount / (daysDiff / 30)
    };
  }

  /**
   * Génère le contenu HTML du contrat avec substitution de variables
   */
  private async generateContractContent(
    template: ContractTemplate,
    data: ContractGenerationData,
    financialDetails: any
  ): Promise<string> {
    let content = template.content;

    // Substitution des variables
    content = content.replace(/\{\{establishment\.name\}\}/g, data.establishmentProfile.name || data.establishment.firstName);
    content = content.replace(/\{\{establishment\.contactPerson\}\}/g, data.establishment.firstName + ' ' + data.establishment.lastName);
    content = content.replace(/\{\{establishment\.city\}\}/g, data.establishmentProfile.city || 'Paris');

    content = content.replace(/\{\{nurse\.firstName\}\}/g, data.nurse.firstName);
    content = content.replace(/\{\{nurse\.lastName\}\}/g, data.nurse.lastName);
    content = content.replace(/\{\{nurse\.rppsNumber\}\}/g, data.nurseProfile.rppsNumber || 'N/A');

    content = content.replace(/\{\{mission\.title\}\}/g, data.mission.title);
    content = content.replace(/\{\{mission\.startDate\}\}/g, new Date(data.mission.startDate).toLocaleDateString('fr-FR'));
    content = content.replace(/\{\{mission\.endDate\}\}/g, new Date(data.mission.endDate).toLocaleDateString('fr-FR'));
    content = content.replace(/\{\{mission\.hourlyRate\}\}/g, data.mission.hourlyRate.toString());

    content = content.replace(/\{\{financial\.totalAmount\}\}/g, financialDetails.totalAmount.toFixed(2));
    content = content.replace(/\{\{financial\.totalHours\}\}/g, financialDetails.totalHours.toString());
    content = content.replace(/\{\{financial\.monthlySalary\}\}/g, financialDetails.monthlySalary.toFixed(2));

    content = content.replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString('fr-FR'));

    return content;
  }

  /**
   * Envoie le contrat à l'infirmier
   */
  async sendContractToNurse(contractId: number): Promise<void> {
    const db = await getDb();

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId));
    if (!contract) throw new Error('Contrat non trouvé');

    console.log(`[ContractService] Envoi du contrat ${contract.contractNumber} à l'infirmier`);

    // TODO: Implémenter l'envoi réel (email, notification push, etc.)
    // Pour l'instant, on met à jour le statut
    await db.update(contracts)
      .set({ status: 'sent', sentAt: new Date() })
      .where(eq(contracts.id, contractId));
  }

  /**
   * Signe le contrat (infirmier ou établissement)
   */
  async signContract(contractId: number, userType: 'nurse' | 'establishment', signatureData: SignatureData): Promise<Contract> {
    const db = await getDb();

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId));
    if (!contract) throw new Error('Contrat non trouvé');

    const updateData: any = {};

    if (userType === 'nurse') {
      updateData.nurseSignature = signatureData;
      updateData.nurseSignedAt = new Date();
    } else {
      updateData.establishmentSignature = signatureData;
      updateData.establishmentSignedAt = new Date();
    }

    // Vérifier si les deux parties ont signé
    const [updatedContract] = await db.update(contracts)
      .set(updateData)
      .where(eq(contracts.id, contractId))
      .returning();

    // Si les deux parties ont signé, marquer comme signé
    if (updatedContract.nurseSignature && updatedContract.establishmentSignature) {
      await db.update(contracts)
        .set({ status: 'signed', signedAt: new Date() })
        .where(eq(contracts.id, contractId));
    }

    return updatedContract;
  }

  /**
   * Récupère les contrats d'un utilisateur
   */
  async getUserContracts(userId: string, role: 'nurse' | 'establishment'): Promise<Contract[]> {
    const db = await getDb();

    const field = role === 'nurse' ? contracts.nurseId : contracts.establishmentId;
    return await db.select().from(contracts).where(eq(field, userId));
  }

  /**
   * Récupère un contrat par son ID
   */
  async getContractById(contractId: number): Promise<Contract | null> {
    const db = await getDb();

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId));
    return contract || null;
  }
}

export const contractService = new ContractService();
