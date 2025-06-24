
import { useHealthMonitoring } from '@/hooks/useHealthMonitoring';
import { VitalCard } from '@/components/VitalCard';
import { HealthChart } from '@/components/HealthChart';
import { EmergencyAlert } from '@/components/EmergencyAlert';
import { DeviceStatus } from '@/components/DeviceStatus';
import { AnomalyPanel } from '@/components/AnomalyPanel';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Network } from 'lucide-react';

const Index = () => {
  const {
    currentVitals,
    vitalsHistory,
    anomalies,
    alerts,
    connectedDevices,
    acknowledgeAlert,
    resolveAlert
  } = useHealthMonitoring();

  const getVitalStatus = (type: 'heart' | 'oxygen' | 'temperature', value: number) => {
    switch (type) {
      case 'heart':
        if (value < 50 || value > 120) return value < 40 || value > 140 ? 'critical' : 'warning';
        return 'normal';
      case 'oxygen':
        if (value < 95) return value < 90 ? 'critical' : 'warning';
        return 'normal';
      case 'temperature':
        if (value < 36.1 || value > 37.2) return value > 38.5 || value < 35 ? 'critical' : 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">StarkNet Health Monitor</h1>
                <p className="text-slate-400 text-sm">Decentralized Emergency Response System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                <Network className="w-3 h-3 mr-1" />
                StarkNet Connected
              </Badge>
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                <Zap className="w-3 h-3 mr-1" />
                AI Monitoring Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Emergency Alerts */}
        {activeAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-red-400">🚨 Emergency Alerts</h2>
            <div className="grid gap-4">
              {activeAlerts.map((alert) => (
                <EmergencyAlert
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  onResolve={resolveAlert}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current Vitals */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Live Health Vitals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentVitals && (
              <>
                <VitalCard
                  title="Heart Rate"
                  value={currentVitals.heartRate}
                  unit="bpm"
                  icon="heart"
                  status={getVitalStatus('heart', currentVitals.heartRate)}
                />
                <VitalCard
                  title="Blood Oxygen"
                  value={currentVitals.bloodOxygen}
                  unit="%"
                  icon="oxygen"
                  status={getVitalStatus('oxygen', currentVitals.bloodOxygen)}
                />
                <VitalCard
                  title="Temperature"
                  value={currentVitals.temperature}
                  unit="°C"
                  icon="temperature"
                  status={getVitalStatus('temperature', currentVitals.temperature)}
                />
              </>
            )}
          </div>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <HealthChart
              data={vitalsHistory}
              metric="heartRate"
              title="Heart Rate Trend"
              color="#ef4444"
            />
            <HealthChart
              data={vitalsHistory}
              metric="bloodOxygen"
              title="Blood Oxygen Levels"
              color="#3b82f6"
            />
          </div>
          
          <div className="space-y-6">
            <AnomalyPanel anomalies={anomalies} />
            <DeviceStatus devices={connectedDevices} />
          </div>
        </div>

        {/* Recent Activity */}
        {alerts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card className="p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <div>
                      <p className="font-medium text-white capitalize">
                        {alert.type.replace('_', ' ')} - {alert.severity}
                      </p>
                      <p className="text-sm text-slate-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs border-0 ${
                        alert.status === 'resolved' 
                          ? 'bg-green-400/10 text-green-400' 
                          : alert.status === 'acknowledged'
                          ? 'bg-yellow-400/10 text-yellow-400'
                          : 'bg-red-400/10 text-red-400'
                      }`}
                    >
                      {alert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
