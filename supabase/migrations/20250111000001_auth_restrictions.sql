-- Pinnacle Builders - Authentication Restrictions
-- This migration restricts authentication to authorized Pinnacle Builders staff only
-- Migration: 20250111000001_auth_restrictions.sql

-- ============================================================================
-- PART 1: Email Domain Whitelist Function
-- ============================================================================

-- Function to validate email domain for Pinnacle Builders
CREATE OR REPLACE FUNCTION validate_pinnacle_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow only @pinnaclegroups.ng and @pinnaclebuilders.ng domains
  RETURN email ILIKE '%@pinnaclegroups.ng' OR email ILIKE '%@pinnaclebuilders.ng';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- PART 2: Trigger to Prevent Unauthorized Signups
-- ============================================================================

-- Function to validate user on insert
CREATE OR REPLACE FUNCTION check_user_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email is from authorized domain
  IF NOT validate_pinnacle_email(NEW.email) THEN
    RAISE EXCEPTION 'Registration restricted to Pinnacle Builders staff only. Contact admin for access.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on users table
DROP TRIGGER IF EXISTS validate_user_email_trigger ON public.users;
CREATE TRIGGER validate_user_email_trigger
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION check_user_email_domain();

-- ============================================================================
-- PART 3: Additional Constraints
-- ============================================================================

-- Add comment to users table about restriction
COMMENT ON TABLE public.users IS 'Pinnacle Builders staff only. Email must be @pinnaclegroups.ng or @pinnaclebuilders.ng';

-- Add setting for registration mode
INSERT INTO public.settings (key, value, description)
VALUES ('registration_mode', 'admin_only', 'Registration is restricted to admin-created accounts only')
ON CONFLICT (key) DO UPDATE 
  SET value = 'admin_only',
      description = 'Registration is restricted to admin-created accounts only',
      updated_at = NOW();

-- ============================================================================
-- PART 4: Helper Function for Admin User Creation
-- ============================================================================

-- Function for admins to create new staff accounts
CREATE OR REPLACE FUNCTION create_staff_account(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_role TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Validate email domain
  IF NOT validate_pinnacle_email(p_email) THEN
    RAISE EXCEPTION 'Email must be from @pinnaclegroups.ng or @pinnaclebuilders.ng domain';
  END IF;
  
  -- Validate role
  IF p_role NOT IN ('admin', 'agent', 'manager') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, agent, or manager';
  END IF;
  
  -- Note: Actual user creation happens via Supabase Auth API
  -- This function is a placeholder for validation logic
  RAISE NOTICE 'Staff account validated for: %', p_email;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to admins
-- GRANT EXECUTE ON FUNCTION create_staff_account TO authenticated;
