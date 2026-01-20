/**
 * Simple mock deployment for African Commodity Markets
 */

const fs = require('fs')
const path = require('path')

// Mock contract addresses for testing
const MOCK_ADDRESSES = {
  CommodityPriceOracle: "0x1234567890123456789012345678901234567890",
  CommodityPool: "0x1234567890123456789012345678901234567891", 
  PredictionMarketFactory: "0x1234567890123456789012345678901234567892",
  USDC: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
}

console.log("🚀 Mock Deployment Summary:")
console.log("Oracle:", MOCK_ADDRESSES.CommodityPriceOracle)
console.log("Pool:", MOCK_ADDRESSES.CommodityPool)
console.log("Factory:", MOCK_ADDRESSES.PredictionMarketFactory)
console.log("USDC:", MOCK_ADDRESSES.USDC)

// Write mock addresses file
fs.writeFileSync(
  path.join(__dirname, '../deployments', 'mock-addresses.json'),
  JSON.stringify(MOCK_ADDRESSES, null, 2)
)

// Environment updates for .env.local
const envUpdates = `
# Contract Addresses (Mock for Testing)
NEXT_PUBLIC_COMMODITY_PRICE_ORACLE_ADDRESS=${MOCK_ADDRESSES.CommodityPriceOracle}
NEXT_PUBLIC_COMMODITY_POOL_ADDRESS=${MOCK_ADDRESSES.CommodityPool}
NEXT_PUBLIC_PREDICTION_MARKET_FACTORY_ADDRESS=${MOCK_ADDRESSES.PredictionMarketFactory}
NEXT_PUBLIC_USDC_ADDRESS=${MOCK_ADDRESSES.USDC}
`

console.log("\\n✅ Mock deployment completed!")
console.log("📝 Environment variables ready for .env.local")

// Try to update .env.local
try {
  const envPath = path.join(__dirname, '../.env.local')
  const existingEnv = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
  
  // Update environment variables
  const updatedEnv = existingEnv
    .replace(/NEXT_PUBLIC_COMMODITY_PRICE_ORACLE_ADDRESS=.*/g, 'NEXT_PUBLIC_COMMODITY_PRICE_ORACLE_ADDRESS=' + MOCK_ADDRESSES.CommodityPriceOracle)
    .replace(/NEXT_PUBLIC_COMMODITY_POOL_ADDRESS=.*/g, 'NEXT_PUBLIC_COMMODITY_POOL_ADDRESS=' + MOCK_ADDRESSES.CommodityPool)
    .replace(/NEXT_PUBLIC_PREDICTION_MARKET_FACTORY_ADDRESS=.*/g, 'NEXT_PUBLIC_PREDICTION_MARKET_FACTORY_ADDRESS=' + MOCK_ADDRESSES.PredictionMarketFactory)
    .replace(/NEXT_PUBLIC_USDC_ADDRESS=.*/g, 'NEXT_PUBLIC_USDC_ADDRESS=' + MOCK_ADDRESSES.USDC)
  
  fs.writeFileSync(envPath, updatedEnv)
  console.log("✅ Updated .env.local with mock addresses")
  
} catch (error) {
  console.error("❌ Error updating .env.local:", error.message)
}

console.log("\\n💡 Next Steps:")
console.log("1. Try building: pnpm build")
console.log("2. Mock addresses are now in .env.local")
console.log("3. After build succeeds, frontend will use mock contracts")