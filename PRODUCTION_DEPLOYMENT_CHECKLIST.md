# =============================================================================
# Acrely v2 - Production Deployment Checklist
# =============================================================================
# Complete this checklist before and after production deployment
# =============================================================================

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] `.env.production` file created from `.env.production.example`
- [ ] All Supabase credentials configured (URL, Anon Key, Service Role Key)
- [ ] Termii API key configured and tested
- [ ] Company information filled in correctly
- [ ] JWT secret generated (min 32 characters)
- [ ] Storage bucket names configured
- [ ] Production site URL set correctly

### 2. Supabase Setup
- [ ] Supabase project created at https://app.supabase.com
- [ ] Project linked via CLI: `supabase link --project-ref YOUR_REF`
- [ ] Database migrations reviewed in `supabase/migrations/`
- [ ] Edge function secrets configured
- [ ] RLS policies verified in Supabase dashboard
- [ ] Storage buckets created: `receipts`, `documents`

### 3. GitHub Actions Setup
- [ ] Repository secrets configured:
  - [ ] `SUPABASE_ACCESS_TOKEN`
  - [ ] `SUPABASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `FTP_SERVER`
  - [ ] `FTP_USERNAME`
  - [ ] `FTP_PASSWORD`
  - [ ] `TERMII_API_KEY` (optional)
  - [ ] `TELEGRAM_BOT_TOKEN` (optional)
  - [ ] `TELEGRAM_CHAT_ID` (optional)

### 4. Hostinger Configuration
- [ ] Hosting account active
- [ ] Domain configured: `acrely.pinnaclegroups.ng`
- [ ] DNS A record pointing to Hostinger IP
- [ ] SSL certificate installed and valid
- [ ] Node.js version 20+ available
- [ ] FTP/SSH access configured
- [ ] Directory created: `/public_html/acrely/`

### 5. Code Quality
- [ ] All TypeScript errors resolved: `pnpm build`
- [ ] Linting passed: `pnpm lint`
- [ ] Local build successful: `pnpm build`
- [ ] Production build tested locally: `cd apps/web && pnpm start`
- [ ] No console errors in browser
- [ ] All routes accessible

### 6. Testing
- [ ] Unit tests written and passing (if applicable)
- [ ] E2E tests reviewed in `tests/e2e/`
- [ ] Manual testing completed for all user roles:
  - [ ] SysAdmin login and access
  - [ ] CEO login and access
  - [ ] Frontdesk login and access
  - [ ] Agent login and access
- [ ] Critical user flows tested:
  - [ ] Customer creation
  - [ ] Allocation creation
  - [ ] Payment recording
  - [ ] Receipt generation
  - [ ] SMS sending
  - [ ] Report generation

---

## Deployment Execution

### Step 1: Environment Setup
```bash
# 1. Run environment setup script
./scripts/setup-production-env.sh

# 2. Verify environment
pnpm verify:env
```
- [ ] Environment setup completed
- [ ] Edge function secrets configured

### Step 2: Database Deployment
```bash
# 1. Link to production project
cd supabase
supabase link --project-ref YOUR_PROJECT_REF

# 2. Review migrations
ls -la migrations/

# 3. Push migrations
supabase db push

# 4. Verify database state
supabase db remote get-version
```
- [ ] Database linked successfully
- [ ] All migrations applied
- [ ] Database schema verified

### Step 3: Edge Functions Deployment
```bash
# Deploy all edge functions
pnpm functions:deploy

# Or deploy individually
pnpm functions:deploy:health
pnpm functions:deploy:backup
pnpm functions:deploy:cleanup
pnpm functions:deploy:alerts

# Verify deployment
cd supabase
supabase functions list
```
- [ ] All 13 edge functions deployed
- [ ] Edge function secrets verified
- [ ] Function logs accessible

### Step 4: Application Build
```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Build application
pnpm build

# 3. Test production build
cd apps/web
pnpm start
# Test at http://localhost:3000
```
- [ ] Build completed without errors
- [ ] Build output exists in `apps/web/.next/`
- [ ] Production build tested locally

### Step 5: Deploy to Hostinger

#### Option A: GitHub Actions (Recommended)
```bash
# Push to main branch
git checkout main
git pull origin main
git merge develop
git push origin main

# Monitor deployment
# https://github.com/YOUR_ORG/Acrely/actions
```
- [ ] GitHub Actions workflow triggered
- [ ] All jobs passed (health-check, deploy-database, deploy-functions, deploy-web)
- [ ] Post-deployment verification passed

#### Option B: Manual Deployment
```bash
# 1. Run deployment script
./scripts/deploy-production.sh

# 2. Upload to Hostinger via FTP
# Upload apps/web/.next/ → /public_html/acrely/.next/
# Upload apps/web/public/ → /public_html/acrely/public/
# Upload package.json → /public_html/acrely/

# 3. SSH into server and install dependencies
ssh user@pinnaclegroups.ng
cd /public_html/acrely
npm install --production

