-- Acrely v2 - Single Tenant Lock for Pinnacle Builders
-- This migration removes all multi-tenant abstractions and locks the platform to Pinnacle Builders only
-- Migration: 20250111000000_remove_multitenant.sql

-- ============================================================================
-- PART 1: Remove Organization/Tenant Context
-- ============================================================================

-- Drop any existing organization-related tables if they exist
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Insert company settings into settings table
INSERT INTO public.settings (key, value, description)
VALUES 
  ('company_name', 'Pinnacle Builders Homes & Properties', 'Official company name'),
  ('company_email', 'info@pinnaclegroups.ng', 'Official company email'),
  ('company_phone', '+234XXXXXXXXXX', 'Official company phone'),
  ('company_address', 'Lagos, Nigeria', 'Official company address'),
  ('company_slogan', 'Building Trust, One Estate at a Time', 'Company slogan'),
  ('org_id', 'PBLD001', 'Fixed organization identifier'),
  ('termii_sender_id', 'PinnacleBuilders', 'Termii SMS sender ID')
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value, 
      description = EXCLUDED.description,
      updated_at = NOW();

-- ============================================================================
-- PART 2: Add Helper Function for Company Info
-- ============================================================================

-- Function to get company setting
CREATE OR REPLACE FUNCTION get_company_setting(setting_key TEXT)
RETURNS TEXT AS $$
DECLARE
  setting_value TEXT;
BEGIN
  SELECT value INTO setting_value FROM public.settings WHERE key = setting_key;
  RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 3: Update RLS Policies to Remove Multi-Tenant Checks
-- ============================================================================

-- Users table - Simplified RLS (authenticated users can view all)
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Customers table - All authenticated users can view
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
CREATE POLICY "Authenticated users can view customers" ON public.customers
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create customers" ON public.customers;
CREATE POLICY "Authenticated users can create customers" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
CREATE POLICY "Authenticated users can update customers" ON public.customers
  FOR UPDATE TO authenticated
  USING (true);

-- Plots table - All authenticated users
DROP POLICY IF EXISTS "Authenticated users can view plots" ON public.plots;
CREATE POLICY "Authenticated users can view plots" ON public.plots
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage plots" ON public.plots;
CREATE POLICY "Admins can manage plots" ON public.plots
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Allocations table
DROP POLICY IF EXISTS "Authenticated users can view allocations" ON public.allocations;
CREATE POLICY "Authenticated users can view allocations" ON public.allocations
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create allocations" ON public.allocations;
CREATE POLICY "Authenticated users can create allocations" ON public.allocations
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update allocations" ON public.allocations;
CREATE POLICY "Authenticated users can update allocations" ON public.allocations
  FOR UPDATE TO authenticated
  USING (true);

-- Payments table
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
CREATE POLICY "Authenticated users can view payments" ON public.payments
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create payments" ON public.payments;
CREATE POLICY "Authenticated users can create payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Commissions table
DROP POLICY IF EXISTS "Agents can view own commissions" ON public.commissions;
CREATE POLICY "Agents can view own commissions" ON public.commissions
  FOR SELECT TO authenticated
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Leads table
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Authenticated users can view leads" ON public.leads
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Authenticated users can manage leads" ON public.leads
  FOR ALL TO authenticated
  USING (true);

-- ============================================================================
-- PART 4: Comments and Documentation
-- ============================================================================

COMMENT ON DATABASE postgres IS 'Acrely - Pinnacle Builders Exclusive Platform - Single Tenant Mode';
COMMENT ON SCHEMA public IS 'All data belongs to Pinnacle Builders Homes & Properties (ORG_ID: PBLD001)';
