
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Droplets, Thermometer, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VitalCardProps {
  title: string;
  value: number;
  unit: string;
  icon: 'heart' | 'oxygen' | 'temperature' | 'activity';
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

const iconMap = {
  heart: Heart,
  oxygen: Droplets,
  temperature: Thermometer,
  activity: Activity
};

const statusColors = {
  normal: 'text-green-400 border-green-400/20 bg-green-400/5',
  warning: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5',
  critical: 'text-red-400 border-red-400/20 bg-red-400/5'
};

export const VitalCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  status, 
  trend = 'stable',
  className 
}: VitalCardProps) => {
  const IconComponent = iconMap[icon];
  
  return (
    <Card className={cn(
      'p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-sm',
      statusColors[status],
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconComponent className="w-5 h-5" />
          <span className="text-sm font-medium text-slate-300">{title}</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            'text-xs border-0',
            status === 'normal' && 'bg-green-400/10 text-green-400',
            status === 'warning' && 'bg-yellow-400/10 text-yellow-400',
            status === 'critical' && 'bg-red-400/10 text-red-400'
          )}
        >
          {status}
        </Badge>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-sm text-slate-400">{unit}</span>
        {trend !== 'stable' && (
          <div className={cn(
            'ml-auto text-xs px-2 py-1 rounded-full',
            trend === 'up' && 'bg-green-400/10 text-green-400',
            trend === 'down' && 'bg-red-400/10 text-red-400'
          )}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
    </Card>
  );
};
