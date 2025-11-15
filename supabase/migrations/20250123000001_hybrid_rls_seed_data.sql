-- =====================================================
-- MINIMAL TEST DATA SEED FOR HYBRID RLS VERIFICATION
-- Version: 1.0.0
-- Date: 2025-01-23
-- Description: Safe, minimal seed data for testing login and CRUD workflows
-- =====================================================

BEGIN;

-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ====================================================================
-- PART 1: SEED PRODUCTION USERS
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Seeding production users...';
END $$;

-- Create four test user rows in public.users
INSERT INTO public.users (id, email, full_name, phone, role, created_at, updated_at)
VALUES
  ('16920ec4-7965-4c84-ab5d-0d256ae880e0', 'sysadmin@pinnaclegroups.ng', 'System Admin', '+00000000001', 'SysAdmin', now(), now()),
  ('94fc248e-8b13-45da-950a-59bfc15c2a09', 'ceo@pinnaclegroups.ng', 'CEO Pinnacle', '+00000000002', 'CEO', now(), now()),
  ('084dbb41-6099-4e6b-9833-95022ba8f951', 'md@pinnaclegroups.ng', 'Managing Director', '+00000000003', 'MD', now(), now()),
  ('3bd726bb-4290-454b-bd46-44b6ed2a0cbc', 'frontdesk@pinnaclegroups.ng', 'Front Desk', '+00000000004', 'Frontdesk', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email, 
  full_name = EXCLUDED.full_name, 
  phone = EXCLUDED.phone, 
  role = EXCLUDED.role, 
  updated_at = now();

DO $$
BEGIN
  RAISE NOTICE '   ✅ Seeded 4 production users';
END $$;

-- ====================================================================
-- PART 2: SEED PROFILES (if table exists)
-- ====================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='profiles') THEN
    INSERT INTO public.profiles (id, user_id, email, full_name, phone, role, created_at)
    VALUES
      ('16920ec4-7965-4c84-ab5d-0d256ae880e0','16920ec4-7965-4c84-ab5d-0d256ae880e0','sysadmin@pinnaclegroups.ng','System Admin','+00000000001','SysAdmin', now()),
      ('94fc248e-8b13-45da-950a-59bfc15c2a09','94fc248e-8b13-45da-950a-59bfc15c2a09','ceo@pinnaclegroups.ng','CEO Pinnacle','+00000000002','CEO', now())
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '   ✅ Seeded 2 profiles';
  ELSE
    RAISE NOTICE '   ⚠️  profiles table does not exist, skipping';
  END IF;
END $$;

-- ====================================================================
-- PART 3: SEED ESTATES
-- ====================================================================

DO $$
DECLARE
  egpe_id UUID;
  ohe_id UUID;
BEGIN
  RAISE NOTICE '📋 Seeding estates...';
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='estates') THEN
    -- Insert estates and capture IDs
    INSERT INTO public.estates (id, estate_code, estate_name, location, description, total_plots, available_plots, allocated_plots, sold_plots, status, created_at)
    VALUES
      (gen_random_uuid(), 'EGPE', 'Ehi Green Park Estate', 'Lekki, Lagos', 'Seed estate EGPE', 200, 198, 1, 1, 'active', now()),
      (gen_random_uuid(), 'OHE', 'Oduwa Housing Estate', 'Ikeja, Lagos', 'Seed estate OHE', 150, 150, 0, 0, 'active', now())
    ON CONFLICT (estate_code) DO NOTHING;
    
    RAISE NOTICE '   ✅ Seeded 2 estates';
  ELSE
    RAISE NOTICE '   ⚠️  estates table does not exist, skipping';
  END IF;
END $$;

-- ====================================================================
-- PART 4: SEED PLOTS
-- ====================================================================

DO $$
DECLARE
  estate_id_egpe UUID;
