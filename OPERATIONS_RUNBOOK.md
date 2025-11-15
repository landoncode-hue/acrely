# 📚 Acrely Operations Runbook

**Version:** 2.0.0  
**Organization:** Pinnacle Builders Homes & Properties  
**Document Owner:** IT Department  
**Last Updated:** November 15, 2025

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [User Management](#2-user-management)
3. [Customer Onboarding](#3-customer-onboarding)
4. [Plot Allocation](#4-plot-allocation)
5. [Payment Processing](#5-payment-processing)
6. [Reporting & Analytics](#6-reporting--analytics)
7. [Troubleshooting](#7-troubleshooting)
8. [Maintenance Procedures](#8-maintenance-procedures)

---

## 1. System Overview

### 1.1 What is Acrely?

Acrely is a comprehensive real estate management platform designed specifically for Pinnacle Builders. It manages:
- Customer profiles and documents
- Estate and plot inventory
- Plot allocations and payment plans
- Payment tracking and receipts
- Agent commissions
- Financial reporting

### 1.2 System Access

**Web Application:** https://acrely.pinnaclegroups.ng  
**Mobile Application:** Acrely - Pinnacle Builders (Google Play Store)

**Login Credentials:**
- Username: Your company email
- Password: Provided by IT Department

**First-Time Login:**
1. Open web browser or mobile app
2. Enter your email and temporary password
3. You'll be prompted to change your password
4. Set a strong password (8+ characters, mix of letters, numbers, symbols)
5. Click "Update Password"

### 1.3 User Roles

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| **Admin** | Full System Access | All functions, user management, system settings |
| **Manager** | Management Access | View all data, generate reports, supervise teams |
| **Frontdesk** | Operational Access | Customer management, payments, allocations |
| **Agent** | Limited Access | Customer allocation, commission tracking |

---

## 2. User Management

### 2.1 Adding a New User

**Who Can Do This:** Admin only

**Steps:**
1. Login to Acrely web app
2. Navigate to **Settings > Users**
3. Click **Add New User** button
4. Fill in the form:
   - **Full Name:** User's complete name
   - **Email:** Company email address
   - **Phone Number:** Mobile number with country code (+234...)
   - **Role:** Select from dropdown (Admin, Manager, Frontdesk, Agent)
5. Click **Create User**
6. System sends welcome email with temporary password
7. Inform user to check email and login

**Important Notes:**
- Email must be unique
- Phone number format: +234XXXXXXXXXX
- User must change password on first login
- Temporary password expires in 24 hours

### 2.2 Modifying User Permissions

**Steps:**
1. Navigate to **Settings > Users**
2. Find user in the list
3. Click **Edit** icon
4. Update role or permissions
5. Click **Save Changes**

### 2.3 Deactivating a User

**Steps:**
1. Navigate to **Settings > Users**
2. Find user in the list
3. Click **Deactivate** button
4. Confirm deactivation
5. User can no longer login

**Note:** Deactivated users can be reactivated later without losing data.

---

## 3. Customer Onboarding

### 3.1 Creating a New Customer Profile

**Who Can Do This:** Frontdesk, Admin

**Steps:**
1. Navigate to **Customers > Add Customer**
2. Fill in **Basic Information**:
   - Full Name (required)
   - Email (optional but recommended)
   - Phone Number (required, format: +234XXXXXXXXXX)
   - ID Type (National ID, Driver's License, Passport, Voter's Card)
   - ID Number (required)
3. Fill in **Contact Information**:
   - Address
   - City
   - State
   - Country
4. Click **Create Customer**

**Tips:**
- Always verify ID number matches physical ID card
- Double-check phone number - used for SMS receipts
- Email is needed for digital communications

### 3.2 Uploading Customer Documents

**Steps:**
1. Navigate to **Customers > [Customer Name] > Documents**
2. Click **Upload Document**
3. Select document type:
   - ID Card
   - Passport Photograph
   - Proof of Address
   - Other
4. Click **Choose File** and select document
5. Click **Upload**

**Accepted Formats:** PDF, JPG, PNG  
**Max File Size:** 5MB per file

### 3.3 Bulk Customer Import (Excel)

**Who Can Do This:** Admin only

**Steps:**
1. Navigate to **Customers > Import**
2. Download **Excel Template**
3. Fill in customer data following template format
4. Upload completed Excel file
5. Review import preview
6. Click **Confirm Import**

**Template Columns:**
- Full Name (required)
- Email
- Phone (required)
- ID Type (required)
- ID Number (required)
- Address
- City
- State

---

## 4. Plot Allocation

### 4.1 Estate & Plot Setup (Admin Only)

**Creating an Estate:**
1. Navigate to **Estates > Add Estate**
2. Fill in estate details:
   - Estate Name
   - Location
   - Description
   - Total Plots
3. Click **Create Estate**

**Adding Plots to Estate:**
1. Navigate to **Estates > [Estate Name] > Plots**
2. Click **Bulk Create Plots**
3. Enter:
   - Plot Number Range (e.g., 1 to 100)
   - Plot Size (e.g., 600 sqm)
   - Price per Plot
   - Plot Type (Residential, Commercial)
4. Click **Generate Plots**

### 4.2 Allocating a Plot to Customer

**Who Can Do This:** Frontdesk, Agent, Admin

**Steps:**
1. Navigate to **Customers > [Customer Name]**
2. Go to **Allocations** tab
3. Click **New Allocation**
4. Select:
   - **Estate:** Choose from dropdown
   - **Plot Number:** Select available plot
   - **Payment Plan:**
     - Outright: Full payment required
     - Installment: Set number of months (e.g., 6, 12, 24)
   - **Agent:** Assign to sales agent (optional)
   - **Allocation Date:** Default is today
5. Review allocation summary
6. Click **Allocate Plot**

**System Actions:**
- Plot status changes to "Allocated"
- Payment schedule created (if installment)
- Customer notified via SMS
- Agent notified (if assigned)

### 4.3 Viewing Allocation Details

**Steps:**
1. Navigate to **Allocations**
2. Use filters:
   - Estate
   - Status (Active, Completed, Defaulted)
   - Date Range
3. Click on allocation to view full details

---

## 5. Payment Processing

### 5.1 Recording a Payment

**Who Can Do This:** Frontdesk, Admin

**Steps:**
1. Navigate to **Payments > Record Payment**
2. Select **Customer** from dropdown
3. Select **Allocation** (auto-fills with customer's allocations)
4. Enter payment details:
   - **Amount:** Payment received
   - **Payment Method:** Cash, Bank Transfer, Card, Cheque
   - **Payment Date:** Default is today
   - **Reference Number:** Bank transaction reference (if applicable)
   - **Notes:** Optional remarks
5. Click **Record Payment**

**System Actions:**
- Payment saved to database
- Receipt automatically generated
- Customer balance updated
- SMS receipt sent to customer
- If allocation fully paid, status changes to "Completed"

### 5.2 Generating and Sending Receipts

**Automatic Receipt Generation:**
- Every payment automatically generates a PDF receipt
- Receipt includes:
  - Payment amount
  - Customer details
  - Plot details
  - Payment breakdown
  - Outstanding balance
  - Company information

**Manual Receipt Retrieval:**
1. Navigate to **Payments > [Payment ID]**
2. Click **View Receipt**
3. Options:
   - **Download PDF:** Save to computer
   - **Send via Email:** Enter email address
   - **Send via SMS:** Sends link to customer's phone

### 5.3 Viewing Payment History

**For a Specific Customer:**
1. Navigate to **Customers > [Customer Name] > Payments**
2. View all payments in chronological order
3. Click on payment to see details

**For All Payments:**
1. Navigate to **Payments**
2. Use filters:
   - Date Range
   - Payment Method
   - Amount Range
   - Estate
3. Export to Excel for analysis

### 5.4 Handling Payment Issues

**Payment Not Showing:**
1. Verify payment was saved (check confirmation message)
2. Refresh browser page
3. Check **Payments** page with date filter
4. Contact IT support if not found

**Wrong Amount Recorded:**
1. Navigate to **Payments > [Payment ID]**
2. Click **Edit Payment** (Admin only)
3. Update amount
4. Add note explaining correction
5. New receipt auto-generated

**Duplicate Payment:**
1. Contact Admin immediately
2. Admin can void duplicate payment
3. Receipt will be marked as "VOID"

---

## 6. Reporting & Analytics

### 6.1 Dashboard Overview

**Accessing Dashboard:**
- Navigate to **Dashboard** (homepage after login)

**Dashboard Widgets:**
- **Total Revenue:** Sum of all payments
- **Outstanding Balance:** Total owed by customers
- **Active Allocations:** Number of plots allocated
- **Recent Payments:** Last 10 payments
- **Top Agents:** By allocation count
- **Estate Performance:** Revenue by estate

### 6.2 Standard Reports

**Daily Payment Summary:**
1. Navigate to **Reports > Daily Summary**
2. Select date
3. Click **Generate Report**
4. View or download PDF

**Monthly Billing Summary:**
1. Navigate to **Reports > Monthly Summary**
2. Select month and year
3. Click **Generate Report**
4. Report includes:
   - Total payments collected
   - New allocations
   - Outstanding balances
   - Agent commissions

**Overdue Payments Report:**
1. Navigate to **Reports > Overdue Payments**
2. System shows all customers behind on installments
3. Export to Excel
4. Use for follow-up calls/SMS

**Commission Report (For Agents):**
1. Navigate to **Reports > Commission Report**
2. Select:
   - Agent (or "All Agents")
   - Date Range
3. Click **Generate**
4. Shows earned, pending, and paid commissions

### 6.3 Custom Reports

**Creating Custom Report:**
1. Navigate to **Reports > Custom Report**
2. Set filters:
   - Date Range
   - Estate(s)
   - Customer(s)
   - Agent(s)
   - Payment Status
   - Allocation Status
3. Select columns to include
4. Click **Generate Report**
5. Options:
   - View on screen
   - Download Excel
   - Download PDF
   - Schedule email delivery

### 6.4 Exporting Data

**Excel Export:**
- Available on most data tables
- Click **Export to Excel** button
- File downloads automatically

**PDF Export:**
- Available on reports and receipts
- Click **Export to PDF**
- Opens in new tab (can save or print)

---

## 7. Troubleshooting

### 7.1 Login Issues

**Problem:** Forgot Password

**Solution:**
1. Click **Forgot Password** on login page
2. Enter your email
3. Check email for reset link
4. Click link and set new password
5. Login with new password

**Problem:** Account Locked

**Solution:**
- Contact Admin or IT support
- Admin can unlock account via **Settings > Users**

### 7.2 Payment Issues

**Problem:** Receipt not generated

**Solution:**
1. Navigate to **Payments > [Payment ID]**
2. Click **Regenerate Receipt**
3. If issue persists, contact IT support

**Problem:** SMS not received

**Solution:**
1. Verify customer phone number is correct
2. Check phone number format (+234XXXXXXXXXX)
3. Navigate to **Payments > [Payment ID] > Resend SMS**
4. If still failing, check SMS credit balance (Admin)

### 7.3 System Performance

**Problem:** Slow page loading

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Close unnecessary browser tabs
3. Check internet connection speed
4. Try different browser (Chrome recommended)

**Problem:** Mobile app not syncing

**Solution:**
1. Check internet connection
2. Logout and login again
3. Force close app and reopen
4. Update app from Play Store if available

### 7.4 Data Issues

**Problem:** Customer/Plot not found

**Solution:**
1. Use search function with different criteria
2. Check filters are not hiding data
3. Verify spelling of name/plot number
4. Contact IT support if data is genuinely missing

**Problem:** Incorrect balance showing

**Solution:**
1. Navigate to **Customers > [Customer Name] > Payments**
2. Review all payment records
3. Click **Recalculate Balance** (Admin only)
4. If issue persists, contact IT support

---

## 8. Maintenance Procedures

### 8.1 Daily Tasks

**Frontdesk:**
- [ ] Record all payments received
- [ ] Generate and send receipts
- [ ] Update customer information as needed
- [ ] Respond to customer inquiries

**Agents:**
- [ ] Follow up on pending allocations
- [ ] Record field payments via mobile app
- [ ] Check commission dashboard
- [ ] Update customer contact information

**Admin:**
- [ ] Review dashboard metrics
- [ ] Check for failed SMS/receipts
- [ ] Monitor system alerts
- [ ] Backup data (automated but verify)

### 8.2 Weekly Tasks

**Manager/Admin:**
- [ ] Generate weekly payment summary
- [ ] Review overdue payments report
- [ ] Plan customer follow-up calls
- [ ] Analyze agent performance
- [ ] Review audit logs for anomalies

### 8.3 Monthly Tasks

**Admin:**
- [ ] Generate monthly billing summary
- [ ] Calculate agent commissions
- [ ] Reconcile bank payments
- [ ] Update plot pricing (if needed)
- [ ] Review user access and permissions
- [ ] Archive old documents
- [ ] Review system storage usage

### 8.4 Database Backup (Admin Only)

**Automated Backups:**
- Run daily at 2:00 AM WAT
- Stored in Supabase backup system
- Retention: 7 days (free tier) or 30 days (pro tier)

**Manual Backup:**
1. Login to Supabase Dashboard
2. Navigate to Database > Backups
3. Click **Create Backup**
4. Wait for confirmation
5. Download backup file (optional)

### 8.5 System Updates

**Web Application:**
- Updates deployed automatically
- No action required from users
- May experience brief downtime (1-2 minutes)
- Scheduled for Sundays 2:00 AM - 4:00 AM WAT

**Mobile Application:**
- Updates available via Google Play Store
- Notification appears when update available
- Recommended to update within 7 days
- Critical updates force update on app launch

---

## 9. Emergency Contacts

### IT Support
**Email:** support@landondigital.com  
**Phone:** +234-XXX-XXXX-XXX  
**Hours:** Monday - Friday, 9:00 AM - 5:00 PM WAT  
**Emergency:** 24/7 for critical system outages

### System Administrator
**Name:** [Admin Name]  
**Email:** admin@pinnaclegroups.ng  
**Phone:** +234-XXX-XXXX-XXX

### Pinnacle Builders Management
**MD/CEO:** info@pinnaclegroups.ng  
**Main Office:** +234-XXX-XXXX-XXX

---

## 10. Appendices

### Appendix A: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + K | Quick search |
| Ctrl + N | New customer (on customers page) |
| Ctrl + P | New payment (on payments page) |
| Ctrl + S | Save form |
| Esc | Close modal |

### Appendix B: Common Error Messages

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Insufficient permissions" | Your role doesn't allow this action | Contact Admin for access |
| "Plot already allocated" | Someone else allocated this plot | Refresh page and choose another plot |
| "Invalid phone number format" | Phone number not in correct format | Use +234XXXXXXXXXX format |
| "Network error" | Internet connection issue | Check connection and retry |

### Appendix C: SMS Template Examples

**Payment Receipt:**
```
Dear [Customer Name], 
Thank you for your payment of ₦[Amount] for Plot [Number], [Estate]. 
Balance: ₦[Balance]. 
Receipt: [Link]
- Pinnacle Builders
```

**Payment Reminder:**
```
Dear [Customer Name],
Your next installment of ₦[Amount] for Plot [Number] is due on [Date].
Contact us for payment.
- Pinnacle Builders
```

---

**Document Version:** 2.0.0  
**Last Updated:** November 15, 2025  
**Next Review:** February 15, 2026

---

**For support or questions about this runbook, contact IT Department.**
