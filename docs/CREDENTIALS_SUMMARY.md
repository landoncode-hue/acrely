# Acrely Production Credentials Summary

## ⚠️ Security Notice

This document contains a summary of production credentials configuration. The actual credential values are stored securely in:
- `.env.local` (local development) - **gitignored**
- `.env.production` (production server) - **gitignored**
- GitHub Actions Secrets (CI/CD)
- Supabase Edge Functions Secrets

**Never commit credential files to version control.**

## Configuration Status

### ✅ Local Development Environment
- **File**: `.env.local`
- **Status**: Fully configured with production credentials
- **Verification**: Run `pnpm run verify:env`

### ✅ Production Environment
- **File**: `.env.production`
- **Status**: Configured for production deployment
- **Deployment**: Copy to production server or use in build process

### 🔧 GitHub Actions Secrets
- **Status**: Ready for configuration
- **Guide**: [`docs/GITHUB_SECRETS_SETUP.md`](./GITHUB_SECRETS_SETUP.md)
- **Required**: 7 secrets for CI/CD pipeline

### 🔧 Supabase Edge Functions
- **Status**: Ready for configuration
- **Setup Script**: `./scripts/setup-edge-secrets.sh`
- **Guide**: [`docs/SUPABASE_EDGE_SECRETS.md`](./SUPABASE_EDGE_SECRETS.md)

## Service Endpoints

### Supabase Backend
- **Project URL**: https://qenqilourxtfxchkawek.supabase.co
- **Project Ref**: qenqilourxtfxchkawek
- **Dashboard**: https://app.supabase.com/project/qenqilourxtfxchkawek

### Termii SMS Service
- **API Endpoint**: https://v3.api.termii.com
- **Sender ID**: PBuilders
- **Dashboard**: https://termii.com/

### Hostinger FTP
- **Server**: ftp.pinnaclegroups.ng
- **Deployment Path**: public_html/acrely
- **cPanel**: Accessible through Hostinger dashboard

### Production Website
- **URL**: https://acrely.pinnaclegroups.ng
- **Environment**: Production

## Credential Categories

### 1. Database & Backend (Supabase)
| Credential | Configured In | Purpose |
|------------|---------------|---------|
| SUPABASE_URL | `.env.local`, `.env.production`, GitHub Secrets | Database connection |
| SUPABASE_ANON_KEY | `.env.local`, `.env.production`, GitHub Secrets | Client API access |
| SUPABASE_SERVICE_ROLE_KEY | `.env.local`, `.env.production`, Edge Functions | Server operations |
| SUPABASE_PROJECT_REF | `.env.local`, `.env.production` | Project identifier |
| SUPABASE_ACCESS_TOKEN | GitHub Secrets | CLI authentication |

### 2. SMS Messaging (Termii)
| Credential | Configured In | Purpose |
|------------|---------------|---------|
| TERMII_API_KEY | `.env.local`, `.env.production`, Edge Functions | API authentication |
| TERMII_SENDER_ID | `.env.local`, `.env.production`, Edge Functions | SMS sender ID |
| TERMII_API_URL | `.env.local`, `.env.production`, Edge Functions | Service endpoint |

### 3. Deployment (Hostinger FTP)
| Credential | Configured In | Purpose |
|------------|---------------|---------|
| FTP_SERVER | `.env.local`, `.env.production`, GitHub Secrets | FTP hostname |
| FTP_USERNAME | `.env.local`, `.env.production`, GitHub Secrets | FTP username |
| FTP_PASSWORD | `.env.local`, `.env.production`, GitHub Secrets | FTP password |
| FTP_PATH | `.env.local`, `.env.production` | Deployment directory |

### 4. Security
| Credential | Configured In | Purpose |
|------------|---------------|---------|
| JWT_SECRET | `.env.local`, `.env.production` | Token signing |
| SESSION_TIMEOUT_HOURS | `.env.local`, `.env.production` | Session duration |

## Setup Checklist

### Initial Setup
- [x] Create `.env.local` from template
- [x] Populate `.env.local` with production credentials
- [x] Create `.env.production` for production deployment
- [x] Update `.env.example` with comprehensive documentation
- [x] Create environment verification script
- [x] Add `verify:env` npm script

### GitHub Actions Configuration
- [ ] Navigate to GitHub repository settings
- [ ] Add SUPABASE_ACCESS_TOKEN secret
- [ ] Add SUPABASE_PROJECT_ID secret
- [ ] Add NEXT_PUBLIC_SUPABASE_URL secret
- [ ] Add NEXT_PUBLIC_SUPABASE_ANON_KEY secret
- [ ] Add FTP_SERVER secret
- [ ] Add FTP_USERNAME secret
- [ ] Add FTP_PASSWORD secret
- [ ] Test workflow with manual trigger

### Supabase Edge Functions Configuration
- [ ] Authenticate Supabase CLI: `supabase login`
- [ ] Link project: `supabase link --project-ref qenqilourxtfxchkawek`
- [ ] Run setup script: `./scripts/setup-edge-secrets.sh`
- [ ] Verify secrets: `supabase secrets list`
- [ ] Deploy functions: `pnpm run functions:deploy`

### Verification
- [x] Local environment: `pnpm run verify:env` ✅ Passed
- [ ] Supabase Edge Functions: `supabase secrets list`
- [ ] GitHub Actions: Manual workflow trigger
- [ ] Termii SMS: `pnpm run test:termii`

## Next Steps

### For Local Development
```bash
# 1. Verify environment
pnpm run verify:env

# 2. Start development server
pnpm dev

# 3. Access application
open http://localhost:3000
```

### For Supabase Edge Functions
```bash
# 1. Make script executable (already done)
chmod +x scripts/setup-edge-secrets.sh

# 2. Run setup
./scripts/setup-edge-secrets.sh

# 3. Deploy functions
pnpm run functions:deploy
```

### For GitHub Actions
1. Follow guide: [`docs/GITHUB_SECRETS_SETUP.md`](./GITHUB_SECRETS_SETUP.md)
2. Configure all 7 required secrets
3. Test deployment with manual trigger

### For Production Deployment
1. Review: [`DEPLOYMENT_GUIDE.md`](../DEPLOYMENT_GUIDE.md)
2. Apply database migrations: `pnpm run db:push`
3. Deploy Edge Functions: `pnpm run functions:deploy`
4. Build and deploy web app: `pnpm build`

## Security Reminders

### ✅ Best Practices
- Credentials are in gitignored files
- Service role keys are never client-side
- Regular credential rotation (every 90 days)
- Secure storage in password manager
- Limited access to GitHub secrets

### ⚠️ Never Do
- Commit `.env` files to git
- Share credentials in plain text
- Log credential values
- Use production credentials in development logs
- Expose service role keys to browser

## Documentation References

| Document | Purpose |
|----------|---------|
| [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) | Complete setup guide |
| [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) | GitHub Actions configuration |
| [SUPABASE_EDGE_SECRETS.md](./SUPABASE_EDGE_SECRETS.md) | Edge Functions secrets |
| [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) | Production deployment |

## Support

For credential-related issues:
1. Verify configuration: `pnpm run verify:env`
2. Check documentation in `docs/` directory
3. Review service dashboards (Supabase, Termii, Hostinger)
4. Consult deployment guides

---

**Configuration Date**: November 11, 2025  
**Last Verified**: November 11, 2025  
**Status**: ✅ Ready for deployment
