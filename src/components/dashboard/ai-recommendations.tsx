"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { geminiRecommendationEngine, type RecommendationRequest } from "@/lib/gemini-recommendations";

type AIRecommendationsProps = {
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number;
  isAnalyzing: boolean;
  currentFactors?: string[];
  currentData?: {
    continuous_work_hours: number;
    near_miss_count: number;
    machine_usage_level: string;
    shift_type: string;
    timestamp: string;
  };
};

export default function AIRecommendations({ 
  riskLevel, 
  riskScore, 
  isAnalyzing, 
  currentFactors = [],
  currentData 
}: AIRecommendationsProps) {
  const [aiRecommendations, setAiRecommendations] = React.useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");

  const generateRecommendations = async () => {
    soundManager.buttonClick();
    setLoadingRecommendations(true);
    
    try {
      const request: RecommendationRequest = {
        riskScore,
        riskLevel,
        factors: currentFactors,
        currentData: currentData || {
          continuous_work_hours: 8,
          near_miss_count: 2,
          machine_usage_level: 'normal',
          shift_type: 'day',
          timestamp: new Date().toLocaleTimeString()
        }
      };
      
      console.log("🤖 Requesting AI recommendations...", request);
      const result = await geminiRecommendationEngine.generateRecommendations(request);
      console.log("✅ AI recommendations received:", result);
      
      setAiRecommendations(result.recommendations);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("❌ Failed to get AI recommendations:", error);
      // Fallback recommendations
      setAiRecommendations([
        {
          action: "Implement mandatory rest break",
          reasoning: "Extended work hours detected - fatigue increases accident risk",
          priority: "High",
          timeframe: "Immediate",
          expectedImpact: "30% risk reduction"
        },
        {
          action: "Increase safety monitoring",
          reasoning: "Current risk patterns suggest enhanced supervision needed",
          priority: "Medium", 
          timeframe: "Next 2 hours",
          expectedImpact: "20% risk reduction"
        }
      ]);
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAcknowledge = (action: string) => {
    soundManager.buttonClick();
    console.log(`✅ Action acknowledged: ${action}`);
  };

  // Auto-generate recommendations when risk level changes
  React.useEffect(() => {
    if (riskLevel === "Medium" || riskLevel === "High") {
      generateRecommendations();
    }
  }, [riskLevel, riskScore]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          AI-powered safety insights and preventive actions
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-120px)]">
        <div className="h-full flex flex-col space-y-4">
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${
                  riskLevel === "High" ? "bg-red-100 text-red-800 border-red-200" :
                  riskLevel === "Medium" ? "bg-orange-100 text-orange-800 border-orange-200" :
                  "bg-green-100 text-green-800 border-green-200"
                }`}
              >
                Risk: {riskLevel}
              </Badge>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateRecommendations}
              disabled={loadingRecommendations}
              className="h-8"
            >
              {loadingRecommendations ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Brain className="h-3 w-3" />
              )}
              {loadingRecommendations ? "AI Thinking..." : "Refresh"}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[250px] md:max-h-[300px]">
            {loadingRecommendations && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Brain className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">AI analyzing risk patterns...</p>
                </div>
              </div>
            )}

            {!loadingRecommendations && aiRecommendations.length > 0 && (
              <div className="space-y-3 pr-2">
                {aiRecommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm font-medium">{rec.action}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{rec.reasoning}</p>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              rec.priority === 'High' ? 
                              'bg-red-100 text-red-800 border-red-200' : 
                              'bg-orange-100 text-orange-800 border-orange-200'
                            }`}
                          >
                            {rec.priority} Priority
                          </Badge>
                          <span className="text-xs text-muted-foreground">{rec.timeframe}</span>
                        </div>
                        <p className="text-xs text-green-600">
                          Expected Impact: {rec.expectedImpact}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAcknowledge(rec.action)}
                        className="ml-2 h-8 text-xs"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Done
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingRecommendations && aiRecommendations.length === 0 && (
              <div className="text-center p-6">
                <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No AI recommendations yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRecommendations}
                  className="text-xs"
                >
                  <Brain className="mr-1 h-3 w-3" />
                  Generate AI Insights
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}