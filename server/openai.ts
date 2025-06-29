import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-openai-api-key" 
});

interface NurseMatchScore {
  nurseId: number;
  score: number;
  reasoning: string;
  factors: string[];
}

export async function matchNursesToMission(missionId: number): Promise<void> {
  try {
    const mission = await storage.getMission(missionId);
    if (!mission) {
      throw new Error("Mission not found");
    }

    const availableNurses = await storage.getAvailableNurses();
    if (!availableNurses || availableNurses.length === 0) {
      console.log("No available nurses found for matching");
      return;
    }

    // Prepare mission context for AI
    const missionContext = {
      specialization: mission.specialization,
      location: mission.location,
      startDate: mission.startDate,
      endDate: mission.endDate,
      requirements: mission.requirements,
      priority: mission.priority,
      hourlyRate: mission.hourlyRate
    };

    // Prepare nurses data for matching
    const nursesContext = availableNurses.map(nurse => ({
      id: nurse.id,
      specialization: nurse.specialization,
      experience: nurse.experience,
      location: nurse.location,
      availability: nurse.availability,
      hourlyRate: nurse.hourlyRate
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI matching system for healthcare staffing. Analyze the mission requirements and rank nurses based on their suitability. Consider factors like:
          - Specialization match
          - Geographic proximity
          - Experience level
          - Availability alignment
          - Rate compatibility
          - Schedule fit
          
          Provide a score from 0-100 for each nurse and explain the reasoning. Respond with JSON in this format:
          {
            "matches": [
              {
                "nurseId": number,
                "score": number,
                "reasoning": "string explaining the match quality",
                "factors": ["factor1", "factor2", ...]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Mission: ${JSON.stringify(missionContext)}\n\nAvailable Nurses: ${JSON.stringify(nursesContext)}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Store match scores and create applications for top matches
    if (result.matches && Array.isArray(result.matches)) {
      for (const match of result.matches) {
        if (match.score >= 70) { // Only auto-apply for high-confidence matches
          await storage.createMissionApplication({
            missionId: mission.id,
            nurseId: match.nurseId,
            aiMatchScore: match.score.toString()
          });
        }
      }
    }

  } catch (error) {
    console.error("Error in AI matching:", error);
    // Don't throw - matching failures shouldn't break mission creation
  }
}

export async function generateAbsenceForecasts(establishmentId: number): Promise<void> {
  try {
    const establishment = await storage.getEstablishmentProfile("", establishmentId);
    if (!establishment) {
      throw new Error("Establishment not found");
    }

    // Get historical data for the establishment
    const historicalMissions = await storage.getMissionsForEstablishment(establishmentId);
    const recentMissions = historicalMissions?.slice(-50) || []; // Last 50 missions

    // Prepare historical context
    const historicalContext = {
      establishmentType: establishment.type,
      totalMissions: recentMissions.length,
      missionPatterns: recentMissions.map(m => ({
        date: m.startDate,
        specialization: m.specialization,
        priority: m.priority,
        status: m.status
      }))
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI system that predicts healthcare staff absences based on historical patterns, seasonal trends, and healthcare industry knowledge. Analyze the data and provide forecasts for the next 7-14 days.

          Consider factors like:
          - Seasonal illness patterns
          - Weekend/holiday staffing needs
          - Historical absence patterns
          - Healthcare industry trends
          - Emergency situations
          
          Provide confidence scores (0-100) and actionable insights. Respond with JSON in this format:
          {
            "forecasts": [
              {
                "date": "YYYY-MM-DD",
                "predictedAbsences": number,
                "confidence": number,
                "factors": ["factor1", "factor2"],
                "recommendation": "string with actionable advice"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Historical data for establishment: ${JSON.stringify(historicalContext)}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Store forecasts in database
    if (result.forecasts && Array.isArray(result.forecasts)) {
      for (const forecast of result.forecasts) {
        await storage.createAbsenceForecast({
          establishmentId,
          forecastDate: new Date(forecast.date),
          predictedAbsences: forecast.predictedAbsences,
          confidence: forecast.confidence.toString(),
          factors: forecast.factors
        });
      }
    }

  } catch (error) {
    console.error("Error generating absence forecasts:", error);
    throw new Error("Failed to generate absence forecasts");
  }
}

export async function analyzeNurseProfile(nurseProfile: any): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes nurse profiles and provides recommendations for improving their job matching potential. Consider their specialization, experience, and profile completeness.
          
          Respond with JSON in this format:
          {
            "recommendations": ["recommendation1", "recommendation2", ...]
          }`
        },
        {
          role: "user",
          content: `Nurse profile: ${JSON.stringify(nurseProfile)}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.recommendations || [];

  } catch (error) {
    console.error("Error analyzing nurse profile:", error);
    return ["Complete your profile to improve matching opportunities"];
  }
}
