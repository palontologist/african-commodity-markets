import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { Connection, Keypair } from '@solana/web3.js'
import * as Polygon from '@/lib/blockchain/polygon-client'
import * as Solana from '@/lib/blockchain/solana-client'
import * as Unified from '@/lib/blockchain/unified-client'
import { getServerSigner } from '@/lib/blockchain/server'
import { getLivePrice } from '@/lib/live-prices'
import type { CommoditySymbol } from '@/lib/live-prices'

/**
 * Multi-Chain Oracle Resolution Service
 * Automatically resolves predictions when target date is reached
 * Supports both Polygon and Solana chains
 * 
 * GET /api/oracle/resolve - Resolve all expired predictions on both chains
 * GET /api/oracle/resolve?chain=polygon&predictionId=123 - Resolve specific prediction
 * POST /api/oracle/resolve - Manually resolve with { chain, predictionId/marketId, commodity }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const predictionIdParam = searchParams.get('predictionId')
    const marketIdParam = searchParams.get('marketId')
    const chainParam = searchParams.get('chain') as 'polygon' | 'solana' | null
    const authHeader = request.headers.get('authorization')
    
    // Simple API key authentication for cron jobs
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (predictionIdParam || marketIdParam) {
      // Resolve specific prediction
      const id = predictionIdParam || marketIdParam
      const chain = chainParam || 'polygon' // Default to polygon for backward compatibility
      const result = await resolveOnePrediction(id!, chain)
      return NextResponse.json(result)
    } else {
      // Resolve all expired predictions on both chains
      const results = await resolveExpiredPredictions()
      return NextResponse.json(results)
    }
  } catch (error) {
    console.error('Oracle resolution error:', error)
    return NextResponse.json(
      {
        error: 'Resolution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get Solana oracle wallet from environment
 */
function getSolanaOracleWallet() {
  const keypairSecret = process.env.ORACLE_KEYPAIR
  if (!keypairSecret) {
    throw new Error('ORACLE_KEYPAIR not configured for Solana')
  }
  
  try {
    const keypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(keypairSecret))
    )
    
    return {
      publicKey: keypair.publicKey,
      signTransaction: async (tx: any) => {
        tx.partialSign(keypair)
        return tx
      },
    }
  } catch (error) {
    throw new Error('Invalid ORACLE_KEYPAIR format. Must be a JSON array of numbers.')
  }
}

/**
 * Resolve a specific prediction on either chain
 */
