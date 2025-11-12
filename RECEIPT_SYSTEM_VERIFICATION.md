# Receipt System Verification Checklist

**Date:** November 11, 2025  
**Version:** 1.5.0  
**Quest:** acrely-v2-receipt-system

---

## Pre-Deployment Checklist

### Environment Setup
- [ ] `.env` file exists with all required variables
- [ ] `SUPABASE_URL` configured correctly
- [ ] `SUPABASE_SERVICE_KEY` (service role) configured
- [ ] `TERMII_API_KEY` valid and active
- [ ] Company details (`COMPANY_NAME`, `COMPANY_EMAIL`, `COMPANY_PHONE`) set

### Supabase Configuration
- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Logged in to Supabase (`supabase login`)
- [ ] Project linked (`supabase link --project-ref [YOUR_PROJECT_REF]`)

---

## Deployment Verification

### Database Migrations
Run each verification after deployment:

```sql
-- 1. Verify receipts table exists
SELECT COUNT(*) FROM public.receipts;

-- 2. Verify receipt_queue table exists
SELECT COUNT(*) FROM public.receipt_queue;

-- 3. Verify sms_queue has metadata column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sms_queue' AND column_name = 'metadata';

-- 4. Verify receipt_details view exists
SELECT * FROM receipt_details LIMIT 1;

-- 5. Verify queue_status view exists
SELECT * FROM queue_status;

-- 6. Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'receipts';

-- 7. Verify cron jobs are scheduled
SELECT * FROM cron.job WHERE jobname IN (
  'process-receipt-queue', 
  'process-sms-queue', 
  'cleanup-queue-items'
);
```

**Expected Results:**
- [x] receipts table: 0 rows (empty is OK)
- [x] receipt_queue table: exists
- [x] sms_queue.metadata: jsonb type
- [x] receipt_details view: returns columns
- [x] queue_status view: returns 2 rows (receipts, sms)
- [x] receipts bucket: 1 row, public = true
- [x] cron jobs: 3 jobs scheduled

---

### Edge Functions Deployment

```bash
# 1. List deployed functions
supabase functions list

# Expected: 
# - generate-receipt
# - send-sms
# - process-receipt-queue
# - process-sms-queue
```

**Verification:**
- [ ] `generate-receipt` deployed
- [ ] `send-sms` deployed
- [ ] `process-receipt-queue` deployed
- [ ] `process-sms-queue` deployed

---

### Edge Function Secrets

```bash
# Verify secrets are set
supabase secrets list

# Expected secrets:
# - TERMII_API_KEY
# - COMPANY_NAME
# - COMPANY_EMAIL
# - COMPANY_PHONE
# - COMPANY_ADDRESS
# - TERMII_BASE_URL
```

**Verification:**
- [ ] All 6 secrets are set
- [ ] No secret shows as "Not Set"

---

## Functional Testing

### Test 1: Manual Receipt Generation

```bash
# Test generate-receipt function directly
curl -X POST $SUPABASE_URL/functions/v1/generate-receipt \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "VALID_PAYMENT_ID"}'

# Expected response:
# {
#   "success": true,
#   "receipt_id": "...",
#   "receipt_number": "RCP-2025-00001",
#   "receipt_url": "https://...",
#   "payment_id": "..."
# }
```

**Verification:**
- [ ] Function returns success
- [ ] receipt_url is a valid URL
- [ ] Receipt file accessible at receipt_url
- [ ] Receipt displays correctly in browser

---

### Test 2: Payment → Receipt Workflow

**Steps:**
1. Log in to dashboard at `/dashboard`
2. Navigate to `/dashboard/payments`
3. Click "Record Payment"
4. Fill in payment form:
   - Select an allocation
   - Enter amount (e.g., 500000)
   - Select payment method (e.g., Bank Transfer)
   - Enter reference (e.g., TEST-001)
   - **Set status to "confirmed"**
