/**
 * Script to ingest historical commodity prices from World Bank API
 * 
 * Usage:
 *   pnpm tsx scripts/ingest-historical-prices.ts
 * 
 * This will populate the historical_prices table with 5+ years of data
 * for all supported commodities from the World Bank Pink Sheet database.
 */

import { db } from '../lib/db'
import { historicalPrices } from '../lib/db/schema'
import { eq, and } from 'drizzle-orm'

type CommoditySymbol = 'COFFEE' | 'COCOA' | 'TEA' | 'GOLD' | 'AVOCADO' | 'MACADAMIA' | 'COTTON' | 'CASHEW' | 'RUBBER'

// Map our commodity symbols to World Bank indicator codes
const WORLD_BANK_MAP: Record<CommoditySymbol, string> = {
  'COFFEE': 'PCOFFOTM_USD', // Coffee, Other Mild Arabicas
  'COCOA': 'PCOCO_USD',
  'TEA': 'PTEA_USD',
  'COTTON': 'PCOTTIND_USD',
  'RUBBER': 'PRUBB_USD',
  'GOLD': 'PGOLD_USD',
  'AVOCADO': 'PFRUVT_USD', // Fruit (general proxy)
  'MACADAMIA': 'PNUTS_USD', // Nuts (general proxy)
  'CASHEW': 'PNUTS_USD',
}

const REGIONS = ['AFRICA'] as const
const START_YEAR = 2018
const END_YEAR = 2024

async function fetchWorldBankData(indicator: string, startYear: number, endYear: number) {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?` +
    `format=json&date=${startYear}:${endYear}&per_page=1000`

  console.log(`Fetching: ${url}`)

  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`World Bank HTTP ${response.status}`)
  }

  const data = await response.json()
  
  // World Bank returns [metadata, data]
  if (!data[1] || !Array.isArray(data[1])) {
    throw new Error('Invalid response format from World Bank')
  }

  return data[1].filter((item: any) => item.value !== null)
}

async function ingestCommodity(symbol: CommoditySymbol) {
  const indicator = WORLD_BANK_MAP[symbol]
  
  if (!indicator) {
    console.log(`⚠️  Skipping ${symbol} - no World Bank mapping`)
    return
  }

  console.log(`\n📊 Ingesting ${symbol}...`)

  try {
    const data = await fetchWorldBankData(indicator, START_YEAR, END_YEAR)
    
    if (data.length === 0) {
      console.log(`⚠️  No data returned for ${symbol}`)
      return
    }

    console.log(`   Found ${data.length} data points`)

    let inserted = 0
    let skipped = 0

    for (const point of data) {
      const price = parseFloat(point.value)
      const year = parseInt(point.date)
      const date = new Date(`${year}-01-01`)

      // Check if already exists
      const existing = await db
        .select()
        .from(historicalPrices)
        .where(
          and(
            eq(historicalPrices.commodityId, symbol),
            eq(historicalPrices.date, date)
          )
        )
        .limit(1)

      if (existing.length > 0) {
        skipped++
        continue
      }

      // Insert for each region
      for (const region of REGIONS) {
        await db.insert(historicalPrices).values({
          commodityId: symbol,
          price,
          date,
          source: 'World Bank',
          region,
        })
      }

      inserted++
    }

    console.log(`   ✅ Inserted ${inserted} new records (${skipped} already existed)`)
  } catch (error) {
    console.error(`   ❌ Error ingesting ${symbol}:`, error)
  }

  // Rate limit: wait 500ms between requests to be respectful
  await new Promise(resolve => setTimeout(resolve, 500))
}

async function main() {
  console.log('🚀 Starting historical price ingestion...')
  console.log(`   Period: ${START_YEAR} - ${END_YEAR}`)
  console.log(`   Source: World Bank Commodity Price Data (Pink Sheet)`)
  console.log(`   Regions: ${REGIONS.join(', ')}`)

  const commodities: CommoditySymbol[] = [
    'COFFEE',
    'COCOA',
    'TEA',
    'GOLD',
    'COTTON',
    'RUBBER',
    'AVOCADO',
    'MACADAMIA',
    'CASHEW',
  ]

  for (const commodity of commodities) {
    await ingestCommodity(commodity)
  }

  console.log('\n✅ Historical price ingestion complete!')
  
  // Print summary
  console.log('\n📈 Summary:')
  for (const commodity of commodities) {
    const count = await db
      .select()
      .from(historicalPrices)
      .where(eq(historicalPrices.commodityId, commodity))

    console.log(`   ${commodity}: ${count.length} records`)
  }

  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
