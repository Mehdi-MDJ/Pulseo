/**
 * ==============================================================================
 * Test Workflow Complet - NurseLinkAI
 * ==============================================================================
 *
 * Ce script teste le flux complet de génération de contrats automatiques :
 * 1. Publication d'une mission
 * 2. Matching avec des candidats
 * 3. Acceptation de candidature par l'établissement
 * 4. Génération automatique du contrat
 * 5. Signature électronique du candidat
 * 6. Vérification par l'établissement
 * ==============================================================================
 */

const BASE_URL = 'http://localhost:3000/api';

// Données de test
const TEST_DATA = {
  establishment: {
    id: 'user-test-etablissement',
    name: 'Hôpital Test',
    email: 'test@hopital.fr'
  },
  nurse: {
    id: 'user-marie-candidat',
    name: 'Marie Leroy',
    email: 'marie.leroy@email.com'
  },
  mission: {
    title: 'Mission Test Workflow Complet',
    description: 'Mission de test pour vérifier le flux complet de génération de contrats',
    specialization: 'cardiology',
    startDate: '2025-07-15',
    endDate: '2025-07-20',
    hourlyRate: 26,
    shift: 'day',
    location: 'Paris'
  }
};

class WorkflowTester {
  constructor() {
    this.results = [];
    this.currentStep = 0;
  }

  log(step, message, data = null) {
    this.currentStep++;
    const timestamp = new Date().toISOString();
    console.log(`\n${this.currentStep}. [${timestamp}] ${step}: ${message}`);
    if (data) {
      console.log('   Données:', JSON.stringify(data, null, 2));
    }

    this.results.push({
      step: this.currentStep,
      timestamp,
      action: step,
      message,
      data
    });
  }

