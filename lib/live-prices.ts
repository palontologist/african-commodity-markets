/**
 * Live Prices Module
 * Provides real-time commodity price data from various sources
 */

import { getTridgePrice as fetchTridgePrice } from './scrapers/tridge-scraper'
import { getKAMISPrice } from './scrapers/kamis-scraper'

export type CommoditySymbol = 'COFFEE' | 'COCOA' | 'COTTON' | 'CASHEW' | 'RUBBER' | 'GOLD' | 'TEA' | 'AVOCADO' | 'MACADAMIA' | 'WHEAT' | 'MAIZE'
export type Region = 'AFRICA' | 'LATAM'

interface PriceData {
  price: number
  currency: string
  timestamp: Date
  source: string
  localPrice?: { price: number; currency: string }
}

// Alpha Vantage commodity function mappings
// Uses COMMODITIES function for actual commodity data
// Note: Not all commodities are available - verified working endpoints only
const ALPHA_VANTAGE_COMMODITIES: Record<string, { 
  function: string
  unit: 'cents_per_lb' | 'dollar_per_mt' | 'usd_per_oz'
  displayUnit: string
}> = {
  'COFFEE': { function: 'COFFEE', unit: 'cents_per_lb', displayUnit: 'USD/lb' },
  'WHEAT': { function: 'WHEAT', unit: 'dollar_per_mt', displayUnit: 'USD/MT' },
  'MAIZE': { function: 'CORN', unit: 'dollar_per_mt', displayUnit: 'USD/MT' },
  'COTTON': { function: 'COTTON', unit: 'cents_per_lb', displayUnit: 'USD/lb' },
  // COCOA not available in Alpha Vantage
  // GOLD uses a different API
}

const WORLD_BANK_MAP: Partial<Record<CommoditySymbol, string>> = {
  'COFFEE': 'PCOFFOTM',   // Coffee, Other Mild Arabicas
  'COCOA': 'PCOCO',       // Cocoa
  'TEA': 'PTEA',          // Tea
  'COTTON': 'PCOTTIND',   // Cotton A Index
  'CASHEW': 'PGNUTS',     // Groundnuts (as proxy)
  'RUBBER': 'PRUBB',      // Rubber
  'GOLD': 'PGOLD',        // Gold
  'AVOCADO': 'PFRUVT',    // Fruits
  'MACADAMIA': 'PNUTS',   // Nuts
  'WHEAT': 'PWHEAMT',     // Wheat
  'MAIZE': 'PMAIZMT'      // Maize (Corn)
}

