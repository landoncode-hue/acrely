-- ====================================================================
-- CRITICAL: RUN THIS IMMEDIATELY IN SUPABASE SQL EDITOR
-- This fixes the "Failed to fetch user profile" error
-- ====================================================================

-- STEP 1: Fix RLS Policies (remove infinite recursion)
-- ====================================================================

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.users;
DROP POLICY IF EXISTS "SysAdmin full access" ON public.users;

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- All authenticated users can view all users (needed for lookups)
CREATE POLICY "Authenticated users can read all users" ON public.users
  FOR SELECT TO authenticated USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- SysAdmin can do everything (non-recursive check using auth.jwt())
CREATE POLICY "SysAdmin full access" ON public.users
  FOR ALL TO authenticated 
  USING (auth.jwt()->>'email' IN ('sysadmin@pinnaclegroups.ng', 'admin@acrely.com'))
  WITH CHECK (auth.jwt()->>'email' IN ('sysadmin@pinnaclegroups.ng', 'admin@acrely.com'));

-- STEP 2: Sync Production Users
-- ====================================================================

-- Insert production users into public.users table
INSERT INTO public.users (id, email, full_name, role)
VALUES
  ('16920ec4-7965-4c84-ab5d-0d256ae880e0', 'sysadmin@pinnaclegroups.ng', 'System Administrator', 'SysAdmin'),
  ('94fc248e-8b13-45da-950a-59bfc15c2a09', 'ceo@pinnaclegroups.ng', 'Chief Executive Officer', 'CEO'),
  ('084dbb41-6099-4e6b-9833-95022ba8f951', 'md@pinnaclegroups.ng', 'Managing Director', 'MD'),
  ('3bd726bb-4290-454b-bd46-44b6ed2a0cbc', 'frontdesk@pinnaclegroups.ng', 'Front Desk Staff', 'Frontdesk')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- ====================================================================
-- VERIFICATION: Check that everything worked
-- ====================================================================

SELECT 'RLS Policies Created' AS status, COUNT(*) AS policy_count
FROM pg_policies 
WHERE tablename = 'users';

SELECT 'Production Users Synced' AS status, COUNT(*) AS user_count
FROM public.users 
WHERE email IN (
  'sysadmin@pinnaclegroups.ng',
  'ceo@pinnaclegroups.ng',
  'md@pinnaclegroups.ng',
  'frontdesk@pinnaclegroups.ng'
);

-- ====================================================================
-- SUCCESS! You should see:
-- - 4 RLS policies created
-- - 4 production users synced
-- Now refresh your browser and try logging in again
-- ====================================================================
