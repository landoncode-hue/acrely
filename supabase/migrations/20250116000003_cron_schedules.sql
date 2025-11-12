-- Migration: Add cron job schedules using pg_cron
-- Author: Kennedy — Landon Digital
-- Version: 1.8.0
-- Quest: acrely-v2-system-maintenance

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule system health check (hourly)
SELECT cron.schedule(
  'system-health-check-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url:=current_setting('app.supabase_url') || '/functions/v1/system-health-check',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.supabase_service_key'))
    ) AS request_id;
  $$
);

-- Schedule database backup (daily at 02:00 UTC)
SELECT cron.schedule(
  'backup-database-daily',
  '0 2 * * *', -- Every day at 02:00 UTC
  $$
  SELECT
    net.http_post(
      url:=current_setting('app.supabase_url') || '/functions/v1/backup-database',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.supabase_service_key'))
    ) AS request_id;
  $$
);

-- Schedule storage cleanup (weekly on Sunday at 03:00 UTC)
SELECT cron.schedule(
  'storage-cleanup-weekly',
  '0 3 * * 0', -- Every Sunday at 03:00 UTC
  $$
  SELECT
    net.http_post(
      url:=current_setting('app.supabase_url') || '/functions/v1/storage-cleanup',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.supabase_service_key'))
    ) AS request_id;
  $$
);

-- Schedule database maintenance (weekly on Sunday at 04:00 UTC)
SELECT cron.schedule(
  'database-maintenance-weekly',
  '0 4 * * 0', -- Every Sunday at 04:00 UTC
  $$
  SELECT run_database_maintenance();
  $$
);

-- Create trigger function to send alerts on cron failures
CREATE OR REPLACE FUNCTION notify_on_cron_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger for failed cron jobs
  IF NEW.status = 'failed' THEN
    -- Call alert-notification function
    PERFORM
      net.http_post(
        url:=current_setting('app.supabase_url') || '/functions/v1/alert-notification',
        headers:=jsonb_build_object(
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_key'),
          'Content-Type', 'application/json'
        ),
        body:=jsonb_build_object(
          'job_name', NEW.job_name,
          'status', NEW.status,
          'error_message', NEW.error_message,
          'timestamp', NEW.executed_at
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to cron_logs table
DROP TRIGGER IF EXISTS trigger_cron_failure_alert ON cron_logs;
CREATE TRIGGER trigger_cron_failure_alert
  AFTER INSERT ON cron_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_cron_failure();

COMMENT ON FUNCTION notify_on_cron_failure IS 'Automatically sends alerts when a cron job fails';
