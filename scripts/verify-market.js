const { ethers } = require('hardhat')

async function main() {
  const address = '0x5569E5B581f3B998dD81bFa583f91693aF44C14f'
  console.log(`🔍 Reading contract at: ${address}`)
  
  // Minimal ABI to check state
  const abi = [
    "function predictionIdCounter() view returns (uint256)",
    "function predictions(uint256) view returns (string commodity, uint256 currentPrice, uint256 predictedPrice, uint256 targetDate, uint256 confidence, string model, bytes32 ipfsHash, uint256 createdAt, bool resolved, uint256 actualPrice, uint256 yesStakes, uint256 noStakes, address creator)"
  ]
  
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology')
  const contract = new ethers.Contract(address, abi, provider)
  
  try {
    const count = await contract.predictionIdCounter()
    console.log(`✅ Connection Successful!`)
    console.log(`📊 Total Predictions Created: ${count.toString()}`)
    
    if (count > 0n) {
      const lastId = count - 1n
      const lastMarket = await contract.predictions(lastId)
      console.log(`\n📝 Last Prediction Details (ID: ${lastId}):`)
      console.log(`   Commodity: "${lastMarket.commodity}"`)
      console.log(`   Current Price: ${lastMarket.currentPrice}`)
      console.log(`   Predicted Price: ${lastMarket.predictedPrice}`)
      console.log(`   Resolved: ${lastMarket.resolved}`)
    } else {
      console.log("\n⚠️ No predictions created yet.")
    }
  } catch (error) {
    console.error("❌ Error reading contract:", error.message)
  }
}

main()