'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface EstateData {
  estate_name: string;
  total_revenue: number;
  total_customers: number;
}

interface EstateBarChartProps {
  data: EstateData[];
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export default function EstateBarChart({ data }: EstateBarChartProps) {
  const formatCurrency = (value: number) => {
    return `₦${(value / 1000000).toFixed(1)}M`;
  };

  const chartData = data.slice(0, 10).map(estate => ({
    name: estate.estate_name.length > 15 
      ? estate.estate_name.substring(0, 15) + '...' 
      : estate.estate_name,
    revenue: estate.total_revenue,
    customers: estate.total_customers,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            stroke="#666" 
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            tickFormatter={formatCurrency} 
            stroke="#666" 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'revenue') {
                return [`₦${value.toLocaleString()}`, 'Revenue'];
              }
              return [value, 'Customers'];
            }}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
