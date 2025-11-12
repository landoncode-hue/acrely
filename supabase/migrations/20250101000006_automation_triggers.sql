-- Database triggers to automate Edge Function invocations
-- This enables event-driven architecture for SMS, receipts, and commissions

-- Function to trigger SMS on allocation insert
CREATE OR REPLACE FUNCTION trigger_allocation_sms()
RETURNS TRIGGER AS $$
DECLARE
  customer_record RECORD;
  plot_record RECORD;
  sms_message TEXT;
BEGIN
  -- Fetch customer and plot details
  SELECT * INTO customer_record FROM public.customers WHERE id = NEW.customer_id;
  SELECT * INTO plot_record FROM public.plots WHERE id = NEW.plot_id;
  
  -- Construct SMS message
  sms_message := 'Dear ' || customer_record.full_name || ', your allocation for plot ' || 
                 plot_record.estate_code || '-' || plot_record.plot_number || ' at ' || 
                 plot_record.estate_name || ' has been confirmed. Total: ₦' || 
                 NEW.total_amount || '. Thank you for choosing Pinnacle Builders.';
  
  -- Call send-sms function via pg_net or queue
  -- Note: In production, use Supabase webhook or pg_net extension
  -- For now, we'll insert into a queue table
  INSERT INTO public.sms_queue (phone, message, type, reference_id, reference_type)
  VALUES (customer_record.phone, sms_message, 'allocation_confirmation', NEW.id, 'allocation');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger receipt generation on payment insert
CREATE OR REPLACE FUNCTION trigger_payment_receipt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    -- Insert into receipt generation queue
    INSERT INTO public.receipt_queue (payment_id, status)
    VALUES (NEW.id, 'pending');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger commission calculation on payment confirmation
CREATE OR REPLACE FUNCTION trigger_commission_calc()
RETURNS TRIGGER AS $$
DECLARE
  allocation_record RECORD;
  existing_commission RECORD;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Fetch allocation details
    SELECT * INTO allocation_record FROM public.allocations WHERE id = NEW.allocation_id;
    
    -- Only process if agent is assigned
    IF allocation_record.agent_id IS NOT NULL THEN
      -- Check if commission already exists
      SELECT * INTO existing_commission 
      FROM public.commissions 
      WHERE allocation_id = allocation_record.id;
      
      IF existing_commission IS NULL THEN
        -- Get commission rate from settings
        SELECT value::NUMERIC INTO commission_rate 
        FROM public.settings 
        WHERE key = 'default_commission_rate';
        
        IF commission_rate IS NULL THEN
          commission_rate := 5; -- Default 5%
        END IF;
        
        commission_amount := (allocation_record.total_amount * commission_rate) / 100;
        
        -- Create commission record
        INSERT INTO public.commissions (
          agent_id, 
          allocation_id, 
          commission_rate, 
          commission_amount, 
          status
        )
        VALUES (
          allocation_record.agent_id,
          allocation_record.id,
          commission_rate,
          commission_amount,
          'pending'
        );
        
        -- Create notification for agent
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
          allocation_record.agent_id,
          'New Commission Earned',
          'You have earned ₦' || commission_amount || ' commission from allocation ' || 
          substring(allocation_record.id::TEXT from 1 for 8),
          'success',
          '/commissions'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create queue tables for async processing
CREATE TABLE IF NOT EXISTS public.sms_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  reference_id UUID,
  reference_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.receipt_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'failed')),
  receipt_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  generated_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON public.sms_queue(status);
CREATE INDEX IF NOT EXISTS idx_receipt_queue_status ON public.receipt_queue(status);

-- Create triggers
DROP TRIGGER IF EXISTS allocation_sms_trigger ON public.allocations;
CREATE TRIGGER allocation_sms_trigger
AFTER INSERT ON public.allocations
FOR EACH ROW EXECUTE FUNCTION trigger_allocation_sms();

DROP TRIGGER IF EXISTS payment_receipt_trigger ON public.payments;
CREATE TRIGGER payment_receipt_trigger
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION trigger_payment_receipt();

DROP TRIGGER IF EXISTS commission_calc_trigger ON public.payments;
CREATE TRIGGER commission_calc_trigger
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION trigger_commission_calc();

-- RLS policies for queue tables
ALTER TABLE public.sms_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin level can view sms queue" ON public.sms_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('CEO', 'MD', 'SysAdmin')
    )
  );

CREATE POLICY "Admin level can view receipt queue" ON public.receipt_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('CEO', 'MD', 'SysAdmin')
    )
  );
