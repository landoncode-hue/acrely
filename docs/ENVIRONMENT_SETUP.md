# Environment Configuration Setup Guide

## Overview

This guide walks you through setting up all required environment configurations for the Acrely platform across local development, production deployment, and CI/CD pipelines.

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Verify configuration (credentials already populated)
pnpm run verify:env

# 3. Set up Supabase Edge Functions secrets
chmod +x scripts/setup-edge-secrets.sh
./scripts/setup-edge-secrets.sh

# 4. Start development
pnpm dev
```

## Environment Files

### .env.local (Local Development)

**Location**: `/Users/lordkay/Development/Acrely/.env.local`

**Status**: ✅ Already configured with production credentials

This file contains all credentials needed for local development. It's already populated with:
- Supabase connection details
- Termii SMS API credentials
- FTP deployment credentials
- Company information

**Security**: This file is gitignored and will never be committed to version control.

### .env.production (Production Server)

**Location**: `/Users/lordkay/Development/Acrely/.env.production`

**Status**: ✅ Already configured

This file mirrors `.env.local` but uses production-specific values:
- `SITE_URL`: https://acrely.pinnaclegroups.ng
- `ENVIRONMENT`: production

**Deployment**: This file should be copied to the production server or used in build processes.

### .env.example (Template)

**Location**: `/Users/lordkay/Development/Acrely/.env.example`

**Status**: ✅ Updated with comprehensive documentation

This template documents all available environment variables with placeholder values. Developers can use this to create their own `.env.local`.

## Service Configuration

### 1. Supabase Backend

**Project URL**: https://qenqilourxtfxchkawek.supabase.co  
**Project Reference**: qenqilourxtfxchkawek

#### Local Development
Environment variables are already configured in `.env.local`:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

#### Edge Functions Secrets

Edge Functions require separate configuration. Run:

```bash
# Make script executable
chmod +x scripts/setup-edge-secrets.sh

# Run setup script
./scripts/setup-edge-secrets.sh
```

This configures:
- Supabase database credentials
- Termii SMS credentials
- Company information
- Storage bucket names

**Documentation**: See [`docs/SUPABASE_EDGE_SECRETS.md`](./SUPABASE_EDGE_SECRETS.md) for detailed guide.

### 2. Termii SMS Service

**API Endpoint**: https://v3.api.termii.com  
**Sender ID**: PBuilders

#### Configuration
Already configured in `.env.local`:
- ✅ TERMII_API_KEY
- ✅ TERMII_SENDER_ID
- ✅ TERMII_API_URL

#### Testing SMS Functionality

```bash
# Test Termii connectivity
pnpm run test:termii
```

This script:
- Validates API key is configured
- Checks account balance
- Optionally sends test SMS

### 3. Hostinger FTP Deployment

**FTP Server**: ftp.pinnaclegroups.ng  
**Deployment Path**: public_html/acrely

#### Configuration
Already configured in `.env.local` and `.env.production`:
- ✅ FTP_SERVER
- ✅ FTP_USERNAME
- ✅ FTP_PASSWORD
- ✅ FTP_PATH

#### Manual FTP Test

```bash
# Test FTP connection with lftp
lftp -u u351089353.acrely,Arelius345# ftp.pinnaclegroups.ng

# Or with FileZilla (GUI)
# Host: ftp.pinnaclegroups.ng
# Username: u351089353.acrely
# Password: Arelius345#
```

## GitHub Actions CI/CD

### Required Secrets

The CI/CD pipeline requires the following secrets configured in GitHub:

**Navigation**: Repository → Settings → Secrets and variables → Actions

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| SUPABASE_ACCESS_TOKEN | `sbp_deb38...` | CLI authentication |
| SUPABASE_PROJECT_ID | `qenqilourxtfxchkawek` | Project identifier |
| NEXT_PUBLIC_SUPABASE_URL | `https://qenqilourxtfxchkawek.supabase.co` | Build-time config |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | `eyJhbGciOiJIUz...` | Public API key |
| FTP_SERVER | `ftp.pinnaclegroups.ng` | FTP hostname |
| FTP_USERNAME | `u351089353.acrely` | FTP username |
| FTP_PASSWORD | `Arelius345#` | FTP password |

### Setup Instructions

See [`docs/GITHUB_SECRETS_SETUP.md`](./GITHUB_SECRETS_SETUP.md) for step-by-step configuration guide.

