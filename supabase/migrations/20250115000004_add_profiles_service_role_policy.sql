-- Add missing service_role policy for users table
-- This allows backend operations and authenticated users to access user data

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.users;

-- Service role full access
CREATE POLICY "Service role full access" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read all users (needed for user lookups in the app)
CREATE POLICY "Authenticated users can read all users" ON public.users
  FOR SELECT TO authenticated USING (true);

-- Note: Users can still only UPDATE their own profile via existing policy
