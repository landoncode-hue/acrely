#!/bin/bash

# Training and Documentation System Verification Script
# Verifies all training components are in place

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERROR_COUNT=0

echo "======================================"
echo "Training System Verification"
echo "======================================"
echo ""

# Function to check file existence
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
  else
    echo -e "${RED}✗${NC} $1 - MISSING"
    ((ERROR_COUNT++))
  fi
}

# Function to check directory existence
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
  else
    echo -e "${RED}✗${NC} $1/ - MISSING"
    ((ERROR_COUNT++))
  fi
}

echo "1. Checking Database Migrations..."
check_file "supabase/migrations/20250119000000_training_system.sql"
echo ""

echo "2. Checking Web Components..."
check_file "apps/web/src/hooks/useOnboarding.ts"
check_file "apps/web/src/components/onboarding/OnboardingTour.tsx"
check_file "apps/web/src/components/help/HelpArticleCard.tsx"
check_file "apps/web/src/app/help/page.tsx"
check_file "apps/web/src/app/dashboard/feedback/page.tsx"
echo ""

echo "3. Checking Mobile Components..."
check_file "apps/mobile/screens/onboarding/IntroCarousel.tsx"
check_file "apps/mobile/screens/help/HelpScreen.tsx"
echo ""

echo "4. Checking Documentation..."
check_file "docs/architecture-overview.md"
check_file "docs/api-reference.md"
check_file "docs/deployment-guide.md"
check_file "docs/edge-functions.md"
echo ""

echo "5. Checking Tests..."
check_file "tests/e2e/onboarding-help.spec.ts"
echo ""

echo "6. Checking Dependencies..."
if grep -q "react-joyride" apps/web/package.json; then
  echo -e "${GREEN}✓${NC} react-joyride dependency"
else
  echo -e "${RED}✗${NC} react-joyride dependency - MISSING"
  ((ERROR_COUNT++))
fi

if grep -q "jspdf-autotable" apps/web/package.json; then
  echo -e "${GREEN}✓${NC} jspdf-autotable dependency"
else
  echo -e "${RED}✗${NC} jspdf-autotable dependency - MISSING"
  ((ERROR_COUNT++))
fi
echo ""

echo "7. Verifying Database Tables (requires Supabase connection)..."
if command -v supabase &> /dev/null; then
  TABLES=("user_settings" "user_feedback" "help_article_views" "training_progress")
  
  for table in "${TABLES[@]}"; do
    if supabase db diff --schema public 2>/dev/null | grep -q "$table"; then
      echo -e "${GREEN}✓${NC} Table: $table"
    else
      echo -e "${YELLOW}⚠${NC} Table: $table - Not verified (run migrations)"
    fi
  done
else
  echo -e "${YELLOW}⚠${NC} Supabase CLI not found - skipping database verification"
fi
echo ""

echo "8. Checking Help Center Route..."
if grep -q 'href="/help"' apps/web/src/components/layout/Sidebar.tsx; then
  echo -e "${GREEN}✓${NC} Help Center link in sidebar"
else
  echo -e "${RED}✗${NC} Help Center link in sidebar - MISSING"
  ((ERROR_COUNT++))
fi
echo ""

echo "9. Checking Onboarding Integration..."
if grep -q "OnboardingTour" apps/web/src/app/dashboard/layout.tsx; then
  echo -e "${GREEN}✓${NC} OnboardingTour integrated in dashboard layout"
else
  echo -e "${RED}✗${NC} OnboardingTour integration - MISSING"
  ((ERROR_COUNT++))
fi
echo ""

echo "10. Verifying Environment Variables..."
if [ -f "apps/web/.env.local" ] || [ -f "apps/web/.env" ]; then
  echo -e "${GREEN}✓${NC} Environment file exists"
else
  echo -e "${YELLOW}⚠${NC} Environment file not found - create .env.local"
fi
echo ""

echo "======================================"
echo "Verification Summary"
echo "======================================"

if [ $ERROR_COUNT -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo "Training system is ready for deployment."
  exit 0
else
  echo -e "${RED}✗ $ERROR_COUNT error(s) found${NC}"
  echo ""
  echo "Please fix the errors before deploying."
  exit 1
fi
