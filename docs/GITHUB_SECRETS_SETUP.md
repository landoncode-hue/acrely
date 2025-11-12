# GitHub Actions Secrets Configuration Guide

## Overview

This guide provides step-by-step instructions for configuring GitHub Actions secrets required for the Acrely CI/CD deployment pipeline.

## Prerequisites

- GitHub repository admin access
- Production credentials for Supabase, Hostinger FTP, and Termii SMS

## Accessing GitHub Secrets

1. Navigate to your GitHub repository: `https://github.com/YOUR_ORG/Acrely`
2. Click **Settings** tab
3. In the left sidebar, expand **Secrets and variables**
4. Click **Actions**
5. Click **New repository secret** button

## Required Secrets

### Supabase Secrets

#### SUPABASE_ACCESS_TOKEN
- **Value**: `sbp_deb38eb56bb9ccb4b546678a20ed256078a02eea`
- **Purpose**: Authenticates Supabase CLI for database migrations and Edge Functions deployment
- **Used by**: `deploy-database`, `deploy-functions` jobs
- **How to obtain**: Supabase Dashboard → Account → Access Tokens

#### SUPABASE_PROJECT_ID
- **Value**: `qenqilourxtfxchkawek`
- **Purpose**: Identifies the target Supabase project for deployments
- **Used by**: `deploy-database`, `deploy-functions` jobs
- **How to obtain**: Supabase Dashboard → Project Settings → General

#### NEXT_PUBLIC_SUPABASE_URL
- **Value**: `https://qenqilourxtfxchkawek.supabase.co`
- **Purpose**: Supabase API endpoint embedded in Next.js build
- **Used by**: `deploy-web` job (build step)
- **How to obtain**: Supabase Dashboard → Project Settings → API

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA`
- **Purpose**: Public API key for client-side Supabase requests (respects RLS)
- **Used by**: `deploy-web` job (build step), `post-deployment-verification` job
- **How to obtain**: Supabase Dashboard → Project Settings → API → anon/public key

### Hostinger FTP Secrets

#### FTP_SERVER
- **Value**: `ftp.pinnaclegroups.ng`
- **Purpose**: FTP server hostname for deployment
- **Used by**: `deploy-web` job (FTP deployment step)
- **How to obtain**: Hostinger cPanel → FTP Accounts

#### FTP_USERNAME
- **Value**: `u351089353.acrely`
- **Purpose**: FTP account username for authentication
- **Used by**: `deploy-web` job (FTP deployment step)
- **How to obtain**: Hostinger cPanel → FTP Accounts

#### FTP_PASSWORD
- **Value**: `Arelius345#`
- **Purpose**: FTP account password for authentication
- **Used by**: `deploy-web` job (FTP deployment step)
- **How to obtain**: Hostinger cPanel → FTP Accounts (set during account creation)

### Optional Notification Secrets

#### TELEGRAM_BOT_TOKEN
- **Value**: Leave empty unless using Telegram notifications
- **Purpose**: Authenticates Telegram bot for deployment notifications
- **Used by**: `notify` job (optional)
- **How to obtain**: Create bot via @BotFather on Telegram

#### TELEGRAM_CHAT_ID
- **Value**: Leave empty unless using Telegram notifications
- **Purpose**: Target chat for deployment notifications
- **Used by**: `notify` job (optional)
- **How to obtain**: Send message to bot, call getUpdates API

## Configuration Steps

### Step 1: Add Supabase Secrets

```bash
# In GitHub repository → Settings → Secrets and variables → Actions

1. Click "New repository secret"
2. Name: SUPABASE_ACCESS_TOKEN
   Value: sbp_deb38eb56bb9ccb4b546678a20ed256078a02eea
3. Click "Add secret"

4. Click "New repository secret"
5. Name: SUPABASE_PROJECT_ID
   Value: qenqilourxtfxchkawek
6. Click "Add secret"

7. Click "New repository secret"
8. Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://qenqilourxtfxchkawek.supabase.co
9. Click "Add secret"

10. Click "New repository secret"
11. Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
    Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA
12. Click "Add secret"
```

### Step 2: Add Hostinger FTP Secrets

```bash
1. Click "New repository secret"
2. Name: FTP_SERVER
   Value: ftp.pinnaclegroups.ng
3. Click "Add secret"

4. Click "New repository secret"
5. Name: FTP_USERNAME
   Value: u351089353.acrely
6. Click "Add secret"

7. Click "New repository secret"
8. Name: FTP_PASSWORD
   Value: Arelius345#
9. Click "Add secret"
```

### Step 3: Verify Secrets Configuration

