# Supabase Edge Functions Secrets Setup Guide

## Overview

Supabase Edge Functions require environment variables (secrets) to access external services like Termii SMS API and the Supabase database. This guide explains how to configure these secrets for production deployment.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase account with project created
- Production credentials for Termii and Supabase

## Understanding Edge Functions Secrets

Edge Functions run in a Deno runtime environment isolated from your Next.js application. They cannot access environment variables from `.env.local` or GitHub Actions. Secrets must be configured separately using the Supabase CLI or dashboard.

### Secret Scope

- Secrets are **project-wide**: All Edge Functions in a project can access the same secrets
- Secrets are **environment-specific**: Development and production have separate secret stores
- Secrets are **encrypted at rest**: Supabase encrypts all secrets in storage

## Required Secrets

### Supabase Service Credentials

These allow Edge Functions to access the Supabase database with elevated permissions:

#### SUPABASE_URL
- **Value**: `https://qenqilourxtfxchkawek.supabase.co`
- **Purpose**: Database connection endpoint
- **Used by**: All functions that query the database

#### SUPABASE_SERVICE_ROLE_KEY
- **Value**: `<your_supabase_service_role_key>` (Get from Supabase Dashboard → Settings → API)
- **Purpose**: Service role authentication (bypasses RLS policies)
- **Used by**: All functions that need write access or admin operations

### Termii SMS API Credentials

These enable Edge Functions to send SMS notifications:

#### TERMII_API_KEY
- **Value**: `<your_termii_api_key>` (Get from Termii Dashboard → API Keys)
- **Purpose**: Termii API authentication
- **Used by**: `send-sms`, `bulk-sms-campaign`, `check-overdue-payments`

#### TERMII_SENDER_ID
- **Value**: `PBuilders`
- **Purpose**: SMS sender identification
- **Used by**: All SMS-sending functions

#### TERMII_BASE_URL
- **Value**: `https://v3.api.termii.com`
- **Purpose**: Termii API endpoint
- **Used by**: All SMS-sending functions

### Company Information

These provide business context for automated messages and receipts:

#### COMPANY_NAME
- **Value**: `Pinnacle Builders Homes & Properties`
- **Purpose**: Company name in receipts and messages
- **Used by**: `generate-receipt`, `send-sms`

#### COMPANY_EMAIL
- **Value**: `info@pinnaclegroups.ng`
- **Purpose**: Contact email in receipts
- **Used by**: `generate-receipt`

#### COMPANY_PHONE
- **Value**: `+234XXXXXXXXXX` (replace with actual number)
- **Purpose**: Contact phone in receipts
- **Used by**: `generate-receipt`

#### COMPANY_ADDRESS
- **Value**: `Lagos, Nigeria`
- **Purpose**: Company address in receipts
- **Used by**: `generate-receipt`

### Storage Configuration

#### RECEIPT_BUCKET
- **Value**: `receipts`
- **Purpose**: Supabase Storage bucket for PDF receipts
- **Used by**: `generate-receipt`

#### DOCUMENTS_BUCKET
- **Value**: `documents`
- **Purpose**: Supabase Storage bucket for general documents
- **Used by**: Various functions as needed

## Setup Methods

### Method 1: Using Supabase CLI (Recommended)

#### Step 1: Authenticate CLI

```bash
# Login to Supabase
supabase login

# Link to your project
cd /Users/lordkay/Development/Acrely
supabase link --project-ref qenqilourxtfxchkawek
```

#### Step 2: Set Secrets

```bash
# Supabase credentials
supabase secrets set SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>

# Termii credentials
supabase secrets set TERMII_API_KEY=<your_termii_api_key>
supabase secrets set TERMII_SENDER_ID=PBuilders
supabase secrets set TERMII_BASE_URL=https://v3.api.termii.com

# Company information
supabase secrets set COMPANY_NAME="Pinnacle Builders Homes & Properties"
supabase secrets set COMPANY_EMAIL=info@pinnaclegroups.ng
supabase secrets set COMPANY_PHONE=+234XXXXXXXXXX
supabase secrets set COMPANY_ADDRESS="Lagos, Nigeria"

# Storage configuration
supabase secrets set RECEIPT_BUCKET=receipts
supabase secrets set DOCUMENTS_BUCKET=documents
```

