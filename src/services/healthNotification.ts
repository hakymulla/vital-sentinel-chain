import { HealthVitals, EmergencyAlert } from '@/types/health';

// Health official contact information
interface HealthOfficial {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'emergency_responder' | 'health_coordinator';
  email: string;
  phone?: string;
  webhook?: string;
  specialties: ('cardiac' | 'respiratory' | 'emergency' | 'general')[];
  isActive: boolean;
}

// Notification configuration
interface NotificationConfig {
  enableEmail: boolean;
  enableSMS: boolean;
  enableWebhook: boolean;
  criticalThresholds: {
    heartRate: { min: number; max: number };
    bloodOxygen: { min: number; max: number };
    temperature: { min: number; max: number };
  };
  notificationDelay: number; // seconds between notifications for same user
}

// Default health officials (replace with real contacts in production)
const DEFAULT_HEALTH_OFFICIALS: HealthOfficial[] = [
  {
    id: 'dr_smith',
    name: 'Dr. Sarah Smith',
    role: 'doctor',
    email: 'dr.smith@healthcare.org',
    phone: '+1-555-0123',
    specialties: ['cardiac', 'emergency'],
    isActive: true
  },
  {
    id: 'nurse_johnson',
    name: 'Nurse Michael Johnson',
    role: 'nurse',
    email: 'm.johnson@healthcare.org',
    phone: '+1-555-0124',
    specialties: ['respiratory', 'general'],
    isActive: true
  },
  {
    id: 'emergency_coord',
    name: 'Emergency Coordinator',
    role: 'emergency_responder',
    email: 'emergency@healthcare.org',
    phone: '+1-555-0125',
    webhook: 'https://emergency-api.healthcare.org/webhook',
    specialties: ['emergency'],
    isActive: true
  }
];

// Default notification configuration
const DEFAULT_CONFIG: NotificationConfig = {
  enableEmail: true,
  enableSMS: false, // Requires SMS service integration
  enableWebhook: true,
  criticalThresholds: {
    heartRate: { min: 40, max: 140 },
    bloodOxygen: { min: 90, max: 100 },
    temperature: { min: 35, max: 38.5 }
  },
  notificationDelay: 300 // 5 minutes
};

export class HealthNotificationService {
  private healthOfficials: HealthOfficial[];
  private config: NotificationConfig;
  private lastNotificationTime: Map<string, number> = new Map();