# 4. Configure Node.js app in cPanel
# - Application root: /public_html/acrely
# - Entry point: server.js or next start
# - Node version: 20
```
- [ ] Files uploaded successfully
- [ ] Dependencies installed on server
- [ ] Node.js application configured
- [ ] Application started

### Step 6: Configure Cron Jobs
In Supabase Dashboard SQL Editor:
```sql
-- System health check (hourly)
SELECT cron.schedule(
  'system-health-check-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/system-health-check',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Daily backup (2 AM)
SELECT cron.schedule(
  'backup-database-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/backup-database',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Storage cleanup (weekly, Sunday 3 AM)
SELECT cron.schedule(
  'storage-cleanup-weekly',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/storage-cleanup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Billing summary generation (monthly, 1st at 6 AM)
SELECT cron.schedule(
  'billing-summary-monthly',
  '0 6 1 * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-billing-summary',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Verify cron jobs
SELECT * FROM cron.job;
```
- [ ] Cron extension enabled
- [ ] Health check cron configured (hourly)
- [ ] Backup cron configured (daily)
- [ ] Storage cleanup cron configured (weekly)
- [ ] Billing summary cron configured (monthly)

---

## Post-Deployment Verification

### Step 1: Automated Verification
```bash
# Run verification script
./scripts/verify-production.sh
```
- [ ] All automated tests passed
- [ ] DNS resolution working
- [ ] Website accessible
- [ ] SSL certificate valid
- [ ] Supabase API accessible
- [ ] All edge functions responding
- [ ] Database tables accessible
- [ ] Storage buckets accessible

### Step 2: Manual Testing

#### Health Checks
```bash
# Production site
curl -I https://acrely.pinnaclegroups.ng
# Expected: HTTP 200 OK

# Supabase API
curl -H "apikey: YOUR_ANON_KEY" "https://YOUR_PROJECT.supabase.co/rest/v1/"
# Expected: HTTP 200

# Edge function test
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  "https://YOUR_PROJECT.supabase.co/functions/v1/system-health-check"
# Expected: HTTP 200 with health status
```
- [ ] Production site returns HTTP 200
- [ ] Supabase API responding
- [ ] Edge functions accessible

#### User Acceptance Testing
- [ ] **SysAdmin Role:**
  - [ ] Login successful
  - [ ] Dashboard loads
  - [ ] Can access all modules
  - [ ] Can view audit logs
  - [ ] Can manage system settings

- [ ] **CEO Role:**
  - [ ] Login successful
  - [ ] Full dashboard access
  - [ ] Can view all reports
  - [ ] Can export billing summary
  - [ ] Commission calculations visible

- [ ] **Frontdesk Role:**
  - [ ] Login successful
  - [ ] Can create customers
  - [ ] Can create allocations
  - [ ] Can record payments
  - [ ] Receipt generation works
  - [ ] SMS notifications sent

- [ ] **Agent Role:**
  - [ ] Login successful
  - [ ] Limited access enforced
  - [ ] Can view own allocations only
  - [ ] Can view own commissions
  - [ ] Cannot access other agents' data

#### Functional Testing
- [ ] **Customer Management:**
  - [ ] Create new customer
  - [ ] Edit customer details
  - [ ] Search customers
  - [ ] View customer list

- [ ] **Allocations:**
  - [ ] Create allocation
  - [ ] Assign plot to customer
  - [ ] Agent commission calculated
  - [ ] Allocation status updates

- [ ] **Payments:**
  - [ ] Record payment
  - [ ] Payment linked to allocation
  - [ ] Receipt generated automatically
  - [ ] SMS sent to customer
  - [ ] Balance updated correctly

- [ ] **Receipts:**
  - [ ] Receipt PDF generated
  - [ ] Receipt stored in bucket
  - [ ] Receipt viewable in browser
  - [ ] Receipt downloadable

- [ ] **Reports:**
  - [ ] Sales report generated
  - [ ] Payment report generated
  - [ ] Commission report generated
  - [ ] Billing summary exported
  - [ ] Data exports to CSV

- [ ] **Audit System:**
  - [ ] User actions logged
  - [ ] Audit trail viewable
  - [ ] Search and filter working
  - [ ] Details modal functional

### Step 3: Performance Testing
- [ ] Dashboard loads < 2 seconds
- [ ] Page transitions < 500ms
- [ ] Large tables paginate properly
- [ ] Search responds instantly
- [ ] No memory leaks in browser
- [ ] Mobile responsive design works

### Step 4: Security Verification
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] RLS policies active on all tables
- [ ] Service role key not exposed in client
- [ ] Auth tokens expire correctly
- [ ] Password requirements enforced
- [ ] XSS protection headers present
- [ ] CORS configured properly

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Production site accessible
- [ ] No errors in Supabase logs
- [ ] SMS delivery working (check Termii dashboard)
- [ ] Backup cron job executed
- [ ] Health check cron job executed

### Weekly Reviews
- [ ] Review audit logs for anomalies
- [ ] Check storage usage
- [ ] Review error logs
- [ ] Verify cron job executions
- [ ] Monitor response times

### Monthly Tasks
- [ ] Generate billing summary
- [ ] Review commission calculations
- [ ] Database performance optimization
- [ ] Security updates applied
- [ ] User feedback review
- [ ] Test backup restoration

---

## Rollback Procedure

### If Deployment Fails:

#### 1. Database Rollback
```bash
# List migrations
supabase db remote get-version

# Rollback to specific version
supabase db reset --version 20250116000003
```

#### 2. Application Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or checkout previous tag
git checkout v1.0.0
git push origin main --force
```

#### 3. Edge Functions Rollback
```bash
# Checkout previous version
git checkout v1.0.0

# Redeploy functions
cd supabase
supabase functions deploy
```

---

## Support & Contacts

### Technical Issues
- **Developer:** Kennedy — Landon Digital
- **Email:** dev@landondigital.com
- **GitHub Issues:** https://github.com/YOUR_ORG/Acrely/issues

### Business Queries
- **Company:** Pinnacle Builders Homes & Properties
- **Email:** info@pinnaclegroups.ng
- **Phone:** +234XXXXXXXXXX

---

## Final Sign-off

**Deployment Completed By:** _____________________

**Date:** _____________________

**Time:** _____________________

**All Tests Passed:** [ ] Yes [ ] No

**Production URL:** https://acrely.pinnaclegroups.ng

**Notes:**
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

**Approved By:** _____________________

**Signature:** _____________________

---

**Version:** 2.0.0  
**Last Updated:** November 11, 2025  
**Status:** Production Ready ✅
