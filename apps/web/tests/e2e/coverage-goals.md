# Acrely E2E Test Coverage Goals

## Overview
This document outlines the comprehensive testing strategy for the Acrely platform, with clear coverage goals and milestones.

---

## Phase 1 — Core Functionality (Foundation)
**Target Coverage: 70% by MVP Launch**

### Authentication & Authorization ✅
- [x] Login with valid credentials (all roles)
- [x] Login with invalid credentials
- [x] Session persistence on page reload
- [x] Redirect unauthenticated users
- [ ] Logout functionality
- [ ] Password reset flow

### Dashboard Navigation ✅
- [x] Navigate to all main sections
- [x] Role-based navigation visibility
- [x] Mobile responsive navigation
- [ ] Sidebar collapse/expand
- [ ] Quick actions menu

### Customer Management (CRUD) 🚧
- [x] Create customer with full details
- [x] Create customer with minimal fields
- [x] Validate required fields
- [x] Validate email and phone formats
- [ ] Edit existing customer
- [ ] Delete customer
- [ ] Search customers
- [ ] Filter customers
- [ ] Export customer list

### Payment Recording ✅
- [x] Record payment (Agent)
- [x] View payment history
- [x] Validate payment amount
- [ ] View receipt
- [ ] Download receipt PDF
- [ ] Send receipt via SMS
- [ ] Filter payments by date
- [ ] Export payment reports

### Allocations
- [ ] Create new allocation
- [ ] Assign plot to customer
- [ ] Update allocation status
- [ ] View allocation history
- [ ] Validate allocation rules
- [ ] Search allocations

---

## Phase 2 — Agent Features
**Target Coverage: 80% within 1 month post-launch**

### Field Reports
- [ ] Agent submits daily report
- [ ] View report history
- [ ] Admin reviews reports
- [ ] Flag reports for review
- [ ] Filter reports by status
- [ ] Export reports

### Commission Tracking
- [ ] View commission dashboard
- [ ] Calculate commission by period
- [ ] Submit commission claim
- [ ] Track claim status
- [ ] View commission history

### Agent Dashboard
- [ ] View personal metrics
- [ ] Track allocated customers
- [ ] Monitor payment collections
- [ ] View performance charts

---

## Phase 3 — Admin Features
**Target Coverage: 90% within 3 months**

### Billing System
- [ ] View billing dashboard
- [ ] Generate billing summaries
- [ ] Filter by month/year
- [ ] Export billing reports
- [ ] Track commission payouts

### Reports System
- [ ] Generate customer reports
- [ ] Generate payment reports
- [ ] Generate allocation reports
- [ ] Custom date range reports
- [ ] Export to PDF/CSV

### User Management
- [ ] Create new user
- [ ] Edit user profile
- [ ] Deactivate user
- [ ] Reset user password
- [ ] Assign user roles
- [ ] View user activity

### Audit Logs
- [ ] View audit log entries
- [ ] Filter by entity type
- [ ] Filter by user
- [ ] Filter by date range
- [ ] Search audit logs
- [ ] Export audit logs

### System Dashboard
- [ ] View system health metrics
- [ ] Monitor database performance
- [ ] View cron job logs
- [ ] Check backup status
- [ ] Monitor storage usage

---

## Phase 4 — Advanced Features
**Target Coverage: 95% within 6 months**

### Analytics Dashboard
- [ ] View KPI summary cards
- [ ] Revenue trends chart
- [ ] Payment distribution chart
- [ ] Agent performance metrics
- [ ] Export analytics data
- [ ] Filter by time period

### Mobile Responsiveness
- [ ] Test all pages on mobile
- [ ] Mobile navigation
- [ ] Touch interactions
- [ ] Mobile forms
- [ ] Mobile tables

### Performance & Security
- [ ] Page load performance
- [ ] API response times
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] RLS policy enforcement

### Integration Tests
- [ ] Customer → Allocation → Payment flow
- [ ] Receipt generation flow
- [ ] SMS notification flow
- [ ] Email notification flow
- [ ] Report generation flow

---

## Test Environment Setup

### Prerequisites
- ✅ Test database schema isolated
- ✅ Test user credentials configured
- ✅ Environment variables set
- [ ] Test data seeding automated
- [ ] Database reset script working

### Test Users
```
admin@test.com      - SysAdmin
agent@test.com      - Agent
frontdesk@test.com  - Frontdesk
ceo@test.com        - CEO
md@test.com         - MD
```

---

## Coverage Metrics

### Current Status
- **Authentication**: 70% ✅
- **Navigation**: 60% ✅
- **Customer Management**: 50% 🚧
- **Payments**: 40% 🚧
- **Allocations**: 0% ❌
- **Reports**: 0% ❌
- **Admin Features**: 0% ❌

### Target Milestones
1. **Week 1**: Core authentication & navigation (70%)
2. **Week 2**: Customer CRUD & payments (70%)
3. **Week 3**: Allocations & field reports (75%)
4. **Month 1**: Agent features complete (80%)
5. **Month 2**: Admin features complete (85%)
6. **Month 3**: Full platform coverage (90%)

---

## Test Organization

### Directory Structure
```
apps/web/tests/e2e/
├── auth/              ✅ Login, logout, session
├── dashboard/         ✅ Navigation, widgets
├── customers/         ✅ CRUD operations
├── payments/          ✅ Recording, receipts
├── allocations/       ❌ Allocation management
├── reports/           ❌ Field reports
├── admin/             ❌ Admin-only features
├── analytics/         ❌ Analytics dashboard
└── utils/             ✅ Helpers, login, seed
```

---

## Quality Standards

### Every Test Should
- ✅ Use isolated test schema
- ✅ Clean up after execution
- ✅ Be independent (no dependencies)
- ✅ Have clear assertions
- ✅ Use reusable utilities
- ✅ Handle edge cases
- ✅ Include error scenarios

### Code Quality
- All tests use TypeScript
- Consistent naming conventions
- Well-documented test cases
- DRY principles applied
- Page Object Model considered

---

## Running Tests

### Local Development
```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e apps/web/tests/e2e/auth/login.spec.ts

# Run with UI mode
pnpm test:e2e:ui
```

### CI/CD Integration
- Tests run on every PR
- Parallel execution enabled
- Screenshots on failure
- Video recording on failure
- HTML report generated

---

## Success Criteria

### Definition of Done
- ✅ Test passes consistently
- ✅ No flaky tests
- ✅ Proper cleanup
- ✅ Clear failure messages
- ✅ Fast execution (<2s per test)

### Launch Checklist
- [ ] 70% coverage achieved
- [ ] All critical paths tested
- [ ] No failing tests
- [ ] CI/CD pipeline configured
- [ ] Test documentation complete

---

**Last Updated**: November 14, 2025  
**Owner**: Engineering Team  
**Status**: In Progress 🚧
