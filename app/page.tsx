import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { TrendingUp, TrendingDown, Activity, Users, Clock, DollarSign, ArrowRight } from "lucide-react"
import { getPrediction, type OnChainPrediction } from "@/lib/blockchain/polygon-client"
import { MarketPredictionCard } from "@/components/blockchain/market-prediction-card"
import { getLivePrice, type CommoditySymbol } from "@/lib/live-prices"

// Disable static generation for pages using blockchain wallet
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch recent on-chain predictions
  const predictions: OnChainPrediction[] = []
  
  // Try to fetch predictions 0-10 (most recent)
  for (let i = 0; i < 10; i++) {
    try {
      const prediction = await getPrediction(i)
      predictions.push(prediction)
    } catch (error) {
      // Prediction doesn't exist or error fetching
      break
    }
  }

  // Fetch live prices for key commodities
  const commoditySymbols: CommoditySymbol[] = ['COFFEE', 'COCOA', 'COTTON', 'GOLD', 'CASHEW', 'RUBBER']
  const livePrices = await Promise.all(
    commoditySymbols.map(async (symbol) => {
      try {
        const price = await getLivePrice(symbol, 'AFRICA')
        return { symbol, ...price }
      } catch {
        return null
      }
    })
  )

  // Group predictions by commodity
  const commodityGroups = predictions.reduce((acc, pred) => {
    const commodity = pred.commodity
    if (!acc[commodity]) {
      acc[commodity] = []
    }
    acc[commodity].push(pred)
    return acc
  }, {} as Record<string, OnChainPrediction[]>)

  const commodities = Object.keys(commodityGroups)
  const totalVolume = predictions.reduce((sum, p) => sum + Number(p.yesStakes + p.noStakes), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Kalshi Style */}
        <div className="mb-12">
          <div className="max-w-3xl mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Trade on African Commodity Outcomes
            </h1>
            <p className="text-lg text-gray-600">
              Bet on the future prices of coffee, cocoa, cotton, and more. 
              AI-powered predictions meet real market data on the blockchain.
            </p>
          </div>

          {/* Live Prices Ticker - Kalshi Style */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Live Commodity Prices</h3>
              <Button asChild variant="ghost" size="sm">
                <Link href="/market">
                  View All
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {livePrices.filter(p => p !== null).map((commodity, idx) => {
                if (!commodity) return null
                const isPositive = Math.random() > 0.5 // Mock trend for demo
                
                return (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">{commodity.symbol}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${commodity.price.toFixed(2)}
                      </span>
                      <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="inline w-3 h-3" /> : <TrendingDown className="inline w-3 h-3" />}
                        {isPositive ? '+' : '-'}{(Math.random() * 3).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Markets</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{predictions.length}</p>
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
                    <p className="text-2xl font-bold text-gray-900 mt-1">{commodities.length}</p>
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
                      ${(totalVolume / 1_000_000).toFixed(1)}K
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
                    <p className="text-sm text-gray-600 font-medium">Data Source</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">Live</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Categories - Kalshi Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Markets</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                All
              </Button>
              <Button variant="ghost" size="sm">
                Trending
              </Button>
              <Button variant="ghost" size="sm">
                New
              </Button>
              <Button variant="ghost" size="sm">
                Ending Soon
              </Button>
            </div>
          </div>

          {/* Commodity Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              All Commodities
            </Badge>
            {commodities.map((commodity) => (
              <Badge 
                key={commodity}
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
              >
                {commodity}
              </Badge>
            ))}
          </div>
        </div>

        {/* Market Cards */}
        {predictions.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active markets yet</h3>
                <p className="text-gray-600 mb-6">
                  Check back soon for AI-generated prediction markets on African commodities
                </p>
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {predictions.map((prediction) => (
              <MarketPredictionCard
                key={prediction.predictionId}
                prediction={prediction}
                onStaked={() => {
                  // In production, use React Query to refetch
                }}
              />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <Card className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Want to create your own predictions?
              </h3>
              <p className="text-gray-600 mb-6">
                Our AI generates daily predictions on commodity prices. 
                Connect your wallet to start trading.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/market">Browse All Markets</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
