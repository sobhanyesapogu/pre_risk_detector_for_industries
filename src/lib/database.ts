/**
 * Database service for storing ProSentry analysis results
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Types for database documents
export interface AnalysisSession {
  id?: string;
  sessionId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  status: 'running' | 'completed' | 'stopped';
  totalSteps: number;
  dataSource: 'csv' | 'demo';
  uploadedFileName?: string;
  createdAt: Timestamp;
}

export interface RiskAnalysisResult {
  id?: string;
  sessionId: string;
  stepNumber: number;
  timestamp: string;
  
  // Input data
  inputData: {
    continuous_work_hours: number;
    near_miss_count: number;
    machine_usage_level: string;
    shift_type: string;
  };
  
  // AI Analysis results
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  factors: string[];
  confidence: number;
  aiInsights: string[];
  recommendations: string[];
  
  // Timeline data
  timelineData: {
    time: string;
    risk: number;
    workHours: number;
    nearMiss: number;
  };
  
  createdAt: Timestamp;
}

export interface AlertRecord {
  id?: string;
  sessionId: string;
  alertTitle: string;
  alertMessage: string;
  riskScore: number;
  riskLevel: 'High';
  triggeredAt: Timestamp;
  acknowledgedAt?: Timestamp;
  createdAt: Timestamp;
}

class DatabaseService {
  
  // Collections
  private readonly SESSIONS_COLLECTION = 'analysis_sessions';
  private readonly RESULTS_COLLECTION = 'risk_analysis_results';
  private readonly ALERTS_COLLECTION = 'safety_alerts';

  /**
   * Create a new analysis session
   */
  async createSession(sessionData: Omit<AnalysisSession, 'id' | 'createdAt'>): Promise<string> {
    try {
      if (!db) {
        console.log('🔄 Database not available, using local session ID');
        return `local_${Date.now()}`;
      }
      
      const docRef = await addDoc(collection(db, this.SESSIONS_COLLECTION), {
        ...sessionData,
        createdAt: Timestamp.now()
      });
      
      console.log('📝 Session created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      console.log('🔄 Falling back to local session ID');
      return `local_${Date.now()}`;
    }
  }

  /**
   * Update session status
   */
  async updateSession(sessionId: string, updates: Partial<AnalysisSession>): Promise<void> {
    try {
      if (!db || sessionId.startsWith('local_')) {
        console.log('🔄 Database not available or local session, skipping update');
        return;
      }
      
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, updates);
      
      console.log('📝 Session updated:', sessionId);
    } catch (error) {
      console.error('❌ Error updating session:', error);
      console.log('🔄 Continuing without database update');
    }
  }

  /**
   * Store risk analysis result
   */
  async storeAnalysisResult(resultData: Omit<RiskAnalysisResult, 'id' | 'createdAt'>): Promise<string> {
    try {
      if (!db) {
        console.log('🔄 Database not available, storing locally');
        return `local_result_${Date.now()}`;
      }
      
      const docRef = await addDoc(collection(db, this.RESULTS_COLLECTION), {
        ...resultData,
        createdAt: Timestamp.now()
      });
      
      console.log('📊 Analysis result stored:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error storing analysis result:', error);
      console.log('🔄 Continuing without database storage');
      return `local_result_${Date.now()}`;
    }
  }

  /**
   * Store safety alert
   */
  async storeAlert(alertData: Omit<AlertRecord, 'id' | 'createdAt'>): Promise<string> {
    try {
      if (!db) {
        console.log('🔄 Database not available, storing alert locally');
        return `local_alert_${Date.now()}`;
      }
      
      const docRef = await addDoc(collection(db, this.ALERTS_COLLECTION), {
        ...alertData,
        createdAt: Timestamp.now()
      });
      
      console.log('🚨 Alert stored:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error storing alert:', error);
      console.log('🔄 Continuing without database storage');
      return `local_alert_${Date.now()}`;
    }
  }

  /**
   * Get recent analysis sessions
   */
  async getRecentSessions(limitCount: number = 10): Promise<AnalysisSession[]> {
    try {
      const q = query(
        collection(db, this.SESSIONS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions: AnalysisSession[] = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data()
        } as AnalysisSession);
      });
      
      console.log('📋 Retrieved sessions:', sessions.length);
      return sessions;
    } catch (error) {
      console.error('❌ Error getting sessions:', error);
      throw error;
    }
  }

  /**
   * Get analysis results for a session
   */
  async getSessionResults(sessionId: string): Promise<RiskAnalysisResult[]> {
    try {
      const q = query(
        collection(db, this.RESULTS_COLLECTION),
        orderBy('stepNumber', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const results: RiskAnalysisResult[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as RiskAnalysisResult;
        if (data.sessionId === sessionId) {
          results.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      console.log('📊 Retrieved results for session:', sessionId, results.length);
      return results;
    } catch (error) {
      console.error('❌ Error getting session results:', error);
      throw error;
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limitCount: number = 20): Promise<AlertRecord[]> {
    try {
      const q = query(
        collection(db, this.ALERTS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const alerts: AlertRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        alerts.push({
          id: doc.id,
          ...doc.data()
        } as AlertRecord);
      });
      
      console.log('🚨 Retrieved alerts:', alerts.length);
      return alerts;
    } catch (error) {
      console.error('❌ Error getting alerts:', error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const alertRef = doc(db, this.ALERTS_COLLECTION, alertId);
      await updateDoc(alertRef, {
        acknowledgedAt: Timestamp.now()
      });
      
      console.log('✅ Alert acknowledged:', alertId);
    } catch (error) {
      console.error('❌ Error acknowledging alert:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();