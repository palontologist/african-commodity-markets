#!/usr/bin/env tsx

/**
 * Example script demonstrating wheat and maize oracle integration
 * Run with: npx tsx scripts/wheat-maize-example.ts
 */

import { getLivePrice } from '../lib/live-prices'
import { fetchTridgePrices, getMockTridgeData } from '../lib/scrapers/tridge-scraper'

async function main() {
  console.log('🌾 Wheat and Maize Oracle Integration Example\n')
  
  // Example 1: Get wheat price using live-prices (with automatic fallback)
  console.log('1️⃣ Fetching wheat price with automatic source fallback...')
  try {
    const wheatPrice = await getLivePrice('WHEAT', 'AFRICA')
    console.log('   ✅ Wheat Price:')
    console.log(`      Price: ${wheatPrice.price} ${wheatPrice.currency}`)
    console.log(`      Source: ${wheatPrice.source}`)
    console.log(`      Timestamp: ${wheatPrice.timestamp.toISOString()}`)
  } catch (error) {
    console.error('   ❌ Error fetching wheat price:', error)
  }
  console.log('')
  
  // Example 2: Get maize price using live-prices
  console.log('2️⃣ Fetching maize price with automatic source fallback...')
  try {
    const maizePrice = await getLivePrice('MAIZE', 'AFRICA')
    console.log('   ✅ Maize Price:')
    console.log(`      Price: ${maizePrice.price} ${maizePrice.currency}`)
    console.log(`      Source: ${maizePrice.source}`)
    console.log(`      Timestamp: ${maizePrice.timestamp.toISOString()}`)
  } catch (error) {
    console.error('   ❌ Error fetching maize price:', error)
  }
  console.log('')
  
  // Example 3: Fetch directly from Tridge (Kenya market)
  console.log('3️⃣ Fetching prices from Tridge (Kenya market)...')
  try {
    const tridgePrices = await fetchTridgePrices()
    if (tridgePrices.length > 0) {
      console.log('   ✅ Tridge Prices:')
      tridgePrices.forEach(price => {
        console.log(`      ${price.commodity}:`)
        console.log(`         Price: ${price.price} ${price.currency} per ${price.unit}`)
        console.log(`         Country: ${price.country} (${price.countryCode})`)
        console.log(`         Quality: ${price.quality || 'Standard'}`)
        console.log(`         Source: ${price.source}`)
      })
    } else {
      console.log('   ⚠️  No prices returned from Tridge (this is expected if Tridge is unreachable)')
      console.log('   💡 Showing mock data instead...')
      const mockData = getMockTridgeData()
      mockData.forEach(price => {
        console.log(`      ${price.commodity}: ${price.price} ${price.currency} per ${price.unit}`)
      })
    }
  } catch (error) {
    console.error('   ❌ Error fetching Tridge prices:', error)
  }
  console.log('')
  
  // Example 4: Batch fetch multiple commodities
  console.log('4️⃣ Batch fetching multiple commodities...')
  try {
    const commodities = ['WHEAT', 'MAIZE', 'COFFEE'] as const
    const prices = await Promise.all(
      commodities.map(async (commodity) => {
        const price = await getLivePrice(commodity, 'AFRICA')
        return { commodity, ...price }
      })
    )
    
    console.log('   ✅ Batch Results:')
    prices.forEach(({ commodity, price, currency, source }) => {
      console.log(`      ${commodity}: ${price} ${currency} (${source})`)
    })
  } catch (error) {
    console.error('   ❌ Error in batch fetch:', error)
  }
  console.log('')
  
  console.log('✨ Example completed!')
  console.log('\n📖 For more information, see:')
  console.log('   - WHEAT_MAIZE_API_DOCS.md for API documentation')
  console.log('   - README.md for setup and usage')
  console.log('   - lib/live-prices.ts for implementation details')
}

// Run the example
main().catch(console.error)
