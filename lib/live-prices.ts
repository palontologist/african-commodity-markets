/**
 * Live Prices Module
 * Provides real-time commodity price data from various sources
 */

import { getKAMISPrice } from './scrapers/kamis-scraper'

export type CommoditySymbol = 'COFFEE'
export type Region = 'AFRICA'

interface PriceData {
  price: number
  currency: string
  timestamp: Date
  source: string
  localPrice?: { price: number; currency: string }
}

// Alpha Vantage commodity function mappings
const ALPHA_VANTAGE_COMMODITIES: Record<string, { 
   function: string
   unit: 'cents_per_lb'
   displayUnit: string
}> = {
   'COFFEE': { function: 'COFFEE', unit: 'cents_per_lb', displayUnit: 'USD/lb' },
}

const WORLD_BANK_MAP: Partial<Record<CommoditySymbol, string>> = {
  'COFFEE': 'PCOFFOTM',
}

// Cache for price data (5 minute TTL)
const priceCache = new Map<string, { data: PriceData; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get live price for Kenya Coffee
 * Tries multiple sources in order of preference:
 * 1. KAMIS (Kenya local prices)
 * 2. Alpha Vantage (global commodity prices)
 * 3. World Bank (historical/monthly data)
 * 4. Fallback static prices
 */
export async function getLivePrice(
  symbol: CommoditySymbol,
  region: Region = 'AFRICA'
): Promise<PriceData> {
  const cacheKey = `${symbol}-${region}`
  
  // Check cache first
  const cached = priceCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  
  // For Africa region, try KAMIS first (Kenya local prices)
  if (region === 'AFRICA') {
    try {
      const kamisPrice = await getKAMISPrice(symbol)
      if (kamisPrice) {
        const priceData: PriceData = {
          price: kamisPrice.price,
          currency: kamisPrice.currency,
          timestamp: kamisPrice.timestamp,
          source: kamisPrice.source,
          localPrice: kamisPrice.localPrice
        }
        priceCache.set(cacheKey, { data: priceData, expires: Date.now() + CACHE_TTL })
        return priceData
      }
    } catch (error) {
      console.warn(`KAMIS failed for ${symbol}:`, error)
    }
  }
  
  // Try Alpha Vantage for supported commodities
  if (process.env.ALPHA_VANTAGE_KEY && ALPHA_VANTAGE_COMMODITIES[symbol]) {
    try {
      const price = await getAlphaVantagePrice(symbol)
      if (price) {
        priceCache.set(cacheKey, { data: price, expires: Date.now() + CACHE_TTL })
        return price
      }
    } catch (error) {
      console.warn(`Alpha Vantage failed for ${symbol}:`, error)
    }
  }
  
  // Try World Bank for all commodities
  try {
    const price = await getWorldBankPrice(symbol)
    if (price) {
      priceCache.set(cacheKey, { data: price, expires: Date.now() + CACHE_TTL })
      return price
    }
  } catch (error) {
    console.warn(`World Bank failed for ${symbol}:`, error)
  }
  
  // Final fallback to cached data or static prices
  if (cached) {
    console.log(`Using stale cache for ${symbol}`)
    return cached.data
  }
  
  return getFallbackPrice(symbol)
}

/**
 * Get price from Alpha Vantage API
 * Uses the COMMODITIES endpoint for real commodity data
 */
async function getAlphaVantagePrice(symbol: CommoditySymbol): Promise<PriceData | null> {
  const apiKey = process.env.ALPHA_VANTAGE_KEY
  if (!apiKey) return null
  
  const commodityConfig = ALPHA_VANTAGE_COMMODITIES[symbol]
  if (!commodityConfig) return null
  
  try {
    const url = `https://www.alphavantage.co/query?function=${commodityConfig.function}&interval=monthly&apikey=${apiKey}`
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const data = await response.json()
    
    if (data['Note'] || data['Information']) {
      console.warn('Alpha Vantage rate limit hit:', data['Note'] || data['Information'])
      return null
    }
    
    if (data['data'] && Array.isArray(data['data']) && data['data'].length > 0) {
      const latestData = data['data'][0]
      let price = parseFloat(latestData['value'])
      
      if (!isNaN(price)) {
        if (commodityConfig.unit === 'cents_per_lb') {
          price = price / 100
        }
        
        return {
          price: Math.round(price * 100) / 100,
          currency: 'USD',
          timestamp: new Date(latestData['date']),
          source: 'Alpha Vantage'
        }
      }
    }
  } catch (error) {
    console.error(`Alpha Vantage API error for ${symbol}:`, error)
  }
  
  return null
}

/**
 * Get price from World Bank Pink Sheet (Commodity Prices)
 */
async function getWorldBankPrice(symbol: CommoditySymbol): Promise<PriceData | null> {
  const indicatorCode = WORLD_BANK_MAP[symbol]
  if (!indicatorCode) return null
  
  try {
    const currentYear = new Date().getFullYear()
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=5&date=${currentYear-2}:${currentYear}&mrv=1`
    
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const data = await response.json()
    
    if (Array.isArray(data) && data.length > 1 && data[1]?.length > 0) {
      for (const entry of data[1]) {
        if (entry.value !== null) {
          return {
            price: Math.round(entry.value * 100) / 100,
            currency: 'USD',
            timestamp: new Date(),
            source: 'World Bank'
          }
        }
      }
    }
  } catch (error) {
    console.error(`World Bank API error for ${symbol}:`, error)
  }
  
  return null
}

/**
 * Fallback prices when APIs are unavailable
 */
function getFallbackPrice(symbol: CommoditySymbol): PriceData {
  const fallbackPrices: Record<CommoditySymbol, number> = {
    'COFFEE': 3.63,
  }
  
  console.warn(`Using fallback price for ${symbol}`)
  
  return {
    price: fallbackPrices[symbol],
    currency: 'USD',
    timestamp: new Date(),
    source: 'Fallback (Static)'
  }
}
