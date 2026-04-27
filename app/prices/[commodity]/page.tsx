'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, AlertCircle, Info } from "lucide-react"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getLivePrice, type CommoditySymbol, type Region } from '@/lib/live-prices'

// Commodity data structure with grade and location information
const COMMODITY_DATA = [
  {
    id: "coffee",
    name: "Coffee",
    symbol: 'COFFEE' as CommoditySymbol,
    icon: "☕",
    description: "SCA score-based futures",
    grade: "Specialty 84+",
    unit: "/lb",
    color: "bg-amber-100 text-amber-800",
    countries: { AFRICA: ["Ethiopia", "Kenya", "Uganda"], LATAM: ["Brazil", "Colombia", "Honduras"] },
  },
  {
    id: "cocoa",
    name: "Cocoa",
    symbol: 'COCOA' as CommoditySymbol,
    icon: "🍫",
    description: "Grade I & II futures",
    grade: "Grade I",
    unit: "/MT",
    color: "bg-orange-100 text-orange-800",
    countries: { AFRICA: ["Ghana", "Ivory Coast", "Nigeria"], LATAM: ["Ecuador", "Peru", "Dominican Republic"] },
  },
  {
    id: "tea",
    name: "Tea",
    symbol: 'TEA' as CommoditySymbol,
    icon: "🍵",
    description: "CTC grades prediction market",
    grade: "BOP Grade",
    unit: "/kg",
    color: "bg-green-100 text-green-800",
    countries: { AFRICA: ["Kenya", "Malawi", "Tanzania"], LATAM: ["Argentina"] },
  },
  {
    id: "cotton",
    name: "Cotton",
    symbol: 'COTTON' as CommoditySymbol,
    icon: "👕",
    description: "Grade A & B futures",
    grade: "Grade A",
    unit: "/lb",
    color: "bg-blue-100 text-blue-800",
    countries: { AFRICA: ["Egypt", "Burkina Faso", "Mali"], LATAM: ["Brazil", "Argentina"] },
  },
  {
    id: "avocado",
    name: "Avocado",
    symbol: 'AVOCADO' as CommoditySymbol,
    icon: "🥑",
    description: "Export grade predictions",
    grade: "Grade A",
    unit: "/kg",
    color: "bg-emerald-100 text-emerald-800",
    countries: { AFRICA: ["Kenya", "South Africa"], LATAM: ["Mexico", "Peru", "Chile"] },
  },
  {
    id: "gold",
    name: "Gold",
    symbol: 'GOLD' as CommoditySymbol,
    icon: "💰",
    description: "Precious metals futures",
    grade: "24K",
    unit: "/oz",
    color: "bg-yellow-100 text-yellow-800",
    countries: { AFRICA: ["South Africa", "Ghana", "Mali"], LATAM: ["Peru", "Mexico", "Brazil"] },
  },
  {
    id: "copper",
    name: "Copper",
    symbol: 'COPPER' as CommoditySymbol,
    icon: "🔶",
    description: "Industrial metals trading",
    grade: "Grade A",
    unit: "/MT",
    color: "bg-red-100 text-red-800",
    countries: { AFRICA: ["Zambia", "DRC", "South Africa"], LATAM: ["Chile", "Peru", "Mexico"] },
  },
]

// Type definitions
interface PriceData {
  price: number
  currency: string
  timestamp: Date
  source: string
}

export default function CommodityRegionPage() {
  const params = useParams<{ commodity: string }>()
  const [region, setRegion] = useState<Region>('AFRICA')
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const commodityKey = params.commodity.toLowerCase()
  const commodity = COMMODITY_DATA.find(c => c.id === commodityKey)

  useEffect(() => {
    async function fetchPrice() {
      if (!commodity) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await getLivePrice(commodity.symbol, region)
        setPriceData(data)
      } catch (err) {
        console.error('Error fetching price:', err)
        setError('Unable to load price data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrice()
  }, [commodity, region])

  if (!commodity) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commodity not found</h1>
          <p className="text-gray-600">The requested commodity is not available.</p>
          <Link href="/marketplace" className="text-primary mt-4 inline-block">
            Browse commodities
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-6 animate-spin" />
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Loading {commodity.name} prices...</h1>
            <p className="text-gray-600">Fetching real-time data for {region} region</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-6 bg-gray-50 border-b">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{commodity.name} Prices</h1>
              <p className="text-gray-600 mt-1">{commodity.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Region:</span>
              <button
                onClick={() => setRegion('AFRICA')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${region === 'AFRICA' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Africa
              </button>
              <button
                onClick={() => setRegion('LATAM')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${region === 'LATAM' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Latin America
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Price Card */}
        <div className="mb-8">
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">Current Price</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {priceData ? `$${priceData.price.toFixed(2)}` : '—'}
                  </p>
                  {priceData && (
                    <div className="flex items-center space-x-2 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">{region} Market</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-gray-600 font-medium">Commodity Details</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Commodity</p>
                      <p className="font-medium text-gray-900">{commodity.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Grade</p>
                      <p className="font-medium text-gray-900">{commodity.grade}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Unit</p>
                      <p className="font-medium text-gray-900">{commodity.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Source</p>
                      <p className="font-medium text-gray-900">{priceData?.source || 'Market Data'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {priceData ? new Date(priceData.timestamp).toLocaleString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Available Countries</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {commodity.countries[region]?.map((country, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{country}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Information */}
        <div className="mb-8">
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Market Information</CardTitle>
              </div>
              <CardDescription>
                Region-specific market data for {commodity.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">About {region} Markets</h4>
                  <p className="text-sm text-gray-600">
                    {region === 'AFRICA' 
                      ? `African commodity markets offer diverse trading opportunities across ${commodity.countries.AFRICA?.length || 3}+ countries. Prices reflect local market conditions and global demand.`
                      : `Latin American markets provide access to regional commodity pricing with strong agricultural and mining sectors across ${commodity.countries.LATAM?.length || 3}+ countries.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}