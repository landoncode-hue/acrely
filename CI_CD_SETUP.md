# CI/CD Pipeline Setup Guide

## 🎯 Quick Setup

This guide will get your CI/CD pipelines running in **15 minutes**.

---

## 📋 Prerequisites Checklist

- [ ] GitHub repository initialized
- [ ] Expo account created
- [ ] Vercel account created
- [ ] Supabase project deployed
- [ ] Node.js 20+ installed
- [ ] pnpm 9+ installed

---

## 🔐 Step 1: Gather Required Credentials

### 1.1 Expo Token

```bash
# Login to Expo
eas login

# Create access token
# Visit: https://expo.dev/accounts/[your-account]/settings/access-tokens
# Click "Create" and copy the token
```

Save as: `EXPO_TOKEN`

### 1.2 Vercel Token & IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
cd /path/to/acrely
vercel link

# Get org and project IDs
cat .vercel/project.json
```

You'll get:
- `VERCEL_TOKEN` - From https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - From .vercel/project.json (`orgId`)
- `VERCEL_PROJECT_ID` - From .vercel/project.json (`projectId`)

### 1.3 Supabase Credentials

Already in your `.env` file:
```
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🔧 Step 2: Configure GitHub Secrets

### 2.1 Navigate to Repository Settings

```
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret
```

### 2.2 Add These Secrets

**Web CI Secrets:**
```
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA
VERCEL_TOKEN=<your_vercel_token>
VERCEL_ORG_ID=<your_vercel_org_id>
VERCEL_PROJECT_ID=<your_vercel_project_id>
```

**Mobile CI Secrets:**
```
EXPO_TOKEN=<your_expo_token>
EXPO_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA
```

---

## ✅ Step 3: Verify Workflows Exist

Check these files exist:
```bash
ls -la .github/workflows/
# Should show:
# - web-ci.yml
# - mobile-ci.yml
```

If missing, they're already created in this project.

---

## 🚀 Step 4: Trigger First Build

### 4.1 Commit and Push

```bash
git add .
git commit -m "feat: setup CI/CD pipelines"
git push origin main
```

### 4.2 Monitor Build

1. Go to: `https://github.com/[your-username]/[repo]/actions`
2. You should see two workflows running:
   - **Web CI/CD**
   - **Mobile CI/CD (EAS)**

---

## 📊 Step 5: Verify Each Pipeline

### Web CI/CD

**Expected Flow:**
1. ✅ Lint & Type Check (2-3 min)
2. ✅ Build Web App (3-5 min)
3. ✅ E2E Tests (5-10 min)
4. ✅ Deploy to Vercel (1-2 min)

**Success Criteria:**
- All jobs pass ✅
- Deployment URL in workflow summary
- Site accessible at Vercel URL

### Mobile CI/CD

**Expected Flow:**
1. ✅ Lint (1-2 min)
2. ✅ Build Production (15-25 min for Android)
3. ✅ Build iOS (if configured, 20-30 min)

**Success Criteria:**
- Build completes successfully
- APK/AAB downloadable from Expo dashboard
- Build URL in workflow comments

---

## 🧪 Step 6: Test E2E Locally First

Before relying on CI, verify E2E tests work locally:

```bash
# Install Playwright browsers
pnpm exec playwright install --with-deps chromium

# Run tests
pnpm test:e2e --project=chromium

# View report
pnpm test:e2e:report
```

**Expected:** All tests pass ✅

---

## 🐛 Common Issues & Fixes

### Issue 1: "EXPO_TOKEN not found"

**Fix:**
```bash
# Verify secret is set
gh secret list  # If using GitHub CLI

# Or check in GitHub UI:
Settings → Secrets and variables → Actions
```

### Issue 2: "Vercel deployment failed"

**Fix:**
```bash
# Test Vercel deployment locally
vercel --prod

# If it works, check GitHub secrets:
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### Issue 3: "EAS build failed"

**Fix:**
```bash
# Test EAS build locally
cd apps/mobile
eas build --platform android --profile preview --local

# Check eas.json configuration
# Verify EXPO_TOKEN is valid
```

### Issue 4: "E2E tests timeout"

**Fix:**
```bash
# Increase timeout in playwright.config.ts
# Check if dev server starts:
pnpm --filter=@acrely/web run dev

# Verify it's accessible at localhost:3001
curl http://localhost:3001
```

---

## 📝 Workflow Triggers

### Web CI/CD Triggers

Runs on:
- ✅ Push to `main` or `develop`
- ✅ Pull requests to `main` or `develop`
- ✅ Changes in `apps/web/**`, `packages/**`, or workflows

### Mobile CI/CD Triggers

Runs on:
- ✅ Push to `main` or `develop`
- ✅ Pull requests to `main` or `develop`
- ✅ Changes in `apps/mobile/**`, `packages/**`, or workflows

---

## 🎯 Testing the Pipeline

### Create a Test PR

```bash
# Create a new branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# CI/CD Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push origin test/ci-pipeline

# Create PR on GitHub
# Watch the CI pipelines run!
```

---

## 📊 Success Indicators

### Green Checkmarks ✅

You should see:
```
✅ Lint & Type Check
✅ Build
✅ E2E Tests
✅ Deploy
```

### Build Artifacts

**Web:**
- Deployed URL on Vercel
- E2E test report

**Mobile:**
- APK download link
- Build ID in Expo dashboard

---

## 🔄 Continuous Deployment Flow

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Develop & Test Locally**
   ```bash
   pnpm dev
   pnpm test:e2e
   ```

3. **Push & Create PR**
   ```bash
   git push origin feature/new-feature
   # Create PR on GitHub
   ```

4. **CI Runs Automatically**
   - Lint, build, test
   - Preview deployment (web)
   - Preview build (mobile)

5. **Merge to Main**
   - Production deployment (web)
   - Production build (mobile)

---

## 🚨 CI Failure Protocol

If CI fails:

1. **Check Logs**
   - Click on failed job
   - Read error message
   - Check specific step that failed

2. **Reproduce Locally**
   ```bash
   # For build failures
   pnpm build

   # For test failures
   pnpm test:e2e

   # For lint failures
   pnpm lint
   ```

3. **Fix & Retry**
   ```bash
   # Fix the issue
   git commit -m "fix: resolve CI failure"
   git push
   # CI runs again automatically
   ```

---

## 📈 Monitoring CI/CD Health

### GitHub Actions Dashboard

Visit: `https://github.com/[username]/[repo]/actions`

**Healthy Pipeline Indicators:**
- ✅ Success rate > 95%
- ⏱️ Average build time < 15 min (web)
- ⏱️ Average build time < 30 min (mobile)
- 🔄 No stuck/pending jobs

### Vercel Dashboard

Visit: `https://vercel.com/[username]/[project]`

**Healthy Deployment Indicators:**
- ✅ All deployments successful
- ⚡ Build time < 5 min
- 🌐 Site loads successfully

### Expo Dashboard

Visit: `https://expo.dev/accounts/[account]/projects/acrely-mobile/builds`

**Healthy Build Indicators:**
- ✅ Recent builds successful
- 📦 APK/AAB downloadable
- 🚀 No failed submissions

---

## 🎉 You're Done!

Your CI/CD pipelines are now configured! Every push will:
- ✅ Run tests automatically
- ✅ Build your apps
- ✅ Deploy on success
- ✅ Block bad code from production

---

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Playwright CI Docs](https://playwright.dev/docs/ci)

---

**Setup Time:** ~15 minutes  
**Last Updated:** November 2025  
**Difficulty:** Beginner-Friendly ✨
