-- ============================================================================
-- TEST ENVIRONMENT SETUP
-- Quest: acrely-test-environment-setup-v1
-- ============================================================================
-- This migration creates an isolated test schema for E2E testing
-- Production data remains completely untouched
-- ============================================================================

-- ============================================================================
-- PHASE 1: Create Test Schema
-- ============================================================================
create schema if not exists test;

comment on schema test is 'Isolated test schema for E2E testing - production data is never touched';

-- ============================================================================
-- PHASE 2: Duplicate Production Tables (Structure Only)
-- ============================================================================

-- Core tables
create table if not exists test.customers (like public.customers including all);
create table if not exists test.allocations (like public.allocations including all);
create table if not exists test.payments (like public.payments including all);
create table if not exists test.receipts (like public.receipts including all);
create table if not exists test.audit_logs (like public.audit_logs including all);
create table if not exists test.field_reports (like public.field_reports including all);
create table if not exists test.profiles (like public.profiles including all);
create table if not exists test.roles (like public.roles including all);

-- Additional supporting tables
create table if not exists test.commission_claims (like public.commission_claims including all);
create table if not exists test.billing_summary (like public.billing_summary including all);
create table if not exists test.sms_queue (like public.sms_queue including all);
create table if not exists test.receipt_queue (like public.receipt_queue including all);
create table if not exists test.training_modules (like public.training_modules including all);
create table if not exists test.training_completions (like public.training_completions including all);
create table if not exists test.agent_performance (like public.agent_performance including all);

-- ============================================================================
-- PHASE 3: Enable RLS with Permissive Test Policies
-- ============================================================================

-- Enable RLS on all test tables
alter table test.customers enable row level security;
alter table test.allocations enable row level security;
alter table test.payments enable row level security;
alter table test.receipts enable row level security;
alter table test.audit_logs enable row level security;
alter table test.field_reports enable row level security;
alter table test.profiles enable row level security;
alter table test.roles enable row level security;
alter table test.commission_claims enable row level security;
alter table test.billing_summary enable row level security;
alter table test.sms_queue enable row level security;
alter table test.receipt_queue enable row level security;
alter table test.training_modules enable row level security;
alter table test.training_completions enable row level security;
alter table test.agent_performance enable row level security;

-- Create permissive policies for test environment (allow all operations)
create policy "test_allow_all_customers" on test.customers for all using (true) with check (true);
create policy "test_allow_all_allocations" on test.allocations for all using (true) with check (true);
create policy "test_allow_all_payments" on test.payments for all using (true) with check (true);
create policy "test_allow_all_receipts" on test.receipts for all using (true) with check (true);
create policy "test_allow_all_audit_logs" on test.audit_logs for all using (true) with check (true);
create policy "test_allow_all_field_reports" on test.field_reports for all using (true) with check (true);
create policy "test_allow_all_profiles" on test.profiles for all using (true) with check (true);
create policy "test_allow_all_roles" on test.roles for all using (true) with check (true);
create policy "test_allow_all_commission_claims" on test.commission_claims for all using (true) with check (true);
create policy "test_allow_all_billing_summary" on test.billing_summary for all using (true) with check (true);
create policy "test_allow_all_sms_queue" on test.sms_queue for all using (true) with check (true);
create policy "test_allow_all_receipt_queue" on test.receipt_queue for all using (true) with check (true);
create policy "test_allow_all_training_modules" on test.training_modules for all using (true) with check (true);
create policy "test_allow_all_training_completions" on test.training_completions for all using (true) with check (true);
create policy "test_allow_all_agent_performance" on test.agent_performance for all using (true) with check (true);

-- ============================================================================
-- PHASE 4: Seed Test User Profiles
-- ============================================================================

-- Insert test role if not exists
insert into test.roles (id, name, description, permissions, created_at)
values 
  ('role-admin', 'admin', 'Test Administrator', '{"all": true}'::jsonb, now()),
  ('role-md', 'md', 'Test Managing Director', '{"view_all": true, "approve": true}'::jsonb, now()),
  ('role-frontdesk', 'frontdesk', 'Test Front Desk', '{"create_customers": true, "process_payments": true}'::jsonb, now()),
  ('role-agent', 'agent', 'Test Agent', '{"view_own": true, "create_reports": true}'::jsonb, now())
on conflict (id) do nothing;

