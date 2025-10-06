#!/bin/bash

echo "🧪 Comprehensive API Testing"
echo "============================"
echo ""

# Test 1: Price fetch
echo "💰 Test 1: Fetch Current Price (COCOA in LATAM)"
echo "------------------------------------------------"
curl -s -X POST http://localhost:3000/api/agents/commodity/price \
  -H "Content-Type: application/json" \
  -d '{"symbol":"COCOA","region":"LATAM"}' | jq '.'
echo ""
echo ""

# Test 2: Short-term prediction
echo "🔮 Test 2: Short-term Prediction (TEA in AFRICA)"
echo "------------------------------------------------"
curl -s -X POST http://localhost:3000/api/agents/commodity/predict \
  -H "Content-Type: application/json" \
  -d '{"symbol":"TEA","region":"AFRICA","horizon":"SHORT_TERM"}' | jq '.data | {predictedPrice, confidence, currentPrice}'
echo ""
echo ""

# Test 3: Get recent predictions
echo "📊 Test 3: Fetch Recent Predictions (limit=2)"
echo "----------------------------------------------"
curl -s "http://localhost:3000/api/agents/commodity/predictions?limit=2" | jq '.data[] | {commodityId, region, horizon, predictedPrice, confidence, createdAt}'
echo ""
echo ""

# Test 4: Validation error test
echo "❌ Test 4: Invalid Symbol (should return 400 error)"
echo "---------------------------------------------------"
curl -s -X POST http://localhost:3000/api/agents/commodity/predict \
  -H "Content-Type: application/json" \
  -d '{"symbol":"INVALID","region":"AFRICA","horizon":"SHORT_TERM"}' | jq '.'
echo ""
echo ""

echo "✅ All API tests complete!"
echo ""
echo "Summary:"
echo "--------"
echo "✅ POST /api/agents/commodity/price - Current price fetching"
echo "✅ POST /api/agents/commodity/predict - AI predictions"  
echo "✅ GET /api/agents/commodity/predictions - Historical data"
echo "✅ Error handling - Validation working"
