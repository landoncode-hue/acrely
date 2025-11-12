import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BillingQuery {
  month?: string;
  year?: string;
  estate_code?: string;
  view?: 'summary' | 'estate_performance' | 'agent_commissions' | 'yearly_trend';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const estate_code = searchParams.get('estate_code');
    const view = searchParams.get('view') || 'summary';

    // Default to current month/year if not provided
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    switch (view) {
      case 'summary':
        return await getBillingSummary(targetMonth, targetYear, estate_code);
      
      case 'estate_performance':
        return await getEstatePerformance(targetMonth, targetYear);
      
      case 'agent_commissions':
        return await getAgentCommissions();
      
      case 'yearly_trend':
        return await getYearlyTrend(targetYear);
      
      default:
        return NextResponse.json(
          { error: 'Invalid view parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Billing API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, month, year, estate_code } = body;

    if (action === 'generate') {
      // Trigger the Edge Function to generate billing summary
      const { data, error } = await supabase.functions.invoke('generate-billing-summary', {
        body: {
          month: month || new Date().getMonth() + 1,
          year: year || new Date().getFullYear(),
          estate_code,
          force_regenerate: true,
        },
      });

      if (error) {
        throw new Error(`Failed to generate billing summary: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        data,
        message: 'Billing summary generated successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Billing POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get billing summary data
async function getBillingSummary(
  month: number,
  year: number,
  estate_code?: string | null
) {
  let query = supabase
    .from('billing_summary')
    .select('*')
    .eq('month', month)
    .eq('year', year)
    .order('total_amount_collected', { ascending: false });

  if (estate_code) {
    query = query.eq('estate_code', estate_code);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch billing summary: ${error.message}`);
  }

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      total_revenue: acc.total_revenue + Number(item.total_amount_collected),
      total_commissions: acc.total_commissions + Number(item.total_commissions),
      total_payments: acc.total_payments + item.total_payments,
      total_customers: acc.total_customers + item.total_customers,
      outstanding_balance: acc.outstanding_balance + Number(item.outstanding_balance),
    }),
    {
      total_revenue: 0,
      total_commissions: 0,
      total_payments: 0,
      total_customers: 0,
      outstanding_balance: 0,
    }
  );

  return NextResponse.json({
    period: `${year}-${month.toString().padStart(2, '0')}`,
    totals,
    estates: data,
    count: data.length,
  });
}

// Get estate performance view
async function getEstatePerformance(month: number, year: number) {
  const { data, error } = await supabase
    .from('monthly_estate_performance')
    .select('*')
    .eq('month', month)
    .eq('year', year)
    .order('total_amount_collected', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch estate performance: ${error.message}`);
  }

  return NextResponse.json({
    period: `${year}-${month.toString().padStart(2, '0')}`,
    performance: data,
    count: data.length,
  });
}

// Get agent commission summary
async function getAgentCommissions() {
  const { data, error } = await supabase
    .from('agent_commission_summary')
    .select('*')
    .order('total_commission_amount', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch agent commissions: ${error.message}`);
  }

  return NextResponse.json({
    agents: data,
    count: data.length,
    totals: data.reduce(
      (acc, agent) => ({
        total_pending: acc.total_pending + Number(agent.pending_amount || 0),
        total_approved: acc.total_approved + Number(agent.approved_amount || 0),
        total_paid: acc.total_paid + Number(agent.paid_amount || 0),
        total_commissions: acc.total_commissions + Number(agent.total_commission_amount || 0),
      }),
      {
        total_pending: 0,
        total_approved: 0,
        total_paid: 0,
        total_commissions: 0,
      }
    ),
  });
}

// Get yearly revenue trend
async function getYearlyTrend(year: number) {
  const { data, error } = await supabase
    .from('yearly_revenue_trend')
    .select('*')
    .eq('year', year)
    .order('yearly_revenue', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch yearly trend: ${error.message}`);
  }

  return NextResponse.json({
    year,
    trends: data,
    count: data.length,
    totals: data.reduce(
      (acc, trend) => ({
        total_revenue: acc.total_revenue + Number(trend.yearly_revenue || 0),
        total_commissions: acc.total_commissions + Number(trend.yearly_commissions || 0),
      }),
      {
        total_revenue: 0,
        total_commissions: 0,
      }
    ),
  });
}
