const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying AIPredictionMarket to Polygon Amoy...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC\n");

  // USDC address on Amoy testnet
  // Circle's USDC on Amoy: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
  const USDC_AMOY = process.env.USDC_ADDRESS || "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  
  console.log("USDC Address:", USDC_AMOY);
  console.log("Initial Owner:", deployer.address);
  console.log("\nDeploying contract...");

  // Deploy AIPredictionMarket
  const AIPredictionMarket = await ethers.getContractFactory("AIPredictionMarket");
  const market = await AIPredictionMarket.deploy(USDC_AMOY, deployer.address);
  
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();

  console.log("\n✅ AIPredictionMarket deployed to:", marketAddress);
  console.log("\n📋 Contract Details:");
  console.log("- USDC Token:", USDC_AMOY);
  console.log("- Oracle Address:", deployer.address);
  console.log("- Platform Fee:", "2%");
  console.log("- Min Stake:", "1 USDC");

  console.log("\n🔗 View on PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${marketAddress}`);

  console.log("\n📝 Save these addresses to your .env.local:");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${marketAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${USDC_AMOY}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=80002`);

  // Wait for confirmations before verification
  console.log("\n⏳ Waiting for block confirmations...");
  await market.deploymentTransaction()?.wait(5);

  console.log("\n✅ Deployment complete!");
  console.log("\n🔍 To verify contract, run:");
  console.log(`npx hardhat verify --network amoy ${marketAddress} ${USDC_AMOY} ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
