
export interface HealthVitals {
  heartRate: number;
  bloodOxygen: number;
  temperature: number;
  timestamp: number;
  deviceId: string;
}

export interface AnomalyDetection {
  type: 'heart_rate' | 'blood_oxygen' | 'temperature';
  severity: 'low' | 'medium' | 'high' | 'critical';
  value: number;
  normalRange: [number, number];
  timestamp: number;
  confidence: number;
}

export interface EmergencyAlert {
  id: string;
  type: 'cardiac_anomaly' | 'oxygen_crisis' | 'fever_spike' | 'fall_detection';
  severity: 'emergency' | 'urgent' | 'warning';
  vitals: HealthVitals;
  location?: { lat: number; lng: number };
  timestamp: number;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface WearableDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'fitness_tracker' | 'medical_device';
  connected: boolean;
  batteryLevel: number;
  lastSync: number;
}
