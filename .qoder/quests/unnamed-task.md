# Environment Configuration Integration for Production Services

## Objective

Integrate production credentials for Supabase backend services, Hostinger FTP deployment, and Termii SMS messaging into the Acrely platform's environment configuration structure to enable full production functionality.

## Background

The Acrely platform currently has placeholder values in environment configuration files. Production credentials are now available for three critical services:
- Supabase (database and backend services)
- Hostinger (web hosting via FTP)
- Termii (SMS notifications)

These credentials must be properly integrated into the appropriate configuration files while maintaining security best practices and supporting multiple deployment environments.

## Scope

### In Scope
- Update environment variable templates with production values
- Configure GitHub Actions secrets for CI/CD pipeline
- Set up Supabase Edge Functions environment variables
- Configure local development environment files
- Document security considerations and credential rotation procedures

### Out of Scope
- Credential rotation automation
- Secret management system implementation (e.g., HashiCorp Vault)
- Infrastructure as Code (IaC) setup
- Monitoring and alerting configuration

## Service Configuration Details

### Supabase Backend Services

The Supabase instance provides PostgreSQL database, authentication, and Edge Functions runtime.

#### Connection Parameters

| Parameter | Value | Usage Context |
|-----------|-------|---------------|
| Project URL | https://qenqilourxtfxchkawek.supabase.co | All client connections |
| Project Reference | qenqilourxtfxchkawek | CLI operations, deployments |
| Anon/Public Key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | Client-side requests, RLS-protected operations |
| Service Role Key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | Server-side operations, bypassing RLS |
| Access Token | sbp_deb38eb56bb9ccb4b546678a20ed256078a02eea | CLI authentication, CI/CD pipelines |
| JWT Secret | Vxcue4zJNdqPGc6bzC29Ko3WlhwY0LNCUSyNqeso0bQJvUMkfGVo1+bdjFzXvSad9kC8MvVaCeedFz2sIQ/E1Q== | Token verification |

#### Security Context

The Supabase service role key grants unrestricted database access and bypasses Row Level Security policies. This key must:
- Never be exposed to client-side code
- Only be used in server-side environments (Edge Functions, CI/CD)
- Be stored in secure secret management systems

The anon key is safe for client-side use as it respects RLS policies and authenticated user context.

### Hostinger FTP Deployment

Hostinger provides the web hosting infrastructure for the Next.js web application.

#### FTP Credentials

| Parameter | Value | Purpose |
|-----------|-------|---------|
| FTP Server | ftp.pinnaclegroups.ng | Connection endpoint |
| Username | u351089353.acrely | Account identifier |
| Password | Arelius345# | Authentication |
| Deployment Path | public_html/acrely | Target directory for web app |

#### Deployment Strategy

The FTP deployment follows a two-phase approach:
1. Build artifacts deployment (/.next/ directory)
2. Static assets deployment (/public/ directory)

This ensures compiled Next.js output and public resources are properly uploaded to production.

### Termii SMS Service

Termii provides SMS messaging capabilities for payment reminders, notifications, and bulk campaigns.

#### API Configuration

| Parameter | Value | Purpose |
|-----------|-------|---------|
| API Key | TLlpIiGIKwzhwErZGPBjxciDtTHuTqSvzSgayCFpCmuJjJOEMLzftmDugTIVBW | Authentication |
| Sender ID | PBuilders | SMS originator identifier |
| API Base URL | https://v3.api.termii.com | Service endpoint |

#### Integration Points

Termii SMS is utilized through Supabase Edge Functions:
- send-sms: Individual message delivery
- bulk-sms-campaign: Mass messaging for campaigns
- check-overdue-payments: Automated payment reminders

## Environment Configuration Structure

The platform requires three distinct environment configurations:

### Development Environment (.env.local)

Used by developers running the application locally.

#### Required Variables

**Supabase Configuration:**
- SUPABASE_URL: Full Supabase project URL
- SUPABASE_ANON_KEY: Public anon key for client operations
- SUPABASE_SERVICE_ROLE_KEY: Service role for server-side operations
- SUPABASE_PROJECT_REF: Project reference identifier
- NEXT_PUBLIC_SUPABASE_URL: Client-accessible URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Client-accessible anon key

