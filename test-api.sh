#!/bin/bash

echo "🧪 Testing Commodity Prediction API"
echo "===================================="
echo ""

# Wait for server to be ready
echo "⏳ Waiting for server..."
sleep 3

# Test 1: GET endpoint (documentation)
echo "📘 Test 1: GET /api/agents/commodity/predict (API Documentation)"
curl -s http://localhost:3000/api/agents/commodity/predict | jq '.'
echo ""
echo ""

# Test 2: POST prediction request
echo "🔮 Test 2: POST /api/agents/commodity/predict (Generate Prediction)"
echo "Request: COFFEE in AFRICA, SHORT_TERM horizon"
curl -s -X POST http://localhost:3000/api/agents/commodity/predict \
  -H "Content-Type: application/json" \
  -d '{"symbol":"COFFEE","region":"AFRICA","horizon":"SHORT_TERM"}' | jq '.'
echo ""
echo ""

# Test 3: GET recent predictions
echo "📊 Test 3: GET /api/agents/commodity/predictions (Recent Predictions)"
curl -s "http://localhost:3000/api/agents/commodity/predictions?limit=3" | jq '.'
echo ""
echo ""

# Test 4: POST current price
echo "💰 Test 4: POST /api/agents/commodity/price (Current Price)"
echo "Request: COCOA in LATAM"
curl -s -X POST http://localhost:3000/api/agents/commodity/price \
  -H "Content-Type: application/json" \
  -d '{"symbol":"COCOA","region":"LATAM"}' | jq '.'
echo ""
echo ""

echo "✅ All tests complete!"
