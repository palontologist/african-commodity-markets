/**
 * East African Commodity Scrapers
 * Ethiopia ECX, Uganda UCDA, Tanzania TCB
 */

import type { CommoditySymbol } from '../live-prices'

export interface AfricanCommodityPrice {
  symbol: CommoditySymbol
  price: number
  currency: string
  unit: string
  country: string
  countryCode: string
  region: string
  grade?: string
  timestamp: Date
  source: string
  sourceUrl: string
}

// Cache configuration
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes
const cache = new Map<string, { data: AfricanCommodityPrice[]; expires: number }>()

/**
 * Ethiopia ECX Scraper
 * Source: https://www.ecx.com.et
 */
export async function fetchEthiopiaCoffeePrices(): Promise<AfricanCommodityPrice[]> {
  const cacheKey = 'ethiopia-coffee'
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const prices: AfricanCommodityPrice[] = []
    
    // ECX coffee page
    const response = await fetch('https://www.ecx.com.et/Pages/Coffee.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) {
      console.warn(`ECX fetch failed: ${response.status}`)
      return getEthiopiaFallbackData()
    }

    const html = await response.text()

    // Parse coffee prices from ECX
    // Format: Symbol | Average Price (Birr/Feresula)
    const coffeeRegex = /(LU|LW|RW|WW|WH|SB)([A-Z0-9]+)\s+(\d+(?:,\d{3})*(?:\.\d+)?)/g
    let match

    while ((match = coffeeRegex.exec(html)) !== null) {
      const [, type, grade, priceStr] = match
      const price = parseFloat(priceStr.replace(/,/g, ''))
      
      if (price > 0 && price < 100000) { // Sanity check
        const symbol = type.startsWith('L') ? 'COFFEE' : 'COFFEE'
        
        prices.push({
          symbol: 'COFFEE',
          price: price / 100, // Convert to USD/kg approximate
          currency: 'ETB',
          unit: 'kg',
          country: 'Ethiopia',
          countryCode: 'ET',
          region: 'East Africa',
          grade: `${type}${grade}`,
          timestamp: new Date(),
          source: 'ECX',
          sourceUrl: 'https://www.ecx.com.et/Pages/Coffee.aspx',
        })
      }
    }

    if (prices.length > 0) {
      cache.set(cacheKey, { data: prices, expires: Date.now() + CACHE_TTL })
      return prices
    }

    return getEthiopiaFallbackData()
  } catch (error) {
    console.error('Error fetching Ethiopia ECX prices:', error)
    return getEthiopiaFallbackData()
  }
}

function getEthiopiaFallbackData(): AfricanCommodityPrice[] {
  const today = new Date()
  return [
    {
      symbol: 'COFFEE',
      price: 15.97, // Birr/kg → USD/kg (approx)
      currency: 'ETB',
      unit: 'kg',
      country: 'Ethiopia',
      countryCode: 'ET',
      region: 'East Africa',
      grade: 'Local Washed',
      timestamp: today,
      source: 'ECX (Estimated)',
      sourceUrl: 'https://www.ecx.com.et/Pages/Coffee.aspx',
    },
    {
      symbol: 'COFFEE',
      price: 11.49, // Birr/kg → USD/kg (approx)
      currency: 'ETB',
      unit: 'kg',
      country: 'Ethiopia',
      countryCode: 'ET',
      region: 'East Africa',
      grade: 'Local Unwashed',
      timestamp: today,
      source: 'ECX (Estimated)',
      sourceUrl: 'https://www.ecx.com.et/Pages/Coffee.aspx',
    },
  ]
}

/**
 * Uganda UCDA Scraper
 * Source: https://ugandacoffee.go.ug
 */
