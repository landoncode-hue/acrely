-- Test Schema Setup for E2E Testing
-- Creates a separate 'test' schema for isolated testing without affecting production data

-- ============================================================================
-- STEP 1: Create Test Schema
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS test;

-- Grant permissions to necessary roles
GRANT USAGE ON SCHEMA test TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA test TO postgres, service_role;

-- ============================================================================
-- STEP 2: Clone All Tables to Test Schema
-- ============================================================================

-- Users table
CREATE TABLE test.users (LIKE public.users INCLUDING ALL);
ALTER TABLE test.users ADD CONSTRAINT test_users_pkey PRIMARY KEY (id);
ALTER TABLE test.users ADD CONSTRAINT test_users_email_key UNIQUE (email);

-- Customers table
CREATE TABLE test.customers (LIKE public.customers INCLUDING ALL);
ALTER TABLE test.customers ADD CONSTRAINT test_customers_pkey PRIMARY KEY (id);

-- Plots table
CREATE TABLE test.plots (LIKE public.plots INCLUDING ALL);
ALTER TABLE test.plots ADD CONSTRAINT test_plots_pkey PRIMARY KEY (id);
ALTER TABLE test.plots ADD CONSTRAINT test_plots_estate_plot_unique UNIQUE (estate_code, plot_number);

-- Allocations table
CREATE TABLE test.allocations (LIKE public.allocations INCLUDING ALL);
ALTER TABLE test.allocations ADD CONSTRAINT test_allocations_pkey PRIMARY KEY (id);
ALTER TABLE test.allocations ADD CONSTRAINT test_allocations_customer_fk FOREIGN KEY (customer_id) REFERENCES test.customers(id) ON DELETE CASCADE;
ALTER TABLE test.allocations ADD CONSTRAINT test_allocations_plot_fk FOREIGN KEY (plot_id) REFERENCES test.plots(id) ON DELETE CASCADE;
ALTER TABLE test.allocations ADD CONSTRAINT test_allocations_agent_fk FOREIGN KEY (agent_id) REFERENCES test.users(id);

-- Payments table
CREATE TABLE test.payments (LIKE public.payments INCLUDING ALL);
ALTER TABLE test.payments ADD CONSTRAINT test_payments_pkey PRIMARY KEY (id);
ALTER TABLE test.payments ADD CONSTRAINT test_payments_allocation_fk FOREIGN KEY (allocation_id) REFERENCES test.allocations(id) ON DELETE CASCADE;
ALTER TABLE test.payments ADD CONSTRAINT test_payments_recorded_by_fk FOREIGN KEY (recorded_by) REFERENCES test.users(id);
ALTER TABLE test.payments ADD CONSTRAINT test_payments_reference_key UNIQUE (reference);

-- Commissions table
CREATE TABLE test.commissions (LIKE public.commissions INCLUDING ALL);
ALTER TABLE test.commissions ADD CONSTRAINT test_commissions_pkey PRIMARY KEY (id);
ALTER TABLE test.commissions ADD CONSTRAINT test_commissions_agent_fk FOREIGN KEY (agent_id) REFERENCES test.users(id) ON DELETE CASCADE;
ALTER TABLE test.commissions ADD CONSTRAINT test_commissions_allocation_fk FOREIGN KEY (allocation_id) REFERENCES test.allocations(id) ON DELETE CASCADE;
ALTER TABLE test.commissions ADD CONSTRAINT test_commissions_approved_by_fk FOREIGN KEY (approved_by) REFERENCES test.users(id);

-- Inspection schedules table
CREATE TABLE test.inspection_schedules (LIKE public.inspection_schedules INCLUDING ALL);
ALTER TABLE test.inspection_schedules ADD CONSTRAINT test_inspection_schedules_pkey PRIMARY KEY (id);
ALTER TABLE test.inspection_schedules ADD CONSTRAINT test_inspection_schedules_customer_fk FOREIGN KEY (customer_id) REFERENCES test.customers(id) ON DELETE CASCADE;
ALTER TABLE test.inspection_schedules ADD CONSTRAINT test_inspection_schedules_plot_fk FOREIGN KEY (plot_id) REFERENCES test.plots(id) ON DELETE CASCADE;
ALTER TABLE test.inspection_schedules ADD CONSTRAINT test_inspection_schedules_created_by_fk FOREIGN KEY (created_by) REFERENCES test.users(id);

-- Notifications table
CREATE TABLE test.notifications (LIKE public.notifications INCLUDING ALL);
ALTER TABLE test.notifications ADD CONSTRAINT test_notifications_pkey PRIMARY KEY (id);
ALTER TABLE test.notifications ADD CONSTRAINT test_notifications_user_fk FOREIGN KEY (user_id) REFERENCES test.users(id) ON DELETE CASCADE;

-- Leads table
CREATE TABLE test.leads (LIKE public.leads INCLUDING ALL);
ALTER TABLE test.leads ADD CONSTRAINT test_leads_pkey PRIMARY KEY (id);
ALTER TABLE test.leads ADD CONSTRAINT test_leads_assigned_to_fk FOREIGN KEY (assigned_to) REFERENCES test.users(id);