-- Insert test user profiles
insert into test.profiles (id, full_name, phone, email, role, created_at, updated_at)
values 
  ('test-user-admin', 'Test Admin User', '09000000001', 'admin@test.acrely.local', 'admin', now(), now()),
  ('test-user-md', 'Test MD User', '09000000002', 'md@test.acrely.local', 'md', now(), now()),
  ('test-user-frontdesk', 'Test Frontdesk User', '09000000003', 'frontdesk@test.acrely.local', 'frontdesk', now(), now()),
  ('test-user-agent', 'Test Agent User', '09000000004', 'agent@test.acrely.local', 'agent', now(), now())
on conflict (id) do nothing;

comment on table test.profiles is 'Test user profiles for E2E authentication testing';

-- ============================================================================
-- PHASE 5: Seed Test Data (Customers, Allocations, Payments)
-- ============================================================================

-- Seed 20 test customers
insert into test.customers (id, full_name, phone, email, address, city, state, created_at, updated_at)
select 
  gen_random_uuid(),
  'Test Customer ' || g,
  '0801000' || lpad(g::text, 4, '0'),
  'customer' || g || '@test.acrely.local',
  'Test Address ' || g || ', Test Street',
  'Lagos',
  'Lagos State',
  now() - interval '30 days' * random(),
  now()
from generate_series(1, 20) g
on conflict do nothing;

-- Seed 20 test allocations
insert into test.allocations (id, customer_id, plot_number, plot_size, amount, payment_plan, status, allocated_by, created_at, updated_at)
select 
  gen_random_uuid(),
  (select id from test.customers order by random() limit 1),
  'TEST-PLOT-' || lpad(g::text, 4, '0'),
  '500sqm',
  1500000 + (random() * 1000000)::int,
  'installment',
  (array['allocated', 'partial', 'completed'])[floor(random() * 3 + 1)],
  'test-user-frontdesk',
  now() - interval '25 days' * random(),
  now()
from generate_series(1, 20) g
on conflict do nothing;

-- Seed 40 test payments
insert into test.payments (id, customer_id, allocation_id, amount, method, reference, status, processed_by, created_at, updated_at)
select 
  gen_random_uuid(),
  (select id from test.customers order by random() limit 1),
  (select id from test.allocations order by random() limit 1),
  (random() * 500000 + 10000)::int,
  (array['cash', 'transfer', 'pos', 'cheque'])[floor(random() * 4 + 1)],
  'TEST-REF-' || gen_random_uuid()::text,
  (array['completed', 'pending', 'verified'])[floor(random() * 3 + 1)],
  'test-user-frontdesk',
  now() - interval '20 days' * random(),
  now()
from generate_series(1, 40) g
on conflict do nothing;

-- Seed test receipts
insert into test.receipts (id, payment_id, receipt_number, customer_name, amount, status, generated_at, created_at)
select 
  gen_random_uuid(),
  p.id,
  'RCPT-TEST-' || lpad(row_number() over (order by p.created_at)::text, 6, '0'),
  c.full_name,
  p.amount,
  'generated',
  p.created_at + interval '1 hour',
  p.created_at
from test.payments p
join test.customers c on c.id = p.customer_id
where p.status = 'completed'
limit 20
on conflict do nothing;

-- Seed test field reports
insert into test.field_reports (id, agent_id, report_type, location, visit_date, findings, customer_id, status, created_at)
select 
  gen_random_uuid(),
  'test-user-agent',
  (array['site_visit', 'customer_follow_up', 'inspection', 'survey'])[floor(random() * 4 + 1)],
  'Test Location ' || g,
  now() - interval '15 days' * random(),
  'Test findings for report ' || g || '. All activities completed successfully.',
  (select id from test.customers order by random() limit 1),
  (array['submitted', 'reviewed', 'approved'])[floor(random() * 3 + 1)],
  now() - interval '15 days' * random()
from generate_series(1, 15) g
on conflict do nothing;

-- Seed test audit logs
insert into test.audit_logs (id, user_id, action, table_name, record_id, changes, ip_address, user_agent, created_at)
select 
  gen_random_uuid(),
  (array['test-user-admin', 'test-user-md', 'test-user-frontdesk', 'test-user-agent'])[floor(random() * 4 + 1)],
  (array['CREATE', 'UPDATE', 'DELETE', 'VIEW'])[floor(random() * 4 + 1)],
  (array['customers', 'payments', 'allocations', 'field_reports'])[floor(random() * 4 + 1)],
  gen_random_uuid(),
  '{"test": true, "automated": true}'::jsonb,
  '127.0.0.1',
  'Playwright/E2E Test Runner',
  now() - interval '10 days' * random()
