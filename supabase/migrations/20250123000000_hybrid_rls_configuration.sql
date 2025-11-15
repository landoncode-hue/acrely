-- =====================================================
-- ACRELY HYBRID RLS CONFIGURATION
-- Version: 2.0.0 (Hybrid Model)
-- Priority: P0-CRITICAL
-- Date: 2025-01-23
-- Description: Hybrid RLS: Strict auth tables, open business tables, service_role full access
-- =====================================================

-- ====================================================================
-- PART 1: PREPARATION AND MISSION STATEMENT
-- ====================================================================

DO $$ 
BEGIN
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║        ACRELY HYBRID RLS - TIERED ACCESS CONTROL             ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 HYBRID MODEL:';
  RAISE NOTICE '   ✓ Strict: users, profiles (self-access only)';
  RAISE NOTICE '   ✓ Open: business tables (authenticated full access)';
  RAISE NOTICE '   ✓ Superuser: service_role (unrestricted)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  This migration will:';
  RAISE NOTICE '   1. Disable RLS temporarily on all tables';
  RAISE NOTICE '   2. Drop ALL existing RLS policies';
  RAISE NOTICE '   3. Create tiered hybrid policies';
  RAISE NOTICE '   4. Re-enable RLS with proper access controls';
  RAISE NOTICE '   5. Sync auth.users to public.users';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 2: HELPER FUNCTIONS
-- ====================================================================

-- Function to drop policy if exists (idempotent)
CREATE OR REPLACE FUNCTION public._drop_policy_if_exists(p_table regclass, p_name text) 
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = split_part(p_table::text, '.', 1) 
    AND tablename = split_part(p_table::text, '.', 2) 
    AND policyname = p_name
  ) THEN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %s', p_name, p_table::text);
  END IF;
END;
$$;

-- Function to enable RLS and create open authenticated policy
CREATE OR REPLACE FUNCTION public._enable_open_rls(p_table regclass) 
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Enable RLS
  EXECUTE format('ALTER TABLE IF EXISTS %s ENABLE ROW LEVEL SECURITY', p_table::text);
  
  -- Drop any conflicting policies
  PERFORM public._drop_policy_if_exists(p_table, 'allow_authenticated_all_access');
  PERFORM public._drop_policy_if_exists(p_table, 'authenticated_full_access');
  
  -- Create broad authenticated policy
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS allow_authenticated_all_access ON %s FOR ALL TO authenticated USING (true) WITH CHECK (true)', 
    p_table::text
  );
END;
$$;

-- ====================================================================
-- PART 3: DISABLE RLS ON ALL PUBLIC TABLES
-- ====================================================================

DO $$
DECLARE 
  r RECORD;
BEGIN
  RAISE NOTICE '📋 Step 1: Disabling RLS on all tables...';
  
  FOR r IN (
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
  ) LOOP
    BEGIN
      EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
      RAISE NOTICE '   ✅ Disabled RLS on: %', r.tablename;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '   ⚠️  Could not disable RLS on %: %', r.tablename, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 4: DROP ALL EXISTING RLS POLICIES
-- ====================================================================

DO $$
DECLARE 
  r RECORD;
  policy_count INTEGER := 0;
BEGIN
  RAISE NOTICE '📋 Step 2: Dropping all existing RLS policies...';
  
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
        r.policyname, r.schemaname, r.tablename);
      policy_count := policy_count + 1;
      RAISE NOTICE '   ✅ Dropped policy: % on %', r.policyname, r.tablename;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '   ⚠️  Could not drop policy % on %: %', r.policyname, r.tablename, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '   📊 Total policies dropped: %', policy_count;
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 5: CREATE SERVICE ROLE POLICIES (ALL TABLES)
-- ====================================================================

DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'users', 'profiles', 'customers', 'estates', 'plots', 'allocations', 'payments',
    'commissions', 'leads', 'call_logs', 'sms_campaigns', 'campaign_recipients',
    'notifications', 'inspection_schedules', 'settings', 'user_settings',
    'audit_logs', 'field_reports', 'billing', 'billing_summary', 'receipts',
    'user_feedback', 'training_progress', 'help_article_views', 'cron_logs', 
    'backup_history', 'sms_queue', 'receipt_queue', 'training_modules', 
    'training_completions', 'agent_performance', 'revenue_predictions'
  ];
  t TEXT;
BEGIN
  RAISE NOTICE '📋 Step 3: Creating service_role policies for all tables...';
  
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
        EXECUTE format(
          'CREATE POLICY IF NOT EXISTS service_role_full_access ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
          t
        );
        RAISE NOTICE '   ✅ Created service_role_full_access on: %', t;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '   ⚠️  Could not create service policy on %: %', t, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 6: STRICT TIER - USERS TABLE POLICIES
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 4: Creating STRICT policies for users table...';
  
  -- Users can only select their own record
  PERFORM public._drop_policy_if_exists('public.users', 'authenticated_select_own');
  CREATE POLICY authenticated_select_own ON public.users 
    FOR SELECT TO authenticated 
    USING (auth.uid() = id);
  RAISE NOTICE '   ✅ Created authenticated_select_own on users';
  
  -- Users can update only their own record
  PERFORM public._drop_policy_if_exists('public.users', 'users_update_own');
  CREATE POLICY users_update_own ON public.users 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);
  RAISE NOTICE '   ✅ Created users_update_own on users';
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 7: STRICT TIER - PROFILES TABLE POLICIES
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 5: Creating STRICT policies for profiles table...';
  
  -- Check if profiles table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='profiles') THEN
    -- Profiles: users can access only their own profile
    PERFORM public._drop_policy_if_exists('public.profiles', 'authenticated_select_own');
    CREATE POLICY authenticated_select_own ON public.profiles 
      FOR ALL TO authenticated 
      USING (auth.uid() = id) 
      WITH CHECK (auth.uid() = id);
    RAISE NOTICE '   ✅ Created authenticated_select_own on profiles';
  ELSE
    RAISE NOTICE '   ⚠️  profiles table does not exist, skipping';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 8: OPEN TIER - CORE BUSINESS TABLES
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 6: Creating OPEN policies for business tables...';
  
  -- Core business tables: full access for authenticated users
  PERFORM public._enable_open_rls('public.customers');
  PERFORM public._enable_open_rls('public.plots');
  PERFORM public._enable_open_rls('public.allocations');
  PERFORM public._enable_open_rls('public.payments');
  PERFORM public._enable_open_rls('public.commissions');
  
  RAISE NOTICE '   ✅ Applied OPEN policies to core business tables';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 9: OPEN TIER - OPERATIONAL TABLES
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 7: Creating OPEN policies for operational tables...';
  
  -- Operational tables: full access for authenticated users
  PERFORM public._enable_open_rls('public.leads');
  PERFORM public._enable_open_rls('public.call_logs');
  PERFORM public._enable_open_rls('public.sms_campaigns');
  PERFORM public._enable_open_rls('public.inspection_schedules');
  PERFORM public._enable_open_rls('public.notifications');
  PERFORM public._enable_open_rls('public.campaign_recipients');
  
  RAISE NOTICE '   ✅ Applied OPEN policies to operational tables';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 10: OPEN TIER - FINANCIAL & CONFIG TABLES
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 8: Creating OPEN policies for financial & config tables...';
  
  -- Financial tables
  PERFORM public._enable_open_rls('public.receipts');
  PERFORM public._enable_open_rls('public.billing');
  PERFORM public._enable_open_rls('public.billing_summary');
  
  -- Config tables
  PERFORM public._enable_open_rls('public.settings');
  PERFORM public._enable_open_rls('public.user_settings');
  
  -- Additional operational tables
  PERFORM public._enable_open_rls('public.audit_logs');
  PERFORM public._enable_open_rls('public.field_reports');
  PERFORM public._enable_open_rls('public.user_feedback');
  
  RAISE NOTICE '   ✅ Applied OPEN policies to financial & config tables';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 11: OPEN TIER - ESTATES TABLE (if exists)
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 9: Creating OPEN policies for estates table...';
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='estates') THEN
    PERFORM public._enable_open_rls('public.estates');
    RAISE NOTICE '   ✅ Applied OPEN policies to estates table';
  ELSE
    RAISE NOTICE '   ⚠️  estates table does not exist, skipping';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 12: RE-ENABLE RLS ON ALL TABLES
