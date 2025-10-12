const { ethers } = require('hardhat')
const fs = require('fs')
const path = require('path')

/**
 * Deploy AfrifuturesBridge contract to Polygon
 *
 * Usage:
 * npx hardhat run scripts/deploy-bridge.js --network polygon-amoy
 */
async function main() {
  console.log('🚀 Deploying Afrifutures Contracts to Polygon...')

  // Get deployer
  const [deployer] = await ethers.getSigners()
  
  if (!deployer) {
    throw new Error('No deployer wallet found. Set DEPLOYER_PRIVATE_KEY in .env.local')
  }
  
  console.log('📝 Deploying with account:', deployer.address)
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('💰 Account balance:', ethers.formatEther(balance), 'MATIC')
  
  if (balance === 0n) {
    throw new Error('Deployer wallet has no MATIC. Get testnet MATIC from https://faucet.polygon.technology/')
  }

  // Contract addresses
  const WORMHOLE_CORE_POLYGON_TESTNET = '0x0CBE91CF822c73C2315FB05100C2F714765d5c20'
  const USDC_POLYGON_TESTNET = process.env.NEXT_PUBLIC_POLYGON_USDC || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'

  // Step 1: Deploy $AFF Token
  let AFF_TOKEN = process.env.NEXT_PUBLIC_AFF_TOKEN_POLYGON
  
  if (!AFF_TOKEN || AFF_TOKEN === ethers.ZeroAddress) {
    console.log('\n📦 Deploying AFF Token...')
    const AFFToken = await ethers.getContractFactory('AFFToken')
    const affToken = await AFFToken.deploy(deployer.address)
    await affToken.waitForDeployment()
    AFF_TOKEN = await affToken.getAddress()
    console.log('✅ AFF Token deployed to:', AFF_TOKEN)
    console.log('   Initial supply: 1,000,000,000 AFF')
  } else {
    console.log('✅ Using existing AFF Token:', AFF_TOKEN)
  }
  
  if (!deployer) {
    throw new Error('❌ No deployer account found. Make sure PRIVATE_KEY is set in .env.local')
  }
  
  // Step 2: Deploy AfrifuturesBridge
  console.log('\n📦 Deploying AfrifuturesBridge...')
  const Bridge = await ethers.getContractFactory('AfrifuturesBridge')
  const bridge = await Bridge.deploy(
    WORMHOLE_CORE_POLYGON_TESTNET,
    USDC_POLYGON_TESTNET,
    AFF_TOKEN
  )

  await bridge.waitForDeployment()
  const bridgeAddress = await bridge.getAddress()

  console.log('✅ AfrifuturesBridge deployed to:', bridgeAddress)

  // Grant roles
  console.log('\n🔐 Setting up roles...')
  const RELAYER_ROLE = await bridge.RELAYER_ROLE()
  const BRIDGE_ADMIN = await bridge.BRIDGE_ADMIN()

  // Grant relayer role to deployer (can be changed later)
  const grantRelayerTx = await bridge.grantRole(RELAYER_ROLE, deployer.address)
  await grantRelayerTx.wait()
  console.log('✅ Granted RELAYER_ROLE to:', deployer.address)

  // Set initial fees
  console.log('\n💵 Setting initial fees...')
  const bridgeFee = ethers.parseEther('0.01') // 0.01 MATIC
  const relayerFee = ethers.parseEther('0.005') // 0.005 MATIC

  const setFeesTx = await bridge.updateFees(bridgeFee, relayerFee)
  await setFeesTx.wait()
  console.log('✅ Bridge fee set to:', ethers.formatEther(bridgeFee), 'MATIC')
  console.log('✅ Relayer fee set to:', ethers.formatEther(relayerFee), 'MATIC')

  // Display summary
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Deployment Complete!')
  console.log('='.repeat(60))
  console.log('\n📋 Contract Addresses:')
  console.log('  Bridge:', bridgeAddress)
  console.log('  Wormhole Core:', WORMHOLE_CORE_POLYGON_TESTNET)
  console.log('  USDC:', USDC_POLYGON_TESTNET)
  console.log('  $AFF Token:', AFF_TOKEN)

  console.log('\n📝 Add to .env.local:')
  console.log(`NEXT_PUBLIC_AFF_TOKEN_POLYGON=${AFF_TOKEN}`)
  console.log(`NEXT_PUBLIC_POLYGON_BRIDGE_CONTRACT=${bridgeAddress}`)

  console.log('\n🔍 Verification Commands:')
  console.log(`npx hardhat verify --network polygon-amoy ${AFF_TOKEN} ${deployer.address}`)
  console.log(`npx hardhat verify --network polygon-amoy ${bridgeAddress} ${WORMHOLE_CORE_POLYGON_TESTNET} ${USDC_POLYGON_TESTNET} ${AFF_TOKEN}`)

  console.log('\n📚 Next Steps:')
  console.log('1. Update .env.local with bridge contract address')
  console.log('2. Deploy Solana bridge program')
  console.log('3. Initialize Solana bridge with Polygon emitter address')
  console.log('4. Test bridge flow on testnet')
  console.log('5. Set up relayer infrastructure')

  // Save deployment info
  const deploymentInfo = {
    network: 'polygon-amoy',
    affToken: AFF_TOKEN,
    bridgeAddress,
    wormholeCore: WORMHOLE_CORE_POLYGON_TESTNET,
    usdc: USDC_POLYGON_TESTNET,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    bridgeFee: ethers.formatEther(bridgeFee),
    relayerFee: ethers.formatEther(relayerFee),
  }

  const deploymentsDir = path.join(__dirname, '..', 'deployments')

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir)
  }

  fs.writeFileSync(
    path.join(deploymentsDir, 'bridge-deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  )

  console.log('\n💾 Deployment info saved to: deployments/bridge-deployment.json')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
