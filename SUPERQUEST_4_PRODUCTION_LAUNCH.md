# 🚀 SuperQuest 4: Production Launch & Client Handover

**Author:** Kennedy — Landon Digital  
**Client:** Pinnacle Builders Homes & Properties  
**Date:** November 15, 2025  
**Version:** 2.0.0

---

## 📋 Executive Summary

This document outlines the comprehensive production launch strategy for Acrely v2, covering staging deployment, production cutover, monitoring setup, team training, and client handover procedures.

### Objectives
✅ Launch Acrely web + mobile into full production  
✅ Configure monitoring, logs, alerts, backups, and uptime checks  
✅ Perform full staging → production cutover  
✅ Train the Pinnacle Builders team  
✅ Deliver operational runbook and SLA  

---

## 🎯 Phase 1: Staging Deployment & Testing

### 1.1 Staging Environment Setup

#### Environment Configuration
```bash
# Staging environment variables
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_SITE_URL=https://acrely-staging.vercel.app
NEXT_PUBLIC_ORG_ID=pinnacle-builders
NEXT_PUBLIC_PROJECT_NAME=Acrely
NEXT_PUBLIC_TERMII_API_KEY=<staging-termii-key>
NEXT_PUBLIC_TERMII_SENDER_ID=PINNACLE
```

#### Staging Deployment Command
```bash
# Deploy to Vercel staging
cd /Users/lordkay/Development/Acrely
pnpm install --frozen-lockfile
pnpm build
vercel --env NEXT_PUBLIC_APP_ENV=staging
```

### 1.2 E2E Test Execution

```bash
# Run full E2E test suite against staging
export TEST_URL=https://acrely-staging.vercel.app
pnpm test:e2e:master
pnpm test:e2e:production
pnpm test:e2e:critical
pnpm test:e2e:regression
```

**Expected Results:**
- ✅ All auth flows pass
- ✅ CRUD operations functional
- ✅ Role-based access working
- ✅ No console errors
- ✅ Performance benchmarks met

---

## 🌐 Phase 2: DNS & SSL Configuration

### 2.1 Domain Setup

**Domain:** acrely.pinnaclegroups.ng

#### DNS Records (Configure in Domain Registrar)
```
Type: A
Name: acrely
Value: <Vercel IP Address>
TTL: 3600

Type: CNAME
Name: www.acrely
Value: cname.vercel-dns.com
TTL: 3600
```

#### Vercel Domain Configuration
```bash
# Add custom domain to Vercel project
vercel domains add acrely.pinnaclegroups.ng
vercel domains inspect acrely.pinnaclegroups.ng
```

### 2.2 SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

**Verification:**
```bash
# Check SSL certificate
curl -vI https://acrely.pinnaclegroups.ng 2>&1 | grep -i 'SSL certificate'
openssl s_client -connect acrely.pinnaclegroups.ng:443 -servername acrely.pinnaclegroups.ng
```

**Expected:** Valid SSL certificate with expiry > 60 days

---

## 🚢 Phase 3: Production Deployment

### 3.1 Web Application (Vercel)

#### Production Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://acrely.pinnaclegroups.ng
NEXT_PUBLIC_ORG_ID=pinnacle-builders
NEXT_PUBLIC_PROJECT_NAME=Acrely
NEXT_PUBLIC_TERMII_API_KEY=<production-termii-key>
NEXT_PUBLIC_TERMII_SENDER_ID=PINNACLE
NODE_ENV=production
```

#### Deployment Script
```bash
#!/bin/bash
# scripts/deploy-production-web.sh

echo "🚀 Deploying Acrely Web to Production..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Step 2: Build application
echo "🔨 Building application..."
pnpm --filter=@acrely/web run build

# Step 3: Deploy to Vercel
echo "☁️  Deploying to Vercel..."
vercel --prod --yes

# Step 4: Verify deployment
echo "✅ Verifying deployment..."
curl -I https://acrely.pinnaclegroups.ng

