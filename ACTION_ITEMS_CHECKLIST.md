# ✅ Acrely Superquest 3: Action Items Checklist

**Status:** Ready for Production Deployment  
**Date:** November 15, 2025

---

## 🎯 Immediate Action Items (Required Before First Build)

### 1. Configure GitHub Secrets (15 minutes)

**Location:** GitHub Repository → Settings → Secrets and variables → Actions

**Add these secrets:**

```bash
# Expo (Mobile CI)
EXPO_TOKEN=<get from https://expo.dev/accounts/[account]/settings/access-tokens>

# Vercel (Web CI)
VERCEL_TOKEN=<get from https://vercel.com/account/tokens>
VERCEL_ORG_ID=<from .vercel/project.json>
VERCEL_PROJECT_ID=<from .vercel/project.json>

# Supabase (Both)
EXPO_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA
```

**How to get tokens:**

```bash
# Expo Token
eas login
# Visit: https://expo.dev/accounts/[your-account]/settings/access-tokens
# Create new token, copy it

# Vercel Token & IDs
npm i -g vercel
vercel login
vercel link
cat .vercel/project.json  # Get org_id and project_id
# Visit: https://vercel.com/account/tokens to create token
```

- [ ] EXPO_TOKEN added
- [ ] VERCEL_TOKEN added
- [ ] VERCEL_ORG_ID added
- [ ] VERCEL_PROJECT_ID added
- [ ] Supabase URLs added
- [ ] Supabase keys added

---

### 2. Test Locally Before CI (30 minutes)

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Install Playwright
pnpm exec playwright install --with-deps chromium

# Test E2E suite
pnpm test:e2e --project=chromium

# View report
pnpm test:e2e:report
```

**Expected:** All tests pass ✅

- [ ] Dependencies installed
- [ ] Playwright browsers installed
- [ ] E2E tests pass locally
- [ ] Test report accessible

---

### 3. Test Mobile App Locally (30 minutes)

```bash
# Start mobile dev server
pnpm dev:mobile

# Or
cd apps/mobile
pnpm start
```

**Then:**
1. Install Expo Go on your phone:
   - iOS: App Store → "Expo Go"
   - Android: Play Store → "Expo Go"

2. Scan QR code from terminal

3. Test these flows:
   - [ ] Login works
   - [ ] Dashboard loads
   - [ ] Customer list displays
   - [ ] Payment can be recorded
   - [ ] Receipts can be viewed

---

### 4. Build First Preview APK (20 minutes)

```bash
cd apps/mobile

# Login to Expo (if not already)
eas login

# Build preview APK
eas build --platform android --profile preview
```

**Monitor build:**
- Visit: https://expo.dev/accounts/[account]/projects/acrely-mobile/builds
- Wait 15-20 minutes
- Download APK when ready

- [ ] EAS login successful
- [ ] Build started
- [ ] Build completed successfully
- [ ] APK downloaded

---

### 5. Test on Physical Devices (1-2 hours)

**Minimum 3 devices recommended:**
- [ ] Android phone (version 8.0+)
- [ ] Android tablet (optional)
- [ ] iPhone (if iOS build made)

**Test all critical flows:**
- [ ] Install APK successfully
- [ ] Login with test credentials
- [ ] Dashboard displays correctly
- [ ] Customer list loads
- [ ] Customer details page works
- [ ] Payment recording saves
- [ ] Receipt viewing works
- [ ] Receipt sharing works
- [ ] Logout and re-login
- [ ] No crashes during testing

---

### 6. Push to GitHub & Monitor CI (30 minutes)

```bash
# Ensure everything is committed
git add .
git commit -m "feat: complete mobile app, E2E testing, and CI/CD setup"
git push origin main
```

**Monitor in real-time:**
1. Go to: https://github.com/[username]/[repo]/actions
2. Watch workflows run:
   - Web CI/CD
   - Mobile CI/CD

**Expected results:**
- [ ] Web CI: Lint ✅
- [ ] Web CI: Build ✅
- [ ] Web CI: E2E Tests ✅
- [ ] Web CI: Deploy ✅
- [ ] Mobile CI: Lint ✅
- [ ] Mobile CI: Build Production ✅

---

## 📅 Post-Deployment Tasks (Next 24-48 hours)

### 7. Verify Web Deployment

**Check Vercel:**
- [ ] Visit Vercel dashboard
- [ ] Check deployment status
- [ ] Visit deployed URL
- [ ] Test login on production
- [ ] Verify all pages load

**URL:** Check Vercel dashboard for deployment URL

---

### 8. Verify Mobile Build Artifacts

**Check Expo Dashboard:**
- [ ] Build shows as "Finished"
- [ ] APK is downloadable
- [ ] Build size is reasonable (~50-80MB)
- [ ] No build warnings/errors

**Download links:**
- [ ] APK downloaded from Expo
- [ ] Shared with team for testing

---

### 9. Test CI/CD Pipeline with PR

```bash
# Create test branch
git checkout -b test/ci-verification

