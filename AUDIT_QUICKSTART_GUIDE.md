# Acrely Audit System - Quick Start Guide

**For CEO, MD, and System Administrators**  
**Pinnacle Builders Homes & Properties**

---

## 🎯 What is the Audit System?

The Audit System provides complete visibility into all actions performed in the Acrely platform. Every customer addition, payment record, allocation change, and administrative action is automatically logged and can be reviewed by authorized personnel.

---

## 🔑 Access Requirements

**Who can access:**
- CEO
- Managing Director (MD)
- System Administrator (SysAdmin)

**Access denied for:**
- Agents
- Accountants
- Other staff roles

---

## 📊 Available Dashboards

### 1. Main Audit Logs Dashboard
**URL:** `/dashboard/audit`

**What you can do:**
- View all system activities with full details
- Filter by date range (default: last 30 days)
- Search by user name, email, or description
- Filter by entity type (customers, payments, allocations, etc.)
- Filter by action type (Created, Updated, Deleted)
- Export audit logs to CSV for reporting
- View detailed change history (old value vs. new value)

**When to use:**
- Investigating unauthorized changes
- Compliance reporting
- Performance reviews
- Dispute resolution
- Security audits

---

### 2. Admin Summary Dashboard
**URL:** `/dashboard/admin`

**What you can see:**
- Total system counts (users, customers, allocations, payments)
- Pending payments alert
- Today's activity summary
- Most active entity today
- Number of unique active users
- Quick links to manage customers and view reports

**When to use:**
- Daily system health check
- Quick overview before meetings
- Monitoring system usage

---

### 3. Activity Feed (Main Dashboard)
**URL:** `/dashboard` (bottom right widget)

**What you can see:**
- Last 5 recent system actions
- Live updates (refreshes every 30 seconds)
- User name and time for each action
- Quick link to full audit dashboard

**When to use:**
- Real-time monitoring
- Quick status check
- Staying updated on team activities

---

## 🔍 How to Use the Audit Dashboard

### Basic Navigation

1. **Login** with your admin credentials
2. **Click** "Audit Logs" in the left sidebar
3. **View** the audit table with all recent activities

### Search and Filter

**By Date Range:**
1. Click the calendar inputs at the top right
2. Select start date and end date
3. Click "Refresh" to apply

**By Search Term:**
1. Type in the search box (e.g., user name, customer name)
2. Results filter automatically

**By Entity Type:**
1. Click the "All Entities" dropdown
2. Select: customers, payments, allocations, receipts, etc.
3. View filtered results

**By Action Type:**
1. Click the "All Actions" dropdown
2. Select: INSERT (Created), UPDATE (Updated), DELETE (Deleted)
3. View filtered results

### View Details

1. Find the row you want to inspect
2. Click the "View" button on the right
3. Modal opens showing:
   - Full timestamp
   - User who performed the action
   - User's role at the time
   - Entity type and ID
   - Old value (before change)
   - New value (after change)
   - Additional metadata

### Export to CSV

1. Apply any filters you want (optional)
2. Click "Export CSV" button (top right)
3. File downloads as `audit-logs-YYYY-MM-DD.csv`
4. Open in Excel or Google Sheets for analysis

---

## 🛡️ Admin Quick Actions

### Available Actions

**For User Management:**
- ✅ Reset Password - Send password reset email to user
- ❌ Deactivate User - Disable a user account (soft delete)

**For Payment Issues:**
- 🧾 Regenerate Receipt - Create new receipt PDF for payment
- 📱 Resend SMS - Send payment confirmation SMS again

### How to Use

1. Navigate to relevant section (e.g., payments, users)
2. Look for "Admin Actions" button or panel
3. Select the action you want to perform
4. Confirm in the popup dialog
5. Wait for success notification

**⚠️ Warning:** All admin actions are logged in the audit trail!

---

## 📈 Understanding the Statistics

### Main Dashboard Stats

- **Total Logs** - Total number of audit entries in selected date range
- **Creates** - Number of INSERT actions (new records)
- **Updates** - Number of UPDATE actions (modified records)
- **Deletes** - Number of DELETE actions (removed records)

### Admin Dashboard Stats

