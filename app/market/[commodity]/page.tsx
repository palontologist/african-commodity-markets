"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingModal } from "@/components/trading-modal"
import { WalletConnect } from "@/components/wallet-connect"
import { MarketHealthIndicator } from "@/components/market-health-indicator"
import { TrendingUp, TrendingDown, ArrowLeft, Info, Calendar, DollarSign, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import { notFound, useSearchParams } from "next/navigation"

type CommodityMarket = {
  id: number
  question: string
  yesPrice: number
  noPrice: number
  volume: string
  participants: number
  deadline: string
  description: string
}

type CommodityView = {
  name: string
  description: string
  currentPrice: string
  change: string
  trend: "up" | "down"
  volume: string
  totalVolume: string
  participants: number
  grade: string
  color: string
  markets: CommodityMarket[]
  qualityInfo: {
    grades: string[]
    standards: string
    sources: string
  }
}

type CommodityDataMap = Record<"tea" | "coffee" | "avocado" | "macadamia", CommodityView>

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function nextMonthEnd(offsetMonths = 1) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  // Last day of target month: new Date(year, month+1, 0)
  const target = new Date(y, m + offsetMonths + 1, 0)
  return formatDate(target)
}

function nextQuarterEnd() {
  const now = new Date()
  const qEnds = [new Date(now.getFullYear(), 2, 31), new Date(now.getFullYear(), 5, 30), new Date(now.getFullYear(), 8, 30), new Date(now.getFullYear(), 11, 31)]
  let next = qEnds.find(d => d > now)
  if (!next) {
    next = new Date(now.getFullYear() + 1, 2, 31)
  }
  return formatDate(next)
}

function nextFixedMonthDay(monthIndex: number, day: number) {
  const now = new Date()
  let d = new Date(now.getFullYear(), monthIndex, day)
  if (d <= now) {
    d = new Date(now.getFullYear() + 1, monthIndex, day)
  }
  return formatDate(d)
}

