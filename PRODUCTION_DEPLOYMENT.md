# Acrely Production Deployment Guide

## Version: 2.0.0 - Enterprise Release
**Author:** Kennedy - Landon Digital  
**Target:** Pinnacle Builders Homes & Properties  
**Deployment Date:** TBD

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [Web Application Deployment](#web-application-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedure](#rollback-procedure)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- ✅ Supabase Cloud account with project created
- ✅ Hostinger hosting account (acrely.pinnaclegroups.ng)
- ✅ Termii account for SMS integration
- ✅ GitHub repository access
- ✅ Domain DNS configuration

### Required Tools
```bash
# Node.js and pnpm
node --version  # v20+
pnpm --version  # v9+

# Supabase CLI
supabase --version  # latest

# Git
git --version
```

### Access Credentials
- [ ] Supabase Project Ref ID
- [ ] Supabase Service Role Key
- [ ] Termii API Key
- [ ] Hostinger FTP credentials
- [ ] GitHub deploy keys

---

## Environment Setup

### 1. GitHub Secrets Configuration

Navigate to: `Settings > Secrets and variables > Actions`

Add the following secrets:

#### Supabase Secrets
```yaml
SUPABASE_ACCESS_TOKEN: your-supabase-access-token
SUPABASE_PROJECT_ID: your-project-ref-id
NEXT_PUBLIC_SUPABASE_URL: https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY: your-anon-key
SUPABASE_SERVICE_ROLE_KEY: your-service-role-key
```

#### Hostinger FTP Secrets
```yaml
FTP_SERVER: ftp.pinnaclegroups.ng
FTP_USERNAME: your-ftp-username
FTP_PASSWORD: your-ftp-password
```

#### Termii SMS Secrets
```yaml
TERMII_API_KEY: your-termii-api-key
```

#### Optional: Telegram Notifications
```yaml
TELEGRAM_BOT_TOKEN: your-bot-token  # Optional
TELEGRAM_CHAT_ID: your-chat-id      # Optional
```

### 2. Environment Variables

Create `.env.production` (server-side only):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Termii SMS Configuration
TERMII_API_KEY=your-termii-api-key

# Company Information
COMPANY_NAME=Pinnacle Builders Homes & Properties
COMPANY_EMAIL=info@pinnaclegroups.ng
COMPANY_PHONE=+234XXXXXXXXXX
COMPANY_ADDRESS=Lagos, Nigeria

# Application URLs
NEXT_PUBLIC_SITE_URL=https://acrely.pinnaclegroups.ng
```

---

## Database Deployment

### Step 1: Link Supabase Project

```bash
# Navigate to project root
cd /path/to/Acrely

# Link to production project
supabase link --project-ref YOUR_PROJECT_REF

# Verify link
supabase projects list
```

### Step 2: Apply Migrations

```bash
# Review migrations to be applied
ls -la supabase/migrations/

# Expected migrations:
# - 20250101000000_initial_schema.sql
# - 20250101000001_seed_data.sql
# - 20250101000002_rls_policies.sql
# - 20250101000003_operational_schema.sql
# - 20250101000004_rbac_policies.sql
# - 20250101000005_automation_triggers.sql
# - 20250101000006_billing_system.sql

# Apply all migrations
supabase db push

# Verify migrations
supabase db remote get-version
```

### Step 3: Verify Database State

```sql
-- Connect to production database
supabase db remote connect

-- Verify all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Exit
\q
```

### Step 4: Seed Production Data (Optional)

```sql
-- Create default admin user
INSERT INTO auth.users (...) VALUES (...);

-- Insert production estates and plots
-- (Use seed script or manual entry)
```

---

## Edge Functions Deployment

### Step 1: Set Environment Variables

```bash
# Set secrets for Edge Functions
supabase secrets set TERMII_API_KEY=your-key
supabase secrets set COMPANY_NAME="Pinnacle Builders Homes & Properties"
supabase secrets set COMPANY_EMAIL=info@pinnaclegroups.ng
supabase secrets set COMPANY_PHONE=+234XXXXXXXXXX
supabase secrets set COMPANY_ADDRESS="Lagos, Nigeria"

# Verify secrets
supabase secrets list
```

### Step 2: Deploy Functions

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy send-sms
supabase functions deploy generate-receipt
supabase functions deploy commission-calculation
supabase functions deploy check-overdue-payments
supabase functions deploy bulk-sms-campaign
supabase functions deploy commission-claim
supabase functions deploy generate-billing-summary

# Verify deployment
supabase functions list
```

### Step 3: Test Edge Functions

```bash
# Test send-sms
curl -i --location --request POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "phone": "+2348012345678",
    "message": "Test SMS from production"
  }'

# Expected: 200 OK + SMS delivered
```

### Step 4: Configure Cron Jobs

In Supabase Dashboard:

1. Go to **Database > Extensions**
2. Enable `pg_cron` extension
3. Create cron job:

```sql
-- Daily overdue payment check at 8 AM
SELECT cron.schedule(
  'check-overdue-payments-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/check-overdue-payments',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) as request_id;
  $$
);

-- Verify cron job
SELECT * FROM cron.job;
```

---

## Web Application Deployment

### Option 1: Automated Deployment (via GitHub Actions)

```bash
# Push to main branch to trigger deployment
git checkout main
git pull origin main
git merge develop
git push origin main

# Monitor deployment in GitHub Actions
# https://github.com/YOUR_ORG/Acrely/actions
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Build application
pnpm build

# 3. Deploy to Hostinger via FTP
# Use FileZilla or command-line FTP

# Upload build artifacts:
# - apps/web/.next/ → /public_html/acrely/.next/
# - apps/web/public/ → /public_html/acrely/public/
```

### Hostinger Configuration

#### .htaccess Configuration

Create `/public_html/acrely/.htaccess`:

```apache
# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```

#### Node.js Configuration

In Hostinger Panel:
1. Go to **Advanced > Node.js**
2. Create application:
   - Node version: 20.x
   - Application root: `/public_html/acrely`
   - Application startup file: `server.js` or `next start`
3. Set environment variables
4. Restart application

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Production site accessibility
curl -I https://acrely.pinnaclegroups.ng
# Expected: 200 OK

# Supabase API
curl -H "apikey: YOUR_ANON_KEY" \
  "https://YOUR_PROJECT.supabase.co/rest/v1/"
# Expected: 200 OK

# Edge Function availability
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  "https://YOUR_PROJECT.supabase.co/functions/v1/send-sms" \
  -d '{}'
# Expected: 400 (not 404)
```

### 2. Functional Testing

- [ ] Login with production credentials
- [ ] Create test customer
- [ ] Create test allocation
- [ ] Record test payment
- [ ] Verify SMS sent (if applicable)
- [ ] Check audit logs
- [ ] Generate reports
- [ ] Export billing summary

### 3. Performance Validation

- [ ] Dashboard loads < 2 seconds
- [ ] Page transitions < 500ms
- [ ] Database queries < 100ms
- [ ] No console errors

### 4. DNS Verification

```bash
# Check DNS propagation
dig acrely.pinnaclegroups.ng

# Check SSL certificate
curl -vI https://acrely.pinnaclegroups.ng 2>&1 | grep -i 'SSL certificate'
```

---

## Rollback Procedure

### Database Rollback

```bash
# List migration history
supabase db remote get-version

# Rollback to specific migration
supabase db reset --version 20250101000005
```

### Application Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or deploy previous tag
git checkout v1.9.0
git push origin main --force
```

### Edge Functions Rollback

```bash
# Redeploy previous version
git checkout v1.9.0
supabase functions deploy
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Production site accessible
- [ ] No critical errors in logs
- [ ] SMS delivery working
- [ ] Database backup created

### Weekly Tasks
- [ ] Review audit logs
- [ ] Check performance metrics
- [ ] Verify cron jobs ran
- [ ] Generate billing reports

### Monthly Tasks
- [ ] Security updates applied
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Backup restoration test

### Monitoring Dashboards

1. **Supabase Dashboard**
   - Database health
   - API usage
   - Function invocations

2. **Hostinger Panel**
   - Server resources
   - Traffic analytics
   - Error logs

3. **Termii Dashboard**
   - SMS delivery rate
   - Credit balance
   - Failed messages

---

## Support & Troubleshooting

### Common Issues

#### Issue: "Cannot connect to database"
**Solution:**
- Verify SUPABASE_URL and keys
- Check RLS policies
- Ensure IP whitelisting (if configured)

#### Issue: "Edge Function timeout"
**Solution:**
- Increase function timeout (default 60s)
- Optimize database queries
- Check external API response times

#### Issue: "SMS not delivered"
**Solution:**
- Verify TERMII_API_KEY
- Check phone number format (+234...)
- Review Termii credit balance

### Contact Information

**Technical Support:**
- Email: dev@landondigital.com
- Telegram: @landon-support

**Business Contact:**
- Email: info@pinnaclegroups.ng
- Phone: +234XXXXXXXXXX

---

## Production Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Cron jobs configured
- [ ] Web app deployed to Hostinger
- [ ] DNS pointing correctly
- [ ] SSL certificate valid
- [ ] Health checks passing
- [ ] Functional tests passed
- [ ] Performance benchmarks met
- [ ] Monitoring enabled
- [ ] Backup strategy confirmed
- [ ] Team notified
- [ ] Documentation updated

---

**Deployment Completed By:** _____________________

**Date:** _____________________

**Sign-off:** _____________________
