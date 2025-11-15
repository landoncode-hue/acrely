# 🚀 Acrely Production Launch - Quick Reference

**Version:** 2.0.0  
**Last Updated:** November 15, 2025

---

## 📋 Pre-Launch Checklist

- [ ] All environment variables configured in Vercel
- [ ] DNS records configured for acrely.pinnaclegroups.ng
- [ ] Supabase migrations applied to production DB
- [ ] Edge functions deployed
- [ ] Team trained and ready
- [ ] Backup strategy tested

---

## ⚡ Quick Deploy Commands

### Staging Deployment
```bash
# Deploy web app to staging
pnpm staging:deploy-web

# Verify staging deployment
pnpm production:verify-deployment https://acrely-staging.vercel.app
```

### Production Deployment
```bash
# 1. Deploy web application
pnpm production:deploy-web

# 2. Deploy mobile application
pnpm production:deploy-mobile production

# 3. Deploy queue monitoring
pnpm functions:deploy:queue-monitor

# 4. Verify deployment
pnpm production:verify-deployment

# OR: Full automated deployment
pnpm production:full-deploy
```

### Database Migrations
```bash
# Apply migrations to production
cd supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Edge Functions
```bash
# Deploy all functions
pnpm functions:deploy

# Deploy specific maintenance functions
pnpm functions:deploy:maintenance

# Deploy queue health monitor
pnpm functions:deploy:queue-monitor
```

---

## 🔍 Verification Commands

### Check Production Health
```bash
# Comprehensive deployment verification
pnpm production:verify-deployment

# Individual checks
curl -I https://acrely.pinnaclegroups.ng
curl https://acrely.pinnaclegroups.ng/api/health
```

### Monitor Queue Health
```bash
# Call queue health monitor
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  https://qenqilourxtfxchkawek.supabase.co/functions/v1/queue-health-monitor
```

---

## 🎓 Training Quick Links

### Documentation
- **Operations Runbook:** `OPERATIONS_RUNBOOK.md`
- **User Manual:** See Operations Runbook Sections 2-6
- **Troubleshooting:** Operations Runbook Section 7
- **Client Handover:** `CLIENT_HANDOVER_CHECKLIST.md`

### Training Modules
1. Executive Overview (10 min)
2. Frontdesk Operations (25 min)
3. Agent Workflow (20 min)
4. System Administration (30 min)

---

## 📞 Emergency Contacts

### Critical Issues (P0)
- **Phone:** +234-XXX-XXXX-XXX
- **Response Time:** 1 hour

### High Priority (P1)
- **Email:** support@landondigital.com
- **Telegram:** @acrely-support
- **Response Time:** 4 hours

---

## 🔧 Common Tasks

### Add New User
```
1. Settings > Users > Add New User
2. Fill in details (name, email, phone, role)
3. Click Create User
4. User receives email with login credentials
```

### Record Payment
```
1. Payments > Record Payment
2. Select Customer and Allocation
3. Enter amount and payment method
4. Click Record Payment
5. Receipt auto-generated and sent via SMS
```

### Generate Report
```
1. Reports > [Report Type]
2. Select filters (date range, estate, etc.)
3. Click Generate Report
4. Download PDF or Excel
```

---

## 📊 Key Metrics to Monitor

### Daily
- Total payments collected
- New allocations
- Outstanding balances
- SMS delivery rate
- System uptime

### Weekly
- User adoption rate
- Feature utilization
- Support tickets
- Performance metrics

### Monthly
- Revenue vs. target
- Agent commissions
- Customer satisfaction
- System performance trends

---

## 🚨 Rollback Procedure

### If Deployment Fails
```bash
# 1. Identify issue
pnpm production:verify-deployment

# 2. Rollback web app
vercel rollback

# 3. Rollback database (if needed)
supabase db reset --version PREVIOUS_VERSION

# 4. Notify team
# Use communication channels to inform stakeholders
```

---

## 📈 Success Criteria

### Launch Day
- ✅ Production URL accessible (200 OK)
- ✅ All users can login
- ✅ No console errors
- ✅ SSL certificate valid
- ✅ Monitoring active

### Week 1
- ✅ 80%+ users trained
- ✅ Daily operations running smoothly
- ✅ < 10 support tickets/day
- ✅ 99.5%+ uptime
- ✅ No critical bugs

### Month 1
- ✅ 100% user adoption
- ✅ 90%+ user satisfaction
- ✅ All workflows optimized
- ✅ 99.9%+ uptime
- ✅ Business value delivered

---

## 🎯 Next Steps After Launch

### Day 1
- [ ] Monitor system closely
- [ ] Collect initial user feedback
- [ ] Address urgent issues
- [ ] Daily check-in call (9 AM WAT)

### Week 1
- [ ] Complete all training sessions
- [ ] Review daily metrics
- [ ] Fix minor bugs
- [ ] Generate Week 1 report

### Month 1
- [ ] Conduct 30-day review
- [ ] Analyze user adoption
- [ ] Optimize workflows
- [ ] Plan next 30 days

---

## 📚 Full Documentation Index

1. **SUPERQUEST_4_PRODUCTION_LAUNCH.md** - Complete launch strategy
2. **OPERATIONS_RUNBOOK.md** - Day-to-day operations guide
3. **CLIENT_HANDOVER_CHECKLIST.md** - Handover procedures
4. **30_60_90_DAY_ROADMAP.md** - Post-launch support plan
5. **PRODUCTION_DEPLOYMENT.md** - Detailed deployment guide

---

## ⚙️ Configuration Files

### Environment Variables (Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://acrely.pinnaclegroups.ng
NEXT_PUBLIC_ORG_ID=pinnacle-builders
NEXT_PUBLIC_PROJECT_NAME=Acrely
NEXT_PUBLIC_TERMII_API_KEY=<your-termii-key>
NEXT_PUBLIC_TERMII_SENDER_ID=PINNACLE
```

### DNS Records
```
A Record: acrely -> Vercel IP
CNAME: www.acrely -> cname.vercel-dns.com
```

---

## 🎉 Launch Day Timeline

**08:00 AM** - Pre-launch team call  
**09:00 AM** - Execute deployment  
**09:30 AM** - Verification tests  
**10:00 AM** - Team notification  
**10:30 AM** - First training session  
**12:00 PM** - Lunch break  
**02:00 PM** - Second training session  
**04:00 PM** - End of day review  
**05:00 PM** - Daily summary report

---

**For detailed information, refer to the complete documentation.**

**Questions? Contact:** support@landondigital.com
