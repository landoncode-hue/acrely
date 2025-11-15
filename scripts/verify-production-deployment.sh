#!/bin/bash

# ============================================================================
# Acrely Production Deployment Verification Script
# ============================================================================
# Author: Kennedy - Landon Digital
# Version: 2.0.0
# Description: Comprehensive production deployment verification
# ============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROD_URL="${1:-https://acrely.pinnaclegroups.ng}"
SUPABASE_URL="https://qenqilourxtfxchkawek.supabase.co"

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

check_url() {
    local url=$1
    local expected_code=${2:-200}
    local timeout=${3:-10}
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m "$timeout" "$url")
    
    if [ "$HTTP_CODE" -eq "$expected_code" ]; then
        return 0
    else
        return 1
    fi
}

# ============================================================================
# Verification Script
# ============================================================================

echo ""
echo "🔍 Acrely Production Deployment Verification"
echo "=============================================="
echo "Target: $PROD_URL"
echo ""

# ============================================================================
# 1. Web Application Checks
# ============================================================================

log_info "Checking web application..."

# Homepage accessibility
if check_url "$PROD_URL"; then
    log_success "Homepage is accessible (HTTP 200)"
else
    log_error "Homepage returned HTTP $HTTP_CODE (expected 200)"
fi

# API health endpoint
if check_url "$PROD_URL/api/health"; then
    log_success "API health endpoint responding"
else
    log_warning "API health endpoint returned HTTP $HTTP_CODE"
fi

# Check for HTTPS
if [[ $PROD_URL == https://* ]]; then
    log_success "HTTPS is enabled"
else
    log_error "HTTPS is not enabled"
fi

# Check SSL certificate
SSL_EXPIRY=$(echo | openssl s_client -servername "${PROD_URL#https://}" -connect "${PROD_URL#https://}:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)

if [ -n "$SSL_EXPIRY" ]; then
    log_success "SSL certificate is valid (expires: $SSL_EXPIRY)"
else
    log_warning "Could not verify SSL certificate"
fi

# ============================================================================
# 2. Supabase Backend Checks
# ============================================================================

log_info "Checking Supabase backend..."

# Supabase API accessibility
if check_url "$SUPABASE_URL/rest/v1/" 400; then
    log_success "Supabase API is accessible"
else
    log_error "Supabase API returned unexpected status: $HTTP_CODE"
fi

# Supabase Auth
if check_url "$SUPABASE_URL/auth/v1/health"; then
    log_success "Supabase Auth is healthy"
else
    log_warning "Supabase Auth health check returned: $HTTP_CODE"
fi

# ============================================================================
# 3. Performance Checks
# ============================================================================

log_info "Checking performance..."

# Page load time
LOAD_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$PROD_URL")
LOAD_TIME_MS=$(echo "$LOAD_TIME * 1000" | bc | cut -d. -f1)

if [ "$LOAD_TIME_MS" -lt 2000 ]; then
    log_success "Page load time: ${LOAD_TIME_MS}ms (< 2s)"
elif [ "$LOAD_TIME_MS" -lt 5000 ]; then
    log_warning "Page load time: ${LOAD_TIME_MS}ms (target: < 2s)"
else
    log_error "Page load time: ${LOAD_TIME_MS}ms (too slow!)"
fi

# API response time
API_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$PROD_URL/api/health")
API_TIME_MS=$(echo "$API_TIME * 1000" | bc | cut -d. -f1)

if [ "$API_TIME_MS" -lt 200 ]; then
    log_success "API response time: ${API_TIME_MS}ms (< 200ms)"
elif [ "$API_TIME_MS" -lt 500 ]; then
    log_warning "API response time: ${API_TIME_MS}ms (target: < 200ms)"
else
    log_error "API response time: ${API_TIME_MS}ms (too slow!)"
fi

# ============================================================================
# 4. DNS Checks
# ============================================================================

log_info "Checking DNS configuration..."

# Extract domain from URL
DOMAIN=$(echo "$PROD_URL" | sed -E 's|https?://([^/]+).*|\1|')

# Check DNS resolution
if dig +short "$DOMAIN" | grep -q .; then
    log_success "DNS resolves correctly for $DOMAIN"
else
    log_error "DNS does not resolve for $DOMAIN"
fi

# ============================================================================
# 5. Security Headers
# ============================================================================

log_info "Checking security headers..."

HEADERS=$(curl -s -I "$PROD_URL")

# Check for security headers
if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    log_success "X-Content-Type-Options header present"
else
    log_warning "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    log_success "X-Frame-Options header present"
else
    log_warning "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
    log_success "HSTS header present"
else
    log_warning "HSTS header missing (recommended)"
fi

# ============================================================================
# 6. Content Checks
# ============================================================================

log_info "Checking content delivery..."

# Check if page contains expected content
PAGE_CONTENT=$(curl -s "$PROD_URL")

if echo "$PAGE_CONTENT" | grep -qi "Acrely"; then
    log_success "Page contains expected content (Acrely)"
else
    log_error "Page does not contain expected content"
fi

# Check for common error indicators
if echo "$PAGE_CONTENT" | grep -qi "500\|Internal Server Error\|Application Error"; then
    log_error "Page contains server error messages"
else
    log_success "No server errors detected in content"
fi

# ============================================================================
# 7. Mobile App Checks (Optional)
# ============================================================================

log_info "Mobile app checks (manual verification required)..."

echo ""
log_info "Please verify manually:"
echo "  - Mobile app available on Google Play (Internal Testing)"
echo "  - App connects to production backend"
echo "  - Login/signup flows working"
echo "  - Data sync with web app functional"
echo ""

# ============================================================================
# 8. Monitoring Checks
# ============================================================================

log_info "Monitoring status (manual verification required)..."

echo ""
log_info "Please verify in dashboards:"
echo "  - Sentry error tracking active"
echo "  - Supabase logs collecting data"
echo "  - Vercel deployment logs accessible"
echo "  - Uptime monitoring configured"
echo "  - Queue health monitor running"
echo ""

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "=============================================="
echo "📊 Verification Summary"
echo "=============================================="
echo "Passed:   $PASSED"
echo "Failed:   $FAILED"
echo "Warnings: $WARNINGS"
echo "=============================================="
echo ""

# Determine overall status
if [ "$FAILED" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        log_success "✅ All checks passed! Production deployment verified."
        exit 0
    else
        log_warning "⚠️  Deployment successful with $WARNINGS warnings."
        exit 0
    fi
else
    log_error "❌ Deployment verification failed with $FAILED critical issues."
    exit 1
fi
