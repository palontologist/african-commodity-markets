export type CommoditySymbol =
  | 'COCOA'
  | 'COFFEE'
  | 'TEA'
  | 'GOLD'
  | 'AVOCADO'
  | 'MACADAMIA'

export type Region = 'AFRICA' | 'LATAM'

export interface LivePrice {
  symbol: CommoditySymbol
  price: number | null
  currency: string
  unit?: string
  source: string
  asOf: string
  note?: string
}

export function mapCommodityToTicker(symbol: CommoditySymbol, region: Region): { ticker?: string; unit?: string; currency?: string; note?: string } {
  switch (symbol) {
    case 'COCOA':
      return { ticker: 'CC=F', unit: 'MT', currency: 'USD', note: 'ICE Cocoa futures' }
    case 'COFFEE':
      return { ticker: 'KC=F', unit: 'lb', currency: 'USD', note: 'ICE Coffee futures (Arabica)' }
    case 'GOLD':
      return { ticker: 'GC=F', unit: 'oz', currency: 'USD', note: 'COMEX Gold futures' }
    case 'TEA':
      return { unit: 'kg', currency: region === 'LATAM' ? 'USD' : 'USD', note: 'No direct ticker; using fallback averages' }
    case 'AVOCADO':
      return { unit: 'kg', currency: 'USD', note: 'No direct ticker; using FAO/market average' }
    case 'MACADAMIA':
      return { unit: 'kg', currency: 'USD', note: 'No direct ticker; using industry average' }
    default:
      return {}
  }
}

export async function fetchYahooQuote(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1m`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      // Next.js fetch cache control on server
      next: { revalidate: 30 },
    } as any)
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    const last = result?.meta?.regularMarketPrice ?? result?.meta?.previousClose
    return typeof last === 'number' ? last : null
  } catch {
    return null
  }
}

import type { CommoditySymbol } from './db/schema'
import { db } from './db'
import { historicalPrices } from './db/schema'
import { desc, eq } from 'drizzle-orm'

export type LivePrice = {
  symbol: CommoditySymbol
  price: number
  currency: string
  timestamp: Date
  source: string
}

// Map our commodity symbols to Alpha Vantage commodity codes
const ALPHA_VANTAGE_MAP: Record<string, string> = {
  'COFFEE': 'COFFEE',
  'COCOA': 'COCOA',
  'COTTON': 'COTTON',
  'WHEAT': 'WHEAT',
  'CORN': 'CORN',
  'GOLD': 'XAU', // Gold spot price
  'SUGAR': 'SUGAR',
}

// Map our commodity symbols to World Bank indicator codes
const WORLD_BANK_MAP: Record<string, string> = {
  'COFFEE': 'PCOFFOTM_USD', // Coffee, Other Mild Arabicas
  'COCOA': 'PCOCO_USD',
  'TEA': 'PTEA_USD',
  'COTTON': 'PCOTTIND_USD',
  'RUBBER': 'PRUBB_USD',
  'GOLD': 'PGOLD_USD',
  'WHEAT': 'PWHEAMT_USD',
  'CORN': 'PMAIZMT_USD',
  'AVOCADO': 'PFRUVT_USD', // Fruit (general proxy)
  'MACADAMIA': 'PNUTS_USD', // Nuts (general proxy)
  'CASHEW': 'PNUTS_USD',
}

/**
 * Get live price for a commodity
 * Tries Alpha Vantage first (if API key available), then World Bank, then cached database
 * 
 * @param symbol - Commodity symbol (e.g., 'COFFEE', 'COCOA')
 * @param region - Region for context (not used for price fetching, as commodity prices are global)
 */
export async function getLivePrice(
  symbol: CommoditySymbol,
  region?: string
): Promise<LivePrice> {
  // Note: region parameter is kept for backward compatibility but not used
  // Commodity prices are global, not region-specific
  // Try Alpha Vantage if API key is configured
  if (process.env.ALPHA_VANTAGE_KEY && ALPHA_VANTAGE_MAP[symbol]) {
    try {
      const price = await fetchAlphaVantagePrice(symbol)
      if (price) return price
    } catch (error) {
      console.warn(`Alpha Vantage failed for ${symbol}:`, error)
    }
  }

  // Fallback to World Bank API (free, no key required)
  if (WORLD_BANK_MAP[symbol]) {
    try {
      const price = await fetchWorldBankPrice(symbol)
      if (price) return price
    } catch (error) {
      console.warn(`World Bank API failed for ${symbol}:`, error)
    }
  }

  // Last resort: return cached price from database
  console.warn(`⚠️ Using cached price for ${symbol} - real data unavailable`)
  return await getCachedPrice(symbol)
}

/**
 * Fetch price from Alpha Vantage API
 * Free tier: 25 requests/day
 */
async function fetchAlphaVantagePrice(symbol: CommoditySymbol): Promise<LivePrice | null> {
  const mappedSymbol = ALPHA_VANTAGE_MAP[symbol]
  if (!mappedSymbol) return null

  const url = `https://www.alphavantage.co/query?` +
    `function=COMMODITY&symbol=${mappedSymbol}&` +
    `interval=monthly&apikey=${process.env.ALPHA_VANTAGE_KEY}`

  const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache 1 hour
  
  if (!response.ok) {
    throw new Error(`Alpha Vantage HTTP ${response.status}`)
  }

  const data = await response.json()

  // Check for API limit error
  if (data.Note || data['Error Message']) {
    throw new Error(data.Note || data['Error Message'])
  }

  // Get most recent price from monthly data
  const latestData = data.data?.[0]
  
  if (!latestData?.value) {
    throw new Error('No data returned from Alpha Vantage')
  }

  return {
    symbol,
    price: parseFloat(latestData.value),
    currency: 'USD',
    source: 'Alpha Vantage',
    timestamp: new Date(latestData.date)
  }
}

