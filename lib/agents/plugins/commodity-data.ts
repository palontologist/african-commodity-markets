/**
 * ElizaOS Plugin for Commodity Data
 * Provides actions and providers for fetching live prices and historical data
 */

import type { Plugin, Action, Provider, Memory, State, HandlerCallback, IAgentRuntime, ActionResult, ProviderResult } from '@elizaos/core'
import { getLivePrice, type CommoditySymbol, type Region } from '@/lib/live-prices'
import { db } from '@/lib/db'
import { commodityPrices } from '@/lib/db/schema'
import { desc, eq, and, gte } from 'drizzle-orm'

/**
 * Action: Fetch current live price for a commodity
 */
export const fetchLivePriceAction: Action = {
  name: 'FETCH_LIVE_PRICE',
  description: 'Fetches the current live price for a specific commodity and region from Yahoo Finance or fallback sources',
  
  similes: [
    'GET_CURRENT_PRICE',
    'CHECK_PRICE',
    'PRICE_LOOKUP',
    'FETCH_QUOTE'
  ],
  
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const content = typeof message.content === 'string' 
      ? message.content 
      : (message.content as any)?.text || ''
    
    // Check if message mentions a commodity
    const commodityMentioned = /cocoa|coffee|tea|gold|avocado|macadamia/i.test(content)
    const priceMentioned = /price|cost|quote|value|trading at/i.test(content)
    
    return commodityMentioned || priceMentioned
  },
  
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<void | ActionResult | undefined> => {
    try {
      // Extract commodity and region from message
      const content = typeof message.content === 'string'
        ? message.content
        : (message.content as any)?.text || ''
      
      const symbolMatch = content.match(/cocoa|coffee|tea|gold|avocado|macadamia/i)
      const regionMatch = content.match(/africa|latam|latin america/i)
      
      const symbol = symbolMatch?.[0].toUpperCase() as CommoditySymbol ?? 'COFFEE'
      const region: Region = regionMatch?.[0].match(/latam|latin/i) ? 'LATAM' : 'AFRICA'
      
      // Fetch live price
      const livePrice = await getLivePrice(symbol, region)
      
      const response = {
        text: `Current ${symbol} price in ${region}: ${livePrice.price !== null ? `$${livePrice.price.toFixed(2)} ${livePrice.currency}` : 'unavailable'} (${livePrice.source})`,
        data: livePrice
      }
      
      if (callback) {
        callback(response)
      }
    } catch (error) {
      console.error('Error fetching live price:', error)
      if (callback) {
        callback({
          text: 'Failed to fetch live price',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  },
  
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'What is the current price of coffee in Africa?' }
      },
      {
        name: '{{agent}}',
        content: { 
          text: 'Current COFFEE price in AFRICA: $X.XX USD (YahooFinance)',
          action: 'FETCH_LIVE_PRICE'
        }
      }
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Check cocoa prices for Latin America' }
      },
      {
        name: '{{agent}}',
        content: { 
          text: 'Current COCOA price in LATAM: $X.XX USD (YahooFinance)',
          action: 'FETCH_LIVE_PRICE'
        }
      }
    ]
  ]
}

/**
 * Provider: Historical commodity price data
 */
