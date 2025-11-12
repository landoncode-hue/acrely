#!/bin/bash

# Receipt System Deployment Script
# Author: Kennedy - Landon Digital
# Version: 1.5.0

set -e

echo "🎯 Acrely Receipt System Deployment"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first.${NC}"
    echo "   npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Step 1: Database Migrations
echo "📊 Step 1: Applying Database Migrations"
echo "----------------------------------------"
echo ""

echo "Applying receipt system migrations..."
supabase db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database migrations applied successfully${NC}"
else
    echo -e "${RED}❌ Failed to apply migrations${NC}"
    exit 1
fi

echo ""

# Step 2: Create Storage Bucket
echo "📦 Step 2: Setting up Storage Bucket"
echo "-------------------------------------"
echo ""

echo "Creating 'receipts' bucket..."
echo "Please create the bucket manually via Supabase Dashboard if not exists:"
echo "  1. Go to Storage in Supabase Dashboard"
echo "  2. Create new bucket named 'receipts'"
echo "  3. Set it as public"
echo "  4. Apply RLS policies"
echo ""

read -p "Press Enter once bucket is created and configured..."

echo -e "${GREEN}✅ Storage bucket ready${NC}"
echo ""

# Step 3: Set Environment Variables
echo "🔐 Step 3: Setting Environment Variables"
echo "-----------------------------------------"
echo ""

echo "Setting Edge Function secrets..."

# Check if .env file exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set secrets
supabase secrets set COMPANY_NAME="${COMPANY_NAME:-Pinnacle Builders Homes & Properties}" \
  COMPANY_EMAIL="${COMPANY_EMAIL:-info@pinnaclegroups.ng}" \
  COMPANY_PHONE="${COMPANY_PHONE:-+234XXXXXXXXXX}" \
  COMPANY_ADDRESS="${COMPANY_ADDRESS:-Edo, Nigeria}" \
  TERMII_API_KEY="${TERMII_API_KEY}" \
  TERMII_BASE_URL="${TERMII_BASE_URL:-https://v3.api.termii.com}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Environment variables set${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Some environment variables may not be set${NC}"
fi

echo ""

# Step 4: Deploy Edge Functions
echo "⚡ Step 4: Deploying Edge Functions"
echo "------------------------------------"
echo ""

echo "Deploying generate-receipt function..."
supabase functions deploy generate-receipt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ generate-receipt deployed${NC}"
else
    echo -e "${RED}❌ Failed to deploy generate-receipt${NC}"
    exit 1
fi

echo ""
echo "Deploying send-sms function..."
supabase functions deploy send-sms

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ send-sms deployed${NC}"
else
    echo -e "${RED}❌ Failed to deploy send-sms${NC}"
    exit 1
fi

echo ""

# Step 5: Build Frontend
echo "🌐 Step 5: Building Frontend"
echo "-----------------------------"
echo ""

echo "Installing dependencies..."
pnpm install

echo ""
echo "Building web application..."
pnpm build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo ""

# Step 6: Run Tests
echo "🧪 Step 6: Running Tests (Optional)"
echo "------------------------------------"
echo ""

read -p "Run E2E tests? (y/N): " run_tests

if [[ $run_tests =~ ^[Yy]$ ]]; then
    echo "Running E2E tests..."
    pnpm test:e2e receipts
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Some tests failed. Review and fix before production deployment.${NC}"
    fi
else
    echo "Skipping tests..."
fi

echo ""

# Deployment Summary
echo "📋 Deployment Summary"
echo "====================="
echo ""
echo -e "${GREEN}✅ Database migrations applied${NC}"
echo -e "${GREEN}✅ Storage bucket configured${NC}"
echo -e "${GREEN}✅ Environment variables set${NC}"
echo -e "${GREEN}✅ Edge Functions deployed${NC}"
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""
echo "🎉 Receipt System Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "  1. Test receipt generation manually"
echo "  2. Verify SMS notifications include receipt links"
echo "  3. Deploy frontend to Hostinger"
echo "  4. Monitor Edge Function logs for errors"
echo ""
echo "📚 Documentation: RECEIPT_SYSTEM_COMPLETE.md"
echo ""

# Optional: Open documentation
read -p "Open deployment documentation? (y/N): " open_docs

if [[ $open_docs =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open RECEIPT_SYSTEM_COMPLETE.md
    elif command -v xdg-open &> /dev/null; then
        xdg-open RECEIPT_SYSTEM_COMPLETE.md
    else
        echo "Please manually open: RECEIPT_SYSTEM_COMPLETE.md"
    fi
fi

echo ""
echo "✨ Happy deploying!"
