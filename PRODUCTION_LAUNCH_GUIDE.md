# Acrely v2 - Production Launch Guide

**Version:** 2.0.0  
**Author:** Kennedy — Landon Digital  
**Target:** Pinnacle Builders Homes & Properties  
**Production URL:** https://acrely.pinnaclegroups.ng

---

## 🚀 Quick Start Deployment

This guide provides step-by-step instructions for deploying Acrely v2 to production.

### Prerequisites Checklist

Before starting deployment, ensure you have:

- ✅ Supabase Cloud project created
- ✅ Hostinger hosting account with Node.js support
- ✅ Termii API account and API key
- ✅ Domain: `acrely.pinnaclegroups.ng` configured
- ✅ SSL certificate ready
- ✅ GitHub repository access
- ✅ Node.js 20+ and pnpm 9+ installed locally

---

## Step 1: Environment Configuration (15 minutes)

### 1.1 Create Production Environment File

```bash
# Copy example file
cp .env.production.example .env.production

# Edit the file
nano .env.production  # or use your preferred editor
```

### 1.2 Fill in Required Variables

**Supabase Configuration:**
- Get from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_PROJECT_REF=your-project-ref
```

**Termii SMS:**
- Get from: https://termii.com/
```env
TERMII_API_KEY=your-termii-api-key
TERMII_SENDER_ID=Pinnacle
```

**Company Information:**
```env
COMPANY_NAME=Pinnacle Builders Homes & Properties
COMPANY_EMAIL=info@pinnaclegroups.ng
COMPANY_PHONE=+234XXXXXXXXXX
ORG_ID=PBLD001
```

### 1.3 Setup Edge Function Secrets

```bash
# Run setup script
chmod +x scripts/setup-production-env.sh
./scripts/setup-production-env.sh
```

This script will:
- Validate your environment variables
- Link to your Supabase project
- Configure edge function secrets

---

## Step 2: Database Deployment (10 minutes)

### 2.1 Link to Supabase Project

```bash
cd supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 2.2 Review Migrations

```bash
# List all migrations
ls -la migrations/

# Expected migrations:
# 20250101000000_initial_schema.sql
# 20250101000001_seed_data.sql
# 20250101000002_rls_policies.sql
# ... (22 total migrations)
```

### 2.3 Apply Migrations

```bash
# Push all migrations to production
supabase db push

# Verify migrations applied
supabase db remote get-version
```

### 2.4 Verify Database Schema

```bash
# Connect to production database
supabase db remote connect

# Check tables
\dt

# Exit
\q
```

---

## Step 3: Edge Functions Deployment (15 minutes)

### 3.1 Deploy All Functions

```bash
# From project root
cd supabase

# Deploy all functions
supabase functions deploy send-sms
supabase functions deploy generate-receipt
supabase functions deploy process-receipt-queue
supabase functions deploy commission-calculation
supabase functions deploy commission-claim
supabase functions deploy check-overdue-payments
supabase functions deploy bulk-sms-campaign
supabase functions deploy process-sms-queue
supabase functions deploy generate-billing-summary
supabase functions deploy system-health-check --no-verify-jwt
supabase functions deploy backup-database --no-verify-jwt
supabase functions deploy storage-cleanup --no-verify-jwt
supabase functions deploy alert-notification --no-verify-jwt
```

Or use the shortcut:

```bash
# From project root
pnpm functions:deploy
```

### 3.2 Verify Deployment

```bash
# List deployed functions
supabase functions list

# Test a function
curl -i --location --request POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/system-health-check' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

---

## Step 4: Application Build (10 minutes)

### 4.1 Install Dependencies

```bash
# From project root
pnpm install --frozen-lockfile
```

### 4.2 Build Application

```bash
# Build for production
pnpm build

# This will build:
# - Next.js web application
# - All workspace packages
```

### 4.3 Test Production Build Locally

```bash
# Start production server
cd apps/web
pnpm start

# Visit http://localhost:3000
# Test login and basic functionality
# Press Ctrl+C to stop when done
```

---

## Step 5: Deploy to Hostinger (20 minutes)

### Option A: Automated Deployment (GitHub Actions)

#### 5.1 Configure GitHub Secrets

Go to: `GitHub Repository → Settings → Secrets and variables → Actions`

Add these secrets:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

#### 5.2 Trigger Deployment

```bash
# Merge to main branch
git checkout main
git pull origin main
git merge develop
git push origin main

# Monitor deployment
# https://github.com/YOUR_ORG/Acrely/actions
```

### Option B: Manual Deployment (FTP)

#### 5.1 Deploy via Script

```bash
# Make script executable
chmod +x scripts/deploy-to-hostinger.sh

