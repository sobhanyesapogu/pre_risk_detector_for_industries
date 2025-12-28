"use server";

import {
  generateRiskAlert,
  type GenerateRiskAlertOutput,
} from "@/ai/flows/generate-risk-alert";

export async function runAnalysis(): Promise<GenerateRiskAlertOutput> {
  try {
    // In a real application, you would gather real-time data here.
    // For this demo, we use static high-risk data.
    const alertData = await generateRiskAlert({
      riskLevel: "High",
      riskScore: 78,
      recentSafetySignals: [
        "Near-miss detected: Sudden machine stop at 02:15",
        "Extended continuous work duration detected for operator #12",
        "Abnormal machine usage pattern on Assembly Line 3",
      ],
    });
    return alertData;
  } catch (error) {
    console.error("Error generating risk alert:", error);
    // Return a structured error object that matches the expected output type
    return {
      alertTitle: "Error",
      alertMessage: "Failed to generate risk analysis. Please try again.",
    };
  }
}
