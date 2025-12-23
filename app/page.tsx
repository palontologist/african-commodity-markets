'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AppHeader } from "@/components/app-header"
import { StakeModal } from "@/components/markets/stake-modal"
import Link from "next/link"
import { TrendingUp, TrendingDown, Activity, DollarSign, Coffee, Leaf, Apple, Nut, Flower2, Palmtree, Sprout, LineChart, Users, ArrowRight, ExternalLink } from "lucide-react"
import { getPrediction, type OnChainPrediction } from "@/lib/blockchain/polygon-client"
import { type CommoditySymbol, type Region } from "@/lib/live-prices"
import { useState, useEffect } from "react"
import { useUserType } from "@/components/user-type-provider"
import { useRouter } from "next/navigation"

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
  const { setUserType, userType } = useUserType()
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<Region>('AFRICA')
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all')
  const [isLive, setIsLive] = useState(true)
  const [predictions, setPredictions] = useState<OnChainPrediction[]>([])
  const [livePrices, setLivePrices] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [stakeModalOpen, setStakeModalOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState<any>(null)
  const [stakingStats, setStakingStats] = useState({
    totalValueLocked: 2400000,
    activeStakers: 1247,
    averageAPY: 12.4,
  })

  const handleUserTypeSelect = (type: 'farmer' | 'trader' | 'coop') => {
    setUserType(type)
    // Navigate to personalized dashboard or show relevant features
    router.push(`/dashboard?type=${type}`)
  }

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
        const symbols = COMMODITY_DATA.map(c => c.symbol).join(',')
        try {
          const response = await fetch(`/api/live-prices?symbols=${symbols}&region=${selectedRegion}`)
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
        } catch (error) {
          console.error('Failed to fetch live prices:', error)
        }

        // Fetch staking stats
        try {
          const statsResponse = await fetch('/api/staking/stats')
          if (statsResponse.ok) {
            const stats = await statsResponse.json()
            setStakingStats(stats)
          }
        } catch (error) {
          console.error('Failed to fetch staking stats:', error)
        }
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
    <div className="min-h-screen bg-white">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Trade the future of African crops.
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
                Back price outcomes, earn yield, and unlock instant USDC for farmers.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Link href="/marketplace">Browse Markets</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                  <Link href="/how-it-works">How it Works</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Abstract illustrations */}
              <div className="relative h-64 lg:h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white rounded-xl p-8 shadow-lg border border-primary/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">USDC</p>
                      <p className="text-2xl font-bold text-gray-900">$1,234.56</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div className="h-24 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                    <LineChart className="w-12 h-12 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card 
              className={`border-gray-200 hover:shadow-lg transition-all cursor-pointer ${userType === 'farmer' ? 'border-primary border-2 bg-primary/5' : ''}`}
              onClick={() => handleUserTypeSelect('farmer')}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sprout className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">For Farmers</CardTitle>
                <CardDescription className="text-base">
                  Turn future harvests into instant working capital.
                </CardDescription>
                {userType === 'farmer' && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Link href="/grades" className="block text-sm text-primary hover:underline">📊 Crop Grades</Link>
                    <Link href="/marketplace" className="block text-sm text-primary hover:underline">💰 Live Prices</Link>
                    <Link href="/deals/new" className="block text-sm text-primary hover:underline">📝 List on Marketplace</Link>
                    <Link href="/insights" className="block text-sm text-primary hover:underline">🤖 AI Insights</Link>
                  </div>
                )}
              </CardHeader>
            </Card>

            <Card 
              className={`border-gray-200 hover:shadow-lg transition-all cursor-pointer ${userType === 'trader' ? 'border-primary border-2 bg-primary/5' : ''}`}
              onClick={() => handleUserTypeSelect('trader')}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <LineChart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">For Traders</CardTitle>
                <CardDescription className="text-base">
                  Trade commodity outcomes with AI-powered odds.
                </CardDescription>
                {userType === 'trader' && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Link href="/marketplace" className="block text-sm text-primary hover:underline">📈 Prediction Markets</Link>
                    <Link href="/insights" className="block text-sm text-primary hover:underline">🤖 AI Insights</Link>
                    <Link href="/dashboard" className="block text-sm text-primary hover:underline">💼 Trading Dashboard</Link>
                  </div>
                )}
              </CardHeader>
            </Card>

            <Card 
              className={`border-gray-200 hover:shadow-lg transition-all cursor-pointer ${userType === 'coop' ? 'border-primary border-2 bg-primary/5' : ''}`}
              onClick={() => handleUserTypeSelect('coop')}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">For Co-ops</CardTitle>
                <CardDescription className="text-base">
                  Use analytics to negotiate better prices and credit.
                </CardDescription>
                {userType === 'coop' && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Link href="/marketplace" className="block text-sm text-primary hover:underline">📈 Marketplace</Link>
                    <Link href="/wheat-maize-markets" className="block text-sm text-primary hover:underline">🌾 Wheat & Maize Markets</Link>
                    <Link href="/api-docs" className="block text-sm text-primary hover:underline">📚 API Documentation</Link>
                    <Link href="/dashboard" className="block text-sm text-primary hover:underline">📊 Analytics Dashboard</Link>
                  </div>
                )}
              </CardHeader>
            </Card>
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
                  <Activity className="w-8 h-8 text-primary" />
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
                  <TrendingUp className="w-8 h-8 text-primary" />
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
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Avg. Return</p>
                    <p className="text-2xl font-bold text-primary mt-1">{avgReturn}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Toggle */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Commodity Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 sm:flex-initial">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Commodity:</label>
              <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {COMMODITY_DATA.map((commodity) => (
                    <SelectItem key={commodity.id} value={commodity.id}>
                      {commodity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 sm:flex-initial">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Country:</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {selectedRegion === 'AFRICA' ? (
                    <>
                      <SelectItem value="kenya">Kenya</SelectItem>
                      <SelectItem value="ghana">Ghana</SelectItem>
                      <SelectItem value="ethiopia">Ethiopia</SelectItem>
                      <SelectItem value="nigeria">Nigeria</SelectItem>
                      <SelectItem value="south-africa">South Africa</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="brazil">Brazil</SelectItem>
                      <SelectItem value="colombia">Colombia</SelectItem>
                      <SelectItem value="ecuador">Ecuador</SelectItem>
                      <SelectItem value="peru">Peru</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 sm:flex-initial">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Timeframe:</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Settled/Live Toggle */}
            <div className="flex items-center gap-3 sm:ml-auto justify-center sm:justify-start">
              <span className={`text-sm font-medium ${!isLive ? 'text-gray-900' : 'text-gray-500'}`}>
                Settled
              </span>
              <Switch
                checked={isLive}
                onCheckedChange={setIsLive}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`text-sm font-medium ${isLive ? 'text-primary' : 'text-gray-500'}`}>
                Live
              </span>
            </div>
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

        {/* USDC Staking Pools Section */}
        <div className="mt-16 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              USDC Staking Pools
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Stake USDC directly in commodity-backed pools. Your staked amount tracks real commodity value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Available Pools Card */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Available Pools</CardTitle>
                <CardDescription className="text-base">
                  Stake in multiple commodity pools simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-4">
                  {COMMODITY_DATA.map((commodity) => (
                    <Badge key={commodity.id} variant="secondary" className="text-xs">
                      {commodity.name}
                    </Badge>
                  ))}
                </div>
                <Button asChild className="w-full">
                  <Link href="/pools">View Pools</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Price-Linked Returns Card */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Price-Linked Returns</CardTitle>
                <CardDescription className="text-base">
                  Value increases/decreases with real commodity prices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">APY Range</p>
                  <p className="text-2xl font-bold text-gray-900">8-15%</p>
                  <p className="text-xs text-gray-500 mt-1">Based on commodity performance</p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/settlements">View Returns</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Flexible Lock Periods Card */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Flexible Lock Periods</CardTitle>
                <CardDescription className="text-base">
                  Choose your commitment level and maximize yields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">30 days</span>
                    <span className="text-sm text-green-600">8% APY</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">90 days</span>
                    <span className="text-sm text-green-600">12% APY</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">180 days</span>
                    <span className="text-sm text-green-600">15% APY</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600 mb-2">
                    <span className="font-semibold">Unstake Anytime</span><br />
                    Early withdrawal fee: 2% (goes to pool)
                  </p>
                </div>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/pools">Start Staking</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Staking Benefits Banner */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${(stakingStats.totalValueLocked / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-sm text-gray-600">Total Value Locked</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {stakingStats.activeStakers.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Active Stakers</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stakingStats.averageAPY}%
                  </div>
                  <p className="text-sm text-gray-600">Average APY</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
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
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/dashboard">Connect Wallet</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
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
