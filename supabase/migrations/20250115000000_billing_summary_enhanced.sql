-- =====================================================
-- Migration: Enhanced Billing Summary System
-- Version: 1.7.0
-- Description: Comprehensive billing analytics with
--              monthly summaries, estate performance,
--              and agent commission tracking
-- =====================================================

-- ============================================================================
-- PART 1: Core Billing Summary Table
-- ============================================================================

-- Drop and recreate billing_summary table with enhanced schema
DROP TABLE IF EXISTS public.billing_summary CASCADE;

CREATE TABLE public.billing_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2025),
  estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE,
  estate_code TEXT NOT NULL,
  estate_name TEXT NOT NULL,
  
  -- Payment metrics
  total_payments INTEGER DEFAULT 0,
  total_amount_collected NUMERIC DEFAULT 0,
  confirmed_payments INTEGER DEFAULT 0,
  pending_payments INTEGER DEFAULT 0,
  
  -- Commission metrics
  total_commissions NUMERIC DEFAULT 0,
  pending_commissions NUMERIC DEFAULT 0,
  approved_commissions NUMERIC DEFAULT 0,
  paid_commissions NUMERIC DEFAULT 0,
  
  -- Customer metrics
  total_customers INTEGER DEFAULT 0,
  active_allocations INTEGER DEFAULT 0,
  completed_allocations INTEGER DEFAULT 0,
  
  -- Revenue metrics
  outstanding_balance NUMERIC DEFAULT 0,
  collection_rate NUMERIC DEFAULT 0, -- Percentage of expected vs actual
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(month, year, estate_code)
);

