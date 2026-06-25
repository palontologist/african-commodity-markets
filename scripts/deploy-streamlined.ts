/**
 * Deployment Script for Streamlined African Commodity Markets
 * Deploys to Polygon Amoy Testnet
 */

import { ethers } from "hardhat"
import { formatEther, parseUnits } from "ethers"
import fs from 'fs'
import path from 'path'

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy Testnet...")
  
  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log("📝 Deploying contracts with account:", deployer.address)
  
  // Check account balance
  const balance = await deployer.provider.getBalance(deployer.address)
  console.log("💰 Account balance:", formatEther(balance), "MATIC")
  
  try {
    // ============ Contract Addresses on Polygon Amoy ============
    const USDC_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582" // USDC on Amoy
    const NETWORK_ID = 80002 // Polygon Amoy
    
    console.log("\n📋 Deployment Configuration:")
    console.log("Network: Polygon Amoy Testnet (", NETWORK_ID, ")")
    console.log("USDC Address:", USDC_ADDRESS)
    
    // ============ Step 1: Deploy CommodityPriceOracle ============
    console.log("\n🔮 Step 1: Deploying CommodityPriceOracle...")
    const CommodityPriceOracle = await ethers.getContractFactory("CommodityPriceOracle")
    const oracle = await (await CommodityPriceOracle.deploy()).waitForDeployment()
    const oracleDeployTx = await CommodityPriceOracle.deploy()
    await oracleDeployTx.wait()
    
    console.log("✅ CommodityPriceOracle deployed to:", oracle.target)
    console.log("📖 Transaction hash:", oracleDeployTx.hash)
    
    // ============ Step 2: Deploy CommodityPool ============
    console.log("\n💧 Step 2: Deploying CommodityPool...")
    const CommodityPool = await ethers.getContractFactory("CommodityPool")
    const pool = await (await CommodityPool.deploy(USDC_ADDRESS)).waitForDeployment()
    const poolDeployTx = await CommodityPool.deploy(USDC_ADDRESS)
    await poolDeployTx.wait()
    
    console.log("✅ CommodityPool deployed to:", pool.target)
    console.log("📖 Transaction hash:", poolDeployTx.hash)
    
    // ============ Step 3: Deploy PredictionMarketFactory ============
    console.log("\n🏭 Step 3: Deploying PredictionMarketFactory...")
    const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarketFactory")
    const factory = await (await PredictionMarketFactory.deploy(USDC_ADDRESS, oracle.target)).waitForDeployment()
    const factoryDeployTx = await PredictionMarketFactory.deploy(USDC_ADDRESS, oracle.target)
    await factoryDeployTx.wait()
    
    console.log("✅ PredictionMarketFactory deployed to:", factory.target)
    console.log("📖 Transaction hash:", factoryDeployTx.hash)
    
    // ============ Step 4: Setup Oracle and Pool ============
    console.log("\n⚙️  Step 4: Setting up contracts...")
    
    // Authorize factory to update oracle prices
    const authorizeTx = await oracle.authorizeUpdater(factory.address)
    await authorizeTx.wait()
    console.log("✅ Authorized PredictionMarketFactory to update oracle prices")
    
    // Add initial rewards to pool (simulate with small amount)
    const rewardsAmount = parseUnits("100", 6) // 100 USDC
    const addRewardsTx = await pool.addRewards(rewardsAmount)
    await addRewardsTx.wait()
    console.log("✅ Added initial rewards to pool:", formatEther(rewardsAmount), "USDC")
    
    // ============ Step 5: Save Contract Addresses ============
    const deployedAddresses = {
      network: "polygon-amoy",
      chainId: NETWORK_ID,
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        CommodityPriceOracle: oracle.target,
        CommodityPool: pool.target,
        PredictionMarketFactory: factory.target,
        USDC: USDC_ADDRESS
      },
      deploymentTransactions: {
        CommodityPriceOracle: oracleDeployTx.hash,
        CommodityPool: poolDeployTx.hash,
        PredictionMarketFactory: factoryDeployTx.hash
      }
    }
    
    // Save to JSON file
    const deploymentsPath = path.join(__dirname, '../deployments')
    if (!fs.existsSync(deploymentsPath)) {
      fs.mkdirSync(deploymentsPath, { recursive: true })
    }
    
    fs.writeFileSync(
      path.join(deploymentsPath, 'polygon-amoy.json'),
      JSON.stringify(deployedAddresses, null, 2)
    )
    
    console.log("\n💾 Contract addresses saved to:", path.join(deploymentsPath, 'polygon-amoy.json'))
    
    // ============ Step 6: Update Environment Variables ============
    const envUpdates = `
# Contract Addresses - Polygon Amoy Testnet
NEXT_PUBLIC_COMMODITY_PRICE_ORACLE_ADDRESS=${oracle.address}
NEXT_PUBLIC_COMMODITY_POOL_ADDRESS=${pool.address}
NEXT_PUBLIC_PREDICTION_MARKET_FACTORY_ADDRESS=${factory.address}
NEXT_PUBLIC_USDC_ADDRESS=${USDC_ADDRESS}
NEXT_PUBLIC_NETWORK_NAME=polygon-amoy
NEXT_PUBLIC_CHAIN_ID=${NETWORK_ID}

# API Keys (already configured)
ALPHA_VANTAGE_KEY=${process.env.ALPHA_VANTAGE_KEY}
TRADING_ECONOMICS_API_KEY=${process.env.TRADING_ECONOMICS_API_KEY}
`
    
    console.log("\n📝 Environment Variables to add to .env.local:")
    console.log(envUpdates)
    
    // ============ Step 7: Verify Contracts (Manual) ============
    console.log("\n🔍 Contract Verification Instructions:")
    console.log("Please verify the contracts on Polygonscan Amoy:")
    console.log("1. CommodityPriceOracle:", oracle.target)
    console.log("2. CommodityPool:", pool.target) 
    console.log("3. PredictionMarketFactory:", factory.target)
    console.log("\nVerification URL: https://amoy.polygonscan.com/address/" + oracle.target)
    
    // ============ Step 8: Display Summary ============
    console.log("\n🎉 Deployment Summary:")
    console.log("=" .repeat(50))
    console.log("Network: Polygon Amoy Testnet")
    console.log("Deployer:", deployer.address)
    console.log("")
    console.log("Contract Addresses:")
    console.log("├── CommodityPriceOracle:", oracle.target)
    console.log("├── CommodityPool:", pool.target)
    console.log("├── PredictionMarketFactory:", factory.target)
    console.log("└── USDC (Token):", USDC_ADDRESS)
    console.log("")
    console.log("Features Enabled:")
    console.log("✅ Live price feeds from multiple APIs")
    console.log("✅ Commodity prediction markets")
    console.log("✅ USDC liquidity pooling")
    console.log("✅ Automated price resolution")
    console.log("✅ Reward distribution")
    console.log("=" .repeat(50))
    
    console.log("\n📋 Next Steps:")
    console.log("1. Update .env.local with the contract addresses above")
    console.log("2. Verify contracts on Polygonscan Amoy")
    console.log("3. Test frontend integration")
    console.log("4. Create first prediction market for copper prices")
    
  } catch (error) {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })