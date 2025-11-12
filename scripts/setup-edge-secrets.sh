#!/bin/bash
# ========================================
# Supabase Edge Functions Secrets Setup
# ========================================
# This script configures all required environment variables for Supabase Edge Functions
# Run this after linking your Supabase project

set -e

echo "🔧 Configuring Supabase Edge Functions secrets..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed!"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if project is linked
if [ ! -f "supabase/.temp/project-ref" ] && [ ! -f ".git/config" ]; then
    echo "⚠️  Warning: Project may not be linked to Supabase"
    echo "Run: supabase link --project-ref qenqilourxtfxchkawek"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Setting Supabase credentials..."
supabase secrets set SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss

echo "Setting Termii SMS credentials..."
supabase secrets set TERMII_API_KEY=TLlpIiGIKwzhwErZGPBjxciDtTHuTqSvzSgayCFpCmuJjJOEMLzftmDugTIVBW
supabase secrets set TERMII_SENDER_ID=PBuilders
supabase secrets set TERMII_BASE_URL=https://v3.api.termii.com

echo "Setting company information..."
supabase secrets set COMPANY_NAME="Pinnacle Builders Homes & Properties"
supabase secrets set COMPANY_EMAIL=info@pinnaclegroups.ng
supabase secrets set COMPANY_PHONE=+234XXXXXXXXXX
supabase secrets set COMPANY_ADDRESS="Lagos, Nigeria"

echo "Setting storage configuration..."
supabase secrets set RECEIPT_BUCKET=receipts
supabase secrets set DOCUMENTS_BUCKET=documents

echo ""
echo "✅ All secrets configured successfully!"
echo ""
echo "📋 Listing configured secrets:"
supabase secrets list

echo ""
echo "🚀 Next steps:"
echo "1. Deploy Edge Functions: pnpm run functions:deploy"
echo "2. Test a function: curl -X POST https://qenqilourxtfxchkawek.supabase.co/functions/v1/send-sms"
echo ""
