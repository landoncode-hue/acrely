# Analytics Suite - Verification Checklist

## ✅ Pre-Deployment Verification

### Database Components
- [ ] `estate_performance_summary` view exists
- [ ] `agent_performance_summary` view exists
- [ ] `revenue_trends_summary` view exists
- [ ] `customer_engagement_summary` view exists
- [ ] `revenue_predictions` table exists
- [ ] `update_prediction_accuracy()` function exists
- [ ] All indexes created
- [ ] RLS policies applied

### Backend Components
- [ ] `predict-trends` Edge Function deployed
- [ ] `/api/analytics/summary` endpoint functional
- [ ] `/api/analytics/trends` endpoint functional
- [ ] `/api/analytics/estates` endpoint functional
- [ ] `/api/analytics/agents` endpoint functional
- [ ] JWT authentication working
- [ ] Role-based access enforced

### Frontend - Web
- [ ] `/dashboard/analytics` page accessible
- [ ] Overview tab displays KPIs
- [ ] Estates tab shows data
- [ ] Agents tab shows leaderboard
- [ ] Trends tab shows predictions
- [ ] Charts render correctly
- [ ] Export CSV works
- [ ] Export PDF works

### Frontend - Mobile
- [ ] Analytics tab in Executive Dashboard
- [ ] Charts display on mobile
- [ ] KPI cards show data
- [ ] Predictions visible
- [ ] Responsive design works

### Automation
- [ ] `analytics-predict-trends` cron job scheduled
- [ ] `analytics-update-accuracy` cron job scheduled
- [ ] Cron jobs run successfully
- [ ] Alert notifications configured

### Testing
- [ ] E2E tests pass
- [ ] Unit test specs written
- [ ] Performance <5s verified
- [ ] Role restrictions tested

### Documentation
- [ ] `ANALYTICS_SYSTEM_IMPLEMENTATION.md` complete
- [ ] `ANALYTICS_QUICKSTART.md` created
- [ ] `FILES_CREATED_ANALYTICS.md` listed
- [ ] Deployment scripts documented

---

## 🚀 Deployment Verification

### Step 1: Run Verification Script
```bash
./scripts/verify-analytics-suite.sh
```
**Expected**: All checks should pass (0 failures)

### Step 2: Deploy Analytics Suite
```bash
./scripts/deploy-analytics-suite.sh
```
**Expected**: 10 steps complete successfully

### Step 3: Manual Verification

#### Database Check
```sql
-- Should return 4 rows
SELECT COUNT(*) FROM information_schema.views 
WHERE table_name IN ('estate_performance_summary', 'agent_performance_summary', 'revenue_trends_summary', 'customer_engagement_summary');

-- Should return rows
SELECT * FROM estate_performance_summary LIMIT 5;

-- Should return rows (may be empty initially)
SELECT * FROM revenue_predictions LIMIT 5;
```

#### Edge Function Check
```bash
# Should return success: true
supabase functions invoke predict-trends --method POST
```

#### API Endpoints Check
```bash
# Get session token first (login as CEO)
TOKEN="your-jwt-token"

# Test summary endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://acrely.pinnaclegroups.ng/api/analytics/summary

# Should return JSON with total_revenue, etc.
```

#### Web Dashboard Check
1. Navigate to `https://acrely.pinnaclegroups.ng/dashboard/analytics`
2. Verify all tabs load
3. Verify charts render
4. Test CSV export
5. Test PDF export

#### Mobile App Check
1. Open Executive Dashboard
2. Navigate to Analytics tab
3. Verify charts display
4. Verify KPIs show
5. Check predictions visible

---

## 🧪 Post-Deployment Testing

### E2E Tests
```bash
# Should pass all 13 tests
pnpm test:e2e tests/e2e/analytics-dashboard.spec.ts
```

### Performance Test
```bash
# Page should load in <5 seconds
curl -o /dev/null -s -w "Total time: %{time_total}s\n" \
  https://acrely.pinnaclegroups.ng/dashboard/analytics
```

### Security Test
```bash
# Should return 403 Forbidden
# (Login as Agent, try to access analytics)
```

### Cron Job Test
```sql
-- Check job execution history
SELECT * FROM cron.job_run_details 
WHERE jobid IN (
  SELECT jobid FROM cron.job 
  WHERE jobname LIKE 'analytics-%'
)
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 📊 Data Validation

### Verify Data Accuracy
```sql
-- Compare view data with source tables
-- Revenue should match
SELECT SUM(amount) FROM payments;  -- Should match total in estate_performance_summary

-- Customer count should match
SELECT COUNT(DISTINCT customer_id) FROM customers;  -- Should match sum in customer_engagement_summary

-- Agent count should match
SELECT COUNT(*) FROM users WHERE role IN ('Agent', 'Manager');  -- Should match agent_performance_summary
```

### Verify Predictions
```sql
-- Should have 3 future predictions
SELECT COUNT(*) FROM revenue_predictions 
WHERE predicted_month > CURRENT_DATE;

-- Confidence should be 0-100
SELECT * FROM revenue_predictions 
WHERE confidence_level NOT BETWEEN 0 AND 100;  -- Should return 0 rows
```

---

## 🔍 Monitoring Checklist

### First 24 Hours
- [ ] Monitor cron job execution (should run at 00:00 and 01:00 UTC)
- [ ] Check for any error logs
- [ ] Verify predictions generate daily
- [ ] Monitor API response times
- [ ] Check dashboard load times

### First Week
- [ ] Review prediction accuracy
- [ ] Gather user feedback (CEO, MD)
- [ ] Monitor export usage
- [ ] Check for performance issues
- [ ] Verify mobile app stability

---

## 🐛 Common Issues & Solutions

### Issue: Views return no data
**Solution**: 
```sql
-- Check source tables have data
SELECT COUNT(*) FROM payments;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM estates;
```

### Issue: Predictions not generating
**Solution**:
```sql
-- Ensure minimum 3 months of data
SELECT COUNT(*) FROM revenue_trends_summary;
```

### Issue: Charts not rendering
**Solution**:
```bash
# Reinstall dependencies
pnpm add recharts react-native-chart-kit
```

### Issue: Export fails
**Solution**:
```bash
# Install missing libraries
pnpm add jspdf jspdf-autotable json2csv
```

### Issue: 403 Forbidden
**Solution**:
```sql
-- Verify user role
SELECT role FROM profiles WHERE user_id = 'user-id';
-- Should be CEO, MD, or SysAdmin
```

---

## ✅ Sign-Off Checklist

### Technical Lead
- [ ] All code reviewed
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Security verified
- [ ] Performance acceptable

### CEO/MD
- [ ] Dashboard accessible
- [ ] Data accurate
- [ ] Insights valuable
- [ ] Export functions working
- [ ] Mobile app functional

### SysAdmin
- [ ] Deployment successful
- [ ] Monitoring configured
- [ ] Backups verified
- [ ] Cron jobs running
- [ ] Alerts functional

---

## 📝 Final Sign-Off

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Verified By**: _________________  

**Status**: ⬜ Pass  ⬜ Fail  ⬜ Needs Revision

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Quest**: acrely-v2-analytics-suite  
**Version**: 2.4.0  
**Author**: Kennedy — Landon Digital