# Make small change
echo "# CI Test" >> README.md
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push origin test/ci-verification
```

**On GitHub:**
1. Create Pull Request
2. Verify CI runs automatically
3. Check preview builds are created
4. Verify tests pass
5. Merge PR

- [ ] PR created
- [ ] CI triggered automatically
- [ ] All checks passed
- [ ] Preview deployment created
- [ ] PR merged successfully

---

## 🔄 Ongoing Maintenance Items

### Weekly Tasks

- [ ] Monitor CI/CD success rate (target >95%)
- [ ] Check E2E test results
- [ ] Review build times
- [ ] Check for failed deployments

### Monthly Tasks

- [ ] Update dependencies (`pnpm update`)
- [ ] Rotate access tokens
- [ ] Review and clean old builds
- [ ] Update documentation if needed

### Quarterly Tasks

- [ ] Major dependency updates (Expo SDK, Next.js)
- [ ] Review and optimize E2E tests
- [ ] Performance audit
- [ ] Security audit

---

## 🚀 Store Submission Preparation (When Ready)

### Google Play Store

**Prerequisites:**
- [ ] Google Play Developer account ($25 one-time)
- [ ] Production AAB built
- [ ] App signing configured

**Steps:**
1. Build production AAB:
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```

2. Download AAB from Expo

3. Submit to Play Store:
   ```bash
   eas submit --platform android
   ```
   Or manually via Google Play Console

**Checklist:**
- [ ] App icon finalized
- [ ] Screenshots prepared (phone + tablet)
- [ ] App description written
- [ ] Privacy policy URL ready
- [ ] Terms of service URL ready
- [ ] Content rating completed
- [ ] Pricing set (Free)

---

### Apple App Store (iOS)

**Prerequisites:**
- [ ] Apple Developer account ($99/year)
- [ ] Bundle ID registered: `ng.pinnaclegroups.acrely`
- [ ] Production IPA built

**Steps:**
1. Update `eas.json` with Apple credentials

2. Build production IPA:
   ```bash
   cd apps/mobile
   eas build --platform ios --profile production
   ```

3. Submit to TestFlight:
   ```bash
   eas submit --platform ios
   ```

**Checklist:**
- [ ] Apple Developer account active
- [ ] App Store Connect access
- [ ] Bundle ID configured
- [ ] App privacy details filled
- [ ] Age rating completed
- [ ] Screenshots prepared (all device sizes)

---

## 🎓 Team Onboarding Checklist

**For new developers joining the project:**

### Environment Setup
- [ ] Node.js 20+ installed
- [ ] pnpm 9+ installed
- [ ] Git configured
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)

### Tool Setup
- [ ] Expo CLI installed (`npm i -g eas-cli`)
- [ ] Expo account created
- [ ] Vercel CLI installed (optional)
- [ ] Playwright browsers installed

