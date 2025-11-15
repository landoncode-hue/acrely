-- =====================================================
-- ROLLBACK SCRIPT FOR HYBRID RLS CONFIGURATION
-- Version: 1.0.0
-- Date: 2025-01-23
-- Description: Emergency rollback - disables RLS on all tables
-- WARNING: USE ONLY IN EMERGENCY - REMOVES ALL ROW-LEVEL SECURITY
-- =====================================================

-- ⚠️  WARNING: This script DISABLES all row-level security
-- Only run if you need to emergency-restore database access
-- This is a TEMPORARY measure while you fix underlying issues

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           EMERGENCY ROLLBACK - DISABLE ALL RLS               ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  WARNING: This will disable ALL row-level security!';
  RAISE NOTICE '   This is a TEMPORARY emergency measure only.';
  RAISE NOTICE '   Re-enable RLS policies as soon as possible.';
  RAISE NOTICE '';
END $$;

-- Disable RLS on all affected tables (emergency fallback)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.allocations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.call_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sms_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_recipients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inspection_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.field_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.billing DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.billing_summary DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.help_article_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sms_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipt_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_performance DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.revenue_predictions DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS DISABLED on all tables';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Next Steps:';
  RAISE NOTICE '   1. Diagnose the issue that required this rollback';
  RAISE NOTICE '   2. Fix the problematic policies';
  RAISE NOTICE '   3. Re-apply the hybrid RLS migration';
  RAISE NOTICE '   4. DO NOT leave RLS disabled in production';
  RAISE NOTICE '';
END $$;

COMMIT;
