export type CommoditySymbol =
  | 'COFFEE'
  | 'COCOA'
  | 'TEA'
  | 'GOLD'
  | 'AVOCADO'
  | 'MACADAMIA'
  | 'COTTON'
  | 'CASHEW'
  | 'RUBBER'

export type Region = 'AFRICA' | 'LATAM'

export type LivePrice = {
  symbol: CommoditySymbol
  price: number
  currency: string
  timestamp: Date
  source: string
}

const ALPHA_VANTAGE_MAP: Record<string, string> = {
  'COFFEE': 'COFFEE',
  'COCOA': 'COCOA',
  'COTTON': 'COTTON',
  'WHEAT': 'WHEAT',
  'CORN': 'CORN',
  'GOLD': 'XAU',
  'SUGAR': 'SUGAR',
}

const WORLD_BANK_MAP: Record<string, string> = {
  'COFFEE': 'PCOFFOTM_USD',
  'COCOA': 'PCOCO_USD',
  'TEA': 'PTEA_USD',
  'COTTON': 'PCOTTIND_USD',
  'RUBBER': 'PRUBB_USD',
  'GOLD': 'PGOLD_USD',
  'WHEAT': 'PWHEAMT_USD',
  'CORN': 'PMAIZMT_USD',
  'AVOCADO': 'PFRUVT_USD',
  'MACADAMIA': 'PNUTS_USD',
  'CASHEW': 'PNUTS_USD',
}

export async function getLivePrice(
  symbol: CommoditySymbol,
  region?: string
): Promise<LivePrice> {
  if (process.env.ALPHA_VANTAGE_KEY && ALPHA_VANTAGE_MAP[symbol]) {
    try {
      const price = await fetchAlphaVantagePrice(symbol)
      if (price) return price
    } catch (error) {
      console.warn(`Alpha Vantage failed for ${symbol}:`, error)
    }
  }

  if (WORLD_BANK_MAP[symbol]) {
    try {
      const price = await fetchWorldBankPrice(symbol)
      if (price) return price
    } catch (error) {
      console.warn(`World Bank API failed for ${symbol}:`, error)
    }
  }

  console.warn(`Using fallback price for ${symbol}`)
  return getFallbackPrice(symbol)
}

async function fetchAlphaVantagePrice(symbol: CommoditySymbol): Promise<LivePrice | null> {
  const mappedSymbol = ALPHA_VANTAGE_MAP[symbol]
  if (!mappedSymbol) return null

  const url = `https://www.alphavantage.co/query?function=COMMODITY&symbol=${mappedSymbol}&interval=monthly&apikey=${process.env.ALPHA_VANTAGE_KEY}`

  const response = await fetch(url, { next: { revalidate: 3600 } })
  
  if (!response.ok) {
    throw new Error(`Alpha Vantage HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.Note || data['Error Message']) {
    throw new Error(data.Note || data['Error Message'])
  }

  const latestData = data.data?.[0]
  
  if (!latestData?.value) {
    throw new Error('No data returned from Alpha Vantage')
  }

  return {
    symbol,
    price: parseFloat(latestData.value),
    currency: 'USD',
    source: 'Alpha Vantage',
    timestamp: new Date(latestData.date)
  }
}

async function fetchWorldBankPrice(symbol: CommoditySymbol): Promise<LivePrice | null> {
  const indicator = WORLD_BANK_MAP[symbol]
  if (!indicator) return null

  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&date=2024:2025&per_page=1`

  const response = await fetch(url, { next: { revalidate: 86400 } })
  
  if (!response.ok) {
    throw new Error(`World Bank HTTP ${response.status}`)
  }

  const data = await response.json()
  const latestData = data[1]?.[0]
  
  if (!latestData?.value) {
    throw new Error('No data returned from World Bank')
  }

  return {
    symbol,
    price: parseFloat(latestData.value),
    currency: 'USD',
    source: 'World Bank',
    timestamp: new Date(`${latestData.date}-01-01`)
  }
}

function getFallbackPrice(symbol: CommoditySymbol): LivePrice {
  const fallbackPrices: Record<CommoditySymbol, number> = {
    'COFFEE': 250,
    'COCOA': 2500,
    'TEA': 3.5,
    'GOLD': 2000,
    'AVOCADO': 2.5,
    'MACADAMIA': 12,
    'COTTON': 85,
    'CASHEW': 3.5,
    'RUBBER': 1.8,
  }

  return {
    symbol,
    price: fallbackPrices[symbol] || 100,
    currency: 'USD',
    source: 'Fallback (Static)',
    timestamp: new Date()
  }
}
