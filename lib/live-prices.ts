export type CommoditySymbol =
  | 'COCOA'
  | 'COFFEE'
  | 'TEA'
  | 'GOLD'
  | 'AVOCADO'
  | 'MACADAMIA'

export type Region = 'AFRICA' | 'LATAM'

export interface LivePrice {
  symbol: CommoditySymbol
  price: number | null
  currency: string
  unit?: string
  source: string
  asOf: string
  note?: string
}

export function mapCommodityToTicker(symbol: CommoditySymbol, region: Region): { ticker?: string; unit?: string; currency?: string; note?: string } {
  switch (symbol) {
    case 'COCOA':
      return { ticker: 'CC=F', unit: 'MT', currency: 'USD', note: 'ICE Cocoa futures' }
    case 'COFFEE':
      return { ticker: 'KC=F', unit: 'lb', currency: 'USD', note: 'ICE Coffee futures (Arabica)' }
    case 'GOLD':
      return { ticker: 'GC=F', unit: 'oz', currency: 'USD', note: 'COMEX Gold futures' }
    case 'TEA':
      return { unit: 'kg', currency: region === 'LATAM' ? 'USD' : 'USD', note: 'No direct ticker; using fallback averages' }
    case 'AVOCADO':
      return { unit: 'kg', currency: 'USD', note: 'No direct ticker; using FAO/market average' }
    case 'MACADAMIA':
      return { unit: 'kg', currency: 'USD', note: 'No direct ticker; using industry average' }
    default:
      return {}
  }
}

export async function fetchYahooQuote(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1m`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      // Next.js fetch cache control on server
      next: { revalidate: 30 },
    } as any)
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    const last = result?.meta?.regularMarketPrice ?? result?.meta?.previousClose
    return typeof last === 'number' ? last : null
  } catch {
    return null
  }
}

export async function getLivePrice(symbol: CommoditySymbol, region: Region): Promise<LivePrice> {
  const map = mapCommodityToTicker(symbol, region)
  if (map.ticker) {
    const price = await fetchYahooQuote(map.ticker)
    return {
      symbol,
      price,
      currency: map.currency || 'USD',
      unit: map.unit,
      source: 'YahooFinance',
      asOf: new Date().toISOString(),
      note: map.note,
    }
  }
  const baseline: Record<CommoditySymbol, { price: number; unit: string; note: string }> = {
    TEA: { price: 2.45, unit: 'kg', note: 'EATTA avg est.' },
    AVOCADO: { price: 1.85, unit: 'kg', note: 'Export avg est.' },
    MACADAMIA: { price: 12.3, unit: 'kg', note: 'Industry avg est.' },
    COCOA: { price: 0, unit: 'MT', note: '' },
    COFFEE: { price: 0, unit: 'lb', note: '' },
    GOLD: { price: 0, unit: 'oz', note: '' },
  }
  const b = baseline[symbol]
  return {
    symbol,
    price: b.price,
    currency: 'USD',
    unit: b.unit,
    source: 'Fallback',
    asOf: new Date().toISOString(),
    note: b.note,
  }
}