export const historicalPriceProvider: Provider = {
  name: 'historicalPrice',
  description: 'Provides historical commodity price data for analysis',
  get: async (runtime: IAgentRuntime, message: Memory, _state?: State): Promise<ProviderResult> => {
    try {
      const content = typeof message.content === 'string'
        ? message.content
        : (message.content as any)?.text || ''
      
      // Extract commodity from message
      const symbolMatch = content.match(/cocoa|coffee|tea|gold|avocado|macadamia/i)
      if (!symbolMatch) {
        return { text: 'No commodity specified' }
      }
      
      const symbol = symbolMatch[0].toUpperCase() as CommoditySymbol
      
      // Fetch last 30 days of prices from database
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      // Note: Need to join with commodities table to filter by symbol
      // For now, skip this without proper commodity ID mapping
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
      
      if (historicalPrices.length === 0) {
        return { text: `No historical price data available for ${symbol}` }
      }
      
      // Calculate statistics
      const prices = historicalPrices.map(p => p.price)
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
      const stdDev = Math.sqrt(variance)
      const volatility = stdDev / avgPrice
      
      const latestPrice = prices[0]
      const oldestPrice = prices[prices.length - 1]
      const priceChange = latestPrice - oldestPrice
      const percentChange = (priceChange / oldestPrice) * 100
      
      const trend = percentChange > 5 ? 'UP' : percentChange < -5 ? 'DOWN' : 'STABLE'
      
      const result = {
        text: `Historical price data for ${symbol}: ${historicalPrices.length} data points over the last 30 days. Average price: $${avgPrice.toFixed(2)}, Volatility: ${(volatility * 100).toFixed(2)}%, Trend: ${trend}, Change: ${percentChange.toFixed(2)}%`,
        data: {
          symbol,
          dataPoints: historicalPrices.length,
          avgPrice: avgPrice.toFixed(2),
          volatility: (volatility * 100).toFixed(2) + '%',
          trend,
          percentChange: percentChange.toFixed(2) + '%',
          latestPrice: latestPrice.toFixed(2),
          priceRange: {
            min: Math.min(...prices).toFixed(2),
            max: Math.max(...prices).toFixed(2)
          }
        }
      }
      
      return result
    } catch (error) {
      console.error('Error fetching historical prices:', error)
      return { text: 'Failed to fetch historical price data' }
    }
  }
}

/**
 * Provider: Market context and metadata
 */
export const marketContextProvider: Provider = {
  name: 'marketContext',
  description: 'Provides market context and metadata for commodity trading regions',
  get: async (_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<ProviderResult> => {
    try {
      const content = typeof message.content === 'string'
        ? message.content
        : (message.content as any)?.text || ''
      
      // Extract region from message
      const regionMatch = content.match(/africa|latam|latin america/i)
      const region: Region = regionMatch?.[0].match(/latam|latin/i) ? 'LATAM' : 'AFRICA'
      
      // Provide contextual information about the region's commodity markets
      const context = {
        AFRICA: {
          majorExports: ['cocoa', 'coffee', 'tea', 'gold', 'avocado', 'macadamia'],
          keyCountries: ['Kenya', 'Ethiopia', 'Côte d\'Ivoire', 'Ghana', 'South Africa', 'Tanzania'],
          marketCharacteristics: 'Strong agricultural base, growing specialty crop exports, infrastructure challenges',
          opportunities: 'Organic certification, direct trade relationships, climate-smart agriculture',
          risks: 'Weather volatility, political instability, logistics costs'
        },
        LATAM: {
          majorExports: ['coffee', 'cocoa', 'avocado', 'gold'],
          keyCountries: ['Brazil', 'Colombia', 'Mexico', 'Peru', 'Ecuador'],
          marketCharacteristics: 'Mature export infrastructure, strong commodity futures markets',
          opportunities: 'Specialty coffee premium, sustainable certifications, established supply chains',
          risks: 'Currency fluctuations, competition from Asia, climate events (frost, drought)'
        }
      }
      
      return {
        text: `Market context for ${region}: ${region === 'AFRICA' ? 'Strong agricultural base with growing specialty crop exports' : 'Mature export infrastructure with established commodity futures markets'}. Key countries: ${context[region].keyCountries.join(', ')}. Major risks: ${context[region].risks}.`,
        data: context[region]
      }
    } catch (error) {
      console.error('Error fetching market context:', error)
      return { text: 'Failed to fetch market context' }
    }
  }
}

/**
 * Commodity Data Plugin
 */
export const commodityDataPlugin: Plugin = {
  name: 'commodityData',
  description: 'Provides real-time and historical commodity price data for African and Latin American markets',
  
  actions: [fetchLivePriceAction],
  
  providers: [historicalPriceProvider, marketContextProvider],
  
  evaluators: [],
  
  services: []
}

export default commodityDataPlugin
