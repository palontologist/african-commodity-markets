const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Synthesis Markets to BASE MAINNET...");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  if (balance < hre.ethers.parseEther("0.001")) {
    console.error("❌ Insufficient funds! Need at least 0.001 ETH.");
    process.exit(1);
  }

  // 1. Deploy Prediction Market
  const PredictionMarket = await hre.ethers.getContractFactory("AIPredictionMarket");
  
  // Base Mainnet USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
  // Initial Owner (The Deployer)
  const INITIAL_OWNER = deployer.address;

  console.log(`🔹 USDC: ${USDC_ADDRESS}`);
  console.log(`🔹 Owner: ${INITIAL_OWNER}`);

  const market = await PredictionMarket.deploy(USDC_ADDRESS, INITIAL_OWNER);
  await market.waitForDeployment();

  const marketAddress = await market.getAddress();
  console.log(`\n✅ PredictionMarket Deployed at: ${marketAddress}`);
  console.log("   (Update your frontend with this address!)");

  // 2. Verify Contract (Optional, if we had API key)
  console.log("\nTo verify:");
  console.log(`npx hardhat verify --network base ${marketAddress} ${ORACLE_ADDRESS}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
