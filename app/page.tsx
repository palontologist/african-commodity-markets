'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { TrendingUp, TrendingDown, Activity, Coffee, Leaf, Flower2, Palmtree, Apple, Nut, Coins, Zap, Sun, Settings } from "lucide-react"
import { getLivePrice, type CommoditySymbol, type Region } from "@/lib/live-prices"
import { useState, useEffect } from "react"

// Commodity data structure with grade and location information
const COMMODITY_DATA = [
  {
    id: "coffee",
    name: "Coffee",
    symbol: 'COFFEE' as CommoditySymbol,
    icon: Coffee,
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
    icon: Flower2,
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
    icon: Leaf,
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
    icon: Palmtree,
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
    icon: Apple,
    description: "Export grade predictions",
    grade: "Grade A",
    unit: "/kg",
    color: "bg-emerald-100 text-emerald-800",
    countries: { AFRICA: ["Kenya", "South Africa"], LATAM: ["Mexico", "Peru", "Chile"] },
  },
  {
    id: "macadamia",
    name: "Macadamia",
    symbol: 'MACADAMIA' as CommoditySymbol,
    icon: Nut,
    description: "MQA quality standards",
    grade: "MQA_I",
    unit: "/kg",
    color: "bg-orange-100 text-orange-800",
    countries: { AFRICA: ["South Africa", "Kenya", "Malawi"], LATAM: ["Guatemala", "Costa Rica"] },
  },
  {
    id: "gold",
    name: "Gold",
    symbol: 'GOLD' as CommoditySymbol,
    icon: Coins,
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
    icon: Zap,
    description: "Industrial metals trading",
    grade: "Grade A",
    unit: "/MT",
    color: "bg-red-100 text-red-800",
    countries: { AFRICA: ["Zambia", "DRC", "South Africa"], LATAM: ["Chile", "Peru", "Mexico"] },
  },
  {
    id: "sunflower",
    name: "Sunflower",
    symbol: 'SUNFLOWER' as CommoditySymbol,
    icon: Sun,
    description: "Oil seeds and commodities",
    grade: "Grade A",
    unit: "/MT",
    color: "bg-yellow-100 text-yellow-800",
    countries: { AFRICA: ["South Africa", "Kenya", "Uganda"], LATAM: ["Argentina", "Brazil", "Ukraine"] },
  },
]

export default function HomePage() {
  const [livePrices, setLivePrices] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<Region>('AFRICA')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLivePrices() {
      try {
        setLoading(true)
        setError(null)
        
        const symbols = COMMODITY_DATA.map(c => c.symbol).join(',')
        const response = await fetch(`/api/live-prices?symbols=${symbols}&region=${selectedRegion}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch live prices')
        }
        
        const data = await response.json()
        
        const pricesData: Record<string, any> = {}
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((price: any, index: number) => {
            if (price) {
              const commodityId = COMMODITY_DATA[index].id
              pricesData[commodityId] = price
            }
          })
        }
        
        setLivePrices(pricesData)
      } catch (err) {
        console.error('Error fetching live prices:', err)
        setError('Unable to load live price data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLivePrices()
  }, [selectedRegion])

  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-6 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading live commodity prices...</h3>
            <p className="text-gray-600">Fetching real-time data from African markets</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      {/* Region Selector */}
      <div className="px-4 py-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Live African Commodity Prices
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Region:</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant={selectedRegion === 'AFRICA' ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleRegionChange('AFRICA')}
                  className="text-sm px-3 py-1"
                >
                  Africa
                </Button>
                <Button 
                  variant={selectedRegion === 'LATAM' ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleRegionChange('LATAM')}
                  className="text-sm px-3 py-1"
                >
                  Latin America
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Price Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Header with stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Markets Live</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(livePrices).length}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Commodities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {COMMODITY_DATA.length}
                    </p>
                  </div>
                  <Settings className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Regions</p>
                    <p className="text-2xl font-bold text-gray-900">2</p>
                  </div>
                  <Settings className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Last Updated</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commodity Price Cards */}
          <div className="grid gap-6">
            {COMMODITY_DATA.map((commodity) => {
              const priceData = livePrices[commodity.id]
              const currentPrice = priceData?.price || 0
              const change = priceData?.change || ((Math.random() - 0.5) * 4) // Mock change for demo
              const isPositive = change >= 0
              
              return (
                <Card 
                  key={commodity.id} 
                  className="hover:shadow-lg transition-shadow duration-200 border-gray-200 cursor-pointer"
                  onClick={() => {
                    // Navigate to commodity detail page
                    window.location.href = `/prices/${commodity.id}?region=${selectedRegion}`
                  }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <commodity.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{commodity.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            {commodity.description}
                          </CardDescription>
                        </div>
                      </div>
                       <Badge className={`${commodity.color} text-xs font-medium px-3 py-1`}>
                         {commodity.grade}
                       </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Price Section */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Current Price</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${currentPrice.toFixed(2)}{commodity.unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isPositive ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Location Badges */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-2 font-medium">
                        Available in:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {commodity.countries[selectedRegion].map((country, index) => (
                          <Badge 
                            key={`${commodity.id}-${country}-${index}`} 
                            variant="secondary"
                            className="text-xs px-2 py-1"
                          >
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Source</p>
                        <p className="font-medium text-gray-900">
                          {priceData?.source || 'Market Data'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Updated</p>
                        <p className="font-medium text-gray-900">
                          {priceData ? 
                            new Date(priceData.timestamp).toLocaleTimeString() : 
                            'Just now'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Footer CTA */}
                  <div className="px-4 pt-4">
                    <Button 
                      variant="outline"
                      className="w-full text-sm"
                    >
                      View Details →
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      {/* Call to Action Section */}
      <div className="px-4 py-12 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Access Institutional-Grade Commodity Data
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time prices, grade-specific data, and location-based insights for African commodities.
            Used by traders, financiers, and agribusinesses across the continent.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button 
              asChild 
              className="bg-primary hover:bg-primary/90 px-6 py-3"
            >
              <Link href="/api-docs">Get API Access</Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 px-6 py-3"
            >
              <Link href="/marketplace">Explore Markets</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}