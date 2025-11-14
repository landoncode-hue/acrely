-- Complete setup for profiles table and user data
-- Run this in Supabase SQL Editor

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'Agent' CHECK (role IN ('SysAdmin', 'CEO', 'MD', 'Accountant', 'Frontdesk', 'Agent')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

-- 5. Create RLS policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" 
  ON public.profiles 
  USING (auth.jwt()->>'role' = 'service_role');

-- 6. Insert or update profiles for existing auth users
INSERT INTO public.profiles (id, user_id, email, full_name, phone, role)
SELECT 
  u.id,
  u.id,
  u.email,
  CASE u.email
    WHEN 'sysadmin@pinnaclegroups.ng' THEN 'System Administrator'
    WHEN 'ceo@pinnaclegroups.ng' THEN 'Chief Executive Officer'
    WHEN 'md@pinnaclegroups.ng' THEN 'Managing Director'
    WHEN 'frontdesk@pinnaclegroups.ng' THEN 'Front Desk Staff'
    ELSE 'User'
  END,
  CASE u.email
    WHEN 'sysadmin@pinnaclegroups.ng' THEN '+2348000000001'
    WHEN 'ceo@pinnaclegroups.ng' THEN '+2348000000002'
    WHEN 'md@pinnaclegroups.ng' THEN '+2348000000003'
    WHEN 'frontdesk@pinnaclegroups.ng' THEN '+2348000000004'
    ELSE NULL
  END,
  CASE u.email
    WHEN 'sysadmin@pinnaclegroups.ng' THEN 'SysAdmin'
    WHEN 'ceo@pinnaclegroups.ng' THEN 'CEO'
    WHEN 'md@pinnaclegroups.ng' THEN 'MD'
    WHEN 'frontdesk@pinnaclegroups.ng' THEN 'Frontdesk'
    ELSE 'Agent'
  END
FROM auth.users u
WHERE u.email IN (
  'sysadmin@pinnaclegroups.ng',
  'ceo@pinnaclegroups.ng',
  'md@pinnaclegroups.ng',
  'frontdesk@pinnaclegroups.ng'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 7. Verify the results
SELECT 
  p.email,
  p.full_name,
  p.role,
  p.phone,
  u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.role, p.email;