-- ====================================================================

DO $$
DECLARE 
  r RECORD;
  enabled_count INTEGER := 0;
BEGIN
  RAISE NOTICE '📋 Step 10: Re-enabling RLS on all tables...';
  
  FOR r IN (
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
  ) LOOP
    BEGIN
      EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
      enabled_count := enabled_count + 1;
      RAISE NOTICE '   ✅ Enabled RLS on: %', r.tablename;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '   ⚠️  Could not enable RLS on %: %', r.tablename, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '   📊 Total tables with RLS enabled: %', enabled_count;
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 13: SYNC AUTH.USERS TO PUBLIC.USERS
-- ====================================================================

DO $$
DECLARE
  user_count INTEGER := 0;
BEGIN
  RAISE NOTICE '📋 Step 11: Syncing auth.users to public.users...';
  
  -- Ensure pgcrypto extension for gen_random_uuid
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  
  -- Sync users from auth.users to public.users
  INSERT INTO public.users (id, email, full_name, phone, role, created_at, updated_at)
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    COALESCE(au.raw_user_meta_data->>'phone', ''),
    COALESCE(au.raw_user_meta_data->>'role', 'Agent'),
    au.created_at,
    now()
  FROM auth.users au
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = now();
  
  GET DIAGNOSTICS user_count = ROW_COUNT;
  RAISE NOTICE '   ✅ Synced % users from auth.users', user_count;
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 14: CLEANUP HELPER FUNCTIONS
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 12: Cleaning up helper functions...';
  
  DROP FUNCTION IF EXISTS public._drop_policy_if_exists(regclass, text);
  DROP FUNCTION IF EXISTS public._enable_open_rls(regclass);
  
  RAISE NOTICE '   ✅ Helper functions removed';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 15: FINAL VERIFICATION AND SUMMARY
-- ====================================================================

DO $$
DECLARE
  policy_count INTEGER;
  rls_enabled_count INTEGER;
BEGIN
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                   MIGRATION COMPLETE                         ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  -- Count policies
  SELECT count(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  RAISE NOTICE '📊 Statistics:';
  RAISE NOTICE '   ✓ Total RLS policies: %', policy_count;
  
  -- Count RLS-enabled tables
  SELECT count(*) INTO rls_enabled_count 
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%'
  AND EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = tablename 
    AND relrowsecurity = true
  );
  RAISE NOTICE '   ✓ Tables with RLS enabled: %', rls_enabled_count;
  RAISE NOTICE '';
  
  RAISE NOTICE '✅ HYBRID RLS MODEL APPLIED SUCCESSFULLY';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security Tiers:';
  RAISE NOTICE '   • STRICT: users, profiles (self-access only)';
  RAISE NOTICE '   • OPEN: business tables (authenticated full access)';
  RAISE NOTICE '   • SUPERUSER: service_role (unrestricted)';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Next Steps:';
  RAISE NOTICE '   1. Run verification script: npx tsx scripts/test-rls-policies.ts';
  RAISE NOTICE '   2. Test web login and dashboard access';
  RAISE NOTICE '   3. Verify mobile app sync operations';
  RAISE NOTICE '   4. Check edge function operations';
  RAISE NOTICE '';
END $$;
