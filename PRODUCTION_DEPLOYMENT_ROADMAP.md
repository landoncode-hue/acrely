# Acrely v2 - Production Deployment Roadmap

**Version:** 2.0.0  
**Author:** Kennedy — Landon Digital  
**Client:** Pinnacle Builders Homes & Properties  
**Target URL:** https://acrely.pinnaclegroups.ng  
**Deployment Date:** [To be scheduled]

---

## 🎯 Deployment Objectives

1. **Deploy Acrely v2 to production** at acrely.pinnaclegroups.ng
2. **Ensure zero-downtime deployment** with proper rollback procedures
3. **Validate all systems** before making the platform publicly available
4. **Enable automated monitoring** for 24/7 system health tracking
5. **Provide comprehensive documentation** for future maintenance

---

## 📋 Pre-Deployment Checklist

### Environment Preparation
- [ ] Supabase Cloud project created and configured
- [ ] Hostinger hosting account active with Node.js 20+ support
- [ ] Domain `acrely.pinnaclegroups.ng` configured with SSL
- [ ] Termii SMS account active with sufficient credits
- [ ] GitHub repository ready with production branch
- [ ] All team members briefed on deployment schedule

### Code Quality
- [ ] All TypeScript compilation errors resolved
- [ ] ESLint warnings addressed
- [ ] Production build successful locally
- [ ] E2E tests reviewed and passing
- [ ] Security audit completed
- [ ] Performance optimization done

### Documentation
- [ ] Production deployment guide reviewed
- [ ] User acceptance testing specification prepared
- [ ] Rollback procedures documented
- [ ] Support contacts updated
- [ ] Training materials prepared for end-users

---

## 🚀 Deployment Timeline

### Phase 1: Pre-Production Setup (Day 1-2)

#### Day 1 Morning (2-3 hours)
**Task:** Environment Configuration
- [ ] Create `.env.production` from template
- [ ] Configure all environment variables
- [ ] Test Supabase connectivity
- [ ] Test Termii SMS API
- [ ] Verify all credentials valid

**Scripts to run:**
```bash
pnpm verify:env
pnpm production:setup
```

#### Day 1 Afternoon (2-3 hours)
**Task:** Database Setup
- [ ] Link to Supabase production project
- [ ] Review all 22 migration files
- [ ] Apply migrations to production
- [ ] Verify database schema
- [ ] Create storage buckets
- [ ] Configure RLS policies

**Scripts to run:**
```bash
cd supabase
supabase link --project-ref YOUR_REF
supabase db push
```

#### Day 2 Morning (2-3 hours)
**Task:** Edge Functions Deployment
- [ ] Configure edge function secrets
- [ ] Deploy all 13 edge functions
- [ ] Test each function individually
- [ ] Set up cron jobs in Supabase
- [ ] Verify automated processes

**Scripts to run:**
```bash
pnpm functions:deploy
# Then run SQL script: scripts/setup-cron-jobs.sql
```

#### Day 2 Afternoon (1-2 hours)
**Task:** Application Build
- [ ] Install production dependencies
- [ ] Build Next.js application
- [ ] Test production build locally
- [ ] Verify all routes accessible
- [ ] Check for console errors

**Scripts to run:**
```bash
pnpm install --frozen-lockfile
pnpm build
cd apps/web && pnpm start
```

---

### Phase 2: Deployment Execution (Day 3)

#### Option A: Automated Deployment (GitHub Actions)

**Time:** 30-45 minutes

**Steps:**
1. Configure GitHub Secrets
   - [ ] Add all required secrets to repository
   - [ ] Verify FTP credentials
   - [ ] Test secret access

2. Trigger Deployment
   - [ ] Merge develop to main branch
   - [ ] Push to GitHub
   - [ ] Monitor workflow execution

3. Monitor Progress
   - [ ] Watch GitHub Actions logs
   - [ ] Verify each job completes
   - [ ] Check deployment notifications

