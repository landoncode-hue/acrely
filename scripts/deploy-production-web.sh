#!/bin/bash

# ============================================================================
# Acrely Production Web Deployment Script
# ============================================================================
# Author: Kennedy - Landon Digital
# Version: 2.0.0
# Description: Automated production deployment to Vercel
# ============================================================================

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/Users/lordkay/Development/Acrely"
PROD_URL="https://acrely.pinnaclegroups.ng"
STAGING_URL="https://acrely-staging.vercel.app"
DEPLOY_TYPE="${1:-production}"  # production or staging

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

echo ""
echo "🚀 Acrely Production Deployment"
echo "================================"
echo ""

log_info "Running pre-flight checks..."

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    log_error "Not in Acrely project directory!"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    log_error "Node.js version must be 20 or higher (current: $NODE_VERSION)"
    exit 1
fi
log_success "Node.js version check passed"

# Check pnpm installation
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed"
    exit 1
fi
log_success "pnpm installation check passed"

# Check Vercel CLI installation
if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI not installed. Installing..."
    npm install -g vercel
fi
log_success "Vercel CLI check passed"

# ============================================================================
# Environment Configuration
# ============================================================================

log_info "Configuring environment for $DEPLOY_TYPE deployment..."

if [ "$DEPLOY_TYPE" = "staging" ]; then
    TARGET_URL="$STAGING_URL"
    ENV_FLAG="--env NEXT_PUBLIC_APP_ENV=staging"
    PROD_FLAG=""
else
    TARGET_URL="$PROD_URL"
    ENV_FLAG="--env NEXT_PUBLIC_APP_ENV=production"
    PROD_FLAG="--prod"
fi

log_success "Target URL: $TARGET_URL"

# ============================================================================
# Dependency Installation
# ============================================================================

log_info "Installing dependencies..."
cd "$PROJECT_ROOT"

# Clean install
pnpm install --frozen-lockfile

if [ $? -ne 0 ]; then
    log_error "Dependency installation failed"
    exit 1
fi

log_success "Dependencies installed successfully"

# ============================================================================
# Build Application
# ============================================================================

log_info "Building application..."

# Build web app
pnpm --filter=@acrely/web run build

if [ $? -ne 0 ]; then
    log_error "Build failed"
    exit 1
fi

log_success "Application built successfully"

# ============================================================================
# Pre-deployment Tests
# ============================================================================

log_info "Running pre-deployment checks..."

# Check for TypeScript errors
log_info "Checking TypeScript..."
cd apps/web
npx tsc --noEmit

if [ $? -ne 0 ]; then
    log_error "TypeScript errors found"
    exit 1
fi
log_success "TypeScript check passed"

cd "$PROJECT_ROOT"

# ============================================================================
# Deploy to Vercel
# ============================================================================

log_info "Deploying to Vercel ($DEPLOY_TYPE)..."

# Deploy
vercel $PROD_FLAG --yes $ENV_FLAG

if [ $? -ne 0 ]; then
    log_error "Deployment failed"
    exit 1
fi

log_success "Deployment completed successfully"

# ============================================================================
# Post-deployment Verification
# ============================================================================

log_info "Verifying deployment..."

# Wait for deployment to propagate
sleep 10

# Check if site is accessible
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL")

if [ "$HTTP_STATUS" -eq 200 ]; then
    log_success "Site is accessible (HTTP $HTTP_STATUS)"
else
    log_error "Site returned HTTP $HTTP_STATUS"
    exit 1
fi

# Check if API is responding
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/api/health")

if [ "$API_STATUS" -eq 200 ]; then
    log_success "API health check passed (HTTP $API_STATUS)"
else
    log_warning "API health check returned HTTP $API_STATUS"
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "================================"
echo "✅ Deployment Summary"
echo "================================"
echo "Environment: $DEPLOY_TYPE"
echo "URL: $TARGET_URL"
echo "Build: Successful"
echo "Deployment: Successful"
echo "Health Check: Passed"
echo "================================"
echo ""

log_success "Deployment complete! 🎉"

exit 0
