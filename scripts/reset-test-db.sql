-- ============================================================================
-- TEST DATABASE RESET SCRIPT
-- ============================================================================
-- This script resets the test schema to a clean state before E2E tests
-- Production data is NEVER affected
-- ============================================================================

-- Reset all test data using the helper function
select test.reset_test_data();

-- Re-seed fresh test data
select test.seed_test_data();

-- Verify reset
do $$
declare
  customer_count int;
  allocation_count int;
  payment_count int;
begin
  select count(*) into customer_count from test.customers;
  select count(*) into allocation_count from test.allocations;
  select count(*) into payment_count from test.payments;
  
  raise notice '========================================';
  raise notice 'TEST DATABASE RESET COMPLETE';
  raise notice '========================================';
  raise notice 'Customers: %', customer_count;
  raise notice 'Allocations: %', allocation_count;
  raise notice 'Payments: %', payment_count;
  raise notice '========================================';
  raise notice 'Ready for E2E testing';
end;
$$;
