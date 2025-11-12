# Receipt System - Quick Start Guide

**Version:** 1.5.0  
**For:** Acrely v2 - Pinnacle Builders  
**Author:** Kennedy — Landon Digital

---

## 🚀 Quick Deployment (5 Minutes)

### Prerequisites
- Supabase CLI installed
- Node.js and pnpm installed
- `.env` file configured

### One-Command Deployment

```bash
# Navigate to project root
cd /Users/lordkay/Development/Acrely

# Run deployment script
./scripts/deploy-receipt-system-v2.sh
```

**That's it!** The script will:
1. ✅ Apply all database migrations
2. ✅ Deploy Edge Functions
3. ✅ Set environment secrets
4. ✅ Configure storage bucket
5. ✅ Set up cron jobs

---

## 📋 What Gets Deployed

### Database (4 migrations)
- **Receipts table** with auto-numbering
- **Payment-SMS integration** with receipt links
- **Storage bucket** for receipt files
- **Cron jobs** for queue processing

### Edge Functions (4 functions)
- **generate-receipt** - Creates HTML receipts
- **send-sms** - Sends SMS via Termii
- **process-receipt-queue** - Automated receipt generation
- **process-sms-queue** - Automated SMS sending

### Frontend (Already built)
- **Receipt viewer modal** in payments page
- **Receipts management dashboard**
- **Search and filtering** capabilities

---

## ✅ Verify Deployment

### 1. Check Database

```sql
-- Run in Supabase SQL Editor
SELECT * FROM queue_status;
```

**Expected:** 2 rows (receipts, sms queues)

### 2. Check Edge Functions

```bash
supabase functions list
```

**Expected:** 4 functions listed

### 3. Test Receipt Generation

1. Go to `https://acrely.pinnaclegroups.ng/dashboard/payments`
2. Click "Record Payment"
3. Fill form and set status to **"confirmed"**
4. Submit
5. Wait 2 minutes
6. Click "View Receipt" button
7. Receipt should display in modal

---

## 🔄 How It Works

### Automatic Flow

```
Payment Confirmed
    ↓
Receipt Created
    ↓
Added to Queue
    ↓
Cron Job (every 2 min)
    ↓
HTML Receipt Generated
    ↓
Uploaded to Storage
    ↓
SMS with Link Queued
    ↓
Cron Job (every 1 min)
    ↓
SMS Sent to Customer
```

### Manual Trigger (if needed)

```bash
# Trigger receipt generation
curl -X POST $SUPABASE_URL/functions/v1/process-receipt-queue \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"

# Trigger SMS sending
curl -X POST $SUPABASE_URL/functions/v1/process-sms-queue \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
```

---

## 🎯 Key Features

### For Admin/Staff
- ✅ Auto-generate receipts on payment confirmation
- ✅ View all receipts in dashboard (`/dashboard/receipts`)
- ✅ Search by customer, receipt #, plot, estate
- ✅ Filter by date range
- ✅ Download receipts as HTML
- ✅ Delete receipts (admin only)

### For Customers
- ✅ Automatic SMS notification with receipt link
- ✅ Professional branded receipt
- ✅ Shows payment details and balance
- ✅ Accessible via public link (no login required)

---

## 📱 SMS Format

Customers receive:

```
Dear [Customer Name], your payment of ₦[Amount] 
was received. Receipt #RCP-2025-00001.

Download receipt: https://[supabase-url]/storage/v1/object/public/receipts/...

-- Pinnacle Builders Homes & Properties
```

---

## 🔍 Monitoring

### Queue Health

```sql
-- Check queue status
SELECT * FROM queue_status;

-- View pending items
SELECT * FROM receipt_queue WHERE status = 'pending';
SELECT * FROM sms_queue WHERE status = 'pending';

-- Check failed items
SELECT * FROM receipt_queue WHERE status = 'failed';
SELECT * FROM sms_queue WHERE status = 'failed';
```

### Edge Function Logs

