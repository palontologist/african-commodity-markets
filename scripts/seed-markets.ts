/**
 * Seed Markets Script
 * Creates realistic prediction markets on-chain for testing
 */

import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { createPrediction } from '../lib/blockchain/polygon-client'

dotenv.config({ path: '.env.local' })

interface MarketTemplate {
  commodity: string
  currentPrice: number // in cents
  predictedPrice: number // in cents
  daysUntilExpiry: number
  confidence: number // 0-100
  model: string
}

// Realistic market templates based on current commodity prices
const marketTemplates: MarketTemplate[] = [
  {
    commodity: 'COFFEE',
    currentPrice: 250, // $2.50
    predictedPrice: 280, // $2.80
    daysUntilExpiry: 30,
    confidence: 68,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'COFFEE',
    currentPrice: 250,
    predictedPrice: 300, // $3.00
    daysUntilExpiry: 60,
    confidence: 55,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'COCOA',
    currentPrice: 8500, // $85.00
    predictedPrice: 9000, // $90.00
    daysUntilExpiry: 45,
    confidence: 72,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'COCOA',
    currentPrice: 8500,
    predictedPrice: 9500, // $95.00
    daysUntilExpiry: 90,
    confidence: 61,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'COTTON',
    currentPrice: 75, // $0.75
    predictedPrice: 80, // $0.80
    daysUntilExpiry: 30,
    confidence: 64,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'COTTON',
    currentPrice: 75,
    predictedPrice: 85, // $0.85
    daysUntilExpiry: 60,
    confidence: 58,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'GOLD',
    currentPrice: 268000, // $2,680.00
    predictedPrice: 275000, // $2,750.00
    daysUntilExpiry: 45,
    confidence: 70,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'CASHEW',
    currentPrice: 450, // $4.50
    predictedPrice: 480, // $4.80
    daysUntilExpiry: 60,
    confidence: 66,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'RUBBER',
    currentPrice: 180, // $1.80
    predictedPrice: 195, // $1.95
    daysUntilExpiry: 30,
    confidence: 62,
    model: 'qwen/qwen3-32b'
  },
  {
    commodity: 'RUBBER',
    currentPrice: 180,
    predictedPrice: 210, // $2.10
    daysUntilExpiry: 90,
    confidence: 57,
    model: 'qwen/qwen3-32b'
  }
]

async function main() {
  console.log('🌱 Seeding prediction markets...\n')

  // Get private key from environment
  const privateKey = process.env.ADMIN_PRIVATE_KEY || process.env.PRIVATE_KEY
  if (!privateKey) {
    throw new Error('ADMIN_PRIVATE_KEY or PRIVATE_KEY not found in .env.local')
  }

  // Connect to Polygon Amoy testnet
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'
  )
  const signer = new ethers.Wallet(privateKey, provider)
  const address = await signer.getAddress()

  console.log(`📍 Using account: ${address}`)
  console.log(`🔗 Network: Polygon Amoy Testnet\n`)

  // Check balance
  const balance = await provider.getBalance(address)
  console.log(`💰 Balance: ${ethers.formatEther(balance)} MATIC\n`)

  if (balance === 0n) {
    console.log('❌ Insufficient balance. Get test MATIC from: https://faucet.polygon.technology/')
    process.exit(1)
  }

  // Create markets
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < marketTemplates.length; i++) {
    const template = marketTemplates[i]
    
    try {
      console.log(`\n📊 Creating market ${i + 1}/${marketTemplates.length}:`)
      console.log(`   Commodity: ${template.commodity}`)
      console.log(`   Current: $${(template.currentPrice / 100).toFixed(2)}`)
      console.log(`   Target: $${(template.predictedPrice / 100).toFixed(2)}`)
      console.log(`   Expiry: ${template.daysUntilExpiry} days`)
      console.log(`   Confidence: ${template.confidence}%`)

      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + template.daysUntilExpiry)

      const result = await createPrediction({
        commodity: template.commodity,
        currentPrice: template.currentPrice,
        predictedPrice: template.predictedPrice,
        targetDate,
        confidence: template.confidence,
        model: template.model,
        ipfsHash: `ipfs://demo-${i}`, // Mock IPFS hash
        signer
      })

      console.log(`   ✅ Created! ID: ${result.predictionId}`)
      console.log(`   📝 TX: ${result.txHash}`)
      successCount++

      // Wait a bit between transactions
      if (i < marketTemplates.length - 1) {
        console.log('   ⏳ Waiting 3 seconds...')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`)
      failCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 Seeding complete!')
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('='.repeat(50))
  console.log('\n📱 Visit http://localhost:3000 to see the markets!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