#### Step 3: Verify Secrets

```bash
# List all configured secrets
supabase secrets list

# Expected output:
# NAME                        VALUE_PREVIEW
# SUPABASE_URL               https://qenq...
# SUPABASE_SERVICE_ROLE_KEY  eyJhbGciOiJ...
# TERMII_API_KEY             TLlpIiGIKw...
# TERMII_SENDER_ID           PBuilders
# TERMII_BASE_URL            https://v3...
# COMPANY_NAME               Pinnacle B...
# COMPANY_EMAIL              info@pinna...
# COMPANY_PHONE              +234XXXXXX...
# COMPANY_ADDRESS            Lagos, Nig...
# RECEIPT_BUCKET             receipts
# DOCUMENTS_BUCKET           documents
```

### Method 2: Using Supabase Dashboard

#### Step 1: Access Dashboard

1. Navigate to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `qenqilourxtfxchkawek`
3. Click **Edge Functions** in left sidebar
4. Click **Manage secrets** button

#### Step 2: Add Secrets

For each secret:
1. Click **New secret**
2. Enter secret name (e.g., `TERMII_API_KEY`)
3. Enter secret value
4. Click **Save**

Repeat for all required secrets listed above.

#### Step 3: Verify Configuration

Check the secrets list to ensure all 11 secrets are configured.

## Bulk Configuration Script

Create a shell script to set all secrets at once:

```bash
#!/bin/bash
# File: scripts/setup-edge-secrets.sh

echo "🔧 Configuring Supabase Edge Functions secrets..."

# Supabase credentials
supabase secrets set SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>

# Termii credentials
supabase secrets set TERMII_API_KEY=<your_termii_api_key>
supabase secrets set TERMII_SENDER_ID=PBuilders
supabase secrets set TERMII_BASE_URL=https://v3.api.termii.com

# Company information
supabase secrets set COMPANY_NAME="Pinnacle Builders Homes & Properties"
supabase secrets set COMPANY_EMAIL=info@pinnaclegroups.ng
supabase secrets set COMPANY_PHONE=+234XXXXXXXXXX
supabase secrets set COMPANY_ADDRESS="Lagos, Nigeria"

# Storage configuration
supabase secrets set RECEIPT_BUCKET=receipts
supabase secrets set DOCUMENTS_BUCKET=documents

echo "✅ All secrets configured successfully!"
echo "📋 Listing configured secrets:"
supabase secrets list
```

Usage:
```bash
chmod +x scripts/setup-edge-secrets.sh
./scripts/setup-edge-secrets.sh
```

## Accessing Secrets in Edge Functions

### Example: Reading Secrets in TypeScript

```typescript
// In any Edge Function (e.g., supabase/functions/send-sms/index.ts)

const TERMII_API_KEY = Deno.env.get('TERMII_API_KEY');
const TERMII_SENDER_ID = Deno.env.get('TERMII_SENDER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!TERMII_API_KEY) {
  throw new Error('TERMII_API_KEY not configured');
}

// Use the secret
const response = await fetch('https://v3.api.termii.com/api/sms/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    api_key: TERMII_API_KEY,
    from: TERMII_SENDER_ID,
    // ... rest of payload
  }),
});
```

### Best Practices

1. **Always validate secrets exist**:
```typescript
const required = ['TERMII_API_KEY', 'SUPABASE_URL'];
for (const key of required) {
  if (!Deno.env.get(key)) {
    throw new Error(`Missing required secret: ${key}`);
  }
}
```

