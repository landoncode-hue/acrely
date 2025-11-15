# 🔐 Secrets Verification Checklist

**Last Updated**: November 14, 2025  
**Purpose**: Verify all secrets are properly secured and rotated

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Secured

**Local Development** (`.env.local`, `apps/web/.env.local`):
- [ ] No plaintext secrets committed to git
- [ ] `.env*.local` files in `.gitignore`
- [ ] Example files (`.env.example`) use placeholders only

**Vercel Production**:
- [ ] `SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (new value after rotation)

**Supabase Edge Functions**:
```bash
supabase secrets list
```
- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (new value after rotation)
- [ ] `TERMII_API_KEY` set (new value after rotation)
- [ ] `TERMII_SENDER_ID` set
- [ ] `TERMII_BASE_URL` set
- [ ] `COMPANY_NAME` set
- [ ] `COMPANY_EMAIL` set
- [ ] `COMPANY_PHONE` set
- [ ] `COMPANY_ADDRESS` set
- [ ] `RECEIPT_BUCKET` set
- [ ] `DOCUMENTS_BUCKET` set

---

## 🔄 Secret Rotation Status

### Critical Secrets (Rotate every 90 days)

**Supabase Service Role Key**:
- Current Status: 🔴 **ROTATION REQUIRED**
- Last Rotated: Never
- Next Rotation: Immediately
- Location: Edge Functions, Vercel
- Action: Run `./scripts/rotate-secrets.sh`

**Termii API Key**:
- Current Status: 🔴 **ROTATION REQUIRED**
- Last Rotated: Never
- Next Rotation: Immediately
- Location: Edge Functions
- Action: Run `./scripts/rotate-secrets.sh`

**Supabase Anon Key**:
- Current Status: 🟢 **OK** (public key, RLS-protected)
- Last Rotated: N/A
- Next Rotation: Annually (optional)

---

## 🗂️ Secret Inventory

### Production Secrets

| Secret Name | Type | Rotation Frequency | Last Rotated | Status |
|------------|------|-------------------|--------------|--------|
| `SUPABASE_URL` | Public | N/A | N/A | ✅ |
| `SUPABASE_ANON_KEY` | Public | Annually | Never | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Critical | 90 days | Never | 🔴 |
| `TERMII_API_KEY` | Critical | 90 days | Never | 🔴 |
| `TERMII_SENDER_ID` | Config | N/A | N/A | ✅ |
| `TERMII_BASE_URL` | Public | N/A | N/A | ✅ |
| `COMPANY_NAME` | Public | N/A | N/A | ✅ |
| `COMPANY_EMAIL` | Public | N/A | N/A | ✅ |
| `COMPANY_PHONE` | Public | N/A | N/A | ✅ |
| `COMPANY_ADDRESS` | Public | N/A | N/A | ✅ |
| `RECEIPT_BUCKET` | Config | N/A | N/A | ✅ |
| `DOCUMENTS_BUCKET` | Config | N/A | N/A | ✅ |

---

## 🔍 Repository Scan

### Quick Security Scan
Run this command to check for any leaked secrets:

```bash
# Scan for Supabase Service Role Key pattern
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSI" --include="*.md" --include="*.ts" --include="*.js" --exclude-dir=node_modules .

# Scan for Termii API Key
grep -r "TLlpIiGIKwzhwErZGPBjxciDtTHuTqSvzSgayCFpCmuJjJOEMLzftmDugTIVBW" --include="*.md" --include="*.ts" --include="*.js" --exclude-dir=node_modules .

# Check .env files are in gitignore
git check-ignore .env .env.local apps/web/.env.local
```

**Expected Results**:
- [ ] No matches for old Service Role Key
- [ ] No matches for old Termii API Key
- [ ] All `.env` files ignored by git

---

## 🛡️ Post-Rotation Verification

After running `./scripts/rotate-secrets.sh`:

### 1. Verify Secret Updates

```bash
# Check Supabase Edge Function secrets
supabase secrets list

# Verify SUPABASE_SERVICE_ROLE_KEY changed
# Verify TERMII_API_KEY changed
```

### 2. Test Edge Functions

```bash
# Test SMS sending
curl -X POST https://qenqilourxtfxchkawek.supabase.co/functions/v1/send-sms \
  -H "Authorization: Bearer <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2348012345678", "message": "Test message"}'