# Run deployment
./scripts/deploy-to-hostinger.sh
```

#### 5.2 Configure Node.js in Hostinger cPanel

1. Login to Hostinger cPanel
2. Go to **Advanced → Setup Node.js App**
3. Create application:
   - **Node.js version:** 20
   - **Application mode:** Production
   - **Application root:** `/public_html/acrely`
   - **Application URL:** `acrely.pinnaclegroups.ng`
   - **Application startup file:** `server.js`

4. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NODE_ENV=production`

5. Click **Start Application**

---

## Step 6: Configure Cron Jobs (10 minutes)

### 6.1 Enable pg_cron Extension

In Supabase Dashboard:
1. Go to **Database → Extensions**
2. Enable `pg_cron`

### 6.2 Setup Scheduled Tasks

```bash
# Open SQL Editor in Supabase Dashboard
# Copy and run the script from:
cat scripts/setup-cron-jobs.sql

# Update these values in the script:
# - YOUR_PROJECT → your Supabase project reference
# - SERVICE_ROLE_KEY → your service role key
```

### 6.3 Verify Cron Jobs

```sql
-- In Supabase SQL Editor
SELECT 
  jobid,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname LIKE 'acrely-%'
ORDER BY jobid;
```

Expected jobs:
- ✅ System health check (hourly)
- ✅ Database backup (daily at 2 AM)
- ✅ Storage cleanup (weekly, Sunday 3 AM)
- ✅ Overdue payments (daily at 8 AM)
- ✅ Billing summary (monthly, 1st at 6 AM)
- ✅ SMS queue processor (every 5 minutes)
- ✅ Receipt queue processor (every 10 minutes)

---

## Step 7: Domain & SSL Configuration (15 minutes)

### 7.1 Configure DNS

In your domain registrar (or Cloudflare):

```
Type: A
Name: acrely
Value: YOUR_HOSTINGER_IP
TTL: Auto
```

### 7.2 Enable SSL in Hostinger

