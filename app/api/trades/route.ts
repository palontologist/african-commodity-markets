import { NextRequest, NextResponse } from 'next/server'
import { userPortfolios, transactionHistory } from '@/lib/data/store'

// Simple price calculation based on current market state
function calculateNewPrice(currentPrice: number, orderType: 'yes' | 'no', orderAmount: number, totalVolume: number) {
  // Simple automated market maker formula
  const k = 0.001 // Liquidity constant
  const impact = (orderAmount / totalVolume) * k
  
  if (orderType === 'yes') {
    return Math.min(0.95, currentPrice + impact)
  } else {
    return Math.max(0.05, currentPrice - impact)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      marketId, 
      commodity, 
      orderType, 
      amount, 
      shares, 
      currentPrice 
    } = body
    
    // Validate required fields
    if (!userId || !marketId || !commodity || !orderType || !amount || !shares) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (!['yes', 'no'].includes(orderType)) {
      return NextResponse.json(
        { error: 'Invalid order type. Must be "yes" or "no"' },
        { status: 400 }
      )
    }
    
    if (amount <= 0 || shares <= 0) {
      return NextResponse.json(
        { error: 'Amount and shares must be positive' },
        { status: 400 }
      )
    }
    
    // Calculate the actual cost based on current price
    const actualCost = shares * currentPrice
    const slippage = Math.abs(actualCost - amount) / amount
    
    if (slippage > 0.05) { // 5% maximum slippage
      return NextResponse.json(
        { error: 'Slippage too high. Try reducing order size.' },
        { status: 400 }
      )
    }
    
    // Create transaction record
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      marketId,
      commodity,
      orderType,
      shares,
      pricePerShare: currentPrice,
      totalCost: actualCost,
      timestamp: new Date().toISOString(),
      status: 'completed',
    }
    
    // Update user portfolio
    if (!userPortfolios[userId]) {
      userPortfolios[userId] = {
        totalInvested: 0,
        positions: {},
        transactions: [],
      }
    }
    
    const portfolio = userPortfolios[userId]
    const positionKey = `${commodity}_${marketId}_${orderType}`
    
    if (!portfolio.positions[positionKey]) {
      portfolio.positions[positionKey] = {
        commodity,
        marketId,
        orderType,
        shares: 0,
        averagePrice: 0,
        totalCost: 0,
      }
    }
    
    const position = portfolio.positions[positionKey]
    const newTotalShares = position.shares + shares
    const newTotalCost = position.totalCost + actualCost
    
    position.shares = newTotalShares
    position.totalCost = newTotalCost
    position.averagePrice = newTotalCost / newTotalShares
    
    portfolio.totalInvested += actualCost
    portfolio.transactions.push(transaction)
    
    // Add to global transaction history
    transactionHistory.push(transaction)
    
    // Calculate new market price (simplified)
    const newPrice = calculateNewPrice(currentPrice, orderType, actualCost, 100000) // Mock total volume
    
    return NextResponse.json({
      transaction,
      newMarketPrice: {
        yesPrice: orderType === 'yes' ? newPrice : 1 - newPrice,
        noPrice: orderType === 'no' ? newPrice : 1 - newPrice,
      },
      portfolio: portfolio.positions[positionKey],
      message: 'Trade executed successfully',
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error executing trade:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (userId) {
      // Return user's transaction history
      const userTransactions = transactionHistory
        .filter(t => t.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
      
      return NextResponse.json({
        transactions: userTransactions,
        totalTransactions: userTransactions.length,
      })
    }
    
    // Return recent global transactions (anonymized)
    const recentTransactions = transactionHistory
      .map(t => ({
        id: t.id,
        commodity: t.commodity,
        orderType: t.orderType,
        shares: t.shares,
        pricePerShare: t.pricePerShare,
        timestamp: t.timestamp,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
    
    return NextResponse.json({
      transactions: recentTransactions,
      totalTransactions: transactionHistory.length,
    })
    
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}