echo "✅ Production deployment complete!"
```

### 3.2 Mobile Application (Google Play)

#### Build Production APK/AAB
```bash
# Navigate to mobile app
cd apps/mobile

# Install dependencies
pnpm install

# Build production app bundle
eas build --platform android --profile production

# Expected output: .aab file ready for Google Play upload
```

#### Google Play Console Setup

1. **Create Internal Testing Track**
   - Go to Google Play Console
   - Select "Acrely - Pinnacle Builders"
   - Navigate to Testing > Internal testing
   - Create new release

2. **Upload App Bundle**
   - Upload the generated .aab file
   - Version: 2.0.0
   - Release notes: "Production release with full feature set"

3. **Add Internal Testers**
   - Add Pinnacle Builders team emails
   - Send invitation link

4. **Testing Checklist**
   - [ ] Login/Signup flows
   - [ ] Customer management
   - [ ] Plot allocation
   - [ ] Payment recording
   - [ ] Sync with web app
   - [ ] Offline functionality
   - [ ] Push notifications

---

## 📊 Phase 4: Monitoring & Observability

### 4.1 Sentry Integration

#### Installation
```bash
# Install Sentry SDK
pnpm add --filter=@acrely/web @sentry/nextjs
pnpm add --filter=@acrely/mobile @sentry/react-native
```

#### Web Configuration (`apps/web/sentry.config.js`)
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

#### Mobile Configuration (`apps/mobile/App.tsx`)
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_APP_ENV,
  tracesSampleRate: 1.0,
});
```

### 4.2 Supabase Logs

**Enable Logging in Supabase Dashboard:**
1. Navigate to Project Settings > Logs
2. Enable:
   - API Logs
   - Database Logs
   - Auth Logs
   - Realtime Logs
3. Set retention: 7 days (free tier) or 30 days (pro tier)

### 4.3 Vercel Logs

**Access Vercel Logs:**
```bash
# View deployment logs
vercel logs acrely-web

# View function logs
vercel logs --follow
```

**Set up Log Drains (Optional):**
- Configure in Vercel Dashboard > Project > Settings > Log Drains
- Supported: Datadog, LogDNA, Logtail

### 4.4 Queue Monitoring

#### SMS Queue Monitoring
```sql
-- Create monitoring view
CREATE OR REPLACE VIEW sms_queue_health AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
  COUNT(*) FILTER (WHERE status = 'sent') AS sent_count,
  AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) AS avg_processing_time,
  MAX(created_at) AS last_queued_at
FROM sms_queue
WHERE created_at > NOW() - INTERVAL '24 hours';
```

#### Receipt Queue Monitoring
```sql
-- Create monitoring view
CREATE OR REPLACE VIEW receipt_queue_health AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) AS avg_processing_time,
  MAX(created_at) AS last_queued_at
FROM receipt_queue
WHERE created_at > NOW() - INTERVAL '24 hours';
```

