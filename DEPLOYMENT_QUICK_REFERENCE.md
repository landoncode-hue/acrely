# Acrely v2 - Deployment Quick Reference Card

**Version:** 2.0.0 | **Target:** https://acrely.pinnaclegroups.ng | **Status:** Production Ready ✅

---

## 🎯 One-Page Deployment Guide

### Prerequisites (5 minutes)
```bash
✓ Node.js 20+, pnpm 9+
✓ Supabase project created
✓ Hostinger account ready
✓ Termii API key
✓ Domain configured with SSL
```

---

## 🚀 Three Ways to Deploy

### Option 1: Full Automation (Fastest - 30 mins)
```bash
# 1. Setup environment
cp .env.production.example .env.production
# Fill in actual values

# 2. One command deploy
pnpm production:full-deploy

# Done! ✅
```

### Option 2: GitHub Actions (Recommended)
```bash
# 1. Add GitHub Secrets (Settings → Secrets → Actions)
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
FTP_SERVER, FTP_USERNAME, FTP_PASSWORD

# 2. Push to main
git checkout main
git merge develop
git push origin main

# 3. Monitor
https://github.com/YOUR_ORG/Acrely/actions
```

### Option 3: Manual Step-by-Step
```bash
# Step 1: Setup (15 min)
pnpm production:setup

# Step 2: Deploy (45 min)
pnpm production:deploy

# Step 3: Verify (20 min)
pnpm production:verify

# Step 4: Hostinger (20 min)
pnpm production:deploy-hostinger
```

---

## 📝 Essential Scripts

```bash
# Production
pnpm production:setup              # Configure environment
pnpm production:deploy             # Full deployment
pnpm production:verify             # Verify deployment
pnpm production:deploy-hostinger   # FTP to Hostinger
pnpm production:full-deploy        # All-in-one

# Development
pnpm dev                          # Start dev server
pnpm build                        # Build production
pnpm test:e2e                     # Run E2E tests

# Database
pnpm db:push                      # Apply migrations
pnpm db:reset                     # Reset database

# Functions
pnpm functions:deploy             # Deploy all functions
pnpm functions:deploy:maintenance # Deploy maintenance functions
```

---

## 🔑 Required Environment Variables

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_PROJECT_REF=xxx

# Termii SMS (REQUIRED)
TERMII_API_KEY=xxx
TERMII_SENDER_ID=Pinnacle

# Company (REQUIRED)
COMPANY_NAME=Pinnacle Builders Homes & Properties
COMPANY_EMAIL=info@pinnaclegroups.ng
COMPANY_PHONE=+234XXXXXXXXXX
ORG_ID=PBLD001

# Security (REQUIRED)
JWT_SECRET=xxx (min 32 chars)
NODE_ENV=production
```

---

## ✅ Verification Checklist

### Automated Tests (40+ checks)
```bash
./scripts/verify-production.sh
```

**Expected:** All green ✅
- DNS & SSL
- Website accessible
- Supabase API
- Edge functions (13)
- Database tables
- Storage buckets

### Manual Smoke Test (10 min)
- [ ] Login works (all roles)
- [ ] Create customer
- [ ] Record payment
- [ ] Receipt generated
- [ ] SMS sent
- [ ] Reports work

---

## 🎯 Success Criteria

| Metric | Target | Check |
|--------|--------|-------|
| Website HTTPS | ✅ Valid SSL | curl -I https://acrely.pinnaclegroups.ng |
| Load Time | < 2s | Lighthouse test |
| Functions | 13 deployed | supabase functions list |
| Migrations | 22 applied | supabase db remote get-version |
| Cron Jobs | 7 active | Check SQL: SELECT * FROM cron.job |

---

## 🆘 Quick Troubleshooting

### Issue: Build Failed
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

### Issue: Supabase Connection Error
```bash
# Relink project
cd supabase
supabase link --project-ref YOUR_REF
```

### Issue: Functions Not Responding
```bash
# Redeploy specific function
cd supabase
supabase functions deploy FUNCTION_NAME
```

### Issue: SMS Not Sending
```bash
# Check Termii balance & logs
# Verify TERMII_API_KEY in Supabase secrets
supabase secrets list
```

---

## 🔄 Rollback (Emergency)

```bash
# 1. Stop Hostinger app (cPanel)

# 2. Restore from backup
cd backups/deployment-YYYYMMDD-HHMMSS
# Upload via FTP

# 3. Restart app (cPanel)

# 4. If database issue:
cd supabase
supabase db reset --version PREVIOUS_VERSION
```

---

## 📞 Emergency Contacts

**Technical:** dev@landondigital.com  
**Business:** info@pinnaclegroups.ng  
**Emergency:** +234XXXXXXXXXX

---

## 📚 Full Documentation

| Document | Purpose | Lines |
|----------|---------|-------|
| [PRODUCTION_LAUNCH_GUIDE.md](./PRODUCTION_LAUNCH_GUIDE.md) | Quick start guide | 670 |
| [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) | Complete checklist | 475 |
| [PRODUCTION_DEPLOYMENT_ROADMAP.md](./PRODUCTION_DEPLOYMENT_ROADMAP.md) | Detailed roadmap | 524 |
| [DEPLOYMENT_QUEST_COMPLETE.md](./DEPLOYMENT_QUEST_COMPLETE.md) | Quest summary | 519 |
| [tests/uat/UAT_TEST_SPECIFICATION.md](./tests/uat/UAT_TEST_SPECIFICATION.md) | UAT tests | 530 |

---

## ⏱️ Timeline Estimate

```
┌─────────────────────────────────────────┐
│  Phase          │  Time    │  Status    │
├─────────────────────────────────────────┤
│  Setup          │  15 min  │  ⏳        │
│  Database       │  10 min  │  ⏳        │
│  Functions      │  15 min  │  ⏳        │
│  Build          │  10 min  │  ⏳        │
│  Deploy         │  20 min  │  ⏳        │
│  Cron Jobs      │  10 min  │  ⏳        │
│  Verify         │  20 min  │  ⏳        │
│  UAT            │  30 min  │  ⏳        │
├─────────────────────────────────────────┤
│  TOTAL          │ ~2.5 hrs │            │
└─────────────────────────────────────────┘
```

---

## 🎉 Post-Deployment

```bash
# 1. Run full verification
pnpm production:verify

# 2. Execute UAT
# See: tests/uat/UAT_TEST_SPECIFICATION.md

# 3. Monitor (first 48 hours)
# - Check logs every 2 hours
# - Monitor performance
# - Gather user feedback

# 4. Celebrate! 🎊
```

---

**Print this page for quick reference during deployment!**

**Version:** 1.0 | **Last Updated:** Nov 11, 2025 | **Status:** Ready ✅
