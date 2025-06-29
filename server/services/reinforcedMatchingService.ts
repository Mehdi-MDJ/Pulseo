/**
 * ==============================================================================
 * NurseLink AI - Algorithme de Matching Déterministe Renforcé
 * ==============================================================================
 * 
 * Algorithme 100% local, transparent et RGPD-compliant
 * Remplace complètement les API externes d'IA
 * 
 * Caractéristiques :
 * - Calcul instantané (< 1ms par profil)
 * - Totalement explicable et auditables
 * - Critères fins et adaptatifs
 * - Système de pondération intelligent
 * ==============================================================================
 */

export interface NurseProfile {
  id: number;
  firstName: string;
  lastName: string;
  
  // Informations principales
  specializations: string[];
  experience: number;
  rating: number;
  completedMissions: number;
  
  // Certifications et compétences
  certifications: string[];
  languages: string[];
  technicalSkills: string[];
  
  // Préférences et disponibilités
  preferredShifts: string[];
  maxDistance: number;
  mobility: 'walking' | 'bike' | 'public_transport' | 'vehicle';
  
  // Expériences spécialisées
  nightShiftExperience: boolean;
  urgencyExperience: boolean;
  covidExperience: boolean;
  pediatricExperience: boolean;
  geriatricExperience: boolean;
  
  // Géolocalisation
  latitude: number;
  longitude: number;
  
  // Historique avec établissements
  establishmentHistory: { [establishmentId: number]: number }; // établissement -> nb missions réussies
  
  // Adaptabilité
  stressResistance: number; // 1-5
  teamwork: number; // 1-5
  flexibility: number; // 1-5
  
  // Statut
  isActive: boolean;
  lastMissionDate?: Date;
  
  // Préférences personnelles
  preferredPatientTypes: string[]; // ['adult', 'pediatric', 'geriatric']
  preferredEnvironments: string[]; // ['hospital', 'clinic', 'home_care']
}

export interface Mission {
  id: number;
  establishmentId: number;
  
  // Informations de base
  title: string;
  specialization: string;
  requiredExperience: number;
  urgency: 'low' | 'medium' | 'high';
  
  // Temporel
  startDate: Date;
  shift: string;
  duration: number; // heures
  
  // Localisation
  latitude: number;
  longitude: number;
  
  // Exigences techniques
  requiredCertifications: string[];
  requiredSkills: string[];
  
  // Contexte
  patientType: 'adult' | 'pediatric' | 'geriatric' | 'mixed';
  environment: 'hospital' | 'clinic' | 'home_care' | 'emergency';
  teamSize: number;
  stressLevel: number; // 1-5
  
  // Préférences
  preferredLanguages: string[];
  
  // Rémunération
  hourlyRate: number;
}

export interface MatchingConfig {
  // Seuils
  minimumScore: number;
  maxCandidates: number;
  maxDistance: number;
  
  // Pondération personnalisée (établissement)
  customWeights?: {
    specialization: number;
    experience: number;
    proximity: number;
    certifications: number;
    history: number;
    adaptability: number;
    availability: number;
  };
  
  // Critères spéciaux
  requireExactSpecialization: boolean;
  prioritizeHistory: boolean;
  emergencyMode: boolean; // réduit certains critères pour urgences
}

export interface MatchResult {
  nurseId: number;
  totalScore: number;
  
  // Détail des scores
  scores: {
    specialization: number;
    experience: number;
    proximity: number;
    certifications: number;
    adaptability: number;
    availability: number;
    history: number;
    bonus: number;
  };
  
  // Facteurs explicatifs
  factors: string[];
  warnings: string[];
  
  // Métadonnées
  distance: number;
  estimatedTravelTime: number;
  
  // Recommandation
  confidence: 'low' | 'medium' | 'high';
  priority: 'normal' | 'preferred' | 'excellent';
}

export class ReinforcedMatchingService {
  
  /**
   * Point d'entrée principal - trouve les meilleurs candidats
   */
  public findBestMatches(
    mission: Mission,
    nurses: NurseProfile[],
    config: MatchingConfig = this.getDefaultConfig()
  ): MatchResult[] {
    
    // Filtrage initial (élimine les non-éligibles)
    const eligibleNurses = this.filterEligibleNurses(nurses, mission, config);
    
    // Calcul des scores pour chaque candidat
    const matches = eligibleNurses.map(nurse => 
      this.calculateDetailedMatch(nurse, mission, config)
    );
    
    // Tri par score décroissant
    const sortedMatches = matches
      .filter(match => match.totalScore >= config.minimumScore)
      .sort((a, b) => b.totalScore - a.totalScore);
    
    // Limitation du nombre de candidats
    return sortedMatches.slice(0, config.maxCandidates);
  }
  