export async function fetchUgandaCoffeePrices(): Promise<AfricanCommodityPrice[]> {
  const cacheKey = 'uganda-coffee'
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const prices: AfricanCommodityPrice[] = []

    // UCDA main page has daily prices
    const response = await fetch('https://ugandacoffee.go.ug/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    })

    if (!response.ok) {
      console.warn(`UCDA fetch failed: ${response.status}`)
      return getUgandaFallbackData()
    }

    const html = await response.text()

    // Parse daily prices from UCDA
    // Format: Robusta – Screen 18 | 179.22 (US cents/lb)

    // Robusta prices
    const robustaPattern = /Screen\s*18["\s:]+(\d+\.?\d*)/i
    const robustaMatch = html.match(robustaPattern)
    if (robustaMatch) {
      const price = parseFloat(robustaMatch[1])
      prices.push({
        symbol: 'COFFEE',
        price: price / 100, // Convert from cents/lb to USD/lb
        currency: 'USD',
        unit: 'lb',
        country: 'Uganda',
        countryCode: 'UG',
        region: 'East Africa',
        grade: 'Robusta Screen 18',
        timestamp: new Date(),
        source: 'UCDA',
        sourceUrl: 'https://ugandacoffee.go.ug/',
      })
    }

    // Arabica Bugisu prices  
    const arabicaPattern = /Bugisu\s*AA["\s:]+(\d+\.?\d*)/i
    const arabicaMatch = html.match(arabicaPattern)
    if (arabicaMatch) {
      const price = parseFloat(arabicaMatch[1])
      prices.push({
        symbol: 'COFFEE',
        price: price / 100,
        currency: 'USD',
        unit: 'lb',
        country: 'Uganda',
        countryCode: 'UG',
        region: 'East Africa',
        grade: 'Arabica Bugisu AA',
        timestamp: new Date(),
        source: 'UCDA',
        sourceUrl: 'https://ugandacoffee.go.ug/',
      })
    }

    if (prices.length > 0) {
      cache.set(cacheKey, { data: prices, expires: Date.now() + CACHE_TTL })
      return prices
    }

    return getUgandaFallbackData()
  } catch (error) {
    console.error('Error fetching Uganda UCDA prices:', error)
    return getUgandaFallbackData()
  }
}

function getUgandaFallbackData(): AfricanCommodityPrice[] {
  const today = new Date()
  return [
    {
      symbol: 'COFFEE',
      price: 2.48, // USD/lb (Feb 2025)
      currency: 'USD',
      unit: 'lb',
      country: 'Uganda',
      countryCode: 'UG',
      region: 'East Africa',
      grade: 'Robusta Screen 18',
      timestamp: today,
      source: 'UCDA (Estimated)',
      sourceUrl: 'https://ugandacoffee.go.ug/',
    },
    {
      symbol: 'COFFEE',
      price: 3.71,
      currency: 'USD',
      unit: 'lb',
      country: 'Uganda',
      countryCode: 'UG',
      region: 'East Africa',
      grade: 'Arabica Bugisu AA',
      timestamp: today,
      source: 'UCDA (Estimated)',
      sourceUrl: 'https://ugandacoffee.go.ug/',
    },
  ]
}

/**
 * Tanzania TCB Scraper
 * Source: https://www.coffee.go.tz
 */
export async function fetchTanzaniaCoffeePrices(): Promise<AfricanCommodityPrice[]> {
  const cacheKey = 'tanzania-coffee'
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const prices: AfricanCommodityPrice[] = []

    // TCB auction prices page
    const response = await fetch('https://www.coffee.go.tz/auction_prices', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    })

    if (!response.ok) {
      console.warn(`TCB fetch failed: ${response.status}`)
      return getTanzaniaFallbackData()
    }

    const html = await response.text()

    // Parse auction prices
    // Arabica: $6.5-6.8/kg, Robusta: $3.7-3.9/kg
    const arabicaPattern = /Arabica\s*[-\s]+Kahawa\s*Safi["\s:]*\$?(\d+\.?\d*)/i
    const robustaPattern = /Robusta\s*[-\s]+Kahawa\s*Safi["\s:]*\$?(\d+\.?\d*)/i

    const arabicaMatch = html.match(arabicaPattern)
    if (arabicaMatch) {
      prices.push({
        symbol: 'COFFEE',
        price: parseFloat(arabicaMatch[1]),
        currency: 'USD',
        unit: 'kg',
        country: 'Tanzania',
        countryCode: 'TZ',
        region: 'East Africa',
        grade: 'Arabica Auction',
        timestamp: new Date(),
        source: 'TCB',
        sourceUrl: 'https://www.coffee.go.tz/auction_prices',
      })
    }

    const robustaMatch = html.match(robustaPattern)
    if (robustaMatch) {
      prices.push({
        symbol: 'COFFEE',
        price: parseFloat(robustaMatch[1]),
        currency: 'USD',
        unit: 'kg',
        country: 'Tanzania',
        countryCode: 'TZ',
        region: 'East Africa',
        grade: 'Robusta Auction',
        timestamp: new Date(),
        source: 'TCB',
        sourceUrl: 'https://www.coffee.go.tz/auction_prices',
      })
    }

    if (prices.length > 0) {
      cache.set(cacheKey, { data: prices, expires: Date.now() + CACHE_TTL })
      return prices
    }

    return getTanzaniaFallbackData()
  } catch (error) {
    console.error('Error fetching Tanzania TCB prices:', error)
    return getTanzaniaFallbackData()
  }
}

function getTanzaniaFallbackData(): AfricanCommodityPrice[] {
  const today = new Date()
  return [
    {
      symbol: 'COFFEE',
      price: 6.70, // USD/kg auction average
      currency: 'USD',
      unit: 'kg',
      country: 'Tanzania',
      countryCode: 'TZ',
      region: 'East Africa',
      grade: 'Arabica Auction',
      timestamp: today,
      source: 'TCB (Estimated)',
      sourceUrl: 'https://www.coffee.go.tz/auction_prices',
    },
    {
      symbol: 'COFFEE',
      price: 3.80,
      currency: 'USD',
      unit: 'kg',
      country: 'Tanzania',
      countryCode: 'TZ',
      region: 'East Africa',
      grade: 'Robusta Auction',
      timestamp: today,
      source: 'TCB (Estimated)',
      sourceUrl: 'https://www.coffee.go.tz/auction_prices',
    },
  ]
}

/**
 * Get all East African coffee prices
 */
export async function getEastAfricanCoffeePrices(): Promise<{
  ethiopia: AfricanCommodityPrice[]
  uganda: AfricanCommodityPrice[]
  tanzania: AfricanCommodityPrice[]
}> {
  const [ethiopia, uganda, tanzania] = await Promise.allSettled([
    fetchEthiopiaCoffeePrices(),
    fetchUgandaCoffeePrices(),
    fetchTanzaniaCoffeePrices(),
  ])

  return {
    ethiopia: ethiopia.status === 'fulfilled' ? ethiopia.value : getEthiopiaFallbackData(),
    uganda: uganda.status === 'fulfilled' ? uganda.value : getUgandaFallbackData(),
    tanzania: tanzania.status === 'fulfilled' ? tanzania.value : getTanzaniaFallbackData(),
  }
}

/**
 * Get coffee prices by country
 */
export async function getCoffeeByCountry(
  country: 'ET' | 'UG' | 'TZ'
): Promise<AfricanCommodityPrice[]> {
  switch (country) {
    case 'ET':
      return fetchEthiopiaCoffeePrices()
    case 'UG':
      return fetchUgandaCoffeePrices()
    case 'TZ':
      return fetchTanzaniaCoffeePrices()
    default:
      return []
  }
}