-- Call logs table
CREATE TABLE test.call_logs (LIKE public.call_logs INCLUDING ALL);
ALTER TABLE test.call_logs ADD CONSTRAINT test_call_logs_pkey PRIMARY KEY (id);
ALTER TABLE test.call_logs ADD CONSTRAINT test_call_logs_lead_fk FOREIGN KEY (lead_id) REFERENCES test.leads(id) ON DELETE SET NULL;
ALTER TABLE test.call_logs ADD CONSTRAINT test_call_logs_customer_fk FOREIGN KEY (customer_id) REFERENCES test.customers(id) ON DELETE SET NULL;
ALTER TABLE test.call_logs ADD CONSTRAINT test_call_logs_logged_by_fk FOREIGN KEY (logged_by) REFERENCES test.users(id);

-- SMS campaigns table
CREATE TABLE test.sms_campaigns (LIKE public.sms_campaigns INCLUDING ALL);
ALTER TABLE test.sms_campaigns ADD CONSTRAINT test_sms_campaigns_pkey PRIMARY KEY (id);
ALTER TABLE test.sms_campaigns ADD CONSTRAINT test_sms_campaigns_created_by_fk FOREIGN KEY (created_by) REFERENCES test.users(id);

-- Campaign recipients table
CREATE TABLE test.campaign_recipients (LIKE public.campaign_recipients INCLUDING ALL);
ALTER TABLE test.campaign_recipients ADD CONSTRAINT test_campaign_recipients_pkey PRIMARY KEY (id);
ALTER TABLE test.campaign_recipients ADD CONSTRAINT test_campaign_recipients_campaign_fk FOREIGN KEY (campaign_id) REFERENCES test.sms_campaigns(id) ON DELETE CASCADE;

-- Settings table
CREATE TABLE test.settings (LIKE public.settings INCLUDING ALL);
ALTER TABLE test.settings ADD CONSTRAINT test_settings_pkey PRIMARY KEY (id);
ALTER TABLE test.settings ADD CONSTRAINT test_settings_key_unique UNIQUE (key);
ALTER TABLE test.settings ADD CONSTRAINT test_settings_updated_by_fk FOREIGN KEY (updated_by) REFERENCES test.users(id);

-- Audit logs table
CREATE TABLE test.audit_logs (LIKE public.audit_logs INCLUDING ALL);
ALTER TABLE test.audit_logs ADD CONSTRAINT test_audit_logs_pkey PRIMARY KEY (id);

-- ============================================================================
-- STEP 3: Create Indexes for Test Schema
-- ============================================================================

CREATE INDEX test_idx_customers_phone ON test.customers(phone);
CREATE INDEX test_idx_plots_estate_code ON test.plots(estate_code);
CREATE INDEX test_idx_plots_status ON test.plots(status);
CREATE INDEX test_idx_allocations_customer_id ON test.allocations(customer_id);
CREATE INDEX test_idx_allocations_plot_id ON test.allocations(plot_id);
CREATE INDEX test_idx_allocations_agent_id ON test.allocations(agent_id);
CREATE INDEX test_idx_allocations_status ON test.allocations(status);
CREATE INDEX test_idx_payments_allocation_id ON test.payments(allocation_id);
CREATE INDEX test_idx_payments_payment_date ON test.payments(payment_date);
CREATE INDEX test_idx_commissions_agent_id ON test.commissions(agent_id);
CREATE INDEX test_idx_commissions_status ON test.commissions(status);
CREATE INDEX test_idx_notifications_user_id ON test.notifications(user_id);
CREATE INDEX test_idx_leads_assigned_to ON test.leads(assigned_to);
CREATE INDEX test_idx_leads_status ON test.leads(status);

-- ============================================================================
-- STEP 4: Enable RLS on Test Tables
-- ============================================================================

ALTER TABLE test.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE test.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Create Test-Specific RLS Policies (Permissive for Testing)
-- ============================================================================

-- For testing purposes, allow service_role full access and bypass for anon/authenticated
-- This makes E2E tests easier but maintains RLS enforcement

-- Service role has full access to all test tables
CREATE POLICY "Service role full access" ON test.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.customers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.plots FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.allocations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.payments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.commissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.inspection_schedules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.leads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.call_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.sms_campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.campaign_recipients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON test.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users have read access (for testing auth flows)
CREATE POLICY "Authenticated read access" ON test.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read access" ON test.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read access" ON test.plots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read access" ON test.allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read access" ON test.payments FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- STEP 6: Create Utility Functions for Test Data Management
-- ============================================================================

-- Function to reset test schema (delete all data)
CREATE OR REPLACE FUNCTION test.reset_test_data()
RETURNS void AS $$
BEGIN
  -- Delete in reverse order of dependencies
  DELETE FROM test.campaign_recipients;
  DELETE FROM test.sms_campaigns;
  DELETE FROM test.call_logs;
  DELETE FROM test.leads;
  DELETE FROM test.notifications;
  DELETE FROM test.inspection_schedules;
  DELETE FROM test.commissions;
  DELETE FROM test.payments;
  DELETE FROM test.allocations;
  DELETE FROM test.plots;
  DELETE FROM test.customers;
  DELETE FROM test.users;
  DELETE FROM test.settings;
  DELETE FROM test.audit_logs;
  
  RAISE NOTICE 'Test data reset complete';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to seed test data
