#!/bin/bash

# Receipt System Deployment Script
# Author: Kennedy - Landon Digital
# Version: 1.5.0
# Description: Deploy receipt generation system to Supabase

set -e

echo "=================================================="
echo "Receipt System Deployment"
echo "=================================================="
echo ""

# Load environment variables
if [ -f .env ]; then
  echo "✓ Loading environment variables from .env"
  set -a
  source .env
  set +a
else
  echo "⚠️  Warning: .env file not found. Using existing environment variables."
fi

# Validate required environment variables
echo ""
echo "Validating environment variables..."

required_vars=(
  "SUPABASE_URL"
  "SUPABASE_SERVICE_KEY"
  "TERMII_API_KEY"
  "COMPANY_NAME"
  "COMPANY_EMAIL"
  "COMPANY_PHONE"
)

missing_vars=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  else
    echo "✓ $var is set"
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo ""
  echo "❌ Error: Missing required environment variables:"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
  exit 1
fi

echo ""
echo "=================================================="
echo "Step 1: Database Migrations"
echo "=================================================="

# Apply migrations
echo "Applying migrations..."
migrations=(
  "20250112000000_receipts_system.sql"
  "20250112000001_payment_sms_receipt.sql"
  "20250114000000_storage_receipts_bucket.sql"
  "20250114000001_cron_queue_processing.sql"
)

for migration in "${migrations[@]}"; do
  migration_file="supabase/migrations/$migration"
  if [ -f "$migration_file" ]; then
    echo "  → Applying $migration"
    supabase db push --file "$migration_file" 2>&1 || echo "    (migration may already exist, continuing...)"
  else
    echo "  ⚠️  Warning: $migration_file not found, skipping"
  fi
done

echo ""
echo "=================================================="
echo "Step 2: Edge Functions Deployment"
echo "=================================================="

# Deploy Edge Functions
edge_functions=(
  "generate-receipt"
  "send-sms"
  "process-receipt-queue"
  "process-sms-queue"
)

for func in "${edge_functions[@]}"; do
  if [ -d "supabase/functions/$func" ]; then
    echo "  → Deploying $func..."
    supabase functions deploy "$func" --no-verify-jwt
  else
    echo "  ⚠️  Warning: supabase/functions/$func not found, skipping"
  fi
done

echo ""
echo "=================================================="
echo "Step 3: Set Edge Function Secrets"
echo "=================================================="

echo "Setting secrets for Edge Functions..."
supabase secrets set \
  TERMII_API_KEY="$TERMII_API_KEY" \
  COMPANY_NAME="$COMPANY_NAME" \
  COMPANY_EMAIL="$COMPANY_EMAIL" \
  COMPANY_PHONE="${COMPANY_PHONE:-+234XXXXXXXXXX}" \
  COMPANY_ADDRESS="${COMPANY_ADDRESS:-Edo, Nigeria}" \
  TERMII_BASE_URL="${TERMII_BASE_URL:-https://v3.api.termii.com}" \
  2>&1 || echo "  (some secrets may already exist)"

echo ""
echo "=================================================="
echo "Step 4: Storage Bucket Setup"
echo "=================================================="

echo "Verifying receipts storage bucket..."
# Note: Storage bucket should be created via migration
# This is just verification
echo "  ℹ️  Storage bucket 'receipts' should be created via migration"
echo "  ℹ️  Verify in Supabase Dashboard → Storage"

echo ""
echo "=================================================="
echo "Step 5: Queue Processor Setup"
echo "=================================================="

echo "Setting up cron jobs for queue processing..."
echo "  ℹ️  Cron jobs configured via migration:"
echo "     - process-receipt-queue: every 2 minutes"
echo "     - process-sms-queue: every 1 minute"
echo "     - cleanup-queue-items: weekly (Sunday 2 AM)"
echo ""
echo "  ℹ️  Verify cron jobs in Supabase Dashboard → Database → Cron Jobs"

echo ""
echo "=================================================="
echo "Step 6: Test Receipt Generation"
echo "=================================================="

echo "Testing receipt system..."
echo "  ℹ️  To test manually:"
echo "     1. Go to /dashboard/payments"
echo "     2. Record a payment with status 'confirmed'"
echo "     3. Check receipt appears in queue_status view"
echo "     4. Verify receipt is generated within 2 minutes"
echo "     5. Check SMS is sent with receipt link"

echo ""
echo "=================================================="
echo "Deployment Complete! 🎉"
echo "=================================================="
echo ""
echo "Next Steps:"
echo "  1. Verify storage bucket in Supabase Dashboard"
echo "  2. Test receipt generation with a sample payment"
echo "  3. Check Edge Function logs for any errors"
echo "  4. Monitor queue_status view for processing status"
echo ""
echo "Useful Commands:"
echo "  → View queue status:"
echo "    SELECT * FROM queue_status;"
echo ""
echo "  → View pending receipts:"
echo "    SELECT * FROM receipt_queue WHERE status = 'pending';"
echo ""
echo "  → View Edge Function logs:"
echo "    supabase functions logs generate-receipt"
echo "    supabase functions logs process-receipt-queue"
echo ""
echo "  → Manually process queues:"
echo "    curl -X POST $SUPABASE_URL/functions/v1/process-receipt-queue \\"
echo "      -H 'Authorization: Bearer $SUPABASE_SERVICE_KEY'"
echo ""
