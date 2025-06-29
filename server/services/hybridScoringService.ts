/**
 * ==============================================================================
 * NurseLink AI - Service de Scoring Hybride
 * ==============================================================================
 * 
 * Système de scoring à 3 niveaux :
 * - 70% Base obligatoire (équité garantie)
 * - 20% Critères modulaires (choix établissement)  
 * - 10% Critère spécifique (personnalisation)
 * ==============================================================================
 */

interface NurseProfile {
  id: number;
  specializations: string[];
  experience: number;
  rating: number;
  certifications: string[];
  languages: string[];
  mobility: string;
  nightShiftExperience: boolean;
  covidExperience: boolean;
  pediatricExperience: boolean;
  geriatricExperience: boolean;
  latitude: number;
  longitude: number;
  completedMissions: number;
}

interface Mission {
  specialization: string;
  requiredExperience: number;
  latitude: number;
  longitude: number;
  shift: string;
  urgency: string;
  startDate: Date;
}

interface EstablishmentConfig {
  customScoringEnabled: boolean;
  selectedCriteria: string[];
  customWeights: Record<string, number>;
  specificCriterion?: string;
  specificCriterionWeight: number;
}

interface ScoringResult {
  totalScore: number;
  breakdown: {
    baseScore: number;
    modularScore: number;
    specificScore: number;
  };
  factors: string[];
  isQualified: boolean;
}

// Critères modulaires disponibles
export const AVAILABLE_CRITERIA = {
  advanced_certifications: {
    name: "Certifications Avancées",
    description: "BLS, ACLS, PALS selon spécialité",
    maxPoints: 15
  },
  night_experience: {
    name: "Expérience Équipes de Nuit", 
    description: "Adaptation aux horaires nocturnes",
    maxPoints: 12
  },
  languages: {
    name: "Langues Étrangères",
    description: "Communication patients internationaux",
    maxPoints: 10
  },
  enhanced_mobility: {
    name: "Mobilité Renforcée",
    description: "Véhicule personnel, flexibilité déplacements",
    maxPoints: 8
  },
  specialized_experience: {
    name: "Expérience Spécialisée",
    description: "COVID, pédiatrie, gériatrie selon besoin",
    maxPoints: 15
  },
  mission_history: {
    name: "Historique Collaborations",
    description: "Missions réussies avec l'établissement",
    maxPoints: 20
  }
};

export class HybridScoringService {
  
  /**
   * Calcule le score hybride pour un infirmier sur une mission
   */
  public calculateScore(
    nurse: NurseProfile,
    mission: Mission, 
    establishmentConfig: EstablishmentConfig
  ): ScoringResult {
    
    const baseScore = this.calculateBaseScore(nurse, mission);
    const modularScore = this.calculateModularScore(nurse, mission, establishmentConfig);
    const specificScore = this.calculateSpecificScore(nurse, mission, establishmentConfig);
    
    const totalScore = Math.round(baseScore.score + modularScore.score + specificScore.score);
    
    const factors = [
      ...baseScore.factors,
      ...modularScore.factors,
      ...specificScore.factors
    ];
    
    return {
      totalScore,
      breakdown: {
        baseScore: baseScore.score,
        modularScore: modularScore.score,
        specificScore: specificScore.score
      },
      factors,
      isQualified: totalScore >= 60 // Seuil minimum
    };
  }
  
