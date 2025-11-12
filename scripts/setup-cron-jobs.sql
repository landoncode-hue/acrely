-- =============================================================================
-- Acrely v2 - Production Cron Jobs Setup
-- =============================================================================
-- Run this script in Supabase SQL Editor to set up automated tasks
-- Make sure to replace YOUR_PROJECT and SERVICE_ROLE_KEY with actual values
-- =============================================================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- =============================================================================
-- 1. System Health Check (Every Hour)
-- =============================================================================
-- Monitors system health and sends alerts if issues detected
SELECT cron.schedule(
  'acrely-system-health-check-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/system-health-check',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 2. Database Backup (Daily at 2 AM)
-- =============================================================================
-- Creates daily database backup
SELECT cron.schedule(
  'acrely-backup-database-daily',
  '0 2 * * *', -- Every day at 2:00 AM
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/backup-database',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 3. Storage Cleanup (Weekly on Sunday at 3 AM)
-- =============================================================================
-- Removes old files and frees up storage space
SELECT cron.schedule(
  'acrely-storage-cleanup-weekly',
  '0 3 * * 0', -- Every Sunday at 3:00 AM
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/storage-cleanup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 4. Overdue Payment Check (Daily at 8 AM)
-- =============================================================================
-- Checks for overdue payments and sends reminders
SELECT cron.schedule(
  'acrely-check-overdue-payments-daily',
  '0 8 * * *', -- Every day at 8:00 AM
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/check-overdue-payments',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 5. Monthly Billing Summary (1st of month at 6 AM)
-- =============================================================================
-- Generates monthly billing summary
SELECT cron.schedule(
  'acrely-billing-summary-monthly',
  '0 6 1 * *', -- 1st of every month at 6:00 AM
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-billing-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SERVICE_ROLE_KEY'
    ),
    body := jsonb_build_object(
      'period', 'monthly'
    )
  ) as request_id;
  $$
);

-- =============================================================================
-- 6. Process SMS Queue (Every 5 minutes)
-- =============================================================================
-- Processes pending SMS in queue
SELECT cron.schedule(
  'acrely-process-sms-queue',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/process-sms-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 7. Process Receipt Queue (Every 10 minutes)
-- =============================================================================
-- Processes pending receipts in queue
SELECT cron.schedule(
  'acrely-process-receipt-queue',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/process-receipt-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- Verify Cron Jobs
-- =============================================================================
-- List all scheduled jobs
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  active
FROM cron.job
WHERE jobname LIKE 'acrely-%'
ORDER BY jobid;

-- =============================================================================
-- View Cron Job Run History
-- =============================================================================
-- Check recent cron job executions
SELECT 
  j.jobname,
  r.runid,
  r.job_pid,
  r.status,
  r.return_message,
  r.start_time,
  r.end_time
FROM cron.job_run_details r
JOIN cron.job j ON r.jobid = j.jobid
WHERE j.jobname LIKE 'acrely-%'
ORDER BY r.start_time DESC
LIMIT 50;

-- =============================================================================
-- Unschedule Jobs (if needed)
-- =============================================================================
-- Uncomment and run these if you need to remove jobs

-- SELECT cron.unschedule('acrely-system-health-check-hourly');
-- SELECT cron.unschedule('acrely-backup-database-daily');
-- SELECT cron.unschedule('acrely-storage-cleanup-weekly');
-- SELECT cron.unschedule('acrely-check-overdue-payments-daily');
-- SELECT cron.unschedule('acrely-billing-summary-monthly');
-- SELECT cron.unschedule('acrely-process-sms-queue');
-- SELECT cron.unschedule('acrely-process-receipt-queue');

-- =============================================================================
-- Update Existing Job Schedule (Example)
-- =============================================================================
-- If you need to change the schedule of an existing job:
-- 
-- SELECT cron.unschedule('acrely-system-health-check-hourly');
-- SELECT cron.schedule(
--   'acrely-system-health-check-hourly',
--   '*/30 * * * *', -- New schedule: every 30 minutes
--   $$ ... command ... $$
-- );

-- =============================================================================
-- Notes:
-- =============================================================================
-- Cron Schedule Format: minute hour day month day_of_week
-- Examples:
--   '0 * * * *'      - Every hour
--   '*/5 * * * *'    - Every 5 minutes
--   '0 2 * * *'      - Daily at 2:00 AM
--   '0 8 * * 1'      - Every Monday at 8:00 AM
--   '0 0 1 * *'      - First day of month at midnight
--   '0 3 * * 0'      - Every Sunday at 3:00 AM
--
-- Make sure to:
-- 1. Replace YOUR_PROJECT with your actual Supabase project reference
-- 2. Replace SERVICE_ROLE_KEY with your actual service role key
-- 3. Test each cron job manually before scheduling
-- 4. Monitor cron.job_run_details for execution results
-- =============================================================================
