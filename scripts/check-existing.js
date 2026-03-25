const { ethers } = require('hardhat')

async function main() {
  const address = '0x5569E5B581f3B998dD81bFa583f91693aF44C14f'
  console.log(`🔍 Checking address: ${address}`)
  
  const code = await ethers.provider.getCode(address)
  
  if (code === '0x') {
    console.log('❌ No contract found at this address.')
  } else {
    console.log('✅ Contract exists! (Bytecode length:', code.length, ')')
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
