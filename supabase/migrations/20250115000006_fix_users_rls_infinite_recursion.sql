-- Fix infinite recursion in users table RLS policies
-- The "Admins can manage users" policy was querying users table from within users table policy

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.users;
DROP POLICY IF EXISTS "SysAdmin full access" ON public.users;

-- Simple, non-recursive policies
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
