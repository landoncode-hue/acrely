#!/bin/bash

# ============================================================================
# Acrely Production Mobile Deployment Script
# ============================================================================
# Author: Kennedy - Landon Digital
# Version: 2.0.0
# Description: Automated production mobile build for Google Play
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
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"
BUILD_PROFILE="${1:-production}"  # development, preview, or production

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
echo "📱 Acrely Mobile Production Build"
echo "=================================="
echo ""

log_info "Running pre-flight checks..."

# Check if we're in the right directory
if [ ! -f "$MOBILE_DIR/package.json" ]; then
    log_error "Mobile app directory not found!"
    exit 1
fi

# Check EAS CLI installation
if ! command -v eas &> /dev/null; then
    log_warning "EAS CLI not installed. Installing..."
    npm install -g eas-cli
fi
log_success "EAS CLI check passed"

# Check if logged into EAS
if ! eas whoami &> /dev/null; then
    log_error "Not logged into EAS. Run 'eas login' first."
    exit 1
fi
log_success "EAS authentication verified"

# ============================================================================
# Environment Configuration
# ============================================================================

log_info "Configuring build profile: $BUILD_PROFILE"

cd "$MOBILE_DIR"

# Verify eas.json exists
if [ ! -f "eas.json" ]; then
    log_error "eas.json not found!"
    exit 1
fi

log_success "Build configuration verified"

# ============================================================================
# Dependency Installation
# ============================================================================

log_info "Installing dependencies..."

pnpm install

if [ $? -ne 0 ]; then
    log_error "Dependency installation failed"
    exit 1
fi

log_success "Dependencies installed successfully"

# ============================================================================
# Pre-build Validation
# ============================================================================

log_info "Validating app configuration..."

# Check app.config.js
if [ ! -f "app.config.js" ]; then
    log_error "app.config.js not found!"
    exit 1
fi

# Validate TypeScript
log_info "Checking TypeScript..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    log_error "TypeScript errors found"
    exit 1
fi
log_success "TypeScript check passed"

# ============================================================================
# Build Application
# ============================================================================

log_info "Building Android app with EAS ($BUILD_PROFILE profile)..."

# Build for Android
eas build --platform android --profile "$BUILD_PROFILE" --non-interactive

if [ $? -ne 0 ]; then
    log_error "Build failed"
    exit 1
fi

log_success "Build completed successfully"

# ============================================================================
# Build Artifacts
# ============================================================================

log_info "Retrieving build information..."

# Get latest build
BUILD_INFO=$(eas build:list --platform android --limit 1 --json)

if [ $? -ne 0 ]; then
    log_warning "Could not retrieve build information"
else
    log_success "Build submitted to EAS"
    echo ""
    echo "Build Information:"
    echo "$BUILD_INFO" | jq '.[0] | {id, status, platform, profile, createdAt}'
fi

# ============================================================================
# Post-build Instructions
# ============================================================================

echo ""
echo "================================"
echo "📱 Build Summary"
echo "================================"
echo "Platform: Android"
echo "Profile: $BUILD_PROFILE"
echo "Status: Submitted to EAS"
echo ""
echo "Next Steps:"
echo "1. Monitor build progress: eas build:list"
echo "2. Download APK/AAB when ready: eas build:download"
echo "3. Upload to Google Play Console"
echo "================================"
echo ""

log_success "Mobile build process complete! 🎉"

# ============================================================================
# Optional: Submit to Google Play (Production only)
# ============================================================================

if [ "$BUILD_PROFILE" = "production" ]; then
    echo ""
    read -p "Do you want to submit to Google Play after build completes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Submission will start after build completes..."
        log_info "Run 'eas submit --platform android --latest' manually when build is ready"
    fi
fi

exit 0