```bash
# Real-time logs
supabase functions logs generate-receipt --tail
supabase functions logs process-receipt-queue --tail
supabase functions logs process-sms-queue --tail
```

---

## 🛠️ Troubleshooting

### Receipts Not Generating?

**Check:**
```sql
SELECT * FROM receipt_queue WHERE payment_id = 'YOUR_PAYMENT_ID';
```

**Fix:**
```bash
# Manually trigger
curl -X POST $SUPABASE_URL/functions/v1/process-receipt-queue \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
```

### SMS Not Sending?

**Check:**
```sql
SELECT * FROM sms_queue WHERE reference_id = 'YOUR_PAYMENT_ID';
```

**Fix:**
- Verify `TERMII_API_KEY` is set
- Check Termii account balance
- Manually trigger SMS processor

### Can't Access Receipts?

**Check:**
```sql
SELECT * FROM storage.buckets WHERE id = 'receipts';
-- Should show: public = true
```

**Fix:**
Re-run storage migration:
```bash
supabase db push --file supabase/migrations/20250114000000_storage_receipts_bucket.sql
```

---

## 📞 Support

### Documentation
- **Full Implementation:** `RECEIPT_SYSTEM_IMPLEMENTATION_V2.md`
- **Verification Checklist:** `RECEIPT_SYSTEM_VERIFICATION.md`

### Common Commands

```bash
# View all Edge Functions
supabase functions list

# View function logs
supabase functions logs [function-name]

# List secrets
supabase secrets list

# Re-deploy function
supabase functions deploy [function-name]

# Push migrations
supabase db push
```

---

## 🎉 Success Indicators

Your system is working correctly if:

- ✅ Every confirmed payment creates a receipt
- ✅ Receipts appear in dashboard within 2 minutes
- ✅ SMS is sent to customers within 3 minutes
- ✅ Receipt URLs are publicly accessible
- ✅ Queue status shows low pending counts
- ✅ No failed items in queues

---

## 🔐 Security Notes

- **Storage:** Public bucket (for SMS links to work)
- **RLS:** Authenticated users can view, admins can delete
- **Edge Functions:** Protected by service role key
- **SMS:** Only queued for confirmed payments
- **Receipts:** Unique receipt numbers, immutable once generated

---

## 📊 Performance

- **Receipt Generation:** < 2 seconds per receipt
- **Queue Processing:** Every 2 minutes (receipts), 1 minute (SMS)
- **Storage:** 50MB limit per file
- **Retention:** 90 days for receipts, 30 days for SMS

---

## 🚨 Important Notes

1. **Payment Status Must Be "Confirmed"**  
   Receipts only generate for confirmed payments

2. **Customer Phone Number Required**  
   SMS won't send if customer.phone is null

3. **Termii Credits**  
   Monitor Termii account balance for SMS

4. **Storage Costs**  
   Monitor Supabase storage usage

5. **Cron Jobs**  
   Verify cron jobs are running in Supabase Dashboard

---

## 📈 Next Steps

After deployment:

1. **Test with Real Payment**
   - Record actual payment
   - Verify receipt generation
   - Check SMS delivery

2. **Monitor for 24 Hours**
   - Check queue_status regularly
   - Review Edge Function logs
   - Verify no failed items

3. **Train Staff**
   - Show receipts dashboard
   - Explain search/filter features
   - Demonstrate receipt viewer

4. **Customer Communication**
   - Inform customers about SMS receipts
   - Share sample receipt for reference

---

**Deployment Checklist:**

- [ ] Script executed successfully
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Secrets configured
- [ ] Test payment created
- [ ] Receipt generated automatically
- [ ] SMS sent to customer
- [ ] Dashboard accessible
- [ ] Monitoring configured

---

**System Status:** 🟢 **PRODUCTION READY**

**Last Updated:** November 11, 2025  
**Maintained By:** Landon Digital

---

*For detailed technical documentation, see RECEIPT_SYSTEM_IMPLEMENTATION_V2.md*
