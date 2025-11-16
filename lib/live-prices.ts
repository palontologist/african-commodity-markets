/**
 * Live Prices Module
 * Provides real-time commodity price data from various sources
 */

import { getTridgePrice as fetchTridgePrice } from './scrapers/tridge-scraper'

export type CommoditySymbol = 'COFFEE' | 'COCOA' | 'COTTON' | 'CASHEW' | 'RUBBER' | 'GOLD' | 'TEA' | 'AVOCADO' | 'MACADAMIA' | 'WHEAT' | 'MAIZE'
export type Region = 'AFRICA' | 'LATAM'

interface PriceData {
  price: number
  currency: string
  timestamp: Date
  source: string
}

// Map commodity symbols to Alpha Vantage and World Bank codes
const ALPHA_VANTAGE_MAP: Partial<Record<CommoditySymbol, string>> = {
  'COFFEE': 'COFFEE',
  'COCOA': 'COCOA',
  'COTTON': 'COTTON',
  'CASHEW': 'NUTS',      // Use nuts as proxy
  'RUBBER': 'RUBBER',
  'GOLD': 'XAU'          // Gold spot price
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
 * Tries Alpha Vantage first, then Tridge (for wheat/maize), falls back to World Bank, then cache
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
  
  try {
    // Try Alpha Vantage first (free tier: 25 requests/day)
    if (process.env.ALPHA_VANTAGE_KEY) {
      const price = await getAlphaVantagePrice(symbol)
      if (price) {
        priceCache.set(cacheKey, { data: price, expires: Date.now() + CACHE_TTL })
        return price
      }
    }
  } catch (error) {
    console.warn(`Alpha Vantage failed for ${symbol}:`, error)
  }
  
  try {
    // Try Tridge for wheat and maize (Kenya-specific data)
    if (symbol === 'WHEAT' || symbol === 'MAIZE') {
      const price = await getTridgePrice(symbol)
      if (price) {
        priceCache.set(cacheKey, { data: price, expires: Date.now() + CACHE_TTL })
        return price
      }
    }
  } catch (error) {
    console.warn(`Tridge failed for ${symbol}:`, error)
  }
  
  try {
    // Fall back to World Bank (free, no key required)
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
 */
async function getAlphaVantagePrice(symbol: CommoditySymbol): Promise<PriceData | null> {
  const apiKey = process.env.ALPHA_VANTAGE_KEY
  if (!apiKey) return null
  
  const commodityCode = ALPHA_VANTAGE_MAP[symbol]
  
  try {
    // For Gold (XAU), use CURRENCY_EXCHANGE_RATE
    if (symbol === 'GOLD') {
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${apiKey}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data['Realtime Currency Exchange Rate']) {
        const rate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate'])
        return {
          price: Math.round(rate * 100) / 100,
          currency: 'USD',
          timestamp: new Date(),
          source: 'Alpha Vantage'
        }
      }
    } else {
      // For commodities, use TIME_SERIES_DAILY
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${commodityCode}&apikey=${apiKey}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data['Time Series (Daily)']) {
        const latestDate = Object.keys(data['Time Series (Daily)'])[0]
        const latestData = data['Time Series (Daily)'][latestDate]
        const price = parseFloat(latestData['4. close'])
        
        return {
          price: Math.round(price * 100) / 100,
          currency: 'USD',
          timestamp: new Date(),
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
  
  try {
    // World Bank API endpoint for commodity prices
    // Returns monthly data in JSON format
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=1&date=2020:2025`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (Array.isArray(data) && data.length > 1 && data[1]?.length > 0) {
      const latestData = data[1][0]
      const price = latestData.value
      
      if (price) {
        return {
          price: Math.round(price * 100) / 100,
          currency: 'USD',
          timestamp: new Date(),
          source: 'World Bank'
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
 */
function getFallbackPrice(symbol: CommoditySymbol): PriceData {
  const fallbackPrices: Partial<Record<CommoditySymbol, number>> = {
    'COFFEE': 250,      // USD per 60kg bag
    'COCOA': 2500,      // USD per metric ton
    'COTTON': 180,      // USD per 100 lbs
    'CASHEW': 1200,     // USD per metric ton
    'RUBBER': 1800,     // USD per metric ton
    'GOLD': 1950,       // USD per oz
    'TEA': 3.5,         // USD per kg
    'AVOCADO': 2.5,     // USD per kg
    'MACADAMIA': 12,    // USD per kg
    'WHEAT': 280,       // USD per metric ton
    'MAIZE': 220        // USD per metric ton
  }
  
  console.warn(`Using fallback price for ${symbol}`)
  
  return {
    price: fallbackPrices[symbol] || 100,
    currency: 'USD',
    timestamp: new Date(),
    source: 'Fallback (Static)'
  }
}
