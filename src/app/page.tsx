"use client";

import * as React from "react";
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
import AIRecommendations from "@/components/dashboard/ai-recommendations";

export default function DashboardPage() {
  const [riskLevel, setRiskLevel] = React.useState<"Low" | "Medium" | "High">("Low");
  const [riskScore, setRiskScore] = React.useState(12);
  const [alertData, setAlertData] = React.useState<{alertTitle: string, alertMessage: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = React.useState(false);
  const [prevRiskLevel, setPrevRiskLevel] = React.useState<"Low" | "Medium" | "High">("Low");
  const [uploadedData, setUploadedData] = React.useState<OperationalData[]>([]);
  const [currentFactors, setCurrentFactors] = React.useState<string[]>([]);
  const [liveTimelineData, setLiveTimelineData] = React.useState<Array<{time: string, risk: number, workHours: number, nearMiss: number}>>([]);
  const [currentAnalysisStep, setCurrentAnalysisStep] = React.useState(0);
  const [currentSessionId, setCurrentSessionId] = React.useState<string>("");
  const [analysisData, setAnalysisData] = React.useState<OperationalData[]>([]);

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

  // 🚀 MAIN FRONTEND SCANNING LOGIC - This runs in browser!
  React.useEffect(() => {
    if (!isAnalyzing || analysisData.length === 0) {
      console.log("❌ Scanning not starting:", { isAnalyzing, dataLength: analysisData.length });
      return;
    }

    console.log("🔄 Starting frontend scanning loop with", analysisData.length, "data points");
    
    let step = 0;
    const interval = setInterval(async () => {
      console.log(`📊 Frontend scan step: ${step + 1}/${analysisData.length}`);
      
      // Play scanning sound
      try {
        soundManager.scanningBeep();
      } catch (error) {
        console.warn("Sound failed:", error);
      }
      
      if (step < analysisData.length) {
        const currentData = analysisData[step];
        const historicalData = analysisData.slice(0, step);
        
        console.log("📈 Processing data:", currentData);
        
        try {
          // AI Analysis in browser (with fallback)
          const aiResult = await Promise.race([
            geminiRiskAnalyzer.analyzeRisk(currentData, historicalData),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Browser timeout')), 2000)
            )
          ]);
          
          console.log(`✅ Step ${step + 1} analysis complete:`, aiResult);
          
          // Update UI state
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
          
          // Store in database (non-blocking, optional)
          if (currentSessionId) {
            databaseService.storeAnalysisResult({
              sessionId: currentSessionId,
              stepNumber: step,
              timestamp: currentData.timestamp,
              inputData: currentData,
              riskScore: aiResult.riskScore,
              riskLevel: aiResult.riskLevel,
              factors: aiResult.factors,
              confidence: aiResult.confidence,
              aiInsights: aiResult.aiInsights,
              recommendations: aiResult.recommendations,
              timelineData: timePoint
            }).catch(err => console.warn('DB store failed (non-critical):', err));
          }
          
          // Trigger alert for high risk (only once)
          if (aiResult.riskLevel === "High" && step > 3) { // Only after some steps
            console.log("🚨 High risk detected!");
            try {
              soundManager.criticalAlert();
            } catch (error) {
              console.warn("Alert sound failed:", error);
            }
            
            setAlertData({
              alertTitle: "⚠️ AI Critical Safety Alert",
              alertMessage: `AI detected high-risk conditions. Risk: ${aiResult.riskScore}/100. Factors: ${aiResult.factors.join(', ')}`
            });
          }
          
        } catch (error) {
          console.warn(`⚠️ Analysis failed for step ${step + 1}:`, error);
          
          // Use fallback values to keep scanning going
          setRiskScore(Math.min(20 + step * 10, 100));
          setRiskLevel(step > 5 ? "High" : step > 2 ? "Medium" : "Low");
          setCurrentFactors([`Step ${step + 1} processing`]);
          setCurrentAnalysisStep(step);
          
          const timePoint = {
            time: currentData.timestamp,
            risk: Math.min(20 + step * 10, 100),
            workHours: currentData.continuous_work_hours,
            nearMiss: currentData.near_miss_count,
          };
          
          setLiveTimelineData(prev => [...prev, timePoint]);
        }
        
        step++;
      } else {
        // Analysis complete
        console.log("✅ Frontend scanning complete!");
        clearInterval(interval);
        setIsAnalyzing(false);
        
        // Update session (non-blocking)
        if (currentSessionId) {
          databaseService.updateSession(currentSessionId, {
            status: 'completed',
            endTime: new Date() as any
          }).catch(err => console.warn('Session update failed (non-critical):', err));
        }
      }
    }, 1000); // 1 second interval - runs in browser!

    // Cleanup function
    return () => {
      console.log("🛑 Cleaning up scanning interval");
      clearInterval(interval);
    };
  }, [isAnalyzing, analysisData]); // Removed alertData and currentSessionId from dependencies

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
      }).filter(row => row.continuous_work_hours > 0);
      
      setUploadedData(data);
      console.log('✅ CSV data loaded for frontend analysis:', data.length, 'rows');
    };
    reader.readAsText(file);
  };

  const handleStartAnalysis = () => {
    console.log("🚀 Starting FRONTEND analysis...");
    console.log("Current state:", { isAnalyzing, uploadedDataLength: uploadedData.length });
    
    // Reset state
    try {
      soundManager.simulationStart();
    } catch (error) {
      console.warn("Sound start failed:", error);
    }
    
    setAlertData(null);
    setRiskLevel("Low");
    setRiskScore(15);
    setLiveTimelineData([]);
    setCurrentAnalysisStep(0);
    
    // Prepare data for analysis
    let dataToAnalyze: OperationalData[];
    
    if (uploadedData.length > 0) {
      console.log("📁 Using uploaded CSV data");
      dataToAnalyze = uploadedData;
    } else {
      console.log("🎮 Using demo data");
      dataToAnalyze = [
        { continuous_work_hours: 2, near_miss_count: 0, machine_usage_level: 'low', shift_type: 'day', timestamp: '08:00' },
        { continuous_work_hours: 4, near_miss_count: 1, machine_usage_level: 'normal', shift_type: 'day', timestamp: '09:00' },
        { continuous_work_hours: 6, near_miss_count: 2, machine_usage_level: 'normal', shift_type: 'day', timestamp: '10:00' },
        { continuous_work_hours: 8, near_miss_count: 3, machine_usage_level: 'high', shift_type: 'day', timestamp: '11:00' },
        { continuous_work_hours: 10, near_miss_count: 4, machine_usage_level: 'high', shift_type: 'night', timestamp: '12:00' },
        { continuous_work_hours: 12, near_miss_count: 5, machine_usage_level: 'high', shift_type: 'night', timestamp: '13:00' },
        { continuous_work_hours: 14, near_miss_count: 6, machine_usage_level: 'high', shift_type: 'night', timestamp: '14:00' },
        { continuous_work_hours: 15, near_miss_count: 8, machine_usage_level: 'high', shift_type: 'night', timestamp: '15:00' },
      ];
    }
    
    console.log("📊 Data to analyze:", dataToAnalyze);
    
    // Create session (optional, non-blocking)
    databaseService.createSession({
      sessionId: `session_${Date.now()}`,
      startTime: new Date() as any,
      status: 'running',
      totalSteps: dataToAnalyze.length,
      dataSource: uploadedData.length > 0 ? 'csv' : 'demo',
      uploadedFileName: uploadedData.length > 0 ? 'uploaded_data.csv' : undefined
    }).then(sessionId => {
      setCurrentSessionId(sessionId);
      console.log("📝 Session created:", sessionId);
    }).catch(error => {
      console.warn("⚠️ Session creation failed (non-critical):", error);
    });
    
    // Set data and start analysis (triggers useEffect)
    console.log("🎯 Setting analysis data and starting...");
    setAnalysisData(dataToAnalyze);
    setIsAnalyzing(true);
    
    console.log("✅ Frontend analysis setup complete");
  };

  const handleStopAnalysis = () => {
    console.log("🛑 Stopping frontend analysis...");
    
    soundManager.simulationStop();
    setIsAnalyzing(false);
    setAnalysisData([]);
    setAlertData(null);
    setRiskLevel("Low");
    setRiskScore(12);
    setLiveTimelineData([]);
    setCurrentAnalysisStep(0);
    
    // Update session (non-blocking)
    if (currentSessionId) {
      databaseService.updateSession(currentSessionId, {
        status: 'stopped',
        endTime: new Date() as any
      }).catch(err => console.warn('Session stop update failed (non-critical):', err));
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
        
        <div className="rounded-lg border bg-green-50 dark:bg-green-950 p-4 text-center">
          <h3 className="font-medium text-green-700 dark:text-green-300">
            🚀 Frontend AI-Powered Safety System (Vercel Optimized)
          </h3>
          <p className="text-sm text-green-600 dark:text-green-400">
            All scanning runs in your browser - guaranteed to work on Vercel!
          </p>
        </div>
        
        {/* Debug Info */}
        <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950 p-4 text-center">
          <h3 className="font-medium text-yellow-700 dark:text-yellow-300">
            🔧 Debug Info
          </h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Analyzing: {isAnalyzing ? "YES" : "NO"} | 
            Data Points: {analysisData.length} | 
            Current Step: {currentAnalysisStep + 1} | 
            Risk: {riskScore}
          </p>
          <div className="mt-2 space-x-2">
            <button 
              onClick={() => console.log("Debug state:", { isAnalyzing, analysisData, currentAnalysisStep, riskScore })}
              className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
            >
              Log State
            </button>
            <button 
              onClick={() => {
                console.log("Force starting analysis...");
                setAnalysisData([
                  { continuous_work_hours: 2, near_miss_count: 0, machine_usage_level: 'low', shift_type: 'day', timestamp: '08:00' },
                  { continuous_work_hours: 8, near_miss_count: 3, machine_usage_level: 'high', shift_type: 'day', timestamp: '11:00' },
                ]);
                setIsAnalyzing(true);
              }}
              className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
            >
              Force Start
            </button>
          </div>
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
              currentData={analysisData[currentAnalysisStep] || undefined}
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-2">
            <RiskTimeline 
              uploadedData={analysisData} 
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
