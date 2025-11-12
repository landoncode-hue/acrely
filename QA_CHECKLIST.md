# Manual QA Checklist for Acrely Enterprise Release

## Pre-Deployment Verification

### 1. Database Verification ✓

#### Supabase Tables Check
```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables (15+):
-- allocations, audit_logs, billing, call_logs, 
-- commissions, customers, inspection_schedules, leads,
-- notifications, payments, plots, receipt_queue, 
-- settings, sms_campaigns, campaign_recipients, sms_queue, users
```

- [ ] All 17 tables present
- [ ] RLS enabled on all tables
- [ ] Indexes created correctly
- [ ] Views functioning (commission_summary, estate_performance, etc.)

#### Data Integrity
- [ ] Seed data loaded (8 estates, 24+ plots)
- [ ] Test users created with all 5 roles
- [ ] Foreign key constraints working
- [ ] Triggers active (check pg_trigger)

### 2. Edge Functions Health Check ✓

Test each function individually:

#### send-sms
```bash
curl -i --location --request POST \
  'https://YOUR_SUPABASE_URL/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "phone": "+2348012345678",
    "message": "Test SMS from Acrely"
  }'
```
- [ ] Returns 200 OK
- [ ] SMS delivered to Termii sandbox
- [ ] Error handling works for invalid phone

#### generate-receipt
```bash
curl -i --location --request POST \
  'https://YOUR_SUPABASE_URL/functions/v1/generate-receipt' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "payment_id": "YOUR_TEST_PAYMENT_ID"
  }'
```
- [ ] Returns 200 OK
- [ ] Receipt PDF generated
- [ ] Uploaded to Supabase Storage
- [ ] Contains correct company details

#### commission-calculation
```bash
curl -i --location --request POST \
  'https://YOUR_SUPABASE_URL/functions/v1/commission-calculation' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "payment_id": "YOUR_TEST_PAYMENT_ID"
  }'
```
- [ ] Returns 200 OK
- [ ] Commission calculated correctly
- [ ] Agent notified

#### generate-billing-summary
```bash
curl -i --location --request POST \
  'https://YOUR_SUPABASE_URL/functions/v1/generate-billing-summary' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "period": "2025-01",
    "format": "json"
  }'
```
- [ ] Returns 200 OK
- [ ] Billing data accurate
- [ ] Summary stats calculated
- [ ] CSV export works

#### check-overdue-payments
```bash
curl -i --location --request POST \
  'https://YOUR_SUPABASE_URL/functions/v1/check-overdue-payments' \
  --header 'Authorization: Bearer YOUR_ANON_KEY'
```
- [ ] Returns 200 OK
- [ ] Identifies overdue allocations
- [ ] Updates statuses correctly
- [ ] Notifications sent

#### bulk-sms-campaign
```bash
curl -i --location --request POST \
  'https://YOUR_SUPABASE_URL/functions/v1/bulk-sms-campaign' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "campaign_id": "YOUR_CAMPAIGN_ID"
  }'
```
- [ ] Returns 200 OK
- [ ] Campaign executes
- [ ] Recipients tracked
- [ ] Success rate logged

### 3. Web Application Testing ✓

#### Authentication
- [ ] Login page loads
- [ ] Email/password authentication works
- [ ] Invalid credentials show error
- [ ] Session persists on refresh
- [ ] Logout works correctly

#### Dashboard
- [ ] All stat cards display correctly
- [ ] Real-time data loads
- [ ] Charts render (if implemented)
- [ ] Quick actions functional
- [ ] Responsive on mobile

#### Customers Module
- [ ] Customer list loads
- [ ] Search/filter works
- [ ] Add customer modal opens
- [ ] Form validation working
- [ ] Customer created successfully
- [ ] Table pagination works

#### Allocations Module
- [ ] Allocations list displays
- [ ] Create allocation modal
- [ ] Customer/plot selection works
- [ ] Payment plan options functional
- [ ] Allocation created successfully

#### Payments Module
- [ ] Payments list loads
- [ ] Record payment modal
- [ ] Amount validation works
- [ ] Payment methods selectable
- [ ] Receipt generated automatically

#### Reports Module
- [ ] Reports page loads
- [ ] Charts display correctly (Line, Bar, Pie)
- [ ] CSV export downloads
- [ ] PDF export (print) works
- [ ] Date range filter functional

