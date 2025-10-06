/**
 * Simplified Commodity Agent
 * Direct implementation without ElizaOS plugin complexity
 */

import { getLivePrice, type CommoditySymbol, type Region } from '@/lib/live-prices'
import { runGroqChat } from './groq-client'
import {
  buildPredictionPrompt,
  buildPatternAnalysisPrompt,
  buildComparativeAnalysisPrompt,
  type PredictionHorizon,
  type PromptContext
} from './prompts'
import {
  insertCommodityPrediction,
  attachPredictionSignal
} from '@/lib/db/predictions'
import { db } from '@/lib/db'
import { commodities, commodityPrices } from '@/lib/db/schema'
import type { NewCommodityPrediction, NewPredictionSignal } from '@/lib/db/schema'
import { desc, eq, and, gte } from 'drizzle-orm'

interface PredictionRequest {
  symbol: CommoditySymbol
  region: Region
  horizon: PredictionHorizon
  includeHistorical?: boolean
}

interface PredictionResult {
  predictedPrice: number
  confidence: number
  narrative: string
  signals?: Array<{
    type: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
    strength: number
    reason: string
  }>
  currentPrice?: number | null
  predictionId?: number
}

/**
 * Get commodity ID from symbol
 */
async function getCommodityId(symbol: CommoditySymbol): Promise<number> {
  if (!db) throw new Error('Database not initialized')
  
  const [commodity] = await db
    .select()
    .from(commodities)
    .where(eq(commodities.code, symbol))
    .limit(1)
  
  if (!commodity) {
    throw new Error(`Commodity ${symbol} not found in database`)
  }
  
  return commodity.id
}

/**
 * Get historical price data for a commodity
 */
async function getHistoricalPrices(
  commodityId: number,
  days: number = 30
): Promise<Array<{ date: Date; price: number }>> {
  if (!db) return []
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const prices = await db
    .select()
    .from(commodityPrices)
    .where(
      and(
        eq(commodityPrices.commodityId, commodityId),
        gte(commodityPrices.priceDate, cutoffDate)
      )
    )
    .orderBy(desc(commodityPrices.priceDate))
    .limit(days)
  
  return prices.map(p => ({
    date: p.priceDate,
    price: p.price
  }))
}

/**
 * Calculate historical statistics
 */
function calculateHistoricalStats(prices: Array<{ date: Date; price: number }>) {
  if (prices.length === 0) return null
  
  const priceValues = prices.map(p => p.price)
  const avgPrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length
  const variance = priceValues.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / priceValues.length
  const stdDev = Math.sqrt(variance)
  const volatility = stdDev / avgPrice
  
  const latestPrice = priceValues[0]
  const oldestPrice = priceValues[priceValues.length - 1]
  const percentChange = ((latestPrice - oldestPrice) / oldestPrice) * 100
  
  const trend = percentChange > 5 ? 'UP' as const : percentChange < -5 ? 'DOWN' as const : 'STABLE' as const
  
  return {
    avgPrice,
    volatility,
    trend
  }
}

/**
 * Generate a commodity price prediction
 */
