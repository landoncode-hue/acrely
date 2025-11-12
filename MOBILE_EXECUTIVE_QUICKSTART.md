# 📱 Mobile Executive Dashboard - Quick Start Guide

**Version**: 2.2.0  
**Last Updated**: January 11, 2025

---

## 🚀 Quick Setup

### 1. Start Development Server
```bash
cd apps/mobile
pnpm start
```

### 2. Run on Device
- **iOS**: Press `i` or scan QR code with camera
- **Android**: Press `a` or scan QR code with Expo Go app
- **Web**: Press `w` to open in browser

---

## 👥 Test Users

### CEO Access
- **Email**: `ceo@pinnaclegroups.ng`
- **Role**: CEO
- **Dashboard**: Executive Dashboard
- **Access**: Full business metrics, billing, analytics

### MD Access
- **Email**: `md@pinnaclegroups.ng`
- **Role**: MD
- **Dashboard**: Executive Dashboard
- **Access**: Full business metrics, billing, analytics

### Agent Access
- **Email**: `agent@pinnaclegroups.ng`
- **Role**: Agent
- **Dashboard**: Regular Dashboard
- **Access**: Own customers, payments, receipts

---

## 📊 Executive Dashboard Features

### Business Overview
- **Total Customers** - All registered customers
- **Total Plots** - Available plots across estates
- **Total Revenue** - All-time confirmed payments
- **Total Commissions** - Approved & paid commissions

### Today's Summary
- **Today's Revenue** - Payments received today
- **Payment Count** - Number of today's transactions

### Operations
- **Active Allocations** - Currently active plot sales
- **Overdue Payments** - Customers past due date

### System Health
- **Database Status** - Connection health
- **Response Time** - Query performance (ms)
- **Last Backup** - Most recent backup timestamp
- **Error Count** - Last 24h errors

### Live Activity Feed
- Real-time updates for:
  - New payments
  - New customers
  - New allocations

---

## 🎯 Navigation

### Tabs (CEO/MD)
1. **Executive** - Main dashboard
2. **Customers** - Customer management
3. **Receipts** - Receipt viewer

### Tabs (Agent/Frontdesk)
1. **Dashboard** - Agent dashboard
2. **Customers** - Customer management
3. **Receipts** - Receipt viewer

---

## 🔄 Pull to Refresh

On any screen, pull down from the top to refresh data:
- Executive Dashboard → Refreshes all metrics
- Billing Summary → Refreshes billing data
- Activity Feed → Fetches latest activities

---

## 📱 Key Features

### Billing Summary
Access from Quick Actions:
1. Tap "View Billing Summary"
2. Select month and year
3. View revenue, commissions, payments
4. See top performing estates
5. Tap "Export to CSV" (coming soon)

### Realtime Updates
- Activity feed updates automatically
- No manual refresh needed
- Shows activities from last 10 events
- Color-coded by type:
  - 🟢 Green - Payments
  - 🔵 Blue - Customers
  - 🟣 Purple - Allocations

### System Health
- Auto-refreshes every 60 seconds
- Status indicators:
  - ✅ Healthy - All systems operational
  - ⚠️ Degraded - Some issues detected
  - ❌ Unhealthy - Critical issues

---

## 🐛 Troubleshooting

### "No data showing"
- Pull to refresh
- Check internet connection
- Verify Supabase environment variables

### "Access Denied"
- Confirm user role in database
- CEO/MD should have `role = 'CEO'` or `role = 'MD'`
- Logout and login again

### "Cannot connect to server"
- Verify `EXPO_PUBLIC_SUPABASE_URL` in `.env`
- Verify `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`
- Check Supabase project status

---

## 📝 Environment Variables

Create `.env` in `apps/mobile/`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🧪 Testing

### Manual Testing
1. Login as CEO
2. Verify redirect to Executive Dashboard
3. Check all metrics display
4. Pull to refresh
5. View Activity Feed
6. Check System Health
7. Logout

### E2E Tests
```bash
# From project root
pnpm test:e2e tests/e2e/mobile-executive-dashboard.spec.ts
```

---

## 📚 File Locations

### Screens
- `/apps/mobile/screens/executive/ExecutiveDashboard.tsx`
- `/apps/mobile/screens/executive/BillingSummary.tsx`

### Components
- `/apps/mobile/components/cards/ExecutiveSummaryCard.tsx`
- `/apps/mobile/components/feeds/ActivityFeed.tsx`
- `/apps/mobile/components/system/SystemStatusCard.tsx`

### Contexts & Hooks
- `/apps/mobile/contexts/UserRoleContext.tsx`
- `/apps/mobile/hooks/useRoleRedirect.ts`

---

## 🚢 Build for Production

### Android
```bash
cd apps/mobile
pnpm build:android
```

### iOS
```bash
cd apps/mobile
pnpm build:ios
```

### Both Platforms
```bash
cd apps/mobile
pnpm build:all
```

---

## 📈 Metrics Explained

### Collection Rate
Percentage of expected payments received on time
- 🟢 Green: ≥80%
- 🟡 Yellow: 50-79%
- 🔴 Red: <50%

### Revenue Growth
Month-over-month revenue change
- Shows increase/decrease vs previous month

### Active Allocations
Total plots currently being paid for
- Status = 'Active'
- Balance > 0

### Overdue Payments
Allocations past due date
- next_payment_date < today
- balance > 0

---

## ✅ Success Criteria

- [x] CEO/MD auto-redirect to executive dashboard
- [x] All business metrics display correctly
- [x] Realtime activity feed updates
- [x] System health monitoring active
- [x] Pull-to-refresh works
- [x] Billing summary filters by month/year
- [x] Mobile-responsive design
- [x] Role-based access control

---

**Status**: ✅ Production Ready  
**Documentation**: See `MOBILE_EXECUTIVE_DASHBOARD_COMPLETE.md`

