
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Heart, Thermometer, Droplets, Clock } from 'lucide-react';
import { EmergencyAlert as AlertType } from '@/types/health';
import { cn } from '@/lib/utils';

interface EmergencyAlertProps {
  alert: AlertType;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const alertIcons = {
  cardiac_anomaly: Heart,
  oxygen_crisis: Droplets,
  fever_spike: Thermometer,
  fall_detection: AlertTriangle
};

const severityColors = {
  emergency: 'border-red-500 bg-red-500/10',
  urgent: 'border-orange-500 bg-orange-500/10',
  warning: 'border-yellow-500 bg-yellow-500/10'
};

export const EmergencyAlert = ({ alert, onAcknowledge, onResolve }: EmergencyAlertProps) => {
  const IconComponent = alertIcons[alert.type];
  const timeAgo = Math.floor((Date.now() - alert.timestamp) / 1000 / 60);

  return (
    <Card className={cn(
      'p-4 border-2 animate-pulse',
      severityColors[alert.severity],
      alert.status === 'resolved' && 'opacity-50 animate-none'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-red-400" />
          <h4 className="font-semibold text-white capitalize">
            {alert.type.replace('_', ' ')}
          </h4>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            'text-xs border-0',
            alert.severity === 'emergency' && 'bg-red-500/20 text-red-400',
            alert.severity === 'urgent' && 'bg-orange-500/20 text-orange-400',
            alert.severity === 'warning' && 'bg-yellow-500/20 text-yellow-400'
          )}
        >
          {alert.severity}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <span className="text-slate-400">Heart Rate</span>
          <p className="text-white font-medium">{alert.vitals.heartRate.toFixed(0)} bpm</p>
        </div>
        <div>
          <span className="text-slate-400">Blood O2</span>
          <p className="text-white font-medium">{alert.vitals.bloodOxygen.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-slate-400">Temperature</span>
          <p className="text-white font-medium">{alert.vitals.temperature.toFixed(0)}°C</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}m ago</span>
        </div>
        
        {alert.status === 'active' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs border-slate-600 hover:bg-slate-800"
            >
              Acknowledge
            </Button>
            <Button
              size="sm"
              onClick={() => onResolve(alert.id)}
              className="text-xs bg-red-600 hover:bg-red-700"
            >
              Resolve
            </Button>
          </div>
        )}
        
        {alert.status === 'acknowledged' && (
          <Button
            size="sm"
            onClick={() => onResolve(alert.id)}
            className="text-xs bg-green-600 hover:bg-green-700"
          >
            Resolve
          </Button>
        )}
        
        {alert.status === 'resolved' && (
          <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-0">
            Resolved
          </Badge>
        )}
      </div>
    </Card>
  );
};