export async function generatePrediction(
  request: PredictionRequest
): Promise<PredictionResult> {
  const { symbol, region, horizon, includeHistorical = true } = request
  
  // Get current live price
  const livePrice = await getLivePrice(symbol, region)
  
  // Get commodity ID for database operations
  let commodityId: number
  try {
    commodityId = await getCommodityId(symbol)
  } catch (error) {
    console.warn(`Commodity ${symbol} not in database, using placeholder ID`)
    commodityId = 1 // Fallback ID
  }
  
  // Get historical data if requested
  let historicalData: PromptContext['historicalData'] | undefined
  if (includeHistorical) {
    try {
      const historicalPrices = await getHistoricalPrices(commodityId, 30)
      if (historicalPrices.length > 0) {
        const stats = calculateHistoricalStats(historicalPrices)
        if (stats) {
          historicalData = stats
        }
      }
    } catch (error) {
      console.warn('Failed to fetch historical data:', error)
    }
  }
  
  // Build prediction prompt
  const promptContext: PromptContext = {
    symbol,
    region,
    currentPrice: livePrice.price,
    horizon,
    historicalData
  }
  
  const prompt = buildPredictionPrompt(promptContext)
  
  // Call Groq LLM
  const groqResponse = await runGroqChat({
    prompt,
    temperature: 0.7,
    responseFormat: { type: 'json_object' }
  })
  
  // Parse prediction response
  const prediction = JSON.parse(groqResponse.content) as {
    predictedPrice: number
    confidence: number
    narrative: string
    signals?: Array<{
      type: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
      strength: number
      reason: string
    }>
  }
  
  // Store prediction in database
  let predictionId: number | undefined
  try {
    const predictionRecord = await insertCommodityPrediction({
      commodityId,
      region,
      horizon,
      predictedPrice: prediction.predictedPrice,
      currency: 'USD',
      confidence: prediction.confidence ?? 0.5,
      narrative: prediction.narrative ?? 'No narrative provided',
      model: 'qwen/qwen3-32b',
      asOf: new Date()
    })
    
    predictionId = predictionRecord.id
    
    // Store signals if provided
    if (prediction.signals && predictionId) {
      for (const signal of prediction.signals) {
        await attachPredictionSignal({
          predictionId,
          signalType: signal.type,
          strength: signal.strength ?? 0.5,
          description: signal.reason
        })
      }
    }
  } catch (error) {
    console.error('Failed to store prediction:', error)
  }
  
  return {
    ...prediction,
    currentPrice: livePrice.price,
    predictionId
  }
}

/**
 * Get current price for a commodity
 */
export async function fetchCurrentPrice(
  symbol: CommoditySymbol,
  region: Region
): Promise<{ symbol: CommoditySymbol; price: number | null; currency: string; source: string }> {
  const livePrice = await getLivePrice(symbol, region)
  
  return {
    symbol,
    price: livePrice.price,
    currency: livePrice.currency,
    source: livePrice.source
  }
}

/**
 * Analyze price patterns
 */
export async function analyzePricePattern(
  symbol: CommoditySymbol,
  region: Region,
  days: number = 30
): Promise<{
  trend: 'UP' | 'DOWN' | 'STABLE'
  volatility: number
  avgPrice: number
  analysis: string
}> {
  // Get commodity ID
  const commodityId = await getCommodityId(symbol)
  
  // Get historical prices
  const historicalPrices = await getHistoricalPrices(commodityId, days)
  
  if (historicalPrices.length === 0) {
    throw new Error('No historical data available')
  }
  
  // Build analysis prompt
  const prompt = buildPatternAnalysisPrompt(
    symbol,
    region,
    historicalPrices.map(p => ({
      date: p.date.toISOString().split('T')[0],
      price: p.price
    }))
  )
  
  // Call Groq LLM
  const groqResponse = await runGroqChat({
    prompt,
    temperature: 0.5,
    responseFormat: { type: 'json_object' }
  })
  
  const analysis = JSON.parse(groqResponse.content)
  
  return analysis
}

/**
 * Compare multiple commodities
 */
export async function compareCommodities(
  commodities: Array<{ symbol: CommoditySymbol; region?: Region }>,
  defaultRegion: Region = 'AFRICA'
): Promise<{
  topOpportunity: string
  topOpportunityReason: string
  weakestOutlook: string
  weakestOutlookReason: string
  diversificationAdvice: string
}> {
  // Fetch current prices for all commodities
  const commodityPrices = await Promise.all(
    commodities.map(async c => {
      const region = c.region || defaultRegion
      const livePrice = await getLivePrice(c.symbol, region)
      return {
        symbol: c.symbol,
        currentPrice: livePrice.price
      }
    })
  )
  
  // Build comparative analysis prompt
  const prompt = buildComparativeAnalysisPrompt(commodityPrices, defaultRegion)
  
  // Call Groq LLM
  const groqResponse = await runGroqChat({
    prompt,
    temperature: 0.6,
    responseFormat: { type: 'json_object' }
  })
  
  const comparison = JSON.parse(groqResponse.content)
  
  return comparison
}

export default {
  generatePrediction,
  fetchCurrentPrice,
  analyzePricePattern,
  compareCommodities
}
