#!/usr/bin/env tsx

/**
 * Example script demonstrating wheat and maize oracle integration
 * Run with: npx tsx scripts/wheat-maize-example.ts
 */

import { getLivePrice } from '../lib/live-prices'
import { fetchTridgePrices, getMockTridgeData } from '../lib/scrapers/tridge-scraper'

async function main() {
  console.log('🌾 Wheat and Maize Oracle Integration Example\n')
  
  // Example 1: Get wheat and maize prices using the new API endpoints
  console.log('1️⃣ Fetching wheat and maize prices from API endpoints...')
  try {
    const response = await fetch('http://localhost:3000/api/oracle/wheat-maize')
    const data = await response.json()
    
    if (data.success && data.data.length > 0) {
      console.log('   ✅ Wheat and Maize Prices:')
      data.data.forEach(price => {
        console.log(`      ${price.commodity}:`)
        console.log(`         Price: ${price.price} ${price.currency}`)
        console.log(`         Source: ${price.source}`)
        console.log(`         Timestamp: ${price.timestamp}`)
        console.log(`         Exchange: ${price.exchange}`)
        console.log(`         Country: ${price.country}`)
      })
    } else {
      console.error('   ❌ API call failed:', data.message)
    }
  } catch (error) {
    console.error('   ❌ Error fetching from API:', error)
  }
  console.log('')
  
  // Example 2: Get individual wheat and maize prices
  console.log('2️⃣ Fetching individual wheat and maize prices...')
  try {
    const wheatResponse = await fetch('http://localhost:3000/api/live-prices?symbol=WHEAT')
    const wheatData = await wheatResponse.json()
    
    const maizeResponse = await fetch('http://localhost:3000/api/live-prices?symbol=MAIZE')
    const maizeData = await maizeResponse.json()
    
    console.log('   ✅ Individual Prices:')
    if (wheatData.success) {
      console.log(`      Wheat: ${wheatData.price} ${wheatData.currency} (${wheatData.source})`)
    }
    if (maizeData.success) {
      console.log(`      Maize: ${maizeData.price} ${maizeData.currency} (${maizeData.source})`)
    }
  } catch (error) {
    console.error('   ❌ Error fetching individual prices:', error)
  }
  console.log('')
  
  // Example 3: Get wheat and maize prices from specific sources
  console.log('3️⃣ Fetching wheat and maize prices from specific sources...')
  try {
    const wheatTridgeResponse = await fetch('http://localhost:3000/api/oracle/wheat-maize?commodity=WHEAT&source=tridge')
    const wheatTridgeData = await wheatTridgeResponse.json()
    
    const maizeTridgeResponse = await fetch('http://localhost:3000/api/oracle/wheat-maize?commodity=MAIZE&source=tridge')
    const maizeTridgeData = await maizeTridgeResponse.json()
    
    console.log('   ✅ Tridge-Specific Prices:')
    if (wheatTridgeData.success) {
      console.log(`      Wheat: ${wheatTridgeData.price} ${wheatTridgeData.currency} (Tridge)`)
    }
    if (maizeTridgeData.success) {
      console.log(`      Maize: ${maizeTridgeData.price} ${maizeTridgeData.currency} (Tridge)`)
    }
  } catch (error) {
    console.error('   ❌ Error fetching Tridge-specific prices:', error)
  }
  console.log('')
  
  // Example 4: Get historical data
  console.log('4️⃣ Fetching historical wheat and maize data...')
  try {
    const wheatHistoricalResponse = await fetch('http://localhost:3000/api/oracle/wheat-maize?commodity=WHEAT&historical=true')
    const wheatHistoricalData = await wheatHistoricalResponse.json()
    
    const maizeHistoricalResponse = await fetch('http://localhost:3000/api/oracle/wheat-maize?commodity=MAIZE&historical=true')
    const maizeHistoricalData = await maizeHistoricalResponse.json()
    
    console.log('   ✅ Historical Data Available:')
    if (wheatHistoricalData.success && wheatHistoricalData.historicalData) {
      console.log(`      Wheat: ${wheatHistoricalData.historicalData.length} historical data points`)
    }
    if (maizeHistoricalData.success && maizeHistoricalData.historicalData) {
      console.log(`      Maize: ${maizeHistoricalData.historicalData.length} historical data points`)
    }
  } catch (error) {
    console.error('   ❌ Error fetching historical data:', error)
  }
  console.log('')
  
  // Example 5: Get multiple commodities at once
  console.log('5️⃣ Batch fetching wheat, maize, and coffee...')
  try {
    const multiResponse = await fetch('http://localhost:3000/api/live-prices?symbols=WHEAT,MAIZE,COFFEE')
    const multiData = await multiResponse.json()
    
    if (multiData.success && Array.isArray(multiData.data)) {
      console.log('   ✅ Batch Results:')
      multiData.data.forEach(item => {
        console.log(`      ${item.commodity}: ${item.price} ${item.currency} (${item.source})`)
      })
    } else if (multiData.success) {
      console.log('   ✅ Batch Results:')
      console.log(`      ${multiData.commodity}: ${multiData.price} ${multiData.currency} (${multiData.source})`)
    }
  } catch (error) {
    console.error('   ❌ Error in batch fetch:', error)
  }
  console.log('')
  
  console.log('✨ Example completed!')
  console.log('\n📖 For more information, see:')
  console.log('   - test-wheat-maize-api.sh for API testing')
  console.log('   - README.md for setup and usage')
  console.log('   - lib/live-prices.ts for implementation details')
  console.log('   - lib/services/wheat-maize-fetcher.ts for data fetching')
}

// Run the example
main().catch(console.error)
