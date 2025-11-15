# 🧪 Test Environment - Quick Reference

## 🚀 One-Command Test Run
```bash
./scripts/run-e2e.sh
```
This does everything: resets DB → seeds data → runs Playwright tests

---

## 📝 Common Commands

### E2E Testing
```bash
# Full test suite
./scripts/run-e2e.sh

# Specific test file
./scripts/run-e2e.sh tests/e2e/auth.spec.ts

# Debug mode (headed browser)
./scripts/run-e2e.sh --headed

# UI mode for development
TEST_MODE=true pnpm playwright test --ui

# Show test report
pnpm playwright show-report
```

### Database Operations
```bash
# Reset test data
pnpm supabase db execute --file scripts/reset-test-db.sql

# Apply migrations
pnpm supabase migration up

# Check current schema
echo "SELECT current_schema();" | pnpm supabase db execute --stdin

# Verify test data
echo "SELECT count(*) FROM test.customers;" | pnpm supabase db execute --stdin
```

### Supabase Management
```bash
# Start Supabase (if not running)
pnpm supabase start

# Check status
pnpm supabase status

# Stop Supabase
pnpm supabase stop

# Reset entire Supabase (DANGER)
pnpm supabase db reset
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env.test.local` | Test environment variables |
| `playwright.config.ts` | E2E test configuration |
| `scripts/run-e2e.sh` | Complete test runner |
| `scripts/reset-test-db.sql` | Database reset script |
| `supabase/migrations/20250119000001_test_environment_setup.sql` | Schema + seed migration |

---

## 📊 Test Schema Overview

**Schema Name**: `test` (isolated from `public`)

### Tables (15 total)
- `customers` - 20 test records
- `allocations` - 20 test records  
- `payments` - 40 test records
- `receipts` - 20 test records
- `field_reports` - 15 test records
- `audit_logs` - 30 test records
- `profiles` - 4 test users
- `roles`, `commission_claims`, `billing_summary`, etc.

### Test Users
```javascript
{
  admin: 'admin@test.acrely.local',
  md: 'md@test.acrely.local', 
  frontdesk: 'frontdesk@test.acrely.local',
  agent: 'agent@test.acrely.local'
}
```

---

## 🔌 Using Schema-Aware Client

### In Your Code
```typescript
// Import schema-aware client
import { getSchemaClient } from '@acrely/services';

// Automatically uses 'test' schema when TEST_MODE=true
const client = getSchemaClient();

// Fetch from correct schema
const { data } = await client
  .from('customers')
  .select('*');

// Check current schema
import { getCurrentSchema } from '@acrely/services';
console.log('Using schema:', getCurrentSchema()); // 'test' or 'public'
```

### In E2E Tests
```typescript
import { test, expect } from '@playwright/test';

test('should query test data', async ({ page }) => {
  // TEST_MODE=true automatically set by run-e2e.sh
  // All DB queries go to test schema
  await page.goto('/customers');
  
  // These are test customers, not production
  await expect(page.locator('text=Test Customer 1')).toBeVisible();
});
```

---

## ⚠️ Important Rules

1. **Never run E2E tests without TEST_MODE=true**
   - Use `./scripts/run-e2e.sh` to ensure proper setup

2. **Always reset before testing**
   - The script does this automatically
   - Manual tests: run `scripts/reset-test-db.sql` first

3. **Production data is sacred**
   - Test schema is completely isolated
   - No way to accidentally touch `public` schema when TEST_MODE=true

4. **Fresh data every run**
   - Reset function truncates all test tables
   - Seed function populates predictable test data

---

## 🐛 Quick Debugging

### Test Mode Not Working?
```bash
# Verify environment variable
echo $TEST_MODE  # Should output: true

# Check Playwright config loaded it
TEST_MODE=true pnpm playwright test --debug
```

### Wrong Schema Being Used?
```typescript
// Add to your code temporarily
import { getCurrentSchema } from '@acrely/services';
console.log('Current schema:', getCurrentSchema());
```

### Seed Data Missing?
```bash
# Manually trigger seed
echo "SELECT test.seed_test_data();" | pnpm supabase db execute --stdin

# Verify
echo "SELECT count(*) FROM test.customers;" | pnpm supabase db execute --stdin
```

### Playwright Can't Connect?
```bash
# Ensure Supabase is running
pnpm supabase status

# If stopped, start it
pnpm supabase start

# Check API is responding
curl http://localhost:54321
```

---

## 📈 Performance Tips

1. **Reuse existing server**
   - Playwright config has `reuseExistingServer: true`
   - Start dev server once, run tests multiple times

2. **Parallel execution**
   - Tests run in parallel by default
   - Isolated test data prevents conflicts

3. **Skip database reset for debugging**
   ```bash
   # Manual workflow (not recommended for CI)
   TEST_MODE=true pnpm playwright test
   ```

---

## ✅ Pre-Test Checklist

Before running E2E tests, ensure:
- [ ] Supabase is running (`pnpm supabase status`)
- [ ] Migration applied (`pnpm supabase migration up`)
- [ ] Test schema exists (check Supabase Studio → Schemas)
- [ ] Using test runner script (`./scripts/run-e2e.sh`)

---

## 🎯 Success Indicators

Your test environment is working correctly if:
- ✅ `./scripts/run-e2e.sh` shows "Test database reset complete"
- ✅ Tests query test data (customers named "Test Customer X")
- ✅ Production schema untouched after tests run
- ✅ No errors about missing tables/schemas

---

## 🔗 Related Documentation
- Full Guide: `TEST_ENVIRONMENT_SETUP_COMPLETE.md`
- Playwright Docs: https://playwright.dev
- Supabase Local: https://supabase.com/docs/guides/cli

---

**Quick Help**: If stuck, check the main guide's troubleshooting section.
