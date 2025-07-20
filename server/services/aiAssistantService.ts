/**
 * ==============================================================================
 * NurseLink AI - Service Assistant IA Conversationnel
 * ==============================================================================
 *
 * Assistant IA intelligent pour accompagnement personnalisé des utilisateurs
 * Fonctionnalités : recommandations, négociation, planification carrière
 * ==============================================================================
 */

import OpenAI from "openai";
import { storage } from "./storageService";
import type { User, NurseProfile, EstablishmentProfile, Mission } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConversationContext {
  userId: string;
  userRole: 'nurse' | 'establishment';
  conversationHistory: ConversationMessage[];
  userProfile?: NurseProfile | EstablishmentProfile;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  actions?: RecommendedAction[];
  data?: any;
}

interface RecommendedAction {
  type: 'view_mission' | 'apply_mission' | 'update_profile' | 'schedule_interview' | 'negotiate_rate';
  label: string;
  url?: string;
  data?: any;
}

export class AIAssistantService {
  private conversations = new Map<string, ConversationContext>();

  /**
   * Traitement d'un message utilisateur avec réponse IA intelligente
   */
  async processMessage(userId: string, message: string): Promise<AIResponse> {
    try {
      // Récupération ou création du contexte de conversation
      let context = this.conversations.get(userId);
      if (!context) {
        context = await this.initializeContext(userId);
        this.conversations.set(userId, context);
      }

      // Ajout du message utilisateur à l'historique
      context.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Génération de la réponse IA avec contexte
      const aiResponse = await this.generateResponse(context, message);

      // Ajout de la réponse IA à l'historique
      context.conversationHistory.push({
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        metadata: {
          suggestions: aiResponse.suggestions,
          actions: aiResponse.actions
        }
      });

      return aiResponse;
    } catch (error) {
      console.error('Erreur assistant IA:', error);
      return {
        message: "Je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
        suggestions: ["Essayer une question plus simple", "Contacter le support"]
      };
    }
  }

  /**
   * Initialisation du contexte de conversation
   */
  private async initializeContext(userId: string): Promise<ConversationContext> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    let userProfile: NurseProfile | EstablishmentProfile | undefined;

    if (user.role === 'nurse') {
      userProfile = await storage.getNurseProfile(userId);
    } else if (user.role === 'establishment') {
      userProfile = await storage.getEstablishmentProfile(userId);
    }

