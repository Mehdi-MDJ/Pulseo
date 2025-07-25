/**
 * ==============================================================================
 * NurseLink AI - Service de Contrats
 * ==============================================================================
 *
 * Service pour la gestion des contrats
 * Génération automatique et gestion des signatures
 * ==============================================================================
 */

import { db } from "../lib/drizzle";
import { contracts, missions, nurseProfiles, establishmentProfiles } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export interface Contract {
  id: string
  contractNumber: string
  missionId: number
  nurseId: string
  establishmentId: string
  status: string
  terms: any
  nurseSignature?: string
  establishmentSignature?: string
  signedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export class ContractService {
  /**
   * Générer un contrat automatiquement lors de l'acceptation d'une candidature
   */
  async generateContractOnAcceptance(
    missionId: number,
    nurseId: string,
    establishmentId: string
  ): Promise<Contract> {
    try {
      // Récupérer les informations de la mission
      const [mission] = await db
        .select()
        .from(missions)
        .where(eq(missions.id, missionId));

      if (!mission) {
        throw new Error("Mission non trouvée")
      }

      // Récupérer les profils
      const [nurseProfile] = await db
        .select()
        .from(nurseProfiles)
        .where(eq(nurseProfiles.userId, nurseId));

      const [establishmentProfile] = await db
        .select()
        .from(establishmentProfiles)
        .where(eq(establishmentProfiles.userId, establishmentId));

      if (!nurseProfile || !establishmentProfile) {
        throw new Error("Profils manquants")
      }

      // Générer le numéro de contrat
      const contractNumber = `CONTRACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Créer les termes du contrat
      const contractTerms = {
        mission: {
          title: mission.title,
          description: mission.description,
          location: mission.location,
          startDate: mission.startDate,
          endDate: mission.endDate,
          hourlyRate: mission.hourlyRate,
        },
        parties: {
          nurse: {
            id: nurseId,
            name: nurseProfile.userId, // À remplacer par le nom de l'utilisateur
            specializations: nurseProfile.specializations,
            experience: nurseProfile.experience,
          },
          establishment: {
            id: establishmentId,
            name: establishmentProfile.name,
            type: establishmentProfile.type,
            address: establishmentProfile.address,
          }
        },
        terms: {
          duration: "Mission temporaire",
          payment: `€${mission.hourlyRate}/heure`,
          responsibilities: [
            "Respecter les horaires convenus",
            "Suivre les protocoles de l'établissement",
            "Maintenir la confidentialité",
            "Signaler tout incident"
          ],
          termination: "Préavis de 48h requis"
        }
      }

      // Créer le contrat
      const [contract] = await db
        .insert(contracts)
        .values({
          contractNumber,
          missionId,
          nurseId,
          establishmentId,
          status: "PENDING",
          terms: contractTerms,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log(`✅ Contrat généré: ${contractNumber}`)
      return contract

    } catch (error) {
      console.error("❌ Erreur génération contrat:", error)
      throw error
    }
  }

  /**
   * Récupérer un contrat par ID
   */
  async getContract(id: string): Promise<Contract | null> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));

    return contract || null;
  }

  /**
   * Récupérer les contrats d'un utilisateur
   */
  async getUserContracts(userId: string, role: string): Promise<Contract[]> {
    const where = role === "NURSE"
      ? eq(contracts.nurseId, userId)
      : eq(contracts.establishmentId, userId);

    return await db
      .select()
      .from(contracts)
      .where(where)
      .orderBy(contracts.createdAt);
  }

  /**
   * Signer un contrat (côté infirmier)
   */
  async signContractNurse(contractId: string, signature: string): Promise<Contract> {
    const [contract] = await db
      .update(contracts)
      .set({
        nurseSignature: signature,
        status: "NURSE_SIGNED",
        updatedAt: new Date()
      })
      .where(eq(contracts.id, contractId))
      .returning();

    // Si l'établissement a déjà signé, marquer comme signé
    if (contract.establishmentSignature) {
      await this.finalizeContract(contractId);
    }

    return contract;
  }

  /**
   * Signer un contrat (côté établissement)
   */
  async signContractEstablishment(contractId: string, signature: string): Promise<Contract> {
    const [contract] = await db
      .update(contracts)
      .set({
        establishmentSignature: signature,
        status: "ESTABLISHMENT_SIGNED",
        updatedAt: new Date()
      })
      .where(eq(contracts.id, contractId))
      .returning();

    // Si l'infirmier a déjà signé, marquer comme signé
    if (contract.nurseSignature) {
      await this.finalizeContract(contractId);
    }

    return contract;
  }

  /**
   * Finaliser un contrat (les deux parties ont signé)
   */
  private async finalizeContract(contractId: string): Promise<Contract> {
    const [contract] = await db
      .update(contracts)
      .set({
        status: "SIGNED",
        signedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(contracts.id, contractId))
      .returning();

    return contract;
  }

  /**
   * Annuler un contrat
   */
  async cancelContract(contractId: string, reason: string): Promise<Contract> {
    const [contract] = await db
      .update(contracts)
      .set({
        status: "CANCELLED",
        updatedAt: new Date()
      })
      .where(eq(contracts.id, contractId))
      .returning();

    return contract;
  }

  /**
   * Générer un PDF du contrat
   */
  async generateContractPDF(contractId: string): Promise<Buffer> {
    // TODO: Implémenter la génération PDF
    // Pour l'instant, retourner un buffer vide
    return Buffer.from("Contrat PDF - À implémenter")
  }
}

export const contractService = new ContractService()