  /**
   * Filtrage initial pour éliminer les candidats non-éligibles
   */
  private filterEligibleNurses(
    nurses: NurseProfile[],
    mission: Mission,
    config: MatchingConfig
  ): NurseProfile[] {
    
    return nurses.filter(nurse => {
      // Vérifications de base
      if (!nurse.isActive) return false;
      
      // Distance maximale
      const distance = this.calculateDistance(
        nurse.latitude, nurse.longitude,
        mission.latitude, mission.longitude
      );
      if (distance > Math.min(nurse.maxDistance, config.maxDistance)) return false;
      
      // Expérience minimale absolue
      if (nurse.experience < Math.max(0, mission.requiredExperience - 1)) return false;
      
      // Spécialisation (sauf si mode urgence)
      if (config.requireExactSpecialization && !config.emergencyMode) {
        const hasSpecialization = nurse.specializations.some(spec =>
          this.isSpecializationMatch(spec, mission.specialization)
        );
        if (!hasSpecialization) return false;
      }
      
      // Certifications obligatoires
      if (mission.requiredCertifications.length > 0) {
        const hasRequiredCerts = mission.requiredCertifications.every(cert =>
          nurse.certifications.includes(cert)
        );
        if (!hasRequiredCerts) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Calcul détaillé du matching pour un infirmier
   */
  private calculateDetailedMatch(
    nurse: NurseProfile,
    mission: Mission,
    config: MatchingConfig
  ): MatchResult {
    
    const weights = config.customWeights || this.getDefaultWeights();
    const scores = {
      specialization: 0,
      experience: 0,
      proximity: 0,
      certifications: 0,
      adaptability: 0,
      availability: 0,
      history: 0,
      bonus: 0
    };
    
    const factors: string[] = [];
    const warnings: string[] = [];
    
    // 1. SPÉCIALISATION (30% max)
    const specializationResult = this.evaluateSpecialization(nurse, mission);
    scores.specialization = specializationResult.score * weights.specialization;
    factors.push(...specializationResult.factors);
    
    // 2. EXPÉRIENCE (25% max)
    const experienceResult = this.evaluateExperience(nurse, mission);
    scores.experience = experienceResult.score * weights.experience;
    factors.push(...experienceResult.factors);
    if (experienceResult.warning) warnings.push(experienceResult.warning);
    
    // 3. PROXIMITÉ (15% max)
    const proximityResult = this.evaluateProximity(nurse, mission);
    scores.proximity = proximityResult.score * weights.proximity;
    factors.push(...proximityResult.factors);
    
    // 4. CERTIFICATIONS (10% max)
    const certificationResult = this.evaluateCertifications(nurse, mission);
    scores.certifications = certificationResult.score * weights.certifications;
    factors.push(...certificationResult.factors);
    
    // 5. ADAPTABILITÉ (10% max)
    const adaptabilityResult = this.evaluateAdaptability(nurse, mission);
    scores.adaptability = adaptabilityResult.score * weights.adaptability;
    factors.push(...adaptabilityResult.factors);
    
    // 6. DISPONIBILITÉ (5% max)
    const availabilityResult = this.evaluateAvailability(nurse, mission);
    scores.availability = availabilityResult.score * weights.availability;
    factors.push(...availabilityResult.factors);
    
    // 7. HISTORIQUE (5% max)
    const historyResult = this.evaluateHistory(nurse, mission);
    scores.history = historyResult.score * weights.history;
    factors.push(...historyResult.factors);
    
    // 8. BONUS SPÉCIAUX
    const bonusResult = this.evaluateSpecialBonus(nurse, mission);
    scores.bonus = bonusResult.score;
    factors.push(...bonusResult.factors);
    
    // Score total
    const totalScore = Math.round(
      scores.specialization + scores.experience + scores.proximity +
      scores.certifications + scores.adaptability + scores.availability +
      scores.history + scores.bonus
    );
    
    // Calculs additionnels
    const distance = this.calculateDistance(
      nurse.latitude, nurse.longitude,
      mission.latitude, mission.longitude
    );
    
    const travelTime = this.estimateTravelTime(distance, nurse.mobility);
    
    // Niveau de confiance
    const confidence = this.calculateConfidence(totalScore, factors.length, warnings.length);
    
    // Priorité
    const priority = this.calculatePriority(totalScore, scores);
    
    return {
      nurseId: nurse.id,
      totalScore,
      scores,
      factors: factors.filter(f => f.length > 0),
      warnings,
      distance,
      estimatedTravelTime: travelTime,
      confidence,
      priority
    };
  }
  
  /**
   * Évaluation spécialisation
   */
  private evaluateSpecialization(nurse: NurseProfile, mission: Mission) {
    let score = 0;
    const factors: string[] = [];
    
    // Correspondance exacte
    if (nurse.specializations.includes(mission.specialization)) {
      score = 30;
      factors.push(`Spécialisation ${mission.specialization} maîtrisée`);
    }
    // Correspondance connexe
    else {
      const relatedSpec = this.findRelatedSpecialization(nurse.specializations, mission.specialization);
      if (relatedSpec) {
        score = 20;
        factors.push(`Spécialisation connexe (${relatedSpec})`);
      }
      // Spécialisation généraliste
      else if (nurse.specializations.includes('general') || nurse.specializations.includes('polyvalent')) {
        score = 15;
        factors.push('Profil polyvalent adaptable');
      }
    }
    
    // Bonus pour multi-spécialisations
    if (nurse.specializations.length > 2) {
      score += 3;
      factors.push('Multi-spécialisations');
    }
    
    return { score: Math.min(score, 30), factors };
  }
  
  /**
   * Évaluation expérience
   */
  private evaluateExperience(nurse: NurseProfile, mission: Mission) {
    let score = 0;
    const factors: string[] = [];
    let warning = '';
    
    const experienceRatio = nurse.experience / Math.max(mission.requiredExperience, 1);
    
    if (experienceRatio >= 2) {
      score = 25;
      factors.push(`Expérience largement suffisante (${nurse.experience} ans)`);
    } else if (experienceRatio >= 1.5) {
      score = 22;
      factors.push(`Très expérimenté (${nurse.experience} ans)`);
    } else if (experienceRatio >= 1) {
      score = 20;
      factors.push(`Expérience adéquate (${nurse.experience} ans)`);
    } else if (experienceRatio >= 0.8) {
      score = 15;
      factors.push(`Expérience proche du requis`);
      warning = 'Expérience légèrement insuffisante';
    } else {
      score = 8;
      warning = 'Expérience insuffisante pour cette mission';
    }
    
    // Bonus pour missions complétées
    if (nurse.completedMissions > 20) {
      score += 3;
      factors.push('Nombreuses missions réussies');
    } else if (nurse.completedMissions > 10) {
      score += 2;
      factors.push('Bon historique de missions');
    }
    
    return { score: Math.min(score, 25), factors, warning };
  }
  
  /**
   * Évaluation proximité géographique
   */
  private evaluateProximity(nurse: NurseProfile, mission: Mission) {
    const distance = this.calculateDistance(
      nurse.latitude, nurse.longitude,
      mission.latitude, mission.longitude
    );
    
    let score = 0;
    const factors: string[] = [];
    
    if (distance <= 2) {
      score = 15;
      factors.push('Très proche (≤2km)');
    } else if (distance <= 5) {
      score = 13;
      factors.push('Proche (≤5km)');
    } else if (distance <= 10) {
      score = 11;
      factors.push('À proximité (≤10km)');
    } else if (distance <= 20) {
      score = 8;
      factors.push('Distance raisonnable (≤20km)');
    } else if (distance <= 30) {
      score = 5;
      factors.push('Distance acceptable (≤30km)');
    } else {
      score = 2;
      factors.push('Distance importante (>30km)');
    }
    
    // Bonus mobilité
    if (nurse.mobility === 'vehicle' && distance > 10) {
      score += 2;
      factors.push('Véhicule personnel');
    }
    
    return { score: Math.min(score, 15), factors };
  }
  
  /**
   * Évaluation certifications
   */
  private evaluateCertifications(nurse: NurseProfile, mission: Mission) {
    let score = 0;
    const factors: string[] = [];
    
    // Certifications avancées
    const advancedCerts = ['BLS', 'ACLS', 'PALS', 'AFGSU'];
    const nurseAdvancedCerts = nurse.certifications.filter(cert => 
      advancedCerts.includes(cert)
    );
    
    if (nurseAdvancedCerts.length > 0) {
      score += Math.min(nurseAdvancedCerts.length * 3, 8);
      factors.push(`Certifications: ${nurseAdvancedCerts.join(', ')}`);
    }
    
    // Certifications spécialisées selon mission
    const specializedCerts = this.getSpecializedCertifications(mission.specialization);
    const nurseSpecializedCerts = nurse.certifications.filter(cert => 
      specializedCerts.includes(cert)
    );
    
    if (nurseSpecializedCerts.length > 0) {
      score += 4;
      factors.push('Certifications spécialisées');
    }
    
    // Langues
    if (mission.preferredLanguages.length > 0) {
      const commonLanguages = nurse.languages.filter(lang => 
        mission.preferredLanguages.includes(lang)
      );
      if (commonLanguages.length > 0) {
        score += 2;
        factors.push(`Langues: ${commonLanguages.join(', ')}`);
      }
    }
    
    return { score: Math.min(score, 10), factors };
  }
  
  /**
   * Évaluation adaptabilité
   */
  private evaluateAdaptability(nurse: NurseProfile, mission: Mission) {
    let score = 0;
    const factors: string[] = [];
    
    // Adaptation au stress
    if (mission.stressLevel <= nurse.stressResistance) {
      score += 4;
      factors.push('Résistance au stress adaptée');
    } else if (mission.stressLevel <= nurse.stressResistance + 1) {
      score += 2;
      factors.push('Peut gérer le niveau de stress');
    }
    
    // Travail en équipe
    if (mission.teamSize > 5 && nurse.teamwork >= 4) {
      score += 3;
      factors.push('Excellent travail en équipe');
    } else if (nurse.teamwork >= 3) {
      score += 2;
      factors.push('Bon esprit d\'équipe');
    }
    
    // Flexibilité
    if (nurse.flexibility >= 4) {
      score += 3;
      factors.push('Grande flexibilité');
    } else if (nurse.flexibility >= 3) {
      score += 2;
      factors.push('Bonne adaptabilité');
    }
    
    return { score: Math.min(score, 10), factors };
  }
  
  /**
   * Évaluation disponibilité
   */
  private evaluateAvailability(nurse: NurseProfile, mission: Mission) {
    let score = 0;
    const factors: string[] = [];
    
    // Préférence de shift
    if (nurse.preferredShifts.includes(mission.shift)) {
      score += 3;
      factors.push(`Préfère les ${mission.shift}`);
    } else if (nurse.preferredShifts.length === 0) {
      score += 2;
      factors.push('Flexible sur les horaires');
    }
    
    // Expérience du shift
    if (mission.shift === 'nuit' && nurse.nightShiftExperience) {
      score += 2;
      factors.push('Expérience équipes de nuit');
    }
    
    // Type de patient
    if (nurse.preferredPatientTypes.includes(mission.patientType)) {
      score += 1;
      factors.push(`Préfère patients ${mission.patientType}`);
    }
    
    return { score: Math.min(score, 5), factors };
  }
  
  /**
   * Évaluation historique
   */
  private evaluateHistory(nurse: NurseProfile, mission: Mission) {
    let score = 0;
    const factors: string[] = [];
    
    // Historique avec cet établissement
    const establishmentHistory = nurse.establishmentHistory[mission.establishmentId] || 0;
    if (establishmentHistory > 0) {
      score += Math.min(establishmentHistory, 4);
      factors.push(`${establishmentHistory} missions réussies dans cet établissement`);
    }
    
    // Note générale
    if (nurse.rating >= 4.8) {
      score += 1;
      factors.push('Excellent rating (4.8+)');
    } else if (nurse.rating >= 4.5) {
      score += 0.5;
      factors.push('Très bon rating (4.5+)');
    }
    
    return { score: Math.min(score, 5), factors };
  }
  
  /**
   * Bonus spéciaux
   */
  private evaluateSpecialBonus(nurse: NurseProfile, mission: Mission) {
    let score = 0;
    const factors: string[] = [];
    
    // Urgence et disponibilité immédiate
    if (mission.urgency === 'high') {
      const timeSinceLastMission = nurse.lastMissionDate 
        ? (Date.now() - nurse.lastMissionDate.getTime()) / (1000 * 60 * 60 * 24)
        : 30;
      
      if (timeSinceLastMission >= 7) {
        score += 5;
        factors.push('Disponible immédiatement pour urgence');
      }
    }
    
    // Expérience spécialisée selon contexte
    if (mission.specialization === 'urgences' && nurse.urgencyExperience) {
      score += 3;
      factors.push('Spécialisé urgences');
    }
    
    if (mission.patientType === 'pediatric' && nurse.pediatricExperience) {
      score += 3;
      factors.push('Expérience pédiatrique');
    }
    
    if (mission.patientType === 'geriatric' && nurse.geriatricExperience) {
      score += 3;
      factors.push('Expérience gériatrique');
    }
    
    // COVID et conditions spéciales
    if (mission.title.toLowerCase().includes('covid') && nurse.covidExperience) {
      score += 4;
      factors.push('Expérience COVID validée');
    }
    
    return { score: Math.min(score, 10), factors };
  }
  
  /**
   * Helpers et utilitaires
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
  
  private estimateTravelTime(distance: number, mobility: string): number {
    const speeds = {
      walking: 5,
      bike: 15,
      public_transport: 25,
      vehicle: 40
    };
    
    const speed = speeds[mobility as keyof typeof speeds] || 25;
    return Math.round((distance / speed) * 60); // minutes
  }
  
  private isSpecializationMatch(nurseSpec: string, missionSpec: string): boolean {
    return nurseSpec.toLowerCase() === missionSpec.toLowerCase() ||
           this.findRelatedSpecialization([nurseSpec], missionSpec) !== null;
  }
  
  private findRelatedSpecialization(nurseSpecs: string[], missionSpec: string): string | null {
    const connections: Record<string, string[]> = {
      'urgences': ['cardiologie', 'pneumologie', 'neurologie', 'traumatologie'],
      'cardiologie': ['urgences', 'reanimation', 'soins_intensifs'],
      'pediatrie': ['urgences', 'neonatologie', 'puericulture'],
      'geriatrie': ['neurologie', 'cardiologie', 'psychiatrie'],
      'reanimation': ['urgences', 'cardiologie', 'pneumologie', 'anesthesie'],
      'chirurgie': ['urgences', 'anesthesie', 'soins_intensifs'],
      'psychiatrie': ['neurologie', 'geriatrie', 'addictologie']
    };
    
    const relatedSpecs = connections[missionSpec.toLowerCase()] || [];
    return nurseSpecs.find(spec => 
      relatedSpecs.includes(spec.toLowerCase())
    ) || null;
  }
  
  private getSpecializedCertifications(specialization: string): string[] {
    const certsBySpec: Record<string, string[]> = {
      'urgences': ['AFGSU', 'ACLS', 'PALS'],
      'cardiologie': ['BLS', 'ACLS', 'ECG'],
      'pediatrie': ['PALS', 'Vaccination'],
      'reanimation': ['ACLS', 'BLS', 'Ventilation'],
      'chirurgie': ['BLS', 'Bloc_Operatoire', 'Sterilisation']
    };
    
    return certsBySpec[specialization.toLowerCase()] || [];
  }
  
  private calculateConfidence(score: number, factorsCount: number, warningsCount: number): 'low' | 'medium' | 'high' {
    if (score >= 85 && factorsCount >= 6 && warningsCount === 0) return 'high';
    if (score >= 70 && factorsCount >= 4 && warningsCount <= 1) return 'medium';
    return 'low';
  }
  
  private calculatePriority(score: number, scores: any): 'normal' | 'preferred' | 'excellent' {
    if (score >= 90) return 'excellent';
    if (score >= 75 && scores.specialization >= 25) return 'preferred';
    return 'normal';
  }
  
  private getDefaultWeights() {
    return {
      specialization: 1.0,
      experience: 1.0,
      proximity: 1.0,
      certifications: 1.0,
      adaptability: 1.0,
      availability: 1.0,
      history: 1.0
    };
  }
  
  private getDefaultConfig(): MatchingConfig {
    return {
      minimumScore: 60,
      maxCandidates: 10,
      maxDistance: 50,
      requireExactSpecialization: false,
      prioritizeHistory: false,
      emergencyMode: false
    };
  }
}

export const reinforcedMatchingService = new ReinforcedMatchingService();