const commodityDataAfrica: CommodityDataMap = {
  tea: {
    name: "Tea",
    description: "CTC grades prediction market",
    currentPrice: "$2.45/kg",
    change: "+5.2%",
    trend: "up",
    volume: "$1.2M",
    totalVolume: "$1.2M",
    participants: 342,
    grade: "BOP Grade",
    color: "bg-green-100 text-green-800",
    markets: [
      {
        id: 1,
        question: `Will Kenya Tea Board auction average exceed $2.50/kg by ${nextFixedMonthDay(0, 15)}?`,
        yesPrice: 0.67,
        noPrice: 0.33,
        volume: "$450K",
        participants: 156,
        deadline: nextFixedMonthDay(0, 15),
        description: "Based on CTC BOP grade tea from Mombasa auctions",
      },
      {
        id: 2,
        question: `Will Tanzania Tea Board report >85% Grade 1 tea by ${nextFixedMonthDay(1, 1)}?`,
        yesPrice: 0.42,
        noPrice: 0.58,
        volume: "$380K",
        participants: 98,
        deadline: nextFixedMonthDay(1, 1),
        description: "Quality grade percentage from Tanzania Tea Board monthly reports",
      },
    ],
    qualityInfo: {
      grades: ["OP (Orange Pekoe)", "BOP (Broken Orange Pekoe)", "Fannings", "Dust"],
      standards: "East African Tea Trade Association (EATTA) standards",
      sources: "Kenya Tea Board, Tanzania Tea Board, Malawi Tea Association",
    },
  },
  coffee: {
    name: "Coffee",
    description: "SCA score-based futures",
    currentPrice: "$4.80/lb",
    change: "-2.1%",
    trend: "down",
    volume: "$2.8M",
    totalVolume: "$2.8M",
    participants: 567,
    grade: "Specialty 84+",
    color: "bg-amber-100 text-amber-800",
    markets: [
      {
        id: 1,
        question: `Will Ethiopian coffee average SCA score exceed 85 by ${nextFixedMonthDay(2, 20)}?`,
        yesPrice: 0.73,
        noPrice: 0.27,
        volume: "$1.1M",
        participants: 234,
        deadline: nextFixedMonthDay(2, 20),
        description: "Based on Ethiopian Commodity Exchange specialty coffee auctions",
      },
      {
        id: 2,
        question: `Will Kenyan AA coffee price exceed $6.00/lb by ${nextFixedMonthDay(1, 28)}?`,
        yesPrice: 0.38,
        noPrice: 0.62,
        volume: "$890K",
        participants: 189,
        deadline: nextFixedMonthDay(1, 28),
        description: "Nairobi Coffee Exchange auction prices for AA grade",
      },
    ],
    qualityInfo: {
      grades: ["Specialty (84+)", "Premium (80-84)", "Commercial (<80)"],
      standards: "Specialty Coffee Association (SCA) scoring system",
      sources: "Ethiopian Commodity Exchange, Nairobi Coffee Exchange, ICO reports",
    },
  },
  avocado: {
    name: "Avocado",
    description: "Export grade predictions",
    currentPrice: "$1.85/kg",
    change: "+8.7%",
    trend: "up",
    volume: "$890K",
    totalVolume: "$890K",
    participants: 198,
    grade: "Grade A",
    color: "bg-emerald-100 text-emerald-800",
    markets: [
      {
        id: 1,
        question: `Will Kenya avocado exports exceed 50,000 tons by ${nextFixedMonthDay(3, 30)}?`,
        yesPrice: 0.55,
        noPrice: 0.45,
        volume: "$520K",
        participants: 123,
        deadline: nextFixedMonthDay(3, 30),
        description: "Based on Kenya Plant Health Inspectorate Service export data",
      },
    ],
    qualityInfo: {
      grades: ["Grade A (Premium)", "Grade B (Standard)", "Grade C (Processing)"],
      standards: "Kenya Plant Health Inspectorate Service (KEPHIS) standards",
      sources: "KEPHIS, Fresh Produce Exporters Association of Kenya",
    },
  },
  macadamia: {
    name: "Macadamia",
    description: "MQA quality standards",
    currentPrice: "$12.30/kg",
    change: "+3.4%",
    trend: "up",
    volume: "$650K",
    totalVolume: "$650K",
    participants: 145,
    grade: "MQA_I",
    color: "bg-orange-100 text-orange-800",
    markets: [
      {
        id: 1,
        question: `Will South African macadamia price exceed $13.00/kg by ${nextFixedMonthDay(4, 15)}?`,
        yesPrice: 0.61,
        noPrice: 0.39,
        volume: "$650K",
        participants: 145,
        deadline: nextFixedMonthDay(4, 15),
        description: "Based on South African Macadamia Growers Association pricing",
      },
    ],
    qualityInfo: {
      grades: ["MQA_I (Premium)", "MQA_II (Standard)", "MQA_III (Processing)"],
      standards: "Macadamia Quality Assurance (MQA) international standards",
      sources: "SA Macadamia Growers Association, Kenya Nut Company",
    },
  },
}

