#!/bin/bash
# =============================================================================
# Acrely v2 - Production Verification Script
# =============================================================================
# Comprehensive production deployment verification
# Tests all critical system components
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load environment variables
if [ -f ".env.production" ]; then
    set -a
    source .env.production
    set +a
fi

# Configuration
PRODUCTION_URL="${SITE_URL:-https://acrely.pinnaclegroups.ng}"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Functions
test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

section() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║ $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

# Header
clear
section "Acrely v2 - Production Verification"
echo -e "${BLUE}Testing production deployment at: $PRODUCTION_URL${NC}\n"

# Test 1: DNS Resolution
section "TEST SUITE 1: DNS & Network"
echo "Testing DNS resolution..."
if dig +short acrely.pinnaclegroups.ng &>/dev/null; then
    test_result 0 "DNS resolution successful"
else
    test_result 1 "DNS resolution failed"
fi

# Test 2: Website Accessibility
section "TEST SUITE 2: Website Accessibility"
echo "Testing production website..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" || echo "000")
if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
    test_result 0 "Production website accessible (HTTP $HTTP_CODE)"
else
    test_result 1 "Production website not accessible (HTTP $HTTP_CODE)"
fi

# Test 3: SSL Certificate
echo "Testing SSL certificate..."
if curl -sI "$PRODUCTION_URL" 2>&1 | grep -q "HTTP/2 200\|HTTP/1.1 200\|HTTP/1.1 301"; then
    test_result 0 "SSL certificate valid"
else
    test_result 1 "SSL certificate issue"
fi

# Test 4: Supabase API
section "TEST SUITE 3: Supabase Services"
echo "Testing Supabase API connectivity..."
SUPABASE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    "$SUPABASE_URL/rest/v1/" || echo "000")

if [ "$SUPABASE_STATUS" == "200" ]; then
    test_result 0 "Supabase API accessible"
else
    test_result 1 "Supabase API not accessible (HTTP $SUPABASE_STATUS)"
fi

# Test 5: Edge Functions
section "TEST SUITE 4: Edge Functions"

FUNCTIONS=(
    "send-sms"
    "generate-receipt"
    "commission-calculation"
    "generate-billing-summary"
    "system-health-check"
)

for func in "${FUNCTIONS[@]}"; do
    echo "Testing $func..."
    FUNC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        "$SUPABASE_URL/functions/v1/$func" \
        -d '{}' || echo "000")
    
    # Edge functions should return 400 (bad request) or 200, NOT 404
    if [ "$FUNC_STATUS" != "404" ] && [ "$FUNC_STATUS" != "000" ]; then
        test_result 0 "$func is deployed (HTTP $FUNC_STATUS)"
    else
        test_result 1 "$func not found or not accessible"
    fi
done

# Test 6: Database Tables
section "TEST SUITE 5: Database Schema"
echo "Verifying database tables..."

TABLES=(
    "customers"
    "estates"
    "plots"
    "allocations"
    "payments"
    "receipts"
    "commissions"
    "users"
    "audit_logs"
)

for table in "${TABLES[@]}"; do
    TABLE_CHECK=$(curl -s \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/$table?select=count" || echo "error")
    
    if [[ "$TABLE_CHECK" != *"error"* ]] && [[ "$TABLE_CHECK" != *"404"* ]]; then
        test_result 0 "Table '$table' exists and accessible"
    else
        test_result 1 "Table '$table' not accessible"
    fi
done

# Test 7: Storage Buckets
section "TEST SUITE 6: Storage Configuration"
echo "Testing storage buckets..."

BUCKETS=("receipts" "documents")
for bucket in "${BUCKETS[@]}"; do
    BUCKET_CHECK=$(curl -s \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/storage/v1/bucket/$bucket" || echo "error")
    
    if [[ "$BUCKET_CHECK" != *"error"* ]] && [[ "$BUCKET_CHECK" != *"Bucket not found"* ]]; then
        test_result 0 "Storage bucket '$bucket' exists"
    else
        test_result 1 "Storage bucket '$bucket' not found"
    fi
done

# Test 8: Critical Pages
section "TEST SUITE 7: Application Pages"
PAGES=(
    "/"
    "/dashboard"
)

for page in "${PAGES[@]}"; do
    echo "Testing page: $page"
    PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL$page" || echo "000")
    if [ "$PAGE_STATUS" == "200" ] || [ "$PAGE_STATUS" == "301" ] || [ "$PAGE_STATUS" == "302" ]; then
        test_result 0 "Page '$page' accessible"
    else
        test_result 1 "Page '$page' not accessible (HTTP $PAGE_STATUS)"
    fi
done

# Test 9: Performance Check
section "TEST SUITE 8: Performance"
echo "Testing response time..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$PRODUCTION_URL")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)

if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
    test_result 0 "Response time acceptable (${RESPONSE_MS}ms)"
else
    test_result 1 "Response time too slow (${RESPONSE_MS}ms)"
fi

# Summary
section "VERIFICATION SUMMARY"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ ALL TESTS PASSED - PRODUCTION READY!                     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${CYAN}Production URL: $PRODUCTION_URL${NC}"
    echo -e "${CYAN}Success Rate: ${PASS_RATE}%${NC}\n"
    exit 0
elif [ $PASS_RATE -ge 80 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║   ⚠️  TESTS PASSED WITH WARNINGS                              ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${YELLOW}Success Rate: ${PASS_RATE}%${NC}"
    echo -e "${YELLOW}Please review failed tests before going live.${NC}\n"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ CRITICAL FAILURES DETECTED                                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${RED}Success Rate: ${PASS_RATE}%${NC}"
    echo -e "${RED}DO NOT deploy to production until all critical tests pass.${NC}\n"
    exit 1
fi
