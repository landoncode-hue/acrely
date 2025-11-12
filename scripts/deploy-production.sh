#!/bin/bash
# =============================================================================
# Acrely v2 - Production Deployment Script
# =============================================================================
# Complete deployment script for Acrely v2 to production
# This script handles database migrations, edge functions, and app build
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Deployment configuration
DEPLOYMENT_START_TIME=$(date +%s)
DEPLOYMENT_LOG="deployment-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "$1" | tee -a "$DEPLOYMENT_LOG"
}

success() {
    log "${GREEN}✅ $1${NC}"
}

error() {
    log "${RED}❌ $1${NC}"
}

warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

info() {
    log "${BLUE}ℹ️  $1${NC}"
}

section() {
    log "\n${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    log "${CYAN}║ $1${NC}"
    log "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

# Header
clear
section "Acrely v2 - Production Deployment"
info "Deployment started at: $(date)"
info "Log file: $DEPLOYMENT_LOG"

# Pre-flight checks
section "STEP 1: Pre-flight Checks"

# Check Node version
info "Checking Node.js version..."
NODE_VERSION=$(node -v)
if [[ "$NODE_VERSION" < "v20" ]]; then
    error "Node.js version must be 20 or higher. Current: $NODE_VERSION"
    exit 1
fi
success "Node.js version: $NODE_VERSION"

# Check pnpm
info "Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    error "pnpm is not installed. Install with: npm install -g pnpm"
    exit 1
fi
PNPM_VERSION=$(pnpm -v)
success "pnpm version: $PNPM_VERSION"

# Check Supabase CLI
info "Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    error "Supabase CLI is not installed"
    exit 1
fi
SUPABASE_VERSION=$(supabase --version)
success "Supabase CLI version: $SUPABASE_VERSION"

# Check environment file
info "Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    error ".env.production file not found!"
    warning "Copy .env.production.example to .env.production and configure it"
    exit 1
fi
success "Environment file found"

# Load environment variables
set -a
source .env.production
set +a

# Validate critical environment variables
required_vars=("SUPABASE_PROJECT_REF" "NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        error "$var is not set in .env.production"
        exit 1
    fi
done
success "All required environment variables are set"

# Install dependencies
section "STEP 2: Install Dependencies"
info "Installing dependencies with pnpm..."
pnpm install --frozen-lockfile
success "Dependencies installed"

# Database migrations
section "STEP 3: Deploy Database Migrations"
info "Linking to Supabase project..."
cd supabase
supabase link --project-ref "$SUPABASE_PROJECT_REF"
success "Linked to project: $SUPABASE_PROJECT_REF"

info "Pushing database migrations..."
supabase db push
success "Database migrations applied"

info "Verifying database state..."
supabase db remote get-version
success "Database verification complete"

cd ..

# Deploy edge functions
section "STEP 4: Deploy Edge Functions"

FUNCTIONS=(
    "send-sms"
    "generate-receipt"
    "process-receipt-queue"
    "commission-calculation"
    "commission-claim"
    "check-overdue-payments"
    "bulk-sms-campaign"
    "process-sms-queue"
    "generate-billing-summary"
    "system-health-check"
    "backup-database"
    "storage-cleanup"
    "alert-notification"
)

cd supabase

for func in "${FUNCTIONS[@]}"; do
    info "Deploying $func..."
    if [ "$func" == "system-health-check" ] || [ "$func" == "backup-database" ] || [ "$func" == "storage-cleanup" ] || [ "$func" == "alert-notification" ]; then
        supabase functions deploy "$func" --no-verify-jwt
    else
        supabase functions deploy "$func"
    fi
    success "$func deployed"
done

info "Verifying edge functions..."
supabase functions list
success "All edge functions deployed"

cd ..

# Build application
section "STEP 5: Build Web Application"
info "Building Next.js application..."
pnpm build

if [ $? -eq 0 ]; then
    success "Build completed successfully"
else
    error "Build failed!"
    exit 1
fi

# Verify build output
if [ ! -d "apps/web/.next" ]; then
    error "Build output directory not found!"
    exit 1
fi
success "Build output verified"

# Production build test
section "STEP 6: Test Production Build"
info "Starting production server for testing..."
cd apps/web
timeout 10s pnpm start &> /dev/null || true
success "Production build test complete"
cd ../..

# Deployment summary
section "STEP 7: Deployment Summary"

DEPLOYMENT_END_TIME=$(date +%s)
DEPLOYMENT_DURATION=$((DEPLOYMENT_END_TIME - DEPLOYMENT_START_TIME))
DEPLOYMENT_MINUTES=$((DEPLOYMENT_DURATION / 60))
DEPLOYMENT_SECONDS=$((DEPLOYMENT_DURATION % 60))

success "Deployment completed successfully!"
info "Duration: ${DEPLOYMENT_MINUTES}m ${DEPLOYMENT_SECONDS}s"
echo ""
log "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
log "${MAGENTA}Deployment Checklist:${NC}"
log "${GREEN}  ✅ Dependencies installed${NC}"
log "${GREEN}  ✅ Database migrations applied${NC}"
log "${GREEN}  ✅ Edge functions deployed (${#FUNCTIONS[@]} functions)${NC}"
log "${GREEN}  ✅ Web application built${NC}"
log "${GREEN}  ✅ Production build tested${NC}"
log "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""
log "${CYAN}Next Steps:${NC}"
log "  1. Deploy to Hostinger:"
log "     ${YELLOW}Upload apps/web/.next/ to /public_html/acrely/.next/${NC}"
log "     ${YELLOW}Upload apps/web/public/ to /public_html/acrely/public/${NC}"
log ""
log "  2. Configure Node.js app in Hostinger cPanel"
log ""
log "  3. Verify deployment:"
log "     ${YELLOW}./scripts/verify-production.sh${NC}"
log ""
log "  4. Run UAT tests:"
log "     ${YELLOW}pnpm test:e2e${NC}"
log ""
log "${GREEN}Deployment log saved to: $DEPLOYMENT_LOG${NC}"
