# Monitoring Dashboard Setup Guide

## Overview

This guide covers setting up comprehensive monitoring for Acrely production environment.

## 1. Queue Health Monitoring

### Deploy Queue Health Monitor
```bash
# Deploy the queue health monitor function
pnpm functions:deploy:queue-monitor
```

### Set Up Cron Job
```sql
-- Connect to Supabase SQL Editor
-- Run every 15 minutes
SELECT cron.schedule(
  'queue-health-check',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://qenqilourxtfxchkawek.supabase.co/functions/v1/queue-health-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    )
  ) as request_id;
  $$
);
```

### Verify Cron Job
```sql
SELECT * FROM cron.job WHERE jobname = 'queue-health-check';
```

## 2. Uptime Monitoring (UptimeRobot)

### Sign Up
1. Go to https://uptimerobot.com/
2. Create free account (50 monitors)

### Add Monitors

#### Monitor 1: Main Website
- **URL:** https://acrely.pinnaclegroups.ng
- **Type:** HTTP(s)
- **Interval:** 5 minutes
- **Alert Contacts:** team@pinnaclegroups.ng

#### Monitor 2: API Health
- **URL:** https://acrely.pinnaclegroups.ng/api/health
- **Type:** HTTP(s)
- **Interval:** 5 minutes
- **Expected Status:** 200

#### Monitor 3: Supabase API
- **URL:** https://qenqilourxtfxchkawek.supabase.co/rest/v1/
- **Type:** HTTP(s)
- **Interval:** 5 minutes
- **Expected Status:** 200 or 400

### Alert Configuration
- **Email:** team@pinnaclegroups.ng
- **SMS:** +234-XXX-XXXX-XXX (optional, paid feature)
- **Webhook:** (optional, for Slack/Telegram integration)

## 3. Supabase Logs

### Enable Logs
1. Go to Supabase Dashboard > Logs
2. Enable all log types:
   - ✅ API Logs
   - ✅ Database Logs
   - ✅ Auth Logs
   - ✅ Realtime Logs
   - ✅ Function Logs

### Set Retention
- Free tier: 7 days
- Pro tier: 30 days (recommended for production)

### Query Logs
```sql
-- View recent API errors
SELECT * FROM api_logs 
WHERE status >= 400 
ORDER BY timestamp DESC 
LIMIT 100;

-- View slow queries
SELECT * FROM database_logs 
WHERE duration > 1000 
ORDER BY timestamp DESC 
LIMIT 50;
```

## 4. Vercel Logs

### Access Logs
```bash
# View deployment logs
vercel logs acrely-web

# Follow logs in real-time
vercel logs --follow

# Filter by function
vercel logs --since 1h
```

### Web Dashboard
1. Go to https://vercel.com/dashboard
2. Select "acrely-web" project
3. Navigate to "Logs" tab
4. Filter by:
   - Time range
   - Status code
   - Function name

## 5. Performance Monitoring

### Web Vitals Dashboard
Add to `apps/web/src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Core Web Vitals to Monitor
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 600ms

## 6. Custom Metrics Dashboard

### Create Monitoring View
```sql
-- Create system health view
CREATE OR REPLACE VIEW system_health_metrics AS
SELECT
  'sms_queue' AS metric_name,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  NOW() AS checked_at
FROM sms_queue
WHERE created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT
  'receipt_queue' AS metric_name,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  NOW() AS checked_at
FROM receipt_queue
WHERE created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT
  'active_users' AS metric_name,
  COUNT(DISTINCT user_id) AS pending,
  0 AS failed,
  NOW() AS checked_at
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour';
```

## 7. Alert Thresholds

### Critical Alerts (Immediate Action)
- Website down (uptime < 100%)
- API errors > 10/minute
- Database connection failures
- Queue backlog > 200 items

### Warning Alerts (Review within 1 hour)
- Page load time > 3s
- API response time > 500ms
- Queue backlog > 100 items
- Failed SMS/receipts > 5%

### Info Alerts (Daily review)
- Performance degradation trends
- Unusual traffic patterns
- Storage usage > 80%

## 8. Dashboard URLs

### Production Monitoring
- **Uptime:** https://uptimerobot.com/dashboard
- **Sentry:** https://sentry.io/organizations/[org]/issues/
- **Vercel:** https://vercel.com/[team]/acrely-web
- **Supabase:** https://supabase.com/dashboard/project/qenqilourxtfxchkawek

### Health Check Endpoint
- **URL:** https://acrely.pinnaclegroups.ng/api/health
- **Response:** `{"status": "ok", "timestamp": "2025-11-15T..."}`

## 9. Daily Monitoring Routine

### Morning Check (9:00 AM)
- [ ] Check uptime status (should be 100%)
- [ ] Review overnight errors in Sentry
- [ ] Check queue health metrics
- [ ] Verify backup completion

### Afternoon Check (2:00 PM)
- [ ] Review performance metrics
- [ ] Check API response times
- [ ] Monitor active user count
- [ ] Review support tickets

### Evening Check (6:00 PM)
- [ ] Generate daily summary
- [ ] Check queue backlogs cleared
- [ ] Review failed transactions
- [ ] Plan next day priorities

## 10. Automated Reporting

### Weekly Report Email
Set up automated email with:
- Uptime percentage
- Average response times
- Total errors/warnings
- User activity stats
- Queue processing metrics

### Tools for Automation
- Zapier (connects to UptimeRobot, Sentry)
- Supabase Edge Functions (custom reports)
- Vercel Analytics (built-in)

## Troubleshooting

### High Queue Backlog
1. Check queue health monitor logs
2. Review failed items
3. Manually process if needed
4. Scale processing if persistent

### Performance Degradation
1. Check Vercel logs for errors
2. Review slow database queries
3. Check third-party API status (Termii)
4. Review recent code changes

### Monitoring Not Updating
1. Verify cron jobs running
2. Check function deployment status
3. Review edge function logs
4. Test manually with curl

## Support

For monitoring issues:
- **Email:** support@landondigital.com
- **Urgent:** +234-XXX-XXXX-XXX
