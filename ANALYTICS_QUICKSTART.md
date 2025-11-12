# Analytics Suite Quick Start Guide

## 🚀 5-Minute Setup

### 1. Deploy Database & Functions
```bash
# Apply migrations
supabase db push --file supabase/migrations/20250118000000_analytics_views.sql
supabase db push --file supabase/migrations/20250118000001_revenue_predictions.sql

# Deploy Edge Function
supabase functions deploy predict-trends
```

### 2. Install Dependencies
```bash
pnpm add recharts jspdf jspdf-autotable json2csv @types/json2csv
```

### 3. Access Dashboards
- **Web**: `https://acrely.pinnaclegroups.ng/dashboard/analytics`
- **Mobile**: Executive Dashboard > Analytics Tab

---

## 📊 Available Analytics

### Web Dashboard Tabs
1. **Overview** - KPIs, revenue trends, top performers
2. **Estates** - Performance comparison & detailed metrics
3. **Agents** - Leaderboard & performance index
4. **Trends** - Historical data & AI predictions

### Mobile Dashboard
- Revenue trend charts
- KPI summary cards
- Predictive insights
- Confidence levels

---

## 🤖 Predictive Analytics

### Automatic Forecasting
- Runs daily at 00:00 UTC
- Predicts next 3 months revenue
- Uses linear regression model
- Displays confidence levels

### Manual Trigger
```bash
supabase functions invoke predict-trends --method POST
```

---

## 📤 Exporting Reports

### CSV Export
- Click "Export CSV" button
- Downloads comprehensive data
- Excel-compatible format

### PDF Export
- Click "Export PDF" button
- Professional branded report
- Multi-page with tables

---

## 🔐 Access Control

**Who can access?**
- ✅ CEO
- ✅ MD (Managing Director)
- ✅ SysAdmin
- ❌ Agents, Managers (403 Forbidden)

---

## 🧪 Quick Test

### Verify Installation
```bash
# Check views exist
supabase db execute "SELECT COUNT(*) FROM estate_performance_summary;"

# Test predictions
curl -X POST "$SUPABASE_URL/functions/v1/predict-trends" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# Run E2E tests
pnpm test:e2e tests/e2e/analytics-dashboard.spec.ts
```

---

## 📞 Support

**Issues?** Check `ANALYTICS_SYSTEM_IMPLEMENTATION.md` for detailed troubleshooting.

**Questions?** Contact Kennedy — Landon Digital
