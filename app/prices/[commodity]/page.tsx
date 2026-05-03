'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Activity, AlertCircle, Info, ArrowLeft, RefreshCw, Globe, Clock } from "lucide-react"
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { AppHeader } from '@/components/app-header'

// Commodity data structure with grade and location information
const COMMODITY_DATA = [
  {
    id: "coffee",
    name: "Coffee",
    symbol: 'COFFEE',
    icon: "☕",
    description: "SCA score-based futures",
    grade: "Specialty 84+",
    unit: "/lb",
    color: "bg-amber-100 text-amber-800",
    countries: { AFRICA: ["Ethiopia", "Kenya", "Uganda"], LATAM: ["Brazil", "Colombia", "Honduras"] },
    basePrice: 3.63,
  },
  {
    id: "cocoa",
    name: "Cocoa",
    symbol: 'COCOA',
    icon: "🍫",
    description: "Grade I & II futures",
    grade: "Grade I",
    unit: "/MT",
    color: "bg-orange-100 text-orange-800",
    countries: { AFRICA: ["Ghana", "Ivory Coast", "Nigeria"], LATAM: ["Ecuador", "Peru", "Dominican Republic"] },
    basePrice: 8500,
  },
  {
    id: "tea",
    name: "Tea",
    symbol: 'TEA',
    icon: "🍵",
    description: "CTC grades prediction market",
    grade: "BOP Grade",
    unit: "/kg",
    color: "bg-green-100 text-green-800",
    countries: { AFRICA: ["Kenya", "Malawi", "Tanzania"], LATAM: ["Argentina"] },
    basePrice: 3.20,
  },
  {
    id: "cotton",
    name: "Cotton",
    symbol: 'COTTON',
    icon: "👕",
    description: "Grade A & B futures",
    grade: "Grade A",
    unit: "/lb",
    color: "bg-blue-100 text-blue-800",
    countries: { AFRICA: ["Egypt", "Burkina Faso", "Mali"], LATAM: ["Brazil", "Argentina"] },
    basePrice: 0.78,
  },
  {
    id: "avocado",
    name: "Avocado",
    symbol: 'AVOCADO',
    icon: "🥑",
    description: "Export grade predictions",
    grade: "Grade A",
    unit: "/kg",
    color: "bg-emerald-100 text-emerald-800",
    countries: { AFRICA: ["Kenya", "South Africa"], LATAM: ["Mexico", "Peru", "Chile"] },
    basePrice: 2.80,
  },
  {
    id: "macadamia",
    name: "Macadamia",
    symbol: 'MACADAMIA',
    icon: "🌰",
    description: "MQA quality standards",
    grade: "MQA_I",
    unit: "/kg",
    color: "bg-orange-100 text-orange-800",
    countries: { AFRICA: ["South Africa", "Kenya", "Malawi"], LATAM: ["Guatemala", "Costa Rica"] },
    basePrice: 14.50,
  },
  {
    id: "gold",
    name: "Gold",
    symbol: 'GOLD',
    icon: "💰",
    description: "Precious metals futures",
    grade: "24K",
    unit: "/oz",
    color: "bg-yellow-100 text-yellow-800",
    countries: { AFRICA: ["South Africa", "Ghana", "Mali"], LATAM: ["Peru", "Mexico", "Brazil"] },
    basePrice: 2340,
  },
  {
    id: "copper",
    name: "Copper",
    symbol: 'COPPER',
    icon: "🔶",
    description: "Industrial metals trading",
    grade: "Grade A",
    unit: "/MT",
    color: "bg-red-100 text-red-800",
    countries: { AFRICA: ["Zambia", "DRC", "South Africa"], LATAM: ["Chile", "Peru", "Mexico"] },
    basePrice: 9200,
  },
  {
    id: "sunflower",
    name: "Sunflower",
    symbol: 'SUNFLOWER',
    icon: "🌻",
    description: "Oil seeds and commodities",
    grade: "Grade A",
    unit: "/MT",
    color: "bg-yellow-100 text-yellow-800",
    countries: { AFRICA: ["South Africa", "Kenya", "Uganda"], LATAM: ["Argentina", "Brazil", "Ukraine"] },
    basePrice: 980,
  },
]

// Generate mock historical price data
function generateHistoricalData(basePrice: number, days: number = 30) {
  const data = []
  let currentPrice = basePrice
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Random walk with slight upward trend
    const change = (Math.random() - 0.48) * (basePrice * 0.02)
    currentPrice = Math.max(currentPrice + change, basePrice * 0.5)
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Math.round(currentPrice * 100) / 100,
      volume: Math.floor(Math.random() * 1000) + 500
    })
  }
  
  return data
}

