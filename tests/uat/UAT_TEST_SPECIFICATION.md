# Acrely v2 - User Acceptance Testing (UAT) Specification

**Version:** 2.0.0  
**Author:** Kennedy — Landon Digital  
**Target:** Pinnacle Builders Homes & Properties  
**Date:** November 11, 2025

---

## UAT Overview

This document outlines the User Acceptance Testing procedures for Acrely v2 production deployment. All tests must pass before the system is approved for go-live.

### Test Environment
- **URL:** https://acrely.pinnaclegroups.ng
- **Test Period:** 2-3 days before production launch
- **Test Users:** Representing all 4 user roles

### Test Objectives
1. Verify all features work as expected
2. Ensure role-based access control is enforced
3. Validate data integrity and security
4. Confirm system performance meets requirements
5. Test automated processes (SMS, receipts, reports)

---

## Test User Accounts

### 1. SysAdmin User
- **Email:** admin@pinnaclegroups.ng
- **Role:** SysAdmin
- **Access Level:** Full system access

### 2. CEO User
- **Email:** ceo@pinnaclegroups.ng
- **Role:** CEO
- **Access Level:** View all data, generate reports

### 3. Frontdesk User
- **Email:** frontdesk@pinnaclegroups.ng
- **Role:** Frontdesk
- **Access Level:** Customer management, payments, allocations

### 4. Agent User
- **Email:** agent@pinnaclegroups.ng
- **Role:** Agent
- **Access Level:** Limited to own allocations and commissions

---

## Test Suite 1: Authentication & Authorization

### Test Case 1.1: Login Functionality
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Navigate to https://acrely.pinnaclegroups.ng | Homepage loads | [ ] |
| 2 | Click "Login" or go to /dashboard | Redirected to login page | [ ] |
| 3 | Enter valid credentials | User logged in successfully | [ ] |
| 4 | Check dashboard loads | Dashboard displays correctly | [ ] |

### Test Case 1.2: Invalid Login
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Enter incorrect email | Error message displayed | [ ] |
| 2 | Enter incorrect password | Error message displayed | [ ] |
| 3 | Leave fields empty | Validation errors shown | [ ] |

### Test Case 1.3: Role-Based Access Control
**Priority:** Critical

| Role | Can Access | Cannot Access | Pass/Fail |
|------|-----------|---------------|-----------|
| SysAdmin | All modules, audit logs, settings | None | [ ] |
| CEO | All data, reports, billing | Settings, audit logs | [ ] |
| Frontdesk | Customers, payments, allocations | Admin, audit, system | [ ] |
| Agent | Own allocations, own commissions | Others' data, reports | [ ] |

### Test Case 1.4: Session Management
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Login and stay idle for 24 hours | Session expires, redirected to login | [ ] |
| 2 | Login on multiple devices | Works correctly | [ ] |
| 3 | Logout | Session cleared, redirected to home | [ ] |

---

## Test Suite 2: Customer Management

### Test Case 2.1: Create Customer (Frontdesk)
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Login as Frontdesk | Dashboard loads | [ ] |
| 2 | Navigate to Customers | Customer list displayed | [ ] |
| 3 | Click "Add Customer" | Form opens | [ ] |
| 4 | Fill in customer details | All fields accept input | [ ] |
| 5 | Submit form | Customer created successfully | [ ] |
| 6 | Verify customer appears in list | Customer visible in table | [ ] |
| 7 | Check audit log | Action logged with timestamp | [ ] |

**Test Data:**
- Full Name: Test Customer UAT
- Email: test.customer@example.com
- Phone: +2348012345678
- Address: 123 Test Street, Lagos

### Test Case 2.2: Edit Customer
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Find test customer | Customer found in list | [ ] |
| 2 | Click edit button | Edit form opens with data | [ ] |
| 3 | Modify phone number | Change accepted | [ ] |
| 4 | Save changes | Customer updated | [ ] |
| 5 | Verify changes | New phone number displayed | [ ] |

### Test Case 2.3: Search Customer
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Use search box | Search input responsive | [ ] |
| 2 | Search by name | Correct results shown | [ ] |
| 3 | Search by phone | Correct results shown | [ ] |
| 4 | Search by email | Correct results shown | [ ] |
| 5 | Invalid search term | No results or appropriate message | [ ] |

