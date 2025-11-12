# Acrely v2 - Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested locally
- [ ] Edge Functions tested locally
- [ ] All tests passing
- [ ] No linter errors
- [ ] Build successful locally
- [ ] Backup created

## Environment Variables

### Required for All Environments

Create `.env.local` (web) or `.env` (mobile):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Termii SMS API
TERMII_API_KEY=your-termii-api-key
TERMII_SENDER_ID=PinnacleB

# Company Configuration
COMPANY_NAME="Pinnacle Builders Homes & Properties"
COMPANY_EMAIL=info@pinnaclegroups.ng
COMPANY_PHONE=+234XXX

# Optional
NODE_ENV=production
```

### Mobile App (.env)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Deployment

### 1. Apply Migrations

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Verify migrations
supabase db remote commit

# Check migration status
supabase migration list
```

### 2. Seed Data (if needed)

```bash
# Apply seed data
psql $DATABASE_URL < supabase/seed/estates.sql
```

### 3. Enable Extensions

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

## Edge Functions Deployment

### 1. Set Secrets

```bash
# Set Termii API key
supabase secrets set TERMII_API_KEY=your-key

# Set Termii Sender ID
supabase secrets set TERMII_SENDER_ID=PinnacleB

# Set company details
supabase secrets set COMPANY_NAME="Pinnacle Builders Homes & Properties"
```

### 2. Deploy All Functions

```bash
# Deploy all Edge Functions
supabase functions deploy send-sms
supabase functions deploy generate-receipt
supabase functions deploy commission-calculation
supabase functions deploy check-overdue-payments
supabase functions deploy generate-billing-summary
supabase functions deploy predict-trends
supabase functions deploy backup-database
supabase functions deploy system-health-check
supabase functions deploy process-receipt-queue
supabase functions deploy process-sms-queue
supabase functions deploy bulk-sms-campaign
supabase functions deploy alert-notification
supabase functions deploy storage-cleanup
supabase functions deploy commission-claim
```

Or use the deployment script:

```bash
./scripts/deploy-production.sh
```

### 3. Configure Cron Jobs

```bash
# Apply cron job configuration
psql $DATABASE_URL < scripts/setup-cron-jobs.sql
```

## Web App Deployment (Hostinger)

### 1. Build Web App

```bash
cd apps/web
pnpm build
```

### 2. Deploy to Hostinger

```bash
# Using rsync
./scripts/deploy-to-hostinger.sh

# Or manual deployment
rsync -avz --delete apps/web/out/ user@acrely.pinnaclegroups.ng:/path/to/deployment/
```

### 3. Configure Web Server

Ensure your web server (Apache/Nginx) is configured for Next.js:

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name acrely.pinnaclegroups.ng;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Mobile App Deployment

### 1. Configure EAS

```bash
cd apps/mobile

# Login to Expo
eas login

# Configure project
eas build:configure
```

### 2. Build for Android

```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

### 3. Build for iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

### 4. Submit to Stores

```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

## Post-Deployment Verification

### 1. Run Verification Script

```bash
./scripts/verify-production.sh
```

### 2. Manual Checks

- [ ] Web app accessible at https://acrely.pinnaclegroups.ng
- [ ] User authentication working
- [ ] Database queries successful
- [ ] Edge Functions responding
- [ ] SMS sending functional
- [ ] Receipt generation working
- [ ] Cron jobs scheduled
- [ ] Mobile app installable

### 3. Test Critical Flows

```bash
# Run E2E tests against production
pnpm test:e2e:production
```

## Rollback Procedures

### Database Rollback

```bash
# List migrations
supabase migration list

# Revert to specific migration
supabase db reset --version YYYYMMDDHHMMSS
```

### Edge Function Rollback

```bash
# Deploy previous version
git checkout previous-tag
supabase functions deploy function-name
```

### Web App Rollback

```bash
# Deploy previous build
git checkout previous-tag
pnpm build
./scripts/deploy-to-hostinger.sh
```

## Monitoring Setup

### 1. Set Up Alerts

```sql
-- Create alert for critical errors
INSERT INTO notifications (user_id, title, message, type)
SELECT id, 'Critical Error', 'System error detected', 'error'
FROM users WHERE role IN ('CEO', 'MD', 'SysAdmin');
```

### 2. Configure Health Checks

Health checks run automatically via `system-health-check` Edge Function every 15 minutes.

### 3. Monitor Logs

```bash
# View Edge Function logs
supabase functions logs function-name --tail

# View database logs
supabase db logs --tail
```

## Backup and Recovery

### Automated Backups

Backups run daily at 23:59 UTC via the `backup-database` Edge Function.

### Manual Backup

```bash
# Create backup
supabase db dump -f backup-$(date +%Y%m%d).sql

# Or use Edge Function
curl -X POST \
  https://your-project.supabase.co/functions/v1/backup-database \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tables": ["customers", "allocations", "payments"]}'
```

### Restore from Backup

```bash
# Restore database
psql $DATABASE_URL < backup-20250119.sql
```

## Performance Optimization

### Database Indexes

Ensure all recommended indexes are created:

```sql
-- Verify indexes exist
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### CDN Configuration

Configure CDN for static assets:

```bash
# CloudFlare recommended settings
- Cache Level: Standard
- Browser Cache TTL: 4 hours
- Always Online: On
```

## Security Hardening

### 1. Review RLS Policies

```sql
-- Verify RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

### 2. Rotate Secrets

```bash
# Rotate API keys quarterly
supabase secrets set TERMII_API_KEY=new-key
```

### 3. Review User Permissions

```sql
-- Audit user roles
SELECT email, role FROM users;
```

## Troubleshooting

### Common Issues

**Issue**: Edge Function timeout
**Solution**: Increase timeout or optimize function

**Issue**: Database connection errors
**Solution**: Check connection pooling settings

**Issue**: SMS not sending
**Solution**: Verify Termii API key and balance

**Issue**: Receipt generation failing
**Solution**: Check storage bucket permissions

### Support Contacts

- **Technical Support**: support@pinnaclegroups.ng
- **Supabase Support**: https://supabase.com/support
- **Termii Support**: https://termii.com/support

---

**Version**: 2.5.0
**Last Updated**: 2025-01-19
**Maintained By**: Kennedy — Landon Digital
