-- Migration: Receipt Generation and Management System
-- Author: Kennedy - Landon Digital
-- Version: 1.5.0
-- Description: Complete receipt management with PDF storage and customer notifications

-- ============================================
-- Receipts Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  file_url TEXT,
  amount NUMERIC NOT NULL,
  receipt_number TEXT UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  generated_by UUID REFERENCES public.users(id),
  estate_name TEXT,
  plot_reference TEXT,
  payment_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON public.receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_id ON public.receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_date ON public.receipts(payment_date);

-- ============================================
-- RLS Policies for Receipts
-- ============================================
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view receipts
CREATE POLICY "Authenticated users can view receipts" ON public.receipts
  FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can create receipts (via system)
CREATE POLICY "Authenticated users can create receipts" ON public.receipts
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Only admins can delete receipts
CREATE POLICY "Admins can delete receipts" ON public.receipts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'SysAdmin')
    )
  );

-- Admins can update receipts (for regeneration)
CREATE POLICY "Admins can update receipts" ON public.receipts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'SysAdmin')
    )
  );

-- ============================================
-- Function: Generate Receipt Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'RCP';
  current_year TEXT;
  sequence_num INTEGER;
  receipt_num TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get count of receipts this year + 1
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM public.receipts
  WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE);
  
  -- Format: RCP-2025-00001
  receipt_num := prefix || '-' || current_year || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Auto-create Receipt on Payment Confirmation
-- ============================================
CREATE OR REPLACE FUNCTION auto_create_receipt()
RETURNS TRIGGER AS $$
DECLARE
  allocation_record RECORD;
  customer_record RECORD;
  plot_record RECORD;
  receipt_num TEXT;
BEGIN
  -- Only create receipt when payment is confirmed
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    
    -- Fetch related data
    SELECT * INTO allocation_record FROM public.allocations WHERE id = NEW.allocation_id;
    SELECT * INTO customer_record FROM public.customers WHERE id = allocation_record.customer_id;
    SELECT * INTO plot_record FROM public.plots WHERE id = allocation_record.plot_id;
    
    -- Generate receipt number
    receipt_num := generate_receipt_number();
    
    -- Insert receipt record
    INSERT INTO public.receipts (
      payment_id,
      customer_id,
      amount,
      receipt_number,
      payment_date,
      generated_by,
      estate_name,
      plot_reference,
      payment_method,
      metadata
    ) VALUES (
      NEW.id,
      customer_record.id,
      NEW.amount,
      receipt_num,
      NEW.payment_date,
      NEW.recorded_by,
      plot_record.estate_name,
      plot_record.estate_code || '-' || plot_record.plot_number,
      NEW.payment_method,
      jsonb_build_object(
        'customer_name', customer_record.full_name,
        'customer_phone', customer_record.phone,
        'plot_size', plot_record.size_sqm,
        'total_allocation_amount', allocation_record.total_amount,
        'amount_paid_cumulative', allocation_record.amount_paid,
        'balance', allocation_record.balance
      )
    );
    
    -- Update receipt queue status to trigger Edge Function
    UPDATE public.receipt_queue
    SET status = 'pending'
    WHERE payment_id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Create Receipt on Payment Confirmation
-- ============================================
DROP TRIGGER IF EXISTS trigger_auto_create_receipt ON public.payments;
CREATE TRIGGER trigger_auto_create_receipt
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION auto_create_receipt();

-- ============================================
-- View: Receipt Details with Customer Info
-- ============================================
CREATE OR REPLACE VIEW receipt_details AS
SELECT 
  r.id,
  r.receipt_number,
  r.amount,
  r.payment_date,
  r.file_url,
  r.estate_name,
  r.plot_reference,
  r.payment_method,
  r.created_at,
  c.full_name as customer_name,
  c.phone as customer_phone,
  c.email as customer_email,
  p.reference as payment_reference,
  p.status as payment_status,
  u.full_name as generated_by_name
FROM public.receipts r
JOIN public.customers c ON r.customer_id = c.id
JOIN public.payments p ON r.payment_id = p.id
LEFT JOIN public.users u ON r.generated_by = u.id
ORDER BY r.created_at DESC;

-- ============================================
-- Update trigger for receipts
-- ============================================
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
