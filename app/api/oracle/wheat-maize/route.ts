import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const searchParams = url.searchParams

    const commodity = searchParams.get('commodity')
    const source = searchParams.get('source')
    const historical = searchParams.get('historical') === 'true'

    let wheatData = null
    let maizeData = null

    if (!commodity || commodity === 'WHEAT') {
      wheatData = await getWheatData(source, historical)
    }

    if (!commodity || commodity === 'MAIZE') {
      maizeData = await getMaizeData(source, historical)
    }

    const results = []

    if (wheatData) results.push(wheatData)
    if (maizeData) results.push(maizeData)

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
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getWheatData(source?: string | null, historical: boolean = false) {
  try {
    const { getLivePrice } = await import('@/lib/live-prices')
    const { fetchTridgePrices } = await import('@/lib/scrapers/tridge-scraper')
    const { fetchKAMISPrices } = await import('@/lib/scrapers/kamis-scraper')

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
    const { getLivePrice } = await import('@/lib/live-prices')
    const { fetchTridgePrices } = await import('@/lib/scrapers/tridge-scraper')
    const { fetchKAMISPrices } = await import('@/lib/scrapers/kamis-scraper')

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
