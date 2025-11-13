# Acrely V2 - E2E Testing System 🧪

## Overview

Comprehensive end-to-end testing system for Acrely V2 platform, validating web, mobile, backend, and Supabase subsystems.

**Version:** 2.0.0  
**Owner:** Captain Rhapsody  
**Test Framework:** Playwright

---

## 📁 Test Suite Structure

### Core Test Files

| Quest ID | Test File | Description | Status |
|----------|-----------|-------------|--------|
| `auth` | `auth.spec.ts` | Authentication & session management | ✅ Existing |
| `dashboard` | `critical-path.spec.ts` | Dashboard & critical workflows | ✅ Existing |
| `customers` | `customers.spec.ts` | Customer CRUD operations | ✅ Existing |
| `billing` | `billing-dashboard.spec.ts` | Billing system tests | ✅ Existing |
| `payments` | `payments.spec.ts` | Payment processing | ✅ Existing |
| `receipts` | `receipts.spec.ts` | Receipt generation & viewing | ✅ Existing |
| `audit_system` | `audit-dashboard.spec.ts` | Audit logging system | ✅ Existing |
| `field_reports` | `field-reports.spec.ts` | Field report management | ✅ Existing |
| `reports` | `reports.spec.ts` | Analytics & reporting | ✅ Existing |
| `roles` | `role-access-control.spec.ts` | RBAC validation | ✅ New |
| `api_validation` | `api-validation.spec.ts` | API endpoint testing | ✅ New |
| `supabase_connectivity` | `supabase-connectivity.spec.ts` | Database & real-time sync | ✅ New |
| `mobile_sync` | `mobile-web-sync.spec.ts` | Mobile-web synchronization | ✅ New |
| `regression_suite` | `regression-suite.spec.ts` | Regression testing | ✅ New |
| `production_readiness` | `production-readiness.spec.ts` | Production deployment checks | ✅ New |

---

## 🚀 Quick Start

### Run All Tests
```bash
pnpm test:e2e
```

### Run Master E2E Suite
```bash
pnpm test:e2e:master
```

### Run Specific Quest
```bash
pnpm test:e2e tests/e2e/auth.spec.ts
pnpm test:e2e tests/e2e/api-validation.spec.ts
pnpm test:e2e tests/e2e/supabase-connectivity.spec.ts
```

### Run with UI Mode
```bash
pnpm test:e2e:ui
```

### View Test Report
```bash
pnpm test:e2e:report
```

---

## 🎯 Quest Definitions

### 1. Authentication (`auth`)
**Actions:**
- Open login page
- Input credentials
- Submit login
- Verify redirect to dashboard
- Check session persistence
- Test logout

**Success Criteria:**
- User authenticated successfully
- JWT token fetched
- Supabase session created
- Session persists across reloads

---

### 2. Dashboard (`dashboard`)
**Actions:**
- Load dashboard
- Verify monthly stats visible
- Check recent activities loaded
- Test navigation

**Success Criteria:**
- Dashboard loads within 2s
- All metrics visible
- No console errors

---

### 3. Customers (`customers`)
**Actions:**
- Navigate to customers page
- Create new customer
- Search for customer
- Edit customer details
- Verify data persistence

**Success Criteria:**
- Customer CRUD operations work
- Search functionality works
- Data syncs to Supabase

---

### 4. Billing (`billing`)
**Actions:**
- Navigate to billing
- Create new bill
- Link to customer/plot
- Verify bill calculation

**Success Criteria:**
- Bills created successfully
- Calculations accurate
- Data persists

---

### 5. Payments (`payments`)
**Actions:**
- Record new payment
- Link to allocation
- Verify receipt generation
- Check payment status

**Success Criteria:**
- Payments recorded
- Receipts auto-generated
- SMS notifications sent

---

### 6. Receipts (`receipts`)
**Actions:**
- View receipt list
- Generate PDF receipt
- Verify receipt details
- Test receipt storage

**Success Criteria:**
- Receipts generated correctly
- PDFs downloadable
- Storage bucket accessible

---

### 7. Audit System (`audit_system`)
**Actions:**
- View audit logs
- Filter by date/user
- Verify log entries
- Test audit triggers

**Success Criteria:**
- All actions logged
- Logs timestamped correctly
- User actions tracked

---

### 8. Field Reports (`field_reports`)
**Actions:**
- Create field report
- Upload images
- Submit report
- View report history

**Success Criteria:**
- Reports saved successfully
- Images uploaded
- Agent performance tracked

---

### 9. Reports & Analytics (`reports`)
**Actions:**
- Load analytics dashboard
- View charts
- Export CSV
- Filter data

**Success Criteria:**
- Charts render correctly
- Export functionality works
- Data accurate

---

### 10. Role-Based Access Control (`roles`)
**Actions:**
- Login as different roles (CEO, MD, SysAdmin, Frontdesk, Agent)
- Verify role-specific UI
- Test permission restrictions
- Check data filtering

