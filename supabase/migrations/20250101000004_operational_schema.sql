-- Operational Schema Extensions for Acrely v2
-- Adds computed views, triggers, and enhanced RLS for CEO, MD, SysAdmin, Frontdesk, Agent roles

-- Update users table to support new roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('CEO', 'MD', 'SysAdmin', 'Frontdesk', 'Agent'));

-- Add estates table for better estate management
CREATE TABLE IF NOT EXISTS public.estates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_code TEXT UNIQUE NOT NULL,
  estate_name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  total_plots INTEGER DEFAULT 0,
  available_plots INTEGER DEFAULT 0,
  allocated_plots INTEGER DEFAULT 0,
  sold_plots INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'sold_out', 'upcoming', 'archived')) DEFAULT 'active',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key from plots to estates
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE;

-- Create index for estate_id
CREATE INDEX IF NOT EXISTS idx_plots_estate_id ON public.plots(estate_id);

-- Trigger for updating estate plot counts
CREATE OR REPLACE FUNCTION update_estate_plot_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.estates
    SET 
      available_plots = (SELECT COUNT(*) FROM public.plots WHERE estate_id = NEW.estate_id AND status = 'available'),
      allocated_plots = (SELECT COUNT(*) FROM public.plots WHERE estate_id = NEW.estate_id AND status = 'allocated'),
      sold_plots = (SELECT COUNT(*) FROM public.plots WHERE estate_id = NEW.estate_id AND status = 'sold')
    WHERE id = NEW.estate_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.estates
    SET 
      available_plots = (SELECT COUNT(*) FROM public.plots WHERE estate_id = OLD.estate_id AND status = 'available'),
      allocated_plots = (SELECT COUNT(*) FROM public.plots WHERE estate_id = OLD.estate_id AND status = 'allocated'),
      sold_plots = (SELECT COUNT(*) FROM public.plots WHERE estate_id = OLD.estate_id AND status = 'sold')
    WHERE id = OLD.estate_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_estate_counts_trigger 
AFTER INSERT OR UPDATE OR DELETE ON public.plots
FOR EACH ROW EXECUTE FUNCTION update_estate_plot_counts();

-- Trigger for auto-updating plot status on allocation
CREATE OR REPLACE FUNCTION update_plot_status_on_allocation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.plots
    SET status = 'allocated'
    WHERE id = NEW.plot_id;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' THEN
    UPDATE public.plots
    SET status = 'sold'
    WHERE id = NEW.plot_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status = 'cancelled') THEN
    UPDATE public.plots
    SET status = 'available'
    WHERE id = COALESCE(NEW.plot_id, OLD.plot_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER allocation_plot_status_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.allocations
FOR EACH ROW EXECUTE FUNCTION update_plot_status_on_allocation();

-- View: Commission Summary by Agent
CREATE OR REPLACE VIEW commission_summary AS
SELECT 
  u.id as agent_id,
  u.full_name as agent_name,
  u.email as agent_email,
  COUNT(c.id) as total_commissions,
  SUM(CASE WHEN c.status = 'pending' THEN c.commission_amount ELSE 0 END) as pending_amount,
  SUM(CASE WHEN c.status = 'approved' THEN c.commission_amount ELSE 0 END) as approved_amount,
  SUM(CASE WHEN c.status = 'paid' THEN c.commission_amount ELSE 0 END) as paid_amount,
  SUM(c.commission_amount) as total_amount
FROM public.users u
LEFT JOIN public.commissions c ON u.id = c.agent_id
WHERE u.role = 'Agent'
GROUP BY u.id, u.full_name, u.email;

-- View: Overdue Payments
CREATE OR REPLACE VIEW overdue_payments AS
SELECT 
  a.id as allocation_id,
  a.customer_id,
  c.full_name as customer_name,
  c.phone as customer_phone,
  a.plot_id,
  p.estate_code || '-' || p.plot_number as plot_reference,
  a.next_payment_date,
  a.balance,
  a.total_amount,
  a.amount_paid,
  CURRENT_DATE - a.next_payment_date as days_overdue,
  a.status
FROM public.allocations a
JOIN public.customers c ON a.customer_id = c.id
JOIN public.plots p ON a.plot_id = p.id
WHERE a.next_payment_date < CURRENT_DATE
  AND a.status = 'active'
  AND a.balance > 0
ORDER BY days_overdue DESC;

-- View: Monthly Payment Performance
CREATE OR REPLACE VIEW monthly_payment_performance AS
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  COUNT(*) as total_payments,
  SUM(amount) as total_amount,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_payments,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
FROM public.payments
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;

-- View: Estate Performance Dashboard
CREATE OR REPLACE VIEW estate_performance AS
SELECT 
  e.id,
  e.estate_code,
  e.estate_name,
  e.total_plots,
  e.available_plots,
  e.allocated_plots,
  e.sold_plots,
  COALESCE(SUM(a.total_amount), 0) as total_revenue,
  COALESCE(SUM(a.amount_paid), 0) as revenue_collected,
  COALESCE(SUM(a.balance), 0) as outstanding_balance,
  COUNT(a.id) as total_allocations
FROM public.estates e
LEFT JOIN public.plots p ON e.id = p.estate_id
LEFT JOIN public.allocations a ON p.id = a.plot_id
GROUP BY e.id, e.estate_code, e.estate_name, e.total_plots, e.available_plots, e.allocated_plots, e.sold_plots;

-- View: Customer Activity Log
CREATE OR REPLACE VIEW customer_activity_log AS
SELECT 
  c.id as customer_id,
  c.full_name,
  'Customer Created' as activity_type,
  c.created_at as activity_date,
  NULL::UUID as allocation_id,
  NULL::UUID as payment_id
FROM public.customers c
UNION ALL
SELECT 
  a.customer_id,
  cu.full_name,
  'Plot Allocated' as activity_type,
  a.created_at,
  a.id as allocation_id,
  NULL::UUID as payment_id
FROM public.allocations a
JOIN public.customers cu ON a.customer_id = cu.id
UNION ALL
SELECT 
  a.customer_id,
  cu.full_name,
  'Payment Made' as activity_type,
  p.created_at,
  a.id as allocation_id,
  p.id as payment_id
FROM public.payments p
JOIN public.allocations a ON p.allocation_id = a.id
JOIN public.customers cu ON a.customer_id = cu.id
ORDER BY activity_date DESC;

-- Function to check and update overdue allocations
CREATE OR REPLACE FUNCTION check_overdue_allocations()
RETURNS void AS $$
BEGIN
  UPDATE public.allocations
  SET status = 'defaulted'
  WHERE next_payment_date < CURRENT_DATE - INTERVAL '30 days'
    AND status = 'active'
    AND balance > 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger for estates updated_at
CREATE TRIGGER update_estates_updated_at BEFORE UPDATE ON public.estates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on estates table
ALTER TABLE public.estates ENABLE ROW LEVEL SECURITY;

-- Estates policies
CREATE POLICY "Everyone can view estates" ON public.estates
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can manage estates" ON public.estates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('CEO', 'MD', 'SysAdmin')
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_estates_status ON public.estates(status);
CREATE INDEX IF NOT EXISTS idx_estates_estate_code ON public.estates(estate_code);
CREATE INDEX IF NOT EXISTS idx_allocations_next_payment_date ON public.allocations(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
