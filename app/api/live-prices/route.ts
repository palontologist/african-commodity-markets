import { NextRequest, NextResponse } from 'next/server'
import { getLivePrice, CommoditySymbol, Region } from '@/lib/live-prices'
import { fetchTridgePrices } from '@/lib/scrapers/tridge-scraper'
import { fetchKAMISPrices } from '@/lib/scrapers/kamis-scraper'
import { db } from '@/lib/db'
import { commodityPrices, commodities, markets } from '@/lib/db/schema'
import { desc, eq, and, gte, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const path = url.pathname
    const searchParams = url.searchParams

    if (path.includes('/oracle/wheat-maize')) {
      return await handleOracleWheatMaize(req)
    }

    if (path.includes('/live-prices')) {
      return await handleLivePrices(req)
    }

    return NextResponse.json(
      { success: false, message: 'Endpoint not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleOracleWheatMaize(req: NextRequest) {
  const url = new URL(req.url)
  const searchParams = url.searchParams

  const commodity = searchParams.get('commodity')
  const source = searchParams.get('source')
  const historical = searchParams.get('historical') === 'true'

  try {
    let results = []

    if (commodity === 'WHEAT' || !commodity) {
      const wheatData = await getWheatData(source, historical)
      if (wheatData) results.push(wheatData)
    }

    if (commodity === 'MAIZE' || !commodity) {
      const maizeData = await getMaizeData(source, historical)
      if (maizeData) results.push(maizeData)
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No data found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: results,
        cached: false,
        lastUpdated: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Oracle wheat-maize error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch oracle data' },
      { status: 500 }
    )
  }
}

async function fetchHistoricalPrices(commodityCode: string, days: number = 365) {
  if (!db) return []
  try {
    const records = await db
      .select()
      .from(commodityPrices)
      .innerJoin(commodities, eq(commodityPrices.commodityId, commodities.id))
      .where(
        and(
          eq(commodities.code, commodityCode),
          gte(commodityPrices.priceDate, new Date(Date.now() - days * 24 * 60 * 60 * 1000))
        )
      )
      .orderBy(desc(commodityPrices.priceDate))
      .limit(500)

    return records.map(p => ({
      date: p.commodityPrices.priceDate,
      price: p.commodityPrices.price,
      source: p.commodityPrices.source
    }))
  } catch (error) {
    console.error(`Error fetching historical prices for ${commodityCode}:`, error)
    return []
  }
}

async function savePriceToDb(commodityCode: string, price: number, source: string) {
  if (!db) return
  try {
    const [commodity] = await db
      .select()
      .from(commodities)
      .where(eq(commodities.code, commodityCode))
      .limit(1)

    if (!commodity?.id) return

    const [market] = await db
      .select()
      .from(markets)
      .limit(1)

    if (!market?.id) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await db
      .select()
      .from(commodityPrices)
      .where(
        and(
          eq(commodityPrices.commodityId, commodity.id),
          gte(commodityPrices.priceDate, today)
        )
      )
      .limit(1)

    if (existing.length > 0) return

    await db.insert(commodityPrices).values({
      commodityId: commodity.id,
      marketId: market.id,
      price,
      currency: 'USD',
      unit: 'lb',
      priceDate: new Date(),
      source,
    })
  } catch (error) {
    console.error(`Error saving price to DB for ${commodityCode}:`, error)
  }
}

async function handleLivePrices(req: NextRequest) {
  const url = new URL(req.url)
  const searchParams = url.searchParams

  const symbol = searchParams.get('symbol')
  const symbols = searchParams.get('symbols')
  const history = searchParams.get('history') === 'true'
  const period = parseInt(searchParams.get('period') || '365', 10)
  
  let region: Region = 'AFRICA'
  if (searchParams.get('region')) {
    region = searchParams.get('region') as Region
  }

  try {
    let commodityCodes: CommoditySymbol[] = []

    if (symbols) {
      commodityCodes = (symbols.split(',') as CommoditySymbol[])
    } else if (symbol) {
      commodityCodes = [symbol as CommoditySymbol]
    } else {
      commodityCodes = ['COFFEE']
    }

    const prices = await Promise.all(
      commodityCodes.map(async (commodity) => {
        try {
          const priceData = await getLivePrice(commodity, region)
          const result: any = { commodity, ...priceData }

          if (history) {
            result.historicalData = await fetchHistoricalPrices(commodity, period)
          }

          await savePriceToDb(commodity, priceData.price, priceData.source)

          return result
        } catch (error) {
          console.error(`Error fetching ${commodity}:`, error)
          return null
        }
      })
    )

    const validPrices = prices.filter(price => price !== null)

    if (validPrices.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No price data available' },
        { status: 404 }
      )
    }

    const result = validPrices.length === 1 ? validPrices[0] : { data: validPrices }

    return NextResponse.json(
      {
        success: true,
        ...result,
        cached: false,
        lastUpdated: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Live prices error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch live prices' },
      { status: 500 }
    )
  }
}

async function getWheatData(source?: string | null, historical: boolean = false) {
  try {
    let priceData

    if (source === 'tridge') {
      const tridgeData = await fetchTridgePrices()
      const wheatData = tridgeData.find(d => d.commodity === 'WHEAT')
      if (wheatData) {
        priceData = {
          price: wheatData.price,
          currency: wheatData.currency,
          unit: wheatData.unit,
          timestamp: wheatData.timestamp,
          source: wheatData.source,
          country: wheatData.country,
          region: wheatData.region,
          quality: wheatData.quality,
          variety: wheatData.variety,
          exchange: 'Tridge',
          localPrice: null,
          type: 'wheat'
        }
      }
    } else if (source === 'kamis') {
      const kamisData = await fetchKAMISPrices('WHEAT')
      if (kamisData) {
        priceData = {
          price: kamisData.averageWholesalePrice,
          currency: kamisData.currency,
          unit: kamisData.unit,
          timestamp: kamisData.lastUpdated,
          source: kamisData.markets[0]?.source || 'KAMIS',
          country: 'Kenya',
          region: 'East Africa',
          exchange: 'KAMIS',
          localPrice: {
            price: kamisData.averageWholesalePrice * 154, // Estimated KES rate
            currency: 'KES'
          },
          type: 'wheat'
        }
      }
    } else {
      priceData = await getLivePrice('WHEAT', 'AFRICA')
      priceData.type = 'wheat'
    }

    if (!priceData) {
      return null
    }

    if (historical && db) {
      const historicalPrices = await db
        .select()
        .from(commodityPrices)
        .innerJoin(commodities, eq(commodityPrices.commodityId, commodities.id))
        .where(
          and(
            eq(commodities.code, 'WHEAT'),
            gte(commodityPrices.priceDate, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        )
        .orderBy(desc(commodityPrices.priceDate))
        .limit(30)

      priceData.historicalData = historicalPrices.map(p => ({
        date: p.commodityPrices.priceDate,
        price: p.commodityPrices.price,
        source: p.commodityPrices.source
      }))
    }

    return {
      commodity: 'WHEAT',
      ...priceData,
      cached: false,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting wheat data:', error)
    return null
  }
}

async function getMaizeData(source?: string | null, historical: boolean = false) {
  try {
    let priceData

    if (source === 'tridge') {
      const tridgeData = await fetchTridgePrices()
      const maizeData = tridgeData.find(d => d.commodity === 'MAIZE')
      if (maizeData) {
        priceData = {
          price: maizeData.price,
          currency: maizeData.currency,
          unit: maizeData.unit,
          timestamp: maizeData.timestamp,
          source: maizeData.source,
          country: maizeData.country,
          region: maizeData.region,
          quality: maizeData.quality,
          variety: maizeData.variety,
          exchange: 'Tridge',
          localPrice: null,
          type: 'maize'
        }
      }
    } else if (source === 'kamis') {
      const kamisData = await fetchKAMISPrices('MAIZE')
      if (kamisData) {
        priceData = {
          price: kamisData.averageWholesalePrice,
          currency: kamisData.currency,
          unit: kamisData.unit,
          timestamp: kamisData.lastUpdated,
          source: kamisData.markets[0]?.source || 'KAMIS',
          country: 'Kenya',
          region: 'East Africa',
          exchange: 'KAMIS',
          localPrice: {
            price: kamisData.averageWholesalePrice * 154, // Estimated KES rate
            currency: 'KES'
          },
          type: 'maize'
        }
      }
    } else {
      priceData = await getLivePrice('MAIZE', 'AFRICA')
      priceData.type = 'maize'
    }

    if (!priceData) {
      return null
    }

    if (historical && db) {
      const historicalPrices = await db
        .select()
        .from(commodityPrices)
        .innerJoin(commodities, eq(commodityPrices.commodityId, commodities.id))
        .where(
          and(
            eq(commodities.code, 'MAIZE'),
            gte(commodityPrices.priceDate, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        )
        .orderBy(desc(commodityPrices.priceDate))
        .limit(30)

      priceData.historicalData = historicalPrices.map(p => ({
        date: p.commodityPrices.priceDate,
        price: p.commodityPrices.price,
        source: p.commodityPrices.source
      }))
    }

    return {
      commodity: 'MAIZE',
      ...priceData,
      cached: false,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting maize data:', error)
    return null
  }
}
