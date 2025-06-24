
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { HealthVitals } from '@/types/health';

interface HealthChartProps {
  data: HealthVitals[];
  metric: 'heartRate' | 'bloodOxygen' | 'temperature';
  title: string;
  color: string;
}

export const HealthChart = ({ data, metric, title, color }: HealthChartProps) => {
  const chartData = data.slice(-20).map((vital, index) => ({
    time: new Date(vital.timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    value: vital[metric],
    timestamp: vital.timestamp
  }));

  return (
    <Card className="p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
