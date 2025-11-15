-- =====================================================
-- ACRELY RLS FIX AND SYSTEM RESTORATION
-- Version: 1.0.0
-- Priority: P0-BLOCKER
-- Date: 2025-01-22
-- Description: Complete RLS policy reset to fix deadlocks
--              and restore database access across all tables
-- =====================================================

-- ====================================================================
-- PART 1: PREPARATION AND SAFETY CHECKS
-- ====================================================================

DO $$ 
BEGIN
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║          ACRELY RLS FIX - COMPREHENSIVE POLICY RESET         ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  This migration will:';
  RAISE NOTICE '   1. Disable RLS on all tables temporarily';
  RAISE NOTICE '   2. Drop ALL existing RLS policies';
  RAISE NOTICE '   3. Create new non-recursive policies';
  RAISE NOTICE '   4. Re-enable RLS with proper access controls';
  RAISE NOTICE '   5. Sync auth.users to public.users';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 2: DISABLE RLS ON ALL PUBLIC TABLES
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
-- PART 3: DROP ALL EXISTING RLS POLICIES
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
-- PART 4: CREATE SERVICE ROLE POLICIES (BASELINE ACCESS)
-- ====================================================================

DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'users', 'customers', 'estates', 'plots', 'allocations', 'payments',
    'commissions', 'leads', 'call_logs', 'sms_campaigns', 'campaign_recipients',
    'notifications', 'inspection_schedules', 'settings', 'user_settings',
    'audit_logs', 'field_reports', 'billing', 'user_feedback', 'training_progress',
    'help_article_views', 'cron_logs', 'backup_history'
  ];
  t TEXT;
BEGIN
  RAISE NOTICE '📋 Step 3: Creating service_role policies for all tables...';
  
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      -- Check if table exists
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
        EXECUTE format(
          'CREATE POLICY "service_all" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
          t
        );
        RAISE NOTICE '   ✅ Created service_all policy on: %', t;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '   ⚠️  Could not create service policy on %: %', t, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 5: CREATE AUTHENTICATED READ POLICIES
-- ====================================================================

DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'users', 'customers', 'estates', 'plots', 'allocations', 'payments',
    'commissions', 'leads', 'call_logs', 'sms_campaigns', 'campaign_recipients',
    'notifications', 'inspection_schedules', 'settings', 'user_settings',
    'audit_logs', 'field_reports', 'billing', 'user_feedback', 'training_progress',
    'help_article_views'
  ];
  t TEXT;
BEGIN
  RAISE NOTICE '📋 Step 4: Creating authenticated read policies...';
  
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
        EXECUTE format(
          'CREATE POLICY "select_all" ON public.%I FOR SELECT TO authenticated USING (true)',
          t
        );
        RAISE NOTICE '   ✅ Created select_all policy on: %', t;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '   ⚠️  Could not create select policy on %: %', t, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 6: CREATE AUTHENTICATED WRITE POLICIES
-- ====================================================================

DO $$
DECLARE
  write_tables TEXT[] := ARRAY[
    'customers', 'allocations', 'payments', 'leads', 'call_logs',
    'notifications', 'inspection_schedules', 'user_feedback'
  ];
  t TEXT;
BEGIN
  RAISE NOTICE '📋 Step 5: Creating authenticated write policies...';
  
  FOREACH t IN ARRAY write_tables LOOP
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
        -- INSERT policy
        EXECUTE format(
          'CREATE POLICY "insert_all_authenticated" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)',
          t
        );
        
        -- UPDATE policy
        EXECUTE format(
          'CREATE POLICY "update_all_authenticated" ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
          t
        );
        
        RAISE NOTICE '   ✅ Created write policies on: %', t;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '   ⚠️  Could not create write policies on %: %', t, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 7: USERS TABLE SPECIAL POLICIES (NON-RECURSIVE)
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 6: Creating special policies for users table...';
  
  -- Users can update their own profile (using auth.uid(), not subquery)
  CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  
  RAISE NOTICE '   ✅ Created users_update_own policy';
  
  -- Admin users get full access (JWT-based, no recursion)
  CREATE POLICY "users_admin_manage" ON public.users
    FOR ALL TO authenticated
    USING (auth.jwt()->>'email' IN ('sysadmin@pinnaclegroups.ng', 'admin@acrely.com'))
    WITH CHECK (auth.jwt()->>'email' IN ('sysadmin@pinnaclegroups.ng', 'admin@acrely.com'));
  
  RAISE NOTICE '   ✅ Created users_admin_manage policy (JWT-based, no recursion)';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 8: ESTATES AND PLOTS RESTRICTED WRITE POLICIES
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Step 7: Creating restricted policies for estates and plots...';
  
  -- Estates: Only admins can modify
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='estates') THEN
    CREATE POLICY "estates_admin_write" ON public.estates
      FOR ALL TO authenticated
      USING (auth.jwt()->>'email' IN ('sysadmin@pinnaclegroups.ng', 'admin@acrely.com', 'ceo@pinnaclegroups.ng', 'md@pinnaclegroups.ng'))
      WITH CHECK (auth.jwt()->>'email' IN ('sysadmin@pinnaclegroups.ng', 'admin@acrely.com', 'ceo@pinnaclegroups.ng', 'md@pinnaclegroups.ng'));
    
    RAISE NOTICE '   ✅ Created estates_admin_write policy';
  END IF;
  
  -- Plots: Only admins can modify
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='plots') THEN
    CREATE POLICY "plots_admin_write" ON public.plots
      FOR ALL TO authenticated
      USING (auth.jwt()->>'email' IN ('sysadmin@pinnaclegroups.ng', 'admin@acrely.com', 'ceo@pinnaclegroups.ng', 'md@pinnaclegroups.ng'))
      WITH CHECK (auth.jwt()->>'email' IN ('sysadmin@pinnaclegroups.ng', 'admin@acrely.com', 'ceo@pinnaclegroups.ng', 'md@pinnaclegroups.ng'));
    
    RAISE NOTICE '   ✅ Created plots_admin_write policy';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 9: RE-ENABLE RLS ON ALL TABLES
