/**
 * Gemini AI-powered recommendations system
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface RecommendationRequest {
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  factors: string[];
  currentData: {
    continuous_work_hours: number;
    near_miss_count: number;
    machine_usage_level: string;
    shift_type: string;
    timestamp: string;
  };
  operationalContext?: {
    upcomingOperationType?: string;
    workforceStatus?: string;
    environmentalFactors?: string[];
  };
}

export interface GeminiRecommendation {
  action: string;
  priority: "High" | "Medium" | "Low";
  timeframe: string;
  reasoning: string;
  expectedImpact: string;
}

export interface RecommendationResult {
  recommendations: GeminiRecommendation[];
  overallStrategy: string;
  urgencyLevel: "Immediate" | "Soon" | "Planned";
  confidence: number;
}

export class GeminiRecommendationEngine {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    // Use separate API key for recommendations (you can provide another key)
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_RECOMMENDATIONS_API_KEY || 
                   process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                   "demo-mode";
    
    console.log("Gemini Recommendations API Key status:", apiKey !== "demo-mode" ? "✅ API Key Found" : "❌ No API Key");
    
    if (apiKey && apiKey !== "demo-mode") {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("✅ Gemini Recommendations AI initialized successfully");
      } catch (error) {
        console.warn("❌ Gemini Recommendations API initialization failed:", error);
      }
    } else {
      console.log("🔄 Recommendations running in demo mode");
    }
  }

  async generateRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
    if (this.model) {
      try {
        return await this.geminiRecommendations(request);
      } catch (error) {
        console.warn("❌ Gemini recommendations failed, using fallback:", error);
        return this.fallbackRecommendations(request);
      }
    }
    
    return this.fallbackRecommendations(request);
  }

  private async geminiRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
    console.log("🤖 Calling Gemini AI for safety recommendations...", request);
    
    const prompt = `
You are an expert industrial safety consultant and risk management specialist. Based on the current risk assessment, generate specific, actionable safety recommendations.

CURRENT RISK SITUATION:
- Risk Score: ${request.riskScore}/100
- Risk Level: ${request.riskLevel}
- Contributing Factors: ${request.factors.join(', ')}

OPERATIONAL DATA:
- Continuous Work Hours: ${request.currentData.continuous_work_hours}h
- Near Miss Count: ${request.currentData.near_miss_count}
- Machine Usage Level: ${request.currentData.machine_usage_level}
- Shift Type: ${request.currentData.shift_type}
- Current Time: ${request.currentData.timestamp}

OPERATIONAL CONTEXT:
- Upcoming Operation: ${request.operationalContext?.upcomingOperationType || 'Standard operations'}
- Workforce Status: ${request.operationalContext?.workforceStatus || 'Normal staffing'}

REQUIREMENTS:
Generate 3-5 specific, actionable safety recommendations that address the current risk factors. Each recommendation should:

1. Be immediately implementable by supervisors
2. Directly address the identified risk factors
3. Have clear priority levels (High/Medium/Low)
4. Include realistic timeframes for implementation
5. Explain the reasoning behind each recommendation
6. Estimate the expected safety impact

Also provide:
- Overall safety strategy for the current situation
- Urgency level (Immediate/Soon/Planned)
- Confidence level in recommendations (0.0-1.0)

Respond ONLY with valid JSON in this exact format:
{
  "recommendations": [
    {
      "action": "Specific action to take",
      "priority": "High|Medium|Low",
      "timeframe": "Immediate|Next 10 minutes|Next 30 minutes|etc",
      "reasoning": "Why this action is needed",
      "expectedImpact": "Expected safety improvement"
    }
  ],
  "overallStrategy": "High-level approach to manage current risk",
  "urgencyLevel": "Immediate|Soon|Planned",
  "confidence": 0.95
}`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("🤖 Gemini Recommendations Response:", text);
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ Parsed Gemini recommendations:", parsed);
        
        return {
          recommendations: parsed.recommendations || [],
          overallStrategy: parsed.overallStrategy || "Monitor situation closely",
          urgencyLevel: parsed.urgencyLevel || "Soon",
          confidence: Math.min(Math.max(parsed.confidence || 0.8, 0), 1)
        };
      }
    } catch (parseError) {
      console.warn("❌ Failed to parse Gemini recommendations:", parseError);
    }
    
    return this.fallbackRecommendations(request);
  }

  private fallbackRecommendations(request: RecommendationRequest): RecommendationResult {
    console.log("🔄 Using fallback recommendations for:", request.riskLevel);
    
    const recommendations: GeminiRecommendation[] = [];
    
    // High risk recommendations
    if (request.riskLevel === "High") {
      if (request.currentData.continuous_work_hours > 12) {
        recommendations.push({
          action: "Immediately rotate fatigued operators to less critical positions",
          priority: "High",
          timeframe: "Immediate",
          reasoning: "Extended work hours significantly increase error probability",
          expectedImpact: "Reduces fatigue-related incidents by 60-80%"
        });
      }
      
      if (request.currentData.near_miss_count > 5) {
        recommendations.push({
          action: "Conduct emergency safety briefing and equipment inspection",
          priority: "High", 
          timeframe: "Next 15 minutes",
          reasoning: "High near-miss frequency indicates systemic safety breakdown",
          expectedImpact: "Prevents escalation to actual incidents"
        });
      }
      
      recommendations.push({
        action: "Reduce production speed by 30% until risk subsides",
        priority: "High",
        timeframe: "Immediate",
        reasoning: "Slower pace allows better safety protocol adherence",
        expectedImpact: "Significantly reduces accident probability"
      });
    }
    
    // Medium risk recommendations  
    else if (request.riskLevel === "Medium") {
      recommendations.push({
        action: "Schedule mandatory 15-minute safety break",
        priority: "Medium",
        timeframe: "Next 20 minutes", 
        reasoning: "Moderate risk requires attention reset",
        expectedImpact: "Improves alertness and safety awareness"
      });
      
      recommendations.push({
        action: "Increase supervisor presence on floor",
        priority: "Medium",
        timeframe: "Next 30 minutes",
        reasoning: "Enhanced oversight during elevated risk periods",
        expectedImpact: "Early detection of developing issues"
      });
    }
    
    // Low risk recommendations
    else {
      recommendations.push({
        action: "Continue standard safety monitoring procedures",
        priority: "Low",
        timeframe: "Ongoing",
        reasoning: "Current conditions are within acceptable parameters",
        expectedImpact: "Maintains baseline safety levels"
      });
    }
    
    return {
      recommendations,
      overallStrategy: request.riskLevel === "High" ? 
        "Immediate intervention required to prevent incidents" :
        request.riskLevel === "Medium" ?
        "Enhanced monitoring and preventive measures" :
        "Maintain standard safety protocols",
      urgencyLevel: request.riskLevel === "High" ? "Immediate" : 
                   request.riskLevel === "Medium" ? "Soon" : "Planned",
      confidence: 0.85
    };
  }
}

export const geminiRecommendationEngine = new GeminiRecommendationEngine();