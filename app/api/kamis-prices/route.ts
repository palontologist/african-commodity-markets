import { NextResponse } from 'next/server'
import { fetchKAMISPrices, getAllKAMISPrices, type KAMISMarketData } from '@/lib/scrapers/kamis-scraper'
import type { CommoditySymbol } from '@/lib/live-prices'

/**
 * API endpoint for Kenya Agricultural Market Information System (KAMIS) prices
 * 
 * GET /api/kamis-prices?symbol=MAIZE
 * GET /api/kamis-prices?symbols=MAIZE,WHEAT,TEA
 * GET /api/kamis-prices (returns all available commodities)
 */

const VALID_SYMBOLS = ['COFFEE', 'TEA', 'MAIZE', 'WHEAT', 'AVOCADO', 'MACADAMIA'] as const

function isValidSymbol(symbol: string): symbol is CommoditySymbol {
  return VALID_SYMBOLS.includes(symbol.toUpperCase() as typeof VALID_SYMBOLS[number])
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbolParam = searchParams.get('symbol')
  const symbolsParam = searchParams.get('symbols')

  try {
    // If no symbol specified, return all available KAMIS prices
    if (!symbolParam && !symbolsParam) {
      const allPrices = await getAllKAMISPrices()
      
      const result: Record<string, KAMISMarketData> = {}
      allPrices.forEach((data, symbol) => {
        result[symbol] = data
      })
      
      return NextResponse.json({
        source: 'KAMIS - Kenya Agricultural Market Information System',
        sourceUrl: 'https://kamis.kilimo.go.ke/site/market',
        country: 'Kenya',
        data: result,
        timestamp: new Date().toISOString()
      })
    }

    // Handle single symbol
    if (symbolParam) {
      const symbol = symbolParam.toUpperCase()
      
      if (!isValidSymbol(symbol)) {
        return NextResponse.json(
          { 
            error: `Invalid symbol: ${symbol}`,
            validSymbols: VALID_SYMBOLS 
          },
          { status: 400 }
        )
      }
      
      const data = await fetchKAMISPrices(symbol as CommoditySymbol)
      
      if (!data) {
        return NextResponse.json(
          { 
            error: `No KAMIS data available for ${symbol}`,
            message: 'The KAMIS website may be temporarily unavailable'
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        source: 'KAMIS - Kenya Agricultural Market Information System',
        sourceUrl: 'https://kamis.kilimo.go.ke/site/market',
        country: 'Kenya',
        symbol,
        data,
        timestamp: new Date().toISOString()
      })
    }

    // Handle multiple symbols
    if (symbolsParam) {
      const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase())
      const invalidSymbols = symbols.filter(s => !isValidSymbol(s))
      
      if (invalidSymbols.length > 0) {
        return NextResponse.json(
          { 
            error: `Invalid symbols: ${invalidSymbols.join(', ')}`,
            validSymbols: VALID_SYMBOLS 
          },
          { status: 400 }
        )
      }
      
      const results: Record<string, KAMISMarketData | null> = {}
      
      await Promise.all(
        symbols.map(async (symbol) => {
          const data = await fetchKAMISPrices(symbol as CommoditySymbol)
          results[symbol] = data
        })
      )
      
      return NextResponse.json({
        source: 'KAMIS - Kenya Agricultural Market Information System',
        sourceUrl: 'https://kamis.kilimo.go.ke/site/market',
        country: 'Kenya',
        data: results,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Missing symbol or symbols parameter' }, { status: 400 })
  } catch (error) {
    console.error('KAMIS API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch KAMIS prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
