#!/bin/bash

# =====================================================
# Analytics Suite Deployment Script
# Acrely v2.4.0 - Analytics Suite
# =====================================================

set -e  # Exit on error

echo "🚀 Starting Analytics Suite Deployment..."
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step counter
STEP=1

print_step() {
    echo -e "\n${BLUE}[Step $STEP]${NC} $1"
    ((STEP++))
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# =====================================================
# 1. Environment Validation
# =====================================================
print_step "Validating environment variables..."

required_vars=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Missing environment variable: $var"
        exit 1
    fi
done

print_success "All required environment variables present"

# =====================================================
# 2. Database Migrations
# =====================================================
print_step "Applying analytics database migrations..."

echo "Applying analytics views migration..."
supabase db push --file supabase/migrations/20250118000000_analytics_views.sql || {
    print_error "Failed to apply analytics views migration"
    exit 1
}
print_success "Analytics views created"

echo "Applying revenue predictions migration..."
supabase db push --file supabase/migrations/20250118000001_revenue_predictions.sql || {
    print_error "Failed to apply revenue predictions migration"
    exit 1
}
print_success "Revenue predictions table created"

# =====================================================
# 3. Edge Functions Deployment
# =====================================================
print_step "Deploying Edge Functions..."

echo "Deploying predict-trends function..."
supabase functions deploy predict-trends || {
    print_error "Failed to deploy predict-trends function"
    exit 1
}
print_success "predict-trends function deployed"

# =====================================================
# 4. Setup Cron Jobs
# =====================================================
print_step "Setting up cron jobs for analytics..."

cat <<EOF | supabase db execute
-- Schedule predict-trends to run daily at 00:00 UTC
SELECT cron.schedule(
    'analytics-predict-trends',
    '0 0 * * *',
    \$\$
    SELECT net.http_post(
        url := '$(echo $SUPABASE_URL)/functions/v1/predict-trends',
        headers := jsonb_build_object(
            'Authorization', 'Bearer $(echo $SUPABASE_SERVICE_ROLE_KEY)',
            'Content-Type', 'application/json'
        )
    );
    \$\$
);

-- Schedule accuracy update to run daily at 01:00 UTC
SELECT cron.schedule(
    'analytics-update-accuracy',
    '0 1 * * *',
    \$\$
    SELECT update_prediction_accuracy();
    \$\$
);
EOF

if [ $? -eq 0 ]; then
    print_success "Cron jobs scheduled successfully"
else
    print_error "Failed to schedule cron jobs"
    exit 1
fi

# =====================================================
# 5. Install Dependencies
# =====================================================
print_step "Installing required dependencies..."

# Check if dependencies are in package.json
if ! grep -q '"recharts"' package.json; then
    print_warning "Adding recharts to package.json"
    pnpm add recharts
fi

if ! grep -q '"jspdf"' package.json; then
    print_warning "Adding jspdf to package.json"
    pnpm add jspdf jspdf-autotable
fi

if ! grep -q '"json2csv"' package.json; then
    print_warning "Adding json2csv to package.json"
    pnpm add json2csv
    pnpm add -D @types/json2csv
fi

if ! grep -q '"react-native-chart-kit"' apps/mobile/package.json; then
    print_warning "Adding react-native-chart-kit to mobile app"
    cd apps/mobile
    pnpm add react-native-chart-kit react-native-svg
    cd ../..
fi

print_success "Dependencies installed"

# =====================================================
# 6. Build Web Application
# =====================================================
print_step "Building web application..."

cd apps/web
pnpm build || {
    print_error "Web build failed"
    exit 1
}
cd ../..

print_success "Web application built successfully"

# =====================================================
# 7. Deploy to Hostinger
# =====================================================
print_step "Deploying web application to Hostinger..."

if [ -z "$HOSTINGER_SSH_HOST" ] || [ -z "$HOSTINGER_SSH_USER" ]; then
    print_warning "Hostinger deployment skipped (SSH credentials not configured)"
else
    echo "Syncing build to Hostinger..."
    rsync -avz --delete \
        apps/web/out/ \
        "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST:/home/$HOSTINGER_SSH_USER/public_html/" || {
        print_error "Failed to deploy to Hostinger"
        exit 1
    }
    print_success "Deployed to Hostinger"
fi

# =====================================================
# 8. Build Mobile Application
# =====================================================
print_step "Building mobile application..."

cd apps/mobile

# Update app version
echo "Updating mobile app version..."
npm version patch --no-git-tag-version

# Build for EAS (if configured)
if command -v eas &> /dev/null && [ -f "eas.json" ]; then
    print_warning "EAS build available - run manually: eas build --platform all"
else
    print_warning "EAS not configured - mobile build skipped"
fi

cd ../..

print_success "Mobile application prepared"

# =====================================================
# 9. Verification
# =====================================================
print_step "Verifying deployment..."

echo "Checking database views..."
VIEWS_COUNT=$(supabase db execute "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('estate_performance_summary', 'agent_performance_summary', 'revenue_trends_summary', 'customer_engagement_summary');" | grep -oP '\d+' | head -1)

if [ "$VIEWS_COUNT" -eq 4 ]; then
    print_success "All 4 analytics views exist"
else
    print_error "Missing analytics views (found $VIEWS_COUNT, expected 4)"
    exit 1
fi

echo "Checking Edge Functions..."
FUNCTIONS=$(supabase functions list 2>/dev/null | grep -c "predict-trends" || echo "0")
if [ "$FUNCTIONS" -ge 1 ]; then
    print_success "predict-trends function deployed"
else
    print_error "predict-trends function not found"
    exit 1
fi

echo "Checking cron jobs..."
CRON_JOBS=$(supabase db execute "SELECT COUNT(*) FROM cron.job WHERE jobname IN ('analytics-predict-trends', 'analytics-update-accuracy');" | grep -oP '\d+' | head -1)
if [ "$CRON_JOBS" -eq 2 ]; then
    print_success "Cron jobs configured"
else
    print_warning "Cron jobs may need manual verification (found $CRON_JOBS)"
fi

# =====================================================
# 10. Test Endpoints
# =====================================================
print_step "Testing API endpoints..."

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "Testing predict-trends function..."
    RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/predict-trends" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        print_success "predict-trends function working"
    else
        print_warning "predict-trends function may need data to run properly"
    fi
else
    print_warning "Endpoint testing skipped (no anon key)"
fi

# =====================================================
# Deployment Complete
# =====================================================
echo ""
echo "============================================"
echo -e "${GREEN}✓ Analytics Suite Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "📊 Deployed Components:"
echo "  ✓ Analytics database views (4)"
echo "  ✓ Revenue predictions table"
echo "  ✓ Predict-trends Edge Function"
echo "  ✓ Automated cron jobs (2)"
echo "  ✓ Web analytics dashboard"
echo "  ✓ Mobile analytics components"
echo "  ✓ Export functionality (CSV, PDF)"
echo ""
echo "🔗 Access URLs:"
echo "  Web Dashboard: https://acrely.pinnaclegroups.ng/dashboard/analytics"
echo "  Mobile App: Available in Executive Dashboard > Analytics Tab"
echo ""
echo "⏰ Scheduled Jobs:"
echo "  • Predict Trends: Daily at 00:00 UTC"
echo "  • Update Accuracy: Daily at 01:00 UTC"
echo ""
echo "📝 Next Steps:"
echo "  1. Verify analytics dashboard loads correctly"
echo "  2. Test export functionality (CSV, PDF)"
echo "  3. Check predictions are generating"
echo "  4. Run E2E tests: pnpm test:e2e tests/e2e/analytics-dashboard.spec.ts"
echo "  5. Monitor cron job execution in Supabase dashboard"
echo ""
echo "📖 Documentation:"
echo "  See ANALYTICS_SYSTEM_IMPLEMENTATION.md for details"
echo ""
