# ⚡ Acrely v2 - Infrastructure Quick Start

**Last Updated**: November 14, 2025  
**Purpose**: Get infrastructure operational in minimal steps

---

## 🚀 5-Minute Setup

### Step 1: Rotate Secrets (CRITICAL)

```bash
# 1. Generate new keys first:
# - Supabase: Dashboard → Settings → API → Generate new Service Role Key
# - Termii: Dashboard → API Keys → Generate new key

# 2. Run rotation script
./scripts/rotate-secrets.sh

# 3. Follow prompts to enter new keys
```

### Step 2: Deploy Test Schema

```bash
# Push new migration
supabase db push

# Or manually
supabase migration up
```

### Step 3: Test & Verify

```bash
# Reset and seed test schema
./scripts/reset-test-schema.sh

# Create first backup
./scripts/backup-database.sh
# Choose: 1) Local

# Verify secrets
supabase secrets list
```

---

## 📋 Essential Commands

### Secret Management
```bash
# Rotate all secrets
./scripts/rotate-secrets.sh

# Check edge function secrets
supabase secrets list

# Sanitize documentation
./scripts/sanitize-docs.sh
```

### Database Operations
```bash
# Reset test environment
./scripts/reset-test-schema.sh

# Backup database
./scripts/backup-database.sh

# Restore from backup
./scripts/restore-database.sh
```

### Verification
```bash
# Check for leaked secrets
grep -r "eyJhbGciOiJ" . --exclude-dir=node_modules --exclude-dir=.git

# Test health check
curl https://qenqilourxtfxchkawek.supabase.co/functions/v1/system-health-check

# Verify RLS policies
psql <db_url> -c "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';"
```

---

## 📚 Key Documentation

| Document | Purpose |
|----------|---------|
| `SECRETS_CHECK.md` | Security verification checklist |
| `SECRETS_AUDIT_REPORT.md` | Full security audit findings |
| `DATA_STANDARDS.md` | Canonical data formats |
| `SUPERQUEST_COMPLETION_REPORT.md` | Complete implementation details |

---

## 🎯 Next Steps

1. ✅ **Rotate secrets** (use `./scripts/rotate-secrets.sh`)
2. ✅ **Deploy test schema** (`supabase db push`)
3. ✅ **Test edge functions** (SMS, receipts, health check)
4. ⚠️ **Import legacy data** (upload CSVs, run migration)
5. ⚠️ **Schedule automated backups** (cron job)

---

## 🆘 Troubleshooting

**Q: Secret rotation failed?**
```bash
# Re-authenticate
supabase login
supabase link --project-ref qenqilourxtfxchkawek

# Try again
./scripts/rotate-secrets.sh
```

**Q: Test schema not found?**
```bash
# Deploy migration first
supabase db push

# Then reset
./scripts/reset-test-schema.sh
```

**Q: Edge functions returning errors?**
```bash
# Check secrets are set
supabase secrets list

# View function logs
supabase functions logs <function_name>

# Redeploy if needed
supabase functions deploy <function_name>
```

---

## 📞 Support

- **Documentation**: See `SUPERQUEST_COMPLETION_REPORT.md`
- **Security**: See `SECRETS_AUDIT_REPORT.md`
- **Standards**: See `DATA_STANDARDS.md`

---

**Quick Reference**: All scripts in `scripts/` directory  
**All migrations**: `supabase/migrations/`
