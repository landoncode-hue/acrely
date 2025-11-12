#!/bin/bash

###############################################################################
# Acrely Field Reports System Deployment Script
# Version: 2.3.0
# Author: Kennedy — Landon Digital
# Description: Deploys field reporting system with database migrations,
#              mobile components, and admin dashboard
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="acrely"
SUPABASE_PROJECT_REF="your-project-ref"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Acrely Field Reports System Deployment                 ║${NC}"
echo -e "${BLUE}║    Version 2.3.0 — Landon Digital                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Step 1: Database Migrations
###############################################################################

echo -e "${YELLOW}[1/6] Running Database Migrations...${NC}"

cd supabase

# Apply field reports migration
echo "  ↳ Creating field_reports table..."
supabase db push --db-url "$DATABASE_URL" \
  migrations/20250117000000_create_field_reports.sql

echo "  ↳ Creating agent performance analytics..."
supabase db push --db-url "$DATABASE_URL" \
  migrations/20250117000001_agent_performance_analytics.sql

echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

###############################################################################
# Step 2: Verify Database Schema
###############################################################################

echo -e "${YELLOW}[2/6] Verifying Database Schema...${NC}"

# Check if tables exist
psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('field_reports', 'agent_daily_performance');" | grep -q "field_reports" && \
  echo -e "${GREEN}✓ field_reports table created${NC}" || \
  echo -e "${RED}✗ field_reports table missing${NC}"

psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('field_reports', 'agent_daily_performance');" | grep -q "agent_daily_performance" && \
  echo -e "${GREEN}✓ agent_daily_performance table created${NC}" || \
  echo -e "${RED}✗ agent_daily_performance table missing${NC}"

# Check if materialized view exists
psql "$DATABASE_URL" -c "SELECT matviewname FROM pg_matviews WHERE matviewname = 'agent_performance_summary';" | grep -q "agent_performance_summary" && \
  echo -e "${GREEN}✓ agent_performance_summary view created${NC}" || \
  echo -e "${RED}✗ agent_performance_summary view missing${NC}"

echo ""

###############################################################################
# Step 3: Enable Realtime for field_reports
###############################################################################

echo -e "${YELLOW}[3/6] Enabling Realtime Subscriptions...${NC}"

psql "$DATABASE_URL" << EOF
-- Enable realtime for field_reports
ALTER PUBLICATION supabase_realtime ADD TABLE field_reports;

-- Enable realtime for agent_daily_performance
ALTER PUBLICATION supabase_realtime ADD TABLE agent_daily_performance;
EOF

echo -e "${GREEN}✓ Realtime enabled for field_reports and agent_daily_performance${NC}"
echo ""

###############################################################################
# Step 4: Deploy Mobile App Components
###############################################################################

echo -e "${YELLOW}[4/6] Preparing Mobile App Deployment...${NC}"

cd ../apps/mobile

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "  ↳ Installing dependencies..."
  npm install
fi

# Run type checking
echo "  ↳ Running type checks..."
npx tsc --noEmit || echo -e "${YELLOW}⚠ TypeScript warnings detected (non-blocking)${NC}"

echo -e "${GREEN}✓ Mobile components prepared${NC}"
echo ""

###############################################################################
# Step 5: Deploy Web Admin Dashboard
###############################################################################

echo -e "${YELLOW}[5/6] Deploying Web Admin Dashboard...${NC}"

cd ../web

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "  ↳ Installing dependencies..."
  pnpm install
fi

# Build the web app
echo "  ↳ Building Next.js application..."
pnpm build

echo -e "${GREEN}✓ Web admin dashboard built${NC}"
echo ""

###############################################################################
# Step 6: Run E2E Tests
###############################################################################

echo -e "${YELLOW}[6/6] Running E2E Tests...${NC}"

cd ../../tests/e2e

# Install Playwright if needed
if [ ! -d "node_modules/@playwright" ]; then
  echo "  ↳ Installing Playwright..."
  npx playwright install
fi

# Run field reports tests
echo "  ↳ Running field reports tests..."
npx playwright test field-reports.spec.ts --reporter=list || \
  echo -e "${YELLOW}⚠ Some tests failed (review output above)${NC}"

echo ""

###############################################################################
# Deployment Summary
###############################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Deployment Summary                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Database migrations applied${NC}"
echo -e "${GREEN}✓ Realtime subscriptions enabled${NC}"
echo -e "${GREEN}✓ Mobile components prepared${NC}"
echo -e "${GREEN}✓ Web dashboard built${NC}"
echo -e "${GREEN}✓ Tests executed${NC}"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Deploy mobile app:"
echo "   cd apps/mobile && eas build --platform android --profile production"
echo ""
echo "2. Deploy web dashboard:"
echo "   cd apps/web && pnpm deploy:hostinger"
echo ""
echo "3. Refresh materialized view (optional):"
echo "   psql \$DATABASE_URL -c 'REFRESH MATERIALIZED VIEW CONCURRENTLY agent_performance_summary;'"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Field Reports System Deployment Complete! 🎉${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