/**
 * Fetch price from World Bank Commodity Price Data (Pink Sheet)
 * Free API, no key required, monthly data
 */
async function fetchWorldBankPrice(symbol: CommoditySymbol): Promise<LivePrice | null> {
  const indicator = WORLD_BANK_MAP[symbol]
  if (!indicator) return null

  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?` +
    `format=json&date=2024:2025&per_page=1`

  const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache 24 hours
  
  if (!response.ok) {
    throw new Error(`World Bank HTTP ${response.status}`)
  }

  const data = await response.json()
  const latestData = data[1]?.[0]
  
  if (!latestData?.value) {
    throw new Error('No data returned from World Bank')
  }

  return {
    symbol,
    price: parseFloat(latestData.value),
    currency: 'USD',
    source: 'World Bank',
    timestamp: new Date(`${latestData.date}-01-01`) // World Bank uses year format
  }
}

/**
 * Get cached price from database as last resort
 */
async function getCachedPrice(symbol: CommoditySymbol): Promise<LivePrice> {
  try {
    const latestPrice = await db
      .select()
      .from(historicalPrices)
      .where(eq(historicalPrices.commodityId, symbol))
      .orderBy(desc(historicalPrices.date))
      .limit(1)
    
    if (latestPrice.length > 0) {
      return {
        symbol,
        price: latestPrice[0].price,
        currency: 'USD',
        source: 'Cached (Database)',
        timestamp: new Date(latestPrice[0].date)
      }
    }
  } catch (error) {
    console.error(`Error fetching cached price for ${symbol}:`, error)
  }

  // Absolute fallback: static prices (should rarely reach here)
  const fallbackPrices: Record<CommoditySymbol, number> = {
    'COFFEE': 250,
    'COCOA': 2500,
    'TEA': 3.5,
    'GOLD': 2000,
    'AVOCADO': 2.5,
    'MACADAMIA': 12,
    'COTTON': 85,
    'CASHEW': 3.5,
    'RUBBER': 1.8,
  }

  console.warn(`⚠️ FALLBACK: Using static price for ${symbol}`)

  return {
    symbol,
    price: fallbackPrices[symbol] || 100,
    currency: 'USD',
    source: 'Fallback (Static)',
    timestamp: new Date()
  }
}

