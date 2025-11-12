# Pinnacle Builders Platform - Deployment Checklist

## 🎯 Pre-Deployment Verification

### Environment Configuration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update `SUPABASE_URL` with production URL
- [ ] Update `SUPABASE_ANON_KEY` with production anon key
- [ ] Update `SUPABASE_SERVICE_KEY` with production service key
- [ ] Update `TERMII_API_KEY` with production API key
- [ ] Update `COMPANY_PHONE` with actual phone number
- [ ] Verify `NEXT_PUBLIC_SITE_URL` points to acrely.pinnaclegroups.ng

### Database Setup
- [ ] Run migration: `20250111000000_remove_multitenant.sql`
- [ ] Run migration: `20250111000001_auth_restrictions.sql`
- [ ] Seed estates: `supabase/seed/estates.sql`
- [ ] Verify 8 estates exist in database
- [ ] Verify 40 plots exist in database
- [ ] Verify settings table contains company info
- [ ] Test RLS policies are active

### Authentication
- [ ] Disable public registration in Supabase Auth settings
- [ ] Test @pinnaclegroups.ng email can register
- [ ] Test @pinnaclebuilders.ng email can register
- [ ] Test other domains are rejected
- [ ] Create initial admin account

### Edge Functions
- [ ] Deploy `send-sms` function
- [ ] Deploy `generate-receipt` function
- [ ] Deploy `bulk-sms-campaign` function
- [ ] Deploy `commission-calculation` function
- [ ] Deploy `commission-claim` function
- [ ] Set environment variables in Supabase dashboard
- [ ] Test SMS sending with Termii
- [ ] Test receipt generation

### Frontend Assets
- [ ] Add Pinnacle Builders logo to `/apps/web/public/logo.svg`
- [ ] Add favicon to `/apps/web/public/favicon.ico`
- [ ] Add PWA icons (192x192, 512x512)
- [ ] Verify manifest.json is accessible
- [ ] Test responsive design on mobile
- [ ] Test all navigation links work

### Branding Verification
- [ ] Logo shows "Pinnacle Builders" on sidebar
- [ ] Company slogan visible everywhere
- [ ] Primary color (#0052CC) applied correctly
- [ ] Accent color (#0ABF53) used for highlights
- [ ] "Clients" terminology used (not "Customers")
- [ ] "Pinnacle Estates" in navigation
- [ ] Dashboard subtitle shows company name
- [ ] Receipt templates show branding

### Testing
- [ ] Run unit tests: `pnpm test`
- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Test user login flow
- [ ] Test customer/client creation
- [ ] Test plot allocation
- [ ] Test payment recording
- [ ] Test receipt generation
- [ ] Test SMS sending
- [ ] Test commission calculation

## 🚀 Deployment Steps

### 1. Database Deployment
```bash
# Connect to production Supabase
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Seed estates
psql $PRODUCTION_DATABASE_URL -f supabase/seed/estates.sql
```

### 2. Edge Functions Deployment
```bash
# Set environment variables in Supabase dashboard first
supabase functions deploy send-sms
supabase functions deploy generate-receipt
supabase functions deploy bulk-sms-campaign
supabase functions deploy commission-calculation
supabase functions deploy commission-claim
```

### 3. Web Application Deployment
```bash
# Install dependencies
pnpm install

# Build the application
cd apps/web
pnpm build

# Deploy to Hostinger
# (Follow Hostinger deployment guide)
# Upload build files to acrely.pinnaclegroups.ng
```

## ✅ Post-Deployment Verification

### Smoke Tests
- [ ] Visit https://acrely.pinnaclegroups.ng
- [ ] Verify site loads correctly
- [ ] Check meta tags in browser
- [ ] Test login with authorized email
- [ ] Navigate through all pages
- [ ] Create a test customer/client
- [ ] Create a test allocation
- [ ] Record a test payment
- [ ] Generate a test receipt
- [ ] Send a test SMS

### Security Checks
- [ ] HTTPS is enforced
- [ ] Environment variables are not exposed
- [ ] RLS policies are active
- [ ] Unauthorized emails cannot register
- [ ] API keys are secure
- [ ] No multi-tenant data exists

### Performance
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] No network errors
- [ ] Database queries optimized

### Monitoring
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Set up analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure Supabase alerts
- [ ] Set up backup schedule

## 📊 Production Checklist

### Must Have
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ Estates seeded
- ✅ Authentication locked
- ✅ Edge Functions deployed
- ✅ Frontend deployed
- ✅ Branding applied
- ✅ SSL/HTTPS enabled

### Should Have
- [ ] Error monitoring
- [ ] Analytics tracking
- [ ] Backup strategy
- [ ] Monitoring alerts
- [ ] Documentation updated
- [ ] Admin user created
- [ ] Support email configured

### Nice to Have
- [ ] Performance monitoring
- [ ] A/B testing setup
- [ ] Feature flags
- [ ] Automated backups
- [ ] CI/CD pipeline
- [ ] Staging environment

## 🔧 Troubleshooting

### Common Issues

**Issue:** SMS not sending
- Check TERMII_API_KEY is correct
- Verify sender ID is approved
- Check Edge Function logs

**Issue:** Receipt not generating
- Verify COMPANY_* environment variables are set
- Check Supabase Edge Function logs
- Ensure database permissions are correct

**Issue:** Login fails
- Verify Supabase URL and keys
- Check email domain whitelist
- Review auth trigger logs

**Issue:** Database errors
- Verify migrations ran successfully
- Check RLS policies
- Review Supabase logs

## 📝 Rollback Plan

If deployment fails:

1. **Database Rollback:**
   ```bash
   # Revert migrations
   supabase db reset
   ```

2. **Edge Functions:**
   - Redeploy previous version
   - Check function logs

3. **Frontend:**
   - Revert to previous deployment
   - Check error logs

## 🎉 Go-Live Checklist

- [ ] All pre-deployment checks passed
- [ ] All deployment steps completed
- [ ] All post-deployment verifications passed
- [ ] Team trained on new system
- [ ] Support channels ready
- [ ] Documentation accessible
- [ ] Backup plan in place
- [ ] Monitoring active

## 📞 Support Contacts

**Technical Support:**
- Developer: Kennedy — Landon Digital
- Email: [Your Support Email]

**Business Support:**
- Organization: Pinnacle Builders Homes & Properties
- Email: info@pinnaclegroups.ng
- Phone: +234XXXXXXXXXX

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  

**Status:** [ ] READY [ ] DEPLOYED [ ] VERIFIED
