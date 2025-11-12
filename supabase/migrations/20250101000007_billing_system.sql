-- Migration: Billing System for Tenant Billing
-- Author: Kennedy - Landon Digital
-- Version: 1.0.0
-- Description: Implements billing table, triggers, and recurring billing logic

-- ============================================
-- Billing Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'commission', 'subscription', 'service_fee')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  billing_period TEXT NOT NULL, -- e.g., '2025-01', 'Q1-2025'
  reference_id UUID, -- Links to payment, allocation, or other entity
  reference_table TEXT, -- 'payments', 'allocations', 'commissions'
  description TEXT,
  metadata JSONB DEFAULT '{}', -- Additional billing info
  billed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_billing_period ON public.billing(billing_period);
CREATE INDEX IF NOT EXISTS idx_billing_status ON public.billing(status);
CREATE INDEX IF NOT EXISTS idx_billing_type ON public.billing(type);
CREATE INDEX IF NOT EXISTS idx_billing_reference ON public.billing(reference_id, reference_table);
CREATE INDEX IF NOT EXISTS idx_billing_created_at ON public.billing(created_at);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- Admin level can view all billing records
CREATE POLICY "Admin level can view all billing records" ON public.billing
  FOR SELECT USING (is_admin_level());

-- Admin level can insert billing records
CREATE POLICY "Admin level can create billing records" ON public.billing
  FOR INSERT WITH CHECK (is_admin_level());

-- Admin level can update billing records
CREATE POLICY "Admin level can update billing records" ON public.billing
  FOR UPDATE USING (is_admin_level());

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_billing_updated_at
BEFORE UPDATE ON public.billing
FOR EACH ROW EXECUTE FUNCTION update_billing_updated_at();

-- ============================================
-- Function: Log Payment as Billable Event
-- ============================================
CREATE OR REPLACE FUNCTION log_payment_billing_event()
RETURNS TRIGGER AS $$
DECLARE
  v_billing_period TEXT;
BEGIN
  -- Generate billing period in YYYY-MM format
  v_billing_period := TO_CHAR(NEW.payment_date, 'YYYY-MM');
  
  -- Insert billing record for this payment
  INSERT INTO public.billing (
    amount,
    type,
    status,
    billing_period,
    reference_id,
    reference_table,
    description,
    metadata
  ) VALUES (
    NEW.amount,
    'payment',
    'completed',
    v_billing_period,
    NEW.id,
    'payments',
    'Customer payment for allocation',
    jsonb_build_object(
      'payment_method', NEW.payment_method,
      'allocation_id', NEW.allocation_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on payments table
DROP TRIGGER IF EXISTS trigger_payment_billing ON public.payments;
CREATE TRIGGER trigger_payment_billing
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION log_payment_billing_event();

-- ============================================
-- Function: Log Commission as Billable Event
-- ============================================
CREATE OR REPLACE FUNCTION log_commission_billing_event()
RETURNS TRIGGER AS $$
DECLARE
  v_billing_period TEXT;
BEGIN
  -- Generate billing period
  v_billing_period := TO_CHAR(NEW.created_at, 'YYYY-MM');
  
  -- Insert billing record for commission
  INSERT INTO public.billing (
    amount,
    type,
    status,
    billing_period,
    reference_id,
    reference_table,
    description,
    metadata
  ) VALUES (
    NEW.commission_amount,
    'commission',
    CASE 
      WHEN NEW.status = 'paid' THEN 'completed'
      WHEN NEW.status = 'approved' THEN 'pending'
      ELSE 'pending'
    END,
    v_billing_period,
    NEW.id,
    'commissions',
    'Agent commission',
    jsonb_build_object(
      'agent_id', NEW.agent_id,
      'allocation_id', NEW.allocation_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on commissions table
DROP TRIGGER IF EXISTS trigger_commission_billing ON public.commissions;
CREATE TRIGGER trigger_commission_billing
AFTER INSERT ON public.commissions
FOR EACH ROW EXECUTE FUNCTION log_commission_billing_event();

-- ============================================
-- View: Monthly Billing Summary
-- ============================================
CREATE OR REPLACE VIEW monthly_billing_summary AS
SELECT
  billing_period,
  type,
  status,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  MIN(created_at) as period_start,
  MAX(created_at) as period_end
FROM public.billing
GROUP BY billing_period, type, status
ORDER BY billing_period DESC, type;

-- Grant access to authenticated users with proper RLS
GRANT SELECT ON monthly_billing_summary TO authenticated;

-- ============================================
-- View: Quarterly Billing Summary
-- ============================================
CREATE OR REPLACE VIEW quarterly_billing_summary AS
SELECT
  TO_CHAR(created_at, 'YYYY') || '-Q' || TO_CHAR(created_at, 'Q') as quarter,
  type,
  status,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM public.billing
GROUP BY 
  TO_CHAR(created_at, 'YYYY') || '-Q' || TO_CHAR(created_at, 'Q'),
  type,
  status
ORDER BY quarter DESC, type;

GRANT SELECT ON quarterly_billing_summary TO authenticated;

-- ============================================
-- Function: Generate Billing Report
-- ============================================
CREATE OR REPLACE FUNCTION generate_billing_report(
  p_period TEXT,
  p_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  billing_id UUID,
  amount DECIMAL,
  type TEXT,
  status TEXT,
  description TEXT,
  reference_id UUID,
  billed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.amount,
    b.type,
    b.status,
    b.description,
    b.reference_id,
    b.billed_at
  FROM public.billing b
  WHERE b.billing_period = p_period
    AND (p_type IS NULL OR b.type = p_type)
  ORDER BY b.billed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_billing_report TO authenticated;

-- ============================================
-- Comments for Documentation
-- ============================================
COMMENT ON TABLE public.billing IS 'Tenant billing records for all billable events';
COMMENT ON COLUMN public.billing.billing_period IS 'Period identifier in YYYY-MM or Q#-YYYY format';
COMMENT ON COLUMN public.billing.reference_id IS 'Links to the source transaction (payment, commission, etc.)';
COMMENT ON COLUMN public.billing.metadata IS 'Additional context stored as JSONB';
COMMENT ON VIEW monthly_billing_summary IS 'Aggregated monthly billing data';
COMMENT ON VIEW quarterly_billing_summary IS 'Aggregated quarterly billing data';
