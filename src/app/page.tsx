"use client";

import * as React from "react";
import { runAnalysis } from "@/app/actions";
import type { GenerateRiskAlertOutput } from "@/ai/flows/generate-risk-alert";
import { soundManager } from "@/lib/sounds";
import { geminiRiskAnalyzer, type OperationalData } from "@/lib/gemini-risk-analyzer";
import { databaseService } from "@/lib/database";

import Header from "@/components/dashboard/header";
import RiskOverview from "@/components/dashboard/risk-overview";
import RiskTimeline from "@/components/dashboard/risk-timeline";
import OperationalControls from "@/components/dashboard/operational-controls";
import AlertCard from "@/components/dashboard/alert-card";
import WearableNotification from "@/components/dashboard/wearable-notification";
import Footer from "@/components/dashboard/footer";
import RiskDetailsSheet from "@/components/dashboard/risk-details-sheet";
import PreventiveActions from "@/components/dashboard/preventive-actions";
import AIRecommendations from "@/components/dashboard/ai-recommendations";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState<"control" | "recommendations">("control");
  const [riskLevel, setRiskLevel] = React.useState<"Low" | "Medium" | "High">("Low");
  const [riskScore, setRiskScore] = React.useState(12);
  const [alertData, setAlertData] = React.useState<GenerateRiskAlertOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = React.useState(false);
  const [prevRiskLevel, setPrevRiskLevel] = React.useState<"Low" | "Medium" | "High">("Low");
  const [uploadedData, setUploadedData] = React.useState<OperationalData[]>([]);
  const [currentFactors, setCurrentFactors] = React.useState<string[]>([]);
  const [liveTimelineData, setLiveTimelineData] = React.useState<Array<{time: string, risk: number, workHours: number, nearMiss: number}>>([]);
  const [currentAnalysisStep, setCurrentAnalysisStep] = React.useState(0);
  const [currentSessionId, setCurrentSessionId] = React.useState<string>("");

  // Play sound when risk level changes
  React.useEffect(() => {
    if (riskLevel !== prevRiskLevel) {
      soundManager.riskLevelChange(riskLevel);
      setPrevRiskLevel(riskLevel);
    }
  }, [riskLevel, prevRiskLevel]);

  // Initialize sound system on component mount
  React.useEffect(() => {
    const initSound = async () => {
      try {
        await soundManager.initialize();
      } catch (error) {
        console.warn('Sound initialization failed:', error);
      }
    };
    initSound();
  }, []);

  const handleDataUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data: OperationalData[] = lines.slice(1).map(line => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim();
        });
        return {
          continuous_work_hours: parseFloat(row.continuous_work_hours || '0'),
          near_miss_count: parseInt(row.near_miss_count || '0'),
          machine_usage_level: row.machine_usage_level || 'low',
          shift_type: row.shift_type || 'day',
          timestamp: row.timestamp || `Step ${Date.now()}`
        };
      }).filter(row => row.continuous_work_hours > 0); // Filter valid rows
      
      setUploadedData(data);
      console.log('CSV data uploaded for AI analysis:', data);
    };
    reader.readAsText(file);
  };

  const handleStartAnalysis = async () => {
    console.log("🚀 Starting analysis...");
    console.log("📊 Uploaded data length:", uploadedData.length);
    
    soundManager.simulationStart();
    setIsAnalyzing(true);
    setAlertData(null);
    setRiskLevel("Low");
    setRiskScore(15);
    setLiveTimelineData([]);
    setCurrentAnalysisStep(0);
    
    try {
      // Create database session
      const sessionId = await databaseService.createSession({
        sessionId: `session_${Date.now()}`,
        startTime: new Date() as any,
        status: 'running',
        totalSteps: uploadedData.length > 0 ? uploadedData.length : 8,
        dataSource: uploadedData.length > 0 ? 'csv' : 'demo',
        uploadedFileName: uploadedData.length > 0 ? 'uploaded_data.csv' : undefined
      });
      
      setCurrentSessionId(sessionId);
      console.log("📝 Database session created:", sessionId);
      
      if (uploadedData.length > 0) {
        console.log("📁 Using uploaded CSV data with AI");
        await simulateWithAI(sessionId);
      } else {
        console.log("🎮 Running demo mode with sample data");
        await simulateWithDemoData(sessionId);
      }
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      setIsAnalyzing(false);
    }
  };

  const simulateWithAI = async (sessionId: string) => {
    let step = 0;
    
    const interval = setInterval(async () => {
      soundManager.scanningBeep();
      
      if (step < uploadedData.length) {
        const currentData = uploadedData[step];
        const historicalData = uploadedData.slice(0, step);
        
        try {
          // Use AI for risk analysis with timeout
          const aiResult = await Promise.race([
            geminiRiskAnalyzer.analyzeRisk(currentData, historicalData),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('AI timeout')), 3000)
            )
          ]);
          
          setRiskScore(aiResult.riskScore);
          setRiskLevel(aiResult.riskLevel);
          setCurrentFactors(aiResult.factors);
          setCurrentAnalysisStep(step);
          
          // Add to live timeline
          const timePoint = {
            time: currentData.timestamp,
            risk: aiResult.riskScore,
            workHours: currentData.continuous_work_hours,
            nearMiss: currentData.near_miss_count,
          };
          
          setLiveTimelineData(prev => [...prev, timePoint]);
          
          // Store result in database (non-blocking)
          databaseService.storeAnalysisResult({
            sessionId,
            stepNumber: step,
            timestamp: currentData.timestamp,
            inputData: {
              continuous_work_hours: currentData.continuous_work_hours,
              near_miss_count: currentData.near_miss_count,
              machine_usage_level: currentData.machine_usage_level,
              shift_type: currentData.shift_type
            },
            riskScore: aiResult.riskScore,
            riskLevel: aiResult.riskLevel,
            factors: aiResult.factors,
            confidence: aiResult.confidence,
            aiInsights: aiResult.aiInsights,
            recommendations: aiResult.recommendations,
            timelineData: timePoint
          }).catch(err => console.warn('DB store failed:', err));
          
          // Trigger alert for high risk
          if (aiResult.riskLevel === "High" && !alertData) {
            soundManager.criticalAlert();
            const alertMessage = `AI detected high-risk conditions. Risk: ${aiResult.riskScore}/100. AI Insights: ${aiResult.aiInsights.join(', ')}`;
            
            setAlertData({
              alertTitle: "⚠️ AI Critical Safety Alert",
              alertMessage
            });
            
            // Store alert in database (non-blocking)
            databaseService.storeAlert({
              sessionId,
              alertTitle: "⚠️ AI Critical Safety Alert",
              alertMessage,
              riskScore: aiResult.riskScore,
              riskLevel: "High",
              triggeredAt: new Date() as any
            }).catch(err => console.warn('Alert store failed:', err));
          }
          
        } catch (error) {
          console.error("AI analysis failed for step", step, error);
        }
        
        step++;
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        
        // Update session as completed (non-blocking)
        databaseService.updateSession(sessionId, {
          status: 'completed',
          endTime: new Date() as any
        }).catch(err => console.warn('Session update failed:', err));
        
        console.log("✅ Analysis completed");
      }
    }, 1000); // Faster interval - 1 second
  };

  const simulateWithDemoData = async (sessionId: string) => {
    console.log("🎮 Starting demo simulation...");
    
    // Demo data for when no CSV is uploaded
    const demoData = [
      { continuous_work_hours: 2, near_miss_count: 0, machine_usage_level: 'low', shift_type: 'day', timestamp: '08:00' },
      { continuous_work_hours: 4, near_miss_count: 1, machine_usage_level: 'normal', shift_type: 'day', timestamp: '09:00' },
      { continuous_work_hours: 6, near_miss_count: 2, machine_usage_level: 'normal', shift_type: 'day', timestamp: '10:00' },
      { continuous_work_hours: 8, near_miss_count: 3, machine_usage_level: 'high', shift_type: 'day', timestamp: '11:00' },
      { continuous_work_hours: 10, near_miss_count: 4, machine_usage_level: 'high', shift_type: 'night', timestamp: '12:00' },
      { continuous_work_hours: 12, near_miss_count: 5, machine_usage_level: 'high', shift_type: 'night', timestamp: '13:00' },
      { continuous_work_hours: 14, near_miss_count: 6, machine_usage_level: 'high', shift_type: 'night', timestamp: '14:00' },
      { continuous_work_hours: 15, near_miss_count: 8, machine_usage_level: 'high', shift_type: 'night', timestamp: '15:00' },
    ];

    console.log("📊 Demo data prepared:", demoData);

    let step = 0;
    
    const interval = setInterval(async () => {
      console.log(`🔄 Demo step ${step + 1}/${demoData.length}`);
      soundManager.scanningBeep();
      
      if (step < demoData.length) {
        const currentData = demoData[step];
        const historicalData = demoData.slice(0, step);
        
        console.log("📈 Analyzing data:", currentData);
        
        try {
          // Use Gemini AI for risk analysis with timeout
          const geminiResult = await Promise.race([
            geminiRiskAnalyzer.analyzeRisk(currentData, historicalData),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Demo timeout')), 2000)
            )
          ]);
          
          console.log("✅ Analysis result received");
          
          setRiskScore(geminiResult.riskScore);
          setRiskLevel(geminiResult.riskLevel);
          setCurrentFactors(geminiResult.factors);
          setCurrentAnalysisStep(step);
          
          // Add to live timeline
          const timePoint = {
            time: currentData.timestamp,
            risk: geminiResult.riskScore,
            workHours: currentData.continuous_work_hours,
            nearMiss: currentData.near_miss_count,
          };
          
          setLiveTimelineData(prev => [...prev, timePoint]);
          
          // Store result in database (non-blocking)
          databaseService.storeAnalysisResult({
            sessionId,
            stepNumber: step,
            timestamp: currentData.timestamp,
            inputData: {
              continuous_work_hours: currentData.continuous_work_hours,
              near_miss_count: currentData.near_miss_count,
              machine_usage_level: currentData.machine_usage_level,
              shift_type: currentData.shift_type
            },
            riskScore: geminiResult.riskScore,
            riskLevel: geminiResult.riskLevel,
            factors: geminiResult.factors,
            confidence: geminiResult.confidence,
            aiInsights: geminiResult.aiInsights,
            recommendations: geminiResult.recommendations,
            timelineData: timePoint
          }).catch(err => console.warn('DB store failed:', err));
          
          // Trigger alert for high risk
          if (geminiResult.riskLevel === "High" && !alertData) {
            console.log("🚨 High risk detected, triggering alert");
            soundManager.criticalAlert();
            const alertMessage = `AI detected high-risk conditions. Risk: ${geminiResult.riskScore}/100. Factors: ${geminiResult.factors.join(', ')}`;
            
            setAlertData({
              alertTitle: "⚠️ AI Critical Safety Alert",
              alertMessage
            });
            
            // Store alert in database (non-blocking)
            databaseService.storeAlert({
              sessionId,
              alertTitle: "⚠️ AI Critical Safety Alert",
              alertMessage,
              riskScore: geminiResult.riskScore,
              riskLevel: "High",
              triggeredAt: new Date() as any
            }).catch(err => console.warn('Alert store failed:', err));
          }
          
        } catch (error) {
          console.error("❌ Demo analysis failed for step", step, error);
        }
        
        step++;
      } else {
        console.log("✅ Demo analysis complete");
        clearInterval(interval);
        setIsAnalyzing(false);
        
        // Update session as completed (non-blocking)
        databaseService.updateSession(sessionId, {
          status: 'completed',
          endTime: new Date() as any
        }).catch(err => console.warn('Session update failed:', err));
        
        console.log("✅ Demo analysis completed");
      }
    }, 800); // Faster demo - 0.8 seconds
  };

  const handleStopAnalysis = async () => {
    soundManager.simulationStop();
    setIsAnalyzing(false);
    setAlertData(null);
    setRiskLevel("Low");
    setRiskScore(12);
    setLiveTimelineData([]);
    setCurrentAnalysisStep(0);
    
    // Update session as stopped if we have a session
    if (currentSessionId) {
      try {
        await databaseService.updateSession(currentSessionId, {
          status: 'stopped',
          endTime: new Date() as any
        });
        console.log("🛑 Analysis stopped and session updated");
      } catch (error) {
        console.error("❌ Error updating stopped session:", error);
      }
    }
  };
  
  const acknowledgeAlert = () => {
    soundManager.buttonClick();
    setAlertData(null);
    setRiskLevel("Medium");
    setRiskScore(45);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {riskLevel === "High" && (
           <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-center">
            <h2 className="font-bold text-destructive">⚠️ High-Risk Window Detected</h2>
            <p className="text-sm text-foreground/80">
              Next 20-30 minutes are critical. Preventive intervention recommended.
            </p>
          </div>
        )}
        
        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950 p-4 text-center">
          <h3 className="font-medium text-blue-700 dark:text-blue-300">
            🤖 AI-Powered Industrial Safety Intelligence System
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            AI is actively analyzing operational risk patterns in real time.
          </p>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-2">
            <RiskOverview 
              riskLevel={riskLevel} 
              riskScore={riskScore} 
              onViewDetails={() => setIsDetailsSheetOpen(true)} 
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <AIRecommendations 
              riskLevel={riskLevel} 
              riskScore={riskScore} 
              isAnalyzing={isAnalyzing}
              currentFactors={currentFactors}
              currentData={uploadedData[currentAnalysisStep] || undefined}
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-2">
            <RiskTimeline 
              uploadedData={uploadedData} 
              currentStep={currentAnalysisStep}
              liveData={liveTimelineData}
              isAnalyzing={isAnalyzing}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <OperationalControls
              onStartAnalysis={handleStartAnalysis}
              onStopAnalysis={handleStopAnalysis}
              isAnalyzing={isAnalyzing}
              onDataUpload={handleDataUpload}
            />
          </div>
        </div>
        
        {alertData && (
          <AlertCard
            title={alertData.alertTitle}
            message={alertData.alertMessage}
            onAcknowledge={acknowledgeAlert}
            onReviewed={acknowledgeAlert}
          />
        )}
      </main>
      <WearableNotification isVisible={riskLevel === "High"} />
      <Footer />
      <RiskDetailsSheet
        isOpen={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
      />
    </div>
  );
}
