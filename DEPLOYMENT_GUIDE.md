# Acrely v2 - Deployment Guide

## Overview
This guide covers the complete deployment process for Acrely v2 to production environments.

## Prerequisites
- Supabase Project (with database and Edge Functions enabled)
- Hostinger VPS or hosting account
- Node.js 20+ and pnpm 9+
- Termii API account for SMS
- Git repository access

## Environment Variables

### Web Application (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Supabase Edge Functions
```env
TERMII_API_KEY=your-termii-api-key
TERMII_BASE_URL=https://v3.api.termii.com
COMPANY_NAME=Pinnacle Builders Homes & Properties
COMPANY_ADDRESS=Your company address
COMPANY_EMAIL=info@pinnaclebuilders.com
COMPANY_PHONE=+234...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 1: Database Migration

1. **Initialize Supabase CLI**
```bash
cd supabase
supabase login
supabase link --project-ref your-project-ref
```

2. **Run Migrations**
```bash
supabase db push
```

3. **Verify migrations**
```bash
supabase db diff
```

Expected migrations:
- `20250101000000_initial_schema.sql` - Core tables
- `20250101000001_seed_data.sql` - Initial data
- `20250101000002_rls_policies.sql` - Row Level Security
- `20250101000003_operational_schema.sql` - Views and triggers
- `20250101000004_rbac_policies.sql` - Role-based access
- `20250101000005_automation_triggers.sql` - Automation triggers

## Step 2: Deploy Edge Functions

1. **Deploy all functions**
```bash
cd supabase
supabase functions deploy send-sms
supabase functions deploy generate-receipt
supabase functions deploy commission-calculation
supabase functions deploy check-overdue-payments
supabase functions deploy bulk-sms-campaign
supabase functions deploy commission-claim
```

2. **Set environment secrets**
```bash
supabase secrets set TERMII_API_KEY=your-termii-api-key
supabase secrets set COMPANY_NAME="Pinnacle Builders"
supabase secrets set COMPANY_EMAIL=info@pinnaclebuilders.com
supabase secrets set COMPANY_PHONE="+234..."
supabase secrets set COMPANY_ADDRESS="Your address"
```

3. **Verify deployment**
```bash
supabase functions list
```

## Step 3: Set Up Cron Jobs (Scheduled Functions)

Enable pg_cron in Supabase Dashboard:

```sql
-- Schedule overdue payment checks daily at 8 AM
SELECT cron.schedule(
  'check-overdue-payments',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/check-overdue-payments',
    headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
  )
  $$
);
```

## Step 4: Build Web Application

1. **Install dependencies**
```bash
pnpm install
```

2. **Build the application**
```bash
pnpm build
```

3. **Test production build locally**
```bash
cd apps/web
pnpm start
```

## Step 5: Deploy to Hostinger

### Option A: Using cPanel (Recommended for Hostinger)

1. **Build locally**
```bash
pnpm build
```

2. **Upload via FTP/SFTP**
- Upload `apps/web/.next` folder
- Upload `apps/web/public` folder  
- Upload `apps/web/package.json`
- Upload `node_modules` (or run `npm install --production` on server)

3. **Configure Node.js App in cPanel**
- Application Root: `/home/username/acrely`
- Application URL: `acrely.pinnaclebuilders.com`
- Application Startup File: `apps/web/server.js`

4. **Create startup file** (`apps/web/server.js`)
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = process.env.PORT || 3000
const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
```

### Option B: Using GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Hostinger
        uses: SamKirkland/FTP-Deploy-Action@4.3.3
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./apps/web/.next/
          server-dir: /public_html/acrely/
```

## Step 6: Post-Deployment Verification

### 1. Test Database Connection
```bash
curl -X POST https://your-project.supabase.co/rest/v1/customers?select=count \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### 2. Test Edge Functions
```bash
# Test send-sms function
curl -X POST https://your-project.supabase.co/functions/v1/send-sms \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+234...", "message":"Test message"}'
```

### 3. Test Web Application
- Visit: `https://acrely.pinnaclebuilders.com`
- Login with test credentials
- Verify all dashboards load
- Test create customer
- Test record payment
- Verify SMS is sent

## Step 7: Seed Initial Data

1. **Create admin user**
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (id, email, encrypted_password)
VALUES (gen_random_uuid(), 'admin@pinnaclebuilders.com', crypt('SecurePassword123', gen_salt('bf')));

INSERT INTO public.users (id, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@pinnaclebuilders.com'),
  'admin@pinnaclebuilders.com',
  'System Administrator',
  'SysAdmin'
);
```

2. **Add default settings**
```sql
INSERT INTO public.settings (key, value, description) VALUES
('default_commission_rate', '5', 'Default commission rate percentage'),
('sms_sender_id', 'Pinnacle', 'Default SMS sender ID'),
('payment_reminder_days', '7', 'Days before sending payment reminder');
```

## Monitoring and Maintenance

### 1. Set Up Monitoring
- Enable Supabase database logs
- Monitor Edge Function execution logs
- Set up error alerts via email

### 2. Backup Strategy
```bash
# Automated daily backups (Supabase handles this)
# Manual backup:
supabase db dump -f backup_$(date +%Y%m%d).sql
```

### 3. Regular Maintenance
- Weekly: Review overdue payments report
- Monthly: Check commission calculations
- Quarterly: Database performance optimization

## Troubleshooting

### Issue: Edge Functions not responding
**Solution:**
```bash
# Check function logs
supabase functions logs send-sms --tail

# Redeploy function
supabase functions deploy send-sms
```

### Issue: SMS not sending
**Solution:**
- Verify Termii API key is correct
- Check Termii account balance
- Review Edge Function logs

### Issue: RLS policies blocking access
**Solution:**
```sql
-- Check user role
SELECT * FROM public.users WHERE id = auth.uid();

-- Review policy logs
SELECT * FROM pg_policies WHERE tablename = 'customers';
```

## Security Checklist

- [ ] All RLS policies enabled
- [ ] Environment variables secured
- [ ] Service role key never exposed to client
- [ ] HTTPS enforced on web app
- [ ] Strong password policy enforced
- [ ] Audit logs monitored regularly
- [ ] Regular security updates applied

## Support and Contacts

- **Developer:** Kennedy — Landon Digital
- **Email:** support@landondigital.com
- **Documentation:** See README.md
- **Issue Tracker:** GitHub Issues

---

**Last Updated:** November 11, 2025  
**Version:** 1.1.0
