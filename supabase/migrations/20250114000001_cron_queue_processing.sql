-- Migration: Supabase Cron Jobs for Queue Processing
-- Author: Kennedy - Landon Digital
-- Version: 1.5.0
-- Description: Set up pg_cron jobs to process receipt and SMS queues automatically

-- ============================================
-- Enable pg_cron Extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- Grant cron access to postgres role
-- ============================================
GRANT USAGE ON SCHEMA cron TO postgres;

-- ============================================
-- Schedule Receipt Queue Processing (every 2 minutes)
-- ============================================
SELECT cron.schedule(
  'process-receipt-queue',
  '*/2 * * * *', -- Every 2 minutes
  $$
    SELECT
      net.http_post(
        url := (SELECT current_setting('app.supabase_url') || '/functions/v1/process-receipt-queue'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (SELECT current_setting('app.supabase_service_role_key'))
        ),
        body := '{}'::jsonb
      ) AS request_id;
  $$
);

-- ============================================
-- Schedule SMS Queue Processing (every 1 minute)
-- ============================================
SELECT cron.schedule(
  'process-sms-queue',
  '* * * * *', -- Every minute
  $$
    SELECT
      net.http_post(
        url := (SELECT current_setting('app.supabase_url') || '/functions/v1/process-sms-queue'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (SELECT current_setting('app.supabase_service_role_key'))
        ),
        body := '{}'::jsonb
      ) AS request_id;
  $$
);

-- ============================================
-- Alternative: Manual Processing Functions
-- ============================================
-- These can be called manually if cron is not available

CREATE OR REPLACE FUNCTION process_receipt_queue_manual()
RETURNS TABLE(status TEXT, message TEXT) AS $$
BEGIN
  -- This would need to be implemented using pg_net extension
  -- For now, return instructions
  RETURN QUERY SELECT 
    'info'::TEXT, 
    'Call the process-receipt-queue Edge Function via HTTP'::TEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_sms_queue_manual()
RETURNS TABLE(status TEXT, message TEXT) AS $$
BEGIN
  -- This would need to be implemented using pg_net extension
  -- For now, return instructions
  RETURN QUERY SELECT 
    'info'::TEXT, 
    'Call the process-sms-queue Edge Function via HTTP'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Queue Monitoring View
-- ============================================
CREATE OR REPLACE VIEW queue_status AS
SELECT 
  'receipts' AS queue_name,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'generated') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
  MAX(created_at) AS last_created
FROM public.receipt_queue
UNION ALL
SELECT 
  'sms' AS queue_name,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'sent') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
  MAX(created_at) AS last_created
FROM public.sms_queue;

-- ============================================
-- Cleanup Old Queue Items (retention policy)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_queue_items()
RETURNS void AS $$
BEGIN
  -- Delete SMS queue items older than 30 days
  DELETE FROM public.sms_queue
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('sent', 'failed');
  
  -- Delete receipt queue items older than 90 days
  DELETE FROM public.receipt_queue
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('generated', 'failed');
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup weekly (Sunday at 2 AM)
SELECT cron.schedule(
  'cleanup-queue-items',
  '0 2 * * 0',
  $$SELECT cleanup_old_queue_items();$$
);
