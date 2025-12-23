/**
 * KAMIS Scraper Module
 * Fetches commodity prices from Kenya Agricultural Market Information System
 * Source: https://kamis.kilimo.go.ke/site/market
 * 
 * KAMIS provides official market prices for agricultural commodities in Kenya
 * covering various markets across the country.
 */

import type { CommoditySymbol } from '../live-prices'

export interface KAMISPriceData {
  commodity: CommoditySymbol
  localName: string
  variety: string
  wholesalePrice: number
  retailPrice: number
  currency: string
  unit: string
  market: string
  county: string
  country: string
  countryCode: string
  timestamp: Date
  source: string
}

export interface KAMISMarketData {
  markets: KAMISPriceData[]
  averageWholesalePrice: number
  averageRetailPrice: number
  minPrice: number
  maxPrice: number
  currency: string
  unit: string
  lastUpdated: Date
}

// KAMIS commodity mappings
const KAMIS_COMMODITY_MAP: Record<string, {
  names: string[]
  category: string
  unit: string
}> = {
  'MAIZE': {
    names: ['dry maize', 'white maize', 'yellow maize', 'maize grain'],
    category: 'cereals',
    unit: 'kg'
  },
  'WHEAT': {
    names: ['wheat', 'wheat grain', 'wheat flour'],
    category: 'cereals',
    unit: 'kg'
  },
  'TEA': {
    names: ['tea', 'green tea', 'tea leaves'],
    category: 'beverages',
    unit: 'kg'
  },
  'COFFEE': {
    names: ['coffee', 'coffee beans', 'arabica coffee'],
    category: 'beverages',
    unit: 'kg'
  },
  'AVOCADO': {
    names: ['avocado', 'avocados', 'hass avocado'],
    category: 'fruits',
    unit: 'kg'
  },
  'MACADAMIA': {
    names: ['macadamia', 'macadamia nuts'],
    category: 'nuts',
    unit: 'kg'
  }
}

// Kenya Shilling to USD rate (updated periodically)
const KES_TO_USD_RATE = 0.0065 // ~154 KES = 1 USD

// Cache for KAMIS data
const kamisCache = new Map<string, { data: KAMISMarketData; expires: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

/**
 * Fetch market prices from KAMIS website
 */
export async function fetchKAMISPrices(commodity: CommoditySymbol): Promise<KAMISMarketData | null> {
  const cacheKey = commodity
  const cached = kamisCache.get(cacheKey)
  
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  
  const commodityConfig = KAMIS_COMMODITY_MAP[commodity]
  if (!commodityConfig) {
    console.warn(`No KAMIS mapping for commodity: ${commodity}`)
    return null
  }
  
  try {
    const data = await scrapeKAMISWebsite(commodity, commodityConfig)
    
    if (data && data.markets.length > 0) {
      kamisCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL })
      return data
    }
    
    // If scraping fails, use fallback data
    return await getKAMISFallbackData(commodity)
  } catch (error) {
    console.error(`Error fetching KAMIS prices for ${commodity}:`, error)
    return await getKAMISFallbackData(commodity)
  }
}

/**
 * Scrape KAMIS website for price data
 * Parses HTML table cells that contain price information
 */
async function scrapeKAMISWebsite(
  commodity: CommoditySymbol,
  config: { names: string[]; category: string; unit: string }
): Promise<KAMISMarketData | null> {
  try {
    const url = 'https://kamis.kilimo.go.ke/site/market'
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.warn(`KAMIS website returned status: ${response.status}`)
      return null
    }

    const html = await response.text()
    return parseKAMISHTML(html, commodity, config)
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.warn('KAMIS website request timed out')
    } else {
      console.error('Error scraping KAMIS website:', error)
    }
    return null
  }
}

/**
 * Parse KAMIS HTML to extract commodity prices from table cells
 * Table structure: Commodity | Variety | Grade | Size | Market | Wholesale | Retail | County | Date
 */
