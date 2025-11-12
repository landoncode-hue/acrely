#!/bin/bash
# =============================================================================
# Acrely v2 - Production Environment Setup Script
# =============================================================================
# This script sets up Supabase edge function secrets for production
# Run this after filling in your .env.production file
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Acrely v2 - Production Environment Setup                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.production.example to .env.production and fill in your values.${NC}"
    exit 1
fi

# Load environment variables
set -a
source .env.production
set +a

echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo -e "${YELLOW}Install it with: brew install supabase/tap/supabase${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI installed${NC}"

# Check if logged in
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_ACCESS_TOKEN not set. Running supabase login...${NC}"
    supabase login
fi

# Check required variables
echo -e "${BLUE}🔍 Validating environment variables...${NC}"

required_vars=(
    "SUPABASE_PROJECT_REF"
    "TERMII_API_KEY"
    "COMPANY_NAME"
    "COMPANY_EMAIL"
    "COMPANY_PHONE"
    "COMPANY_ADDRESS"
    "ORG_ID"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
        echo -e "${RED}❌ $var is not set${NC}"
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔗 Linking to Supabase project...${NC}"
cd supabase
supabase link --project-ref "$SUPABASE_PROJECT_REF"
echo -e "${GREEN}✅ Linked to project: $SUPABASE_PROJECT_REF${NC}"

echo ""
echo -e "${BLUE}🔐 Setting up Edge Function secrets...${NC}"

# Set secrets
supabase secrets set TERMII_API_KEY="$TERMII_API_KEY"
echo -e "${GREEN}✅ Set TERMII_API_KEY${NC}"

supabase secrets set COMPANY_NAME="$COMPANY_NAME"
echo -e "${GREEN}✅ Set COMPANY_NAME${NC}"

supabase secrets set COMPANY_EMAIL="$COMPANY_EMAIL"
echo -e "${GREEN}✅ Set COMPANY_EMAIL${NC}"

supabase secrets set COMPANY_PHONE="$COMPANY_PHONE"
echo -e "${GREEN}✅ Set COMPANY_PHONE${NC}"

supabase secrets set COMPANY_ADDRESS="$COMPANY_ADDRESS"
echo -e "${GREEN}✅ Set COMPANY_ADDRESS${NC}"

supabase secrets set ORG_ID="$ORG_ID"
echo -e "${GREEN}✅ Set ORG_ID${NC}"

if [ -n "$BACKUP_RETENTION_DAYS" ]; then
    supabase secrets set BACKUP_RETENTION_DAYS="$BACKUP_RETENTION_DAYS"
    echo -e "${GREEN}✅ Set BACKUP_RETENTION_DAYS${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Verifying secrets...${NC}"
supabase secrets list

cd ..

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Production Environment Setup Complete!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Run database migrations: ${YELLOW}pnpm db:push${NC}"
echo -e "  2. Deploy edge functions: ${YELLOW}pnpm functions:deploy${NC}"
echo -e "  3. Build and deploy web app: ${YELLOW}pnpm build${NC}"
echo ""