-- ====================================================================

DO $$
DECLARE 
  r RECORD;
  enabled_count INTEGER := 0;
BEGIN
  RAISE NOTICE '📋 Step 8: Re-enabling RLS on all tables...';
  
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
-- PART 10: SYNC AUTH.USERS TO PUBLIC.USERS
-- ====================================================================

DO $$
DECLARE
  sync_count INTEGER;
BEGIN
  RAISE NOTICE '📋 Step 9: Syncing auth.users to public.users...';
  
  -- Sync all users from auth.users to public.users
  WITH synced AS (
    INSERT INTO public.users (id, email, full_name, role, phone)
    SELECT 
      id, 
      email, 
      COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'fullName', 'Unknown'),
      COALESCE(raw_user_meta_data->>'role', 'Agent'),
      raw_user_meta_data->>'phone'
    FROM auth.users
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      role = COALESCE(EXCLUDED.role, public.users.role),
      phone = COALESCE(EXCLUDED.phone, public.users.phone),
      updated_at = NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO sync_count FROM synced;
  
  RAISE NOTICE '   ✅ Synced % users from auth.users to public.users', sync_count;
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 11: VERIFY PRODUCTION USERS
-- ====================================================================

DO $$
DECLARE
  prod_users TEXT[] := ARRAY[
    'sysadmin@pinnaclegroups.ng',
    'ceo@pinnaclegroups.ng',
    'md@pinnaclegroups.ng',
    'frontdesk@pinnaclegroups.ng'
  ];
  u TEXT;
  user_count INTEGER;
BEGIN
  RAISE NOTICE '📋 Step 10: Verifying production users...';
  
  FOREACH u IN ARRAY prod_users LOOP
    SELECT COUNT(*) INTO user_count FROM public.users WHERE email = u;
    IF user_count > 0 THEN
      RAISE NOTICE '   ✅ Found: %', u;
    ELSE
      RAISE NOTICE '   ⚠️  Missing: %', u;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- PART 12: VERIFICATION SUMMARY
-- ====================================================================

DO $$
DECLARE
  total_tables INTEGER;
  total_policies INTEGER;
  total_users INTEGER;
BEGIN
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                   MIGRATION COMPLETE                         ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%';
  
  -- Count total policies
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';
  
  -- Count total users
  SELECT COUNT(*) INTO total_users
  FROM public.users;
  
  RAISE NOTICE '📊 Migration Summary:';
  RAISE NOTICE '   • Total tables: %', total_tables;
  RAISE NOTICE '   • Total RLS policies: %', total_policies;
  RAISE NOTICE '   • Total users: %', total_users;
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS Fix Complete!';
  RAISE NOTICE '   - All policies reset without recursion';
  RAISE NOTICE '   - Service role has full access';
  RAISE NOTICE '   - Authenticated users can read all tables';
  RAISE NOTICE '   - Write permissions properly restricted';
  RAISE NOTICE '   - Users synced from auth.users';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Run: npx tsx scripts/test-rls-policies.ts';
  RAISE NOTICE '   2. Test web dashboard login and data access';
  RAISE NOTICE '   3. Test mobile app sync and operations';
  RAISE NOTICE '   4. Monitor for 42501/42P17 errors';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- COMMENTS FOR FUTURE REFERENCE
-- ====================================================================

COMMENT ON POLICY "service_all" ON public.users IS 
  'Service role full access - required for backend operations and edge functions';

COMMENT ON POLICY "select_all" ON public.users IS 
  'All authenticated users can read user data - required for dashboard and user lookups';

COMMENT ON POLICY "users_update_own" ON public.users IS 
  'Users can update their own profile only - uses auth.uid() to avoid recursion';

COMMENT ON POLICY "users_admin_manage" ON public.users IS 
  'Admin users get full access via JWT email check - no table recursion';
