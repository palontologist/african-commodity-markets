/**
 * ElizaOS Plugin for Commodity Price Predictions
 * Integrates with Groq LLM to generate price forecasts
 */

import type { Plugin, Action, Memory, State, HandlerCallback, IAgentRuntime } from '@elizaos/core'
import { runGroqChat } from '@/lib/agents/groq-client'
import { buildPredictionPrompt, type PredictionHorizon, type PromptContext } from '@/lib/agents/prompts'
import { getLivePrice, type CommoditySymbol, type Region } from '@/lib/live-prices'
import { insertCommodityPrediction, attachPredictionSignal } from '@/lib/db/predictions'
import { db } from '@/lib/db'
import { commodityPrices } from '@/lib/db/schema'
import { desc, eq, and, gte } from 'drizzle-orm'

interface PredictionResponse {
  predictedPrice: number
  confidence: number
  narrative: string
  signals?: Array<{
    type: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
    strength: number
    reason: string
  }>
}

/**
 * Action: Generate price prediction using Groq LLM
 */
export const predictPriceAction: Action = {
  name: 'PREDICT_COMMODITY_PRICE',
  description: 'Generates a price prediction for a commodity using AI analysis of market factors, historical data, and current trends',
  
  similes: [
    'FORECAST_PRICE',
    'PREDICT_TREND',
    'ANALYZE_FUTURE_PRICE',
    'GENERATE_FORECAST'
  ],
  
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = typeof message.content === 'string'
      ? message.content
      : (message.content as any)?.text || ''
    
    // Check if message is asking for prediction/forecast
    const predictionWords = /predict|forecast|future|outlook|expect|anticipate|projection/i.test(content)
    const commodityMentioned = /cocoa|coffee|tea|gold|avocado|macadamia/i.test(content)
    
    return predictionWords && commodityMentioned
  },
  
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    try {
      // Extract parameters from message
      const content = typeof message.content === 'string'
        ? message.content
        : (message.content as any)?.text || ''
      
      const symbolMatch = content.match(/cocoa|coffee|tea|gold|avocado|macadamia/i)
      const regionMatch = content.match(/africa|latam|latin america/i)
      const horizonMatch = content.match(/short|medium|long|week|month|quarter|year/i)
      
      const symbol = (symbolMatch?.[0].toUpperCase() as CommoditySymbol) ?? 'COFFEE'
      const region: Region = regionMatch?.[0].match(/latam|latin/i) ? 'LATAM' : 'AFRICA'
      
      // Determine horizon
      let horizon: PredictionHorizon = 'SHORT_TERM'
      if (horizonMatch) {
        const h = horizonMatch[0].toLowerCase()
        if (h.includes('long') || h.includes('year')) {
          horizon = 'LONG_TERM'
        } else if (h.includes('medium') || h.includes('quarter') || h.includes('month')) {
          horizon = 'MEDIUM_TERM'
        }
      }
      
      // Fetch current price
      const livePrice = await getLivePrice(symbol, region)
      
      // Fetch historical data for context
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      // Note: Need to join with commodities table to filter by symbol
      // For now, skip without proper commodity ID mapping
      const historicalPrices: any[] = []
      
      // TODO: Implement proper commodity symbol to ID lookup
      // const commodity = await db.select().from(commodities).where(eq(commodities.code, symbol)).limit(1)
      // if (commodity.length > 0) {
      //   historicalPrices = await db.select().from(commodityPrices)
      //     .where(and(
      //       eq(commodityPrices.commodityId, commodity[0].id),
      //       gte(commodityPrices.priceDate, thirtyDaysAgo)
      //     ))
      //     .orderBy(desc(commodityPrices.priceDate))
      //     .limit(30)
      // }
      
      // Calculate historical stats
      let historicalData: PromptContext['historicalData'] | undefined
      if (historicalPrices.length > 0) {
        const prices = historicalPrices.map(p => p.price)
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
        const stdDev = Math.sqrt(variance)
        const volatility = stdDev / avgPrice
        
        const latestPrice = prices[0]
        const oldestPrice = prices[prices.length - 1]
        const percentChange = ((latestPrice - oldestPrice) / oldestPrice) * 100
        
        const trend = percentChange > 5 ? 'UP' : percentChange < -5 ? 'DOWN' : 'STABLE'
        
        historicalData = {
          avgPrice,
          volatility,
          trend
        }
      }
      
      // Build prompt
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
      const prediction: PredictionResponse = JSON.parse(groqResponse.content)
      
      // Store prediction in database
      // TODO: Implement proper commodity symbol to ID lookup
      // For now, use a placeholder ID of 1
      const predictionRecord = await insertCommodityPrediction({
        commodityId: 1, // TODO: Map symbol to actual commodity ID
        region,
        horizon,
        predictedPrice: prediction.predictedPrice,
        currency: 'USD',
        confidence: prediction.confidence,
        narrative: prediction.narrative,
        model: 'mixtral-8x7b-32768',
        asOf: new Date()
      })
      
      const predictionId = predictionRecord.id
      
      // Store signals if provided
      if (prediction.signals && predictionId) {
        for (const signal of prediction.signals) {
          await attachPredictionSignal({
            predictionId,
            signalType: signal.type,
            strength: signal.strength,
            description: signal.reason
          })
        }
      }
      
      const response = {
        text: `${symbol} ${horizon} Prediction (${region}): $${prediction.predictedPrice.toFixed(2)} USD (${(prediction.confidence * 100).toFixed(0)}% confidence)\n\n${prediction.narrative}`,
        data: {
          ...prediction,
          predictionId,
          symbol,
          region,
          horizon,
          currentPrice: livePrice.price
        }
      }
      
      if (callback) {
        callback(response)
      }
      
      return true
    } catch (error) {
      console.error('Error generating prediction:', error)
      if (callback) {
        callback({
          text: 'Failed to generate price prediction',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      return false
    }
  },
  
  examples: [
    [
      {
        user: '{{user1}}',
        content: { text: 'What is your short-term forecast for coffee prices in Africa?' }
      },
      {
        user: '{{agent}}',
        content: {
          text: 'COFFEE SHORT_TERM Prediction (AFRICA): $X.XX USD (85% confidence)\n\nCoffee prices are expected to rise moderately due to reduced yields from drought conditions in Ethiopia and strong European demand.',
          action: 'PREDICT_COMMODITY_PRICE'
        }
      }
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'Can you predict cocoa prices for the next year in Latin America?' }
      },
      {
        user: '{{agent}}',
        content: {
          text: 'COCOA LONG_TERM Prediction (LATAM): $X.XX USD (72% confidence)\n\nLong-term outlook suggests stable to slightly declining prices as new plantations in Ecuador mature and Brazilian production increases.',
          action: 'PREDICT_COMMODITY_PRICE'
        }
      }
    ]
  ]
}

/**
 * Commodity Prediction Plugin
 */
export const commodityPredictionPlugin: Plugin = {
  name: 'commodityPrediction',
  description: 'Generates AI-powered price predictions for commodities using Groq LLM and historical market data',
  
  actions: [predictPriceAction],
  
  providers: [],
  
  evaluators: [],
  
  services: []
}

export default commodityPredictionPlugin