const commodityDataLatam: CommodityDataMap = {
  tea: {
    name: "Tea",
    description: "Argentina Misiones tea auction predictions",
    currentPrice: "$2.10/kg",
    change: "+3.1%",
    trend: "up",
    volume: "$420K",
    totalVolume: "$420K",
    participants: 128,
    grade: "BOP Grade",
    color: "bg-green-100 text-green-800",
    markets: [
      {
        id: 101,
        question: "Will Argentina Misiones tea auction avg exceed $2.20/kg by Jan 31, 2025?",
        yesPrice: 0.54,
        noPrice: 0.46,
        volume: "$180K",
        participants: 72,
        deadline: "Jan 31, 2025",
        description: "Based on provincial auction averages from Misiones",
      },
    ],
    qualityInfo: {
      grades: ["OP", "BOP", "Fannings", "Dust"],
      standards: "Regional grading aligned with international black tea standards",
      sources: "Misiones Tea Auctions, Argentina tea industry reports",
    },
  },
  coffee: {
    name: "Coffee",
    description: "LATAM coffee markets (Brazil, Colombia)",
    currentPrice: "$4.60/lb",
    change: "+1.5%",
    trend: "up",
    volume: "$3.2M",
    totalVolume: "$3.2M",
    participants: 612,
    grade: "Specialty 84+",
    color: "bg-amber-100 text-amber-800",
    markets: [
      {
        id: 102,
        question: `Will Brazil CECAFÉ exports exceed 3.5M bags by ${nextQuarterEnd()}?`,
        yesPrice: 0.58,
        noPrice: 0.42,
        volume: "$1.2M",
        participants: 280,
        deadline: nextQuarterEnd(),
        description: "Based on CECAFÉ monthly export data",
      },
      {
        id: 103,
        question: `Will Colombia FNC internal price exceed 1,500,000 COP/125kg by ${nextMonthEnd(2)}?`,
        yesPrice: 0.41,
        noPrice: 0.59,
        volume: "$950K",
        participants: 204,
        deadline: nextMonthEnd(2),
        description: "Based on Federación Nacional de Cafeteros daily price",
      },
    ],
    qualityInfo: {
      grades: ["Specialty (84+)", "Premium (80-84)", "Commercial (<80)"],
      standards: "SCA cupping standards used across LATAM specialty markets",
      sources: "CECAFÉ, FNC Colombia, ICO reports",
    },
  },
  avocado: {
    name: "Avocado",
    description: "Mexico and Peru export grade predictions",
    currentPrice: "$2.10/kg",
    change: "+4.2%",
    trend: "up",
    volume: "$1.1M",
    totalVolume: "$1.1M",
    participants: 236,
    grade: "Grade A",
    color: "bg-emerald-100 text-emerald-800",
    markets: [
      {
        id: 104,
        question: `Will Mexico avocado export avg exceed $2.20/kg by ${nextMonthEnd(4)}?`,
        yesPrice: 0.57,
        noPrice: 0.43,
        volume: "$600K",
        participants: 130,
        deadline: nextMonthEnd(4),
        description: "Based on Avocados From Mexico export pricing",
      },
      {
        id: 105,
        question: "Will Peru avocado shipments exceed 600k MT by the 2025-2026 season end?",
        yesPrice: 0.35,
        noPrice: 0.65,
        volume: "$500K",
        participants: 106,
        deadline: nextMonthEnd(11),
        description: "Based on Peru exporters’ association seasonal reports",
      },
    ],
    qualityInfo: {
      grades: ["Grade A (Premium)", "Grade B (Standard)", "Grade C (Processing)"],
      standards: "Mexico and Peru export standards based on size, defects, and firmness",
      sources: "Avocados From Mexico, SENASA Peru",
    },
  },
  macadamia: {
    name: "Macadamia",
    description: "LATAM macadamia markets (Brazil, Guatemala)",
    currentPrice: "$11.90/kg",
    change: "+2.0%",
    trend: "up",
    volume: "$520K",
    totalVolume: "$520K",
    participants: 132,
    grade: "MQA_I",
    color: "bg-orange-100 text-orange-800",
    markets: [
      {
        id: 106,
        question: `Will Brazil macadamia farmgate exceed $13.00/kg by ${nextFixedMonthDay(4, 15)}?`,
        yesPrice: 0.46,
        noPrice: 0.54,
        volume: "$320K",
        participants: 88,
        deadline: nextFixedMonthDay(4, 15),
        description: "Based on regional processors’ price bulletins in Bahia/Minas Gerais",
      },
    ],
    qualityInfo: {
      grades: ["MQA_I (Premium)", "MQA_II (Standard)", "MQA_III (Processing)"],
      standards: "MQA standards applied by LATAM processors",
      sources: "Brazilian Macadamia sector reports, regional processors",
    },
  },
}

interface PageProps {
  params: {
    commodity: string
  }
}

