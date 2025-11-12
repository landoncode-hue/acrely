# Acrely Runtime Setup Checklist

**Quest:** acrely-v2-runtime-setup  
**Date:** November 11, 2025  
**Status:** ✅ Complete

---

## 📋 Quick Start Commands

```bash
# Verify all runtime dependencies
pnpm run setup:check

# Test Termii API connectivity (requires API key in .env.local)
pnpm run test:termii

# Start development server
pnpm dev

# Build for production
pnpm build
```

---

## ✅ Installation Checklist

### RUNTIME-01: Node.js and Package Manager
- [x] Node.js v24.6.0 installed (v20.x+ required)
- [x] npm 11.5.1 installed (v10+ required)
- [x] pnpm 9.15.0 installed globally (v9+ required)
- [x] Verified: `node -v && npm -v && pnpm -v`

### RUNTIME-02: Supabase CLI
- [x] Supabase CLI 2.54.11 installed
- [x] Configuration file exists at `supabase/config.toml`
- [ ] **ACTION NEEDED:** Link to production project with:
  ```bash
  supabase link --project-ref qenqilourxtfxchkawek
  ```

### RUNTIME-03: Git + GitHub CLI
- [x] Git 2.49.0 installed
- [x] GitHub CLI 2.83.0 installed
- [ ] **ACTION NEEDED:** Authenticate GitHub CLI:
  ```bash
  gh auth login
  ```

### RUNTIME-04: Docker
- [x] Docker Desktop installed via Homebrew
- [ ] **ACTION NEEDED:** Launch Docker Desktop app
- [ ] **VERIFY:** Run `docker --version` and `docker run hello-world`

### RUNTIME-05: Expo CLI
- [x] Expo CLI 6.3.12 installed (legacy version)
- [x] Verified: `expo --version`
- ℹ️ Note: Consider migrating to modern Expo SDK for new projects

### RUNTIME-06: TypeScript & Development Utilities
- [x] TypeScript 5.9.3 installed
- [x] ESLint 9.39.1 installed
- [x] Prettier 3.6.2 installed
- [x] Verified: `tsc --version && eslint --version && prettier --version`

### RUNTIME-07: Termii API Utilities
- [x] Test script created at `scripts/test-termii.ts`
- [ ] **ACTION NEEDED:** Get Termii API key from https://termii.com/
- [ ] **ACTION NEEDED:** Update `.env.local` with `TERMII_API_KEY`
- [ ] **VERIFY:** Run `pnpm run test:termii`

### RUNTIME-08: Environment Files
- [x] `.env.local` created for local development
- [x] `.env.production` created for production deployment
- [x] `.env.example` exists as template
- [ ] **ACTION NEEDED:** Configure Supabase credentials in `.env.local`:
  - Get from: https://app.supabase.com/project/qenqilourxtfxchkawek/settings/api
  - Update: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
  - Update: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### RUNTIME-09: Project Dependencies
- [x] All workspace dependencies installed (458 packages)
- [x] Verified: `node_modules` directory exists
- [x] Run: `pnpm install` completed successfully

---

## 🎯 Configuration Required

### 1. Supabase Configuration

**Get Your Credentials:**
1. Visit: https://app.supabase.com/project/qenqilourxtfxchkawek/settings/api
2. Copy the following values:
   - Project URL → `SUPABASE_URL`
   - Anon/Public Key → `SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_KEY`

**Update `.env.local`:**
```env
SUPABASE_URL="https://qenqilourxtfxchkawek.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_KEY="your-service-role-key-here"

NEXT_PUBLIC_SUPABASE_URL="https://qenqilourxtfxchkawek.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 2. Termii API Configuration

**Get Your API Key:**
1. Visit: https://termii.com/
2. Log in to your account
3. Navigate to API Settings
4. Copy your API Key

**Update `.env.local`:**
```env
TERMII_API_KEY="your-termii-api-key-here"
TERMII_SENDER_ID="PinnacleBuilders"
TERMII_BASE_URL="https://v3.api.termii.com"
```

**Test Configuration:**
```bash
pnpm run test:termii
```

### 3. Company Information (Pre-configured)

Already set in `.env.local`:
```env
COMPANY_NAME="Pinnacle Builders Homes & Properties"
COMPANY_EMAIL="info@pinnaclegroups.ng"
COMPANY_PHONE="+234XXXXXXXXXX"
COMPANY_ADDRESS="Lagos, Nigeria"
COMPANY_SLOGAN="Building Trust, One Estate at a Time"
ORG_ID="PBLD001"
```

---

## 🚀 Development Workflow

### First Time Setup
```bash
# 1. Verify runtime environment
pnpm run setup:check