#### Audit Logs (Admin Only)
- [ ] /api/audit endpoint responds
- [ ] Filters work (user, table, action)
- [ ] Pagination functional
- [ ] Summary stats accurate

### 4. SMS Integration (Termii) ✓

#### Sandbox Testing
```bash
# Send test SMS via Edge Function
# Expected: SMS delivered to sandbox number
```
- [ ] Termii API key configured
- [ ] Sandbox number receives SMS
- [ ] Message content correct
- [ ] Sender ID displayed
- [ ] Delivery status tracked

#### Production Testing (with caution)
- [ ] Real phone number test
- [ ] International format validated
- [ ] Error handling for failed sends
- [ ] Rate limiting respected

### 5. Billing Module ✓

#### Database
```sql
-- Check billing table
SELECT * FROM billing LIMIT 10;

-- Check monthly summary view
SELECT * FROM monthly_billing_summary;
```
- [ ] Billing table populated
- [ ] Triggers logging events
- [ ] Summary views accurate
- [ ] RLS policies active

#### API Testing
```bash
# Generate billing report
curl 'https://YOUR_SUPABASE_URL/functions/v1/generate-billing-summary' \
  -H 'Authorization: Bearer YOUR_KEY' \
  -d '{"period":"2025-01","format":"json"}'
```
- [ ] Returns correct data
- [ ] Calculations accurate
- [ ] Export formats work

### 6. Audit Logs Verification ✓

```sql
-- Check audit logs
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- Verify triggers
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE 'audit%';
```
- [ ] Audit logs recording
- [ ] User actions tracked
- [ ] Old/new data captured
- [ ] Sensitive operations logged

### 7. Performance Benchmarks ✓

#### Page Load Times
- [ ] Dashboard: <2 seconds
- [ ] Customer list: <1.5 seconds
- [ ] Reports page: <3 seconds (with charts)
- [ ] Payment creation: <1 second

#### API Response Times
- [ ] Supabase queries: <100ms (p95)
- [ ] Edge Functions: <500ms (p95)
- [ ] File uploads: <2 seconds

#### Database Query Performance
```sql
-- Check slow queries
EXPLAIN ANALYZE 
SELECT * FROM estate_performance;
```
- [ ] All queries use indexes
- [ ] No full table scans
- [ ] Query execution <50ms

### 8. Security Validation ✓

#### RLS Policies
- [ ] CEO/MD/SysAdmin have full access
- [ ] Frontdesk limited to customers/allocations
- [ ] Agents see only own data
- [ ] Unauthenticated users blocked

#### API Keys
- [ ] SUPABASE_ANON_KEY public only
- [ ] SERVICE_ROLE_KEY never exposed
- [ ] TERMII_API_KEY server-side only
- [ ] Environment variables secure

#### Authentication
- [ ] Password requirements enforced
- [ ] Session expiry working
- [ ] HTTPS enforced
- [ ] CORS configured correctly

### 9. Production Deployment Checklist ✓

#### Pre-Deploy
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables set
- [ ] Backup created
- [ ] Rollback plan ready

#### Deploy
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Web app built successfully
- [ ] FTP deployment complete
- [ ] Static assets uploaded

#### Post-Deploy
- [ ] https://acrely.pinnaclegroups.ng accessible
- [ ] SSL certificate valid
- [ ] DNS resolving correctly
- [ ] Health checks passing
- [ ] No console errors

### 10. Cross-Browser Testing ✓

#### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design working
- [ ] Touch interactions functional

---

## Final Sign-Off

### CEO/MD Approval
- [ ] Dashboard statistics accurate
- [ ] Reports provide business insights
- [ ] SMS notifications working
- [ ] Commission tracking functional

### Technical Lead Approval
- [ ] Code quality standards met
- [ ] Security best practices followed
- [ ] Performance benchmarks achieved
- [ ] Documentation complete

### Operations Team Approval
- [ ] User workflows intuitive
- [ ] Data entry efficient
- [ ] Error messages helpful
- [ ] Training materials ready

---

## Issues Log

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Example: Chart not loading | Medium | Fixed | Updated recharts version |
|  |  |  |  |

---

## QA Completion Date: _______________

**Tested By:** _____________________

**Approved By:** ____________________

**Production Go-Live:** ______________