async function resolveOnePrediction(id: string, chain: 'polygon' | 'solana') {
  console.log(`🔍 Resolving ${chain} prediction ${id}...`)
  
  try {
    if (chain === 'polygon') {
      // Polygon resolution
      const predictionId = parseInt(id)
      const prediction = await Polygon.getPrediction(predictionId)
      
      // Check if already resolved
      if (prediction.resolved) {
        return {
          success: false,
          chain,
          predictionId,
          error: 'Already resolved'
        }
      }
      
      // Check if target date has passed
      const targetDate = new Date(Number(prediction.targetDate) * 1000)
      if (targetDate > new Date()) {
        return {
          success: false,
          chain,
          predictionId,
          error: 'Target date not reached',
          targetDate: targetDate.toISOString()
        }
      }
      
      // Fetch actual price from oracle
      const actualPriceData = await getLivePrice(
        prediction.commodity as CommoditySymbol,
        'AFRICA'
      )
      
      // Convert to cents (same format as contract)
      const actualPriceInCents = Math.round(actualPriceData.price * 100)
      
      console.log(`📊 Polygon Prediction ${predictionId}: Actual price ${actualPriceInCents} cents`)
      console.log(`📊 Predicted price: ${prediction.predictedPrice} cents`)
      
      // Resolve on blockchain
      const signer = getServerSigner()
      const txHash = await Polygon.resolvePrediction({
        predictionId,
        actualPrice: actualPriceInCents,
        signer
      })
      
      // Determine outcome
      const predictedPrice = Number(prediction.predictedPrice)
      const tolerance = predictedPrice * 0.05 // 5% tolerance
      const accurate = Math.abs(actualPriceInCents - predictedPrice) <= tolerance
      
      return {
        success: true,
        chain,
        predictionId,
        commodity: prediction.commodity,
        predictedPrice: Number(prediction.predictedPrice) / 100,
        actualPrice: actualPriceInCents / 100,
        accurate,
        txHash,
        source: actualPriceData.source
      }
    } else {
      // Solana resolution
      const marketId = id
      
      // Note: Solana markets need commodity parameter
      // For now, we'll need to pass it or fetch from market state
      // This is a placeholder - you'll need to enhance this
      const commodity = 'COFFEE' // TODO: Fetch from market state
      
      const wallet = getSolanaOracleWallet()
      
      const txHash = await Solana.resolveSolanaMarket({
        marketId,
        commodity,
        wallet,
      })
      
      console.log(`✅ Solana market ${marketId} resolved`)
      
      return {
        success: true,
        chain,
        marketId,
        commodity,
        txHash,
      }
    }
  } catch (error) {
    console.error(`Failed to resolve ${chain} prediction ${id}:`, error)
    return {
      success: false,
      chain,
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Resolve all expired predictions on both chains
 */
async function resolveExpiredPredictions() {
  console.log('🔍 Searching for expired predictions on both chains...')
  
  const results: any[] = []
  const now = Date.now() / 1000 // Current time in seconds
  
  // Resolve Polygon predictions
  console.log('📍 Checking Polygon predictions...')
  for (let predictionId = 0; predictionId < 100; predictionId++) {
    try {
      const prediction = await Polygon.getPrediction(predictionId)
      
      // Skip if already resolved
      if (prediction.resolved) continue
      
      // Skip if target date not reached
      const targetDate = Number(prediction.targetDate)
      if (targetDate > now) continue
      
      // Resolve this prediction
      const result = await resolveOnePrediction(String(predictionId), 'polygon')
      results.push(result)
      
      // Rate limit to avoid overwhelming the blockchain
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      // Prediction doesn't exist, stop checking
      if (error instanceof Error && error.message.includes('does not exist')) {
        break
      }
    }
  }
  
  // TODO: Resolve Solana predictions
  // Need to implement market indexing or maintain database of active markets
  console.log('⏳ Solana prediction resolution coming soon (need market indexing)')
  
  return {
    success: true,
    totalResolved: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    chains: {
      polygon: results.filter(r => r.chain === 'polygon').length,
      solana: results.filter(r => r.chain === 'solana').length,
    },
    results
  }
}

/**
 * POST endpoint to manually trigger resolution
 * Supports both Polygon and Solana chains
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chain, predictionId, marketId, commodity } = body
    
    if (!chain) {
      return NextResponse.json(
        { error: 'chain required (polygon or solana)' },
        { status: 400 }
      )
    }
    
    const id = predictionId || marketId
    if (!id) {
      return NextResponse.json(
        { error: 'predictionId (Polygon) or marketId (Solana) required' },
        { status: 400 }
      )
    }
    
    if (chain === 'solana' && !commodity) {
      return NextResponse.json(
        { error: 'commodity required for Solana resolution' },
        { status: 400 }
      )
    }
    
    // For manual resolution with POST, we can pass commodity directly
    if (chain === 'solana') {
      try {
        const actualPriceData = await getLivePrice(
          commodity as CommoditySymbol,
          'AFRICA'
        )
        
        const wallet = getSolanaOracleWallet()
        
        const txHash = await Solana.resolveSolanaMarket({
          marketId: id,
          commodity,
          wallet,
        })
        
        return NextResponse.json({
          success: true,
          chain,
          marketId: id,
          commodity,
          actualPrice: actualPriceData.price,
          source: actualPriceData.source,
          txHash,
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Resolution failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        )
      }
    }
    
    const result = await resolveOnePrediction(String(id), chain)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Resolution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
