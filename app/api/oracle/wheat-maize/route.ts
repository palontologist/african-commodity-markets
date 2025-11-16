import { NextRequest, NextResponse } from 'next/server'
import { getLivePrice } from '@/lib/live-prices'
import { fetchTridgePrices, getMockTridgeData } from '@/lib/scrapers/tridge-scraper'
import { db } from '@/lib/db'
import { commodityPrices, commodities, markets } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

/**
 * Wheat and Maize Flour Oracle API
 * 
 * GET /api/oracle/wheat-maize - Get current wheat and maize prices
 * GET /api/oracle/wheat-maize?commodity=WHEAT - Get specific commodity
 * GET /api/oracle/wheat-maize?source=tridge - Get data from specific source
 * GET /api/oracle/wheat-maize?historical=true - Get historical data from database
 * POST /api/oracle/wheat-maize - Store price data to database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commodity = searchParams.get('commodity')?.toUpperCase()
    const source = searchParams.get('source')?.toLowerCase()
    const historical = searchParams.get('historical') === 'true'

    // If requesting historical data from database
    if (historical) {
      return getHistoricalPrices(commodity as 'WHEAT' | 'MAIZE' | null)
    }

    // If specific source requested
    if (source === 'tridge') {
      return getTridgeData(commodity as 'WHEAT' | 'MAIZE' | null)
    }

    // Default: Get live prices for wheat and maize
    const commodities = commodity 
      ? [commodity as 'WHEAT' | 'MAIZE']
      : ['WHEAT' as const, 'MAIZE' as const]

    const pricePromises = commodities.map(async (sym) => {
      const priceData = await getLivePrice(sym, 'AFRICA')
      return {
        commodity: sym,
        ...priceData
      }
    })

    const prices = await Promise.all(pricePromises)

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
      sources: ['Alpha Vantage', 'Tridge', 'World Bank', 'Fallback'],
      note: 'Prices automatically fallback through multiple sources'
    })
  } catch (error) {
    console.error('Wheat/Maize oracle error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch wheat/maize prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Store wheat/maize price data to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commodity, price, currency, unit, marketId, quality, source } = body

    if (!commodity || !price || !currency || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields: commodity, price, currency, unit' },
        { status: 400 }
      )
    }

    if (commodity !== 'WHEAT' && commodity !== 'MAIZE') {
      return NextResponse.json(
        { error: 'Invalid commodity. Must be WHEAT or MAIZE' },
        { status: 400 }
      )
    }

    // Get commodity ID from database
    const commodityRecord = await db
      .select()
      .from(commodities)
      .where(eq(commodities.code, commodity))
      .limit(1)

    if (!commodityRecord.length) {
      return NextResponse.json(
        { error: `Commodity ${commodity} not found in database` },
        { status: 404 }
      )
    }

    const commodityId = commodityRecord[0].id

    // Use provided marketId or get default Kenya market
    let resolvedMarketId = marketId
    if (!resolvedMarketId) {
      const kenyaMarket = await db
        .select()
        .from(markets)
        .where(eq(markets.location, 'Nairobi'))
        .limit(1)

      if (kenyaMarket.length) {
        resolvedMarketId = kenyaMarket[0].id
      }
    }

    if (!resolvedMarketId) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      )
    }

    // Insert price data
    const result = await db.insert(commodityPrices).values({
      commodityId,
      marketId: resolvedMarketId,
      price: parseFloat(price),
      currency,
      unit,
      priceDate: new Date(),
      quality: quality || null,
      source: source || 'API',
    }).returning()

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Price data stored successfully'
    })
  } catch (error) {
    console.error('Error storing price data:', error)
    return NextResponse.json(
      {
        error: 'Failed to store price data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get Tridge-specific data
 */
async function getTridgeData(commodity: 'WHEAT' | 'MAIZE' | null) {
  try {
    const useMock = process.env.USE_MOCK_TRIDGE === 'true'
    
    let tridgeData
    if (useMock) {
      tridgeData = getMockTridgeData()
    } else {
      tridgeData = await fetchTridgePrices()
    }

    // Filter by commodity if specified
    const filteredData = commodity
      ? tridgeData.filter(d => d.commodity === commodity)
      : tridgeData

    return NextResponse.json({
      success: true,
      data: filteredData,
      source: 'Tridge',
      timestamp: new Date().toISOString(),
      mock: useMock,
    })
  } catch (error) {
    console.error('Tridge data error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch Tridge data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get historical prices from database
 */
async function getHistoricalPrices(commodity: 'WHEAT' | 'MAIZE' | null) {
  try {
    let query = db
      .select({
        id: commodityPrices.id,
        commodity: commodities.code,
        price: commodityPrices.price,
        currency: commodityPrices.currency,
        unit: commodityPrices.unit,
        priceDate: commodityPrices.priceDate,
        quality: commodityPrices.quality,
        source: commodityPrices.source,
        market: markets.name,
      })
      .from(commodityPrices)
      .innerJoin(commodities, eq(commodityPrices.commodityId, commodities.id))
      .innerJoin(markets, eq(commodityPrices.marketId, markets.id))
      .where(
        commodity 
          ? eq(commodities.code, commodity)
          : and(
              eq(commodities.code, 'WHEAT'),
              eq(commodities.code, 'MAIZE')
            )
      )
      .orderBy(desc(commodityPrices.priceDate))
      .limit(100)

    const results = await query

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      source: 'Database',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Historical data error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch historical data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
