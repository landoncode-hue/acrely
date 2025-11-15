-- Sync production users from auth.users to public.users
-- and ensure RLS policies allow proper access

-- First, add service_role policy if not exists
DROP POLICY IF EXISTS "Service role full access" ON public.users;
CREATE POLICY "Service role full access" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add authenticated users read policy
DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.users;
CREATE POLICY "Authenticated users can read all users" ON public.users
  FOR SELECT TO authenticated USING (true);

-- Sync production users from auth to public.users
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
