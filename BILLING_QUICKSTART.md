# 📊 Billing System Quick Start Guide

**Version**: 1.7.0  
**Last Updated**: January 15, 2025

---

## 🚀 Quick Deploy (5 Minutes)

### 1. Apply Database Migrations
```bash
cd /Users/lordkay/Development/Acrely
supabase db push
```

### 2. Deploy Edge Function
```bash
supabase functions deploy generate-billing-summary
```

### 3. Verify Installation
```bash
# Check cron jobs
supabase db execute "SELECT jobname, schedule FROM cron.job WHERE jobname LIKE '%billing%';"

# Check tables
supabase db execute "SELECT COUNT(*) FROM billing_summary;"
```

### 4. Access Dashboard
Navigate to: `https://acrely.pinnaclegroups.ng/dashboard/billing`

---

## 📋 First-Time Setup

### Generate Initial Data
```sql
-- Generate billing summary for current month
SELECT * FROM trigger_billing_summary_generation();

-- Or via API (in browser console or Postman)
fetch('/api/billing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'generate' })
});
```

---

## 🎯 Common Tasks

### View Billing Dashboard
1. Login as CEO, MD, or SysAdmin
2. Navigate to Dashboard → Billing
3. Select month and year
4. View charts and metrics

### Export Reports
1. Open billing dashboard
2. Scroll to "Estate Performance Details" table
3. Click "CSV" or "PDF" button
4. File downloads automatically

### Manually Generate Summary
**Via Dashboard**:
- Click "Generate Summary" button

**Via SQL**:
```sql
-- Current month
SELECT * FROM trigger_billing_summary_generation();

-- Specific month
SELECT * FROM trigger_billing_summary_generation(3, 2025);

-- Specific estate
SELECT * FROM trigger_billing_summary_generation(3, 2025, 'EST001');
```

### Check System Health
```sql
SELECT * FROM check_billing_summary_health();
```

---

## 📊 Understanding the Dashboard

### Summary Cards (Top)
- **Total Revenue**: Sum of all confirmed payments
- **Total Commissions**: Agent commissions earned
- **Total Payments**: Number of payment transactions
- **Total Customers**: Unique customers with allocations

### Charts
1. **Monthly Revenue Trend**: 12-month line chart
2. **Estate Revenue Distribution**: Bar chart by estate
3. **Revenue by Estate**: Pie chart showing distribution
4. **Collection Rate**: Efficiency by estate (%)

### Performance Table
- Detailed metrics per estate
- Revenue, commissions, payments
- Outstanding balance
- Collection rate with progress bar

---

## 🔧 Troubleshooting

### No Data Showing
```sql
-- Check if billing_summary has data
SELECT * FROM billing_summary ORDER BY created_at DESC LIMIT 5;

-- If empty, generate data
SELECT * FROM trigger_billing_summary_generation();
```

### Dashboard Not Accessible
- Verify you're logged in as CEO, MD, or SysAdmin
- Check URL: `/dashboard/billing`
- Clear browser cache and retry

### Cron Job Not Running
```sql
-- Check cron job status
SELECT * FROM cron.job WHERE jobname LIKE '%billing%';

-- Check recent runs
SELECT * FROM cron.job_run_details 
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE '%billing%')
ORDER BY start_time DESC LIMIT 10;
```

---

## 📅 Automation Schedule

| Job | Schedule | Purpose |
|-----|----------|---------|
| `generate-billing-summary-daily` | 23:59 UTC daily | Update current month data |
| `generate-billing-summary-monthly` | 1st of month, 00:00 UTC | Final monthly report |
| `cleanup-billing-summaries` | Jan 1st, 3:00 AM | Archive old data |

---

## 🔑 Key SQL Queries

### Get Current Month Summary
```sql
SELECT * FROM billing_summary
WHERE month = EXTRACT(MONTH FROM CURRENT_DATE)
  AND year = EXTRACT(YEAR FROM CURRENT_DATE);
```

### Top 5 Estates by Revenue
```sql
SELECT * FROM get_top_estates(5);
```

### Agent Commission Summary
```sql
SELECT * FROM agent_commission_summary
ORDER BY total_commission_amount DESC
LIMIT 10;
```

### Yearly Revenue Trend
```sql
SELECT * FROM yearly_revenue_trend
WHERE year = 2025;
```

---

## 📱 API Endpoints

### GET Billing Summary
```bash
GET /api/billing?month=3&year=2025&estate_code=EST001
```

### GET Estate Performance
```bash
GET /api/billing?view=estate_performance&month=3&year=2025
```

### GET Agent Commissions
```bash
GET /api/billing?view=agent_commissions
```

### POST Generate Summary
```bash
POST /api/billing
Content-Type: application/json

{
  "action": "generate",
  "month": 3,
  "year": 2025
}
```

---

## 🎓 User Roles & Permissions

| Role | View Dashboard | Generate Summary | Export Data |
|------|---------------|------------------|-------------|
| CEO | ✅ | ❌ | ✅ |
| MD | ✅ | ❌ | ✅ |
| SysAdmin | ✅ | ✅ | ✅ |
| Agent | ❌ | ❌ | ❌ |
| Frontdesk | ❌ | ❌ | ❌ |

---

## 📞 Support

**Issues?** Check the full implementation guide:  
📄 [BILLING_SYSTEM_IMPLEMENTATION.md](./BILLING_SYSTEM_IMPLEMENTATION.md)

**Need Help?**  
Contact: Kennedy — Landon Digital

---

*Quick reference for Acrely Billing System v1.7.0*
