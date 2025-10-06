"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingModal } from "@/components/trading-modal"
import { WalletConnect } from "@/components/wallet-connect"
import { TrendingUp, TrendingDown, ArrowLeft, Info, Calendar, DollarSign, Users, BarChart3, Clock, Activity } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header with purple theme */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-purple-50">
                <Link href={{ pathname: '/market', query: { region } }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Markets
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {commodity.name} Prediction Markets
                </h1>
                <p className="text-sm text-slate-600">{commodity.description}</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Commodity Overview - Purple themed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-purple-200 shadow-lg shadow-purple-100/50">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-purple-900">{commodity.name} Overview</CardTitle>
                  <CardDescription className="text-purple-600">Current market performance and statistics</CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">{commodity.grade}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Current Price</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {livePrice && livePrice.price !== null
                      ? `$${livePrice.price.toFixed(2)}${livePrice.unit ? `/${livePrice.unit}` : ''}`
                      : commodity.currentPrice}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendIcon className={`w-4 h-4 ${commodity.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                    <span
                      className={`text-sm font-semibold ${
                        commodity.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {commodity.change}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    24h Volume
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{commodity.volume}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    Total Volume
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{commodity.totalVolume}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Participants
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{commodity.participants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-lg shadow-purple-100/50">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="flex items-center space-x-2 text-purple-900">
                <Info className="w-5 h-5" />
                <span>Quality Standards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Available Grades</p>
                <div className="flex flex-wrap gap-2">
                  {commodity.qualityInfo.grades.map((grade, index) => (
                    <Badge key={index} className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                      {grade}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Standards</p>
                <p className="text-sm text-slate-600">{commodity.qualityInfo.standards}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Data Sources</p>
                <p className="text-sm text-slate-600">{commodity.qualityInfo.sources}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Markets - Kalshi Style */}
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Active Prediction Markets
            </h2>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              {commodity.markets.length} Markets
            </Badge>
          </div>
          {commodity.markets.map((market) => (
            <Card key={market.id} className="hover:shadow-xl transition-all duration-300 border-purple-100 hover:border-purple-300 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 leading-tight">{market.question}</CardTitle>
                    <CardDescription className="mt-2 text-slate-600">{market.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600">{market.deadline}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Probability Bars - Kalshi Style */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Market Probability</span>
                    <span className="text-xs text-slate-500">{market.participants} traders</span>
                  </div>
                  <div className="relative h-12 flex rounded-lg overflow-hidden shadow-sm">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-between px-4 transition-all duration-300"
                      style={{ width: `${market.yesPrice * 100}%` }}
                    >
                      <span className="text-white font-bold text-sm">YES</span>
                      <span className="text-white font-bold text-lg">{(market.yesPrice * 100).toFixed(0)}¢</span>
                    </div>
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-between px-4 transition-all duration-300"
                      style={{ width: `${market.noPrice * 100}%` }}
                    >
                      <span className="text-white font-bold text-lg">{(market.noPrice * 100).toFixed(0)}¢</span>
                      <span className="text-white font-bold text-sm">NO</span>
                    </div>
                  </div>
                </div>

                {/* Trading Buttons - Kalshi Style */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleTradeClick(market)}
                    className="h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center">
                      <span>Buy YES</span>
                      <span className="text-xs font-normal opacity-90">${market.yesPrice.toFixed(2)} per share</span>
                    </div>
                  </Button>
                  <Button 
                    onClick={() => handleTradeClick(market)}
                    className="h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-lg shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center">
                      <span>Buy NO</span>
                      <span className="text-xs font-normal opacity-90">${market.noPrice.toFixed(2)} per share</span>
                    </div>
                  </Button>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-100">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center text-purple-500">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Volume</p>
                    <p className="font-bold text-slate-900">{market.volume}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center text-purple-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Traders</p>
                    <p className="font-bold text-slate-900">{market.participants}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center text-purple-500">
                      <Activity className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Liquidity</p>
                    <p className="font-bold text-green-600">High</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Analysis Tabs - Purple Theme */}
        <div className="mt-12">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-purple-100 p-1">
              <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Market Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Price History
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Market News
              </TabsTrigger>
            </TabsList>
            <TabsContent value="analysis" className="mt-6">
              <Card className="border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-purple-900">Market Analysis</CardTitle>
                  <CardDescription className="text-purple-600">Expert insights and market trends for {commodity.name}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
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
              <Card className="border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-purple-900">Price History</CardTitle>
                  <CardDescription className="text-purple-600">Historical price data and market performance</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-dashed border-purple-200">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                      <p className="text-purple-600 font-medium">Price chart integration coming soon</p>
                      <p className="text-sm text-purple-500">Will display historical data from market oracles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="news" className="mt-6">
              <Card className="border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-purple-900">Market News</CardTitle>
                  <CardDescription className="text-purple-600">Latest updates affecting {commodity.name} markets</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                      <p className="font-semibold text-slate-900">Export Board Updates</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Latest quality grade certifications and export volume reports from regional boards.
                      </p>
                      <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        2 hours ago
                      </p>
                    </div>
                    <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
                      <p className="font-semibold text-slate-900">Seasonal Forecast</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Weather patterns and harvest predictions affecting {commodity.name.toLowerCase()} production.
                      </p>
                      <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        6 hours ago
                      </p>
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