5. Submit payment

**Expected Results:**
- [ ] Payment created successfully
- [ ] Toast notification: "Payment recorded successfully"
- [ ] "View Receipt" button appears in payment row (may take 1-2 seconds)
- [ ] Receipt record exists in database:
  ```sql
  SELECT * FROM receipts WHERE payment_id = 'YOUR_PAYMENT_ID';
  ```
- [ ] Receipt queue item created:
  ```sql
  SELECT * FROM receipt_queue WHERE payment_id = 'YOUR_PAYMENT_ID';
  ```

---

### Test 3: Queue Processing

**Wait 2-3 minutes for cron jobs to run, then check:**

```sql
-- Check receipt was generated
SELECT status, receipt_url, generated_at 
FROM receipt_queue 
WHERE payment_id = 'YOUR_PAYMENT_ID';

-- Expected: status = 'generated', receipt_url is not null
```

**Verification:**
- [ ] Queue status changed from 'pending' to 'generated'
- [ ] `receipt_url` is populated
- [ ] `generated_at` timestamp is set
- [ ] Receipt file exists at URL

**Manual Queue Processing (if needed):**
```bash
# Manually trigger queue processing
curl -X POST $SUPABASE_URL/functions/v1/process-receipt-queue \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"

# Expected response shows successful processing
```

---

### Test 4: SMS with Receipt Link

```sql
-- Check SMS was queued
SELECT * FROM sms_queue 
WHERE reference_id = 'YOUR_PAYMENT_ID' 
AND reference_type = 'payment';

-- Expected: 1 row with receipt URL in metadata
```

**Wait 1-2 minutes for SMS processing:**

```sql
-- Check SMS was sent
SELECT status, sent_at, metadata 
FROM sms_queue 
WHERE reference_id = 'YOUR_PAYMENT_ID';

-- Expected: status = 'sent', sent_at is set
```

**Verification:**
- [ ] SMS queued with receipt metadata
- [ ] SMS status changed to 'sent'
- [ ] `sent_at` timestamp populated
- [ ] Customer received SMS (if phone number is real)

**Manual SMS Processing (if needed):**
```bash
curl -X POST $SUPABASE_URL/functions/v1/process-sms-queue \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
```

---

### Test 5: Receipt Viewer Modal

**Steps:**
1. On `/dashboard/payments` page
2. Find your test payment
3. Click "View Receipt" button

**Expected Results:**
- [ ] Modal opens with receipt preview
- [ ] Receipt details displayed (customer, amount, plot)
- [ ] Receipt iframe loads HTML receipt
- [ ] Download button is enabled
- [ ] Close button works

---

### Test 6: Receipts Dashboard

**Steps:**
1. Navigate to `/dashboard/receipts`
2. Verify page loads

**Expected Results:**
- [ ] Page header: "Receipt Management"
- [ ] Stats cards display:
  - Total Amount
  - This Month count
  - Unique Customers
- [ ] Receipts table shows your test receipt
- [ ] Search functionality works
- [ ] Date filter works
- [ ] "View" button opens modal
- [ ] "Download" button works
- [ ] "Delete" button prompts confirmation (admin only)

---

### Test 7: Search and Filtering

**On `/dashboard/receipts`:**

1. **Search by Receipt Number:**
   - [ ] Enter receipt number (e.g., RCP-2025-00001)
   - [ ] Results filter correctly

2. **Search by Customer Name:**
   - [ ] Enter customer name
   - [ ] Results filter correctly

3. **Date Filter:**
   - [ ] Select today's date
   - [ ] Only today's receipts shown
   - [ ] Clear filters button works

---

## Performance & Monitoring

### Queue Health Check

```sql
-- Run periodically to monitor queue health
SELECT 
  queue_name,
  pending_count,
  completed_count,
  failed_count,
  last_created
FROM queue_status;
```