- **Total Users** - Active user accounts
- **Total Customers** - Registered customers
- **Total Allocations** - Plot allocations
- **Total Payments** - Payment transactions
- **Pending Payments** - Allocations with overdue payments (⚠️ needs attention)
- **Audit Logs (30d)** - Audit entries in last 30 days

### Activity Stats

- **Total Actions** - Actions performed today
- **Unique Users** - Number of different users active today
- **Most Active Entity** - Entity type with most changes today

---

## 🚨 Common Use Cases

### 1. "Who deleted this customer?"

1. Go to `/dashboard/audit`
2. Select entity filter: "customers"
3. Select action filter: "DELETE"
4. Search for customer name
5. Click "View" to see who performed the deletion and when

### 2. "When was this payment modified?"

1. Go to `/dashboard/audit`
2. Select entity filter: "payments"
3. Select action filter: "UPDATE"
4. Search for payment amount or customer name
5. Click "View" to see old vs. new values

### 3. "Generate monthly activity report"

1. Go to `/dashboard/audit`
2. Set date range to last month (e.g., Oct 1 - Oct 31)
3. Click "Refresh"
4. Review statistics cards
5. Click "Export CSV" for detailed report

### 4. "Monitor agent activity today"

1. Go to `/dashboard/audit`
2. Set date range to today
3. Search for agent's name
4. Review their actions

### 5. "Resend receipt to customer"

1. Go to `/dashboard/payments`
2. Find the payment record
3. Click "Admin Actions"
4. Select "Regenerate Receipt"
5. Confirm action

---

## 🔐 Security & Compliance

### What is Logged?

✅ Customer creation, updates, deletions  
✅ Allocation creation, updates, deletions  
✅ Payment records and modifications  
✅ Receipt generation and regeneration  
✅ User management actions  
✅ Estate configuration changes  
✅ Billing summary operations

### What is NOT Logged?

❌ User login attempts (separate auth logs)  
❌ Read-only actions (viewing pages, downloading reports)  
❌ System-generated automated tasks (unless explicitly logged)

### Data Retention

- Audit logs are stored indefinitely
- Recommended: Export and archive logs older than 1 year
- Logs cannot be modified or deleted (immutable)

---

## 📱 Mobile Access

The audit dashboard is fully responsive and works on:
- ✅ Desktop (recommended)
- ✅ Tablet (good experience)
- ✅ Mobile (limited - use for quick checks only)

**Recommendation:** Use desktop for detailed investigations and reporting.

---

## 🆘 Troubleshooting

### "I can't access the Audit Logs page"

**Cause:** You don't have admin privileges  
**Solution:** Contact the CEO or MD to request access, or verify your role in Settings

### "The activity feed is not updating"

**Cause:** Auto-refresh is polling-based (30s interval)  
**Solution:** Click "View all activity" link or manually refresh the page

### "Export CSV is not downloading"

**Cause:** Browser popup blocker  
**Solution:** Allow downloads from acrely.pinnaclegroups.ng in your browser settings

### "I see 'No audit logs found'"

**Cause:** Filters are too restrictive or no activity in date range  
**Solution:** Click "Clear filters" and expand date range

---

## 📞 Support

**For technical issues:**  
Contact: Kennedy — Landon Digital  
Email: support@landondigital.com

**For business questions:**  
Contact: Pinnacle Builders Management  
Email: info@pinnaclegroups.ng

---

## 🎓 Best Practices

1. **Daily Check:** Review the Activity Feed on your main dashboard every morning
2. **Weekly Review:** Check `/dashboard/admin` for system health every Monday
3. **Monthly Export:** Download audit logs CSV at end of each month for records
4. **Investigate Quickly:** Address any suspicious activity immediately
5. **Document Actions:** When using admin actions, keep notes for your records
6. **Train Staff:** Ensure all users know their actions are being logged

---

## 📚 Related Documentation

- **Full Implementation Guide:** `AUDIT_ADMIN_IMPLEMENTATION_COMPLETE.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **General User Manual:** `README.md`

---

**Last Updated:** November 11, 2025  
**Version:** 1.6.0  
**Quest:** acrely-v2-audit-and-admin-oversight
