/**
 * Gemini AI-powered risk analysis system - Optimized for Vercel
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
  private cache = new Map<string, GeminiRiskResult>();
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    // Initialize Gemini AI
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "demo-mode";
    console.log("🔧 Gemini API Key status:", apiKey !== "demo-mode" ? "✅ API Key Found" : "❌ No API Key");
    console.log("🔧 API Key length:", apiKey?.length || 0);
    
    if (apiKey && apiKey !== "demo-mode") {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: "gemini-pro",
          generationConfig: {
            temperature: 0.1, // More consistent results
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 1024, // Limit response size
          }
        });
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
    
    // Create cache key
    const cacheKey = `${currentData.continuous_work_hours}-${currentData.near_miss_count}-${currentData.machine_usage_level}-${currentData.shift_type}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log("⚡ Using cached result");
      return this.cache.get(cacheKey)!;
    }
    
    // In production, prefer fallback for speed unless it's a critical analysis
    if (this.isProduction && currentData.continuous_work_hours < 10 && currentData.near_miss_count < 3) {
      console.log("⚡ Using fast fallback analysis for production");
      const result = this.fallbackAnalysis(currentData);
      this.cache.set(cacheKey, result);
      return result;
    }
    
    // Use Gemini AI if available, otherwise fallback
    if (this.model) {
      try {
        console.log("🤖 Using Gemini AI analysis");
        const result = await Promise.race([
          this.geminiAnalysis(currentData, historicalData),
          new Promise<GeminiRiskResult>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000) // 5 second timeout
          )
        ]);
        this.cache.set(cacheKey, result);
        return result;
      } catch (error) {
        console.warn("❌ Gemini analysis failed, using fallback:", error);
        const result = this.fallbackAnalysis(currentData);
        this.cache.set(cacheKey, result);
        return result;
      }
    }
    
    console.log("🔄 Using fallback analysis (no AI model)");
    const result = this.fallbackAnalysis(currentData);
    this.cache.set(cacheKey, result);
    return result;
  }

  private async geminiAnalysis(
    currentData: OperationalData,
    historicalData: OperationalData[]
  ): Promise<GeminiRiskResult> {
    
    console.log("🤖 Calling Gemini AI for risk analysis...");
    
    // Simplified prompt for faster response
    const prompt = `Analyze industrial safety risk. Return JSON only:
Work: ${currentData.continuous_work_hours}h, Near-miss: ${currentData.near_miss_count}, Machine: ${currentData.machine_usage_level}, Shift: ${currentData.shift_type}

Format: {"riskScore":0-100,"riskLevel":"Low|Medium|High","factors":["factor1"],"confidence":0.8,"aiInsights":["insight1"],"recommendations":["rec1"]}`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("🤖 Gemini AI Response received");
    
    try {
      // Parse JSON response from Gemini
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ Parsed Gemini result");
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
    console.log("🔄 Running optimized fallback analysis");
    
    let riskScore = 0;
    const factors: string[] = [];
    const aiInsights: string[] = [];
    const recommendations: string[] = [];

    // Optimized work hours analysis
    const workHours = currentData.continuous_work_hours;
    
    if (workHours > 12) {
      riskScore += 40;
      factors.push(`Critical fatigue: ${workHours}h`);
      aiInsights.push("Severe fatigue detected");
      recommendations.push("Immediate rotation required");
    } else if (workHours > 8) {
      riskScore += 25;
      factors.push(`High fatigue: ${workHours}h`);
      aiInsights.push("Increased error probability");
      recommendations.push("Schedule rest break");
    } else if (workHours > 4) {
      riskScore += 10;
      factors.push(`Moderate duration: ${workHours}h`);
      aiInsights.push("Standard monitoring");
      recommendations.push("Continue protocols");
    }

    // Optimized near miss analysis
    const nearMiss = currentData.near_miss_count;
    
    if (nearMiss > 5) {
      riskScore += 30;
      factors.push(`Critical incidents: ${nearMiss}`);
      aiInsights.push("High incident clustering");
      recommendations.push("Safety review required");
    } else if (nearMiss > 2) {
      riskScore += 20;
      factors.push(`Warning: ${nearMiss} incidents`);
      aiInsights.push("Escalating risk trend");
      recommendations.push("Enhanced monitoring");
    } else if (nearMiss > 0) {
      riskScore += 10;
      factors.push(`${nearMiss} incident(s)`);
      aiInsights.push("Normal parameters");
      recommendations.push("Standard procedures");
    }

    // Machine usage analysis
    if (currentData.machine_usage_level === 'high') {
      riskScore += 20;
      factors.push('High machine stress');
      aiInsights.push('Equipment stress detected');
      recommendations.push("Reduce load 30%");
    } else if (currentData.machine_usage_level === 'normal') {
      riskScore += 5;
      factors.push('Normal operation');
      aiInsights.push('Safe parameters');
      recommendations.push("Maintain levels");
    }

    // Shift analysis
    if (currentData.shift_type === 'night') {
      riskScore += 15;
      factors.push('Night shift risk');
      aiInsights.push('Peak risk period');
      recommendations.push("Increase supervision");
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

    console.log(`📊 Risk: ${riskLevel} (${riskScore}/100)`);

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