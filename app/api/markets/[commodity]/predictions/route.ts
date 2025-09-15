import { NextRequest, NextResponse } from 'next/server'
import { marketPredictions } from '@/lib/data/store'

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