**Termii Configuration:**
- TERMII_API_KEY: SMS service authentication
- TERMII_SENDER_ID: Default sender identifier
- TERMII_API_URL: Service endpoint

**Application Configuration:**
- NEXT_PUBLIC_SITE_URL: Local development URL (http://localhost:3000)
- ENVIRONMENT: development
- APP_NAME: Acrely

**Storage Configuration:**
- RECEIPT_BUCKET: receipts
- DOCUMENTS_BUCKET: documents

**Feature Flags:**
- ENABLE_SMS_NOTIFICATIONS: true
- ENABLE_EMAIL_NOTIFICATIONS: false
- ENABLE_AUTO_RECEIPTS: true

**Security:**
- JWT_SECRET: Token signing secret
- SESSION_TIMEOUT_HOURS: 24

### Production Environment (.env.production)

Server-side configuration for production deployment.

This file mirrors the development configuration but uses production-specific values:
- NEXT_PUBLIC_SITE_URL changes to https://acrely.pinnaclegroups.ng
- ENVIRONMENT changes to production
- All credentials reference production instances

### CI/CD Environment (GitHub Actions Secrets)

GitHub Actions requires secrets for automated deployment workflows.

#### Required Secrets

**Supabase Deployment:**
- SUPABASE_ACCESS_TOKEN: CLI authentication for migrations and function deployment
- SUPABASE_PROJECT_ID: Project reference for linking
- NEXT_PUBLIC_SUPABASE_URL: Public URL for build process
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Public key for build process

**Hostinger Deployment:**
- FTP_SERVER: Hostinger FTP server address
- FTP_USERNAME: FTP account username
- FTP_PASSWORD: FTP account password
- FTP_PATH: Deployment target directory

**Termii SMS:**
- TERMII_API_KEY: SMS service authentication

**Optional Monitoring:**
- TELEGRAM_BOT_TOKEN: Deployment notification bot
- TELEGRAM_CHAT_ID: Notification destination
- SENTRY_DSN: Error tracking integration

## Supabase Edge Functions Configuration

Edge Functions require their own environment variables set through the Supabase CLI or dashboard.

### Function Environment Variables

These variables are injected into the Deno runtime for all Edge Functions:

**Service Configuration:**
- SUPABASE_URL: Database connection endpoint
- SUPABASE_SERVICE_ROLE_KEY: Elevated permissions for database operations

**Termii Integration:**
- TERMII_API_KEY: SMS service authentication
- TERMII_BASE_URL: API endpoint
- TERMII_SENDER_ID: Default sender identifier

**Company Information:**
- COMPANY_NAME: Pinnacle Builders Homes & Properties
- COMPANY_EMAIL: info@pinnaclegroups.ng
- COMPANY_PHONE: Contact phone number
- COMPANY_ADDRESS: Business address

**Storage:**
- RECEIPT_BUCKET: receipts
- DOCUMENTS_BUCKET: documents

### Deployment Method

Edge Function secrets are configured via Supabase CLI:

```
supabase secrets set VARIABLE_NAME=value
```

Or through the Supabase Dashboard under Project Settings > Edge Functions > Secrets.

## Configuration File Updates

### .env.example Template Update

The environment template file should be updated to reflect all required variables with placeholder values. This serves as documentation for developers and deployment teams.

#### Structure Requirements

The file should be organized into logical sections:
1. Supabase Configuration
2. Termii SMS API Configuration
3. Storage Configuration
4. Application Configuration
5. Commission & Payment Settings
6. Email Configuration (Optional)
7. Sentry Error Tracking (Optional)
8. Feature Flags
9. Security
10. Deployment Configuration

Each section should include:
- Clear section headers with separators
- Descriptive comments for each variable
- Placeholder values that indicate expected format
- References to where actual values can be obtained

### .env.local Creation

Developers should copy .env.example to .env.local and populate with actual development credentials.

This file must be:
- Listed in .gitignore to prevent accidental commits
- Populated with production credentials for accurate local testing
- Updated when new environment variables are added

### .env.production Creation

Production environment file for server deployment contexts.

Key differences from .env.local:
- NEXT_PUBLIC_SITE_URL uses production domain
- ENVIRONMENT set to "production"
- FTP credentials included for deployment automation

This file should:
- Be stored securely on production servers only
- Never be committed to version control
- Be referenced in production deployment documentation

## GitHub Actions Workflow Integration

The CI/CD pipeline requires access to production credentials through GitHub Secrets.

### Secrets Configuration Location

GitHub Repository → Settings → Secrets and variables → Actions → Repository secrets

### Workflow Usage Pattern

The deploy.yml workflow references secrets in multiple jobs:

**Database Migration Job:**
- Uses SUPABASE_ACCESS_TOKEN for CLI authentication
- Uses SUPABASE_PROJECT_ID for project linking
- Executes database migrations via Supabase CLI

**Edge Functions Deployment Job:**
- Uses SUPABASE_ACCESS_TOKEN for authentication
- Deploys all functions to production
- Secrets are pre-configured in Supabase, not passed via workflow

**Web Application Build Job:**
- Uses NEXT_PUBLIC_SUPABASE_URL for build-time configuration
- Uses NEXT_PUBLIC_SUPABASE_ANON_KEY for client initialization
- Compiles Next.js application with embedded environment variables

**FTP Deployment Job:**
- Uses FTP_SERVER for connection
- Uses FTP_USERNAME and FTP_PASSWORD for authentication
- Uploads build artifacts to public_html/acrely directory

**Verification Job:**
- Uses NEXT_PUBLIC_SUPABASE_ANON_KEY for API health checks
- Validates deployment success before marking workflow complete

## Security Considerations

### Credential Exposure Prevention

**Critical Rules:**
1. Service role keys must never appear in client-side code or public repositories
2. FTP passwords must never be committed to version control
3. API keys must not be logged in application outputs
4. .env files containing real credentials must be gitignored

**Protection Mechanisms:**
- .gitignore includes .env, .env.local, .env.production patterns
- GitHub Actions secrets are encrypted at rest
- Supabase Edge Function secrets are isolated from client access
- Build processes must not echo sensitive environment variables

### Credential Rotation Strategy

When credentials need to be rotated:

**Supabase Credentials:**
1. Generate new service role key in Supabase Dashboard
2. Update GitHub Actions secrets
3. Update production .env files
4. Update Supabase Edge Function secrets via CLI
5. Verify all services remain operational
6. Revoke old credentials

**Termii API Key:**
1. Generate new API key in Termii Dashboard
2. Update all environment files and GitHub secrets
3. Update Supabase Edge Function secrets
4. Test SMS functionality
5. Revoke old API key

**FTP Credentials:**
1. Create new FTP user in Hostinger cPanel
2. Update GitHub Actions secrets
3. Test deployment workflow
4. Remove old FTP user

### Access Control

**Who Needs What:**

| Role | Supabase Keys | FTP Credentials | Termii Key | GitHub Secrets Access |
|------|---------------|-----------------|------------|----------------------|
| Developers | Anon key only | No | No (testing with mock) | Read repository |
| DevOps | All keys | Yes | Yes | Admin access |
| CI/CD Pipeline | Access token, Anon key | Yes | No (pre-configured) | Automated access |
| Edge Functions | Service role (auto-injected) | No | Yes (auto-injected) | No |

## Implementation Steps

### Phase 1: Local Environment Setup

1. Update .env.example with comprehensive variable documentation
2. Create .env.local from template for local development
3. Populate .env.local with production Supabase and Termii credentials
4. Verify .gitignore prevents .env.local from being committed
5. Test local development server with real credentials

### Phase 2: Supabase Edge Functions Configuration

1. Authenticate Supabase CLI with access token
2. Link local project to production Supabase instance
3. Set all Edge Function secrets using supabase secrets set command
4. Verify secrets are configured with supabase secrets list
5. Test Edge Functions locally with real credentials
6. Deploy Edge Functions to production
7. Verify Edge Functions can access Termii API and database

### Phase 3: GitHub Actions Secrets Configuration

1. Access GitHub repository settings
2. Navigate to Secrets and variables → Actions
3. Create each required secret with production values
4. Verify secret names match workflow file references exactly
5. Test deployment workflow with a non-production change
6. Monitor workflow execution for credential issues

### Phase 4: Production Environment File

1. Create .env.production on production server or build pipeline
2. Populate with production-specific values
3. Ensure file permissions restrict access (chmod 600)
4. Verify production application can read environment variables
5. Test production deployment end-to-end

### Phase 5: Verification & Testing

1. Execute full CI/CD pipeline deployment
2. Verify database migrations apply successfully
3. Verify Edge Functions deploy without errors
4. Verify web application builds and deploys to Hostinger
5. Test SMS functionality through production Edge Functions
6. Verify FTP deployment updates production site
7. Confirm all health checks pass in workflow

## Environment Variable Reference

### Complete Variable List

| Variable | Required | Type | Environments | Description |
|----------|----------|------|--------------|-------------|
| SUPABASE_URL | Yes | Secret | All | Supabase project URL |
| SUPABASE_ANON_KEY | Yes | Secret | All | Public API key |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Secret | Server, Edge | Service role key |
| SUPABASE_PROJECT_REF | Yes | Public | CI/CD | Project reference |
| SUPABASE_ACCESS_TOKEN | Yes | Secret | CI/CD | CLI authentication |
| NEXT_PUBLIC_SUPABASE_URL | Yes | Public | Web | Client-accessible URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Public | Web | Client-accessible key |
| TERMII_API_KEY | Yes | Secret | Server, Edge | Termii authentication |
| TERMII_SENDER_ID | Yes | Public | All | SMS sender ID |
| TERMII_API_URL | Yes | Public | All | Termii endpoint |
| FTP_SERVER | Yes | Public | CI/CD | Hostinger FTP server |
| FTP_USERNAME | Yes | Secret | CI/CD | FTP username |
| FTP_PASSWORD | Yes | Secret | CI/CD | FTP password |
| FTP_PATH | Yes | Public | CI/CD | Deployment directory |
| SITE_URL | Yes | Public | All | Application URL |
| ENVIRONMENT | Yes | Public | All | Environment identifier |
| APP_NAME | Yes | Public | All | Application name |
| RECEIPT_BUCKET | Yes | Public | All | Storage bucket name |
| DOCUMENTS_BUCKET | Yes | Public | All | Storage bucket name |
| DEFAULT_COMMISSION_PERCENT | No | Public | All | Default commission rate |
| DEFAULT_PLOT_PRICE | No | Public | All | Default plot price |
| ENABLE_SMS_NOTIFICATIONS | No | Public | All | Feature flag |
| ENABLE_EMAIL_NOTIFICATIONS | No | Public | All | Feature flag |
| ENABLE_AUTO_RECEIPTS | No | Public | All | Feature flag |
| JWT_SECRET | Yes | Secret | Server | Token signing |
| SESSION_TIMEOUT_HOURS | No | Public | All | Session duration |
| SENTRY_DSN | No | Secret | All | Error tracking |
| SMTP_HOST | No | Secret | Server | Email server |
| SMTP_PORT | No | Public | Server | Email port |
| SMTP_USER | No | Secret | Server | Email username |
| SMTP_PASSWORD | No | Secret | Server | Email password |
| FROM_EMAIL | No | Public | Server | Sender email |
| TELEGRAM_BOT_TOKEN | No | Secret | CI/CD | Notification bot |
| TELEGRAM_CHAT_ID | No | Secret | CI/CD | Notification destination |

## Post-Implementation Validation

### Validation Checklist

**Local Development:**
- [ ] Application starts without environment variable errors
- [ ] Supabase connection established successfully
- [ ] Authentication flow works with real Supabase Auth
- [ ] Database queries execute and return data
- [ ] Edge Functions can be invoked from local app

**Supabase Edge Functions:**
- [ ] All secrets visible in supabase secrets list output
- [ ] send-sms function successfully sends test SMS via Termii
- [ ] generate-receipt function creates PDF receipts
- [ ] commission-calculation computes accurately
- [ ] Functions can access Supabase database with service role

**GitHub Actions CI/CD:**
- [ ] Workflow triggers on push to main branch
- [ ] Health check job validates all secrets present
- [ ] Database migration job applies migrations successfully
- [ ] Edge Functions deployment job completes without errors
- [ ] Web build job compiles Next.js application
- [ ] FTP deployment uploads files to Hostinger
- [ ] Post-deployment verification confirms site accessibility
- [ ] Notification job sends success message

**Production Application:**
- [ ] Site accessible at https://acrely.pinnaclegroups.ng
- [ ] Login authentication works
- [ ] Dashboard loads user-specific data
- [ ] Customer management operations succeed
- [ ] Payment recording triggers SMS notifications
- [ ] Receipt generation produces downloadable PDFs
- [ ] Commission calculations display correctly

### Troubleshooting Common Issues

**Issue: "Failed to fetch" errors on client**
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
- Check browser console for CORS errors
- Confirm Supabase project is not paused

**Issue: Edge Functions return 401 Unauthorized**
- Verify function secrets are set correctly
- Check SUPABASE_SERVICE_ROLE_KEY in function environment
- Ensure service role key has not been rotated without updating

**Issue: SMS not sending**
- Verify TERMII_API_KEY is correct and active
- Check Termii account balance is sufficient
- Verify TERMII_SENDER_ID is approved by Termii
- Review Edge Function logs for Termii API errors

**Issue: FTP deployment fails in GitHub Actions**
- Verify FTP_SERVER, FTP_USERNAME, FTP_PASSWORD secrets
- Check FTP_PATH exists on Hostinger server
- Ensure FTP account has write permissions
- Review Hostinger cPanel for account status

**Issue: Database migrations fail**
- Verify SUPABASE_ACCESS_TOKEN is valid
- Check SUPABASE_PROJECT_ID matches target project
- Ensure migration files are syntactically correct
- Review Supabase dashboard migration history

## Risk Mitigation

### Security Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Credential leak in repository | High | Strict .gitignore enforcement, pre-commit hooks |
| Service role key exposed to client | Critical | Code review process, automated scanning |
| Unauthorized FTP access | High | Strong password, IP restrictions if available |
| Termii API key exhaustion | Medium | Rate limiting, usage monitoring |
| JWT secret compromise | Critical | Regular rotation, secure generation |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Lost access to Supabase project | Critical | Document recovery procedures, backup access tokens |
| FTP credentials forgotten | Medium | Secure password manager, documentation |
| Termii account suspension | High | Compliance with SMS regulations, backup provider |
| GitHub Actions quota exceeded | Medium | Optimize workflows, monitor usage |
| Environment variable misconfiguration | High | Validation scripts, deployment checklists |

## Maintenance Procedures

### Regular Maintenance Tasks

**Monthly:**
- Review Termii SMS usage and balance
- Verify all GitHub Actions secrets are current
- Check Supabase database storage usage
- Review application error logs for credential issues

**Quarterly:**
- Audit who has access to production credentials
- Review and update .env.example documentation
- Test credential rotation procedures
- Verify backup and recovery processes

**Annually:**
- Rotate all production credentials
- Review security best practices for updates
- Update documentation with lessons learned
- Audit third-party service dependencies

### Documentation Maintenance

Keep the following documents synchronized with credential changes:
- .env.example template
- DEPLOYMENT_GUIDE.md
- PRODUCTION_DEPLOYMENT.md
- README.md Quick Start section
- Internal runbooks and procedures

## Success Criteria

The environment configuration integration is successful when:

1. **Development Environment:**
   - Developers can run the application locally with production credentials
   - All features function identically to production
   - Environment setup takes less than 15 minutes from repository clone

2. **Production Deployment:**
   - Automated CI/CD pipeline deploys successfully on every merge to main
   - Zero manual intervention required for credential injection
   - Deployment completes in under 10 minutes

3. **Operational Stability:**
   - No environment-related errors in production logs
   - SMS notifications deliver consistently
   - Database connections remain stable
   - FTP deployments succeed on first attempt

4. **Security Compliance:**
   - No credentials exposed in version control
   - All secrets stored in approved secret management systems
   - Access to production credentials limited to authorized personnel
   - Credential rotation procedures documented and tested