### Test Case 2.4: Delete Customer (Validation)
**Priority:** Medium

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Try to delete customer with allocations | Deletion blocked | [ ] |
| 2 | Appropriate error message shown | Message explains why | [ ] |

---

## Test Suite 3: Allocations Management

### Test Case 3.1: Create Allocation (Frontdesk)
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Navigate to Allocations | Allocation list displayed | [ ] |
| 2 | Click "New Allocation" | Form opens | [ ] |
| 3 | Select customer | Dropdown works | [ ] |
| 4 | Select estate | Dropdown works | [ ] |
| 5 | Select plot | Only available plots shown | [ ] |
| 6 | Select agent | Agent list loaded | [ ] |
| 7 | Set price and terms | Values accepted | [ ] |
| 8 | Submit | Allocation created | [ ] |
| 9 | Verify plot marked as allocated | Plot status updated | [ ] |
| 10 | Check commission calculated | Agent commission created | [ ] |

**Test Data:**
- Customer: Test Customer UAT
- Estate: Any available estate
- Plot: Any available plot
- Agent: Test Agent
- Price: ₦5,000,000
- Initial Payment: ₦1,000,000

### Test Case 3.2: View Allocation Details
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Click on allocation | Details displayed | [ ] |
| 2 | Check customer info | Correct customer shown | [ ] |
| 3 | Check payment history | Payments listed | [ ] |
| 4 | Check balance | Balance calculated correctly | [ ] |

### Test Case 3.3: Agent View Own Allocations
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Login as Agent | Dashboard loads | [ ] |
| 2 | Navigate to Allocations | Only own allocations shown | [ ] |
| 3 | Try to view other agent's allocation | Access denied or not visible | [ ] |

---

## Test Suite 4: Payment Processing

### Test Case 4.1: Record Payment (Frontdesk)
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Navigate to Payments | Payment list displayed | [ ] |
| 2 | Click "Record Payment" | Form opens | [ ] |
| 3 | Select customer | Customer selected | [ ] |
| 4 | Select allocation | Allocation selected | [ ] |
| 5 | Enter amount | Amount accepted | [ ] |
| 6 | Select payment method | Method selected | [ ] |
| 7 | Add reference | Reference entered | [ ] |
| 8 | Submit payment | Payment recorded | [ ] |
| 9 | Check balance updated | Balance reduced correctly | [ ] |
| 10 | Verify receipt generated | Receipt created | [ ] |
| 11 | Check SMS sent | SMS queued/sent | [ ] |

**Test Data:**
- Customer: Test Customer UAT
- Amount: ₦500,000
- Method: Bank Transfer
- Reference: TEST-REF-001

### Test Case 4.2: Receipt Generation
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | After payment recorded | Receipt auto-generated | [ ] |
| 2 | View receipt | PDF opens correctly | [ ] |
| 3 | Check receipt contains | Company name, logo, details | [ ] |
| 4 | Verify payment details | Amount, date, reference correct | [ ] |
| 5 | Check customer details | Name, phone correct | [ ] |
| 6 | Download receipt | PDF downloads successfully | [ ] |

### Test Case 4.3: SMS Notification
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | After payment recorded | SMS queued | [ ] |
| 2 | Wait for processing | SMS sent within 5 minutes | [ ] |
| 3 | Check SMS content | Contains payment amount, receipt link | [ ] |
| 4 | Verify sender ID | Shows "Pinnacle" or configured ID | [ ] |

---

## Test Suite 5: Commission Management

### Test Case 5.1: Commission Calculation
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Create allocation with agent | Commission auto-calculated | [ ] |
| 2 | Check commission amount | 5% of sale price (default) | [ ] |
| 3 | Verify commission status | Set to "Pending" | [ ] |

### Test Case 5.2: Commission Claim (Agent)
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Login as Agent | Dashboard loads | [ ] |
| 2 | Navigate to Commissions | Own commissions listed | [ ] |
| 3 | Filter by status | Filtering works | [ ] |
| 4 | View commission details | Amount, allocation shown | [ ] |
| 5 | Check can claim eligible | Claim button available | [ ] |

