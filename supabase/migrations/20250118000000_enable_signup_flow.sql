-- Enable Signup Flow with Role Selection
-- Temporarily relax RLS to allow users to set their own roles during signup

-- Update handle_new_user function to include phone and role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, phone, role)
  VALUES (
    NEW.id, 
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'Agent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to allow authenticated users to insert their own profile
-- This is needed if the trigger doesn't fire or for manual profile creation
CREATE POLICY "Users can insert own profile during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update role check constraint to include Manager
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('SysAdmin', 'CEO', 'MD', 'Manager', 'Accountant', 'Frontdesk', 'Agent'));

-- Comment for documentation
COMMENT ON POLICY "Users can insert own profile during signup" ON public.profiles IS 
  'Temporary policy to allow self-signup with role selection. Should be restricted in production.';
