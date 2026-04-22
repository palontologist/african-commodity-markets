const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Mock Bridge (Lite Version)...");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} POL`);

  // Deploy MockBridge
  const MockBridge = await hre.ethers.getContractFactory("MockBridge");
  
  // Use manual gas limit to be safe and cheap
  const bridge = await MockBridge.deploy({ gasLimit: 500000 }); 

  await bridge.waitForDeployment();

  const address = await bridge.getAddress();
  console.log(`\n✅ MockBridge Deployed at: ${address}`);
  console.log("   (Use this address in your frontend for the 'Bridge' button)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
