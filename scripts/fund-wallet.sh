#!/bin/bash

ADDRESS=$1
if [ -z "$ADDRESS" ]; then
  echo "Usage: $0 <your_amoy_address>"
  exit 1
fi

echo "🚰 Attempting to fund $ADDRESS on Polygon Amoy..."

# 1. Alchemy Faucet (often requires login, but worth a shot via API if open)
echo "1. Trying Alchemy..."
curl -X POST -H "Content-Type: application/json" \
  -d "{\"address\":\"$ADDRESS\"}" \
  https://polygon-amoy-faucet.alchemy.com/api/faucet > /dev/null 2>&1

# 2. Thirdweb Faucet
echo "2. Trying Thirdweb..."
curl -s "https://thirdweb.com/amoy-testnet-faucet/api?address=$ADDRESS" > /dev/null 2>&1

# 3. Polygon Official (Aggregator) - usually browser only, but we can try a direct hit
echo "3. Trying Polygon Aggregator..."
curl -s -X POST "https://faucet-api.polygon.technology/api/v1/faucet" \
  -H "Content-Type: application/json" \
  -d "{\"network\":\"amoy\",\"address\":\"$ADDRESS\",\"token\":\"MATIC\"}" > /dev/null 2>&1

echo -e "\n✅ Faucet requests sent. Waiting 10s for confirmation..."
sleep 10
