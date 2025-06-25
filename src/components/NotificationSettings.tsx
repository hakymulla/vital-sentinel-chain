import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Mail, 
  Phone, 
  Globe, 
  UserPlus, 
  Settings, 
  AlertTriangle,
  Heart,
  Droplets,
  Thermometer
} from 'lucide-react';
import { healthNotificationService } from '@/services/healthNotification';

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

interface NotificationConfig {
  enableEmail: boolean;
  enableSMS: boolean;
  enableWebhook: boolean;
  criticalThresholds: {
    heartRate: { min: number; max: number };
    bloodOxygen: { min: number; max: number };
    temperature: { min: number; max: number };
  };
  notificationDelay: number;
}

export const NotificationSettings = () => {
  const [healthOfficials, setHealthOfficials] = useState<HealthOfficial[]>([]);
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newOfficial, setNewOfficial] = useState<Partial<HealthOfficial>>({});

  useEffect(() => {
    // Load current settings
    setHealthOfficials(healthNotificationService.getHealthOfficials());
    setConfig(healthNotificationService.getConfig());
  }, []);

  const handleConfigUpdate = (updates: Partial<NotificationConfig>) => {
    if (!config) return;
    
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    healthNotificationService.updateConfig(updates);
  };

  const handleAddOfficial = () => {
    if (!newOfficial.name || !newOfficial.email) return;
    
    const official: HealthOfficial = {
      id: `official_${Date.now()}`,
      name: newOfficial.name,
      role: newOfficial.role || 'doctor',
      email: newOfficial.email,
      phone: newOfficial.phone,
      webhook: newOfficial.webhook,
      specialties: newOfficial.specialties || ['emergency'],
      isActive: true
    };

    healthNotificationService.addHealthOfficial(official);
    setHealthOfficials(healthNotificationService.getHealthOfficials());
    setNewOfficial({});
  };

  const handleRemoveOfficial = (officialId: string) => {
    healthNotificationService.removeHealthOfficial(officialId);
    setHealthOfficials(healthNotificationService.getHealthOfficials());
  };

  const handleToggleOfficial = (officialId: string) => {
    const officials = healthOfficials.map(official =>
      official.id === officialId 
        ? { ...official, isActive: !official.isActive }
        : official
    );
    
    officials.forEach(official => {
      if (official.id === officialId) {
        healthNotificationService.addHealthOfficial(official);
      }
    });
    
    setHealthOfficials(healthNotificationService.getHealthOfficials());
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor': return '👨‍⚕️';
      case 'nurse': return '👩‍⚕️';
      case 'emergency_responder': return '🚑';
      case 'health_coordinator': return '📋';
      default: return '👤';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case 'cardiac': return <Heart className="w-3 h-3" />;
      case 'respiratory': return <Droplets className="w-3 h-3" />;
      case 'emergency': return <AlertTriangle className="w-3 h-3" />;
      case 'general': return <Settings className="w-3 h-3" />;
      default: return null;
    }
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Notification Configuration */}
      <Card className="p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notification Methods */}
          <div className="space-y-4">
            <h4 className="font-medium text-white">Notification Methods</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <Label className="text-slate-300">Email Notifications</Label>
              </div>
              <Switch
                checked={config.enableEmail}
                onCheckedChange={(checked) => handleConfigUpdate({ enableEmail: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <Label className="text-slate-300">SMS Notifications</Label>
              </div>
              <Switch
                checked={config.enableSMS}
                onCheckedChange={(checked) => handleConfigUpdate({ enableSMS: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <Label className="text-slate-300">Webhook Notifications</Label>
              </div>
              <Switch
                checked={config.enableWebhook}
                onCheckedChange={(checked) => handleConfigUpdate({ enableWebhook: checked })}
              />
            </div>
          </div>

          {/* Critical Thresholds */}
          <div className="space-y-4">
            <h4 className="font-medium text-white">Critical Thresholds</h4>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-slate-400">Heart Rate (bpm)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={config.criticalThresholds.heartRate.min}
                    onChange={(e) => handleConfigUpdate({
                      criticalThresholds: {
                        ...config.criticalThresholds,
                        heartRate: {
                          ...config.criticalThresholds.heartRate,
                          min: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-20"
                  />
                  <span className="text-slate-400 self-center">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={config.criticalThresholds.heartRate.max}
                    onChange={(e) => handleConfigUpdate({
                      criticalThresholds: {
                        ...config.criticalThresholds,
                        heartRate: {
                          ...config.criticalThresholds.heartRate,
                          max: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-20"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-400">Blood Oxygen (%)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={config.criticalThresholds.bloodOxygen.min}
                    onChange={(e) => handleConfigUpdate({
                      criticalThresholds: {
                        ...config.criticalThresholds,
                        bloodOxygen: {
                          ...config.criticalThresholds.bloodOxygen,
                          min: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-20"
                  />
                  <span className="text-slate-400 self-center">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={config.criticalThresholds.bloodOxygen.max}
                    onChange={(e) => handleConfigUpdate({
                      criticalThresholds: {
                        ...config.criticalThresholds,
                        bloodOxygen: {
                          ...config.criticalThresholds.bloodOxygen,
                          max: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-20"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-400">Temperature (°C)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={config.criticalThresholds.temperature.min}
                    onChange={(e) => handleConfigUpdate({
                      criticalThresholds: {
                        ...config.criticalThresholds,
                        temperature: {
                          ...config.criticalThresholds.temperature,
                          min: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-20"
                  />
                  <span className="text-slate-400 self-center">-</span>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={config.criticalThresholds.temperature.max}
                    onChange={(e) => handleConfigUpdate({
                      criticalThresholds: {
                        ...config.criticalThresholds,
                        temperature: {
                          ...config.criticalThresholds.temperature,
                          max: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Health Officials Management */}
      <Card className="p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Health Officials</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs"
          >
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>

        {/* Add New Official */}
        {isEditing && (
          <div className="mb-6 p-4 border border-slate-700 rounded-lg bg-slate-800/30">
            <h4 className="font-medium text-white mb-3">Add New Health Official</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Name"
                value={newOfficial.name || ''}
                onChange={(e) => setNewOfficial({ ...newOfficial, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newOfficial.email || ''}
                onChange={(e) => setNewOfficial({ ...newOfficial, email: e.target.value })}
              />
              <Input
                placeholder="Phone (optional)"
                value={newOfficial.phone || ''}
                onChange={(e) => setNewOfficial({ ...newOfficial, phone: e.target.value })}
              />
              <Input
                placeholder="Webhook URL (optional)"
                value={newOfficial.webhook || ''}
                onChange={(e) => setNewOfficial({ ...newOfficial, webhook: e.target.value })}
              />
            </div>
            <Button
              size="sm"
              onClick={handleAddOfficial}
              className="mt-3"
              disabled={!newOfficial.name || !newOfficial.email}
            >
              Add Official
            </Button>
          </div>
        )}

        {/* Officials List */}
        <div className="space-y-3">
          {healthOfficials.map((official) => (
            <div
              key={official.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                official.isActive 
                  ? 'border-green-500/20 bg-green-500/5' 
                  : 'border-slate-700 bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getRoleIcon(official.role)}</span>
                <div>
                  <p className="font-medium text-white">{official.name}</p>
                  <p className="text-sm text-slate-400">{official.email}</p>
                  {official.phone && (
                    <p className="text-sm text-slate-400">{official.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {official.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {getSpecialtyIcon(specialty)}
                      {specialty}
                    </Badge>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleOfficial(official.id)}
                      className={`text-xs ${
                        official.isActive 
                          ? 'border-green-500 text-green-400' 
                          : 'border-slate-600 text-slate-400'
                      }`}
                    >
                      {official.isActive ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveOfficial(official.id)}
                      className="text-xs border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {healthOfficials.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <UserPlus className="w-8 h-8 mx-auto mb-2" />
            <p>No health officials configured</p>
            <p className="text-sm">Add health officials to receive critical alerts</p>
          </div>
        )}
      </Card>
    </div>
  );
}; 