// Cache for price data (5 minute TTL)
const priceCache = new Map<string, { data: PriceData; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get live price for a commodity
 * Tries multiple sources in order of preference:
 * 1. KAMIS (Kenya local prices) - for Kenya-specific commodities
 * 2. Alpha Vantage (global commodity prices)
 * 3. Tridge (regional prices)
 * 4. World Bank (historical/monthly data)
 * 5. Fallback static prices
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
  
  // Try Tridge for wheat and maize (Kenya-specific data)
  if (symbol === 'WHEAT' || symbol === 'MAIZE') {
    try {
      const price = await getTridgePrice(symbol)
      if (price) {
        priceCache.set(cacheKey, { data: price, expires: Date.now() + CACHE_TTL })
        return price
      }
    } catch (error) {
      console.warn(`Tridge failed for ${symbol}:`, error)
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
  
  // Try gold-specific endpoint
  if (symbol === 'GOLD') {
    try {
      const price = await getGoldPrice()
      if (price) {
        priceCache.set(cacheKey, { data: price, expires: Date.now() + CACHE_TTL })
        return price
      }
    } catch (error) {
      console.warn(`Gold API failed:`, error)
    }
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
    // Use the commodities endpoint
    const url = `https://www.alphavantage.co/query?function=${commodityConfig.function}&interval=monthly&apikey=${apiKey}`
    const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour
    const data = await response.json()
    
    // Check for rate limit message
    if (data['Note'] || data['Information']) {
      console.warn('Alpha Vantage rate limit hit:', data['Note'] || data['Information'])
      return null
    }
    
    // Parse commodity data response
    if (data['data'] && Array.isArray(data['data']) && data['data'].length > 0) {
      const latestData = data['data'][0]
      let price = parseFloat(latestData['value'])
      
      if (!isNaN(price)) {
        // Convert cents to dollars for cents-based commodities
        if (commodityConfig.unit === 'cents_per_lb') {
          price = price / 100 // Convert cents to dollars
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
 * Get gold price from a free gold API
 */
async function getGoldPrice(): Promise<PriceData | null> {
  try {
    // Use free gold price API
    const response = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU', {
      next: { revalidate: 3600 }
    })
    const data = await response.json()
    
    if (data.rates?.XAU) {
      // XAU rate is per 1 USD, so we need to invert it
      const pricePerOz = 1 / data.rates.XAU
      return {
        price: Math.round(pricePerOz * 100) / 100,
        currency: 'USD',
        timestamp: new Date(),
        source: 'Metal Price API'
      }
    }
  } catch (error) {
    console.error('Gold API error:', error)
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
    // World Bank API endpoint for commodity prices
    // Try to get the most recent data
    const currentYear = new Date().getFullYear()
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=5&date=${currentYear-2}:${currentYear}&mrv=1`
    
    const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour
    const data = await response.json()
    
    if (Array.isArray(data) && data.length > 1 && data[1]?.length > 0) {
      // Find the most recent non-null value
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
 * Get price from Tridge for wheat and maize
 */
async function getTridgePrice(symbol: 'WHEAT' | 'MAIZE'): Promise<PriceData | null> {
  try {
    const tridgeData = await fetchTridgePrice(symbol)
    if (tridgeData) {
      return {
        price: Math.round(tridgeData.price * 100) / 100,
        currency: tridgeData.currency,
        timestamp: tridgeData.timestamp,
        source: tridgeData.source
      }
    }
  } catch (error) {
    console.error(`Tridge API error for ${symbol}:`, error)
  }
  
  return null
}

/**
 * Fallback prices when APIs are unavailable
 * Based on recent market data with proper units
 * 
 * Price Units:
 * - COFFEE: USD per lb
 * - COCOA: USD per metric ton
 * - COTTON: USD per lb
 * - CASHEW: USD per metric ton
 * - RUBBER: USD per kg
 * - GOLD: USD per troy oz
 * - TEA: USD per kg
 * - AVOCADO: USD per kg
 * - MACADAMIA: USD per kg
 * - WHEAT: USD per metric ton
 * - MAIZE: USD per metric ton
 */
function getFallbackPrice(symbol: CommoditySymbol): PriceData {
  const fallbackPrices: Record<CommoditySymbol, number> = {
    'COFFEE': 3.63,       // USD per lb (from Alpha Vantage ~363 cents/lb)
    'COCOA': 8500,        // USD per metric ton (recent highs)
    'COTTON': 0.78,       // USD per lb (from Alpha Vantage ~78 cents/lb)
    'CASHEW': 1450,       // USD per metric ton
    'RUBBER': 1.65,       // USD per kg
    'GOLD': 2340,         // USD per oz (recent 2024 prices)
    'TEA': 3.20,          // USD per kg
    'AVOCADO': 2.80,      // USD per kg
    'MACADAMIA': 14.50,   // USD per kg
    'WHEAT': 173,         // USD per metric ton (from Alpha Vantage)
    'MAIZE': 196          // USD per metric ton (from Alpha Vantage CORN)
  }
  
  console.warn(`Using fallback price for ${symbol}`)
  
  return {
    price: fallbackPrices[symbol],
    currency: 'USD',
    timestamp: new Date(),
    source: 'Fallback (Static)'
  }
}
