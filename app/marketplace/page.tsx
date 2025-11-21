import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Shield, DollarSign, PiggyBank, Award, Lock, Zap, BarChart3 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { getLivePrice, type CommoditySymbol } from "@/lib/live-prices"

export default async function MarketplacePage() {
  // Fetch prices
  const commodities: { id: string; symbol: CommoditySymbol; name: string; unit: string }[] = [
    { id: 'coffee', symbol: 'COFFEE', name: 'Coffee', unit: '/lb' },
    { id: 'cocoa', symbol: 'COCOA', name: 'Cocoa', unit: '/MT' },
    { id: 'tea', symbol: 'TEA', name: 'Tea', unit: '/kg' },
    { id: 'cotton', symbol: 'COTTON', name: 'Cotton', unit: '/lb' },
    { id: 'avocado', symbol: 'AVOCADO', name: 'Avocado', unit: '/kg' },
    { id: 'macadamia', symbol: 'MACADAMIA', name: 'Macadamia', unit: '/kg' },
  ]

  const prices = await Promise.all(
    commodities.map(async (c) => {
      try {
        const data = await getLivePrice(c.symbol, 'AFRICA')
        return { ...c, price: data.price, currency: data.currency, source: data.source }
      } catch (e) {
        return { ...c, price: 0, currency: 'USD', source: 'Unavailable' }
      }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Commodity Staking Pools
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stake USDC directly in commodity-backed pools. Earn yields based on real commodity price movements.
            No NFTs, no complex tokens - just simple USDC staking with transparent returns.
          </p>
        </div>

        {/* Live Market Prices */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {prices.map((item) => (
            <Card key={item.id} className="text-center py-4 hover:shadow-md transition-shadow">
              <CardContent className="p-2">
                <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  ${item.price.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                </p>
                <Badge variant="outline" className="text-[10px] mt-2 h-5">
                  {item.source}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Staking Pool Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <DollarSign className="w-6 h-6 text-primary mb-2" />
              <CardTitle>USDC Staking Pools</CardTitle>
              <CardDescription>
                Stake USDC directly in commodity-backed pools. Your staked amount tracks real commodity value.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-semibold">Available Pools</p>
                  <p className="text-xs text-muted-foreground">Coffee, Cocoa, Tea, Cotton, Avocado, Macadamia</p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/marketplace/pools">View Pools</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <CardTitle>Price-Linked Returns</CardTitle>
              <CardDescription>
                Your staked USDC value increases/decreases with real commodity prices from verified sources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-semibold">APY Range</p>
                  <p className="text-xs text-muted-foreground">8-15% based on commodity performance</p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/marketplace/returns">View Returns</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Lock className="w-6 h-6 text-primary mb-2" />
              <CardTitle>Flexible Lock Periods</CardTitle>
              <CardDescription>
                Choose your commitment: 30 days, 90 days, or 180 days. Higher lock periods = higher yields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-semibold">Unstake Anytime</p>
                  <p className="text-xs text-muted-foreground">Early withdrawal fee: 2% (goes to pool)</p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/marketplace/stake">Start Staking</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How Staking Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">How Commodity Staking Works</CardTitle>
            <CardDescription>
              Simple USDC staking tied directly to real commodity prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Stake USDC</h3>
                <p className="text-sm text-muted-foreground">
                  Deposit USDC into a commodity pool of your choice (min. $10)
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Track Value</h3>
                <p className="text-sm text-muted-foreground">
                  Your stake value follows real commodity prices from Alpha Vantage & World Bank
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Earn Yields</h3>
                <p className="text-sm text-muted-foreground">
                  Earn from price appreciation + pool rewards (8-15% APY)
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">4. Unstake USDC</h3>
                <p className="text-sm text-muted-foreground">
                  Withdraw your USDC + gains anytime (2% early withdrawal fee if before lock period)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Staked</p>
                  <p className="text-2xl font-bold text-foreground">$2.4M</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Stakers</p>
                  <p className="text-2xl font-bold text-foreground">1,243</p>
                </div>
                <PiggyBank className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Pool APY</p>
                  <p className="text-2xl font-bold text-foreground">12.3%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rewards Paid</p>
                  <p className="text-2xl font-bold text-foreground">$387K</p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features Coming Soon */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="mb-4">Coming Soon</Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Advanced Staking Features
              </h3>
              <p className="text-gray-600 mb-6">
                We're building institutional-grade staking features to enhance your returns:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Auto-Compounding</p>
                    <p className="text-sm text-gray-600">Automatic reinvestment of yields to maximize returns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Multi-Pool Staking</p>
                    <p className="text-sm text-gray-600">Stake across multiple commodity pools simultaneously</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Boost Multipliers</p>
                    <p className="text-sm text-gray-600">Earn 1.5x-2x rewards for long-term stakers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Governance Rights</p>
                    <p className="text-sm text-gray-600">Vote on which commodities to add to pools</p>
                  </div>
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/">Back to Markets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
