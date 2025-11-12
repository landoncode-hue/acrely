'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    type?: 'historical' | 'predicted';
  }>;
  showPredictions?: boolean;
}

export default function RevenueChart({ data, showPredictions = false }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return `₦${(value / 1000000).toFixed(1)}M`;
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const chartData = data.map(item => ({
    month: formatMonth(item.month),
    revenue: item.revenue,
    isPredicted: item.type === 'predicted',
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="month" 
            stroke="#666" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            tickFormatter={formatCurrency} 
            stroke="#666" 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend />
          {showPredictions ? (
            <>
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Revenue"
                connectNulls
              />
            </>
          ) : (
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
