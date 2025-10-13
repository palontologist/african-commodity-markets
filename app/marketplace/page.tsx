import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, TrendingUp, Shield, Coins, FileText } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Commodity Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Trade tokenized commodities, fractional ownership, and warehouse receipts.
            Real-world assets backed by blockchain transparency.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Tokenized Commodities</CardTitle>
              <CardDescription>
                Buy and sell tokenized coffee, cocoa, and other commodities with instant settlement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/marketplace/tokens">Browse Tokens</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle>Warehouse Receipts</CardTitle>
              <CardDescription>
                NFT-backed warehouse receipts for verified commodity storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/marketplace/receipts">View Receipts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Fractional Ownership</CardTitle>
              <CardDescription>
                Own fractions of high-value commodity batches starting at $10
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/marketplace/fractional">Explore Fractions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">How the Marketplace Works</CardTitle>
            <CardDescription>
              Trade real-world commodities backed by blockchain technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Verify</h3>
                <p className="text-sm text-muted-foreground">
                  Commodities are inspected and graded by certified authorities
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Tokenize</h3>
                <p className="text-sm text-muted-foreground">
                  Verified commodities are minted as NFTs or fungible tokens
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Trade</h3>
                <p className="text-sm text-muted-foreground">
                  Buy and sell tokens on our marketplace with instant settlement
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">4. Redeem</h3>
                <p className="text-sm text-muted-foreground">
                  Claim physical delivery or hold tokens for price appreciation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
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
                  <p className="text-sm text-muted-foreground">Listed Assets</p>
                  <p className="text-2xl font-bold text-foreground">847</p>
                </div>
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-2xl font-bold text-foreground">$387K</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Traders</p>
                  <p className="text-2xl font-bold text-foreground">1,243</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="mb-4">Coming Soon</Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Advanced Marketplace Features
              </h3>
              <p className="text-gray-600 mb-6">
                We're building institutional-grade features including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Physical Delivery</p>
                    <p className="text-sm text-gray-600">Redeem tokens for actual commodities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Quality Certificates</p>
                    <p className="text-sm text-gray-600">NFT-based grade verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Liquidity Pools</p>
                    <p className="text-sm text-gray-600">Earn yield on tokenized assets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">KYC/AML Compliance</p>
                    <p className="text-sm text-gray-600">Institutional-grade compliance</p>
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