2. **Never log secret values**:
```typescript
// ❌ BAD
console.log('API Key:', TERMII_API_KEY);

// ✅ GOOD
console.log('API Key configured:', !!TERMII_API_KEY);
```

3. **Use type-safe access**:
```typescript
const getEnvVar = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`${key} not configured`);
  return value;
};

const apiKey = getEnvVar('TERMII_API_KEY');
```

## Testing Edge Functions with Secrets

### Local Testing

1. **Create local environment file**:

```bash
# supabase/.env.local (for local Edge Functions testing)
SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
TERMII_API_KEY=<your_termii_api_key>
TERMII_SENDER_ID=PBuilders
TERMII_BASE_URL=https://v3.api.termii.com
COMPANY_NAME=Pinnacle Builders Homes & Properties
```

2. **Run function locally**:

```bash
supabase functions serve send-sms --env-file supabase/.env.local
```

3. **Test with curl**:

```bash
curl -X POST http://localhost:54321/functions/v1/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+234...", "message": "Test message"}'
```

## Troubleshooting

### Issue: Function returns "Secret not configured" error

**Solution**:
```bash
# Verify secret exists
supabase secrets list | grep TERMII_API_KEY

# If missing, set it
supabase secrets set TERMII_API_KEY=your-key-here

# Redeploy function
supabase functions deploy send-sms
```

### Issue: Cannot list secrets (authentication error)

**Solution**:
```bash
# Re-authenticate
supabase login

# Re-link project
supabase link --project-ref qenqilourxtfxchkawek
```

### Issue: Secrets work locally but not in production

**Solution**:
- Local and production have separate secret stores
- Ensure you set secrets after linking to production project
- Verify you're not using `supabase/.env.local` in production

### Issue: Edge Function can't access Supabase database

**Solution**:
```bash
# Verify both secrets are set
supabase secrets list | grep SUPABASE

# Re-set if missing
supabase secrets set SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Considerations

### 1. Secret Rotation

Rotate secrets every 90 days:

```bash
# Generate new service role key in Supabase Dashboard
# Update secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=new-key-here

# Redeploy all functions
supabase functions deploy
```

### 2. Access Control

- Only DevOps personnel should have Supabase CLI access
- Use separate Supabase projects for staging/production
- Restrict Supabase Dashboard access to authorized team members

### 3. Audit Logging

Monitor secret usage:
- Review Edge Function logs in Supabase Dashboard
- Check for unauthorized access attempts
- Monitor Termii API usage for anomalies

## CI/CD Integration

GitHub Actions automatically deploys Edge Functions, but secrets must be pre-configured:

```yaml
# .github/workflows/deploy.yml
- name: Deploy Edge Functions
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  run: |
    supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
    supabase functions deploy
    # Secrets are already configured, no need to set them here
```

**Important**: GitHub Actions does NOT set Edge Function secrets. They must be configured once using the CLI or dashboard.

## Verification Checklist

After setup, verify:

- [ ] All 11 required secrets appear in `supabase secrets list`
- [ ] Edge Functions deploy successfully: `supabase functions deploy`
- [ ] send-sms function sends test SMS successfully
- [ ] generate-receipt function creates PDF receipts
- [ ] No "secret not configured" errors in function logs
- [ ] Secrets are not exposed in logs or error messages

## Additional Resources

- [Supabase Edge Functions Environment Variables](https://supabase.com/docs/guides/functions/secrets)
- [Deno Environment Variables](https://deno.land/manual/runtime/environment_variables)
- [Termii API Documentation](https://developers.termii.com/)

## Support

If you encounter issues:
- Check Edge Function logs in Supabase Dashboard → Edge Functions
- Review secret configuration: `supabase secrets list`
- Test functions locally with `.env.local` file
- Consult DEPLOYMENT_GUIDE.md for additional troubleshooting

---

**Last Updated**: November 11, 2025  
**Document Version**: 1.0.0