After adding all secrets, your secrets list should show:

- ✅ SUPABASE_ACCESS_TOKEN
- ✅ SUPABASE_PROJECT_ID
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ FTP_SERVER
- ✅ FTP_USERNAME
- ✅ FTP_PASSWORD

## Workflow Usage

The `.github/workflows/deploy.yml` file references these secrets:

```yaml
# Database deployment
env:
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}

# Web build
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

# FTP deployment
with:
  server: ${{ secrets.FTP_SERVER }}
  username: ${{ secrets.FTP_USERNAME }}
  password: ${{ secrets.FTP_PASSWORD }}
```

## Testing the Configuration

### Test 1: Trigger Workflow Manually

1. Go to **Actions** tab in GitHub repository
2. Select **Deploy Acrely to Production** workflow
3. Click **Run workflow** dropdown
4. Select branch: `main`
5. Click **Run workflow** button
6. Monitor workflow execution for any secret-related errors

### Test 2: Push to Main Branch

```bash
git checkout main
git commit --allow-empty -m "Test CI/CD pipeline"
git push origin main
```

Monitor the Actions tab for successful deployment.

## Troubleshooting

### Issue: "Secret not found" error

**Solution**: Verify secret name matches exactly (case-sensitive)
- Check workflow file for correct reference: `${{ secrets.SECRET_NAME }}`
- Ensure secret is created at repository level, not environment level

### Issue: FTP deployment fails with authentication error

**Solution**: Verify FTP credentials
- Test FTP connection manually using FileZilla or command-line FTP client
- Ensure FTP_USERNAME and FTP_PASSWORD are correct
- Check if FTP account is active in Hostinger cPanel

### Issue: Supabase CLI authentication fails

**Solution**: Verify access token is valid
- Check token hasn't expired in Supabase Dashboard
- Ensure SUPABASE_ACCESS_TOKEN has correct permissions
- Try regenerating access token and updating secret

### Issue: Build fails with "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solution**: Verify environment variables in build step
- Check NEXT_PUBLIC_SUPABASE_URL secret exists
- Ensure workflow file includes env block in build step
- Verify secret value doesn't have trailing spaces

## Security Best Practices

### 1. Secret Rotation

Rotate secrets every 90 days:
- Generate new Supabase access token
- Update FTP password in Hostinger cPanel
- Update all secrets in GitHub Actions

### 2. Access Control

Limit who can view/modify secrets:
- Only repository admins should have access
- Use GitHub branch protection rules
- Enable required reviews for workflow changes

### 3. Monitoring

Monitor secret usage:
- Review workflow logs for secret exposure
- Enable GitHub security alerts
- Audit who accessed secrets in repository settings

### 4. Never Log Secrets

Ensure workflow doesn't echo secrets:
```yaml
# ❌ BAD - Never do this
- run: echo ${{ secrets.FTP_PASSWORD }}

# ✅ GOOD - Use secrets directly in tools
- uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    password: ${{ secrets.FTP_PASSWORD }}
```

## Backup and Recovery

### Backing Up Secrets

Store secrets securely in a password manager:
- 1Password, LastPass, or Bitwarden
- Create vault for "Acrely Production Credentials"
- Include all secret values and their purposes

### Recovery Procedure

If secrets are lost:

1. **Supabase Secrets**:
   - Access Supabase Dashboard
   - Regenerate access token
   - Copy anon key and project ID

2. **FTP Secrets**:
   - Login to Hostinger cPanel
   - Reset FTP account password
   - Retrieve FTP server and username

3. **Update GitHub Secrets**:
   - Navigate to repository secrets
   - Click on each secret
   - Click "Update secret"
   - Paste new value

## Verification Checklist

After configuration, verify:

- [ ] All 7 required secrets are created
- [ ] Secret names match workflow file exactly
- [ ] Test workflow runs successfully
- [ ] Database migrations deploy without errors
- [ ] Edge Functions deploy successfully
- [ ] Web application builds and deploys to Hostinger
- [ ] Post-deployment health checks pass
- [ ] No secrets are exposed in workflow logs

## Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase CLI Authentication](https://supabase.com/docs/guides/cli/managing-credentials)
- [FTP Deploy Action Documentation](https://github.com/SamKirkland/FTP-Deploy-Action)

## Support

If you encounter issues:
- Review workflow logs in GitHub Actions tab
- Check Supabase Dashboard for API status
- Verify Hostinger FTP account is active
- Consult DEPLOYMENT_GUIDE.md for additional troubleshooting

---

**Last Updated**: November 11, 2025  
**Document Version**: 1.0.0
