
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Brain, TrendingUp } from 'lucide-react';
import { AnomalyDetection } from '@/types/health';
import { cn } from '@/lib/utils';

interface AnomalyPanelProps {
  anomalies: AnomalyDetection[];
}

const severityColors = {
  low: 'text-blue-400 bg-blue-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  critical: 'text-red-400 bg-red-400/10'
};

export const AnomalyPanel = ({ anomalies }: AnomalyPanelProps) => {
  const recentAnomalies = anomalies.slice(-5);

  return (
    <Card className="p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">AI Anomaly Detection</h3>
        <Badge variant="outline" className="text-xs bg-purple-400/10 text-purple-400 border-0">
          ML Active
        </Badge>
      </div>
      
      {recentAnomalies.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-medium">All vitals normal</p>
          <p className="text-slate-400 text-sm">No anomalies detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentAnomalies.map((anomaly, index) => (
            <div key={index} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-white capitalize">
                    {anomaly.type.replace('_', ' ')}
                  </span>
                </div>
                <Badge 
                  className={cn(
                    'text-xs border-0',
                    severityColors[anomaly.severity]
                  )}
                >
                  {anomaly.severity}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Current Value</span>
                  <p className="text-white font-medium">{anomaly.value.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Normal Range</span>
                  <p className="text-white font-medium">
                    {anomaly.normalRange[0]} - {anomaly.normalRange[1]}
                  </p>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Confidence: {(anomaly.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(anomaly.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
