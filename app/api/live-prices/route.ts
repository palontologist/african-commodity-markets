import { NextResponse } from 'next/server'
import { getLivePrice, type CommoditySymbol, type Region } from '@/lib/live-prices'

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
  const region = (searchParams.get('region')?.toUpperCase() || 'AFRICA') as Region

  try {
    if (symbolsParam) {
      const symbols = parseSymbols(symbolsParam)
      const prices = await Promise.all(symbols.map((s) => getLivePrice(s, region)))
      return NextResponse.json({ region, data: prices })
    }
    if (symbolParam) {
      const symbol = symbolParam.toUpperCase() as CommoditySymbol
      const price = await getLivePrice(symbol, region)
      return NextResponse.json({ region, data: price })
    }
    return new NextResponse('Missing symbol or symbols query param', { status: 400 })
  } catch (error) {
    return new NextResponse('Failed to fetch live prices', { status: 500 })
  }
}

