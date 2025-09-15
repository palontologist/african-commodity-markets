import { NextRequest, NextResponse } from 'next/server'

// Mock prediction market data - in production this would come from a database
const marketPredictions = {
  tea: [
    {
      id: 1,
      question: "Will Kenya Tea Board auction average exceed $2.50/kg by Jan 15, 2025?",
      yesPrice: 0.67,
      noPrice: 0.33,
      volume: "$450K",
      participants: 156,
      deadline: "Jan 15, 2025",
      description: "Based on CTC BOP grade tea from Mombasa auctions",
      status: "active",
      totalVolume: 450000,
      yesShares: 295000,
      noShares: 155000,
    },
    {
      id: 2,
      question: "Will Tanzania Tea Board report >85% Grade 1 tea by Feb 1, 2025?",
      yesPrice: 0.42,
      noPrice: 0.58,
      volume: "$380K",
      participants: 98,
      deadline: "Feb 1, 2025",
      description: "Quality grade percentage from Tanzania Tea Board monthly reports",
      status: "active",
      totalVolume: 380000,
      yesShares: 159600,
      noShares: 220400,
    },
  ],
  coffee: [
    {
      id: 1,
      question: "Will Ethiopian coffee average SCA score exceed 85 by Mar 20, 2025?",
      yesPrice: 0.73,
      noPrice: 0.27,
      volume: "$1.1M",
      participants: 234,
      deadline: "Mar 20, 2025",
      description: "Based on Ethiopian Commodity Exchange specialty coffee auctions",
      status: "active",
      totalVolume: 1100000,
      yesShares: 803000,
      noShares: 297000,
    },
    {
      id: 2,
      question: "Will Kenyan AA coffee price exceed $6.00/lb by Feb 28, 2025?",
      yesPrice: 0.38,
      noPrice: 0.62,
      volume: "$890K",
      participants: 189,
      deadline: "Feb 28, 2025",
      description: "Nairobi Coffee Exchange auction prices for AA grade",
      status: "active",
      totalVolume: 890000,
      yesShares: 338200,
      noShares: 551800,
    },
  ],
  avocado: [
    {
      id: 1,
      question: "Will Kenya avocado exports exceed 50,000 tons by Apr 30, 2025?",
      yesPrice: 0.55,
      noPrice: 0.45,
      volume: "$520K",
      participants: 123,
      deadline: "Apr 30, 2025",
      description: "Based on Kenya Plant Health Inspectorate Service export data",
      status: "active",
      totalVolume: 520000,
      yesShares: 286000,
      noShares: 234000,
    },
  ],
  macadamia: [
    {
      id: 1,
      question: "Will South African macadamia price exceed $13.00/kg by May 15, 2025?",
      yesPrice: 0.61,
      noPrice: 0.39,
      volume: "$650K",
      participants: 145,
      deadline: "May 15, 2025",
      description: "Based on South African Macadamia Growers Association pricing",
      status: "active",
      totalVolume: 650000,
      yesShares: 396500,
      noShares: 253500,
    },
  ],
}

export async function GET(
  request: NextRequest,
  { params }: { params: { commodity: string } }
) {
  try {
    const commodity = params.commodity
    const predictions = marketPredictions[commodity as keyof typeof marketPredictions]
    
    if (!predictions) {
      return NextResponse.json(
        { error: 'Commodity market not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      commodity,
      predictions,
      totalMarkets: predictions.length,
      activeMarkets: predictions.filter(p => p.status === 'active').length,
    })
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { commodity: string } }
) {
  try {
    const commodity = params.commodity
    const body = await request.json()
    const { question, description, deadline } = body
    
    if (!question || !description || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (!marketPredictions[commodity as keyof typeof marketPredictions]) {
      return NextResponse.json(
        { error: 'Commodity market not found' },
        { status: 404 }
      )
    }
    
    const predictions = marketPredictions[commodity as keyof typeof marketPredictions]
    const newId = Math.max(...predictions.map(p => p.id)) + 1
    
    const newPrediction = {
      id: newId,
      question,
      description,
      deadline,
      yesPrice: 0.5,
      noPrice: 0.5,
      volume: "$0",
      participants: 0,
      status: "active" as const,
      totalVolume: 0,
      yesShares: 0,
      noShares: 0,
    }
    
    predictions.push(newPrediction)
    
    return NextResponse.json(newPrediction, { status: 201 })
  } catch (error) {
    console.error('Error creating prediction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}