  /**
   * Score de base obligatoire (70 points max)
   * Non-négociable pour garantir l'équité
   */
  private calculateBaseScore(nurse: NurseProfile, mission: Mission) {
    let score = 0;
    const factors: string[] = [];
    
    // Spécialisation (30 points max)
    const specializationMatch = nurse.specializations.includes(mission.specialization);
    if (specializationMatch) {
      score += 30;
      factors.push("Spécialisation correspondante");
    } else {
      // Recherche correspondances partielles
      const partialMatch = this.findPartialSpecializationMatch(nurse.specializations, mission.specialization);
      if (partialMatch) {
        score += 15;
        factors.push(`Spécialisation connexe (${partialMatch})`);
      }
    }
    
    // Expérience (25 points max)
    if (nurse.experience >= mission.requiredExperience) {
      const experienceRatio = Math.min(nurse.experience / mission.requiredExperience, 2);
      const experiencePoints = Math.round(25 * Math.min(experienceRatio, 1));
      score += experiencePoints;
      factors.push(`Expérience ${nurse.experience} ans`);
      
      if (nurse.experience > mission.requiredExperience * 1.5) {
        factors.push("Expérience largement suffisante");
      }
    }
    
    // Distance géographique (15 points max)
    const distance = this.calculateDistance(
      nurse.latitude, nurse.longitude,
      mission.latitude, mission.longitude
    );
    
    if (distance <= 5) {
      score += 15;
      factors.push("Très proche (≤5km)");
    } else if (distance <= 15) {
      score += 12;
      factors.push("À proximité (≤15km)");
    } else if (distance <= 30) {
      score += 8;
      factors.push("Distance acceptable (≤30km)");
    } else if (distance <= 50) {
      score += 4;
      factors.push("Distance limite (≤50km)");
    }
    
    return { score, factors };
  }
  
  /**
   * Score modulaire (20 points max)
   * Établissement choisit 3-5 critères
   */
  private calculateModularScore(
    nurse: NurseProfile, 
    mission: Mission, 
    config: EstablishmentConfig
  ) {
    if (!config.customScoringEnabled) {
      return { score: 0, factors: [] };
    }
    
    let score = 0;
    const factors: string[] = [];
    const maxModularPoints = 20;
    const criteriaCount = config.selectedCriteria.length;
    const pointsPerCriterion = Math.floor(maxModularPoints / criteriaCount);
    
    for (const criterion of config.selectedCriteria) {
      const criterionScore = this.evaluateCriterion(criterion, nurse, mission);
      if (criterionScore.qualified) {
        score += pointsPerCriterion;
        factors.push(criterionScore.factor);
      }
    }
    
    return { score, factors };
  }
  
  /**
   * Score spécifique établissement (10 points max)
   * Critère unique défini par l'établissement
   */
  private calculateSpecificScore(
    nurse: NurseProfile,
    mission: Mission,
    config: EstablishmentConfig
  ) {
    if (!config.specificCriterion) {
      return { score: 0, factors: [] };
    }
    
    // Évaluation du critère spécifique
    // Pour la démo, on simule l'évaluation
    const isQualified = this.evaluateSpecificCriterion(
      config.specificCriterion, 
      nurse, 
      mission
    );
    
    if (isQualified) {
      return {
        score: config.specificCriterionWeight,
        factors: [config.specificCriterion]
      };
    }
    
    return { score: 0, factors: [] };
  }
  