**GitHub Workflow:**
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
# Monitor: https://github.com/YOUR_ORG/Acrely/actions
```

#### Option B: Manual Deployment (FTP/SSH)

**Time:** 1-2 hours

**Steps:**
1. Build Application
   ```bash
   pnpm production:deploy
   ```

2. Deploy to Hostinger
   ```bash
   pnpm production:deploy-hostinger
   ```

3. Configure Node.js in cPanel
   - [ ] Set up Node.js application
   - [ ] Configure environment variables
   - [ ] Set entry point to server.js
   - [ ] Start application

4. Verify Deployment
   ```bash
   pnpm production:verify
   ```

---

### Phase 3: Post-Deployment Verification (Day 3-4)

#### Immediate Verification (30 minutes)

**Automated Tests:**
```bash
./scripts/verify-production.sh
```

**Expected Results:**
- ✅ DNS resolution working
- ✅ Website accessible via HTTPS
- ✅ SSL certificate valid
- ✅ Supabase API responding
- ✅ All edge functions deployed
- ✅ Database tables accessible
- ✅ Storage buckets configured

#### Manual Smoke Testing (1 hour)

**Critical User Flows:**
1. **Login Flow**
   - [ ] Navigate to production URL
   - [ ] Login as each role type
   - [ ] Dashboard loads correctly

2. **Customer Management**
   - [ ] Create test customer
   - [ ] Edit customer details
   - [ ] Search for customer

3. **Payment Processing**
   - [ ] Record test payment
   - [ ] Verify receipt generated
   - [ ] Check SMS sent
   - [ ] Confirm balance updated

4. **Reports**
   - [ ] Generate sales report
   - [ ] Export billing summary
   - [ ] Verify data accuracy

#### User Acceptance Testing (Day 4: 4-6 hours)

**Follow UAT Specification:**
- [ ] Run all test suites from `tests/uat/UAT_TEST_SPECIFICATION.md`
- [ ] Document all findings
- [ ] Create tickets for any issues
- [ ] Get sign-off from stakeholders

**Test Coverage:**
- Authentication & Authorization
- Customer Management
- Allocations Management
- Payment Processing
- Commission Management
- Reports & Analytics
- Audit System
- Performance Testing
- Mobile Responsiveness
- Error Handling
- Security Testing

---

### Phase 4: Monitoring & Stabilization (Day 5-7)

#### Day 5: Initial Monitoring

**Continuous Checks:**
- [ ] Monitor error logs every 2 hours
- [ ] Check SMS delivery success rate
- [ ] Verify cron jobs executing
- [ ] Review system performance
- [ ] Monitor user feedback

**Metrics to Track:**
- Response times (target: < 2s)
- Error rates (target: < 1%)
- SMS delivery rate (target: > 95%)
- Database performance
- Storage usage

#### Day 6-7: Stabilization

**Tasks:**
- [ ] Address any critical issues immediately
- [ ] Optimize slow queries if needed
- [ ] Fine-tune cron schedules
- [ ] Update documentation based on findings
- [ ] Plan for feature enhancements

---

## 📊 Success Criteria

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | > 99.5% | System monitoring |
| Response Time | < 2 seconds | Lighthouse/GTMetrix |
| Error Rate | < 1% | Error logs |
| SMS Delivery | > 95% | Termii dashboard |
| Backup Success | 100% | Cron logs |

### Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Satisfaction | > 4/5 | User surveys |
| Data Accuracy | 100% | Manual verification |
| Feature Adoption | > 80% | Usage analytics |
| Support Tickets | < 5/week | Helpdesk system |

### Compliance

- [ ] All RLS policies active
- [ ] Audit logs capturing all actions
- [ ] Data backup running daily
- [ ] HTTPS enforced site-wide
- [ ] No sensitive data in client code

---

## 🔄 Rollback Plan

### Trigger Conditions

Rollback should be initiated if:
- Critical features not working (login, payments)
- Data corruption detected
- Security vulnerability exposed
- Performance degradation > 50%
- Uptime < 90% in first 24 hours

### Rollback Procedure

#### Immediate Actions (5-10 minutes)
```bash
# 1. Stop current deployment
# In Hostinger cPanel → Stop Node.js App

# 2. Restore previous application version
cd backups/deployment-YYYYMMDD-HHMMSS
# Upload to Hostinger via FTP

# 3. Restart application
# In Hostinger cPanel → Start Node.js App
```

#### Database Rollback (10-15 minutes)
```bash
# Only if database changes caused issues
cd supabase
supabase db reset --version PREVIOUS_VERSION
```

#### Edge Functions Rollback (5-10 minutes)
```bash
# Checkout previous version
git checkout PREVIOUS_TAG

