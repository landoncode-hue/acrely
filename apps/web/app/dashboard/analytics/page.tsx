'use client';

/**
 * Analytics Dashboard Page
 * /dashboard/analytics
 * 
 * Executive analytics dashboard with tabs for Overview, Estates, Agents, and Trends
 * Access: CEO, MD, SysAdmin only
 */

import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@acrely/services';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cards';
import AnalyticsSummaryCard from '@/components/analytics/AnalyticsSummaryCard';
import RevenueChart from '@/components/analytics/RevenueChart';
import EstateBarChart from '@/components/analytics/EstateBarChart';
import AgentRadarChart from '@/components/analytics/AgentRadarChart';
import ExportAnalyticsData from '@/components/analytics/ExportAnalyticsData';
import { TrendingUp, Building2, Users, DollarSign, Activity } from 'lucide-react';

interface AnalyticsSummary {
  total_revenue: number;
  total_customers: number;
  active_customers: number;
  total_agents: number;
  growth_rate_30d: number;
  conversion_rate: number;
  total_payments: number;
  avg_payment_amount: number;
  top_estate: { name: string; revenue: number };
  top_agent: { name: string; commissions: number };
  recent_trends: { month: string; revenue: number }[];
}

interface EstateData {
  estate_id: string;
  estate_name: string;
  total_revenue: number;
  total_customers: number;
  growth_rate_30d: number;
  conversion_rate: number;
}

interface AgentData {
  agent_id: string;
  agent_name: string;
  total_commissions: number;
  performance_score: number;
  payments_collected: number;
}

interface TrendData {
  historical: { month: string; total_revenue: number; mom_growth_rate: number }[];
  predictions: { predicted_month: string; predicted_revenue: number; confidence_level: number }[];
}

export default function AnalyticsDashboard(): React.JSX.Element {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [estates, setEstates] = useState<EstateData[]>([]);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Authentication required');
        return;
      }

      const token = session.access_token;

      // Fetch all analytics data in parallel
      const [summaryRes, estatesRes, agentsRes, trendsRes] = await Promise.all([
        fetch('/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/analytics/estates', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/analytics/agents', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/analytics/trends', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!summaryRes.ok || !estatesRes.ok || !agentsRes.ok || !trendsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [summaryData, estatesData, agentsData, trendsData] = await Promise.all([
        summaryRes.json(),
        estatesRes.json(),
        agentsRes.json(),
        trendsRes.json(),
      ]);

      setSummary(summaryData.data);
      setEstates(estatesData.data);
      setAgents(agentsData.data);
      setTrends(trendsData.data);
    } catch (err) {
      console.error('Analytics error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Unified business intelligence and insights</p>
        </div>
        <ExportAnalyticsData summary={summary} estates={estates} agents={agents} trends={trends} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="estates">Estates</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsSummaryCard
              title="Total Revenue"
              value={`₦${summary?.total_revenue.toLocaleString() || '0'}`}
              change={`${summary?.growth_rate_30d.toFixed(1)}%`}
              trend={summary && summary.growth_rate_30d > 0 ? 'up' : 'down'}
              icon={<DollarSign className="w-6 h-6" />}
            />
            <AnalyticsSummaryCard
              title="Active Customers"
              value={summary?.active_customers.toLocaleString() || '0'}
              change={`${summary?.conversion_rate.toFixed(1)}% conversion`}
              trend="up"
              icon={<Users className="w-6 h-6" />}
            />
            <AnalyticsSummaryCard
              title="Total Payments"
              value={summary?.total_payments.toLocaleString() || '0'}
              change={`₦${summary?.avg_payment_amount.toLocaleString()} avg`}
              trend="neutral"
              icon={<Activity className="w-6 h-6" />}
            />
            <AnalyticsSummaryCard
              title="Active Agents"
              value={summary?.total_agents.toLocaleString() || '0'}
              change={`Top: ${summary?.top_agent.name || 'N/A'}`}
              trend="neutral"
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends (Last 6 Months)</CardTitle>
              <CardDescription>Monthly revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={summary?.recent_trends || []} />
            </CardContent>
          </Card>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Top Estate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary?.top_estate.name || 'N/A'}</p>
                <p className="text-gray-600 mt-2">
                  Revenue: ₦{summary?.top_estate.revenue.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary?.top_agent.name || 'N/A'}</p>
                <p className="text-gray-600 mt-2">
                  Commissions: ₦{summary?.top_agent.commissions.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Estates Tab */}
        <TabsContent value="estates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estate Performance Comparison</CardTitle>
              <CardDescription>Revenue by estate</CardDescription>
            </CardHeader>
            <CardContent>
              <EstateBarChart data={estates} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estate Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Estate</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Customers</th>
                      <th className="text-right p-2">Growth (30d)</th>
                      <th className="text-right p-2">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estates.map((estate) => (
                      <tr key={estate.estate_id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{estate.estate_name}</td>
                        <td className="text-right p-2">₦{estate.total_revenue.toLocaleString()}</td>
                        <td className="text-right p-2">{estate.total_customers}</td>
                        <td className={`text-right p-2 ${estate.growth_rate_30d > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {estate.growth_rate_30d.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">{estate.conversion_rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Index</CardTitle>
              <CardDescription>Top 10 agents by performance score</CardDescription>
            </CardHeader>
            <CardContent>
              <AgentRadarChart data={agents.slice(0, 10)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Rank</th>
                      <th className="text-left p-2">Agent</th>
                      <th className="text-right p-2">Performance Score</th>
                      <th className="text-right p-2">Commissions</th>
                      <th className="text-right p-2">Payments Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent, index) => (
                      <tr key={agent.agent_id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-bold">{index + 1}</td>
                        <td className="p-2 font-medium">{agent.agent_name}</td>
                        <td className="text-right p-2">{agent.performance_score}</td>
                        <td className="text-right p-2">₦{agent.total_commissions.toLocaleString()}</td>
                        <td className="text-right p-2">{agent.payments_collected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends & Predictions</CardTitle>
              <CardDescription>Historical performance with AI-powered forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart 
                data={[
                  ...(trends?.historical || []).map(t => ({ month: t.month, revenue: t.total_revenue, type: 'historical' as const })),
                  ...(trends?.predictions || []).map(p => ({ month: p.predicted_month, revenue: p.predicted_revenue, type: 'predicted' as const }))
                ]} 
                showPredictions
              />
            </CardContent>
          </Card>

          {trends && trends.predictions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trends.predictions.map((pred, index) => (
                <Card key={pred.predicted_month}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {new Date(pred.predicted_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      ₦{pred.predicted_revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Confidence: {pred.confidence_level}%
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