  /**
   * Évalue un critère modulaire spécifique
   */
  private evaluateCriterion(criterion: string, nurse: NurseProfile, mission: Mission) {
    switch (criterion) {
      case 'advanced_certifications':
        const hasAdvancedCert = nurse.certifications.some(cert => 
          ['BLS', 'ACLS', 'PALS', 'AFGSU'].includes(cert)
        );
        return {
          qualified: hasAdvancedCert,
          factor: hasAdvancedCert ? "Certifications avancées validées" : ""
        };
        
      case 'night_experience':
        return {
          qualified: nurse.nightShiftExperience && mission.shift === 'nuit',
          factor: "Expérience équipes de nuit"
        };
        
      case 'languages':
        const speaksMultipleLanguages = nurse.languages.length > 1;
        return {
          qualified: speaksMultipleLanguages,
          factor: speaksMultipleLanguages ? `Langues: ${nurse.languages.join(', ')}` : ""
        };
        
      case 'enhanced_mobility':
        return {
          qualified: nurse.mobility === 'vehicle',
          factor: "Véhicule personnel"
        };
        
      case 'specialized_experience':
        let hasSpecializedExp = false;
        let specialization = "";
        
        if (mission.specialization.includes('covid') && nurse.covidExperience) {
          hasSpecializedExp = true;
          specialization = "COVID";
        } else if (mission.specialization.includes('pediatr') && nurse.pediatricExperience) {
          hasSpecializedExp = true;
          specialization = "pédiatrie";
        } else if (mission.specialization.includes('geriatr') && nurse.geriatricExperience) {
          hasSpecializedExp = true;
          specialization = "gériatrie";
        }
        
        return {
          qualified: hasSpecializedExp,
          factor: hasSpecializedExp ? `Expérience ${specialization}` : ""
        };
        
      case 'mission_history':
        // Simulation historique positif si plus de 5 missions
        const hasHistory = nurse.completedMissions > 5;
        return {
          qualified: hasHistory,
          factor: hasHistory ? "Historique missions positif" : ""
        };
        
      default:
        return { qualified: false, factor: "" };
    }
  }
  
  /**
   * Évalue le critère spécifique de l'établissement
   */
  private evaluateSpecificCriterion(
    criterion: string,
    nurse: NurseProfile,
    mission: Mission
  ): boolean {
    // Logique d'évaluation flexible selon le critère défini
    // Pour la démo, on simule quelques cas courants
    
    if (criterion.toLowerCase().includes('covid')) {
      return nurse.covidExperience;
    }
    
    if (criterion.toLowerCase().includes('urgence')) {
      return nurse.specializations.includes('urgences');
    }
    
    if (criterion.toLowerCase().includes('note') || criterion.toLowerCase().includes('rating')) {
      return nurse.rating >= 4.5;
    }
    
    // Par défaut, on considère que 60% des infirmiers qualifient
    return Math.random() > 0.4;
  }
  
  /**
   * Trouve une correspondance partielle de spécialisation
   */
  private findPartialSpecializationMatch(
    nurseSpecs: string[],
    missionSpec: string
  ): string | null {
    const connections: Record<string, string[]> = {
      'urgences': ['cardiologie', 'pneumologie', 'neurologie'],
      'cardiologie': ['urgences', 'reanimation'],
      'pediatrie': ['urgences', 'neonatologie'],
      'geriatrie': ['neurologie', 'cardiologie'],
      'reanimation': ['urgences', 'cardiologie', 'pneumologie']
    };
    
    const relatedSpecs = connections[missionSpec.toLowerCase()] || [];
    const match = nurseSpecs.find(spec => 
      relatedSpecs.includes(spec.toLowerCase())
    );
    
    return match || null;
  }
  
  /**
   * Calcule la distance entre deux points géographiques
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  /**
   * Génère une configuration de scoring par défaut pour un établissement
   */
  public getDefaultScoringConfig(): EstablishmentConfig {
    return {
      customScoringEnabled: false,
      selectedCriteria: [],
      customWeights: {},
      specificCriterionWeight: 10
    };
  }
  
  /**
   * Valide une configuration de scoring
   */
  public validateScoringConfig(config: EstablishmentConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (config.customScoringEnabled) {
      if (config.selectedCriteria.length < 2) {
        errors.push("Minimum 2 critères modulaires requis");
      }
      
      if (config.selectedCriteria.length > 5) {
        errors.push("Maximum 5 critères modulaires autorisés");
      }
      
      for (const criterion of config.selectedCriteria) {
        if (!AVAILABLE_CRITERIA[criterion as keyof typeof AVAILABLE_CRITERIA]) {
          errors.push(`Critère invalide: ${criterion}`);
        }
      }
      
      if (config.specificCriterionWeight < 5 || config.specificCriterionWeight > 15) {
        errors.push("Poids critère spécifique doit être entre 5 et 15 points");
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const hybridScoringService = new HybridScoringService();