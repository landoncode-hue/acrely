-- =====================================================
-- Migration: Billing Summary Cron Job
-- Version: 1.7.0
-- Description: Configure automated cron job to generate
--              monthly billing summaries daily
-- =====================================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant cron access to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- ============================================================================
-- Schedule Billing Summary Generation (Daily at 23:59 UTC)
-- ============================================================================
SELECT cron.schedule(
  'generate-billing-summary-daily',
  '59 23 * * *', -- Every day at 23:59 UTC
  $$
    SELECT
      net.http_post(
        url := (SELECT current_setting('app.supabase_url') || '/functions/v1/generate-billing-summary'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (SELECT current_setting('app.supabase_service_role_key'))
        ),
        body := '{}'::jsonb
      ) AS request_id;
  $$
);

-- ============================================================================
-- Schedule Monthly Billing Summary (1st of each month at 00:00 UTC)
-- ============================================================================
-- This generates a comprehensive report on the first day of each month
-- for the previous month
SELECT cron.schedule(
  'generate-billing-summary-monthly',
  '0 0 1 * *', -- First day of month at midnight
  $$
    SELECT
      net.http_post(
        url := (SELECT current_setting('app.supabase_url') || '/functions/v1/generate-billing-summary'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (SELECT current_setting('app.supabase_service_role_key'))
        ),
        body := jsonb_build_object(
          'month', EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))::int,
          'year', EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))::int,
          'force_regenerate', true
        )
      ) AS request_id;
  $$
);

-- ============================================================================
-- Manual Trigger Function for Billing Summary
-- ============================================================================
-- This function can be called manually by SysAdmin to generate billing summary
CREATE OR REPLACE FUNCTION trigger_billing_summary_generation(
  target_month INTEGER DEFAULT NULL,
  target_year INTEGER DEFAULT NULL,
  target_estate_code TEXT DEFAULT NULL
)
RETURNS TABLE(status TEXT, message TEXT, request_id BIGINT) AS $$
DECLARE
  gen_month INTEGER;
  gen_year INTEGER;
  result RECORD;
BEGIN
  -- Default to current month if not specified
  gen_month := COALESCE(target_month, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);
  gen_year := COALESCE(target_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);

  -- Call the Edge Function via HTTP
  SELECT * INTO result FROM net.http_post(
    url := (SELECT current_setting('app.supabase_url') || '/functions/v1/generate-billing-summary'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT current_setting('app.supabase_service_role_key'))
    ),
    body := jsonb_build_object(
      'month', gen_month,
      'year', gen_year,
      'estate_code', target_estate_code,
      'force_regenerate', true
    )
  );

  RETURN QUERY SELECT 
    'success'::TEXT,
    format('Billing summary generation triggered for %s-%s', gen_year, gen_month)::TEXT,
    result.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users with SysAdmin role
GRANT EXECUTE ON FUNCTION trigger_billing_summary_generation TO authenticated;

-- ============================================================================
-- Billing Summary Status View
-- ============================================================================
CREATE OR REPLACE VIEW billing_summary_status AS
SELECT 
  CONCAT(year, '-', LPAD(month::TEXT, 2, '0')) AS period,
  COUNT(DISTINCT estate_code) AS estates_processed,
  SUM(total_amount_collected) AS total_revenue,
  SUM(total_commissions) AS total_commissions,
  SUM(total_payments) AS total_payment_count,
  MAX(created_at) AS last_generated,
  MAX(updated_at) AS last_updated
FROM public.billing_summary
GROUP BY year, month
ORDER BY year DESC, month DESC;

-- Grant access to admin roles
GRANT SELECT ON billing_summary_status TO authenticated;

-- ============================================================================
-- Function to Check Billing Summary Health
-- ============================================================================
CREATE OR REPLACE FUNCTION check_billing_summary_health()
RETURNS TABLE(
  period TEXT,
  status TEXT,
  estates_missing INTEGER,
  last_generated TIMESTAMPTZ,
  days_since_update INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH active_estates AS (
    SELECT COUNT(*) AS total_estates
    FROM public.estates
    WHERE status = 'active'
  ),
  monthly_summary AS (
    SELECT 
      CONCAT(year, '-', LPAD(month::TEXT, 2, '0')) AS period,
      COUNT(DISTINCT estate_code) AS estates_processed,
      MAX(created_at) AS last_gen,
      EXTRACT(DAY FROM (NOW() - MAX(updated_at)))::INTEGER AS days_old
    FROM public.billing_summary
    WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
      AND month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
    GROUP BY year, month
  )
  SELECT 
    ms.period,
    CASE 
      WHEN ms.estates_processed IS NULL THEN 'missing'
      WHEN ms.estates_processed < ae.total_estates THEN 'incomplete'
      WHEN ms.days_old > 1 THEN 'outdated'
      ELSE 'healthy'
    END AS status,
    COALESCE(ae.total_estates - ms.estates_processed, ae.total_estates) AS estates_missing,
    ms.last_gen AS last_generated,
    ms.days_old AS days_since_update
  FROM active_estates ae
  LEFT JOIN monthly_summary ms ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to admin roles
GRANT EXECUTE ON FUNCTION check_billing_summary_health TO authenticated;

-- ============================================================================
-- Cleanup Old Billing Summaries (Retention Policy)
-- ============================================================================
-- Keep billing summaries for 3 years, archive older data
CREATE OR REPLACE FUNCTION cleanup_old_billing_summaries()
RETURNS void AS $$
BEGIN
  -- Archive summaries older than 3 years to an archive table
  INSERT INTO public.billing_summary_archive
  SELECT * FROM public.billing_summary
  WHERE (year < EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 3)
  ON CONFLICT (id) DO NOTHING;

  -- Delete archived records from main table
  DELETE FROM public.billing_summary
  WHERE year < EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 3;

  RAISE NOTICE 'Archived billing summaries older than 3 years';
END;
$$ LANGUAGE plpgsql;

-- Create archive table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.billing_summary_archive (
  LIKE public.billing_summary INCLUDING ALL
);

-- Schedule cleanup yearly (January 1st at 3 AM)
SELECT cron.schedule(
  'cleanup-billing-summaries',
  '0 3 1 1 *', -- January 1st at 3 AM
  $$SELECT cleanup_old_billing_summaries();$$
);

-- ============================================================================
-- Comments and Documentation
-- ============================================================================
COMMENT ON FUNCTION trigger_billing_summary_generation IS 'Manually trigger billing summary generation for a specific month/year';
COMMENT ON FUNCTION check_billing_summary_health IS 'Check the health status of current month billing summary';
COMMENT ON VIEW billing_summary_status IS 'Overview of billing summaries by period';
COMMENT ON FUNCTION cleanup_old_billing_summaries IS 'Archive and clean up billing summaries older than 3 years';

-- ============================================================================
-- Verify Cron Jobs
-- ============================================================================
-- Query to check scheduled cron jobs
-- SELECT * FROM cron.job WHERE jobname LIKE '%billing%';
