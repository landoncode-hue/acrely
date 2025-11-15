# Mobile App Build, E2E Testing & CI/CD Deployment Guide

## 🎯 Overview

This guide covers the complete setup, testing, and deployment workflow for the Acrely Mobile app, including:
- Mobile app development and testing
- E2E testing with Playwright
- CI/CD pipelines (GitHub Actions)
- Android APK/AAB builds
- iOS TestFlight preparation
- Vercel deployment for web

---

## 📱 Mobile App Setup

### Prerequisites

```bash
# Required tools
node >= 20.0.0
pnpm >= 9.0.0
eas-cli (Expo Application Services)
```

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Environment Configuration

The mobile app uses environment variables from:
1. `apps/mobile/.env` - Local development
2. `apps/mobile/eas.json` - Build configurations

**Environment Variables:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_COMPANY_NAME=Pinnacle Builders Homes & Properties
```

---

## 🏗️ Mobile App Development

### Local Development

```bash
# Install dependencies
pnpm install

# Start Expo dev server
cd apps/mobile
pnpm start

# Or from root
pnpm dev:mobile
```

### Testing on Physical Devices

1. **Using Expo Go (Recommended for Development)**
   ```bash
   pnpm start
   # Scan QR code with Expo Go app
   # iOS: Camera app
   # Android: Expo Go app
   ```

2. **Ensure same WiFi network** for dev machine and mobile device

### Key Mobile Features Implemented

- ✅ Authentication (Login/Signup)
- ✅ Agent Dashboard with stats
- ✅ Customer Management (List, Details)
- ✅ Payment Recording
- ✅ Receipt Viewing and Sharing
- ✅ Executive Dashboard (for CEO/MD/SysAdmin)
- ✅ Supabase integration with RLS

---

## 📦 Building Mobile Apps

### Build Profiles

We have 3 build profiles in `eas.json`:

1. **Development** - For development builds with expo-dev-client
2. **Preview** - Internal testing builds (APK for Android)
3. **Production** - App Store/Play Store releases (AAB/IPA)

### Android APK Build (Internal Testing)

```bash
cd apps/mobile

# Preview APK (fastest for testing)
pnpm build:preview

# Or use the shorthand
eas build --platform android --profile preview
```

**Build Configuration:**
- Build type: APK
- Distribution: Internal
- Environment: Preview environment variables

### Android AAB Build (Production)

```bash
cd apps/mobile

# Production build
pnpm build:android

# Or
eas build --platform android --profile production
```

**Build Configuration:**
- Build type: App Bundle (AAB)
- Distribution: Store
- Environment: Production environment variables

### iOS Build (TestFlight/App Store)

```bash
cd apps/mobile

# Preview build
pnpm build:preview:ios

# Production build
pnpm build:ios

# Or
eas build --platform ios --profile production
```

**Requirements:**
- Apple Developer Account ($99/year)
- Configured in `eas.json` submit section
- Bundle identifier: `ng.pinnaclegroups.acrely`

### Local APK Build (No EAS Build Minutes)

```bash
cd apps/mobile
pnpm build:apk
# This builds locally without using EAS cloud minutes
```

---

## 🧪 E2E Testing Setup

### Test Environment Architecture

We use an **isolated test schema** in Supabase:
- Schema name: `test`
- Completely separate from production data
- RLS enabled with fully open policies (using `true`)
- Automated reset between test runs

### Prerequisites

```bash
# Install Playwright browsers
pnpm exec playwright install --with-deps
```

### Environment Configuration

Test environment uses `.env.test.local`:
```env
TEST_MODE=true
NEXT_PUBLIC_TEST_SCHEMA=test
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test suites
pnpm test:e2e:auth          # Authentication tests
pnpm test:e2e:critical      # Critical path tests
pnpm test:e2e:regression    # Full regression suite
pnpm test:e2e:mobile-sync   # Mobile-web sync tests

# Run with UI
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug

# View reports
pnpm test:e2e:report
```

### Test Database Reset

```bash
# Manual reset
cd scripts
./reset-test-schema.sh