# 2. Configure environment variables (see above)
# Edit .env.local with your credentials

# 3. Test Termii connectivity
pnpm run test:termii

# 4. Start development server
pnpm dev
```

### Daily Development
```bash
# Start dev server
pnpm dev

# In another terminal, watch tests
pnpm test

# Format code before committing
pnpm format

# Run linter
pnpm lint
```

### Database Operations
```bash
# Push local migrations to Supabase
pnpm run db:push

# Reset database (WARNING: destructive)
pnpm run db:reset

# Deploy edge functions
pnpm run functions:deploy
```

---

## 🔍 Verification Commands

### Check All Runtime Dependencies
```bash
pnpm run verify:runtime
```

Expected output:
```
✅ Node.js              v24.6.0
✅ npm                  11.5.1
✅ pnpm                 9.15.0
✅ TypeScript           Version 5.9.3
✅ ESLint               v9.39.1
✅ Prettier             3.6.2
✅ Git                  git version 2.49.0
✅ GitHub CLI           gh version 2.83.0
✅ Supabase CLI         2.54.11
✅ Expo CLI             6.3.12
```

### Test Individual Components
```bash
# Node and package managers
node -v && npm -v && pnpm -v

# Development tools
tsc --version && eslint --version && prettier --version

# Version control
git --version && gh --version

# Backend tools
supabase --version

# Mobile development
expo --version

# Containerization (if Docker is running)
docker --version
```

---

## 📦 Hostinger Server Setup

### Prerequisites
- Ubuntu 22.04 or higher
- Root or sudo access
- Domain configured: acrely.pinnaclegroups.ng

### Installation Commands
```bash
# Connect to server
ssh root@your-hostinger-ip

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Docker
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# Install Git
sudo apt install git -y

# Clone repository
git clone https://github.com/landon-digital/acrely-v2.git
cd acrely-v2

# Install dependencies
pnpm install

# Configure production environment
cp .env.example .env.production
# Edit .env.production with production credentials

# Build application
pnpm build

# Deploy (using Docker or PM2)
docker-compose up -d
# OR
pm2 start npm --name "acrely" -- start
```

---

## 🧪 Testing & Validation

### Run All Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:ui

# View test report
pnpm test:e2e:report
```

### Manual Testing Checklist
- [ ] Development server starts on http://localhost:3000
- [ ] No console errors on page load
- [ ] Authentication works (login/logout)
- [ ] Database operations work (CRUD)
- [ ] SMS sending works (via Termii)
- [ ] API routes respond correctly

---

## 🆘 Troubleshooting

### Issue: pnpm command not found
```bash
npm install -g pnpm
```

### Issue: TypeScript errors in scripts
```bash
pnpm add -D -w tsx dotenv @types/node
```

### Issue: Supabase CLI version outdated
```bash
brew upgrade supabase/tap/supabase
# OR
npm update -g supabase
```

### Issue: Docker not running
1. Open Docker Desktop application
2. Wait for Docker to start
3. Verify with: `docker ps`

### Issue: Environment variables not loaded
- Check file is named exactly `.env.local` (not `.env.local.txt`)
- Restart development server after changing env files
- Verify Next.js variables start with `NEXT_PUBLIC_`

### Issue: Port 3000 already in use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 pnpm dev
```

---

## 📚 Additional Resources

- **Project Documentation:** `README.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Runtime Setup Details:** `RUNTIME_SETUP.md`
- **Supabase Docs:** https://supabase.com/docs
- **Termii API Docs:** https://developers.termii.com/
- **Next.js Docs:** https://nextjs.org/docs
- **pnpm Docs:** https://pnpm.io/

---

## ✅ Final Verification

Before starting development, ensure:

- [x] All runtime dependencies installed
- [ ] `.env.local` configured with Supabase credentials
- [ ] `.env.local` configured with Termii API key
- [ ] `pnpm run setup:check` passes
- [ ] `pnpm run test:termii` succeeds
- [ ] `pnpm dev` starts without errors
- [ ] GitHub CLI authenticated
- [ ] Supabase CLI linked to project

---

## 🎉 Next Steps

Once all items are checked:

1. **Start Development:**
   ```bash
   pnpm dev
   ```

2. **Access Application:**
   - Web: http://localhost:3000
   - Supabase Studio: http://localhost:54324

3. **Begin Feature Development:**
   - Review `IMPLEMENTATION_SUMMARY.md`
   - Check `DEPLOYMENT_GUIDE.md` for deployment process
   - Follow `QA_CHECKLIST.md` before production

---

**Status:** ✅ Runtime environment ready for development  
**Last Updated:** November 11, 2025
