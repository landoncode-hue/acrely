-- Migration: Enhanced Payment Receipt Trigger with SMS Notification
-- Author: Kennedy - Landon Digital
-- Version: 1.5.0
-- Description: Updates trigger to send SMS with receipt link after receipt generation

-- ============================================
-- Enhanced Function: Trigger SMS on Payment with Receipt
-- ============================================
CREATE OR REPLACE FUNCTION trigger_payment_sms_with_receipt()
RETURNS TRIGGER AS $$
DECLARE
  customer_record RECORD;
  allocation_record RECORD;
  plot_record RECORD;
  receipt_record RECORD;
  sms_message TEXT;
BEGIN
  -- Only send SMS when payment is confirmed and receipt exists
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    
    -- Fetch related records
    SELECT * INTO allocation_record FROM public.allocations WHERE id = NEW.allocation_id;
    SELECT * INTO customer_record FROM public.customers WHERE id = allocation_record.customer_id;
    SELECT * INTO plot_record FROM public.plots WHERE id = allocation_record.plot_id;
    
    -- Wait for receipt to be created (it should be created by auto_create_receipt trigger)
    -- Use a slight delay or check if receipt exists
    SELECT * INTO receipt_record FROM public.receipts WHERE payment_id = NEW.id;
    
    IF receipt_record IS NOT NULL THEN
      -- Construct SMS message with receipt information
      sms_message := 'Dear ' || customer_record.full_name || 
                     ', your payment of ₦' || NEW.amount::TEXT || 
                     ' was received. Receipt #' || receipt_record.receipt_number || '.';
      
      -- Insert into SMS queue with receipt URL
      INSERT INTO public.sms_queue (
        phone, 
        message, 
        type, 
        reference_id, 
        reference_type,
        metadata
      )
      VALUES (
        customer_record.phone, 
        sms_message, 
        'payment_receipt', 
        NEW.id, 
        'payment',
        jsonb_build_object('receipt_url', receipt_record.file_url)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Update SMS Queue Table to Support Metadata
-- ============================================
ALTER TABLE public.sms_queue ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ============================================
-- Create Trigger for Payment SMS
-- ============================================
DROP TRIGGER IF EXISTS trigger_payment_sms ON public.payments;
CREATE TRIGGER trigger_payment_sms
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION trigger_payment_sms_with_receipt();
