import { NextRequest, NextResponse } from 'next/server'

// Mock market data - in production this would come from a database
const markets = [
  {
    id: "tea",
    name: "Tea",
    description: "CTC grades prediction market",
    currentPrice: "$2.45/kg",
    change: "+5.2%",
    trend: "up",
    volume: "$1.2M",
    activeMarkets: 3,
    nextSettlement: "Jan 15, 2025",
    grade: "BOP Grade",
    participants: 342,
    totalVolume: "$1.2M",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "coffee",
    name: "Coffee", 
    description: "SCA score-based futures",
    currentPrice: "$4.80/lb",
    change: "-2.1%",
    trend: "down",
    volume: "$2.8M",
    activeMarkets: 5,
    nextSettlement: "Feb 20, 2025",
    grade: "Specialty 84+",
    participants: 567,
    totalVolume: "$2.8M",
    color: "bg-amber-100 text-amber-800",
  },
  {
    id: "avocado",
    name: "Avocado",
    description: "Export grade predictions",
    currentPrice: "$1.85/kg",
    change: "+8.7%",
    trend: "up",
    volume: "$890K",
    activeMarkets: 2,
    nextSettlement: "Mar 10, 2025", 
    grade: "Grade A",
    participants: 198,
    totalVolume: "$890K",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "macadamia",
    name: "Macadamia",
    description: "MQA quality standards",
    currentPrice: "$12.30/kg",
    change: "+3.4%",
    trend: "up",
    volume: "$650K",
    activeMarkets: 2,
    nextSettlement: "Apr 5, 2025",
    grade: "MQA_I",
    participants: 145,
    totalVolume: "$650K", 
    color: "bg-orange-100 text-orange-800",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commodityId = searchParams.get('commodity')
    
    if (commodityId) {
      const market = markets.find(m => m.id === commodityId)
      if (!market) {
        return NextResponse.json(
          { error: 'Market not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(market)
    }
    
    return NextResponse.json(markets)
  } catch (error) {
    console.error('Error fetching markets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, currentPrice, grade } = body
    
    if (!name || !description || !currentPrice || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const newMarket = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      currentPrice,
      grade,
      change: "+0.0%",
      trend: "neutral",
      volume: "$0",
      activeMarkets: 0,
      nextSettlement: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      participants: 0,
      totalVolume: "$0",
      color: "bg-gray-100 text-gray-800",
    }
    
    markets.push(newMarket)
    
    return NextResponse.json(newMarket, { status: 201 })
  } catch (error) {
    console.error('Error creating market:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}