# Or via npm script
pnpm test:e2e:reset-db
```

### Available Test Suites

Located in `tests/e2e/`:
- `auth.spec.ts` - Authentication flows
- `critical-path.spec.ts` - Critical business flows
- `customers.spec.ts` - Customer management
- `payments.spec.ts` - Payment recording
- `receipts.spec.ts` - Receipt generation
- `allocations.spec.ts` - Allocation management
- `mobile-web-sync.spec.ts` - Mobile-web feature parity
- `production-readiness.spec.ts` - Production checks
- `regression-suite.spec.ts` - Full regression

---

## 🚀 CI/CD Pipelines

### GitHub Actions Workflows

We have 2 main workflows:

#### 1. Web CI/CD (`.github/workflows/web-ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- PRs to `main` or `develop`
- Changes in `apps/web/`, `packages/`, or workflows

**Jobs:**
1. **Lint & Type Check** - Code quality
2. **Build** - Build web app and shared packages
3. **E2E Tests** - Run Playwright tests
4. **Deploy** - Deploy to Vercel (on main branch)

**Environment Secrets Required:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

#### 2. Mobile CI/CD (`.github/workflows/mobile-ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- PRs to `main` or `develop`
- Changes in `apps/mobile/`, `packages/`, or workflows

**Jobs:**
1. **Lint** - Code quality check
2. **Build Preview** - APK build for PRs
3. **Build Production** - AAB/IPA for main branch

**Environment Secrets Required:**
```
EXPO_TOKEN
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### Setting Up GitHub Secrets

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

**For Web CI:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

**For Mobile CI:**
```bash
EXPO_TOKEN=your_expo_token
EXPO_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Getting Required Tokens

**Expo Token:**
```bash
eas login
eas whoami
# Get token from: https://expo.dev/accounts/[account]/settings/access-tokens
```

**Vercel Token:**
```bash
# Visit: https://vercel.com/account/tokens
# Create a new token with deployment permissions
```

**Vercel Org & Project IDs:**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Get IDs from .vercel/project.json
```

---

## 🌐 Vercel Deployment

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Automatic Deployment (CI/CD)

Deployments happen automatically:
- **PRs** → Preview deployment
- **Main branch** → Production deployment

### Vercel Configuration

Located in `vercel.json`:
```json
{
  "buildCommand": "pnpm --filter=@acrely/web run build",
  "devCommand": "pnpm --filter=@acrely/web run dev",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs"
}
```

### Environment Variables in Vercel

Set in Vercel Dashboard → Project Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
TERMII_API_KEY
```

---

## 📲 App Store Submission

### Android (Google Play)

1. **Build Production AAB:**
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```

2. **Download AAB from Expo:**
   - Visit: https://expo.dev/accounts/[account]/projects/acrely-mobile/builds
   - Download the AAB file

3. **Submit to Play Store:**
   ```bash
   eas submit --platform android
   ```

   Or manually upload to Google Play Console

**Requirements:**
- Google Play Developer account ($25 one-time)
- App signing key (handled by EAS)
- Service account JSON (for automated submission)

### iOS (App Store)

1. **Build Production IPA:**
   ```bash
   cd apps/mobile
   eas build --platform ios --profile production
   ```

2. **Submit to TestFlight/App Store:**
   ```bash
   eas submit --platform ios
   ```

**Requirements:**
- Apple Developer account ($99/year)
- App Store Connect access
- Bundle ID: `ng.pinnaclegroups.acrely`
- Update `eas.json` with Apple credentials

---

## 🧪 Testing Checklist

### Pre-Build Testing

- [ ] Login/Logout works on mobile
- [ ] Customer list loads correctly
- [ ] Customer details page displays data
- [ ] Payment recording saves to Supabase
- [ ] Receipts can be viewed/shared
- [ ] Dashboard stats are accurate
- [ ] App works on 3+ physical devices
- [ ] Works on both Android & iOS (if applicable)

### E2E Testing

- [ ] All Playwright tests pass
- [ ] Test schema isolated from production
- [ ] Automated DB reset works
- [ ] CI tests run successfully
- [ ] No flaky tests in CI

### CI/CD Testing

- [ ] Web builds successfully in CI
- [ ] Mobile builds successfully in CI
- [ ] E2E tests pass in CI
- [ ] Vercel deployments work
- [ ] No secrets leaked in logs

---

## 🐛 Troubleshooting

### Mobile Build Issues

**Issue: Build fails with "Unable to resolve module"**
```bash
# Clear cache and reinstall
cd apps/mobile
rm -rf node_modules
pnpm install
```

**Issue: EAS build fails**
```bash
# Check EAS status
eas build:list

