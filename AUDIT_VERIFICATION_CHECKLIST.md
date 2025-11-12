# Audit System Verification Checklist

## Pre-Deployment Verification

### Database Migrations
- [ ] Run `pnpm supabase db push` successfully
- [ ] Verify `audit_logs` table has new columns (role, entity, entity_id, description, metadata)
- [ ] Confirm indexes are created (idx_audit_logs_entity_date, idx_audit_logs_role, idx_audit_logs_entity_id)
- [ ] Check `audit_logs_view` exists
- [ ] Verify all RPC functions are deployed:
  - [ ] `get_current_user_role()`
  - [ ] `log_audit_entry()`
  - [ ] `get_audit_logs()`
  - [ ] `get_recent_audit_activity()`
  - [ ] `get_audit_activity_stats()`
  - [ ] `system_health_check()`
  - [ ] `create_audit_log()`

### Triggers
- [ ] Verify triggers exist on:
  - [ ] customers
  - [ ] allocations
  - [ ] payments
  - [ ] receipts
  - [ ] users
  - [ ] estates
  - [ ] billing_summary

### Frontend Build
- [ ] Install dependencies: `pnpm install`
- [ ] Build succeeds: `pnpm build --filter=@acrely/web`
- [ ] No TypeScript errors
- [ ] All components compile successfully

---

## Post-Deployment Testing

### Access Control
- [ ] Log in as CEO → Can access `/dashboard/audit` ✅
- [ ] Log in as MD → Can access `/dashboard/audit` ✅
- [ ] Log in as SysAdmin → Can access `/dashboard/audit` ✅
- [ ] Log in as Agent → Cannot access `/dashboard/audit` (redirected) ✅
- [ ] Log in as Accountant → Cannot access `/dashboard/audit` (redirected) ✅

### Audit Dashboard Functionality
- [ ] Navigate to `/dashboard/audit`
- [ ] Page loads without errors
- [ ] Statistics cards display:
  - [ ] Total Logs
  - [ ] Creates
  - [ ] Updates
  - [ ] Deletes
- [ ] Audit table displays with columns:
  - [ ] Date & Time
  - [ ] User
  - [ ] Role
  - [ ] Action
  - [ ] Entity
  - [ ] Description
  - [ ] Actions (View button)

### Filtering & Search
- [ ] Entity filter dropdown works
- [ ] Action filter dropdown works
- [ ] Search bar filters results
- [ ] Date range picker works
- [ ] Refresh button reloads data
- [ ] Clear filters button works

### Details Modal
- [ ] Click "View" on any audit log
- [ ] Modal opens with three tabs:
  - [ ] Overview (shows timestamp, user, role, entity, description)
  - [ ] Changes (shows old vs new values)
  - [ ] Metadata (shows additional context)
- [ ] Close modal works

### CSV Export
- [ ] Click "Export CSV" button
- [ ] File downloads with format: `audit-logs-YYYY-MM-DD.csv`
- [ ] CSV contains correct data
- [ ] Headers match: Date, Time, User, Email, Role, Action, Entity, Entity ID, Description

### Admin Dashboard
- [ ] Navigate to `/dashboard/admin`
- [ ] System health cards display:
  - [ ] Total Users
  - [ ] Total Customers
  - [ ] Total Allocations
  - [ ] Total Payments
  - [ ] Pending Payments
  - [ ] Audit Logs (30d)
- [ ] Today's activity section displays:
  - [ ] Total Actions
  - [ ] Creates
  - [ ] Updates
  - [ ] Deletes
  - [ ] Most Active Entity
- [ ] Quick action buttons work

### Activity Feed
- [ ] Activity feed widget visible on dashboard
- [ ] Shows 5 most recent audit entries
- [ ] Live indicator present
- [ ] Action badges color-coded correctly
- [ ] Timestamps show "X minutes ago" format
- [ ] "View all activity" link navigates to `/dashboard/audit`

### Automatic Audit Logging
Test by performing CRUD operations:

#### Create Test
- [ ] Add new customer
- [ ] Check audit log shows INSERT action
- [ ] Verify `new_data` field contains customer details
- [ ] Confirm user_id and role are captured

#### Update Test
- [ ] Edit existing customer
- [ ] Check audit log shows UPDATE action
- [ ] Verify `old_data` and `new_data` fields populated
- [ ] Confirm "Changes" tab shows differences

#### Delete Test
- [ ] Soft delete a customer
- [ ] Check audit log shows UPDATE action (deleted_at set)
- [ ] Verify audit entry created

### Real-Time Updates
- [ ] Open activity feed
- [ ] Perform an action (e.g., create payment)
- [ ] Wait 30 seconds
- [ ] Verify new entry appears in activity feed

### Admin Actions Panel
- [ ] Navigate to admin actions
- [ ] Test password reset feature
- [ ] Test user deactivation (use test account)
- [ ] Test receipt regeneration
- [ ] Test SMS resend
- [ ] Verify confirmation modals appear
- [ ] Check audit logs for admin actions

---

## Performance Verification

### Database Performance
- [ ] Run query: `SELECT COUNT(*) FROM audit_logs;` → Should be fast
- [ ] Test filter query with date range → Response < 1s
- [ ] Test entity filter → Response < 1s
- [ ] Verify indexes are being used (check EXPLAIN output)

### Frontend Performance
- [ ] Audit page loads in < 3s
- [ ] Table renders smoothly with 100+ records
- [ ] Filtering/search feels responsive
- [ ] No console errors or warnings

---

## Security Verification

### RLS Policies
- [ ] Run as non-admin: `SELECT * FROM audit_logs;` → Should return 0 rows
- [ ] Run as admin: `SELECT * FROM audit_logs;` → Should return all rows
- [ ] Verify `audit_logs_view` respects RLS

### Data Integrity
- [ ] Audit logs cannot be deleted manually
- [ ] Audit logs cannot be updated manually
- [ ] User IDs are correctly linked
- [ ] Sensitive data (passwords) not logged

---

## Integration Testing

### Edge Functions
- [ ] Generate receipt → Audit log created
- [ ] Send SMS → Audit log created
- [ ] Calculate commissions → Audit log created
- [ ] Billing summary → Audit log created

### API Routes
- [ ] Test `/api/admin` endpoint (if implemented)
- [ ] Verify admin actions create audit entries

---

## Production Deployment Checklist

- [ ] Run full test suite: `pnpm test:e2e`
- [ ] All tests pass
- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Web app deployed successfully
- [ ] Health check passes: `system_health_check()`

---

## Rollback Plan

If issues occur:

1. **Database Rollback:**
   ```sql
   -- Disable triggers temporarily
   ALTER TABLE customers DISABLE TRIGGER audit_customers_trigger;
   ALTER TABLE allocations DISABLE TRIGGER audit_allocations_trigger;
   -- ... repeat for all tables
   ```

2. **Frontend Rollback:**
   - Remove audit route from sidebar
   - Redeploy previous version

3. **Full Rollback:**
   ```bash
   git revert <commit-hash>
   pnpm deploy:web
   ```

---

## Support Contacts

- **Technical Issues:** Kennedy — Landon Digital
- **Database Issues:** Check Supabase logs
- **Frontend Issues:** Check browser console and network tab

---

## Sign-Off

- [ ] All checklist items verified
- [ ] No critical issues found
- [ ] System ready for production
- [ ] Documentation complete

**Verified by:** ___________________  
**Date:** ___________________  
**Signature:** ___________________

---

**Status:** ✅ READY FOR DEPLOYMENT