-- Create indexes for performance
CREATE INDEX idx_billing_summary_month_year ON public.billing_summary(year, month);
CREATE INDEX idx_billing_summary_estate_id ON public.billing_summary(estate_id);
CREATE INDEX idx_billing_summary_estate_code ON public.billing_summary(estate_code);
CREATE INDEX idx_billing_summary_created_at ON public.billing_summary(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_billing_summary_updated_at 
  BEFORE UPDATE ON public.billing_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 2: Analytical Views
-- ============================================================================

-- View: Monthly Estate Performance
-- Shows revenue, commissions, and growth metrics per estate per month
CREATE OR REPLACE VIEW monthly_estate_performance AS
SELECT 
  bs.year,
  bs.month,
  bs.estate_code,
  bs.estate_name,
  bs.total_amount_collected,
  bs.total_commissions,
  bs.total_customers,
  bs.active_allocations,
  bs.collection_rate,
  bs.outstanding_balance,
  
  -- Calculate month-over-month growth
  bs.total_amount_collected - COALESCE(
    (SELECT total_amount_collected 
     FROM public.billing_summary prev 
     WHERE prev.estate_code = bs.estate_code 
       AND ((prev.month = bs.month - 1 AND prev.year = bs.year) 
            OR (prev.month = 12 AND prev.year = bs.year - 1 AND bs.month = 1))
     LIMIT 1), 0
  ) as revenue_growth,
  
  bs.created_at
FROM public.billing_summary bs
ORDER BY bs.year DESC, bs.month DESC, bs.total_amount_collected DESC;

-- View: Agent Commission Summary
-- Aggregates commission data per agent with performance metrics
CREATE OR REPLACE VIEW agent_commission_summary AS
SELECT 
  u.id as agent_id,
  u.full_name as agent_name,
  u.email as agent_email,
  COUNT(DISTINCT c.id) as total_commissions,
  SUM(c.commission_amount) FILTER (WHERE c.status = 'pending') as pending_amount,
  SUM(c.commission_amount) FILTER (WHERE c.status = 'approved') as approved_amount,
  SUM(c.commission_amount) FILTER (WHERE c.status = 'paid') as paid_amount,
  SUM(c.commission_amount) as total_commission_amount,
  COUNT(DISTINCT a.id) as total_allocations,
  SUM(a.total_amount) as total_sales_value,
  
  -- Calculate average commission rate
  CASE 
    WHEN SUM(a.total_amount) > 0 
    THEN (SUM(c.commission_amount) / SUM(a.total_amount) * 100)
    ELSE 0 
  END as avg_commission_rate,
  
  MAX(c.created_at) as last_commission_date
FROM public.users u
LEFT JOIN public.commissions c ON u.id = c.agent_id
LEFT JOIN public.allocations a ON c.allocation_id = a.id
WHERE u.role = 'Agent'
GROUP BY u.id, u.full_name, u.email
ORDER BY total_commission_amount DESC NULLS LAST;

-- View: Yearly Revenue Trend
-- Shows annual aggregated revenue and commissions by estate
CREATE OR REPLACE VIEW yearly_revenue_trend AS
SELECT 
  bs.year,
  bs.estate_code,
  bs.estate_name,
  COUNT(*) as months_recorded,
  SUM(bs.total_amount_collected) as yearly_revenue,
  SUM(bs.total_commissions) as yearly_commissions,
  SUM(bs.total_payments) as yearly_payment_count,
  AVG(bs.collection_rate) as avg_collection_rate,
  SUM(bs.outstanding_balance) as total_outstanding,
  MAX(bs.created_at) as last_updated
FROM public.billing_summary bs
GROUP BY bs.year, bs.estate_code, bs.estate_name
ORDER BY bs.year DESC, yearly_revenue DESC;

-- View: Monthly Payment Breakdown
-- Detailed payment statistics by month and payment method
CREATE OR REPLACE VIEW monthly_payment_breakdown AS
SELECT 
  EXTRACT(YEAR FROM p.payment_date) as year,
  EXTRACT(MONTH FROM p.payment_date) as month,
  pl.estate_code,
  pl.estate_name,
  p.payment_method,
  p.status,
  COUNT(*) as payment_count,
  SUM(p.amount) as total_amount,
  AVG(p.amount) as avg_payment_amount
FROM public.payments p
JOIN public.allocations a ON p.allocation_id = a.id
JOIN public.plots pl ON a.plot_id = pl.id
GROUP BY 
  EXTRACT(YEAR FROM p.payment_date),
  EXTRACT(MONTH FROM p.payment_date),
  pl.estate_code,
  pl.estate_name,
  p.payment_method,
  p.status
ORDER BY year DESC, month DESC, total_amount DESC;

-- ============================================================================
-- PART 3: Helper Functions
-- ============================================================================

-- Function: Get billing summary for a specific month
CREATE OR REPLACE FUNCTION get_monthly_billing_summary(
  target_month INTEGER,
  target_year INTEGER,
  filter_estate_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  estate_code TEXT,
  estate_name TEXT,
  total_revenue NUMERIC,
  total_commissions NUMERIC,
  total_customers INTEGER,
  collection_rate NUMERIC,
  outstanding_balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.estate_code,
    bs.estate_name,
    bs.total_amount_collected,
    bs.total_commissions,
    bs.total_customers,
    bs.collection_rate,
    bs.outstanding_balance
  FROM public.billing_summary bs
  WHERE bs.month = target_month 
    AND bs.year = target_year
    AND (filter_estate_code IS NULL OR bs.estate_code = filter_estate_code)
  ORDER BY bs.total_amount_collected DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top performing estates
CREATE OR REPLACE FUNCTION get_top_estates(
  limit_count INTEGER DEFAULT 5,
  start_month INTEGER DEFAULT NULL,
  start_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
  estate_code TEXT,
  estate_name TEXT,
  total_revenue NUMERIC,
  total_commissions NUMERIC,
  total_customers INTEGER,
  avg_collection_rate NUMERIC
) AS $$
DECLARE
  filter_month INTEGER := COALESCE(start_month, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);
  filter_year INTEGER := COALESCE(start_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
BEGIN
  RETURN QUERY
  SELECT 
    bs.estate_code,
    bs.estate_name,
    SUM(bs.total_amount_collected) as total_revenue,
    SUM(bs.total_commissions) as total_commissions,
    SUM(bs.total_customers) as total_customers,
    AVG(bs.collection_rate) as avg_collection_rate
  FROM public.billing_summary bs
  WHERE bs.year = filter_year AND bs.month = filter_month
  GROUP BY bs.estate_code, bs.estate_name
  ORDER BY total_revenue DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: Row-Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.billing_summary ENABLE ROW LEVEL SECURITY;

-- Policy: Admin roles can view all billing summaries
DROP POLICY IF EXISTS "Admin roles can view billing summaries" ON public.billing_summary;
CREATE POLICY "Admin roles can view billing summaries" 
  ON public.billing_summary
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
        AND role IN ('CEO', 'MD', 'SysAdmin')
    )
  );

-- Policy: Admin roles can insert billing summaries
DROP POLICY IF EXISTS "Admin roles can insert billing summaries" ON public.billing_summary;
CREATE POLICY "Admin roles can insert billing summaries" 
  ON public.billing_summary
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
        AND role IN ('SysAdmin')
    )
  );

-- Policy: SysAdmin can update billing summaries
DROP POLICY IF EXISTS "SysAdmin can update billing summaries" ON public.billing_summary;
CREATE POLICY "SysAdmin can update billing summaries" 
  ON public.billing_summary
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
        AND role = 'SysAdmin'
    )
  );

-- ============================================================================
-- PART 5: Comments and Documentation
-- ============================================================================

COMMENT ON TABLE public.billing_summary IS 'Monthly billing aggregations for estate revenue, commissions, and customer metrics';
COMMENT ON COLUMN public.billing_summary.month IS 'Month number (1-12)';
COMMENT ON COLUMN public.billing_summary.year IS 'Year (2025+)';
COMMENT ON COLUMN public.billing_summary.collection_rate IS 'Percentage of expected payments collected';
COMMENT ON COLUMN public.billing_summary.outstanding_balance IS 'Total unpaid balance for the estate';

COMMENT ON VIEW monthly_estate_performance IS 'Estate performance metrics with month-over-month growth';
COMMENT ON VIEW agent_commission_summary IS 'Agent commission aggregations and sales performance';
COMMENT ON VIEW yearly_revenue_trend IS 'Annual revenue trends by estate';
COMMENT ON VIEW monthly_payment_breakdown IS 'Payment statistics by method and status';
