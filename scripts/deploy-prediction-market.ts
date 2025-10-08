import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying AIPredictionMarket to Polygon Mumbai...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC\n");

  // Mock USDC address on Mumbai testnet
  // Replace with actual USDC address: 0x0FA8781a83E46826621b3BC094Ea2A0212e71B23
  const USDC_MUMBAI = process.env.USDC_ADDRESS || "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23";
  
  console.log("USDC Address:", USDC_MUMBAI);
  console.log("Initial Owner:", deployer.address);
  console.log("\nDeploying contract...");

  // Deploy AIPredictionMarket
  const AIPredictionMarket = await ethers.getContractFactory("AIPredictionMarket");
  const market = await AIPredictionMarket.deploy(USDC_MUMBAI, deployer.address);
  
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();

  console.log("\n✅ AIPredictionMarket deployed to:", marketAddress);
  console.log("\n📋 Contract Details:");
  console.log("- USDC Token:", USDC_MUMBAI);
  console.log("- Oracle Address:", deployer.address);
  console.log("- Platform Fee:", "2%");
  console.log("- Min Stake:", "1 USDC");

  console.log("\n🔗 View on PolygonScan:");
  console.log(`https://mumbai.polygonscan.com/address/${marketAddress}`);

  console.log("\n📝 Save these addresses to your .env.local:");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${marketAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${USDC_MUMBAI}`);

  // Wait for confirmations before verification
  console.log("\n⏳ Waiting for block confirmations...");
  await market.deploymentTransaction()?.wait(5);

  console.log("\n✅ Deployment complete!");
  console.log("\n🔍 To verify contract, run:");
  console.log(`npx hardhat verify --network mumbai ${marketAddress} ${USDC_MUMBAI} ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
