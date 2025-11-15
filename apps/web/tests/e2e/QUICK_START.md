# E2E Tests - Quick Start Guide

## 🚀 Run Tests in 3 Steps

### 1. Set Up Environment
Create `.env.test.local` in project root:
```bash
TEST_MODE=true
NEXT_PUBLIC_TEST_SCHEMA=test
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BASE_URL=http://localhost:3001
```

### 2. Prepare Test Database
```bash
# Reset test database and seed data
./scripts/run-e2e.sh
```

### 3. Run Tests
```bash
# Run all tests
pnpm test:e2e

# Run with UI (recommended for first time)
npx playwright test --ui

# Run specific test
npx playwright test apps/web/tests/e2e/auth/login.spec.ts
```

---

## 📋 Common Commands

### Development
```bash
# Debug mode (step through tests)
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed

# Specific browser
npx playwright test --project=chromium
```

### CI/CD
```bash
# Full test suite with reset
./scripts/run-e2e.sh

# Quick run (no reset)
pnpm test:e2e
```

### Debugging
```bash
# Show test report
npx playwright show-report

# Open last trace
npx playwright show-trace trace.zip
```

---

## 🎯 Test Users

All passwords: `password123`

| Email | Role | Access |
|-------|------|--------|
| `admin@test.com` | SysAdmin | Full system |
| `agent@test.com` | Agent | Allocations, commissions |
| `frontdesk@test.com` | Frontdesk | Customers, payments |
| `ceo@test.com` | CEO | Analytics, reports |
| `md@test.com` | MD | Analytics, reports |

---

## 📁 Test Structure

```
tests/e2e/
├── auth/           # Login, logout, session
├── dashboard/      # Navigation
├── customers/      # CRUD operations
├── payments/       # Payment recording
├── allocations/    # Allocation viewing
└── utils/          # Shared helpers
```

---

## ✅ Pre-flight Checklist

Before running tests:
- [ ] Supabase is running locally
- [ ] `.env.test.local` file exists
- [ ] Test database has `test` schema
- [ ] Test users are seeded
- [ ] Dev server can start on port 3001

---

## 🆘 Troubleshooting

### Tests timeout
```bash
# Increase timeout in playwright.config.ts
# or add to specific test:
test('name', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
});
```

### Element not found
```typescript
// Add explicit wait
await page.waitForSelector('button');
await page.click('button');
```

### Database issues
```bash
# Manually reset test database
./scripts/run-e2e.sh

# Check TEST_MODE is set
echo $TEST_MODE  # should be "true"
```

---

## 📚 More Information

- Full docs: `README.md`
- Coverage goals: `coverage-goals.md`
- Quest summary: `../../E2E_TEST_INITIALIZATION_COMPLETE.md`

---

**Quick Help**: Most common workflow is `./scripts/run-e2e.sh` → `npx playwright test --ui`