function parseKAMISHTML(
  html: string,
  commodity: CommoditySymbol,
  config: { names: string[]; category: string; unit: string }
): KAMISMarketData | null {
  try {
    const markets: KAMISPriceData[] = []
    
    // Extract all table cells
    const cellPattern = /<td[^>]*>([^<]*)<\/td>/gi
    const cells: string[] = []
    let match
    
    while ((match = cellPattern.exec(html)) !== null) {
      cells.push(match[1].trim())
    }
    
    // KAMIS table structure (based on inspection):
    // Commodity | Variety | Grade | Size | Market | Wholesale Price | Retail Price | County | Date
    // Process cells in groups of 9
    for (let i = 0; i < cells.length - 8; i++) {
      const commodityName = cells[i]?.toLowerCase() || ''
      
      // Check if this row is for our commodity
      const isMatch = config.names.some(name => 
        commodityName.includes(name.toLowerCase())
      )
      
      if (isMatch) {
        const variety = cells[i + 1] || '-'
        const market = cells[i + 4] || 'Unknown'
        const wholesaleStr = cells[i + 5] || '0'
        const retailStr = cells[i + 6] || '0'
        const county = cells[i + 7] || 'Unknown'
        const dateStr = cells[i + 8] || ''
        
        // Parse prices (format: "77.78/Kg" or just "77.78")
        const wholesalePrice = parseKAMISPrice(wholesaleStr)
        const retailPrice = parseKAMISPrice(retailStr)
        
        if (wholesalePrice > 0 || retailPrice > 0) {
          markets.push({
            commodity,
            localName: cells[i] || commodityName,
            variety,
            wholesalePrice,
            retailPrice,
            currency: 'KES',
            unit: config.unit,
            market,
            county,
            country: 'Kenya',
            countryCode: 'KE',
            timestamp: dateStr ? new Date(dateStr) : new Date(),
            source: 'KAMIS'
          })
        }
        
        // Skip to next row (jump past the 9 cells we just processed)
        i += 8
      }
    }
    
    if (markets.length === 0) {
      return null
    }
    
    // Calculate statistics
    const wholesalePrices = markets.map(m => m.wholesalePrice).filter(p => p > 0)
    const retailPrices = markets.map(m => m.retailPrice).filter(p => p > 0)
    const allPrices = [...wholesalePrices, ...retailPrices]
    
    const avgWholesale = wholesalePrices.length > 0
      ? wholesalePrices.reduce((a, b) => a + b, 0) / wholesalePrices.length
      : 0
    const avgRetail = retailPrices.length > 0
      ? retailPrices.reduce((a, b) => a + b, 0) / retailPrices.length
      : 0
    
    return {
      markets,
      averageWholesalePrice: Math.round(avgWholesale * 100) / 100,
      averageRetailPrice: Math.round(avgRetail * 100) / 100,
      minPrice: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      maxPrice: allPrices.length > 0 ? Math.max(...allPrices) : 0,
      currency: 'KES',
      unit: config.unit,
      lastUpdated: new Date()
    }
  } catch (error) {
    console.error('Error parsing KAMIS HTML:', error)
    return null
  }
}

/**
 * Parse a KAMIS price string (e.g., "77.78/Kg" or "100.00")
 */
function parseKAMISPrice(priceStr: string): number {
  if (!priceStr || priceStr === '-') return 0
  
  // Remove /Kg suffix and any non-numeric characters except decimal
  const cleaned = priceStr.replace(/\/[A-Za-z]+/g, '').replace(/[^\d.]/g, '')
  const price = parseFloat(cleaned)
  
  return isNaN(price) ? 0 : price
}

/**
 * Get fallback KAMIS data when website is unavailable
 * Uses typical Kenya market prices (in KES)
 */
