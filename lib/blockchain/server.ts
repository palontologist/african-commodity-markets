/**
 * Server-side blockchain utilities
 * Used by API routes to interact with the blockchain
 */

import { ethers } from 'ethers'
import { createPrediction as createOnChainPrediction } from './polygon-client'

/**
 * Get a server-side signer using the private key from env
 */
export function getServerSigner(): ethers.Wallet {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not configured in environment variables')
  }

  const provider = new ethers.JsonRpcProvider(
    process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'
  )

  return new ethers.Wallet(privateKey, provider)
}

/**
 * Submit a prediction to the blockchain (called from API routes)
 */
export async function submitPredictionToBlockchain({
  commodity,
  currentPrice,
  predictedPrice,
  targetDate,
  confidence,
  model = 'qwen/qwen3-32b'
}: {
  commodity: string
  currentPrice: number // in cents
  predictedPrice: number // in cents
  targetDate: Date
  confidence: number // 0-1 (will be converted to 0-100)
  model?: string
}): Promise<{ predictionId: number; txHash: string } | null> {
  try {
    const signer = getServerSigner()
    
    // Generate a simple IPFS hash placeholder (in production, upload to IPFS first)
    const ipfsHash = ethers.keccak256(
      ethers.toUtf8Bytes(
        JSON.stringify({
          commodity,
          currentPrice,
          predictedPrice,
          targetDate: targetDate.toISOString(),
          timestamp: new Date().toISOString()
        })
      )
    )

    const result = await createOnChainPrediction({
      commodity,
      currentPrice,
      predictedPrice,
      targetDate,
      confidence: confidence * 100, // Convert 0-1 to 0-100
      model,
      ipfsHash,
      signer
    })

    console.log(`✅ Prediction submitted to blockchain: ID ${result.predictionId}, TX ${result.txHash}`)
    return result
  } catch (error) {
    console.error('❌ Failed to submit prediction to blockchain:', error)
    return null
  }
}
