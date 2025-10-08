import { NextRequest, NextResponse } from 'next/server'
import { generatePrediction } from '@/lib/agents/agent'

// List of all commodities to generate predictions for
const COMMODITIES = [
  { symbol: 'COFFEE', region: 'AFRICA' },
  { symbol: 'COCOA', region: 'AFRICA' },
  { symbol: 'TEA', region: 'AFRICA' },
  { symbol: 'GOLD', region: 'AFRICA' },
  { symbol: 'AVOCADO', region: 'AFRICA' },
  { symbol: 'MACADAMIA', region: 'AFRICA' },
] as const

type CommoditySymbol = typeof COMMODITIES[number]['symbol']
type Region = typeof COMMODITIES[number]['region']

export const maxDuration = 300 // 5 minutes for Vercel Pro
export const dynamic = 'force-dynamic'

/**
 * Cron endpoint for automated daily insight generation
 * 
 * This endpoint should be called by:
 * 1. Vercel Cron (vercel.json config)
 * 2. External cron services (cron-job.org, EasyCron)
 * 3. GitHub Actions scheduled workflow
 * 
 * Security: Add CRON_SECRET to environment variables
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing CRON_SECRET' },
      { status: 401 }
    )
  }

  console.log('🤖 Starting automated insight generation...')
  
  const results: Array<{
    symbol: string
    region: string
    status: 'success' | 'error'
    predictedPrice?: number
    confidence?: number
    error?: string
    duration?: number
  }> = []

  // Generate predictions for all commodities sequentially
  // (parallel would hit rate limits)
  for (const commodity of COMMODITIES) {
    const commodityStart = Date.now()
    
    try {
      console.log(`📊 Generating prediction for ${commodity.symbol} (${commodity.region})...`)
      
      const priceData = await getLivePrice(
        commodity.symbol as CommoditySymbol,
        commodity.region as Region
      )
      
      const duration = Date.now() - commodityStart
      
      results.push({
        symbol: commodity.symbol,
        region: commodity.region,
        status: 'success',
        predictedPrice: prediction.predictedPrice,
        confidence: prediction.confidence,
        duration
      })
      
      console.log(`✅ ${commodity.symbol}: $${prediction.predictedPrice} (${(prediction.confidence * 100).toFixed(0)}% confidence) - ${duration}ms`)
      
    } catch (error) {
      const duration = Date.now() - commodityStart
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      results.push({
        symbol: commodity.symbol,
        region: commodity.region,
        status: 'error',
        error: errorMessage,
        duration
      })
      
      console.error(`❌ ${commodity.symbol}: ${errorMessage}`)
    }
    
    // Small delay between requests to avoid rate limiting
    if (COMMODITIES.indexOf(commodity) < COMMODITIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  const totalDuration = Date.now() - startTime
  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  console.log(`🎉 Insight generation completed: ${successCount} success, ${errorCount} errors in ${(totalDuration / 1000).toFixed(1)}s`)

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalDuration: `${(totalDuration / 1000).toFixed(1)}s`,
    summary: {
      total: results.length,
      successful: successCount,
      failed: errorCount
    },
    results
  })
}

/**
 * Manual trigger endpoint (POST)
 * Use this for testing or manual regeneration
 */
export async function POST(request: NextRequest) {
  return GET(request)
}
