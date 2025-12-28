'use server';

/**
 * @fileOverview A flow for generating high-risk alert messages based on detected dangerous patterns.
 *
 * - generateRiskAlert - A function that generates a risk alert message.
 * - GenerateRiskAlertInput - The input type for the generateRiskAlert function.
 * - GenerateRiskAlertOutput - The return type for the generateRiskAlert function.
 */

export type GenerateRiskAlertInput = {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  recentSafetySignals: string[];
};

export type GenerateRiskAlertOutput = {
  alertTitle: string;
  alertMessage: string;
};

export async function generateRiskAlert(input: GenerateRiskAlertInput): Promise<GenerateRiskAlertOutput> {
  // Mock AI response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  const { riskLevel, riskScore, recentSafetySignals } = input;
  
  if (riskLevel === 'High') {
    return {
      alertTitle: "⚠️ Critical Safety Alert",
      alertMessage: `High-risk conditions detected with score ${riskScore}/100. Multiple safety signals indicate elevated accident probability. Immediate supervisor intervention required. Recent incidents: ${recentSafetySignals.slice(0, 2).join(', ')}.`
    };
  } else if (riskLevel === 'Medium') {
    return {
      alertTitle: "⚠️ Safety Warning",
      alertMessage: `Medium-risk conditions detected with score ${riskScore}/100. Monitor operations closely and review safety protocols.`
    };
  } else {
    return {
      alertTitle: "✅ Normal Operations",
      alertMessage: `Low-risk conditions with score ${riskScore}/100. Continue standard safety monitoring procedures.`
    };
  }
}