# View build logs
eas build:view [build-id]
```

### E2E Test Issues

**Issue: Tests fail locally but pass in CI**
```bash
# Use same Node version as CI
nvm use 20

# Clear Playwright cache
pnpm exec playwright install --force
```

**Issue: Test database has stale data**
```bash
# Reset test schema
./scripts/reset-test-schema.sh
```

### Vercel Deployment Issues

**Issue: Build fails with "Module not found"**
```bash
# Check build command in vercel.json
# Ensure outputDirectory is correct
# Verify pnpm workspace configuration
```

**Issue: Environment variables not working**
- Check Vercel Dashboard → Environment Variables
- Ensure variables are set for Production/Preview/Development
- Redeploy after adding variables

---

## 📊 Build Artifacts

### Generated Files

After successful builds:
```
Mobile Builds:
- Android APK: ~50-80MB
- Android AAB: ~30-50MB
- iOS IPA: ~40-70MB

Web Builds:
- .next/ directory
- Deployed to Vercel CDN

Test Reports:
- playwright-report/
- test-results/results.json
```

### Download Links

**Mobile Builds:**
- Expo Dashboard: https://expo.dev/accounts/[account]/projects/acrely-mobile/builds

**Web Deployments:**
- Vercel Dashboard: https://vercel.com/[account]/[project]/deployments

**Test Reports:**
- GitHub Actions Artifacts (retained 30 days)

---

## ✅ Acceptance Criteria

### Mobile App
- [x] Installs on Android devices
- [x] Logs in successfully
- [x] Creates allocations without crashes
- [x] Records payments correctly
- [x] Views and shares receipts
- [x] Syncs with Supabase in real-time

### E2E Testing
- [x] Playwright tests configured
- [x] Isolated test schema setup
- [x] Automated DB reset available
- [x] Tests pass consistently
- [x] HTML reports generated

### CI/CD
- [x] GitHub Actions workflows created
- [x] Web CI pipeline functional
- [x] Mobile CI pipeline functional
- [x] Vercel auto-deployment configured
- [x] EAS builds in CI
- [x] Tests block bad code

---

## 🚀 Quick Commands Reference

```bash
# Development
pnpm dev:mobile              # Start mobile dev server
pnpm dev                     # Start web dev server

# Mobile Builds
pnpm --filter=@acrely/mobile build:preview        # Preview APK
pnpm --filter=@acrely/mobile build:production     # Production AAB/IPA
pnpm --filter=@acrely/mobile build:apk            # Local APK build

# Testing
pnpm test:e2e                # Run all E2E tests
pnpm test:e2e:ui             # Run with UI
pnpm test:e2e:critical       # Run critical tests
pnpm test:e2e:report         # View test report

# Deployment
vercel --prod                # Deploy web to production
eas submit --platform android # Submit to Play Store
eas submit --platform ios     # Submit to App Store

# Database
./scripts/reset-test-schema.sh  # Reset test DB
```

---

## 📝 Next Steps

1. **Configure GitHub Secrets** - Add required tokens
2. **Test Locally** - Run mobile app and E2E tests
3. **Build Preview APK** - Test on physical devices
4. **Push to GitHub** - Trigger CI/CD pipelines
5. **Monitor Builds** - Check GitHub Actions
6. **Deploy to Stores** - Submit to Play Store/TestFlight

---

## 🎉 Success Metrics

- ✅ CI blocks bad code from merging
- ✅ Only green builds deploy to production
- ✅ Mobile app installs successfully
- ✅ E2E tests pass against staging
- ✅ Vercel deploys complete with no errors
- ✅ Mobile app tested on 3+ devices
- ✅ APK/AAB generated successfully

---

**Last Updated:** November 2025  
**Version:** 2.1.0  
**Maintainer:** Acrely Development Team