### Test Case 5.3: Commission Approval (CEO)
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Login as CEO | Dashboard loads | [ ] |
| 2 | Navigate to Commissions | All commissions visible | [ ] |
| 3 | Filter pending claims | Shows pending only | [ ] |
| 4 | Approve commission | Status changes to "Approved" | [ ] |
| 5 | Check audit log | Approval logged | [ ] |

---

## Test Suite 6: Reports & Analytics

### Test Case 6.1: Sales Report (CEO)
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Login as CEO | Dashboard loads | [ ] |
| 2 | Navigate to Reports | Reports page loads | [ ] |
| 3 | Select "Sales Report" | Report form shown | [ ] |
| 4 | Select date range | Date picker works | [ ] |
| 5 | Generate report | Report displays | [ ] |
| 6 | Verify data accuracy | Numbers match database | [ ] |
| 7 | Export to CSV | CSV downloads correctly | [ ] |

### Test Case 6.2: Payment Report
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Select "Payment Report" | Report form shown | [ ] |
| 2 | Filter by date range | Filters apply | [ ] |
| 3 | Filter by payment method | Filters apply | [ ] |
| 4 | Generate report | Report displays | [ ] |
| 5 | Verify totals | Calculations correct | [ ] |
| 6 | Export to PDF | PDF downloads | [ ] |

### Test Case 6.3: Billing Summary
**Priority:** Critical

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Navigate to Billing | Billing page loads | [ ] |
| 2 | Select period (monthly) | Period selected | [ ] |
| 3 | Generate summary | Summary generated | [ ] |
| 4 | Check includes | Total sales, payments, outstanding | [ ] |
| 5 | Verify calculations | All numbers accurate | [ ] |
| 6 | Export summary | Excel/CSV downloads | [ ] |

---

## Test Suite 7: Audit System

### Test Case 7.1: Audit Logs (SysAdmin)
**Priority:** High

| Step | Action | Expected Result | Pass/Fail |
|------|--------|----------------|-----------|
| 1 | Login as SysAdmin | Dashboard loads | [ ] |
| 2 | Navigate to Audit Logs | Logs displayed | [ ] |
| 3 | Verify recent actions logged | All actions captured | [ ] |
| 4 | Check log details | User, action, timestamp, changes | [ ] |
| 5 | Search logs | Search works | [ ] |
| 6 | Filter by user | Filter works | [ ] |
| 7 | Filter by date | Filter works | [ ] |

### Test Case 7.2: Audit Trail Completeness
**Priority:** Critical

Verify these actions are logged:
- [ ] User login
- [ ] Customer creation
- [ ] Customer update
- [ ] Allocation creation
- [ ] Payment recording
- [ ] Receipt generation
- [ ] Commission claim
- [ ] Commission approval
- [ ] Settings changes

---

## Test Suite 8: System Performance

### Test Case 8.1: Page Load Times
**Priority:** High

| Page | Max Load Time | Actual Time | Pass/Fail |
|------|---------------|-------------|-----------|
| Homepage | 2s | | [ ] |
| Dashboard | 2s | | [ ] |
| Customers List | 3s | | [ ] |
| Allocations List | 3s | | [ ] |
| Payments List | 3s | | [ ] |
| Reports | 5s | | [ ] |

### Test Case 8.2: Large Data Sets
**Priority:** Medium

| Action | Dataset Size | Max Time | Pass/Fail |
|--------|--------------|----------|-----------|
| Load 1000 customers | 1000 rows | 3s | [ ] |
| Search in 1000 customers | 1000 rows | 1s | [ ] |
| Load 500 allocations | 500 rows | 3s | [ ] |
| Generate report (1 year) | 365 days | 10s | [ ] |

### Test Case 8.3: Concurrent Users
**Priority:** High

| Users | Action | Expected Result | Pass/Fail |
|-------|--------|----------------|-----------|
| 5 | All creating customers | No conflicts | [ ] |
| 10 | All viewing dashboard | Performance maintained | [ ] |
| 3 | Recording payments simultaneously | All succeed | [ ] |

---

## Test Suite 9: Mobile Responsiveness

### Test Case 9.1: Mobile Devices
**Priority:** Medium

