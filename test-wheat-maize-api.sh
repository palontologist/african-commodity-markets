#!/bin/bash

# Test script for Wheat and Maize Oracle API
# Usage: ./test-wheat-maize-api.sh [BASE_URL]

BASE_URL="${1:-http://localhost:3000}"
API_BASE="$BASE_URL/api"

echo "🌾 Testing Wheat and Maize Oracle API"
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
  local name="$1"
  local url="$2"
  local method="${3:-GET}"
  local data="$4"
  
  echo -e "${YELLOW}Testing: $name${NC}"
  echo "  URL: $url"
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -X POST "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s "$url")
  fi
  
  # Check if response is valid JSON
  if echo "$response" | jq empty 2>/dev/null; then
    echo -e "  ${GREEN}✓ Valid JSON response${NC}"
    echo "$response" | jq '.' | head -20
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "  ${RED}✗ Invalid JSON response${NC}"
    echo "$response" | head -10
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  echo ""
}

# Test 1: Get both wheat and maize prices
test_endpoint \
  "Get both wheat and maize prices" \
  "$API_BASE/oracle/wheat-maize"

# Test 2: Get only wheat price
test_endpoint \
  "Get only wheat price" \
  "$API_BASE/oracle/wheat-maize?commodity=WHEAT"

# Test 3: Get only maize price
test_endpoint \
  "Get only maize price" \
  "$API_BASE/oracle/wheat-maize?commodity=MAIZE"

# Test 4: Get Tridge-specific data
test_endpoint \
  "Get Tridge-specific data" \
  "$API_BASE/oracle/wheat-maize?source=tridge"

# Test 5: Get historical data
test_endpoint \
  "Get historical data" \
  "$API_BASE/oracle/wheat-maize?historical=true"

# Test 6: Test live-prices endpoint with wheat
test_endpoint \
  "Live prices - Wheat" \
  "$API_BASE/live-prices?symbol=WHEAT"

# Test 7: Test live-prices endpoint with maize
test_endpoint \
  "Live prices - Maize" \
  "$API_BASE/live-prices?symbol=MAIZE"

# Test 8: Test live-prices with multiple commodities
test_endpoint \
  "Live prices - Multiple commodities" \
  "$API_BASE/live-prices?symbols=WHEAT,MAIZE"

# Print summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
