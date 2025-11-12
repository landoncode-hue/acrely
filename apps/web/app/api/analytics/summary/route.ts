export const dynamic = 'force-dynamic';
/**
 * Analytics Summary API Route
 * GET /api/analytics/summary
 * 
 * Returns high-level KPIs and summary metrics for executive dashboard
 * Access: CEO, MD, SysAdmin only
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Cache for 10 minutes
export const revalidate = 600;

interface AnalyticsSummary {
  total_revenue: number;
  total_customers: number;
  active_customers: number;
  total_agents: number;
  growth_rate_30d: number;
  conversion_rate: number;
  total_payments: number;
  avg_payment_amount: number;
  top_estate: {
    name: string;
    revenue: number;
  };
  top_agent: {
    name: string;
    commissions: number;
  };
  recent_trends: {
    month: string;
    revenue: number;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify user has required role
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!['CEO', 'MD', 'SysAdmin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Fetch analytics data from views
    const [
      estatePerformance,
      agentPerformance,
      revenueTrends,
      customerEngagement,
    ] = await Promise.all([
      supabase.from('estate_performance_summary').select('*').order('total_revenue', { ascending: false }),
      supabase.from('agent_performance_summary').select('*').order('total_commissions', { ascending: false }),
      supabase.from('revenue_trends_summary').select('*').order('month', { ascending: false }).limit(6),
      supabase.from('customer_engagement_summary').select('*'),
    ]);

    if (estatePerformance.error) throw estatePerformance.error;
    if (agentPerformance.error) throw agentPerformance.error;
    if (revenueTrends.error) throw revenueTrends.error;
    if (customerEngagement.error) throw customerEngagement.error;

    // Calculate summary metrics
    const totalRevenue = estatePerformance.data?.reduce(
      (sum, estate) => sum + parseFloat(estate.total_revenue || '0'),
      0
    ) || 0;

    const totalCustomers = customerEngagement.data?.reduce(
      (sum, estate) => sum + (estate.total_customers || 0),
      0
    ) || 0;

    const activeCustomers = customerEngagement.data?.reduce(
      (sum, estate) => sum + (estate.active_customers || 0),
      0
    ) || 0;

    const totalAgents = agentPerformance.data?.length || 0;

    const avgGrowthRate = estatePerformance.data?.reduce(
      (sum, estate) => sum + parseFloat(estate.growth_rate_30d || '0'),
      0
    ) / (estatePerformance.data?.length || 1);

    const avgConversionRate = estatePerformance.data?.reduce(
      (sum, estate) => sum + parseFloat(estate.conversion_rate || '0'),
      0
    ) / (estatePerformance.data?.length || 1);

    const totalPayments = estatePerformance.data?.reduce(
      (sum, estate) => sum + (estate.total_payments || 0),
      0
    ) || 0;

    const avgPaymentAmount = totalRevenue / (totalPayments || 1);

    const topEstate = estatePerformance.data?.[0];
    const topAgent = agentPerformance.data?.[0];

    const summary: AnalyticsSummary = {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_customers: totalCustomers,
      active_customers: activeCustomers,
      total_agents: totalAgents,
      growth_rate_30d: Math.round(avgGrowthRate * 100) / 100,
      conversion_rate: Math.round(avgConversionRate * 100) / 100,
      total_payments: totalPayments,
      avg_payment_amount: Math.round(avgPaymentAmount * 100) / 100,
      top_estate: {
        name: topEstate?.estate_name || 'N/A',
        revenue: parseFloat(topEstate?.total_revenue || '0'),
      },
      top_agent: {
        name: topAgent?.agent_name || 'N/A',
        commissions: parseFloat(topAgent?.total_commissions || '0'),
      },
      recent_trends: revenueTrends.data?.map(trend => ({
        month: trend.month,
        revenue: parseFloat(trend.total_revenue || '0'),
      })) || [],
    };

    return NextResponse.json({
      success: true,
      data: summary,
      cached_until: new Date(Date.now() + 600000).toISOString(),
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
