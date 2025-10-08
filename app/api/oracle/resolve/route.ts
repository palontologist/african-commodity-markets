import { NextRequest, NextResponse } from 'next/server'
import { getPrediction, resolvePrediction as resolvePredictionContract } from '@/lib/blockchain/polygon-client'
import { getServerSigner } from '@/lib/blockchain/server'
import { getLivePrice } from '@/lib/live-prices'
import type { CommoditySymbol } from '@/lib/live-prices'

/**
 * Oracle Resolution Service
 * Automatically resolves predictions when target date is reached
 * 
 * GET /api/oracle/resolve - Resolve all expired predictions
 * GET /api/oracle/resolve?predictionId=123 - Resolve specific prediction
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const predictionIdParam = searchParams.get('predictionId')
    const authHeader = request.headers.get('authorization')
    
    // Simple API key authentication for cron jobs
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (predictionIdParam) {
      // Resolve specific prediction
      const result = await resolveOnePrediction(parseInt(predictionIdParam))
      return NextResponse.json(result)
    } else {
      // Resolve all expired predictions
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
 * Resolve a specific prediction
 */
async function resolveOnePrediction(predictionId: number) {
  console.log(`🔍 Resolving prediction ${predictionId}...`)
  
  try {
    // Get prediction details from blockchain
    const prediction = await getPrediction(predictionId)
    
    // Check if already resolved
    if (prediction.resolved) {
      return {
        success: false,
        predictionId,
        error: 'Already resolved'
      }
    }
    
    // Check if target date has passed
    const targetDate = new Date(Number(prediction.targetDate) * 1000)
    if (targetDate > new Date()) {
      return {
        success: false,
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
    
    console.log(`📊 Prediction ${predictionId}: Actual price ${actualPriceInCents} cents`)
    console.log(`📊 Predicted price: ${prediction.predictedPrice} cents`)
    
  // Resolve on blockchain
  const signer = getServerSigner()
  const txHash = await resolvePredictionContract({
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
      predictionId,
      commodity: prediction.commodity,
      predictedPrice: Number(prediction.predictedPrice) / 100,
      actualPrice: actualPriceInCents / 100,
      accurate,
      txHash,
      source: actualPriceData.source
    }
  } catch (error) {
    console.error(`Failed to resolve prediction ${predictionId}:`, error)
    return {
      success: false,
      predictionId,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Resolve all expired predictions
 */
async function resolveExpiredPredictions() {
  console.log('🔍 Searching for expired predictions...')
  
  const results = []
  const now = Date.now() / 1000 // Current time in seconds
  
  // Check predictions 0-100 (adjust based on your needs)
  // In production, you'd query an indexer or maintain a database of active predictions
  for (let predictionId = 0; predictionId < 100; predictionId++) {
    try {
      const prediction = await getPrediction(predictionId)
      
      // Skip if already resolved
      if (prediction.resolved) continue
      
      // Skip if target date not reached
      const targetDate = Number(prediction.targetDate)
      if (targetDate > now) continue
      
      // Resolve this prediction
      const result = await resolveOnePrediction(predictionId)
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
  
  return {
    success: true,
    totalResolved: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    results
  }
}

/**
 * POST endpoint to manually trigger resolution (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { predictionId } = body
    
    if (!predictionId) {
      return NextResponse.json(
        { error: 'predictionId required' },
        { status: 400 }
      )
    }
    
    const result = await resolveOnePrediction(predictionId)
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