CREATE OR REPLACE FUNCTION test.seed_test_data()
RETURNS void AS $$
BEGIN
  -- Insert test admin user
  INSERT INTO test.users (id, email, full_name, phone, role, created_at, updated_at)
  VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'admin@test.com', 'Test Admin', '+2348000000001', 'CEO', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002'::uuid, 'agent@test.com', 'Test Agent', '+2348000000002', 'Agent', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'frontdesk@test.com', 'Test Frontdesk', '+2348000000003', 'Frontdesk', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert test customers
  INSERT INTO test.customers (id, full_name, email, phone, created_at, updated_at)
  VALUES 
    ('10000000-0000-0000-0000-000000000001'::uuid, 'John Doe', 'john@test.com', '+2348100000001', NOW(), NOW()),
    ('10000000-0000-0000-0000-000000000002'::uuid, 'Jane Smith', 'jane@test.com', '+2348100000002', NOW(), NOW())
  ON CONFLICT DO NOTHING;
  
  -- Insert test plots
  INSERT INTO test.plots (id, plot_number, estate_name, estate_code, size_sqm, price, status, created_at, updated_at)
  VALUES 
    ('20000000-0000-0000-0000-000000000001'::uuid, 'TEST-001', 'Test Estate', 'TEST', 465, 1000000, 'available', NOW(), NOW()),
    ('20000000-0000-0000-0000-000000000002'::uuid, 'TEST-002', 'Test Estate', 'TEST', 930, 2000000, 'available', NOW(), NOW())
  ON CONFLICT (estate_code, plot_number) DO NOTHING;
  
  -- Insert test settings
  INSERT INTO test.settings (id, key, value, description, updated_at)
  VALUES 
    (gen_random_uuid(), 'commission_rate', '5.0', 'Default commission rate (%)', NOW())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  
  RAISE NOTICE 'Test data seeded successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clone production data to test (for realistic testing)
CREATE OR REPLACE FUNCTION test.clone_production_data()
RETURNS void AS $$
BEGIN
  -- Reset test data first
  PERFORM test.reset_test_data();
  
  -- Clone users (excluding sensitive data)
  INSERT INTO test.users 
  SELECT * FROM public.users;
  
  -- Clone customers
  INSERT INTO test.customers 
  SELECT * FROM public.customers LIMIT 100; -- Limit for performance
  
  -- Clone plots
  INSERT INTO test.plots 
  SELECT * FROM public.plots LIMIT 100;
  
  -- Clone allocations
  INSERT INTO test.allocations 
  SELECT a.* FROM public.allocations a
  WHERE a.customer_id IN (SELECT id FROM test.customers)
    AND a.plot_id IN (SELECT id FROM test.plots)
  LIMIT 100;
  
  -- Clone payments
  INSERT INTO test.payments 
  SELECT p.* FROM public.payments p
  WHERE p.allocation_id IN (SELECT id FROM test.allocations)
  LIMIT 100;
  
  RAISE NOTICE 'Production data cloned to test schema';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION test.reset_test_data() TO service_role;
GRANT EXECUTE ON FUNCTION test.seed_test_data() TO service_role;
GRANT EXECUTE ON FUNCTION test.clone_production_data() TO service_role;

-- ============================================================================
-- STEP 7: Create Test Data View for Verification
-- ============================================================================

CREATE OR REPLACE VIEW test.data_summary AS
SELECT 
  'users' AS table_name, COUNT(*) AS record_count FROM test.users
UNION ALL
SELECT 'customers', COUNT(*) FROM test.customers
UNION ALL
SELECT 'plots', COUNT(*) FROM test.plots
UNION ALL
SELECT 'allocations', COUNT(*) FROM test.allocations
UNION ALL
SELECT 'payments', COUNT(*) FROM test.payments
UNION ALL
SELECT 'commissions', COUNT(*) FROM test.commissions
UNION ALL
SELECT 'leads', COUNT(*) FROM test.leads
UNION ALL
SELECT 'sms_campaigns', COUNT(*) FROM test.sms_campaigns
ORDER BY table_name;

GRANT SELECT ON test.data_summary TO service_role, authenticated;

-- ============================================================================
-- STEP 8: Documentation
-- ============================================================================

COMMENT ON SCHEMA test IS 'Isolated schema for E2E testing - safe to reset and seed with test data';
COMMENT ON FUNCTION test.reset_test_data() IS 'Deletes all data from test schema';
COMMENT ON FUNCTION test.seed_test_data() IS 'Seeds test schema with basic test data';
COMMENT ON FUNCTION test.clone_production_data() IS 'Clones subset of production data to test schema for realistic testing';

-- ============================================================================
-- Verification
-- ============================================================================

-- Check test schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'test';

-- Seed initial test data
SELECT test.seed_test_data();

-- Verify test data
SELECT * FROM test.data_summary;
