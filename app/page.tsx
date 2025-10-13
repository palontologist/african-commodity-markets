'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { StakeModal } from "@/components/markets/stake-modal"
import Link from "next/link"
import { TrendingUp, TrendingDown, Activity, DollarSign, Coffee, Leaf, Apple, Nut, Flower2, Palmtree } from "lucide-react"
import { getPrediction, type OnChainPrediction } from "@/lib/blockchain/polygon-client"
import { getLivePrice, type CommoditySymbol, type Region } from "@/lib/live-prices"
import { useState, useEffect } from "react"

export const dynamic = 'force-dynamic'

// Commodity data structure matching market page
const COMMODITY_DATA = [
  {
    id: "coffee",
    name: "Coffee",
    symbol: 'COFFEE' as CommoditySymbol,
    icon: Coffee,
    description: "SCA score-based futures",
    grade: "Specialty 84+",
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
    color: "bg-orange-100 text-orange-800",
    countries: { AFRICA: ["South Africa", "Kenya", "Malawi"], LATAM: ["Guatemala", "Costa Rica"] },
  },
]

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<Region>('AFRICA')
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all')
  const [predictions, setPredictions] = useState<OnChainPrediction[]>([])
  const [livePrices, setLivePrices] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [stakeModalOpen, setStakeModalOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch recent on-chain predictions
        const fetchedPredictions: OnChainPrediction[] = []
        for (let i = 0; i < 10; i++) {
          try {
            const prediction = await getPrediction(i)
            // Filter out invalid/empty predictions
            if (
              prediction.commodity && 
              prediction.commodity !== '' &&
              Number(prediction.predictedPrice) > 0 &&
              Number(prediction.targetDate) > 0
            ) {
              fetchedPredictions.push(prediction)
            }
          } catch (error) {
            break
          }
        }
        setPredictions(fetchedPredictions)

        // Fetch live prices for all commodities
        const pricesData: Record<string, any> = {}
        await Promise.all(
          COMMODITY_DATA.map(async (commodity) => {
            try {
              const price = await getLivePrice(commodity.symbol, selectedRegion)
              pricesData[commodity.id] = price
            } catch (error) {
              console.error(`Failed to fetch price for ${commodity.symbol}:`, error)
            }
          })
        )
        setLivePrices(pricesData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedRegion])

  // Filter commodities by region
  const filteredCommodities = COMMODITY_DATA.filter(c => {
    if (selectedCommodity !== 'all' && c.id !== selectedCommodity) return false
    return c.countries[selectedRegion].length > 0
  })

  // Calculate statistics
  const totalActiveMarkets = filteredCommodities.length * 3 // Average 3 markets per commodity
  const totalVolume = predictions.reduce((sum, p) => sum + Number(p.yesStakes + p.noStakes), 0)
  const avgReturn = selectedRegion === 'AFRICA' ? '+14.7%' : '+11.3%'

  // Handle opening stake modal with market data
  const handleStakeClick = (commodity: typeof COMMODITY_DATA[0]) => {
    const priceData = livePrices[commodity.id]
    const currentPrice = priceData?.price || 0
    
    // Create a market object for the stake modal
    const market = {
      id: `market-${commodity.id}-${Date.now()}`,
      commodity: commodity.symbol,
      question: `Will ${commodity.name} reach $${(currentPrice * 1.15).toFixed(2)} by December 31, 2025?`,
      thresholdPrice: Math.round(currentPrice * 1.15 * 100), // 15% increase as threshold
      expiryTime: new Date('2025-12-31').getTime(),
      yesPool: Math.random() * 100 + 50, // Mock pool data
      noPool: Math.random() * 75 + 25,
      chain: 'polygon' as const, // Default to Polygon, can be changed
      resolved: false,
    }
    
    setSelectedMarket(market)
    setStakeModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Kalshi Style */}
        <div className="mb-8">
          <div className="max-w-3xl mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Trade on African Commodity Outcomes
            </h1>
            <p className="text-lg text-gray-600">
              Bet on the future prices of coffee, cocoa, cotton, and more. 
              AI-powered predictions meet real market data on the blockchain.
            </p>
          </div>

          {/* Country/Region Selector - Kalshi Style */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-700">Region:</span>
            <div className="flex gap-2">
              <Button
                variant={selectedRegion === 'AFRICA' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion('AFRICA')}
              >
                🌍 Africa
              </Button>
              <Button
                variant={selectedRegion === 'LATAM' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion('LATAM')}
              >
                🌎 Latin America
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Markets</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalActiveMarkets}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Commodities</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{filteredCommodities.length}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Volume</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${(totalVolume / 1_000_000).toFixed(1)}M
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Avg. Return</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{avgReturn}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Commodity Filter Tabs - Kalshi Style */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCommodity === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCommodity('all')}
              className="whitespace-nowrap"
            >
              All Markets
            </Button>
            {COMMODITY_DATA.map((commodity) => (
              <Button
                key={commodity.id}
                variant={selectedCommodity === commodity.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCommodity(commodity.id)}
                className="whitespace-nowrap"
              >
                {commodity.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Commodity Markets - Kalshi Style Cards */}
        {loading ? (
          <Card className="border-gray-200">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading markets...</h3>
                <p className="text-gray-600">Fetching live data from {selectedRegion}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCommodities.map((commodity) => {
              const IconComponent = commodity.icon
              const priceData = livePrices[commodity.id]
              const currentPrice = priceData?.price || 0
              const change = ((Math.random() - 0.5) * 20).toFixed(1) // Mock change
              const isPositive = parseFloat(change) > 0
              const unit = commodity.id === 'coffee' ? '/lb' : '/kg'
              const activeMarkets = Math.floor(Math.random() * 3) + 2 // 2-4 markets
              const volume = (currentPrice * activeMarkets * 50000).toFixed(0)
              
              return (
                <Card key={commodity.id} className="hover:shadow-lg transition-shadow duration-200 border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{commodity.name}</CardTitle>
                          <CardDescription>{commodity.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={commodity.color}>{commodity.grade}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price Section */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Current Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${currentPrice.toFixed(2)}{unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{change}%
                        </span>
                      </div>
                    </div>

                    {/* Markets in this region */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-2">Available in:</p>
                      <div className="flex flex-wrap gap-1">
                        {commodity.countries[selectedRegion].map((country) => (
                          <Badge key={country} variant="secondary" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">24h Volume</p>
                        <p className="font-semibold text-gray-900">${(parseInt(volume) / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Active Markets</p>
                        <p className="font-semibold text-gray-900">{activeMarkets}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleStakeClick(commodity)}
                          className="flex-1"
                        >
                          Stake Now
                        </Button>
                        <Button asChild variant="outline">
                          <Link 
                          href={`/marketplace/${commodity.id}?region=${selectedRegion}`} 
                          >View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Footer CTA */}
        <Card className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to start trading?
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your wallet to trade on {selectedRegion === 'AFRICA' ? 'African' : 'Latin American'} commodity markets.
                Low fees, instant settlement, and AI-powered insights.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/dashboard">Connect Wallet</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Stake Modal */}
      {selectedMarket && (
        <StakeModal
          market={selectedMarket}
          open={stakeModalOpen}
          onOpenChange={setStakeModalOpen}
          onSuccess={() => {
            console.log('Stake successful!')
            // Refresh data after successful stake
            // You can add logic here to refetch predictions and prices
          }}
        />
      )}
    </div>
  )
}