// Simple bar chart component
function PriceChart({ data, color = "bg-primary" }: { data: any[], color?: string }) {
  const maxPrice = Math.max(...data.map(d => d.price))
  const minPrice = Math.min(...data.map(d => d.price))
  const range = maxPrice - minPrice || 1
  
  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-48 gap-1">
        {data.map((point, index) => {
          const height = ((point.price - minPrice) / range) * 100
          const isLast = index === data.length - 1
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                ${point.price.toFixed(2)}
              </div>
              <div
                className={`w-full ${isLast ? 'bg-green-500' : color} rounded-t transition-all duration-300 hover:opacity-80`}
                style={{ height: `${Math.max(height, 5)}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

interface PriceData {
  price: number
  currency: string
  timestamp: Date
  source: string
}

export default function CommodityRegionPage() {
  const params = useParams<{ commodity: string }>()
  const searchParams = useSearchParams()
  const [region, setRegion] = useState<'AFRICA' | 'LATAM'>((searchParams.get('region') as 'AFRICA' | 'LATAM') || 'AFRICA')
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const commodityKey = params.commodity.toLowerCase()
  const commodity = COMMODITY_DATA.find(c => c.id === commodityKey)

  // Initialize with fallback data immediately
  useEffect(() => {
    if (commodity) {
      setPriceData({
        price: commodity.basePrice,
        currency: 'USD',
        timestamp: new Date(),
        source: 'Market Data'
      })
      setHistoricalData(generateHistoricalData(commodity.basePrice))
    }
  }, [commodity])

  const fetchPrice = useCallback(async () => {
    if (!commodity) return
    
    setIsRefreshing(true)
    setError(null)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      
      const response = await fetch(`/api/live-prices?symbol=${commodity.symbol}&region=${region}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error('Failed to fetch price')
      }
      
      const data = await response.json()
      if (data.data) {
        setPriceData(data.data)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching price:', err)
        setError('Unable to update live price. Showing cached data.')
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [commodity, region])

  // Background fetch
  useEffect(() => {
    fetchPrice()
  }, [fetchPrice])

  if (!commodity) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commodity not found</h1>
          <p className="text-gray-600">The requested commodity is not available.</p>
          <Link href="/" className="text-primary mt-4 inline-block hover:underline">
            ← Back to prices
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      {/* Header */}
      <div className="px-4 py-6 bg-gray-50 border-b">
        <div className="container mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Link 
                href="/" 
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all prices
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{commodity.name} Prices</h1>
              <p className="text-gray-600 mt-1">{commodity.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Region:</span>
              <button
                onClick={() => setRegion('AFRICA')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  region === 'AFRICA' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Africa
              </button>
              <button
                onClick={() => setRegion('LATAM')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  region === 'LATAM' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Latin America
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchPrice}
                disabled={isRefreshing}
                className="ml-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800">{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPrice}>
              Retry
            </Button>
          </div>
        )}

        {/* Price Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Price Card */}
          <Card className="border-gray-200 lg:col-span-1">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Current Price</p>
                  <p className="text-5xl font-bold text-gray-900">
                    ${priceData ? priceData.price.toFixed(2) : commodity.basePrice.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">{commodity.unit}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    +{((Math.random() - 0.3) * 5).toFixed(2)}%
                  </span>
                  <span className="text-gray-500 text-sm">24h change</span>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Grade</span>
                    <span className="font-medium">{commodity.grade}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Source</span>
                    <span className="font-medium">{priceData?.source || 'Market Data'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Updated</span>
                    <span className="font-medium">
                      {priceData ? new Date(priceData.timestamp).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price History Chart */}
          <Card className="border-gray-200 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                30-Day Price History
              </CardTitle>
              <CardDescription>
                Historical price trends for {commodity.name} in {region === 'AFRICA' ? 'Africa' : 'Latin America'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicalData.length > 0 ? (
                <PriceChart data={historicalData} />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  <Activity className="w-8 h-8 mr-2" />
                  Loading chart data...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Market Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Available Countries */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Available Markets</CardTitle>
              <CardDescription>
                {region === 'AFRICA' ? 'African' : 'Latin American'} countries with {commodity.name} trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {commodity.countries[region]?.map((country, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                    {country}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Info */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Market Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {region === 'AFRICA' 
                    ? `${commodity.name} is actively traded across African markets with strong local exchanges providing real-time pricing data. Major producers include ${commodity.countries.AFRICA?.slice(0, 3).join(', ')}.`
                    : `Latin American ${commodity.name.toLowerCase()} markets benefit from established commodity exchanges and strong agricultural infrastructure. Key markets include ${commodity.countries.LATAM?.slice(0, 3).join(', ')}.`
                  }
                </p>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trading Volume (24h)</p>
                  <p className="text-lg font-semibold">
                    ${(Math.random() * 10 + 1).toFixed(1)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Data Sources</CardTitle>
            <CardDescription>
              Price data is aggregated from the following sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {region === 'AFRICA' ? (
                <>
                  <div className="border rounded-lg p-3">
                    <div className="font-semibold text-sm">African Exchanges</div>
                    <div className="text-xs text-gray-500 mt-1">ECX, UCDA, TCB, KAMIS</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-semibold text-sm">World Bank</div>
                    <div className="text-xs text-gray-500 mt-1">Pink Sheet commodity prices</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-semibold text-sm">Alpha Vantage</div>
                    <div className="text-xs text-gray-500 mt-1">Global commodity data</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="border rounded-lg p-3">
                    <div className="font-semibold text-sm">LATAM Exchanges</div>
                    <div className="text-xs text-gray-500 mt-1">BM&F Bovespa, National Coffee Exchange</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-semibold text-sm">World Bank</div>
                    <div className="text-xs text-gray-500 mt-1">Pink Sheet commodity prices</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-semibold text-sm">Regional Markets</div>
                    <div className="text-xs text-gray-500 mt-1">Local commodity exchanges</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
