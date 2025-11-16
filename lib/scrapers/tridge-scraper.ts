/**
 * Tridge Scraper Module
 * Fetches wheat and maize flour prices from Tridge.com for Kenya market
 * Source: https://dir.tridge.com/prices/wheat/KE
 */

import type { CommoditySymbol } from '../live-prices'

export interface TridgePriceData {
  commodity: CommoditySymbol
  price: number
  currency: string
  unit: string
  country: string
  countryCode: string
  region: string
  timestamp: Date
  source: string
  quality?: string
  variety?: string
}

/**
 * Fetch wheat prices from Tridge for Kenya
 */
export async function fetchTridgeWheatPrice(): Promise<TridgePriceData | null> {
  try {
    const url = 'https://dir.tridge.com/prices/wheat/KE'
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    if (!response.ok) {
      console.error(`Tridge wheat fetch failed: ${response.status}`)
      return null
    }

    const html = await response.text()
    
    // Parse HTML to extract price data
    // Tridge usually has structured data in their pages
    const priceData = parseTridgeHTML(html, 'WHEAT', 'KE')
    
    return priceData
  } catch (error) {
    console.error('Error fetching Tridge wheat price:', error)
    return null
  }
}

/**
 * Fetch maize prices from Tridge for Kenya
 */
export async function fetchTridgeMaizePrice(): Promise<TridgePriceData | null> {
  try {
    // Tridge uses "corn" or "maize" - try both
    const urls = [
      'https://dir.tridge.com/prices/maize/KE',
      'https://dir.tridge.com/prices/corn/KE'
    ]
    
    for (const url of urls) {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      })

      if (response.ok) {
        const html = await response.text()
        const priceData = parseTridgeHTML(html, 'MAIZE', 'KE')
        if (priceData) {
          return priceData
        }
      }
    }
    
    console.error('Tridge maize fetch failed for all URLs')
    return null
  } catch (error) {
    console.error('Error fetching Tridge maize price:', error)
    return null
  }
}

/**
 * Parse Tridge HTML to extract price information
 * This is a simplified parser - in production you'd use a library like cheerio
 */
function parseTridgeHTML(html: string, commodity: CommoditySymbol, countryCode: string): TridgePriceData | null {
  try {
    // Look for price patterns in the HTML
    // Tridge typically shows prices in USD per MT or kg
    
    // Pattern 1: Look for price in meta tags or structured data
    const priceRegex = /(?:price|value)["']?\s*:\s*["']?(\d+\.?\d*)/i
    const currencyRegex = /(?:currency|curr)["']?\s*:\s*["']?([A-Z]{3})/i
    
    const priceMatch = html.match(priceRegex)
    const currencyMatch = html.match(currencyRegex)
    
    // Pattern 2: Look for price in text content
    const textPriceRegex = /(\d+\.?\d*)\s*(?:USD|KES|usd|kes)\s*(?:per|\/)\s*(?:MT|kg|ton)/i
    const textPriceMatch = html.match(textPriceRegex)
    
    let price: number | null = null
    let currency = 'USD'
    
    if (priceMatch) {
      price = parseFloat(priceMatch[1])
    } else if (textPriceMatch) {
      price = parseFloat(textPriceMatch[1])
    }
    
    if (currencyMatch) {
      currency = currencyMatch[1].toUpperCase()
    }
    
    // If we couldn't parse a price, return null
    if (!price || price === 0) {
      console.warn(`Could not parse price from Tridge for ${commodity}`)
      return null
    }
    
    return {
      commodity,
      price,
      currency,
      unit: 'MT', // Tridge typically uses metric tons
      country: 'Kenya',
      countryCode,
      region: 'East Africa',
      timestamp: new Date(),
      source: 'Tridge',
    }
  } catch (error) {
    console.error('Error parsing Tridge HTML:', error)
    return null
  }
}

/**
 * Fetch both wheat and maize prices from Tridge
 */
export async function fetchTridgePrices(): Promise<TridgePriceData[]> {
  const results: TridgePriceData[] = []
  
  const [wheat, maize] = await Promise.allSettled([
    fetchTridgeWheatPrice(),
    fetchTridgeMaizePrice(),
  ])
  
  if (wheat.status === 'fulfilled' && wheat.value) {
    results.push(wheat.value)
  }
  if (maize.status === 'fulfilled' && maize.value) {
    results.push(maize.value)
  }
  
  return results
}

/**
 * Get Tridge price for a specific commodity
 */
export async function getTridgePrice(commodity: 'WHEAT' | 'MAIZE'): Promise<TridgePriceData | null> {
  if (commodity === 'WHEAT') {
    return fetchTridgeWheatPrice()
  } else if (commodity === 'MAIZE') {
    return fetchTridgeMaizePrice()
  }
  return null
}

/**
 * Get mock data for testing when Tridge is unavailable
 */
export function getMockTridgeData(): TridgePriceData[] {
  return [
    {
      commodity: 'WHEAT',
      price: 285.50,
      currency: 'USD',
      unit: 'MT',
      country: 'Kenya',
      countryCode: 'KE',
      region: 'East Africa',
      timestamp: new Date(),
      source: 'Tridge (Mock)',
      quality: 'Standard',
    },
    {
      commodity: 'MAIZE',
      price: 225.75,
      currency: 'USD',
      unit: 'MT',
      country: 'Kenya',
      countryCode: 'KE',
      region: 'East Africa',
      timestamp: new Date(),
      source: 'Tridge (Mock)',
      quality: 'Yellow Maize',
    },
  ]
}
