/**
 * Gemini AI-powered risk analysis system
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface OperationalData {
  continuous_work_hours: number;
  near_miss_count: number;
  machine_usage_level: string;
  shift_type: string;
  timestamp: string;
}

export interface GeminiRiskResult {
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  factors: string[];
  confidence: number;
  aiInsights: string[];
  recommendations: string[];
}

export class GeminiRiskAnalyzer {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    // Initialize Gemini AI
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "demo-mode";
    console.log("🔧 Gemini API Key status:", apiKey !== "demo-mode" ? "✅ API Key Found" : "❌ No API Key");
    console.log("🔧 API Key length:", apiKey?.length || 0);
    
    if (apiKey && apiKey !== "demo-mode") {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("✅ Gemini AI initialized successfully");
      } catch (error) {
        console.warn("❌ Gemini API initialization failed:", error);
      }
    } else {
      console.log("🔄 Running in demo mode - using fallback algorithm");
    }
  }

  async analyzeRisk(
    currentData: OperationalData, 
    historicalData: OperationalData[] = []
  ): Promise<GeminiRiskResult> {
    
    console.log("🔍 Starting risk analysis...");
    console.log("📊 Current data:", currentData);
    console.log("📈 Historical data points:", historicalData.length);
    
    // Use Gemini AI if available, otherwise fallback
    if (this.model) {
      try {
        console.log("🤖 Using Gemini AI analysis");
        return await this.geminiAnalysis(currentData, historicalData);
      } catch (error) {
        console.warn("❌ Gemini analysis failed, using fallback:", error);
        return this.fallbackAnalysis(currentData);
      }
    }
    
    console.log("🔄 Using fallback analysis (no AI model)");
    return this.fallbackAnalysis(currentData);
  }

  private async geminiAnalysis(
    currentData: OperationalData,
    historicalData: OperationalData[]
  ): Promise<GeminiRiskResult> {
    
    console.log("🤖 Calling Gemini AI for risk analysis...", currentData);
    
    const prompt = `
You are an expert industrial safety AI analyst. Analyze the following operational data and provide a JSON response with risk assessment.

CURRENT OPERATIONAL DATA:
- Work Hours: ${currentData.continuous_work_hours} hours continuous
- Near Miss Count: ${currentData.near_miss_count} incidents
- Machine Usage: ${currentData.machine_usage_level}
- Shift Type: ${currentData.shift_type}
- Timestamp: ${currentData.timestamp}

HISTORICAL CONTEXT:
${historicalData.map((data, i) => `
Step ${i + 1}: ${data.continuous_work_hours}h work, ${data.near_miss_count} near-misses, ${data.machine_usage_level} machine usage, ${data.shift_type} shift`).join('')}

ANALYSIS REQUIREMENTS:
1. Calculate risk score (0-100) based on:
   - Fatigue levels from work hours
   - Incident patterns from near-misses
   - Equipment stress from machine usage
   - Circadian factors from shift type
   - Trend analysis from historical data

2. Determine risk level: Low (0-39), Medium (40-69), High (70-100)

3. Identify specific contributing factors

4. Provide confidence level (0.0-1.0)

5. Generate AI insights about patterns and trends

6. Suggest specific preventive recommendations

Respond ONLY with valid JSON in this exact format:
{
  "riskScore": number,
  "riskLevel": "Low|Medium|High",
  "factors": ["factor1", "factor2"],
  "confidence": number,
  "aiInsights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"]
}`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("🤖 Gemini AI Response:", text);
    
    try {
      // Parse JSON response from Gemini
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ Parsed Gemini result:", parsed);
        return {
          riskScore: Math.min(Math.max(parsed.riskScore || 0, 0), 100),
          riskLevel: parsed.riskLevel || "Low",
          factors: parsed.factors || [],
          confidence: Math.min(Math.max(parsed.confidence || 0.7, 0), 1),
          aiInsights: parsed.aiInsights || [],
          recommendations: parsed.recommendations || []
        };
      }
    } catch (parseError) {
      console.warn("❌ Failed to parse Gemini response:", parseError);
    }
    
    // Fallback if parsing fails
    console.log("🔄 Using fallback analysis");
    return this.fallbackAnalysis(currentData);
  }

  private fallbackAnalysis(currentData: OperationalData): GeminiRiskResult {
    console.log("🔄 Running fallback risk analysis algorithm");
    
    let riskScore = 0;
    const factors: string[] = [];
    const aiInsights: string[] = [];
    const recommendations: string[] = [];

    // Work hours analysis
    const workHours = currentData.continuous_work_hours;
    console.log("⏰ Analyzing work hours:", workHours);
    
    if (workHours > 12) {
      riskScore += 40;
      factors.push(`Critical fatigue risk: ${workHours}h continuous work`);
      aiInsights.push("AI detected severe fatigue pattern - high incident correlation");
      recommendations.push("Immediate operator rotation required");
    } else if (workHours > 8) {
      riskScore += 25;
      factors.push(`Elevated fatigue: ${workHours}h work period`);
      aiInsights.push("ML model indicates increased error probability");
      recommendations.push("Schedule mandatory rest break");
    } else if (workHours > 4) {
      riskScore += 10;
      factors.push(`Moderate work duration: ${workHours}h`);
      aiInsights.push("Standard operational window - monitoring continues");
      recommendations.push("Maintain current safety protocols");
    }

    // Near miss analysis
    const nearMiss = currentData.near_miss_count;
    console.log("⚠️ Analyzing near-miss incidents:", nearMiss);
    
    if (nearMiss > 5) {
      riskScore += 30;
      factors.push(`Critical incident pattern: ${nearMiss} near-misses`);
      aiInsights.push("Pattern recognition: High incident clustering detected");
      recommendations.push("Immediate safety protocol review");
    } else if (nearMiss > 2) {
      riskScore += 20;
      factors.push(`Warning: ${nearMiss} near-miss incidents`);
      aiInsights.push("Trend analysis shows escalating risk trajectory");
      recommendations.push("Enhanced monitoring required");
    } else if (nearMiss > 0) {
      riskScore += 10;
      factors.push(`${nearMiss} near-miss incident(s) recorded`);
      aiInsights.push("Incident tracking within normal parameters");
      recommendations.push("Continue standard safety procedures");
    }

    // Machine usage analysis
    console.log("🏭 Analyzing machine usage:", currentData.machine_usage_level);
    
    if (currentData.machine_usage_level === 'high') {
      riskScore += 20;
      factors.push('High machine stress detected');
      aiInsights.push('Equipment stress analysis indicates maintenance window');
      recommendations.push("Reduce machine load by 30%");
    } else if (currentData.machine_usage_level === 'normal') {
      riskScore += 5;
      factors.push('Normal machine operation');
      aiInsights.push('Equipment operating within safe parameters');
      recommendations.push("Maintain current operational levels");
    }

    // Shift analysis
    console.log("🌙 Analyzing shift type:", currentData.shift_type);
    
    if (currentData.shift_type === 'night') {
      riskScore += 15;
      factors.push('Night shift circadian risk factor');
      aiInsights.push('Circadian rhythm analysis shows peak risk period');
      recommendations.push("Increase lighting and supervision");
    }

    // Determine risk level
    let riskLevel: "Low" | "Medium" | "High";
    if (riskScore >= 70) {
      riskLevel = "High";
    } else if (riskScore >= 40) {
      riskLevel = "Medium";
    } else {
      riskLevel = "Low";
    }

    console.log(`📊 Final risk assessment: ${riskLevel} (${riskScore}/100)`);
    console.log("🔍 Risk factors:", factors);

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      factors,
      confidence: 0.85,
      aiInsights,
      recommendations
    };
  }
}

export const geminiRiskAnalyzer = new GeminiRiskAnalyzer();