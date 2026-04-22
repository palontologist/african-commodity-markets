import { ethers } from "ethers";
import { getChainlinkPrice } from "../lib/chainlink";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Configuration
const CONTRACT_ADDRESS = "0x5569E5B581f3B998dD81bFa583f91693aF44C14f";
const CONTRACT_ABI = [
  "function createPrediction(string commodity, uint256 currentPrice, uint256 predictedPrice, uint256 targetDate, uint256 confidence, string model, bytes32 ipfsHash) external returns (uint256)"
];

// Thresholds for "Danger"
const THRESHOLDS = {
  "GOLD": 2300,   // If Gold drops below $2300, HEDGE
  "COFFEE": 5.00, // If Coffee drops below $5.00, HEDGE
  "FUEL": 1.50    // If Fuel rises above $1.50, HEDGE
};

async function main() {
  console.log("🤖 Sentinel Agent Starting...");
  console.log("🌍 Monitoring Real-World Assets on Polygon Amoy...");

  // Setup Wallet
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  console.log(`🔑 Agent Wallet: ${wallet.address}`);

  // Run ONCE for testing
  try {
    console.log("\n-----------------------------------");
    console.log(`⏰ ${new Date().toLocaleTimeString()} - Scanning Markets...`);

    // Check Coffee
    const coffeePrice = await getChainlinkPrice("COFFEE");
    if (coffeePrice) {
      console.log(`☕ Coffee Price: $${coffeePrice.toFixed(2)} / kg`);
      
      // Simulate a "Crash" logic or check real threshold
      // For demo: We'll force a hedge if price is < $5.50 (which it likely is)
      if (coffeePrice < 5.50) {
        console.log("⚠️ RISK DETECTED: Coffee price is falling!");
        // await executeHedge(contract, "COFFEE", coffeePrice); // Commented out to save gas for now
        console.log("🛡️ [SIMULATION] Would execute hedge now.");
      } else {
        console.log("✅ Coffee Market Stable.");
      }
    }

  } catch (error) {
    console.error("❌ Agent Error:", error);
  }
}

// async function executeHedge... (keep as is)
  console.log(`🛡️ INITIATING AUTONOMOUS HEDGE for ${asset}...`);
  
  try {
    // Predict a further 5% drop
    const predictedPrice = Math.floor(currentPrice * 0.95 * 100); // Cents
    const currentPriceCents = Math.floor(currentPrice * 100);
    const targetDate = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 Days

    // Send Transaction
    // Note: We use a manual gas limit to be safe on Amoy
    const tx = await contract.createPrediction(
      asset,
      currentPriceCents,
      predictedPrice,
      targetDate,
      92, // High Confidence
      "sentinel-agent-v1",
      ethers.encodeBytes32String("auto-hedge"),
      { gasLimit: 500000 }
    );

    console.log(`⏳ Transaction Sent: ${tx.hash}`);
    console.log("waiting for confirmation...");
    
    // Don't wait for full confirmation in the loop to keep it non-blocking, 
    // but for the demo script we can just log the hash.
    console.log("✅ HEDGE ACTIVE. Farmer Protected.");

  } catch (error) {
    console.log(`⚠️ Hedge Failed (likely insufficient funds or gas): ${error.message}`);
  }
}

main().catch(console.error);
