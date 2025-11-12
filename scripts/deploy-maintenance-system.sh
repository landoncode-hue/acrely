#!/bin/bash

# Deploy Maintenance System
# Author: Kennedy — Landon Digital
# Version: 1.8.0
# Quest: acrely-v2-system-maintenance

set -e

echo "🚀 Deploying Acrely Maintenance System v1.8.0"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Pushing database migrations...${NC}"
supabase db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations applied successfully${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Deploying Edge Functions...${NC}"

# Deploy system-health-check
echo "  → Deploying system-health-check..."
supabase functions deploy system-health-check --no-verify-jwt

# Deploy backup-database
echo "  → Deploying backup-database..."
supabase functions deploy backup-database --no-verify-jwt

# Deploy storage-cleanup
echo "  → Deploying storage-cleanup..."
supabase functions deploy storage-cleanup --no-verify-jwt

# Deploy alert-notification
echo "  → Deploying alert-notification..."
supabase functions deploy alert-notification --no-verify-jwt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All Edge Functions deployed${NC}"
else
    echo -e "${RED}❌ Edge Function deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Setting environment secrets...${NC}"

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "  → Setting secrets from .env.local..."
    
    # Read environment variables
    export $(cat .env.local | xargs)
    
    # Set secrets for each function
    supabase secrets set \
        SUPABASE_URL="$SUPABASE_URL" \
        SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
        TERMII_API_KEY="$TERMII_API_KEY" \
        COMPANY_NAME="$COMPANY_NAME" \
        ALERT_EMAIL="$ALERT_EMAIL" \
        BACKUP_RETENTION_DAYS="$BACKUP_RETENTION_DAYS"
    
    echo -e "${GREEN}✅ Secrets configured${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found. Skipping secrets setup.${NC}"
    echo -e "${YELLOW}   Please set secrets manually using: supabase secrets set KEY=VALUE${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Building and deploying web app...${NC}"
cd apps/web
pnpm build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Web app built successfully${NC}"
else
    echo -e "${RED}❌ Web app build failed${NC}"
    exit 1
fi

# Deploy to Hostinger (if configured)
if [ ! -z "$HOSTINGER_HOST" ]; then
    echo "  → Deploying to Hostinger..."
    rsync -avz --delete out/ "$HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH"
    echo -e "${GREEN}✅ Deployed to Hostinger${NC}"
else
    echo -e "${YELLOW}⚠️  Hostinger credentials not found. Skipping deployment.${NC}"
fi

cd ../..

echo ""
echo -e "${YELLOW}Step 5: Running verification tests...${NC}"

# Test health check endpoint
echo "  → Testing system-health-check..."
HEALTH_RESPONSE=$(supabase functions invoke system-health-check)
echo "    Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "status"; then
    echo -e "${GREEN}✅ Health check responding${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📊 Next Steps:"
echo "  1. Visit https://acrely.pinnaclegroups.ng/dashboard/system"
echo "  2. Verify system health metrics are displaying"
echo "  3. Check cron logs for scheduled jobs"
echo "  4. Monitor alerts for any failures"
echo ""
echo "📖 Documentation: See MAINTENANCE_SYSTEM_COMPLETE.md"
echo "================================================"