# Redeploy functions
cd supabase
supabase functions deploy
```

#### Communication
- [ ] Notify technical team immediately
- [ ] Inform stakeholders
- [ ] Update status page
- [ ] Document rollback reason
- [ ] Schedule post-mortem meeting

---

## 🛠️ Post-Deployment Tasks

### Immediate (Within 24 hours)
- [ ] Monitor system continuously
- [ ] Address any critical bugs
- [ ] Gather initial user feedback
- [ ] Document deployment learnings
- [ ] Update runbooks if needed

### Week 1
- [ ] Conduct daily standup meetings
- [ ] Review analytics and metrics
- [ ] Optimize performance if needed
- [ ] Train support team
- [ ] Create user documentation

### Week 2-4
- [ ] Transition to normal monitoring schedule
- [ ] Plan feature enhancements
- [ ] Conduct retrospective meeting
- [ ] Update security policies
- [ ] Review and optimize costs

### Monthly
- [ ] Generate billing summary
- [ ] Review commission calculations
- [ ] Analyze usage patterns
- [ ] Plan capacity upgrades
- [ ] Conduct security audit

---

## 📞 Support Structure

### Deployment Day Support

**War Room Team:**
- Technical Lead: Kennedy (Landon Digital)
- Backend Engineer: [Name]
- Frontend Engineer: [Name]
- QA Lead: [Name]
- Business Representative: [Name]

**Communication Channels:**
- Primary: Dedicated Slack channel
- Secondary: WhatsApp group
- Emergency: Phone call tree

**Escalation Path:**
1. First responder: On-duty engineer
2. Technical Lead: Kennedy
3. Project Manager: [Name]
4. CTO/Management: [Name]

### Ongoing Support

**Business Hours (Mon-Fri, 9 AM - 5 PM):**
- Email: support@pinnaclegroups.ng
- Phone: +234XXXXXXXXXX
- Response Time: < 2 hours

**After Hours (Critical Issues Only):**
- Emergency Hotline: +234XXXXXXXXXX
- Response Time: < 1 hour

**Support Tiers:**
- **P1 (Critical):** System down, data loss - 15 min response
- **P2 (High):** Major feature broken - 2 hour response
- **P3 (Medium):** Minor issues - 1 day response
- **P4 (Low):** Enhancement requests - 1 week response

---

## 📚 Reference Documentation

### Deployment Guides
- `PRODUCTION_DEPLOYMENT.md` - Comprehensive deployment guide
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `PRODUCTION_LAUNCH_GUIDE.md` - Quick start deployment guide
- `DEPLOYMENT_GUIDE.md` - General deployment procedures

### Testing Documentation
- `tests/uat/UAT_TEST_SPECIFICATION.md` - User acceptance testing
- `tests/e2e/` - End-to-end test suite
- `QA_CHECKLIST.md` - Quality assurance checklist

### Scripts
- `scripts/setup-production-env.sh` - Environment setup
- `scripts/deploy-production.sh` - Full deployment script
- `scripts/verify-production.sh` - Production verification
- `scripts/deploy-to-hostinger.sh` - Hostinger FTP deployment
- `scripts/setup-cron-jobs.sql` - Automated tasks setup

### Configuration
- `.env.production.example` - Environment variables template
- `supabase/config.toml` - Supabase configuration
- `.github/workflows/deploy.yml` - CI/CD pipeline

---

## ✅ Go-Live Decision Matrix

| Criteria | Weight | Status | Score |
|----------|--------|--------|-------|
| All critical tests passed | 25% | [ ] | /25 |
| Performance targets met | 20% | [ ] | /20 |
| Security audit completed | 20% | [ ] | /20 |
| UAT sign-off received | 15% | [ ] | /15 |
| Monitoring configured | 10% | [ ] | /10 |
| Documentation complete | 10% | [ ] | /10 |
| **TOTAL** | **100%** | | **/100** |

**Go-Live Threshold:** 85/100

**Decision:**
- [ ] **GO** - Score ≥ 85, proceed with launch
- [ ] **NO-GO** - Score < 85, address gaps before launch

**Approved By:** _____________________

**Date:** _____________________

**Signature:** _____________________

---

## 🎉 Launch Announcement

Once deployment is successful and all criteria met:

### Internal Announcement
```
Subject: 🚀 Acrely v2 is Live!

Dear Team,

We are excited to announce that Acrely v2 has been successfully deployed to production!

Production URL: https://acrely.pinnaclegroups.ng

Key Features:
✅ Complete customer and allocation management
✅ Automated payment processing with receipts
✅ SMS notifications via Termii
✅ Real-time commission tracking
✅ Comprehensive reporting and analytics
✅ Full audit trail and system monitoring

Thank you to everyone who contributed to making this launch a success!

[Technical Details]
```

### External Announcement
```
Subject: Introducing Acrely - Your New Real Estate Management Platform

Dear Valued Clients,

Pinnacle Builders Homes & Properties is pleased to introduce Acrely, 
our new state-of-the-art real estate management platform.

Access your account: https://acrely.pinnaclegroups.ng

For support, contact: info@pinnaclegroups.ng

[User Guide Link]
[Training Video Link]
```

---

**Deployment Roadmap Version:** 1.0  
**Last Updated:** November 11, 2025  
**Status:** Ready for Execution ✅