from generate_series(1, 30) g
on conflict do nothing;

-- ============================================================================
-- Helper Functions for Test Environment
-- ============================================================================

-- Function to reset test schema data
create or replace function test.reset_test_data()
returns void
language plpgsql
security definer
as $$
begin
  -- Truncate all test tables in correct order (respecting foreign keys)
  truncate table test.audit_logs restart identity cascade;
  truncate table test.field_reports restart identity cascade;
  truncate table test.receipts restart identity cascade;
  truncate table test.receipt_queue restart identity cascade;
  truncate table test.sms_queue restart identity cascade;
  truncate table test.payments restart identity cascade;
  truncate table test.allocations restart identity cascade;
  truncate table test.customers restart identity cascade;
  truncate table test.commission_claims restart identity cascade;
  truncate table test.billing_summary restart identity cascade;
  truncate table test.training_completions restart identity cascade;
  truncate table test.agent_performance restart identity cascade;
  
  raise notice 'Test data reset completed successfully';
end;
$$;

comment on function test.reset_test_data() is 'Resets all test data - called before each E2E test run';

-- Function to seed fresh test data
create or replace function test.seed_test_data()
returns void
language plpgsql
security definer
as $$
begin
  -- First reset
  perform test.reset_test_data();
  
  -- Re-seed customers
  insert into test.customers (id, full_name, phone, email, address, city, state, created_at, updated_at)
  select 
    gen_random_uuid(),
    'Test Customer ' || g,
    '0801000' || lpad(g::text, 4, '0'),
    'customer' || g || '@test.acrely.local',
    'Test Address ' || g || ', Test Street',
    'Lagos',
    'Lagos State',
    now() - interval '30 days' * random(),
    now()
  from generate_series(1, 20) g;
  
  -- Re-seed allocations
  insert into test.allocations (id, customer_id, plot_number, plot_size, amount, payment_plan, status, allocated_by, created_at, updated_at)
  select 
    gen_random_uuid(),
    (select id from test.customers order by random() limit 1),
    'TEST-PLOT-' || lpad(g::text, 4, '0'),
    '500sqm',
    1500000 + (random() * 1000000)::int,
    'installment',
    (array['allocated', 'partial', 'completed'])[floor(random() * 3 + 1)],
    'test-user-frontdesk',
    now() - interval '25 days' * random(),
    now()
  from generate_series(1, 20) g;
  
  -- Re-seed payments
  insert into test.payments (id, customer_id, allocation_id, amount, method, reference, status, processed_by, created_at, updated_at)
  select 
    gen_random_uuid(),
    (select id from test.customers order by random() limit 1),
    (select id from test.allocations order by random() limit 1),
    (random() * 500000 + 10000)::int,
    (array['cash', 'transfer', 'pos', 'cheque'])[floor(random() * 4 + 1)],
    'TEST-REF-' || gen_random_uuid()::text,
    (array['completed', 'pending', 'verified'])[floor(random() * 3 + 1)],
    'test-user-frontdesk',
    now() - interval '20 days' * random(),
    now()
  from generate_series(1, 40) g;
  
  raise notice 'Test data seeded successfully';
end;
$$;

comment on function test.seed_test_data() is 'Resets and seeds fresh test data for E2E tests';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant usage on test schema
grant usage on schema test to anon, authenticated, service_role;

-- Grant all permissions on test tables
grant all on all tables in schema test to anon, authenticated, service_role;
grant all on all sequences in schema test to anon, authenticated, service_role;
grant all on all functions in schema test to anon, authenticated, service_role;

-- ============================================================================
-- Verification
-- ============================================================================

do $$
declare
  customer_count int;
  allocation_count int;
  payment_count int;
  profile_count int;
begin
  select count(*) into customer_count from test.customers;
  select count(*) into allocation_count from test.allocations;
  select count(*) into payment_count from test.payments;
  select count(*) into profile_count from test.profiles;
  
  raise notice '========================================';
  raise notice 'TEST ENVIRONMENT SETUP COMPLETE';
  raise notice '========================================';
  raise notice 'Test Schema: ✅ Created';
  raise notice 'Test Customers: % records', customer_count;
  raise notice 'Test Allocations: % records', allocation_count;
  raise notice 'Test Payments: % records', payment_count;
  raise notice 'Test Profiles: % records', profile_count;
  raise notice '========================================';
end;
$$;
