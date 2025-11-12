#!/bin/bash

# Verify Maintenance System Setup
# Author: Kennedy — Landon Digital
# Version: 1.8.0

echo "🔍 Acrely Maintenance System Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

# Check migrations exist
echo "📁 Checking migrations..."
MIGRATIONS=(
  "supabase/migrations/20250116000000_create_cron_logs.sql"
  "supabase/migrations/20250116000001_optimize_performance.sql"
  "supabase/migrations/20250116000002_storage_receipts_backup.sql"
  "supabase/migrations/20250116000003_cron_schedules.sql"
)

for migration in "${MIGRATIONS[@]}"; do
  if [ -f "$migration" ]; then
    echo -e "  ${GREEN}✓${NC} $migration"
  else
    echo -e "  ${RED}✗${NC} $migration (MISSING)"
    ERRORS=$((ERRORS+1))
  fi
done

echo ""

# Check Edge Functions exist
echo "⚡ Checking Edge Functions..."
FUNCTIONS=(
  "supabase/functions/system-health-check/index.ts"
  "supabase/functions/backup-database/index.ts"
  "supabase/functions/storage-cleanup/index.ts"
  "supabase/functions/alert-notification/index.ts"
)

for func in "${FUNCTIONS[@]}"; do
  if [ -f "$func" ]; then
    echo -e "  ${GREEN}✓${NC} $func"
  else
    echo -e "  ${RED}✗${NC} $func (MISSING)"
    ERRORS=$((ERRORS+1))
  fi
done

echo ""

# Check Frontend Components exist
echo "💻 Checking Frontend Components..."
COMPONENTS=(
  "apps/web/src/app/dashboard/system/page.tsx"
  "apps/web/src/components/system/HealthOverview.tsx"
  "apps/web/src/components/system/CronLogsTable.tsx"
)

for comp in "${COMPONENTS[@]}"; do
  if [ -f "$comp" ]; then
    echo -e "  ${GREEN}✓${NC} $comp"
  else
    echo -e "  ${RED}✗${NC} $comp (MISSING)"
    ERRORS=$((ERRORS+1))
  fi
done

echo ""

# Check test files exist
echo "🧪 Checking Test Files..."
TESTS=(
  "tests/e2e/system-dashboard.spec.ts"
)

for test in "${TESTS[@]}"; do
  if [ -f "$test" ]; then
    echo -e "  ${GREEN}✓${NC} $test"
  else
    echo -e "  ${RED}✗${NC} $test (MISSING)"
    ERRORS=$((ERRORS+1))
  fi
done

echo ""

# Check deployment script exists and is executable
echo "🚀 Checking Deployment Script..."
if [ -f "scripts/deploy-maintenance-system.sh" ]; then
  if [ -x "scripts/deploy-maintenance-system.sh" ]; then
    echo -e "  ${GREEN}✓${NC} scripts/deploy-maintenance-system.sh (executable)"
  else
    echo -e "  ${YELLOW}⚠${NC} scripts/deploy-maintenance-system.sh (not executable)"
    echo "    Run: chmod +x scripts/deploy-maintenance-system.sh"
  fi
else
  echo -e "  ${RED}✗${NC} scripts/deploy-maintenance-system.sh (MISSING)"
  ERRORS=$((ERRORS+1))
fi

echo ""

# Check documentation exists
echo "📖 Checking Documentation..."
if [ -f "MAINTENANCE_SYSTEM_COMPLETE.md" ]; then
  echo -e "  ${GREEN}✓${NC} MAINTENANCE_SYSTEM_COMPLETE.md"
else
  echo -e "  ${RED}✗${NC} MAINTENANCE_SYSTEM_COMPLETE.md (MISSING)"
  ERRORS=$((ERRORS+1))
fi

echo ""
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All maintenance system files verified!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Review MAINTENANCE_SYSTEM_COMPLETE.md"
  echo "  2. Run: pnpm deploy:maintenance"
  echo "  3. Or manually: ./scripts/deploy-maintenance-system.sh"
  exit 0
else
  echo -e "${RED}❌ Found $ERRORS missing file(s)${NC}"
  echo ""
  echo "Please ensure all files are created before deploying."
  exit 1
fi