# Test receipt generation
curl -X POST https://qenqilourxtfxchkawek.supabase.co/functions/v1/generate-receipt \
  -H "Authorization: Bearer <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "<test_payment_id>"}'

# Test health check
curl https://qenqilourxtfxchkawek.supabase.co/functions/v1/system-health-check
```

**Expected Results**:
- [ ] SMS sends successfully
- [ ] Receipt generates successfully
- [ ] Health check returns 200 OK

### 3. Test Web Application

- [ ] Login works
- [ ] Signup works
- [ ] Dashboard loads
- [ ] Data fetching works
- [ ] No authentication errors in console

### 4. Revoke Old Keys

**Supabase**:
1. Go to Supabase Dashboard → Settings → API
2. Generate new Service Role Key
3. Copy new key
4. (Old key automatically replaced when new one is generated)

**Termii**:
1. Go to Termii Dashboard → API Keys
2. Generate new API key
3. Copy new key
4. Deactivate old API key

---

## 📋 Documentation Audit

### Files Checked for Leaks

Sanitized files (placeholders instead of actual secrets):
- [x] `docs/SUPABASE_EDGE_SECRETS.md`
- [x] `VERCEL_DEPLOYMENT_FIX.md`
- [ ] `PRODUCTION_LAUNCH_GUIDE.md` (needs sanitization)
- [ ] `ANALYTICS_QUICKSTART.md` (needs sanitization)
- [ ] `MAINTENANCE_QUEST_SUMMARY.md` (needs sanitization)

**Action Required**:
```bash
# Sanitize remaining documentation
./scripts/sanitize-docs.sh
```

---

## 🚨 Emergency Response

### If Secrets Are Compromised

1. **Immediate** (within 15 minutes):
   - [ ] Revoke exposed credentials in dashboards
   - [ ] Generate new credentials
   - [ ] Run `./scripts/rotate-secrets.sh`

2. **Within 1 Hour**:
   - [ ] Audit access logs for unauthorized usage
   - [ ] Deploy updated secrets to all environments
   - [ ] Test all affected services

3. **Within 24 Hours**:
   - [ ] Review and update security procedures
   - [ ] Implement additional monitoring
   - [ ] Document incident in security log

4. **Within 1 Week**:
   - [ ] Implement automated secret scanning in CI/CD
   - [ ] Review all environment variable management
   - [ ] Conduct team security training

---

## 🔧 Maintenance Schedule

### Monthly Tasks
- [ ] Review secret expiry dates
- [ ] Audit Supabase access logs
- [ ] Verify RLS policies
- [ ] Check edge function error logs

### Quarterly Tasks (Every 90 Days)
- [ ] Rotate Supabase Service Role Key
- [ ] Rotate Termii API Key
- [ ] Review and update access permissions
- [ ] Audit all environment variables

### Annual Tasks
- [ ] Comprehensive security audit
- [ ] Review all authentication flows
- [ ] Update security documentation
- [ ] Penetration testing (optional)

---

## 📞 Emergency Contacts

**Supabase Support**: support@supabase.com  
**Termii Support**: support@termii.com  
**Vercel Support**: support@vercel.com

**Internal Team**:
- Security Lead: [Contact]
- DevOps Lead: [Contact]
- Backend Lead: [Contact]

---

## 📚 Related Documentation

- [SECRETS_AUDIT_REPORT.md](./SECRETS_AUDIT_REPORT.md) - Full security audit
- [SUPERQUEST_COMPLETION_REPORT.md](./SUPERQUEST_COMPLETION_REPORT.md) - Implementation details
- [docs/SUPABASE_EDGE_SECRETS.md](./docs/SUPABASE_EDGE_SECRETS.md) - Edge function secret setup

---

## ✅ Final Verification

Before marking as complete:

- [ ] All critical secrets rotated
- [ ] Old keys revoked
- [ ] Edge functions tested
- [ ] Web app tested
- [ ] Documentation sanitized
- [ ] `.gitignore` updated
- [ ] No secrets in git history (or history cleaned)
- [ ] Backup created with new credentials
- [ ] Team notified of changes
- [ ] This checklist reviewed and signed off

**Verified By**: ________________  
**Date**: ________________  
**Next Review**: ________________

---

**Last Updated**: November 14, 2025  
**Next Rotation Due**: February 14, 2026 (90 days)