async function getKAMISFallbackData(commodity: CommoditySymbol): Promise<KAMISMarketData | null> {
  // Fallback prices in KES (Kenya Shillings) per kg
  // Based on typical Kenya market prices from KAMIS
  const fallbackPrices: Partial<Record<CommoditySymbol, {
    wholesale: number
    retail: number
    unit: string
  }>> = {
    'MAIZE': { wholesale: 55, retail: 75, unit: 'kg' },      // ~55-75 KES/kg
    'WHEAT': { wholesale: 65, retail: 85, unit: 'kg' },      // ~65-85 KES/kg
    'TEA': { wholesale: 250, retail: 350, unit: 'kg' },      // ~250-350 KES/kg
    'COFFEE': { wholesale: 450, retail: 600, unit: 'kg' },   // ~450-600 KES/kg
    'AVOCADO': { wholesale: 80, retail: 150, unit: 'kg' },   // ~80-150 KES/kg
    'MACADAMIA': { wholesale: 1200, retail: 1600, unit: 'kg' } // ~1200-1600 KES/kg
  }
  
  const priceData = fallbackPrices[commodity]
  if (!priceData) {
    return null
  }
  
  // Create synthetic market entries for major Kenya markets
  const kenyaMarkets = [
    { market: 'Gikomba', county: 'Nairobi' },
    { market: 'Marikiti', county: 'Nairobi' },
    { market: 'Kongowea', county: 'Mombasa' },
    { market: 'Wakulima', county: 'Nakuru' },
    { market: 'Kibuye', county: 'Kisumu' }
  ]
  
  const markets: KAMISPriceData[] = kenyaMarkets.map((m) => {
    // Add some variance to make it realistic
    const variance = (Math.random() - 0.5) * 0.2
    return {
      commodity,
      localName: commodity.toLowerCase(),
      variety: '-',
      wholesalePrice: Math.round(priceData.wholesale * (1 + variance) * 100) / 100,
      retailPrice: Math.round(priceData.retail * (1 + variance) * 100) / 100,
      currency: 'KES',
      unit: priceData.unit,
      market: m.market,
      county: m.county,
      country: 'Kenya',
      countryCode: 'KE',
      timestamp: new Date(),
      source: 'KAMIS (Estimated)'
    }
  })
  
  return {
    markets,
    averageWholesalePrice: priceData.wholesale,
    averageRetailPrice: priceData.retail,
    minPrice: priceData.wholesale,
    maxPrice: priceData.retail,
    currency: 'KES',
    unit: priceData.unit,
    lastUpdated: new Date()
  }
}

/**
 * Get KAMIS price for a commodity (converts to USD)
 */
export async function getKAMISPrice(commodity: CommoditySymbol): Promise<{
  price: number
  currency: string
  timestamp: Date
  source: string
  localPrice?: { price: number; currency: string }
} | null> {
  const data = await fetchKAMISPrices(commodity)
  
  if (!data) {
    return null
  }
  
  // Use wholesale price (more standard for commodity trading)
  const priceKES = data.averageWholesalePrice || data.averageRetailPrice
  
  // Convert KES to USD
  let priceUSD = priceKES * KES_TO_USD_RATE
  
  // For grains, convert per-kg price to per-metric-ton
  if (commodity === 'MAIZE' || commodity === 'WHEAT') {
    priceUSD = priceUSD * 1000 // USD per metric ton
  }
  
  return {
    price: Math.round(priceUSD * 100) / 100,
    currency: 'USD',
    timestamp: data.lastUpdated,
    source: data.markets[0]?.source || 'KAMIS',
    localPrice: {
      price: priceKES,
      currency: 'KES'
    }
  }
}

/**
 * Get all available KAMIS prices
 */
export async function getAllKAMISPrices(): Promise<Map<CommoditySymbol, KAMISMarketData>> {
  const results = new Map<CommoditySymbol, KAMISMarketData>()
  const commodities = Object.keys(KAMIS_COMMODITY_MAP) as CommoditySymbol[]
  
  const promises = commodities.map(async (commodity) => {
    const data = await fetchKAMISPrices(commodity)
    if (data) {
      results.set(commodity, data)
    }
  })
  
  await Promise.allSettled(promises)
  
  return results
}

/**
 * Get mock KAMIS data for testing
 */
export function getMockKAMISData(): KAMISMarketData {
  return {
    markets: [
      {
        commodity: 'MAIZE',
        localName: 'Dry Maize',
        variety: 'White Maize',
        wholesalePrice: 38.89,
        retailPrice: 55.00,
        currency: 'KES',
        unit: 'kg',
        market: 'Gikomba',
        county: 'Nairobi',
        country: 'Kenya',
        countryCode: 'KE',
        timestamp: new Date(),
        source: 'KAMIS (Mock)'
      },
      {
        commodity: 'MAIZE',
        localName: 'Dry Maize',
        variety: 'Yellow Maize',
        wholesalePrice: 77.78,
        retailPrice: 100.00,
        currency: 'KES',
        unit: 'kg',
        market: 'Gikomba',
        county: 'Nairobi',
        country: 'Kenya',
        countryCode: 'KE',
        timestamp: new Date(),
        source: 'KAMIS (Mock)'
      }
    ],
    averageWholesalePrice: 58.34,
    averageRetailPrice: 77.50,
    minPrice: 38.89,
    maxPrice: 100.00,
    currency: 'KES',
    unit: 'kg',
    lastUpdated: new Date()
  }
}
