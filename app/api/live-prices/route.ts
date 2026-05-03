import { NextResponse } from 'next/server'
import { getLivePrice, type CommoditySymbol, type Region } from '@/lib/live-prices'

export const runtime = 'edge'
export const preferredRegion = 'iad1'

function parseSymbols(input: string | null): CommoditySymbol[] {
  if (!input) return []
  return input
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean) as CommoditySymbol[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbolParam = searchParams.get('symbol')
  const symbolsParam = searchParams.get('symbols')
  const region = (searchParams.get('region')?.toUpperCase() as Region) || 'AFRICA'

  try {
    if (symbolsParam) {
      const symbols = parseSymbols(symbolsParam)
      
      // Fetch all prices with timeout protection
      const pricePromises = symbols.map(async (symbol) => {
        try {
          const price = await Promise.race([
            getLivePrice(symbol, region),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 8000)
            )
          ])
          return { symbol, ...price, error: null }
        } catch (error) {
          // Return fallback price on error/timeout
          const fallback = await getLivePrice(symbol, region).catch(() => ({
            price: getFallbackPriceValue(symbol),
            currency: 'USD',
            timestamp: new Date(),
            source: 'Fallback (Static)',
            isStale: true
          }))
          return { symbol, ...fallback, error: 'Using fallback data' }
        }
      })
      
      const prices = await Promise.all(pricePromises)
      
      return NextResponse.json({ 
        region, 
        data: prices,
        timestamp: new Date().toISOString(),
        cached: false
      })
    }
    
    if (symbolParam) {
      const symbol = symbolParam.toUpperCase() as CommoditySymbol
      try {
        const price = await Promise.race([
          getLivePrice(symbol, region),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 8000)
          )
        ])
        return NextResponse.json({ 
          region, 
          data: price,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        const fallback = await getLivePrice(symbol, region).catch(() => ({
          price: getFallbackPriceValue(symbol),
          currency: 'USD',
          timestamp: new Date(),
          source: 'Fallback (Static)',
          isStale: true
        }))
        return NextResponse.json({ 
          region, 
          data: fallback,
          timestamp: new Date().toISOString(),
          warning: 'Using fallback price data'
        })
      }
    }
    
    return new NextResponse('Missing symbol or symbols query param', { status: 400 })
  } catch (error) {
    console.error('API Error:', error)
    return new NextResponse('Failed to fetch live prices', { status: 500 })
  }
}

function getFallbackPriceValue(symbol: CommoditySymbol): number {
  const fallbackPrices: Record<CommoditySymbol, number> = {
    'COFFEE': 3.63,
    'COCOA': 8500,
    'COTTON': 0.78,
    'CASHEW': 1450,
    'RUBBER': 1.65,
    'GOLD': 2340,
    'TEA': 3.20,
    'AVOCADO': 2.80,
    'MACADAMIA': 14.50,
    'WHEAT': 173,
    'MAIZE': 196,
    'SUNFLOWER': 980,
    'COPPER': 9200
  }
  return fallbackPrices[symbol] || 0
}
