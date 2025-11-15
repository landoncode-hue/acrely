# Acrely E2E Test Suite

## Overview
This directory contains end-to-end tests for the Acrely platform using Playwright. Tests are organized by feature area and use the isolated test schema to ensure data integrity.

## Directory Structure

```
apps/web/tests/e2e/
├── auth/              # Authentication & session tests
├── dashboard/         # Dashboard navigation tests
├── customers/         # Customer CRUD operations
├── payments/          # Payment recording & receipts
├── allocations/       # Allocation management
├── utils/             # Shared test utilities
│   ├── login.ts       # Login helpers & test users
│   ├── seed.ts        # Database seeding utilities
│   └── helpers.ts     # Common test helpers
└── coverage-goals.md  # Test coverage roadmap
```

## Getting Started

### Prerequisites

1. **Test Environment Variables**
   ```bash
   # In .env.test.local
   TEST_MODE=true
   NEXT_PUBLIC_TEST_SCHEMA=test
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   BASE_URL=http://localhost:3001
   ```

2. **Test Database Setup**
   - Ensure test schema exists in Supabase
   - Run database migrations
   - Seed test data

3. **Test Users**
   The following test users must exist in your test database:
   - `admin@test.com` (SysAdmin)
   - `agent@test.com` (Agent)
   - `frontdesk@test.com` (Frontdesk)
   - `ceo@test.com` (CEO)
   - `md@test.com` (MD)
   
   All test users use password: `password123`

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
npx playwright test apps/web/tests/e2e/auth/login.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests with UI mode (recommended for development)
npx playwright test --ui

# Run tests for specific browser
npx playwright test --project=chromium

# Debug a specific test
npx playwright test --debug apps/web/tests/e2e/auth/login.spec.ts
```

### Full E2E Test Flow

```bash
# Complete test run with database reset
./scripts/run-e2e.sh
```

This script:
1. Verifies Supabase is running
2. Resets the test database
3. Seeds test data
4. Runs Playwright tests with TEST_MODE=true

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../utils/login';
import { navigateTo, generateTestData } from '../utils/helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Login as appropriate role
    await loginAs(page, 'admin');
    
    // Navigate to feature page
    await navigateTo(page, 'customers');
  });

  test('should perform action', async ({ page }) => {
    // Arrange
    const testData = generateTestData();
    
    // Act
    await page.click('button[name="action"]');
    await page.fill('input[name="field"]', testData.name);
    
    // Assert
    await expect(page.locator('table')).toContainText(testData.name);
  });
});
```

### Using Test Utilities

#### Login Helper
```typescript
import { loginAs } from '../utils/login';

// Login as admin (redirects to /dashboard/analytics)
await loginAs(page, 'admin');

// Login as agent (redirects to /dashboard)
await loginAs(page, 'agent');

// Login with custom credentials
await loginWithCredentials(page, 'user@test.com', 'password', true);
```

#### Navigation Helper
```typescript
import { navigateTo } from '../utils/helpers';

await navigateTo(page, 'customers');
await navigateTo(page, 'allocations');
await navigateTo(page, 'payments');
```

#### Data Generation
```typescript
import { generateTestData } from '../utils/helpers';

const testData = generateTestData();
// Returns: { timestamp, name, email, phone }
```

#### Toast Notifications
```typescript
import { waitForToast } from '../utils/helpers';

await waitForToast(page, /success/i);
await waitForToast(page, 'Customer created');
```

## Test Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `test.beforeEach` for setup
- Clean up after tests (handled by test schema reset)

### 2. Selectors
Prefer semantic selectors in this order:
1. Role-based: `getByRole('button', { name: /submit/i })`
2. Label-based: `getByLabel(/email/i)`
3. Placeholder: `getByPlaceholder(/search/i)`
4. Test IDs: `getByTestId('customer-table')`
5. CSS (last resort): `locator('button.submit')`

