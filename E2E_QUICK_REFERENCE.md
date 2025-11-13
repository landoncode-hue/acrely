# 🎯 Acrely V2 E2E Testing - Quick Reference

## 🚀 Quick Commands

### Run All Tests
```bash
pnpm test:e2e                  # Run all E2E tests
pnpm test:e2e:master           # Run master orchestrator (recommended)
pnpm test:e2e:ui               # Open Playwright UI
pnpm test:e2e:report           # View last test report
```

### Run Specific Tests
```bash
pnpm test:e2e:auth             # Authentication tests
pnpm test:e2e:api              # API validation
pnpm test:e2e:supabase         # Supabase connectivity
pnpm test:e2e:roles            # Role-based access control
pnpm test:e2e:mobile-sync      # Mobile-web sync
pnpm test:e2e:regression       # Regression suite
pnpm test:e2e:production       # Production readiness
pnpm test:e2e:critical         # Critical path
```

### Debug Mode
```bash
pnpm test:e2e:headed           # See browser window
pnpm test:e2e:debug            # Step-through debugging
```

---

## 📁 Test Files

| File | Tests | Description |
|------|-------|-------------|
| `auth.spec.ts` | 6 | Login, logout, session |
| `critical-path.spec.ts` | 4 | End-to-end workflows |
| `customers.spec.ts` | 5 | Customer CRUD |
| `billing-dashboard.spec.ts` | 8 | Billing system |
| `payments.spec.ts` | 4 | Payment processing |
| `receipts.spec.ts` | 10 | Receipt generation |
| `audit-dashboard.spec.ts` | 7 | Audit logging |
| `field-reports.spec.ts` | 12 | Field reports |
| `reports.spec.ts` | 6 | Analytics |
| `api-validation.spec.ts` | 10 | API endpoints |
| `supabase-connectivity.spec.ts` | 14 | Database & sync |
| `role-access-control.spec.ts` | 10 | RBAC testing |
| `mobile-web-sync.spec.ts` | 8 | Cross-platform sync |
| `production-readiness.spec.ts` | 20 | Production checks |
| `regression-suite.spec.ts` | 23 | Regression tests |

**Total:** 15 test suites, 100+ test cases

---

## 👥 Test Users

| Role | Email | Password |
|------|-------|----------|
| SysAdmin | `admin@pinnaclegroups.ng` | `Test@123` |
| CEO | `ceo@pinnaclegroups.ng` | `Test@123` |
| MD | `md@pinnaclegroups.ng` | `Test@123` |
| Frontdesk | `frontdesk@pinnaclegroups.ng` | `Test@123` |
| Agent | `agent@pinnaclegroups.ng` | `Test@123` |

---

## 🎯 15 Quest Checklist

- [ ] **auth** - Authentication Flow
- [ ] **dashboard** - Dashboard & Navigation
- [ ] **customers** - Customer Management
- [ ] **billing** - Billing System
- [ ] **payments** - Payment Processing
- [ ] **receipts** - Receipt Generation
- [ ] **audit_system** - Audit Logging
- [ ] **field_reports** - Field Reports
- [ ] **reports** - Analytics & Reports
- [ ] **roles** - Role-Based Access Control
- [ ] **api_validation** - API Endpoints
- [ ] **supabase_connectivity** - Database & Sync
- [ ] **mobile_sync** - Mobile-Web Sync
- [ ] **regression_suite** - Regression Testing
- [ ] **production_readiness** - Production Checks

---

## 📊 Success Criteria

✅ All required quests pass  
✅ No API errors  
✅ No Supabase errors  
✅ Build passes health checks  
✅ All flows validated  

---

## 🛠️ Prerequisites

1. **Dev Server Running:**
   ```bash
   pnpm dev
   ```

2. **Environment Variables Set:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Supabase Accessible:**
   - Database online
   - Auth configured
   - RLS policies active

---

## 📈 Master Orchestrator Output

```
🚀 ACRELY V2 - E2E MASTER VALIDATION SYSTEM
============================================================

🎯 Running Quest: Authentication Flow
✅ PASS: 6/6 tests passed (3.21s)

🎯 Running Quest: API Validation
✅ PASS: 10/10 tests passed (2.45s)

============================================================
📊 E2E VALIDATION REPORT
============================================================

📈 SUMMARY:
   Total Quests: 15
   ✅ Passed: 15
   ❌ Failed: 0
   ⏭️  Skipped: 0

🏆 OVERALL STATUS: ✅ PASS
============================================================

💾 Report saved to: test-results/e2e-master-report.json
```

---

## 🐛 Common Issues

### Tests Won't Start
```bash
# Check dev server is running
pnpm dev

# Verify environment variables
pnpm verify:env
```

### Authentication Failures
```bash
# Clear Playwright state
rm -rf playwright/.auth

# Run auth tests only
pnpm test:e2e:auth
```

### Timeout Errors
```bash
# Increase timeout (in playwright.config.ts)
timeout: 60000  # 60 seconds

# Or run with more time
BASE_URL=http://localhost:3000 pnpm test:e2e
```

### Supabase Connection
```bash
# Test Supabase connectivity
pnpm test:e2e:supabase

# Check Supabase status
# Visit: https://app.supabase.com
```

---

## 📚 Full Documentation

- **Complete Guide:** `E2E_TESTING_GUIDE.md`
- **Implementation:** `E2E_QUEST_COMPLETE.md`
- **Playwright Docs:** https://playwright.dev

---

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: pnpm test:e2e:master
  
- name: Upload Report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: e2e-report
    path: test-results/
```

---

## 📞 Quick Help

1. **Can't find test?** → Check `tests/e2e/` directory
2. **Test failing?** → Run with `--headed` to see browser
3. **Slow tests?** → Check network/Supabase latency
4. **Need debug?** → Use `pnpm test:e2e:debug`

---

**Quick Reference v2.0.0**  
**Last Updated:** January 13, 2025