### Access Setup
- [ ] Added to GitHub repository
- [ ] Added to Expo organization
- [ ] Added to Vercel project (if needed)
- [ ] Supabase dashboard access (if needed)

### Documentation Review
- [ ] Read `MOBILE_BUILD_DEPLOYMENT_GUIDE.md`
- [ ] Read `CI_CD_SETUP.md`
- [ ] Review `QUICK_REFERENCE.md`
- [ ] Understand E2E testing workflow

### First Tasks
- [ ] Run mobile app locally
- [ ] Run web app locally
- [ ] Run E2E tests locally
- [ ] Make test commit and PR

---

## 📊 Success Metrics Dashboard

**Monitor these weekly:**

| Metric | Target | How to Check |
|--------|--------|-------------|
| CI Success Rate | >95% | GitHub Actions |
| E2E Test Pass Rate | 100% | Test reports |
| Web Build Time | <5 min | GitHub Actions |
| Mobile Build Time | <25 min | Expo Dashboard |
| Deployment Frequency | Daily+ | Vercel Dashboard |
| Failed Deployments | <5% | Vercel Dashboard |

---

## 🐛 Troubleshooting Quick Links

**If something goes wrong:**

1. **Mobile build fails:**
   - Check: `CI_CD_SETUP.md` → "Common Issues"
   - Command: `eas build:list`
   - Logs: Expo Dashboard → Build Details

2. **E2E tests fail:**
   - Check: `MOBILE_BUILD_DEPLOYMENT_GUIDE.md` → "Troubleshooting"
   - Reset: `./scripts/reset-test-schema.sh`
   - Debug: `pnpm test:e2e:debug`

3. **Vercel deploy fails:**
   - Check secrets in GitHub
   - Run: `vercel --debug`
   - Check build logs in Vercel dashboard

4. **Auth not working:**
   - Verify Supabase URL/keys
   - Check RLS policies
   - Test in Supabase dashboard

---

## ✅ Final Pre-Production Checklist

**Before announcing to users:**

### Technical
- [ ] All CI/CD pipelines green
- [ ] E2E tests passing
- [ ] Mobile app tested on 3+ devices
- [ ] Web app loads on production
- [ ] Database migrations applied
- [ ] Environment variables configured

### Content
- [ ] App store listings prepared
- [ ] User documentation written
- [ ] Support channels ready
- [ ] Privacy policy published
- [ ] Terms of service published

### Team
- [ ] Support team trained
- [ ] Monitoring alerts configured
- [ ] Incident response plan ready
- [ ] Rollback procedure documented

---

## 🎉 Completion Criteria

**Superquest 3 is 100% complete when:**

- ✅ GitHub secrets configured
- ✅ Local tests passing
- ✅ Mobile app tested on devices
- ✅ First CI/CD pipeline run successful
- ✅ Production deployment verified
- ✅ APK built and distributed
- ✅ Documentation reviewed by team

---

## 📞 Support Resources

**If you need help:**

1. **Documentation:**
   - `MOBILE_BUILD_DEPLOYMENT_GUIDE.md` - Complete mobile guide
   - `CI_CD_SETUP.md` - 15-min CI/CD setup
   - `QUICK_REFERENCE.md` - Quick commands
   - `SUPERQUEST_3_COMPLETION_REPORT.md` - Technical details

2. **External Resources:**
   - Expo Docs: https://docs.expo.dev
   - Playwright Docs: https://playwright.dev
   - Vercel Docs: https://vercel.com/docs
   - GitHub Actions: https://docs.github.com/en/actions

3. **Community:**
   - Expo Discord
   - React Native Community
   - Supabase Discord

---

**Good luck with your deployment! 🚀**

---

**Last Updated:** November 15, 2025  
**Maintainer:** Acrely Development Team  
**Version:** 2.1.0
