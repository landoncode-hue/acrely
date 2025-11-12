import { supabase } from './supabase';

export interface BillingSummary {
  id: string;
  month: number;
  year: number;
  estate_id: string | null;
  estate_code: string;
  estate_name: string;
  total_payments: number;
  total_amount_collected: number;
  confirmed_payments: number;
  pending_payments: number;
  total_commissions: number;
  pending_commissions: number;
  approved_commissions: number;
  paid_commissions: number;
  total_customers: number;
  active_allocations: number;
  completed_allocations: number;
  outstanding_balance: number;
  collection_rate: number;
  created_at: string;
  updated_at: string;
}

export interface BillingTotals {
  total_revenue: number;
  total_commissions: number;
  total_payments: number;
  total_customers: number;
  outstanding_balance: number;
}

export interface EstatePerformance {
  year: number;
  month: number;
  estate_code: string;
  estate_name: string;
  total_amount_collected: number;
  total_commissions: number;
  total_customers: number;
  active_allocations: number;
  collection_rate: number;
  outstanding_balance: number;
  revenue_growth: number;
  created_at: string;
}

export interface AgentCommission {
  agent_id: string;
  agent_name: string;
  agent_email: string;
  total_commissions: number;
  pending_amount: number;
  approved_amount: number;
  paid_amount: number;
  total_commission_amount: number;
  total_allocations: number;
  total_sales_value: number;
  avg_commission_rate: number;
  last_commission_date: string;
}

export interface YearlyTrend {
  year: number;
  estate_code: string;
  estate_name: string;
  months_recorded: number;
  yearly_revenue: number;
  yearly_commissions: number;
  yearly_payment_count: number;
  avg_collection_rate: number;
  total_outstanding: number;
  last_updated: string;
}

/**
 * Fetch billing summary for a specific month
 */
export async function getBillingSummary(
  month?: number,
  year?: number,
  estateCode?: string
) {
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  let query = supabase
    .from('billing_summary')
    .select('*')
    .eq('month', targetMonth)
    .eq('year', targetYear)
    .order('total_amount_collected', { ascending: false });

  if (estateCode) {
    query = query.eq('estate_code', estateCode);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as BillingSummary[];
}

/**
 * Get estate performance with growth metrics
 */
export async function getEstatePerformance(month?: number, year?: number) {
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  const { data, error } = await supabase
    .from('monthly_estate_performance')
    .select('*')
    .eq('month', targetMonth)
    .eq('year', targetYear)
    .order('total_amount_collected', { ascending: false });

  if (error) throw error;

  return data as EstatePerformance[];
}

/**
 * Get agent commission summary
 */
export async function getAgentCommissionSummary() {
  const { data, error } = await supabase
    .from('agent_commission_summary')
    .select('*')
    .order('total_commission_amount', { ascending: false });

  if (error) throw error;

  return data as AgentCommission[];
}

/**
 * Get yearly revenue trend
 */
export async function getYearlyRevenueTrend(year?: number) {
  const targetYear = year || new Date().getFullYear();

  const { data, error } = await supabase
    .from('yearly_revenue_trend')
    .select('*')
    .eq('year', targetYear)
    .order('yearly_revenue', { ascending: false });

  if (error) throw error;

  return data as YearlyTrend[];
}

/**
 * Trigger billing summary generation via Edge Function
 */
export async function generateBillingSummary(
  month?: number,
  year?: number,
  estateCode?: string,
  forceRegenerate = false
) {
  const { data, error } = await supabase.functions.invoke('generate-billing-summary', {
    body: {
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
      estate_code: estateCode,
      force_regenerate: forceRegenerate,
    },
  });

  if (error) throw error;

  return data;
}

/**
 * Get billing totals for a period
 */
export async function getBillingTotals(
  month?: number,
  year?: number
): Promise<BillingTotals> {
  const summaries = await getBillingSummary(month, year);

  return summaries.reduce(
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
}

/**
 * Get monthly trend data for charts (last 12 months)
 */
export async function getMonthlyTrend(estateCode?: string) {
  const now = new Date();
  const trends = [];

  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const summaries = await getBillingSummary(month, year, estateCode);
    
    const monthTotal = summaries.reduce(
      (acc, item) => ({
        revenue: acc.revenue + Number(item.total_amount_collected),
        commissions: acc.commissions + Number(item.total_commissions),
        payments: acc.payments + item.total_payments,
      }),
      { revenue: 0, commissions: 0, payments: 0 }
    );

    trends.push({
      month: `${year}-${month.toString().padStart(2, '0')}`,
      monthLabel: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ...monthTotal,
    });
  }

  return trends;
}