#### Alert Setup (Supabase Edge Function)
```typescript
// supabase/functions/queue-health-monitor/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Check SMS queue health
  const { data: smsHealth } = await supabase
    .from("sms_queue_health")
    .select("*")
    .single();

  // Check receipt queue health
  const { data: receiptHealth } = await supabase
    .from("receipt_queue_health")
    .select("*")
    .single();

  // Alert if pending > 100 or failed > 10
  if (smsHealth.pending_count > 100 || smsHealth.failed_count > 10) {
    // Send alert (Telegram, Email, SMS)
    console.error("🚨 SMS Queue Alert:", smsHealth);
  }

  if (receiptHealth.pending_count > 50 || receiptHealth.failed_count > 10) {
    console.error("🚨 Receipt Queue Alert:", receiptHealth);
  }

  return new Response(JSON.stringify({ smsHealth, receiptHealth }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

#### Deploy Queue Monitor
```bash
supabase functions deploy queue-health-monitor --no-verify-jwt
```

#### Set Up Cron Job
```sql
-- Run queue health check every 15 minutes
SELECT cron.schedule(
  'queue-health-monitor',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://qenqilourxtfxchkawek.supabase.co/functions/v1/queue-health-monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
  ) as request_id;
  $$
);
```

### 4.5 Uptime Monitoring

**Recommended Tools:**
- **UptimeRobot** (Free tier: 50 monitors, 5-min intervals)
- **Better Uptime** (Free tier: 10 monitors, 3-min intervals)
- **Pingdom** (14-day free trial)

**Monitors to Configure:**
1. Main website: https://acrely.pinnaclegroups.ng
2. API health: https://acrely.pinnaclegroups.ng/api/health
3. Supabase API: https://qenqilourxtfxchkawek.supabase.co/rest/v1/

---

## 📚 Phase 5: Operations Runbook

### 5.1 User Onboarding

#### Step 1: Create User Account
1. Navigate to **Users > Add New User**
2. Enter user details:
   - Full Name
   - Email
   - Phone Number
   - Role (Admin, Manager, Frontdesk, Agent)
3. Click **Create User**
4. User receives welcome email with login credentials

#### Step 2: Assign Permissions
1. Navigate to **Users > [User Name] > Permissions**
2. Select role-based permissions:
   - **Admin:** Full access
   - **Manager:** View all, manage teams
   - **Frontdesk:** Customer management, payments
   - **Agent:** Customer allocation, commissions
3. Click **Save Permissions**

### 5.2 Plot Allocation

#### Step 1: Create Estate (Admin Only)
1. Navigate to **Estates > Add New Estate**
2. Enter estate details:
   - Estate Name
   - Location
   - Total Plots
   - Plot Dimensions
3. Click **Create Estate**

#### Step 2: Add Plots
1. Navigate to **Estates > [Estate Name] > Plots**
2. Click **Bulk Create Plots**
3. Enter:
   - Starting Plot Number
   - Ending Plot Number
   - Price per Plot
4. Click **Generate Plots**

#### Step 3: Allocate Plot to Customer
1. Navigate to **Customers > [Customer Name] > Allocations**
2. Click **Allocate Plot**
3. Select:
   - Estate
   - Plot Number
   - Payment Plan (Outright, Installment)
   - Agent (if applicable)
4. Click **Allocate**

### 5.3 Payment Recording

#### Step 1: Record Payment
1. Navigate to **Payments > Add New Payment**
2. Select:
   - Customer
   - Allocation
   - Payment Amount
   - Payment Method (Cash, Transfer, Card)
   - Payment Date
3. Click **Record Payment**

#### Step 2: Generate Receipt
1. Payment recorded → Receipt auto-generated
2. Navigate to **Payments > [Payment ID] > Receipt**
3. Click **Download PDF** or **Send via SMS**

#### Step 3: Update Balance
- System automatically updates:
  - Customer balance
  - Allocation progress
  - Agent commission (if applicable)

### 5.4 Reporting & Analytics

#### Daily Reports
1. Navigate to **Reports > Daily Summary**
2. View:
   - Total Payments Collected
   - New Customers
   - New Allocations
   - Outstanding Balances

#### Monthly Reports
1. Navigate to **Reports > Monthly Summary**
2. Generate:
   - Billing Summary (PDF)
   - Commission Report (Excel)
   - Overdue Payments (PDF)

#### Custom Reports
1. Navigate to **Reports > Custom Report**
2. Set filters:
   - Date Range
   - Estate
   - Agent
   - Payment Status
3. Click **Generate Report**

---

## 🎓 Phase 6: Team Training

### 6.1 Training Schedule

| Role | Date | Duration | Topics |
|------|------|----------|--------|
| MD & CEO | TBD | 2 hours | Executive dashboard, analytics, strategic reports |
| Frontdesk | TBD | 3 hours | Customer onboarding, payment recording, receipt generation |
| Agents | TBD | 2 hours | Customer allocation, commission tracking, mobile app |
| IT Support | TBD | 4 hours | System administration, troubleshooting, database backup |

### 6.2 Training Modules

#### Module 1: System Overview (30 min)
- Acrely architecture
- Web vs Mobile functionality
- User roles and permissions
- Security best practices

#### Module 2: Customer Management (45 min)
- Creating customer profiles
- Document uploads
- Customer search and filtering
- Bulk import (Excel)

#### Module 3: Plot Allocation (45 min)
- Estate management
- Plot creation and pricing
- Allocation workflow
- Payment plans setup

#### Module 4: Payment Processing (60 min)
- Recording payments
- Receipt generation
- SMS notifications
- Payment reconciliation

#### Module 5: Reporting & Analytics (45 min)
- Dashboard overview
- Standard reports
- Custom report generation
- Data export (Excel, PDF)

#### Module 6: Mobile App (45 min)
- Installation and login
- Offline functionality
- Customer allocation on-the-go
- Payment recording via mobile
- Sync with web app

### 6.3 Training Resources

**Documents:**
- User Manual (PDF)
- Quick Reference Guide (PDF)
- FAQ Document (PDF)
- Troubleshooting Guide (PDF)

**Videos:**
- System Overview (10 min)
- Customer Onboarding (15 min)
- Payment Recording (12 min)
- Mobile App Tutorial (20 min)

---

## 🎥 Phase 7: Training Video Production

### 7.1 Video Structure

#### Video 1: Executive Overview (10 min)
**Target:** MD, CEO  
**Content:**
- Welcome and introduction
- System capabilities
- Dashboard walkthrough
- Key metrics and reports
- Strategic insights

#### Video 2: Frontdesk Operations (25 min)
**Target:** Frontdesk staff  
**Content:**
- Login and navigation
- Creating customer profiles
- Recording payments
- Generating receipts
- Handling common scenarios

#### Video 3: Agent Workflow (20 min)
**Target:** Sales agents  
**Content:**
- Mobile app installation
- Customer allocation process
- Commission tracking
- Mobile payment recording
- Web-mobile sync

#### Video 4: System Administration (30 min)
**Target:** IT support  
**Content:**
- User management
- Estate and plot setup
- Database backup and restore
- Troubleshooting common issues
- Monitoring and alerts

### 7.2 Recording Tools

**Recommended:**
- **Loom** (Screen recording with webcam overlay)
- **OBS Studio** (Professional screen recording)
- **Camtasia** (Advanced editing)

**Hosting:**
- **YouTube** (Unlisted videos)
- **Vimeo** (Password-protected)
- **Google Drive** (Shared folder)

---

## 🗺️ Phase 8: 30-60-90 Day Delivery Roadmap

### Days 1-30: Foundation & Stabilization

**Week 1:**
- ✅ Production deployment complete
- ✅ All team members trained
- ✅ Initial data migration complete
- ✅ Monitoring and alerts active

**Week 2:**
- 📊 Daily usage reports reviewed
- 🐛 Bug fixes and minor improvements
- 📞 Daily check-in calls with client
- 📈 Performance optimization

**Week 3:**
- 📚 User feedback collection
- 🔧 Feature enhancements based on feedback
- 📊 Weekly analytics review
- 🎯 User adoption tracking

**Week 4:**
- ✅ 30-day stability checkpoint
- 📊 Performance report delivered
- 🎓 Refresher training session
- 📝 Runbook updates based on real-world usage

**Deliverables:**
- ✅ Production system live and stable
- ✅ All users onboarded
- ✅ Initial data migrated
- ✅ 30-day performance report

### Days 31-60: Optimization & Scale

**Week 5-6:**
- 🚀 Advanced feature rollout
- 📊 Advanced reporting capabilities
- 🔄 Workflow optimizations
- 📈 Scale testing

**Week 7-8:**
- 🎯 User adoption campaigns
- 📚 Advanced training sessions
- 🔧 Custom feature development (if needed)
- 📊 60-day analytics review

**Deliverables:**
- ✅ Advanced features deployed
- ✅ Optimized workflows
- ✅ 60-day performance report
- ✅ User satisfaction survey

### Days 61-90: Independence & Handover

**Week 9-10:**
- 🎓 Train-the-trainer sessions
- 📚 Complete documentation handover
- 🔧 Final feature enhancements
- 🎯 Knowledge transfer

**Week 11-12:**
- ✅ Final system audit
- 📊 90-day comprehensive report
- 🤝 Official client handover
- 🎉 Support transition to maintenance mode

**Deliverables:**
- ✅ Self-sufficient client team
- ✅ Complete documentation
- ✅ 90-day final report
- ✅ Ongoing support plan

---

## ✅ Client Handover Checklist

### Documentation
- [ ] Operations Runbook (PDF)
- [ ] User Manual (PDF)
- [ ] System Architecture Diagram
- [ ] Database Schema Documentation
- [ ] API Documentation
- [ ] Deployment Guide
- [ ] Troubleshooting Guide
- [ ] FAQ Document

### Training
- [ ] All team members trained
- [ ] Training videos recorded and shared
- [ ] Hands-on practice sessions completed
- [ ] Train-the-trainer session conducted
- [ ] Training materials delivered

### Technical Handover
- [ ] All credentials shared securely
- [ ] Database access credentials
- [ ] Vercel project access
- [ ] Supabase project access
- [ ] Google Play Console access
- [ ] Domain registrar access
- [ ] Termii API credentials

### System Health
- [ ] Production deployment verified
- [ ] Monitoring dashboards active
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] No critical bugs outstanding

### Knowledge Transfer
- [ ] System architecture explained
- [ ] Codebase walkthrough completed
- [ ] Development environment setup guide
- [ ] CI/CD pipeline explained
- [ ] Future enhancement roadmap shared

### Support Plan
- [ ] Support SLA defined
- [ ] Support channels established
- [ ] Response time commitments
- [ ] Escalation procedures documented
- [ ] Maintenance schedule agreed

---

## 📞 Support & Maintenance SLA

### Support Tiers

#### Tier 1: Critical (Response: 1 hour)
- Production system down
- Data loss or corruption
- Security breach
- Payment processing failure

#### Tier 2: High (Response: 4 hours)
- Major feature broken
- Performance degradation
- Authentication issues
- Integration failures

#### Tier 3: Medium (Response: 24 hours)
- Minor bugs
- UI/UX issues
- Non-critical feature requests
- Documentation updates

#### Tier 4: Low (Response: 7 days)
- Feature enhancements
- Cosmetic changes
- Training requests
- General inquiries

### Support Channels
- **Email:** support@landondigital.com
- **Phone:** +234-XXX-XXXX-XXX (Critical only)
- **Telegram:** @acrely-support
- **Ticketing System:** support.acrely.pinnaclegroups.ng

### Maintenance Windows
- **Weekly:** Sunday 2:00 AM - 4:00 AM WAT
- **Monthly:** First Sunday, 12:00 AM - 6:00 AM WAT

---

## 🎯 Success Criteria

### Technical Metrics
- ✅ Uptime: 99.9%+
- ✅ Page load time: < 2 seconds
- ✅ API response time: < 200ms
- ✅ Zero data loss
- ✅ Zero security incidents

### Business Metrics
- ✅ 100% user adoption within 30 days
- ✅ 90%+ user satisfaction
- ✅ 50%+ reduction in manual processes
- ✅ 100% payment tracking accuracy
- ✅ Zero revenue leakage

### Operational Metrics
- ✅ Daily active users: 20+
- ✅ Average session duration: > 10 min
- ✅ Feature utilization: > 80%
- ✅ Support tickets: < 5 per week
- ✅ Bug resolution time: < 48 hours

---

## 🚀 Launch Readiness Sign-Off

**Prepared by:** Kennedy - Landon Digital  
**Date:** _____________________

**Approved by:**
- [ ] Technical Lead: _____________________
- [ ] Project Manager: _____________________
- [ ] Client (Pinnacle Builders): _____________________

**Launch Date:** _____________________

**Go/No-Go Decision:** ☐ GO  ☐ NO-GO

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

**🎉 Welcome to Acrely v2 - Empowering Pinnacle Builders! 🏗️**