1. Go to **SSL/TLS → Manage SSL**
2. Select `acrely.pinnaclegroups.ng`
3. Install SSL certificate (Let's Encrypt - Free)
4. Enable **Force HTTPS**

### 7.3 Verify SSL

```bash
# Check SSL certificate
curl -vI https://acrely.pinnaclegroups.ng 2>&1 | grep "SSL certificate"

# Should show valid certificate
```

---

## Step 8: Production Verification (20 minutes)

### 8.1 Run Automated Verification

```bash
# Make script executable
chmod +x scripts/verify-production.sh

# Run verification
./scripts/verify-production.sh
```

This tests:
- ✅ DNS resolution
- ✅ Website accessibility
- ✅ SSL certificate
- ✅ Supabase API
- ✅ All edge functions
- ✅ Database tables
- ✅ Storage buckets
- ✅ Application pages
- ✅ Performance

### 8.2 Manual Verification

#### Test Website
1. Visit https://acrely.pinnaclegroups.ng
2. Should load without errors
3. Check browser console (F12) - no errors

#### Test Login
1. Login as SysAdmin
2. Dashboard should load
3. All menus accessible

#### Test Critical Flows
1. **Customer Management:**
   - Create a test customer
   - Edit customer details
   - Search for customer

2. **Allocations:**
   - Create allocation for test customer
   - Verify plot assignment

3. **Payments:**
   - Record a test payment
   - Verify receipt generation
   - Check if SMS sent (if configured)

4. **Reports:**
   - Generate sales report
   - Export billing summary
   - Download as CSV

---

## Step 9: User Acceptance Testing (30 minutes)

### 9.1 Test All User Roles

#### SysAdmin
- [ ] Login successful
- [ ] Full access to all modules
- [ ] Can view audit logs
- [ ] Can manage settings

#### CEO
- [ ] Login successful
- [ ] Dashboard access
- [ ] Can view all reports
- [ ] Commission data visible

#### Frontdesk
- [ ] Login successful
- [ ] Can create customers
- [ ] Can record payments
- [ ] Receipt generation works

#### Agent
- [ ] Login successful
- [ ] Limited access enforced
- [ ] Can view own allocations
- [ ] Cannot access others' data

### 9.2 Verify Automated Systems

- [ ] SMS sending works
- [ ] Receipts generated and stored
- [ ] Audit logs recording actions
- [ ] Commission calculations correct

---

## Step 10: Monitoring Setup (10 minutes)

### 10.1 Supabase Dashboard Monitoring

Monitor these metrics:
- Database size and growth
- API requests per hour
- Edge function invocations
- Error rates

### 10.2 Set Up Alerts

In Supabase Dashboard:
1. Go to **Settings → Alerts**
2. Configure email notifications for:
   - Database usage > 80%
   - High error rates
   - Function failures

### 10.3 Health Check Monitoring

The system health check function runs hourly and logs to `system_logs` table.

```sql
-- Check recent health checks
SELECT * FROM system_logs
WHERE log_type = 'SYSTEM_HEALTH'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Post-Launch Checklist

### Immediate (Day 1)
- [ ] All automated tests passed
- [ ] Manual testing completed
- [ ] All user roles tested
- [ ] SMS delivery confirmed
- [ ] Receipts generating correctly
- [ ] Audit logs working
- [ ] Performance acceptable (< 2s load time)

### Daily (First Week)
- [ ] Monitor error logs
- [ ] Check SMS delivery success rate
- [ ] Verify cron jobs executed
- [ ] Review user feedback
- [ ] Monitor database performance

### Weekly
- [ ] Review audit logs for anomalies
- [ ] Check storage usage
- [ ] Verify backups created
- [ ] Performance metrics review

### Monthly
- [ ] Generate billing summary
- [ ] Review commission calculations
- [ ] Database optimization
- [ ] Security updates
- [ ] User satisfaction survey

---

## Rollback Procedure

If critical issues are detected:

### 1. Stop Application
```bash
# In Hostinger cPanel
# Advanced → Setup Node.js App → Stop Application
```

### 2. Restore Previous Version
```bash
# Restore from backup
# Located in: backups/deployment-YYYYMMDD-HHMMSS/

# Or revert Git commit
git revert HEAD
git push origin main
```

### 3. Database Rollback (if needed)
```bash
cd supabase
supabase db reset --version PREVIOUS_VERSION
```

### 4. Notify Stakeholders
- Email technical team
- Inform management
- Update status page (if applicable)

---

## Troubleshooting

### Issue: Website not loading

**Solution:**
1. Check Node.js app status in cPanel
2. Restart application
3. Check error logs in cPanel
4. Verify environment variables set

### Issue: Database connection errors

**Solution:**
1. Verify Supabase URL and keys
2. Check RLS policies
3. Review Supabase project status
4. Check network connectivity

### Issue: Edge functions not responding

**Solution:**
1. Check function deployment: `supabase functions list`
2. Review function logs: `supabase functions logs FUNCTION_NAME`
3. Redeploy function: `supabase functions deploy FUNCTION_NAME`
4. Verify secrets set correctly

### Issue: SMS not sending

**Solution:**
1. Check Termii API key
2. Verify Termii account balance
3. Check phone number format (+234...)
4. Review edge function logs

### Issue: Receipts not generating

**Solution:**
1. Check storage bucket permissions
2. Verify receipt bucket exists
3. Review edge function logs
4. Check RLS policies on receipts table

---

## Support Contacts

### Technical Support
- **Developer:** Kennedy — Landon Digital
- **Email:** dev@landondigital.com
- **GitHub:** https://github.com/YOUR_ORG/Acrely/issues

### Business Support
- **Company:** Pinnacle Builders Homes & Properties
- **Email:** info@pinnaclegroups.ng
- **Phone:** +234XXXXXXXXXX

### Emergency Hotline
For critical production issues:
- **Primary:** +234XXXXXXXXXX
- **Secondary:** +234XXXXXXXXXX

---

## Deployment Timeline Summary

| Step | Task | Duration |
|------|------|----------|
| 1 | Environment Configuration | 15 min |
| 2 | Database Deployment | 10 min |
| 3 | Edge Functions Deployment | 15 min |
| 4 | Application Build | 10 min |
| 5 | Deploy to Hostinger | 20 min |
| 6 | Configure Cron Jobs | 10 min |
| 7 | Domain & SSL | 15 min |
| 8 | Production Verification | 20 min |
| 9 | User Acceptance Testing | 30 min |
| 10 | Monitoring Setup | 10 min |
| **Total** | | **~2.5 hours** |

---

## Success Criteria

Deployment is successful when:

- ✅ Website accessible at https://acrely.pinnaclegroups.ng
- ✅ SSL certificate valid and HTTPS enforced
- ✅ All edge functions deployed and responding
- ✅ Database migrations applied successfully
- ✅ All user roles can login and access their features
- ✅ SMS delivery working
- ✅ Receipt generation working
- ✅ Audit logs recording actions
- ✅ All cron jobs scheduled and running
- ✅ Performance meets requirements (< 2s load time)
- ✅ All automated tests passing
- ✅ No critical errors in logs

---

## Next Steps After Launch

1. **Monitor Closely** (First 48 hours)
   - Check error logs every 2 hours
   - Monitor user feedback
   - Watch performance metrics

2. **Gather Feedback**
   - Survey initial users
   - Document issues
   - Prioritize improvements

3. **Optimize Performance**
   - Analyze slow queries
   - Optimize database indexes
   - Review edge function performance

4. **Plan Enhancements**
   - Feature requests
   - UI/UX improvements
   - Additional integrations

---

**Congratulations! You're ready to launch Acrely v2! 🚀**

For detailed technical documentation, see:
- `PRODUCTION_DEPLOYMENT.md`
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- `DEPLOYMENT_GUIDE.md`