### Testing CI/CD

Trigger workflow manually:
1. Go to **Actions** tab
2. Select **Deploy Acrely to Production**
3. Click **Run workflow**
4. Select branch: `main`
5. Monitor execution

## Verification

### Step 1: Verify Local Environment

```bash
pnpm run verify:env
```

Expected output:
```
✅ Found .env.local
✅ All required variables configured
✅ No warnings
✅ Environment configuration is valid!
```

### Step 2: Verify Supabase Edge Functions

```bash
# List configured secrets
supabase secrets list

# Expected: 11 secrets configured
```

### Step 3: Test Services

```bash
# Test Termii SMS
pnpm run test:termii

# Test Supabase connection
pnpm dev
# Navigate to http://localhost:3000
```

## Troubleshooting

### Issue: "Environment variable not found"

**Solution**:
```bash
# Re-verify configuration
pnpm run verify:env

# Check .env.local exists
ls -la .env.local

# If missing, copy from example
cp .env.example .env.local
# Note: .env.local is already configured, so this shouldn't be needed
```

### Issue: "Supabase secrets not configured"

**Solution**:
```bash
# Run setup script
./scripts/setup-edge-secrets.sh

# Or manually set secrets
supabase secrets set TERMII_API_KEY=TLlpIiGIKwzhwErZGPBjxciDtTHuTqSvzSgayCFpCmuJjJOEMLzftmDugTIVBW
```

### Issue: "FTP deployment fails in GitHub Actions"

**Solution**:
1. Verify GitHub secrets are configured correctly
2. Check FTP credentials in Hostinger cPanel
3. Ensure FTP account is active
4. Review workflow logs for specific error

### Issue: "SMS not sending"

**Solution**:
```bash
# Check Termii API key
pnpm run test:termii

# Verify Edge Functions secrets
supabase secrets list | grep TERMII

# Check Termii account balance at termii.com
```

## Security Best Practices

### ✅ DO:
- Keep `.env.local` and `.env.production` gitignored
- Rotate credentials every 90 days
- Use environment-specific values (localhost vs production URL)
- Store sensitive credentials in password manager
- Review who has access to GitHub secrets

### ❌ DON'T:
- Commit `.env` files to version control
- Share credentials in plain text (Slack, email)
- Use production credentials in development logs
- Expose service role keys to client-side code
- Hardcode credentials in source files

## Credential Rotation

### When to Rotate:
- Every 90 days (routine maintenance)
- After team member departure
- If credentials may have been exposed
- Security audit recommendations

### How to Rotate:

#### Supabase Credentials:
1. Generate new keys in Supabase Dashboard
2. Update `.env.local` and `.env.production`
3. Update GitHub Actions secrets
4. Update Edge Functions secrets: `./scripts/setup-edge-secrets.sh`
5. Test all integrations

#### Termii API Key:
1. Generate new key at termii.com
2. Update `.env.local` and `.env.production`
3. Update Edge Functions secrets
4. Update GitHub Actions secrets
5. Test SMS functionality

#### FTP Credentials:
1. Create new FTP account in Hostinger cPanel
2. Update `.env.local` and `.env.production`
3. Update GitHub Actions secrets
4. Test deployment
5. Delete old FTP account

## Documentation Index

| Document | Purpose |
|----------|---------|
| [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) | This guide (overview) |
| [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) | GitHub Actions configuration |
| [SUPABASE_EDGE_SECRETS.md](./SUPABASE_EDGE_SECRETS.md) | Edge Functions secrets setup |
| [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) | Production deployment procedures |

## NPM Scripts Reference

| Command | Purpose |
|---------|---------|
| `pnpm run verify:env` | Validate environment configuration |
| `pnpm run verify:runtime` | Check development environment setup |
| `pnpm run test:termii` | Test Termii SMS connectivity |
| `pnpm dev` | Start local development server |
| `pnpm build` | Build production bundle |
| `pnpm run db:push` | Apply database migrations |
| `pnpm run functions:deploy` | Deploy Edge Functions |

## Support

For issues with environment configuration:
1. Review verification output: `pnpm run verify:env`
2. Check documentation in `docs/` directory
3. Review workflow logs in GitHub Actions
4. Consult DEPLOYMENT_GUIDE.md for production issues

---

**Configuration Status**: ✅ Complete  
**Last Updated**: November 11, 2025  
**Environment Version**: 1.0.0