  constructor(
    healthOfficials: HealthOfficial[] = DEFAULT_HEALTH_OFFICIALS,
    config: Partial<NotificationConfig> = {}
  ) {
    this.healthOfficials = healthOfficials.filter(official => official.isActive);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if vitals are critical and send notifications if needed
   */
  async checkAndNotifyCriticalVitals(
    vitals: HealthVitals,
    userId: string = 'default_user'
  ): Promise<boolean> {
    const criticalVitals = this.detectCriticalVitals(vitals);
    
    if (criticalVitals.length === 0) {
      return false;
    }

    // Check if we should send notification (avoid spam)
    const now = Date.now();
    const lastNotification = this.lastNotificationTime.get(userId) || 0;
    const timeSinceLastNotification = (now - lastNotification) / 1000;

    if (timeSinceLastNotification < this.config.notificationDelay) {
      console.log(`Skipping notification for user ${userId} - too recent`);
      return false;
    }

    // Create emergency alert
    const alert: EmergencyAlert = {
      id: `critical_${Date.now()}`,
      type: this.getAlertType(criticalVitals),
      severity: 'emergency',
      vitals,
      timestamp: now,
      status: 'active'
    };

    // Send notifications
    await this.sendNotifications(alert, criticalVitals, userId);
    
    // Update last notification time
    this.lastNotificationTime.set(userId, now);
    
    return true;
  }

  /**
   * Detect which vitals are critical
   */
  private detectCriticalVitals(vitals: HealthVitals): string[] {
    const critical: string[] = [];
    const { criticalThresholds } = this.config;

    // Check heart rate
    if (vitals.heartRate < criticalThresholds.heartRate.min || 
        vitals.heartRate > criticalThresholds.heartRate.max) {
      critical.push('heart_rate');
    }

    // Check blood oxygen
    if (vitals.bloodOxygen < criticalThresholds.bloodOxygen.min) {
      critical.push('blood_oxygen');
    }

    // Check temperature
    if (vitals.temperature < criticalThresholds.temperature.min || 
        vitals.temperature > criticalThresholds.temperature.max) {
      critical.push('temperature');
    }

    return critical;
  }

  /**
   * Determine alert type based on critical vitals
   */
  private getAlertType(criticalVitals: string[]): EmergencyAlert['type'] {
    if (criticalVitals.includes('heart_rate')) {
      return 'cardiac_anomaly';
    } else if (criticalVitals.includes('blood_oxygen')) {
      return 'oxygen_crisis';
    } else if (criticalVitals.includes('temperature')) {
      return 'fever_spike';
    }
    return 'cardiac_anomaly'; // default
  }

  /**
   * Send notifications to relevant health officials
   */
  private async sendNotifications(
    alert: EmergencyAlert,
    criticalVitals: string[],
    userId: string
  ): Promise<void> {
    const relevantOfficials = this.getRelevantOfficials(criticalVitals);
    
    console.log(`🚨 CRITICAL HEALTH ALERT for user ${userId}:`, {
      criticalVitals,
      alertType: alert.type,
      vitals: alert.vitals,
      officialsToNotify: relevantOfficials.length
    });

    // Send notifications in parallel
    const notificationPromises = relevantOfficials.map(official =>
      this.sendNotificationToOfficial(official, alert, userId)
    );

    try {
      await Promise.allSettled(notificationPromises);
      console.log(`✅ Notifications sent to ${relevantOfficials.length} health officials`);
    } catch (error) {
      console.error('❌ Error sending notifications:', error);
    }
  }

  /**
   * Get health officials relevant to the critical vitals
   */
  private getRelevantOfficials(criticalVitals: string[]): HealthOfficial[] {
    const specialtyMap: Record<string, string[]> = {
      heart_rate: ['cardiac', 'emergency'],
      blood_oxygen: ['respiratory', 'emergency'],
      temperature: ['emergency', 'general']
    };

    const neededSpecialties = criticalVitals.flatMap(vital => 
      specialtyMap[vital] || ['emergency']
    );

    return this.healthOfficials.filter(official =>
      official.specialties.some(specialty => 
        neededSpecialties.includes(specialty)
      )
    );
  }

  /**
   * Send notification to a specific health official
   */
  private async sendNotificationToOfficial(
    official: HealthOfficial,
    alert: EmergencyAlert,
    userId: string
  ): Promise<void> {
    const message = this.formatAlertMessage(alert, userId);
    
    const promises: Promise<any>[] = [];

    // Send email notification
    if (this.config.enableEmail && official.email) {
      promises.push(this.sendEmailNotification(official.email, message));
    }

    // Send SMS notification
    if (this.config.enableSMS && official.phone) {
      promises.push(this.sendSMSNotification(official.phone, message));
    }

    // Send webhook notification
    if (this.config.enableWebhook && official.webhook) {
      promises.push(this.sendWebhookNotification(official.webhook, alert, userId));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Format alert message for notifications
   */
  private formatAlertMessage(alert: EmergencyAlert, userId: string): string {
    const vitals = alert.vitals;
    const time = new Date(alert.timestamp).toLocaleString();
    
    return `🚨 CRITICAL HEALTH ALERT

Patient ID: ${userId}
Alert Type: ${alert.type.replace('_', ' ').toUpperCase()}
Time: ${time}

Current Vitals:
• Heart Rate: ${vitals.heartRate.toFixed(0)} bpm
• Blood Oxygen: ${vitals.bloodOxygen.toFixed(1)}%
• Temperature: ${vitals.temperature.toFixed(1)}°C

Device: ${vitals.deviceId}

This is an automated alert from the Vital Sentinel Chain health monitoring system. Please respond immediately.`;
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(email: string, message: string): Promise<void> {
    // In a real implementation, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`📧 Email notification sent to ${email}:`, message);
    
    // Example with fetch (replace with actual email service)
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject: '🚨 CRITICAL HEALTH ALERT', message })
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(phone: string, message: string): Promise<void> {
    // In a real implementation, integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`📱 SMS notification sent to ${phone}:`, message);
    
    try {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message })
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    webhook: string, 
    alert: EmergencyAlert, 
    userId: string
  ): Promise<void> {
    const payload = {
      alert,
      userId,
      timestamp: Date.now(),
      source: 'vital-sentinel-chain'
    };

    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      console.log(`🔗 Webhook notification sent to ${webhook}`);
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }

  /**
   * Add or update health official
   */
  addHealthOfficial(official: HealthOfficial): void {
    const index = this.healthOfficials.findIndex(o => o.id === official.id);
    if (index >= 0) {
      this.healthOfficials[index] = official;
    } else {
      this.healthOfficials.push(official);
    }
  }

  /**
   * Remove health official
   */
  removeHealthOfficial(officialId: string): void {
    this.healthOfficials = this.healthOfficials.filter(o => o.id !== officialId);
  }

  /**
   * Update notification configuration
   */
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current health officials
   */
  getHealthOfficials(): HealthOfficial[] {
    return [...this.healthOfficials];
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const healthNotificationService = new HealthNotificationService(); 