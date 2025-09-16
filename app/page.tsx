import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Coffee, Leaf, Apple, Nut, Award } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { getLivePrice, type Region, type CommoditySymbol } from "@/lib/live-prices"

const commodities = [
  {
    id: "tea",
    name: "Tea",
    icon: Leaf,
    description: "CTC grades prediction market",
    currentPrice: "$2.45/kg",
    change: "+5.2%",
    trend: "up",
    volume: "$1.2M",
    activeMarkets: 3,
    nextSettlement: "Jan 15, 2025",
    grade: "BOP Grade",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "coffee",
    name: "Coffee",
    icon: Coffee,
    description: "SCA score-based futures",
    currentPrice: "$4.80/lb",
    change: "-2.1%",
    trend: "down",
    volume: "$2.8M",
    activeMarkets: 5,
    nextSettlement: "Feb 20, 2025",
    grade: "Specialty 84+",
    color: "bg-amber-100 text-amber-800",
  },
  {
    id: "avocado",
    name: "Avocado",
    icon: Apple,
    description: "Export grade predictions",
    currentPrice: "$1.85/kg",
    change: "+8.7%",
    trend: "up",
    volume: "$890K",
    activeMarkets: 2,
    nextSettlement: "Mar 10, 2025",
    grade: "Grade A",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "macadamia",
    name: "Macadamia",
    icon: Nut,
    description: "MQA quality standards",
    currentPrice: "$12.30/kg",
    change: "+3.4%",
    trend: "up",
    volume: "$650K",
    activeMarkets: 2,
    nextSettlement: "Apr 5, 2025",
    grade: "MQA_I",
    color: "bg-orange-100 text-orange-800",
  },
]

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const region = ((typeof searchParams?.region === 'string' ? searchParams?.region : '')?.toUpperCase() === 'LATAM'
    ? 'LATAM'
    : 'AFRICA') as Region

  const idToSymbol: Record<string, CommoditySymbol> = {
    tea: 'TEA',
    coffee: 'COFFEE',
    avocado: 'AVOCADO',
    macadamia: 'MACADAMIA',
  }

  const livePrices = await Promise.all(
    commodities.map(async (c) => {
      const symbol = idToSymbol[c.id as keyof typeof idToSymbol]
      if (!symbol) return null
      return getLivePrice(symbol, region)
    })
  )
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            Trade the Future of African Agriculture
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Predict commodity prices and quality grades for Tea, Coffee, Avocado, and Macadamia. Powered by real market
            data and quality standards from across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
            <Button variant={region === 'AFRICA' ? 'default' : 'outline'} asChild>
              <Link href={{ pathname: '/', query: { region: 'AFRICA' } }}>Africa</Link>
            </Button>
            <Button variant={region === 'LATAM' ? 'default' : 'outline'} asChild>
              <Link href={{ pathname: '/', query: { region: 'LATAM' } }}>LATAM</Link>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg">
              <Link href="#markets">Explore Markets</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/grades">Learn Quality Grades</Link>
            </Button>
          </div>
        </div>

        {/* Market Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-2xl font-bold text-foreground">$5.54M</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Markets</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Traders</p>
                  <p className="text-2xl font-bold text-foreground">2,847</p>
                </div>
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-secondary-foreground">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Return</p>
                  <p className="text-2xl font-bold text-primary">+12.4%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commodity Markets Grid */}
        <div id="markets">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">Active Commodity Markets</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {commodities.map((commodity, idx) => {
              const IconComponent = commodity.icon
              const TrendIcon = commodity.trend === "up" ? TrendingUp : TrendingDown

              return (
                <Card key={commodity.id} className="hover:shadow-lg transition-shadow duration-200">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-2xl font-bold text-foreground">
                          {(() => {
                            const lp = livePrices[idx] as Awaited<ReturnType<typeof getLivePrice>> | null
                            if (lp && lp.price !== null) {
                              const unit = lp.unit ? `/${lp.unit}` : ''
                              return `$${lp.price.toFixed(2)}${unit}`
                            }
                            return commodity.currentPrice
                          })()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendIcon
                          className={`w-4 h-4 ${commodity.trend === "up" ? "text-green-600" : "text-red-600"}`}
                        />
                        <span
                          className={`font-semibold ${commodity.trend === "up" ? "text-green-600" : "text-red-600"}`}
                        >
                          {commodity.change}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">24h Volume</p>
                        <p className="font-semibold text-foreground">{commodity.volume}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active Markets</p>
                        <p className="font-semibold text-foreground">{commodity.activeMarkets}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Next Settlement</span>
                        <span className="text-sm font-medium text-foreground">{commodity.nextSettlement}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button asChild className="flex-1">
                          <Link href={{ pathname: `/market/${commodity.id}`, query: { region } }}>Trade Now</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={{ pathname: `/market/${commodity.id}`, query: { region } }}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-8">How AfriMarkets Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground">Choose Your Market</h4>
              <p className="text-muted-foreground text-pretty">
                Select from Tea, Coffee, Avocado, or Macadamia prediction markets based on real quality grades and
                export data.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground">Make Your Prediction</h4>
              <p className="text-muted-foreground text-pretty">
                Buy "Yes" or "No" shares on whether prices or quality metrics will hit specific thresholds by settlement
                dates.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-xl font-semibold text-foreground">Earn Returns</h4>
              <p className="text-muted-foreground text-pretty">
                When markets settle using verified data from auction houses and export boards, correct predictions earn
                profits.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Powered by Chainlink Oracles • Data from FAO, ICE, and African Export Boards</p>
            <p className="text-sm">© 2025 AfriMarkets. Building the future of African commodity trading.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
