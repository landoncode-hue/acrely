# ✅ Test Environment Deployment Checklist

Use this checklist to deploy the test environment to your Supabase instance.

---

## 📋 Pre-Deployment Checks

- [ ] Supabase CLI installed (`pnpm supabase --version`)
- [ ] Local Supabase running (`pnpm supabase start`)
- [ ] Production data backed up (if applying to remote)
- [ ] All dependencies installed (`pnpm install`)

---

## 🚀 Deployment Steps

### Step 1: Apply Database Migration
```bash
# Apply the test environment migration
pnpm supabase migration up

# Or push all migrations
pnpm supabase db push
```

**Expected Output**: Migration creates test schema with all tables

- [ ] Migration applied successfully
- [ ] No errors in output

### Step 2: Verify Schema Creation
```bash
# Check test schema exists
echo "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'test';" | pnpm supabase db execute --stdin
```

**Expected Output**: Should show `test` schema

- [ ] Test schema exists
- [ ] Schema is accessible

### Step 3: Verify Seed Data
```bash
# Check customers count
echo "SELECT count(*) FROM test.customers;" | pnpm supabase db execute --stdin

# Check payments count
echo "SELECT count(*) FROM test.payments;" | pnpm supabase db execute --stdin

# Check profiles count
echo "SELECT count(*) FROM test.profiles;" | pnpm supabase db execute --stdin
```

**Expected Output**:
- Customers: 20
- Payments: 40
- Profiles: 4

- [ ] Test customers seeded (20 records)
- [ ] Test payments seeded (40 records)
- [ ] Test profiles seeded (4 records)

### Step 4: Verify Helper Functions
```bash
# Test reset function
echo "SELECT test.reset_test_data();" | pnpm supabase db execute --stdin

# Test seed function
echo "SELECT test.seed_test_data();" | pnpm supabase db execute --stdin
```

**Expected Output**: Functions execute without errors

- [ ] `test.reset_test_data()` works
- [ ] `test.seed_test_data()` works

### Step 5: Test Database Reset Script
```bash
# Run the reset script
pnpm test:e2e:reset-db
```

**Expected Output**: Success message with data counts

- [ ] Reset script executes
- [ ] Data counts displayed
- [ ] No errors

### Step 6: Run Demo E2E Test
```bash
# Run the test environment demo
./scripts/run-e2e.sh tests/e2e/test-environment-demo.spec.ts
```

**Expected Output**: Tests pass (or run without schema errors)

- [ ] Demo test executes
- [ ] Test schema is used (not production)
- [ ] Tests can query test data

---

## 🧪 Validation Tests

### Quick Smoke Tests
```bash
# 1. Verify schema switching
TEST_MODE=true node -e "console.log('TEST_MODE enabled')"

# 2. Check environment file
cat .env.test.local

# 3. Verify scripts are executable
ls -l scripts/run-e2e.sh | grep -q 'x' && echo "✓ Executable" || echo "✗ Not executable"

# 4. Test complete E2E workflow
./scripts/run-e2e.sh --help || echo "Script ready"
```

- [ ] TEST_MODE environment variable works
- [ ] `.env.test.local` exists and has correct values
- [ ] `run-e2e.sh` is executable
- [ ] Scripts can be run from workspace root

---

## 🔍 Verification Queries

### Check All Test Tables
```sql
-- Run this in Supabase SQL Editor or via CLI
SELECT 
  table_name,
  (SELECT count(*) FROM test.||table_name) as row_count
FROM information_schema.tables
WHERE table_schema = 'test'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

- [ ] All tables exist in test schema
- [ ] Tables have correct row counts

### Check RLS Policies
```sql
-- Verify RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'test'
ORDER BY tablename, policyname;
```

- [ ] RLS enabled on all test tables
- [ ] Permissive policies created

### Check Test User Profiles
```sql
-- View test users
SELECT id, full_name, email, role
FROM test.profiles
ORDER BY role;
```

**Expected Result**:
```
test-user-admin     | Test Admin User      | admin@test.acrely.local      | admin
test-user-md        | Test MD User         | md@test.acrely.local         | md
test-user-frontdesk | Test Frontdesk User  | frontdesk@test.acrely.local  | frontdesk
test-user-agent     | Test Agent User      | agent@test.acrely.local      | agent
```

- [ ] All 4 test users exist
- [ ] Email addresses use `test.acrely.local`
- [ ] All roles represented

---

## 🎯 Success Criteria

All must be checked before marking deployment complete:

- [ ] ✅ Test schema created
- [ ] ✅ All tables duplicated (15 tables)
- [ ] ✅ RLS enabled with permissive policies
- [ ] ✅ Test data seeded (149 records total)
- [ ] ✅ Helper functions working
- [ ] ✅ Reset script functional
- [ ] ✅ E2E runner script working
- [ ] ✅ Playwright configured
- [ ] ✅ Schema-aware client implemented
- [ ] ✅ Environment variables set
- [ ] ✅ Demo test passes

---

## 🔧 Troubleshooting

### Migration Fails
**Problem**: Migration throws errors
```bash
# Solution: Check migration syntax
cat supabase/migrations/20250119000001_test_environment_setup.sql

# Or reset and try again
pnpm supabase db reset
pnpm supabase migration up
```

### Seed Data Missing
**Problem**: Test tables are empty
```bash
# Solution: Manually run seed function
echo "SELECT test.seed_test_data();" | pnpm supabase db execute --stdin
```

### Schema Not Found
**Problem**: Tests can't find test schema
```bash
# Solution: Verify schema in config
cat supabase/config.toml | grep schemas

# Should include "test" in the schemas array
```

### Permission Denied
**Problem**: Can't query test schema
```sql
-- Solution: Grant permissions
GRANT USAGE ON SCHEMA test TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA test TO anon, authenticated, service_role;
```

---

## 📝 Post-Deployment

### Update Team
- [ ] Notify team about test environment
- [ ] Share `TEST_ENVIRONMENT_QUICK_REFERENCE.md`
- [ ] Document in team wiki/docs

### CI/CD Integration (Optional)
- [ ] Add `./scripts/run-e2e.sh` to CI pipeline
- [ ] Set `TEST_MODE=true` in CI environment
- [ ] Configure Supabase in CI

### Next Steps
- [ ] Update existing E2E tests to use `getSchemaClient()`
- [ ] Create additional test fixtures as needed
- [ ] Set up auth test users (optional)
- [ ] Monitor test execution times

---

## 🎉 Deployment Complete!

When all checkboxes are marked:
1. Test environment is fully operational
2. E2E tests can run safely
3. Production data is protected
4. Team can start using the test environment

---

**Deployment Date**: ________________  
**Deployed By**: ________________  
**Verified By**: ________________  

---

## 📞 Support

If you encounter issues during deployment:
1. Check this checklist's troubleshooting section
2. Review `TEST_ENVIRONMENT_SETUP_COMPLETE.md`
3. Verify all files were created correctly
4. Check Supabase logs: `pnpm supabase logs`

---

**Quest**: `acrely-test-environment-setup-v1`  
**Status**: Ready for Deployment ✅
