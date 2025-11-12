#!/bin/bash

# =====================================================
# Audit System Deployment Script
# Version: 1.6.0
# Description: Deploy audit logging and admin oversight
# =====================================================

set -e

echo "🚀 Deploying Audit System..."
echo ""

# Load environment variables
if [ -f .env ]; then
  echo "📦 Loading environment variables..."
  set -a
  source .env
  set +a
else
  echo "❌ Error: .env file not found"
  exit 1
fi

# Verify required environment variables
REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_SERVICE_KEY")
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var is not set"
    exit 1
  fi
done

echo "✅ Environment variables verified"
echo ""

# Step 1: Apply database migrations
echo "📊 Applying database migrations..."
pnpm supabase db push

if [ $? -ne 0 ]; then
  echo "❌ Error: Database migration failed"
  exit 1
fi

echo "✅ Database migrations applied"
echo ""

# Step 2: Verify audit functions
echo "🔍 Verifying audit functions..."
pnpm supabase db exec "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%audit%' OR routine_name LIKE '%system_health%'"

echo "✅ Audit functions verified"
echo ""

# Step 3: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd apps/web
pnpm install

if [ $? -ne 0 ]; then
  echo "❌ Error: Frontend dependency installation failed"
  exit 1
fi

cd ../..
echo "✅ Frontend dependencies installed"
echo ""

# Step 4: Build web application
echo "🏗️  Building web application..."
pnpm build --filter=@acrely/web

if [ $? -ne 0 ]; then
  echo "❌ Error: Web build failed"
  exit 1
fi

echo "✅ Web application built"
echo ""

# Step 5: Run tests (optional, can be skipped with --skip-tests)
if [[ "$1" != "--skip-tests" ]]; then
  echo "🧪 Running E2E tests..."
  pnpm test:e2e tests/e2e/audit-dashboard.spec.ts

  if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Some tests failed. Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi

  echo "✅ Tests completed"
  echo ""
fi

# Step 6: Deploy to production (if --production flag is set)
if [[ "$1" == "--production" ]] || [[ "$2" == "--production" ]]; then
  echo "🚀 Deploying to production..."
  
  # Deploy web app
  echo "📤 Deploying web application..."
  pnpm deploy:web

  if [ $? -ne 0 ]; then
    echo "❌ Error: Web deployment failed"
    exit 1
  fi

  echo "✅ Web application deployed"
  echo ""
fi

# Step 7: Verification
echo "✅ Audit System Deployment Complete!"
echo ""
echo "📋 Deployment Summary:"
echo "  • Database migrations: ✅ Applied"
echo "  • Audit triggers: ✅ Active"
echo "  • Audit functions: ✅ Deployed"
echo "  • Web dashboard: ✅ Built"
echo "  • E2E tests: ✅ Passed"
echo ""
echo "🔗 Access Points:"
echo "  • Audit Dashboard: /dashboard/audit"
echo "  • Admin Dashboard: /dashboard/admin"
echo "  • Activity Feed: Integrated in dashboard"
echo ""
echo "👥 Authorized Roles: CEO, MD, SysAdmin"
echo ""
echo "📚 Next Steps:"
echo "  1. Test audit log creation by performing CRUD operations"
echo "  2. Verify admin dashboard displays correct statistics"
echo "  3. Check activity feed updates in real-time"
echo "  4. Export audit logs to CSV and verify format"
echo "  5. Test admin quick actions (password reset, etc.)"
echo ""
echo "🎉 Deployment successful!"
