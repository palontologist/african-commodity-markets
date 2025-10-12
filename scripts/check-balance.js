const { ethers } = require('hardhat')

async function main() {
  console.log('💰 Checking Wallet Balance...\n')

  try {
    const [deployer] = await ethers.getSigners()
    
    if (!deployer) {
      console.log('❌ No wallet configured')
      console.log('   Set PRIVATE_KEY or DEPLOYER_PRIVATE_KEY in .env.local')
      return
    }

    console.log('📍 Wallet Address:', deployer.address)
    
    // Get MATIC balance
    const balance = await ethers.provider.getBalance(deployer.address)
    const balanceInMatic = ethers.formatEther(balance)
    
    console.log('💵 MATIC Balance:', balanceInMatic, 'MATIC')
    
    // Estimate deployment cost
    const estimatedCost = ethers.parseEther('0.15')
    const estimatedCostInMatic = ethers.formatEther(estimatedCost)
    
    console.log('\n📊 Deployment Estimate:')
    console.log('   Required: ~', estimatedCostInMatic, 'MATIC')
    console.log('   Available:', balanceInMatic, 'MATIC')
    
    if (balance >= estimatedCost) {
      console.log('\n✅ Sufficient balance for deployment')
      console.log('   Run: npx hardhat run scripts/deploy-bridge.js --network polygon-amoy')
    } else {
      const needed = ethers.formatEther(estimatedCost - balance)
      console.log('\n⚠️  Insufficient balance')
      console.log('   Need:', needed, 'more MATIC')
      console.log('\n📝 Get testnet MATIC:')
      console.log('   1. Visit: https://faucet.polygon.technology/')
      console.log('   2. Select: Polygon Amoy Testnet')
      console.log('   3. Enter wallet:', deployer.address)
      console.log('   4. Complete CAPTCHA and click "Send Me MATIC"')
      console.log('\n   Or try: https://www.alchemy.com/faucets/polygon-amoy')
    }
    
    // Check USDC balance
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS
    if (usdcAddress) {
      console.log('\n💵 Checking USDC Balance...')
      const erc20ABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ]
      
      const usdc = new ethers.Contract(usdcAddress, erc20ABI, deployer)
      const usdcBalance = await usdc.balanceOf(deployer.address)
      const usdcDecimals = await usdc.decimals()
      const usdcBalanceFormatted = ethers.formatUnits(usdcBalance, usdcDecimals)
      
      console.log('💵 USDC Balance:', usdcBalanceFormatted, 'USDC')
      
      if (parseFloat(usdcBalanceFormatted) < 10) {
        console.log('\n⚠️  Low USDC balance for testing')
        console.log('   Get test USDC: https://faucet.circle.com/')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