**Success Criteria:**
- Each role sees appropriate UI
- Unauthorized access blocked
- Data filtered by role

**Test Users:**
- CEO: `ceo@pinnaclegroups.ng`
- MD: `md@pinnaclegroups.ng`
- SysAdmin: `admin@pinnaclegroups.ng`
- Frontdesk: `frontdesk@pinnaclegroups.ng`
- Agent: `agent@pinnaclegroups.ng`

---

### 11. API Validation (`api_validation`)
**Actions:**
- Test GET endpoints
- Test POST endpoints
- Verify authentication
- Check error handling

**Success Criteria:**
- All endpoints return 200
- Unauthorized returns 401
- Invalid requests return 404

**Endpoints Tested:**
- `/api/audit`
- `/api/billing`
- `/api/customers`
- `/api/allocations`
- `/api/payments`
- `/api/receipts`
- `/api/field-reports`
- `/api/analytics`

---

### 12. Supabase Connectivity (`supabase_connectivity`)
**Actions:**
- Test database connection
- Query tables
- Test RPC functions
- Verify foreign keys
- Check data integrity

**Success Criteria:**
- Supabase online and responding
- All tables accessible
- RPC functions work
- Foreign keys enforced

---

### 13. Mobile-Web Sync (`mobile_sync`)
**Actions:**
- Create data on web
- Verify sync to mobile
- Test real-time updates
- Check concurrent updates

**Success Criteria:**
- Data syncs between platforms
- Real-time updates work
- No sync conflicts

---

### 14. Regression Suite (`regression_suite`)
**Actions:**
- Run all critical path tests
- Verify no breaking changes
- Test backward compatibility

**Success Criteria:**
- All critical flows unchanged
- No regression detected
- Performance maintained

---

### 15. Production Readiness (`production_readiness`)
**Actions:**
- Check environment variables
- Verify Supabase status
- Test API availability
- Check SSL/HTTPS
- Verify DNS configuration
- Test performance
- Check error handling

**Success Criteria:**
- Production deployment ready
- All external services healthy
- Performance meets SLA
- Error handling works

---

## 📊 Test Execution

### Master Orchestrator

The master orchestrator runs all quests in sequence and generates a comprehensive report.

**Run Command:**
```bash
tsx scripts/run-e2e-master.ts
```

**Output:**
- Console progress logs
- JSON report: `test-results/e2e-master-report.json`
- Pass/Fail status for each quest
- Overall validation status

**Report Format:**
```json
{
  "version": "2.0.0",
  "timestamp": "2025-01-13T12:00:00.000Z",
  "duration": 180000,
  "overallStatus": "PASS",
  "summary": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "skipped": 0
  },
  "results": [...]
}
```

---

## 🛠️ Configuration

### Playwright Config
**File:** `playwright.config.ts`

**Key Settings:**
- **Base URL:** `http://localhost:3000` (configurable via `BASE_URL` env)
- **Browsers:** Chromium, Firefox, WebKit
- **Mobile:** Pixel 5, iPhone 12
- **Reporters:** HTML, JSON, List
- **Retries:** 2 on CI, 0 locally

### Environment Variables

Required for testing:
```bash
BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📈 Success Criteria

### Master Quest Success
✅ All subquests return PASS  
✅ No API errors  
✅ No Supabase errors  
✅ Build passes health checks  
✅ All critical flows validated  

### Individual Quest Success
Each quest has specific success criteria (see quest definitions above)

---

## 🔧 Troubleshooting

### Tests Fail to Start
1. Ensure dev server is running: `pnpm dev`
2. Check environment variables
3. Verify Supabase connection

### Authentication Failures
1. Check test user credentials
2. Verify Supabase auth settings
3. Clear browser storage: `pnpm test:e2e --project=chromium --headed`

### Timeout Issues
1. Increase timeout in `playwright.config.ts`
2. Check network connectivity
3. Verify Supabase response times

### Flaky Tests
1. Add explicit waits: `await page.waitForTimeout(1000)`
2. Use `waitForLoadState('networkidle')`
3. Increase retry count for specific tests

---

## 📝 Writing New Tests

### Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('My Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('my test case', async ({ page }) => {
    // Test logic
    await page.goto('/dashboard/my-page');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

### Best Practices
1. Use semantic locators (role, label, text)
2. Add explicit waits for async operations
3. Clean up test data after tests
4. Use meaningful test names
5. Group related tests in describe blocks
6. Add comments for complex logic

---

## 🎬 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Acrely V2 Documentation](./README.md)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🏆 Quest Completion

When all quests pass:
```
🏆 OVERALL STATUS: ✅ PASS

All systems operational ✅
Production ready ✅
```

---

**Last Updated:** 2025-01-13  
**Maintained By:** Captain Rhapsody  
**Questions?** Check the main README or open an issue.