### 3. Assertions
```typescript
// Wait for elements
await expect(page.getByText('Welcome')).toBeVisible();

// Check URLs
await expect(page).toHaveURL('/dashboard');

// Check content
await expect(page.locator('table')).toContainText('Customer Name');

// Check counts
expect(await page.locator('tr').count()).toBeGreaterThan(0);
```

### 4. Waiting Strategies
```typescript
// Wait for navigation
await page.waitForURL('/dashboard');

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for element
await page.waitForSelector('table');

// Custom timeout
await expect(element).toBeVisible({ timeout: 10000 });
```

### 5. Error Handling
```typescript
// Check if element exists before interacting
if (await button.isVisible()) {
  await button.click();
}

// Try-catch for optional actions
try {
  await page.click('button:has-text("Optional")');
} catch {
  // Element doesn't exist, continue
}
```

## Test Schema Isolation

All tests run against the isolated `test` schema in Supabase:
- ✅ Completely separate from production data
- ✅ RLS policies active but permissive for testing
- ✅ Reset before each test run
- ✅ Seeded with consistent test data

### How It Works

1. **Environment Detection**
   ```typescript
   // When TEST_MODE=true, client uses test schema
   const client = getSchemaClient(); // Returns test schema client
   ```

2. **Database Reset**
   ```bash
   # Before tests run
   ./scripts/run-e2e.sh
   ```

3. **Test Data Seeding**
   ```sql
   -- supabase/seed/test-data.sql
   -- Runs automatically before tests
   ```

## Debugging Tests

### Visual Debugging
```bash
# Run with headed browser
npx playwright test --headed --project=chromium

# Run with UI mode
npx playwright test --ui

# Debug specific test
npx playwright test --debug auth/login.spec.ts
```

### Screenshots & Videos
Failed tests automatically capture:
- Screenshots (saved to `test-results/`)
- Videos (when configured)
- Traces (for debugging)

### Manual Screenshots
```typescript
import { takeScreenshot } from '../utils/helpers';

await takeScreenshot(page, 'customer-form');
```

### Console Logs
```typescript
// Listen to console messages
page.on('console', msg => console.log('Browser:', msg.text()));

// Log network requests
page.on('request', request => console.log('>>', request.method(), request.url()));
page.on('response', response => console.log('<<', response.status(), response.url()));
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled nightly runs

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    TEST_MODE: true
    NEXT_PUBLIC_TEST_SCHEMA: test
```

## Test Data

### Test Users
Located in `utils/login.ts`:
- admin@test.com - Full system access
- agent@test.com - Agent features only
- frontdesk@test.com - Customer & payment access
- ceo@test.com - Executive analytics
- md@test.com - Executive analytics

### Seeded Data
- ~20 test customers
- ~10 test allocations
- ~15 test payments
- ~5 test field reports

## Coverage Goals

See [coverage-goals.md](./coverage-goals.md) for detailed roadmap.

**Current Status:**
- Authentication: 70% ✅
- Navigation: 60% ✅
- Customer Management: 50% 🚧
- Payments: 40% 🚧

**Target:** 90% coverage within 3 months

## Troubleshooting

### Tests fail with "Test timeout"
- Increase timeout in test or globally in `playwright.config.ts`
- Check if dev server is running
- Verify network connectivity

### Tests fail with "Element not found"
- Check if element selector is correct
- Ensure page has loaded completely
- Add explicit waits

### Tests fail randomly (flaky)
- Add proper waits instead of `page.waitForTimeout()`
- Use `waitForLoadState('networkidle')`
- Check for race conditions

### Database issues
- Ensure TEST_MODE=true
- Verify test schema exists
- Run database reset manually

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Acrely Coverage Goals](./coverage-goals.md)
- [Test Environment Setup Guide](../../../E2E_TESTING_GUIDE.md)

## Support

For issues or questions:
1. Check existing tests for examples
2. Review Playwright docs
3. Ask in team chat
4. Create issue in project tracker

---

**Last Updated:** November 14, 2025  
**Maintainer:** Engineering Team
