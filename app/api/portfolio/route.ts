import { NextRequest, NextResponse } from 'next/server'
import { userPortfolios, currentMarketPrices } from '@/lib/data/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    let portfolio = userPortfolios[userId]
    
    if (!portfolio) {
      // Initialize portfolio for new users
      portfolio = {
        totalInvested: 0,
        positions: {},
        transactions: [],
        createdAt: new Date().toISOString(),
      }
      userPortfolios[userId] = portfolio
    }
    
    // Calculate current values for all positions
    const positions = Object.values(portfolio.positions).map((position: any) => {
      const priceKey = `${position.commodity}_${position.marketId}_${position.orderType}`
      const currentPrice = currentMarketPrices[priceKey as keyof typeof currentMarketPrices] || position.averagePrice
      const currentValue = position.shares * currentPrice
      const unrealizedPnL = currentValue - position.totalCost
      const unrealizedPnLPercentage = position.totalCost > 0 ? (unrealizedPnL / position.totalCost) * 100 : 0
      
      return {
        ...position,
        currentPrice,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercentage,
      }
    })
    
    // Calculate portfolio totals
    const currentValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0)
    const totalReturn = currentValue - portfolio.totalInvested
    const totalReturnPercentage = portfolio.totalInvested > 0 
      ? (totalReturn / portfolio.totalInvested) * 100 
      : 0
    
    // Calculate performance metrics
    const completedTransactions = portfolio.transactions.filter((t: any) => t.status === 'completed')
    const winningTrades = positions.filter((pos: any) => pos.unrealizedPnL > 0).length
    const losingTrades = positions.filter((pos: any) => pos.unrealizedPnL < 0).length
    const winRate = completedTransactions.length > 0 
      ? (winningTrades / completedTransactions.length) * 100 
      : 0
    
    // Get recent transactions (last 10)
    const recentTransactions = portfolio.transactions
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
    
    return NextResponse.json({
      userId,
      totalInvested: portfolio.totalInvested,
      currentValue,
      totalReturn,
      totalReturnPercentage,
      positions,
      performance: {
        totalTrades: completedTransactions.length,
        winningTrades,
        losingTrades,
        winRate,
      },
      recentTransactions,
    })
    
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Initialize portfolio for new user
    if (!userPortfolios[userId]) {
      userPortfolios[userId] = {
        totalInvested: 0,
        positions: {},
        transactions: [],
        createdAt: new Date().toISOString(),
      }
    }
    
    return NextResponse.json({
      message: 'Portfolio initialized successfully',
      portfolio: userPortfolios[userId],
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error initializing portfolio:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get portfolio summary statistics
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const portfolio = userPortfolios[userId]
    
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }
    
    // Recalculate all position values with latest market prices
    const positions = Object.values(portfolio.positions)
    let totalCurrentValue = 0
    
    for (const position of positions) {
      const pos = position as any
      const priceKey = `${pos.commodity}_${pos.marketId}_${pos.orderType}`
      const currentPrice = currentMarketPrices[priceKey as keyof typeof currentMarketPrices] || pos.averagePrice
      const currentValue = pos.shares * currentPrice
      totalCurrentValue += currentValue
      
      // Update position with latest values
      pos.lastUpdated = new Date().toISOString()
    }
    
    const summary = {
      totalInvested: portfolio.totalInvested,
      currentValue: totalCurrentValue,
      totalReturn: totalCurrentValue - portfolio.totalInvested,
      totalReturnPercentage: portfolio.totalInvested > 0 
        ? ((totalCurrentValue - portfolio.totalInvested) / portfolio.totalInvested) * 100 
        : 0,
      lastUpdated: new Date().toISOString(),
    }
    
    return NextResponse.json({
      message: 'Portfolio updated successfully',
      summary,
    })
    
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}