| Device | Screen Size | Layout | Functionality | Pass/Fail |
|--------|-------------|--------|---------------|-----------|
| iPhone 14 Pro | 393×852 | Responsive | All features work | [ ] |
| Samsung Galaxy S21 | 360×800 | Responsive | All features work | [ ] |
| iPad Air | 820×1180 | Responsive | All features work | [ ] |

### Test Case 9.2: Tablet Devices
**Priority:** Medium

| Action | Expected Result | Pass/Fail |
|--------|----------------|-----------|
| Navigate all menus | Menus accessible | [ ] |
| Create customer | Form usable | [ ] |
| Record payment | Form usable | [ ] |
| View reports | Charts readable | [ ] |

---

## Test Suite 10: Error Handling

### Test Case 10.1: Network Errors
**Priority:** High

| Scenario | Expected Result | Pass/Fail |
|----------|----------------|-----------|
| Slow network | Loading indicators shown | [ ] |
| Lost connection | Error message displayed | [ ] |
| API timeout | Graceful error handling | [ ] |

### Test Case 10.2: Validation Errors
**Priority:** High

| Field | Invalid Input | Error Message | Pass/Fail |
|-------|---------------|---------------|-----------|
| Email | invalid@email | "Invalid email format" | [ ] |
| Phone | 12345 | "Invalid phone number" | [ ] |
| Amount | -100 | "Amount must be positive" | [ ] |
| Required field | Empty | "Field is required" | [ ] |

---

## Test Suite 11: Automated Processes

### Test Case 11.1: Cron Jobs
**Priority:** Critical

| Job | Schedule | Expected Result | Pass/Fail |
|-----|----------|----------------|-----------|
| System health check | Hourly | Runs successfully | [ ] |
| Database backup | Daily 2 AM | Backup created | [ ] |
| Overdue payments | Daily 8 AM | Reminders sent | [ ] |
| Billing summary | Monthly 1st | Summary generated | [ ] |
| SMS queue | Every 5 min | Queue processed | [ ] |

### Test Case 11.2: Queue Processing
**Priority:** High

| Queue | Item Count | Processing Time | Pass/Fail |
|-------|------------|-----------------|-----------|
| SMS Queue | 10 messages | < 30 seconds | [ ] |
| Receipt Queue | 5 receipts | < 1 minute | [ ] |

---

## Test Suite 12: Security Testing

### Test Case 12.1: SQL Injection
**Priority:** Critical

| Input Field | Malicious Input | Expected Result | Pass/Fail |
|-------------|-----------------|----------------|-----------|
| Search | `' OR '1'='1` | No data leak | [ ] |
| Login email | `admin'--` | Login fails | [ ] |

### Test Case 12.2: XSS Protection
**Priority:** Critical

| Input Field | Script Input | Expected Result | Pass/Fail |
|-------------|--------------|----------------|-----------|
| Customer name | `<script>alert('XSS')</script>` | Script escaped | [ ] |
| Address | `<img src=x onerror=alert(1)>` | Image not executed | [ ] |

### Test Case 12.3: Authorization Bypass
**Priority:** Critical

| Attempt | Expected Result | Pass/Fail |
|---------|----------------|-----------|
| Agent accessing CEO reports | Access denied | [ ] |
| Frontdesk modifying settings | Access denied | [ ] |
| Unauthenticated API calls | 401 Unauthorized | [ ] |

---

## UAT Sign-off

### Testing Summary

**Total Test Cases:** ___________  
**Tests Passed:** ___________  
**Tests Failed:** ___________  
**Tests Skipped:** ___________  
**Pass Rate:** ___________%

### Critical Issues Found
1. _______________________________________________________________________
2. _______________________________________________________________________
3. _______________________________________________________________________

### Recommendations
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

### Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| SysAdmin Tester | | | |
| CEO Tester | | | |
| Frontdesk Tester | | | |
| Agent Tester | | | |
| Project Manager | | | |
| Technical Lead | | | |

### Go-Live Decision

- [ ] **APPROVED** - All critical tests passed, system ready for production
- [ ] **APPROVED WITH CONDITIONS** - Minor issues to be fixed post-launch
- [ ] **REJECTED** - Critical issues must be resolved before go-live

**Final Approval By:** _____________________

**Date:** _____________________

**Signature:** _____________________

---

**Document Version:** 1.0  
**Last Updated:** November 11, 2025
