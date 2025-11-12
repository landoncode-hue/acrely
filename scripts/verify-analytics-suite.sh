#!/bin/bash

# =====================================================
# Analytics Suite Verification Script
# Checks all components are properly deployed
# =====================================================

set -e

echo "🔍 Analytics Suite Verification"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

check_item() {
    local description=$1
    local command=$2
    local expected=$3
    
    echo -n "Checking $description... "
    
    if result=$(eval "$command" 2>&1); then
        if [[ "$result" == *"$expected"* ]] || [[ -z "$expected" ]]; then
            echo -e "${GREEN}✓${NC}"
            ((PASS++))
            return 0
        else
            echo -e "${RED}✗${NC} (Unexpected result: $result)"
            ((FAIL++))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} (Command failed)"
        ((FAIL++))
        return 1
    fi
}

echo ""
echo "📁 Database Components"
echo "----------------------"

# Check views
check_item "estate_performance_summary view" \
    "supabase db execute 'SELECT COUNT(*) FROM estate_performance_summary;'" \
    ""

check_item "agent_performance_summary view" \
    "supabase db execute 'SELECT COUNT(*) FROM agent_performance_summary;'" \
    ""

check_item "revenue_trends_summary view" \
    "supabase db execute 'SELECT COUNT(*) FROM revenue_trends_summary;'" \
    ""

check_item "customer_engagement_summary view" \
    "supabase db execute 'SELECT COUNT(*) FROM customer_engagement_summary;'" \
    ""

check_item "revenue_predictions table" \
    "supabase db execute 'SELECT COUNT(*) FROM revenue_predictions;'" \
    ""

echo ""
echo "⚡ Edge Functions"
echo "----------------"

check_item "predict-trends function" \
    "supabase functions list | grep predict-trends" \
    "predict-trends"

echo ""
echo "⏰ Cron Jobs"
echo "-----------"

check_item "analytics-predict-trends cron" \
    "supabase db execute \"SELECT COUNT(*) FROM cron.job WHERE jobname = 'analytics-predict-trends';\"" \
    "1"

check_item "analytics-update-accuracy cron" \
    "supabase db execute \"SELECT COUNT(*) FROM cron.job WHERE jobname = 'analytics-update-accuracy';\"" \
    "1"

echo ""
echo "📦 Web Files"
echo "-----------"

WEB_FILES=(
    "apps/web/app/dashboard/analytics/page.tsx"
    "apps/web/app/api/analytics/summary/route.ts"
    "apps/web/app/api/analytics/trends/route.ts"
    "apps/web/app/api/analytics/estates/route.ts"
    "apps/web/app/api/analytics/agents/route.ts"
    "apps/web/components/analytics/AnalyticsSummaryCard.tsx"
    "apps/web/components/analytics/RevenueChart.tsx"
    "apps/web/components/analytics/EstateBarChart.tsx"
    "apps/web/components/analytics/AgentRadarChart.tsx"
    "apps/web/components/analytics/ExportAnalyticsData.tsx"
)

for file in "${WEB_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $file (missing)"
        ((FAIL++))
    fi
done

echo ""
echo "📱 Mobile Files"
echo "--------------"

MOBILE_FILES=(
    "apps/mobile/screens/executive/AnalyticsTab.tsx"
    "apps/mobile/components/charts/MobileRevenueChart.tsx"
)

for file in "${MOBILE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $file (missing)"
        ((FAIL++))
    fi
done

echo ""
echo "🧪 Test Files"
echo "------------"

TEST_FILES=(
    "tests/e2e/analytics-dashboard.spec.ts"
    "tests/unit/edge-functions/predict-trends.test.md"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $file (missing)"
        ((FAIL++))
    fi
done

echo ""
echo "📚 Documentation"
echo "---------------"

DOC_FILES=(
    "ANALYTICS_SYSTEM_IMPLEMENTATION.md"
    "ANALYTICS_QUICKSTART.md"
    "scripts/deploy-analytics-suite.sh"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $file (missing)"
        ((FAIL++))
    fi
done

echo ""
echo "📦 Dependencies"
echo "--------------"

DEPENDENCIES=(
    "recharts"
    "jspdf"
    "jspdf-autotable"
    "json2csv"
)

for dep in "${DEPENDENCIES[@]}"; do
    if grep -q "\"$dep\"" package.json 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $dep"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} $dep (not in package.json - may need installation)"
        ((FAIL++))
    fi
done

echo ""
echo "================================"
echo "📊 Verification Summary"
echo "================================"
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "🎉 Analytics Suite is ready for deployment"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./scripts/deploy-analytics-suite.sh"
    echo "  2. Test: pnpm test:e2e tests/e2e/analytics-dashboard.spec.ts"
    echo "  3. Access: https://acrely.pinnaclegroups.ng/dashboard/analytics"
    exit 0
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    echo "See ANALYTICS_SYSTEM_IMPLEMENTATION.md for troubleshooting."
    exit 1
fi