  async testStep(stepName, testFunction) {
    try {
      this.log(stepName, 'Démarrage...');
      const result = await testFunction();
      this.log(stepName, '✅ Succès', result);
      return result;
    } catch (error) {
      this.log(stepName, `❌ Erreur: ${error.message}`, { error: error.toString() });
      throw error;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || data.message || 'Erreur inconnue'}`);
    }

    return data;
  }

  // ÉTAPE 1: Vérification des données de base
  async verifyBaseData() {
    return await this.testStep('Vérification des données de base', async () => {
      // Vérifier que les utilisateurs de test existent
      const contracts = await this.makeRequest('/contracts/test-list');

      return {
        contractsCount: contracts.contracts.length,
        message: 'Données de base vérifiées'
      };
    });
  }

  // ÉTAPE 2: Création d'une mission de test
  async createTestMission() {
    return await this.testStep('Création d\'une mission de test', async () => {
      const missionData = {
        ...TEST_DATA.mission,
        establishmentId: TEST_DATA.establishment.id
      };

      const mission = await this.makeRequest('/missions', {
        method: 'POST',
        body: JSON.stringify(missionData)
      });

      return {
        missionId: mission.id,
        title: mission.title,
        status: mission.status
      };
    });
  }

  // ÉTAPE 3: Simulation du matching IA
  async simulateAIMatching(missionId) {
    return await this.testStep('Simulation du matching IA', async () => {
      const matchingData = {
        missionId: missionId,
        maxCandidates: 5,
        maxDistance: 30,
        minExperience: 2
      };

      const matches = await this.makeRequest('/matching/mission', {
        method: 'POST',
        body: JSON.stringify(matchingData)
      });

      return {
        candidatesCount: matches.length,
        topCandidate: matches[0] ? {
          id: matches[0].nurseId,
          name: matches[0].name,
          score: matches[0].score
        } : null
      };
    });
  }

  // ÉTAPE 4: Création d'une candidature
  async createApplication(missionId) {
    return await this.testStep('Création d\'une candidature', async () => {
      const applicationData = {
        missionId: missionId,
        nurseId: TEST_DATA.nurse.id,
        coverLetter: 'Candidature de test pour le workflow complet',
        hourlyRate: TEST_DATA.mission.hourlyRate,
        availability: {
          startDate: TEST_DATA.mission.startDate,
          endDate: TEST_DATA.mission.endDate,
          shifts: [TEST_DATA.mission.shift]
        }
      };

      const application = await this.makeRequest('/missions/applications', {
        method: 'POST',
        body: JSON.stringify(applicationData)
      });

      return {
        applicationId: application.id,
        status: application.status,
        nurseId: application.nurseId
      };
    });
  }

  // ÉTAPE 5: Acceptation de la candidature par l'établissement
  async acceptApplication(applicationId) {
    return await this.testStep('Acceptation de la candidature', async () => {
      const acceptanceData = {
        status: 'accepted',
        feedback: 'Candidature acceptée pour le test de workflow'
      };

      const result = await this.makeRequest(`/missions/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(acceptanceData)
      });

      return {
        applicationStatus: result.application.status,
        contractGenerated: !!result.contract,
        contractId: result.contract?.id
      };
    });
  }

  // ÉTAPE 6: Vérification du contrat généré
  async verifyGeneratedContract(contractId) {
    return await this.testStep('Vérification du contrat généré', async () => {
      const contracts = await this.makeRequest('/contracts/test-list');
      const contract = contracts.contracts.find(c => c.id === contractId);

      if (!contract) {
        throw new Error('Contrat non trouvé');
      }

      return {
        contractId: contract.id,
        status: contract.status,
        missionId: contract.missionId,
        nurseId: contract.nurseId,
        establishmentId: contract.establishmentId,
        terms: contract.terms,
        expiresAt: contract.expiresAt
      };
    });
  }

  // ÉTAPE 7: Signature électronique du candidat
  async signContractByNurse(contractId) {
    return await this.testStep('Signature électronique du candidat', async () => {
      const signatureData = {
        contractId: contractId,
        consent: true,
        userAgent: 'Test Workflow Script',
        ip: '127.0.0.1'
      };

      const result = await this.makeRequest(`/contracts/${contractId}/sign`, {
        method: 'POST',
        body: JSON.stringify(signatureData)
      });

      return {
        contractStatus: result.contract.status,
        signatures: result.contract.signatures,
        message: result.message
      };
    });
  }

  // ÉTAPE 8: Vérification finale du contrat
  async verifyFinalContract(contractId) {
    return await this.testStep('Vérification finale du contrat', async () => {
      const contracts = await this.makeRequest('/contracts/test-list');
      const contract = contracts.contracts.find(c => c.id === contractId);

      if (!contract) {
        throw new Error('Contrat final non trouvé');
      }

      return {
        contractId: contract.id,
        finalStatus: contract.status,
        hasNurseSignature: !!contract.signatures?.nurse,
        hasEstablishmentSignature: !!contract.signatures?.establishment,
        isCompleted: contract.status === 'signed_nurse' || contract.status === 'completed'
      };
    });
  }

  // Exécution du workflow complet
  async runCompleteWorkflow() {
    console.log('🚀 Démarrage du test de workflow complet NurseLinkAI');
    console.log('=' .repeat(60));

    try {
      // Étape 1: Vérification des données de base
      await this.verifyBaseData();

      // Étape 2: Création d'une mission
      const mission = await this.createTestMission();

      // Étape 3: Simulation du matching
      await this.simulateAIMatching(mission.missionId);

      // Étape 4: Création d'une candidature
      const application = await this.createApplication(mission.missionId);

      // Étape 5: Acceptation de la candidature
      const acceptance = await this.acceptApplication(application.applicationId);

      // Étape 6: Vérification du contrat généré
      await this.verifyGeneratedContract(acceptance.contractId);

      // Étape 7: Signature du candidat
      await this.signContractByNurse(acceptance.contractId);

      // Étape 8: Vérification finale
      await this.verifyFinalContract(acceptance.contractId);

      console.log('\n🎉 WORKFLOW COMPLET RÉUSSI !');
      console.log('=' .repeat(60));
      console.log('✅ Toutes les étapes ont été exécutées avec succès');
      console.log('📋 Résumé du workflow:');
      console.log(`   - Mission créée: ${mission.title}`);
      console.log(`   - Candidature acceptée: ${application.applicationId}`);
      console.log(`   - Contrat généré: ${acceptance.contractId}`);
      console.log(`   - Contrat signé par le candidat`);
      console.log(`   - Workflow complet validé`);

      return {
        success: true,
        steps: this.results,
        summary: {
          missionId: mission.missionId,
          applicationId: application.applicationId,
          contractId: acceptance.contractId
        }
      };

    } catch (error) {
      console.log('\n❌ WORKFLOW ÉCHOUÉ');
      console.log('=' .repeat(60));
      console.log(`Erreur à l'étape ${this.currentStep}: ${error.message}`);

      return {
        success: false,
        error: error.message,
        steps: this.results,
        failedAtStep: this.currentStep
      };
    }
  }
}

// Exécution du test
async function main() {
  const tester = new WorkflowTester();
  const result = await tester.runCompleteWorkflow();

  console.log('\n📊 RÉSULTAT FINAL:');
  console.log(JSON.stringify(result, null, 2));

  process.exit(result.success ? 0 : 1);
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Erreur non gérée:', reason);
  process.exit(1);
});

// Lancement du test
main().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
