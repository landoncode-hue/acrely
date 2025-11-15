#!/bin/bash

# =====================================================
# Deploy RLS Fix Migration
# Executes the comprehensive RLS policy reset
# =====================================================

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       ACRELY RLS FIX DEPLOYMENT - AUTOMATED EXECUTION        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/migrations/20250122000000_rls_fix_complete.sql" ]; then
  echo "❌ Migration file not found!"
  echo "   Please run this script from the project root directory"
  exit 1
fi

echo "📋 Step 1: Verifying Supabase connection..."
echo ""

# Test Supabase connection
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found!"
  echo "   Install with: brew install supabase/tap/supabase"
  exit 1
fi

echo "   ✅ Supabase CLI found"
echo ""

echo "📋 Step 2: Executing RLS fix migration..."
echo ""
echo "⚠️  This migration will:"
echo "   - Disable RLS on all tables temporarily"
echo "   - Drop all existing RLS policies"
echo "   - Create new non-recursive policies"
echo "   - Re-enable RLS with proper access"
echo "   - Sync users from auth.users to public.users"
echo ""

# Execute the specific migration via Supabase CLI
echo "🚀 Applying migration..."
echo ""

# Use supabase db execute to run the SQL file
supabase db execute --file supabase/migrations/20250122000000_rls_fix_complete.sql --remote

if [ $? -eq 0 ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                   MIGRATION SUCCESSFUL                       ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "✅ RLS Fix has been deployed!"
  echo ""
  echo "🚀 Next Steps:"
  echo "   1. Run verification: npx tsx scripts/test-rls-policies.ts"
  echo "   2. Test web dashboard login and functionality"
  echo "   3. Test mobile app sync and operations"
  echo "   4. Monitor for any 42501 or 42P17 errors"
  echo ""
else
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                   MIGRATION FAILED                           ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "❌ RLS Fix deployment failed!"
  echo ""
  echo "📝 Manual action required:"
  echo "   1. Open Supabase Dashboard: https://supabase.com/dashboard"
  echo "   2. Navigate to: SQL Editor"
  echo "   3. Copy content from: supabase/migrations/20250122000000_rls_fix_complete.sql"
  echo "   4. Paste and execute in SQL Editor"
  echo "   5. Run verification: npx tsx scripts/test-rls-policies.ts"
  echo ""
  exit 1
fi