    return {
      userId,
      userRole: user.role as 'nurse' | 'establishment',
      conversationHistory: [],
      userProfile
    };
  }

  /**
   * Génération de réponse IA contextuelle
   */
  private async generateResponse(context: ConversationContext, message: string): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    const conversationHistory = this.formatConversationHistory(context);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // le modèle OpenAI le plus récent est "gpt-4o" sorti le 13 mai 2024
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Enrichissement avec actions personnalisées
    const actions = await this.generateRecommendedActions(context, message, result);

    return {
      message: result.message || "Comment puis-je vous aider ?",
      suggestions: result.suggestions || [],
      actions,
      data: result.data
    };
  }

  /**
   * Construction du prompt système personnalisé
   */
  private buildSystemPrompt(context: ConversationContext): string {
    const basePrompt = `Tu es l'assistant IA de NurseLink AI, plateforme de recrutement médical intelligent.

Utilisateur: ${context.userRole === 'nurse' ? 'Infirmier(ère)' : 'Établissement de santé'}
Profil: ${context.userProfile ? 'Profil complet' : 'Profil à compléter'}

Tes capacités:
- Recommandations de missions personnalisées
- Négociation de tarifs et conditions
- Planification de carrière
- Optimisation de profil
- Analytics et insights
- Support administratif

Style de communication:
- Professionnel mais chaleureux
- Réponses concises et actionables
- Toujours proposer des actions concrètes
- Utiliser le tutoiement amical

Format de réponse JSON obligatoire:
{
  "message": "ta réponse principale",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "data": { eventuelles données structurées }
}`;

    if (context.userRole === 'nurse') {
      return basePrompt + `

Spécialisation infirmier:
- Recommander des missions adaptées
- Aider à améliorer le profil
- Conseiller sur la négociation de tarifs
- Planifier l'évolution de carrière
- Suggérer des formations
`;
    } else {
      return basePrompt + `

Spécialisation établissement:
- Aider à rédiger des offres attractives
- Optimiser le processus de recrutement
- Analyser les performances RH
- Prévoir les besoins en personnel
- Réduire les coûts de recrutement
`;
    }
  }

  /**
   * Formatage de l'historique de conversation
   */
  private formatConversationHistory(context: ConversationContext): any[] {
    return context.conversationHistory.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Génération d'actions recommandées
   */
  private async generateRecommendedActions(
    context: ConversationContext,
    message: string,
    aiResult: any
  ): Promise<RecommendedAction[]> {
    const actions: RecommendedAction[] = [];

    // Actions spécifiques aux infirmiers
    if (context.userRole === 'nurse') {
      // Si demande de missions
      if (message.toLowerCase().includes('mission') || message.toLowerCase().includes('travail')) {
        actions.push({
          type: 'view_mission',
          label: 'Voir les missions recommandées',
          url: '/dashboard'
        });
      }

      // Si question sur profil
      if (message.toLowerCase().includes('profil') || message.toLowerCase().includes('cv')) {
        actions.push({
          type: 'update_profile',
          label: 'Optimiser mon profil',
          url: '/profile'
        });
      }
    }

    // Actions spécifiques aux établissements
    if (context.userRole === 'establishment') {
      // Si question sur recrutement
      if (message.toLowerCase().includes('recruter') || message.toLowerCase().includes('personnel')) {
        actions.push({
          type: 'view_mission',
          label: 'Créer une nouvelle mission',
          url: '/missions/create'
        });
      }
    }

    return actions;
  }

  /**
   * Recommandations de missions personnalisées pour infirmiers
   */
  async recommendMissions(userId: string, filters?: any): Promise<Mission[]> {
    try {
      const nurseProfile = await storage.getNurseProfile(userId);
      if (!nurseProfile) {
        return [];
      }

      // Récupération des missions disponibles
      const allMissions = await storage.getAllMissions();

      // Scoring IA pour correspondance
      const scoredMissions = await Promise.all(
        allMissions.map(async (mission) => {
          const score = await this.calculateMissionScore(nurseProfile, mission);
          return { mission, score };
        })
      );

      // Tri par score décroissant
      scoredMissions.sort((a, b) => b.score - a.score);

      return scoredMissions.slice(0, 10).map(item => item.mission);
    } catch (error) {
      console.error('Erreur recommandations missions:', error);
      return [];
    }
  }

  /**
   * Calcul de score de correspondance mission-infirmier
   */
  private async calculateMissionScore(nurse: NurseProfile, mission: Mission): Promise<number> {
    const prompt = `Calcule un score de correspondance (0-100) entre ce profil infirmier et cette mission.

Profil infirmier:
- Spécialisations: ${nurse.specializations?.join(', ') || 'Non spécifié'}
- Expérience: ${nurse.experience || 0} ans
- Certifications: ${nurse.certifications?.join(', ') || 'Aucune'}
- Disponible: ${nurse.availability ? 'Oui' : 'Non'}

Mission:
- Titre: ${mission.title}
- Spécialisation: ${mission.specialization || 'Non spécifiée'}
- Tarif: ${mission.hourlyRate}€/h
- Durée: ${mission.durationDays} jours
- Urgence: ${mission.urgencyLevel}

Réponds uniquement avec un JSON:
{
  "score": nombre_entre_0_et_100,
  "reasoning": "explication_courte"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // le modèle OpenAI le plus récent est "gpt-4o" sorti le 13 mai 2024
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{"score": 50}');
      return Math.max(0, Math.min(100, result.score));
    } catch (error) {
      console.error('Erreur calcul score:', error);
      return 50; // Score neutre en cas d'erreur
    }
  }

  /**
   * Négociation automatique de tarifs
   */
  async negotiateRate(missionId: number, nurseId: string, proposedRate: number): Promise<{
    success: boolean;
    negotiatedRate?: number;
    message: string;
  }> {
    try {
      const mission = await storage.getMission(missionId);
      const nurse = await storage.getNurseProfile(nurseId);

      if (!mission || !nurse) {
        return {
          success: false,
          message: "Mission ou profil infirmier non trouvé"
        };
      }

      const prompt = `Tu es un expert en négociation salariale pour le secteur médical.

Mission:
- Tarif initial: ${mission.hourlyRate}€/h
- Spécialisation: ${mission.specialization}
- Urgence: ${mission.urgencyLevel}
- Durée: ${mission.durationDays} jours

Profil infirmier:
- Expérience: ${nurse.experience} ans
- Spécialisations: ${nurse.specializations?.join(', ')}
- Note: ${nurse.rating}/5

Tarif proposé par l'infirmier: ${proposedRate}€/h

Détermine si la négociation est acceptable et propose un tarif final.

Réponds avec un JSON:
{
  "success": true/false,
  "negotiatedRate": tarif_final_ou_null,
  "message": "explication_de_la_decision"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // le modèle OpenAI le plus récent est "gpt-4o" sorti le 13 mai 2024
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || '{"success": false, "message": "Erreur de négociation"}');
    } catch (error) {
      console.error('Erreur négociation:', error);
      return {
        success: false,
        message: "Erreur technique lors de la négociation"
      };
    }
  }

  /**
   * Planification de carrière personnalisée
   */
  async planCareer(userId: string): Promise<{
    currentLevel: string;
    nextSteps: string[];
    recommendedTrainings: string[];
    salaryProjection: { year: number; expectedSalary: number }[];
  }> {
    try {
      const nurse = await storage.getNurseProfile(userId);
      if (!nurse) {
        throw new Error('Profil infirmier non trouvé');
      }

      const prompt = `Analyse ce profil infirmier et propose un plan de carrière sur 3 ans.

Profil:
- Expérience: ${nurse.experience} ans
- Spécialisations: ${nurse.specializations?.join(', ')}
- Certifications: ${nurse.certifications?.join(', ')}
- Note actuelle: ${nurse.rating}/5

Réponds avec un JSON:
{
  "currentLevel": "niveau_actuel",
  "nextSteps": ["étape 1", "étape 2", "étape 3"],
  "recommendedTrainings": ["formation 1", "formation 2"],
  "salaryProjection": [
    {"year": 2025, "expectedSalary": 35000},
    {"year": 2026, "expectedSalary": 38000},
    {"year": 2027, "expectedSalary": 42000}
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // le modèle OpenAI le plus récent est "gpt-4o" sorti le 13 mai 2024
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.6
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Erreur planification carrière:', error);
      return {
        currentLevel: "Infirmier expérimenté",
        nextSteps: ["Continuer à développer vos compétences"],
        recommendedTrainings: ["Formation continue recommandée"],
        salaryProjection: []
      };
    }
  }
}

export const aiAssistantService = new AIAssistantService();
