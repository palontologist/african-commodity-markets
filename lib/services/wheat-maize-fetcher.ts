/**
 * Wheat and Maize Data Fetching Service
 * Periodically fetches wheat and maize prices from Tridge and stores them in the database
 */

import { getLivePrice } from '@/lib/live-prices'
import { fetchTridgePrices } from '@/lib/scrapers/tridge-scraper'
import { db } from '@/lib/db'
import { commodityPrices, commodities, markets, countries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface FetchResult {
  success: boolean
  commodity: string
  price?: number
  source?: string
  error?: string
}

/**
 * Fetch and store wheat price
 */
export async function fetchAndStoreWheatPrice(): Promise<FetchResult> {
  try {
    const priceData = await getLivePrice('WHEAT', 'AFRICA')
    
    // Get wheat commodity ID
    const wheat = await db
      .select()
      .from(commodities)
      .where(eq(commodities.code, 'WHEAT'))
      .limit(1)
    
    if (!wheat.length) {
      return { success: false, commodity: 'WHEAT', error: 'Wheat commodity not found in database' }
    }
    
    // Get Kenya market (or default market)
    const market = await db
      .select()
      .from(markets)
      .limit(1)
    
    if (!market.length) {
      return { success: false, commodity: 'WHEAT', error: 'No markets found in database' }
    }
    
    // Store price
    await db.insert(commodityPrices).values({
      commodityId: wheat[0].id,
      marketId: market[0].id,
      price: priceData.price,
      currency: priceData.currency,
      unit: 'MT',
      priceDate: priceData.timestamp,
      source: priceData.source,
    })
    
    return {
      success: true,
      commodity: 'WHEAT',
      price: priceData.price,
      source: priceData.source
    }
  } catch (error) {
    console.error('Error fetching/storing wheat price:', error)
    return {
      success: false,
      commodity: 'WHEAT',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Fetch and store maize price
 */
export async function fetchAndStoreMaizePrice(): Promise<FetchResult> {
  try {
    const priceData = await getLivePrice('MAIZE', 'AFRICA')
    
    // Get maize commodity ID
    const maize = await db
      .select()
      .from(commodities)
      .where(eq(commodities.code, 'MAIZE'))
      .limit(1)
    
    if (!maize.length) {
      return { success: false, commodity: 'MAIZE', error: 'Maize commodity not found in database' }
    }
    
    // Get Kenya market (or default market)
    const market = await db
      .select()
      .from(markets)
      .limit(1)
    
    if (!market.length) {
      return { success: false, commodity: 'MAIZE', error: 'No markets found in database' }
    }
    
    // Store price
    await db.insert(commodityPrices).values({
      commodityId: maize[0].id,
      marketId: market[0].id,
      price: priceData.price,
      currency: priceData.currency,
      unit: 'MT',
      priceDate: priceData.timestamp,
      source: priceData.source,
    })
    
    return {
      success: true,
      commodity: 'MAIZE',
      price: priceData.price,
      source: priceData.source
    }
  } catch (error) {
    console.error('Error fetching/storing maize price:', error)
    return {
      success: false,
      commodity: 'MAIZE',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Fetch and store both wheat and maize prices
 */
export async function fetchAndStorePrices(): Promise<FetchResult[]> {
  const [wheat, maize] = await Promise.allSettled([
    fetchAndStoreWheatPrice(),
    fetchAndStoreMaizePrice(),
  ])
  
  const results: FetchResult[] = []
  
  if (wheat.status === 'fulfilled') {
    results.push(wheat.value)
  } else {
    results.push({
      success: false,
      commodity: 'WHEAT',
      error: wheat.reason?.message || 'Unknown error'
    })
  }
  
  if (maize.status === 'fulfilled') {
    results.push(maize.value)
  } else {
    results.push({
      success: false,
      commodity: 'MAIZE',
      error: maize.reason?.message || 'Unknown error'
    })
  }
  
  return results
}

/**
 * Fetch prices directly from Tridge and store
 */
export async function fetchAndStoreTridgePrices(): Promise<FetchResult[]> {
  try {
    const tridgeData = await fetchTridgePrices()
    const results: FetchResult[] = []
    
    for (const data of tridgeData) {
      try {
        // Get commodity ID
        const commodity = await db
          .select()
          .from(commodities)
          .where(eq(commodities.code, data.commodity))
          .limit(1)
        
        if (!commodity.length) {
          results.push({
            success: false,
            commodity: data.commodity,
            error: 'Commodity not found in database'
          })
          continue
        }
        
        // Get Kenya market
        const kenyaCountry = await db
          .select()
          .from(countries)
          .where(eq(countries.code, 'KE'))
          .limit(1)
        
        if (!kenyaCountry.length) {
          results.push({
            success: false,
            commodity: data.commodity,
            error: 'Kenya not found in database'
          })
          continue
        }
        
        const market = await db
          .select()
          .from(markets)
          .where(eq(markets.countryId, kenyaCountry[0].id))
          .limit(1)
        
        if (!market.length) {
          results.push({
            success: false,
            commodity: data.commodity,
            error: 'No markets found for Kenya'
          })
          continue
        }
        
        // Store price
        await db.insert(commodityPrices).values({
          commodityId: commodity[0].id,
          marketId: market[0].id,
          price: data.price,
          currency: data.currency,
          unit: data.unit,
          priceDate: data.timestamp,
          quality: data.quality || null,
          source: data.source,
        })
        
        results.push({
          success: true,
          commodity: data.commodity,
          price: data.price,
          source: data.source
        })
      } catch (error) {
        results.push({
          success: false,
          commodity: data.commodity,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return results
  } catch (error) {
    console.error('Error fetching Tridge prices:', error)
    return [{
      success: false,
      commodity: 'WHEAT,MAIZE',
      error: error instanceof Error ? error.message : 'Unknown error'
    }]
  }
}
