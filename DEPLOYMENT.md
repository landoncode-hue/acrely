# Deployment Guide - Acrely v2

## Overview

This guide covers deploying Acrely v2 to production environments:
- **Web App**: Hostinger
- **Backend**: Supabase Cloud
- **Mobile**: Expo EAS
- **SMS**: Termii

---

## Prerequisites

- [x] Supabase account and project created
- [x] Hostinger hosting account
- [x] Termii API account and credits
- [x] GitHub repository set up
- [x] Domain configured (acrely.pinnaclegroups.ng)

---

## 1. Supabase Setup

### 1.1 Create Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project: `acrely-production`
3. Save your credentials:
   - Project URL
   - Anon Key
   - Service Role Key

### 1.2 Run Migrations

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Link to your project
cd supabase
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Verify tables created
supabase db diff
```

### 1.3 Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy generate-receipt
supabase functions deploy commission-calculation
supabase functions deploy commission-claim
supabase functions deploy check-overdue-payments
supabase functions deploy send-sms
supabase functions deploy bulk-sms-campaign

# Set environment secrets
supabase secrets set TERMII_API_KEY=your_key
supabase secrets set COMPANY_NAME="Pinnacle Builders Homes & Properties"
supabase secrets set COMPANY_EMAIL=noreply@pinnaclegroups.ng
supabase secrets set COMPANY_PHONE="+234XXXXXXXXXX"
supabase secrets set COMPANY_ADDRESS="Edo, Nigeria"
```

### 1.4 Configure Scheduled Functions

Set up cron jobs in Supabase Dashboard:

```sql
-- Daily overdue payment check (runs at 9 AM daily)
SELECT cron.schedule(
  'check-overdue-payments',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-overdue-payments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

---

## 2. Web App Deployment (Hostinger)

### 2.1 Build Application

```bash
# Install dependencies
pnpm install

# Build web app
pnpm --filter @acrely/web build

# Output will be in apps/web/.next
```

### 2.2 Deploy to Hostinger

#### Option A: Git Deployment

1. Connect GitHub repository to Hostinger
2. Set build command: `pnpm install && pnpm --filter @acrely/web build`
3. Set start command: `cd apps/web && pnpm start`
4. Configure environment variables in Hostinger panel

#### Option B: Manual FTP Upload

```bash
# Build locally
pnpm build

# Upload these directories via FTP:
# - apps/web/.next
# - apps/web/public
# - apps/web/package.json
# - node_modules (or install on server)

# On server, run:
cd public_html/acrely
NODE_ENV=production pnpm start
```

### 2.3 Configure Environment Variables

In Hostinger control panel, add:

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

### 2.4 Configure Domain

1. Point `acrely.pinnaclegroups.ng` to Hostinger IP
2. Enable SSL certificate (Let's Encrypt)
3. Configure redirects (www → non-www)

---

## 3. Mobile App Deployment (Expo EAS)

### 3.1 Setup EAS

```bash
cd apps/mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

### 3.2 Build for Android

```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### 3.3 Build for iOS

```bash
# Requires Apple Developer account

# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## 4. GitHub Actions CI/CD

### 4.1 Configure Secrets

In GitHub repository settings → Secrets and variables → Actions:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_PROJECT_REF
SUPABASE_ACCESS_TOKEN
```

### 4.2 Workflow Triggers

- **Push to main**: Deploys to production
- **Push to develop**: Runs tests only
- **Pull requests**: Runs linting and type checking

---

## 5. Termii SMS Setup

### 5.1 Configure Account

1. Sign up at [Termii.com](https://termii.com)
2. Verify your account
3. Purchase SMS credits
4. Register sender ID: "Pinnacle"

### 5.2 Test SMS

```bash
# Test send-sms function
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-sms' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "+234XXXXXXXXXX",
    "message": "Test SMS from Acrely",
    "sender_id": "Pinnacle"
  }'
```

---

## 6. Post-Deployment Checks

### 6.1 Database

- [ ] All tables exist
- [ ] 24 plots seeded
- [ ] RLS policies active
- [ ] Indexes created

### 6.2 Edge Functions

- [ ] All 6 functions deployed
- [ ] Environment secrets set
- [ ] Cron job scheduled
- [ ] SMS test successful

### 6.3 Web Application

- [ ] Site accessible via domain
- [ ] SSL certificate active
- [ ] Environment variables loaded
- [ ] Authentication working

### 6.4 Monitoring

- [ ] Set up Supabase alerts
- [ ] Configure error logging
- [ ] Enable analytics
- [ ] Test backup/restore

---

## 7. Backup & Recovery

### 7.1 Database Backups

```bash
# Manual backup
supabase db dump > backup-$(date +%Y%m%d).sql

# Restore from backup
supabase db reset
psql -h YOUR_DB_HOST -U postgres -d postgres -f backup.sql
```

### 7.2 Automated Backups

Supabase Pro includes automatic daily backups. Enable in dashboard:
- Settings → Database → Point-in-time recovery

---

## 8. Monitoring & Maintenance

### 8.1 Daily Tasks

- Check overdue payments report
- Monitor SMS delivery rates
- Review error logs

### 8.2 Weekly Tasks

- Review commission pending approvals
- Check database performance
- Update content as needed

### 8.3 Monthly Tasks

- Review and optimize queries
- Update dependencies
- Security audit

---

## 9. Scaling Considerations

### When to Scale

- Database: > 10,000 allocations
- API: > 1M requests/month
- Storage: > 100GB

### Scaling Options

1. **Supabase**: Upgrade to Pro/Team plan
2. **Hostinger**: Add more resources or migrate to VPS
3. **SMS**: Increase Termii credit plan

---

## 10. Support & Troubleshooting

### Common Issues

**Database connection failed**
- Check Supabase project status
- Verify connection strings
- Check RLS policies

**SMS not sending**
- Verify Termii API key
- Check credit balance
- Validate phone number format

**Build errors**
- Clear .next and node_modules
- Run `pnpm install --force`
- Check Node.js version (>= 20)

### Support Contacts

- **Technical**: Kennedy — Landon Digital
- **Hosting**: Hostinger Support
- **Database**: Supabase Support
- **SMS**: Termii Support

---

## 11. Rollback Procedure

If deployment fails:

```bash
# Revert database migrations
supabase db reset

# Restore previous function version
supabase functions deploy FUNCTION_NAME --version PREVIOUS_VERSION

# Rollback web deployment
# (Use Hostinger's rollback feature or redeploy previous commit)
```

---

**Deployment Complete! 🎉**

Your Acrely v2 platform is now live and ready to manage real estate operations for Pinnacle Builders.
