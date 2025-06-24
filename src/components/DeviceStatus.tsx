
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Watch, Activity, Wifi, Battery } from 'lucide-react';
import { WearableDevice } from '@/types/health';
import { cn } from '@/lib/utils';

interface DeviceStatusProps {
  devices: WearableDevice[];
}

const deviceIcons = {
  smartwatch: Watch,
  fitness_tracker: Activity,
  medical_device: Activity
};

export const DeviceStatus = ({ devices }: DeviceStatusProps) => {
  return (
    <Card className="p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Connected Devices</h3>
      
      <div className="space-y-3">
        {devices.map((device) => {
          const IconComponent = deviceIcons[device.type];
          const timeSinceSync = Math.floor((Date.now() - device.lastSync) / 1000 / 60);
          
          return (
            <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <IconComponent className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white">{device.name}</p>
                  <p className="text-xs text-slate-400">Synced {timeSinceSync}m ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Battery className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{device.batteryLevel}%</span>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs border-0 flex items-center gap-1',
                    device.connected 
                      ? 'bg-green-400/10 text-green-400' 
                      : 'bg-red-400/10 text-red-400'
                  )}
                >
                  <Wifi className="w-3 h-3" />
                  {device.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