**Healthy Status:**
- [ ] `pending_count` stays low (< 10)
- [ ] `failed_count` is 0 or minimal
- [ ] `last_created` is recent (if payments are being made)

---

### Edge Function Logs

```bash
# Monitor receipt generation
supabase functions logs generate-receipt --tail

# Monitor queue processors
supabase functions logs process-receipt-queue --tail
supabase functions logs process-sms-queue --tail
```

**Look for:**
- [ ] No error messages
- [ ] Successful processing logs
- [ ] Reasonable response times

---

## Security Verification

### RLS Policies

```sql
-- Test as non-admin user
SET ROLE authenticated;

-- Should succeed: View own receipts
SELECT * FROM receipts LIMIT 1;

-- Should fail: Delete receipts (admin only)
DELETE FROM receipts WHERE id = 'SOME_ID';

-- Reset role
RESET ROLE;
```

**Verification:**
- [ ] Authenticated users can view receipts
- [ ] Only admins can delete receipts
- [ ] Storage bucket is publicly readable (for SMS links)

---

## Production Readiness Checklist

### Critical Items
- [ ] All database migrations applied successfully
- [ ] All Edge Functions deployed and responding
- [ ] Storage bucket created with correct policies
- [ ] Cron jobs scheduled and running
- [ ] Environment secrets set correctly
- [ ] End-to-end workflow tested (payment → receipt → SMS)

### Quality Assurance
- [ ] Receipt design looks professional
- [ ] Receipt contains all required information
- [ ] SMS messages include receipt link
- [ ] Dashboard UI is responsive
- [ ] Error handling works correctly
- [ ] Logs are accessible and informative

### Documentation
- [ ] Implementation summary reviewed
- [ ] Deployment script tested
- [ ] Troubleshooting guide available
- [ ] Monitoring procedures documented

---

## Troubleshooting

### Issue: Receipts not generating

**Diagnostic Steps:**
```sql
-- 1. Check if payment triggered receipt creation
SELECT * FROM receipts WHERE payment_id = 'YOUR_PAYMENT_ID';

-- 2. Check if queued
SELECT * FROM receipt_queue WHERE payment_id = 'YOUR_PAYMENT_ID';

-- 3. Check queue processor
SELECT * FROM cron.job_run_details 
WHERE jobname = 'process-receipt-queue' 
ORDER BY start_time DESC LIMIT 5;
```

**Solutions:**
- Manually trigger: `curl .../process-receipt-queue`
- Check Edge Function logs
- Verify payment status is 'confirmed'

---

### Issue: SMS not sending

**Diagnostic Steps:**
```sql
-- 1. Check if SMS was queued
SELECT * FROM sms_queue 
WHERE reference_id = 'YOUR_PAYMENT_ID' 
ORDER BY created_at DESC;

-- 2. Check attempts and errors
SELECT phone, status, attempts, error_message 
FROM sms_queue 
WHERE status = 'failed';
```

**Solutions:**
- Verify TERMII_API_KEY is correct
- Check Termii account balance
- Manually trigger: `curl .../process-sms-queue`
- Check send-sms function logs

---

### Issue: Storage permission errors

**Diagnostic Steps:**
```sql
-- Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'receipts';

-- Check storage policies
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

**Solutions:**
- Re-run storage migration
- Verify bucket is public
- Check file permissions in Supabase Dashboard

---

## Sign-Off

**Deployment Completed By:** ___________________  
**Date:** ___________________  
**All Tests Passed:** [ ] Yes [ ] No  
**Production Ready:** [ ] Yes [ ] No  

**Notes:**
```
_____________________________________
_____________________________________
_____________________________________
```

---

**Next Steps After Verification:**
1. Monitor system for 24 hours
2. Review Edge Function logs daily
3. Check queue_status weekly
4. Run cleanup jobs monthly
5. Update documentation as needed

---

*Checklist Version 1.5.0 | Acrely Receipt System | Landon Digital*
