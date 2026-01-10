#!/bin/bash

##############################################################################
# Next.js Custom Cache Handler - Automated Test Script
#
# This script automates testing of cache behavior across different routes
# and scenarios. Use it for quick verification during development.
#
# Usage:
#   chmod +x test-cache.sh
#   ./test-cache.sh [base_url]
#
# Example:
#   ./test-cache.sh http://localhost:3000
#   ./test-cache.sh https://your-k8s-loadbalancer.com
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="${1:-http://localhost:3000}"

# Test counter
PASSED=0
FAILED=0

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║      Next.js Custom Cache Handler - Test Suite            ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Testing against: ${BASE_URL}${NC}"
echo ""

##############################################################################
# Helper Functions
##############################################################################

pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

section() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Measure response time
measure_time() {
    local url=$1
    local start=$(date +%s%N)
    curl -s -o /dev/null -w "%{http_code}" "$url" > /dev/null
    local end=$(date +%s%N)
    local duration=$(( (end - start) / 1000000 )) # Convert to milliseconds
    echo $duration
}

##############################################################################
# Test 1: API Route with fetch() - Data Cache
##############################################################################

section "Test 1: API Route with fetch() - Data Cache"

info "Calling /api/cached-fetch for the first time (should be SLOW)..."
RESPONSE1=$(curl -s "$BASE_URL/api/cached-fetch")
CACHED1=$(echo $RESPONSE1 | grep -o '"cached":[^,]*' | cut -d: -f2)
DURATION1=$(echo $RESPONSE1 | grep -o '"duration":"[^"]*"' | cut -d\" -f4)

info "First call - Duration: $DURATION1, Cached: $CACHED1"

sleep 2

info "Calling /api/cached-fetch again (should be FAST)..."
RESPONSE2=$(curl -s "$BASE_URL/api/cached-fetch")
CACHED2=$(echo $RESPONSE2 | grep -o '"cached":[^,]*' | cut -d: -f2)
DURATION2=$(echo $RESPONSE2 | grep -o '"duration":"[^"]*"' | cut -d\" -f4)

info "Second call - Duration: $DURATION2, Cached: $CACHED2"

if [[ "$CACHED2" == "true" ]]; then
    pass "Data Cache working - Second request was cached"
else
    fail "Data Cache NOT working - Second request was not cached"
fi

##############################################################################
# Test 2: API Route force-dynamic - Real-time
##############################################################################

section "Test 2: API Route force-dynamic - Real-time"

info "Calling /api/real-time multiple times..."
RESPONSE1=$(curl -s "$BASE_URL/api/real-time")
REQID1=$(echo $RESPONSE1 | grep -o '"requestId":"[^"]*"' | cut -d\" -f4)
CACHED1=$(echo $RESPONSE1 | grep -o '"cached":[^,]*' | cut -d: -f2)

sleep 1

RESPONSE2=$(curl -s "$BASE_URL/api/real-time")
REQID2=$(echo $RESPONSE2 | grep -o '"requestId":"[^"]*"' | cut -d\" -f4)
CACHED2=$(echo $RESPONSE2 | grep -o '"cached":[^,]*' | cut -d: -f2)

info "First requestId: $REQID1, Cached: $CACHED1"
info "Second requestId: $REQID2, Cached: $CACHED2"

if [[ "$REQID1" != "$REQID2" ]] && [[ "$CACHED2" == "false" ]]; then
    pass "force-dynamic working - Each request is unique and not cached"
else
    fail "force-dynamic NOT working - Requests might be cached"
fi

##############################################################################
# Test 3: Page ISR - Time-based Revalidation
##############################################################################

section "Test 3: Page ISR - Time-based Revalidation"

info "Fetching /app-isr twice to test cache..."
TIME1=$(measure_time "$BASE_URL/app-isr")
sleep 1
TIME2=$(measure_time "$BASE_URL/app-isr")

info "First request: ${TIME1}ms"
info "Second request: ${TIME2}ms"

if [[ $TIME2 -lt 100 ]]; then
    pass "Page Cache working - Second request was fast (${TIME2}ms)"
else
    warn "Page Cache might not be working - Second request was slow (${TIME2}ms)"
fi

##############################################################################
# Test 4: Tag-based Revalidation
##############################################################################

section "Test 4: Tag-based Revalidation"

info "Fetching /app-isr to cache it..."
curl -s "$BASE_URL/app-isr" > /dev/null

info "Triggering revalidation via API..."
PURGE_RESULT=$(curl -s "$BASE_URL/api/revalidate?tags=photos")
SUCCESS=$(echo $PURGE_RESULT | grep -o '"revalidated":[^,]*' | cut -d: -f2)

if [[ "$SUCCESS" == "true" ]]; then
    pass "Tag-based revalidation API works"
else
    fail "Tag-based revalidation API failed"
fi

info "Fetching /app-isr again (should regenerate)..."
TIME_AFTER=$(measure_time "$BASE_URL/app-isr")
info "Response time after purge: ${TIME_AFTER}ms"

if [[ $TIME_AFTER -gt 50 ]]; then
    pass "Cache was purged - Page regenerated (${TIME_AFTER}ms)"
else
    warn "Cache might still be active - Response was fast (${TIME_AFTER}ms)"
fi

##############################################################################
# Test 5: Image Gallery - Buffer Handling
##############################################################################

section "Test 5: Image Gallery - Buffer Handling"

info "Fetching /gallery to test image handling..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/gallery")

if [[ "$HTTP_CODE" == "200" ]]; then
    pass "Gallery page loaded successfully (HTTP $HTTP_CODE)"
else
    fail "Gallery page failed to load (HTTP $HTTP_CODE)"
fi

##############################################################################
# Test 6: Cache Stats API
##############################################################################

section "Test 6: Cache Stats API"

info "Fetching cache stats..."
STATS=$(curl -s "$BASE_URL/api/cache-stats")
REDIS_CONNECTED=$(echo $STATS | grep -o '"connected":[^,]*' | head -1 | cut -d: -f2)

if [[ "$REDIS_CONNECTED" == "true" ]]; then
    pass "Redis connected - Cache stats available"
    TOTAL_KEYS=$(echo $STATS | grep -o '"nextjsKeys":[0-9]*' | cut -d: -f2)
    info "Total Next.js cache keys: $TOTAL_KEYS"
elif [[ "$REDIS_CONNECTED" == "false" ]]; then
    warn "Redis not connected - Using LRU fallback"
else
    fail "Could not determine Redis status"
fi

##############################################################################
# Test 7: Multiple Pod Test (if in K8s)
##############################################################################

section "Test 7: Multi-Pod Cache Sharing (Optional)"

info "Testing cache sharing across pods..."
info "Making 10 requests to check pod distribution..."

HOSTNAMES=$(for i in {1..10}; do
    curl -s "$BASE_URL/app-isr" | grep -o 'Pod Hostname: [^<]*' | head -1
done | sort | uniq)

UNIQUE_PODS=$(echo "$HOSTNAMES" | wc -l | tr -d ' ')

if [[ $UNIQUE_PODS -gt 1 ]]; then
    info "Detected $UNIQUE_PODS different pods:"
    echo "$HOSTNAMES" | sed 's/^/  /'
    pass "Load balancer distributing traffic across $UNIQUE_PODS pods"
else
    info "Only 1 pod detected (might be local development)"
fi

##############################################################################
# Summary
##############################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Test Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check logs above.${NC}"
    exit 1
fi
