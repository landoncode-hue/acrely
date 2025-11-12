'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Download, RefreshCw, TrendingUp, DollarSign, Users, Activity, FileText, Table } from 'lucide-react';

interface BillingSummary {
  estate_code: string;
  estate_name: string;
  total_amount_collected: number;
  total_commissions: number;
  total_payments: number;
  total_customers: number;
  outstanding_balance: number;
  collection_rate: number;
}

interface BillingTotals {
  total_revenue: number;
  total_commissions: number;
  total_payments: number;
  total_customers: number;
  outstanding_balance: number;
}

const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summaries, setSummaries] = useState<BillingSummary[]>([]);
  const [totals, setTotals] = useState<BillingTotals>({
    total_revenue: 0,
    total_commissions: 0,
    total_payments: 0,
    total_customers: 0,
    outstanding_balance: 0,
  });
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    loadBillingData();
    loadMonthlyTrend();
  }, [selectedMonth, selectedYear]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/billing?month=${selectedMonth}&year=${selectedYear}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch billing data');
      
      const data = await response.json();
      setSummaries(data.estates || []);
      setTotals(data.totals || {});
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyTrend = async () => {
    try {
      // Load last 12 months of data for trend chart
      const trends = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const response = await fetch(`/api/billing?month=${month}&year=${year}`);
        const data = await response.json();
        
        trends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: data.totals?.total_revenue || 0,
          commissions: data.totals?.total_commissions || 0,
        });
      }
      
      setMonthlyTrend(trends);
    } catch (error) {
      console.error('Error loading monthly trend:', error);
    }
  };

  const generateBillingSummary = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate billing summary');

      await loadBillingData();
      alert('Billing summary generated successfully!');
    } catch (error) {
      console.error('Error generating billing summary:', error);
      alert('Failed to generate billing summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      if (format === 'csv') {
        // Create CSV headers
        const headers = [
          'Estate Code',
          'Estate Name',
          'Revenue (NGN)',
          'Commissions (NGN)',
          'Total Payments',
          'Total Customers',
          'Outstanding Balance (NGN)',
          'Collection Rate (%)',
        ];

        // Create CSV rows
        const rows = summaries.map((summary) => [
          summary.estate_code,
          summary.estate_name,
          summary.total_amount_collected.toFixed(2),
          summary.total_commissions.toFixed(2),
          summary.total_payments.toString(),
          summary.total_customers.toString(),
          summary.outstanding_balance.toFixed(2),
          summary.collection_rate.toFixed(2),
        ]);

        // Add totals row
        rows.push([
          'TOTAL',
          '',
          totals.total_revenue.toFixed(2),
          totals.total_commissions.toFixed(2),
          totals.total_payments.toString(),
          totals.total_customers.toString(),
          totals.outstanding_balance.toFixed(2),
          '',
        ]);

        // Convert to CSV string
        const csvContent = [
          headers.join(','),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `billing-summary-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.csv`;
        link.click();
      } else {
        // For PDF, we'll use HTML table to PDF conversion
        window.print();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Performance</h1>
          <p className="text-gray-600 mt-1">Monthly revenue, commissions, and performance insights</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadBillingData()}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={generateBillingSummary}
            disabled={generating}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2025, month - 1).toLocaleDateString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            {[2025, 2024, 2023].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(totals.total_revenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-500"
        />
        <SummaryCard
          title="Total Commissions"
          value={formatCurrency(totals.total_commissions)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <SummaryCard
          title="Total Payments"
          value={totals.total_payments.toString()}
          icon={<Activity className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <SummaryCard
          title="Total Customers"
          value={totals.total_customers.toString()}
          icon={<Users className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="commissions" stroke="#f59e0b" strokeWidth={2} name="Commissions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estate Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estate Revenue Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaries.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estate_code" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="total_amount_collected" fill="#0284c7" name="Revenue" />
              <Bar dataKey="total_commissions" fill="#f59e0b" name="Commissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estate Revenue Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue by Estate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summaries}
                dataKey="total_amount_collected"
                nameKey="estate_name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.estate_code}: ${formatCurrency(entry.total_amount_collected)}`}
              >
                {summaries.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Collection Rate by Estate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estate_code" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Bar dataKey="collection_rate" fill="#10b981" name="Collection Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Estate Performance Details</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Table className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaries.map((estate) => (
                <tr key={estate.estate_code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{estate.estate_code}</div>
                    <div className="text-sm text-gray-500">{estate.estate_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {formatCurrency(estate.total_amount_collected)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(estate.total_commissions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estate.total_payments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estate.total_customers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {formatCurrency(estate.outstanding_balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(estate.collection_rate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{estate.collection_rate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
