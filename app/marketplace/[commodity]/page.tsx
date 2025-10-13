'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletConnect } from "@/components/wallet-connect"
import { TrendingUp, TrendingDown, ArrowLeft, Info, BarChart3, Clock, Activity, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MarketPredictionCard } from "@/components/blockchain/market-prediction-card"
import { getPrediction, type OnChainPrediction } from "@/lib/blockchain/polygon-client"
import { getLivePrice, type CommoditySymbol } from "@/lib/live-prices"
import { useState, useEffect } from "react"

export const dynamic = 'force-dynamic'

// Type definitions
interface Market {
  id: number
  question: string
  yesPrice: number
  noPrice: number
  volume: string
  participants: number
  deadline: string
  description: string
}

interface QualityInfo {
  grades: string[]
  standards: string
  sources: string
}

interface CommodityData {
  name: string
  description: string
  currentPrice: string
  change: string
  trend: 'up' | 'down'
  volume: string
  totalVolume: string
  participants: number
  grade: string
  color: string
  markets: Market[]
  qualityInfo: QualityInfo
}

type CommodityDataMap = Record<string, CommodityData>

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
  searchParams: {
    region?: string
  }
}

// Commodity symbol mapping
const COMMODITY_MAP: Record<string, CommoditySymbol> = {
  'coffee': 'COFFEE',
  'cocoa': 'COCOA',
  'cotton': 'COTTON',
  'cashew': 'CASHEW',
  'rubber': 'RUBBER',
  'gold': 'GOLD',
  'tea': 'COFFEE', // Fallback - add TEA to live-prices.ts if needed
  'avocado': 'COFFEE', // Fallback
  'macadamia': 'CASHEW', // Fallback
}

// Client Component - Fetch blockchain data on mount
export default function CommodityPage({ params, searchParams }: PageProps) {
  const commodityKey = params.commodity.toLowerCase()
  const region = searchParams.region?.toUpperCase() === 'LATAM' ? 'LATAM' : 'AFRICA'
  const commoditySymbol = COMMODITY_MAP[commodityKey] || 'COFFEE'
  
  const [livePrice, setLivePrice] = useState<{ price: number; unit?: string; source: string } | null>(null)
  const [predictions, setPredictions] = useState<OnChainPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch live price
        const priceData = await getLivePrice(commoditySymbol, region as any)
        setLivePrice({
          price: priceData.price,
          unit: 'kg',
          source: priceData.source
        })

        // Fetch blockchain predictions
        const fetchedPredictions: OnChainPrediction[] = []
        for (let i = 0; i < 20; i++) {
          try {
            const prediction = await getPrediction(i)
            if (prediction.commodity.toLowerCase() === commodityKey.toLowerCase()) {
              fetchedPredictions.push(prediction)
            }
          } catch (error) {
            if (i === 0) {
              console.error('Failed to fetch predictions:', error)
              setFetchError(true)
            }
            break
          }
        }
        setPredictions(fetchedPredictions)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [commodityKey, commoditySymbol, region])

  const TrendIcon = livePrice && livePrice.price > 0 ? TrendingUp : TrendingDown
  const commodityName = commodityKey.charAt(0).toUpperCase() + commodityKey.slice(1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Kalshi Style */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={{ pathname: '/market', query: { region } }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {commodityName}
                </h1>
                <p className="text-sm text-gray-600">Prediction Markets</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Commodity Overview - Kalshi Style */}
        <div className="mb-8">
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-gray-900">{commodityName} Overview</CardTitle>
                  <CardDescription>Current market performance and live data</CardDescription>
                </div>
                {livePrice && (
                  <Badge variant="outline" className="text-xs">
                    Source: {livePrice.source}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">Live Price</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {livePrice ? `$${livePrice.price.toFixed(2)}` : 'Loading...'}
                  </p>
                  {livePrice && (
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-600">
                        per {livePrice.unit}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Active Markets
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    Total Volume
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(predictions.reduce((sum, p) => sum + Number(p.yesStakes + p.noStakes), 0) / 1_000_000).toFixed(2)}K
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Total Traders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {predictions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Markets - Blockchain Data */}
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              Live Prediction Markets
            </h2>
            <Badge variant="outline">
              {predictions.length} On-Chain Markets
            </Badge>
          </div>

          {fetchError && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-yellow-800 font-medium">Unable to fetch blockchain data</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Make sure your wallet is connected and you're on the correct network
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {predictions.length === 0 && !fetchError && (
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No active markets for {commodityName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check back soon or explore other commodities
                  </p>
                  <Button asChild className="mt-4">
                    <Link href={{ pathname: '/market', query: { region } }}>
                      Browse All Markets
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {predictions.map((prediction) => (
            <MarketPredictionCard
              key={prediction.predictionId}
              prediction={prediction}
              onStaked={() => {
                // Refresh page to show updated data
                // In production, use React Query or similar for automatic updates
              }}
            />
          ))}
        </div>

        {/* Market Analysis Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
              <TabsTrigger value="analysis">
                Market Analysis
              </TabsTrigger>
              <TabsTrigger value="history">
                Price History
              </TabsTrigger>
              <TabsTrigger value="news">
                Market News
              </TabsTrigger>
            </TabsList>
            <TabsContent value="analysis" className="mt-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Market Analysis</CardTitle>
                  <CardDescription>Expert insights and market trends for {commodityName}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Current Market Sentiment</h4>
                      <p className="text-gray-600">
                        {commodityName} markets are powered by AI predictions and real-time blockchain data. 
                        Our prediction oracle uses multiple data sources including Alpha Vantage and World Bank 
                        commodity prices to ensure accuracy.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">How It Works</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>AI generates price predictions using advanced models</li>
                        <li>Predictions are submitted on-chain to Polygon network</li>
                        <li>Traders stake USDC on YES or NO outcomes</li>
                        <li>Oracle automatically resolves using real market data</li>
                        <li>Winners claim payouts directly to their wallets</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Price History</CardTitle>
                  <CardDescription>Historical price data from real market sources</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Price chart coming soon</p>
                      <p className="text-sm text-gray-500">Will display Alpha Vantage historical data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="news" className="mt-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Market News</CardTitle>
                  <CardDescription>Latest updates affecting {commodityName} markets</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                      <p className="font-semibold text-gray-900">Real-Time Data Integration</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Platform now uses Alpha Vantage and World Bank APIs for accurate price data.
                      </p>
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Live
                      </p>
                    </div>
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                      <p className="font-semibold text-gray-900">Oracle Resolution Service</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Automated oracle service now resolves predictions using actual market prices.
                      </p>
                      <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Active
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
