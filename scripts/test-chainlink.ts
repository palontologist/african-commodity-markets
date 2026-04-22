import { getChainlinkPrice } from "../lib/chainlink";

async function main() {
  console.log("🔍 Testing Chainlink Feeds on Polygon Amoy...");

  const assets = ["GOLD", "ETH", "BTC", "COFFEE", "MAIZE", "FUEL"];

  for (const asset of assets) {
    console.log(`\nFetching price for ${asset}...`);
    const price = await getChainlinkPrice(asset);
    
    if (price !== null) {
      console.log(`✅ ${asset}: $${price.toFixed(2)}`);
    } else {
      console.log(`❌ ${asset}: Failed to fetch`);
    }
  }
}

main().catch(console.error);