BEGIN
  RAISE NOTICE '📋 Seeding plots...';
  
  -- Get estate ID for EGPE
  SELECT id INTO estate_id_egpe FROM public.estates WHERE estate_code='EGPE' LIMIT 1;
  
  IF estate_id_egpe IS NOT NULL THEN
    -- Plot sizes in sqft stored in size_sqm column (naming historical)
    INSERT INTO public.plots (id, plot_number, estate_name, estate_code, size_sqm, price, status, estate_id, created_at)
    VALUES
      (gen_random_uuid(),'15','Ehi Green Park Estate','EGPE', 10000, 2500000, 'available', estate_id_egpe, now()),
      (gen_random_uuid(),'15A','Ehi Green Park Estate','EGPE', 5000, 1400000, 'available', estate_id_egpe, now())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '   ✅ Seeded 2 plots';
  ELSE
    RAISE NOTICE '   ⚠️  Estate EGPE not found, skipping plots';
  END IF;
END $$;

-- ====================================================================
-- PART 5: SEED CUSTOMERS
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Seeding customers...';
  
  INSERT INTO public.customers (id, full_name, email, phone, address, city, state, created_at)
  VALUES
    (gen_random_uuid(), 'John Doe', 'john.doe@example.com', '+2347000000001', '12 Example Street', 'Lagos', 'Lagos', now()),
    (gen_random_uuid(), 'Jane Smith', 'jane.smith@example.com', '+2347000000002', '45 Sample Ave', 'Lagos', 'Lagos', now())
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '   ✅ Seeded 2 customers';
END $$;

-- ====================================================================
-- PART 6: SEED ALLOCATION
-- ====================================================================

DO $$
DECLARE
  customer_id UUID;
  plot_id UUID;
  allocation_id UUID;
BEGIN
  RAISE NOTICE '📋 Seeding allocation...';
  
  -- Get customer and plot IDs
  SELECT id INTO customer_id FROM public.customers WHERE full_name = 'John Doe' LIMIT 1;
  SELECT id INTO plot_id FROM public.plots WHERE plot_number = '15' AND estate_code = 'EGPE' LIMIT 1;
  
  IF customer_id IS NOT NULL AND plot_id IS NOT NULL THEN
    -- Create allocation
    INSERT INTO public.allocations (id, customer_id, plot_id, total_amount, amount_paid, payment_plan, installment_count, installment_frequency, status, created_at)
    VALUES (gen_random_uuid(), customer_id, plot_id, 2500000, 0, 'outright', NULL, NULL, 'active', now())
    ON CONFLICT DO NOTHING
    RETURNING id INTO allocation_id;
    
    RAISE NOTICE '   ✅ Seeded 1 allocation';
  ELSE
    RAISE NOTICE '   ⚠️  Customer or Plot not found, skipping allocation';
  END IF;
END $$;

-- ====================================================================
-- PART 7: SEED PAYMENT
-- ====================================================================

DO $$
DECLARE
  allocation_id UUID;
BEGIN
  RAISE NOTICE '📋 Seeding payment...';
  
  -- Get allocation ID
  SELECT a.id INTO allocation_id 
  FROM public.allocations a
  JOIN public.customers c ON a.customer_id = c.id
  WHERE c.full_name = 'John Doe'
  LIMIT 1;
  
  IF allocation_id IS NOT NULL THEN
    INSERT INTO public.payments (id, allocation_id, amount, payment_method, reference, status, created_at)
    VALUES (gen_random_uuid(), allocation_id, 500000, 'bank_transfer', concat('TEST-', floor(random()*1000000)::text), 'confirmed', now())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '   ✅ Seeded 1 payment';
  ELSE
    RAISE NOTICE '   ⚠️  Allocation not found, skipping payment';
  END IF;
END $$;

-- ====================================================================
-- COMPLETION MESSAGE
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              TEST DATA SEEDING COMPLETE                      ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Seeded Data:';
  RAISE NOTICE '   ✓ 4 Users (SysAdmin, CEO, MD, Frontdesk)';
  RAISE NOTICE '   ✓ 2 Estates (EGPE, OHE)';
  RAISE NOTICE '   ✓ 2 Plots (EGPE 15, 15A)';
  RAISE NOTICE '   ✓ 2 Customers (John Doe, Jane Smith)';
  RAISE NOTICE '   ✓ 1 Allocation (John Doe → EGPE Plot 15)';
  RAISE NOTICE '   ✓ 1 Payment (₦500,000 initial payment)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Test data ready for verification workflows';
  RAISE NOTICE '';
END $$;

COMMIT;
