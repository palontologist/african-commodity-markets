import { ethers } from "ethers";

// Chainlink Aggregator V3 Interface ABI
const AGGREGATOR_V3_ABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() view returns (uint8)"
];

// Polygon Amoy Feed Addresses (Using Simulation for Stability)
const FEEDS: Record<string, string> = {
  "GOLD": "SIMULATED", 
  "ETH": "SIMULATED",
  "BTC": "SIMULATED",
  "MATIC": "SIMULATED",
  "COFFEE": "SIMULATED", 
  "MAIZE": "SIMULATED",
  "FUEL": "SIMULATED" 
};

// RPC Provider (Polygon Amoy)
const RPC_URL = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function getChainlinkPrice(asset: string): Promise<number | null> {
  const feedAddress = FEEDS[asset.toUpperCase()];
  
  if (!feedAddress) {
    console.warn(`No Chainlink feed for ${asset}`);
    return null;
  }

  if (feedAddress === "SIMULATED") {
    return getSimulatedPrice(asset);
  }

  try {
    const priceFeed = new ethers.Contract(feedAddress, AGGREGATOR_V3_ABI, provider);
    const roundData = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();
    
    // Convert BigInt to number and adjust for decimals
    const price = Number(roundData.answer) / Math.pow(10, Number(decimals));
    return price;
  } catch (error) {
    console.error(`Error fetching Chainlink price for ${asset}:`, error);
    return null;
  }
}

// Fallback for non-feed assets (Hackathon Simulation)
function getSimulatedPrice(asset: string): number {
  // Base prices (Real-world approx as of March 2026)
  const basePrices: Record<string, number> = {
    "GOLD": 2350.00, // $2350/oz
    "ETH": 3800.00,  // $3800
    "BTC": 72000.00, // $72k
    "MATIC": 0.85,   // $0.85
    "COFFEE": 5.50,  // $5.50/kg
    "MAIZE": 0.35,   // $0.35/kg
    "FUEL": 1.20     // $1.20/liter
  };

  const base = basePrices[asset.toUpperCase()] || 100.0;
  // Add random fluctuation +/- 2% to look live
  const fluctuation = (Math.random() * 0.04) - 0.02; 
  return base * (1 + fluctuation);
}
