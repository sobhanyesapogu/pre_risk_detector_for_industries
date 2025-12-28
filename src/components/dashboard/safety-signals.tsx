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
import { AlertTriangle, Clock, Activity, ChevronDown, ChevronUp, CheckCircle2, Brain } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { geminiRecommendationEngine, type RecommendationRequest } from "@/lib/gemini-recommendations";

const signals = [
  {
    icon: AlertTriangle,
    text: "Near-miss detected: Machine stop event",
    time: "2m ago",
    color: "text-red-500",
  },
  {
    icon: Clock,
    text: "15 hours continuous work detected",
    time: "15m ago",
    color: "text-blue-500",
  },
  {
    icon: Activity,
    text: "High machine usage pattern detected",
    time: "28m ago",
    color: "text-orange-500",
  },
   {
    icon: AlertTriangle,
    text: "8 near-miss incidents logged",
    time: "45m ago",
    color: "text-red-500",
  },
];

type SafetySignalsProps = {
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

export default function SafetySignals({ 
  riskLevel, 
  riskScore, 
  isAnalyzing, 
  currentFactors = [],
  currentData 
}: SafetySignalsProps) {
  const [showRecommendations, setShowRecommendations] = React.useState(false);
  const [aiRecommendations, setAiRecommendations] = React.useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = React.useState(false);

  const handleToggleRecommendations = async () => {
    soundManager.buttonClick();
    
    if (!showRecommendations && riskLevel === "High") {
      setLoadingRecommendations(true);
      
      try {
        const request: RecommendationRequest = {
          riskScore,
          riskLevel,
          factors: currentFactors,
          currentData: currentData || {
            continuous_work_hours: 12,
            near_miss_count: 6,
            machine_usage_level: 'high',
            shift_type: 'night',
            timestamp: new Date().toLocaleTimeString()
          }
        };
        
        console.log("🤖 Requesting AI recommendations...", request);
        const result = await geminiRecommendationEngine.generateRecommendations(request);
        console.log("✅ AI recommendations received:", result);
        
        setAiRecommendations(result.recommendations);
      } catch (error) {
        console.error("❌ Failed to get AI recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    }
    
    setShowRecommendations(!showRecommendations);
  };

  const handleAcknowledge = (action: string) => {
    soundManager.buttonClick();
    console.log(`✅ Action acknowledged: ${action}`);
  };

  // When risk is HIGH, show recommendations instead of signals
  if (riskLevel === "High") {
    return (
      <Card className="h-full border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Safety Recommendations
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            AI-powered preventive actions for high-risk window (Risk: {riskScore}/100)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleToggleRecommendations}
            className="w-full justify-between bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200"
            disabled={loadingRecommendations}
          >
            <span className="font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {loadingRecommendations ? "AI Analyzing..." : showRecommendations ? "Hide AI Recommendations" : "Get AI Recommendations"}
            </span>
            {loadingRecommendations ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
            ) : showRecommendations ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showRecommendations && aiRecommendations.length > 0 && (
            <div className="mt-3 space-y-3 p-3 bg-orange-100 dark:bg-orange-900 rounded border border-orange-300 dark:border-orange-700">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI-Generated Safety Actions:
              </p>
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{rec.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.reasoning}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${rec.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300' : 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300'}`}
                        >
                          {rec.priority} Priority
                        </Badge>
                        <span className="text-xs text-gray-500">{rec.timeframe}</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
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
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                🤖 Recommendations generated by Gemini AI based on current risk patterns.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Normal state: show detected safety signals
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI Recommendations</CardTitle>
        <CardDescription>AI-powered safety insights and preventive actions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {signals.map((signal, index) => (
            <li key={index} className="flex items-start gap-4">
              <div className={`mt-1 h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center bg-muted`}>
                <signal.icon className={`h-5 w-5 ${signal.color}`} />
              </div>
              <div>
                <p className="font-medium text-sm">{signal.text}</p>
                <p className="text-xs text-muted-foreground">{signal.time}</p>
              </div>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-700 dark:text-green-300">
            <strong>System Analysis:</strong> Risk progression from stable operations → 
            critical conditions (extended work periods, multiple near-misses, high machine stress)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}