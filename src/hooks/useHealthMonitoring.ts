
import { useState, useEffect } from 'react';
import { HealthVitals, AnomalyDetection, EmergencyAlert, WearableDevice } from '@/types/health';

// Simulated ML anomaly detection
const detectAnomalies = (vitals: HealthVitals): AnomalyDetection[] => {
  const anomalies: AnomalyDetection[] = [];
  
  // Heart rate anomaly detection
  if (vitals.heartRate < 50 || vitals.heartRate > 120) {
    anomalies.push({
      type: 'heart_rate',
      severity: vitals.heartRate < 40 || vitals.heartRate > 140 ? 'critical' : 'medium',
      value: vitals.heartRate,
      normalRange: [60, 100],
      timestamp: vitals.timestamp,
      confidence: 0.95
    });
  }
  
  // Blood oxygen anomaly detection
  if (vitals.bloodOxygen < 95) {
    anomalies.push({
      type: 'blood_oxygen',
      severity: vitals.bloodOxygen < 90 ? 'critical' : 'medium',
      value: vitals.bloodOxygen,
      normalRange: [95, 100],
      timestamp: vitals.timestamp,
      confidence: 0.92
    });
  }
  
  // Temperature anomaly detection
  if (vitals.temperature < 36.1 || vitals.temperature > 37.2) {
    anomalies.push({
      type: 'temperature',
      severity: vitals.temperature > 38.5 || vitals.temperature < 35 ? 'critical' : 'medium',
      value: vitals.temperature,
      normalRange: [36.1, 37.2],
      timestamp: vitals.timestamp,
      confidence: 0.88
    });
  }
  
  return anomalies;
};

export const useHealthMonitoring = () => {
  const [currentVitals, setCurrentVitals] = useState<HealthVitals | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<HealthVitals[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>([
    {
      id: 'apple_watch_1',
      name: 'Apple Watch Series 9',
      type: 'smartwatch',
      connected: true,
      batteryLevel: 85,
      lastSync: Date.now() - 30000
    },
    {
      id: 'fitbit_1',
      name: 'Fitbit Charge 5',
      type: 'fitness_tracker',
      connected: true,
      batteryLevel: 72,
      lastSync: Date.now() - 45000
    }
  ]);

  // Simulate real-time health data
  useEffect(() => {
    const interval = setInterval(() => {
      const newVitals: HealthVitals = {
        heartRate: 65 + Math.random() * 30 + (Math.sin(Date.now() / 10000) * 10),
        bloodOxygen: 96 + Math.random() * 4,
        temperature: 36.5 + Math.random() * 1.5,
        timestamp: Date.now(),
        deviceId: 'apple_watch_1'
      };
      
      setCurrentVitals(newVitals);
      setVitalsHistory(prev => [...prev.slice(-50), newVitals]);
      
      // Run anomaly detection
      const detectedAnomalies = detectAnomalies(newVitals);
      if (detectedAnomalies.length > 0) {
        setAnomalies(prev => [...prev.slice(-20), ...detectedAnomalies]);
        
        // Create emergency alerts for critical anomalies
        const criticalAnomalies = detectedAnomalies.filter(a => a.severity === 'critical');
        if (criticalAnomalies.length > 0) {
          const newAlert: EmergencyAlert = {
            id: `alert_${Date.now()}`,
            type: criticalAnomalies[0].type === 'heart_rate' ? 'cardiac_anomaly' : 
                  criticalAnomalies[0].type === 'blood_oxygen' ? 'oxygen_crisis' : 'fever_spike',
            severity: 'emergency',
            vitals: newVitals,
            timestamp: Date.now(),
            status: 'active'
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  };

  return {
    currentVitals,
    vitalsHistory,
    anomalies,
    alerts,
    connectedDevices,
    acknowledgeAlert,
    resolveAlert
  };
};
