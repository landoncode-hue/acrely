'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface AgentData {
  agent_name: string;
  performance_score: number;
  total_commissions: number;
  payments_collected: number;
}

interface AgentRadarChartProps {
  data: AgentData[];
}

export default function AgentRadarChart({ data }: AgentRadarChartProps) {
  // Normalize data for radar chart (scale to 0-100)
  const maxCommissions = Math.max(...data.map(a => a.total_commissions), 1);
  const maxPayments = Math.max(...data.map(a => a.payments_collected), 1);

  const chartData = data.slice(0, 6).map(agent => ({
    agent: agent.agent_name.split(' ')[0], // First name only
    performance: agent.performance_score,
    commissions: (agent.total_commissions / maxCommissions) * 100,
    payments: (agent.payments_collected / maxPayments) * 100,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e0e0e0" />
          <PolarAngleAxis 
            dataKey="agent" 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            stroke="#666"
            style={{ fontSize: '11px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Radar 
            name="Performance" 
            dataKey="performance" 
            stroke="#2563eb" 
            fill="#2563eb" 
            fillOpacity={0.3}
          />
          <Radar 
            name="Commissions (Normalized)" 
            dataKey="commissions" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.2}
          />
          <Radar 
            name="Payments (Normalized)" 
            dataKey="payments" 
            stroke="#f59e0b" 
            fill="#f59e0b" 
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