export default function CommodityPage({ params }: PageProps) {
  const [selectedMarket, setSelectedMarket] = useState<any>(null)
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [livePrice, setLivePrice] = useState<{ price: number | null; unit?: string } | null>(null)
  const searchParams = useSearchParams()
  const region = (searchParams.get('region')?.toUpperCase() === 'LATAM' ? 'LATAM' : 'AFRICA')

  const selectedCommodityData: CommodityDataMap = region === 'LATAM' ? commodityDataLatam : commodityDataAfrica
  const commodity = selectedCommodityData[params.commodity as keyof CommodityDataMap]

  if (!commodity) {
    notFound()
  }

  const TrendIcon = commodity.trend === "up" ? TrendingUp : TrendingDown

  useEffect(() => {
    async function loadLive() {
      const idToSymbol: Record<string, string> = {
        tea: 'TEA',
        coffee: 'COFFEE',
        avocado: 'AVOCADO',
        macadamia: 'MACADAMIA',
      }
      const symbol = idToSymbol[params.commodity]
      if (!symbol) return
      try {
        const res = await fetch(`/api/live-prices?symbol=${symbol}&region=${region}`, { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const data = json?.data
        if (data) {
          setLivePrice({ price: data.price ?? null, unit: data.unit })
        }
      } catch {}
    }
    loadLive()
  }, [params.commodity, region])

  const handleTradeClick = (market: any) => {
    setSelectedMarket(market)
    setIsTradeModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={{ pathname: '/', query: { region } }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Markets
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{commodity.name} Markets</h1>
                <p className="text-sm text-muted-foreground">{commodity.description}</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Commodity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{commodity.name} Overview</CardTitle>
                  <CardDescription>Current market performance and statistics</CardDescription>
                </div>
                <Badge className={commodity.color}>{commodity.grade}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    {livePrice && livePrice.price !== null
                      ? `$${livePrice.price.toFixed(2)}${livePrice.unit ? `/${livePrice.unit}` : ''}`
                      : commodity.currentPrice}
                  </p>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <TrendIcon className={`w-4 h-4 ${commodity.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                    <span
                      className={`text-sm font-semibold ${
                        commodity.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {commodity.change}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-xl font-bold text-foreground">{commodity.volume}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-xl font-bold text-foreground">{commodity.totalVolume}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-xl font-bold text-foreground">{commodity.participants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Quality Standards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Grades</p>
                <div className="space-y-1">
                  {commodity.qualityInfo.grades.map((grade, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {grade}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Standards</p>
                <p className="text-sm text-muted-foreground">{commodity.qualityInfo.standards}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Data Sources</p>
                <p className="text-sm text-muted-foreground">{commodity.qualityInfo.sources}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Markets */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Active Markets</h2>
          {commodity.markets.map((market) => (
            <Card key={market.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-balance">{market.question}</CardTitle>
                    <CardDescription className="mt-2">{market.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{market.deadline}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Market Health Indicator */}
                <div className="mb-6">
                  <MarketHealthIndicator market={market} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* YES/NO Prices */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">YES</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                          ${market.yesPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          {(market.yesPrice * 100).toFixed(0)}% chance
                        </p>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleTradeClick(market)}>
                        Buy YES
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-400">NO</p>
                        <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                          ${market.noPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-500">
                          {(market.noPrice * 100).toFixed(0)}% chance
                        </p>
                      </div>
                      <Button variant="destructive" onClick={() => handleTradeClick(market)}>
                        Buy NO
                      </Button>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Volume</p>
                          <p className="font-semibold text-foreground">{market.volume}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Traders</p>
                          <p className="font-semibold text-foreground">{market.participants}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Market Confidence</span>
                        <span className="text-sm font-medium text-foreground">
                          {Math.max(market.yesPrice, market.noPrice) > 0.6 ? "High" : "Moderate"}
                        </span>
                      </div>
                      <Progress value={Math.max(market.yesPrice, market.noPrice) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Analysis Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
              <TabsTrigger value="history">Price History</TabsTrigger>
              <TabsTrigger value="news">Market News</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Analysis</CardTitle>
                  <CardDescription>Expert insights and market trends for {commodity.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Current Market Sentiment</h4>
                      <p className="text-muted-foreground text-pretty">
                        {commodity.trend === "up"
                          ? `${commodity.name} markets are showing strong bullish sentiment with increased trading volume and positive price momentum. Quality grades remain stable with strong export demand.`
                          : `${commodity.name} markets are experiencing some volatility with mixed signals from export data. Traders are closely watching quality grade reports and seasonal factors.`}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Key Factors to Watch</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Seasonal harvest patterns and weather conditions</li>
                        <li>Export board quality grade certifications</li>
                        <li>International demand and shipping logistics</li>
                        <li>Currency fluctuations affecting export pricing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                  <CardDescription>Historical price data and market performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Price chart integration coming soon</p>
                      <p className="text-sm text-muted-foreground">Will display historical data from market oracles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="news" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market News</CardTitle>
                  <CardDescription>Latest updates affecting {commodity.name} markets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-primary bg-muted/20">
                      <p className="font-medium text-foreground">Export Board Updates</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Latest quality grade certifications and export volume reports from regional boards.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
                    </div>
                    <div className="p-4 border-l-4 border-secondary bg-muted/20">
                      <p className="font-medium text-foreground">Seasonal Forecast</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Weather patterns and harvest predictions affecting {commodity.name.toLowerCase()} production.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">6 hours ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {selectedMarket && (
        <TradingModal
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          market={selectedMarket}
          commodity={commodity.name}
        />
      )}
    </div>
  )
}
