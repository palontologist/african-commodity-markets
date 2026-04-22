const { ethers } = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()
  
  if (!deployer) {
    console.error('❌ No deployer found. Set PRIVATE_KEY in .env.local')
    process.exit(1)
  }
  
  const balance = await ethers.provider.getBalance(deployer.address)
  
  console.log('━'.repeat(60))
  console.log('👤 Deployer Account')
  console.log('━'.repeat(60))
  console.log('Address:', deployer.address)
  console.log('Balance:', ethers.formatEther(balance), 'MATIC')
  
  try {
      const network = await ethers.provider.getNetwork();
      console.log('Network:', network.name)
      console.log('Chain ID:', network.chainId)
  } catch (e) {
      console.log('Network: Unknown (Error fetching)')
  }
  console.log('━'.repeat(60))
  
  if (balance === 0n) {
    console.log('\n⚠️  WARNING: Zero balance!')
    console.log('Get testnet MATIC: https://faucet.polygon.technology/')
    console.log('Select: Polygon Amoy')
    console.log('Enter:', deployer.address)
  } else {
    console.log('\n✅ Wallet is funded and ready!')
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
