import { NextRequest, NextResponse } from 'next/server'
import { platformStats } from '@/lib/data/store'

// Mock historical data for charts
const historicalData = {
  volumeHistory: [
    { date: '2024-12-01', volume: 4200000 },
    { date: '2024-12-02', volume: 4450000 },
    { date: '2024-12-03', volume: 4780000 },
    { date: '2024-12-04', volume: 5100000 },
    { date: '2024-12-05', volume: 5340000 },
    { date: '2024-12-06', volume: 5540000 },
  ],
  traderGrowth: [
    { date: '2024-12-01', traders: 2234 },
    { date: '2024-12-02', traders: 2367 },
    { date: '2024-12-03', traders: 2501 },
    { date: '2024-12-04', traders: 2634 },
    { date: '2024-12-05', traders: 2741 },
    { date: '2024-12-06', traders: 2847 },
  ],
  commodityPerformance: [
    { commodity: 'tea', return: 8.2, volume: 1200000 },
    { commodity: 'coffee', return: -2.1, volume: 2800000 },
    { commodity: 'avocado', return: 15.7, volume: 890000 },
    { commodity: 'macadamia', return: 9.4, volume: 650000 },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const period = searchParams.get('period') || '7d'
    
    // Simulate real-time updates by adding small random variations
    const now = new Date()
    const timeSinceLastUpdate = now.getTime() - new Date(platformStats.lastUpdated).getTime()
    
    if (timeSinceLastUpdate > 60000) { // Update every minute for demo
      platformStats.totalVolume += Math.random() * 10000 - 5000
      platformStats.totalTraders += Math.floor(Math.random() * 5)
      platformStats.last24hVolume += Math.random() * 5000 - 2500
      platformStats.last24hTrades += Math.floor(Math.random() * 3)
      platformStats.averageReturn += (Math.random() - 0.5) * 0.2
      platformStats.lastUpdated = now.toISOString()
    }
    
    if (type === 'overview') {
      return NextResponse.json({
        totalVolume: Math.round(platformStats.totalVolume),
        activeMarkets: platformStats.activeMarkets,
        totalTraders: platformStats.totalTraders,
        averageReturn: parseFloat(platformStats.averageReturn.toFixed(1)),
        last24h: {
          volume: Math.round(platformStats.last24hVolume),
          trades: platformStats.last24hTrades,
          volumeChange: '+12.3%',
          tradesChange: '+8.7%',
        },
        sentiment: platformStats.marketSentiment,
        topPerforming: platformStats.topPerformingCommodity,
        mostActive: platformStats.mostActiveCommodity,
        lastUpdated: platformStats.lastUpdated,
      })
    }
    
    if (type === 'historical') {
      let data = historicalData
      
      // Filter by period
      if (period === '24h') {
        data = {
          ...data,
          volumeHistory: data.volumeHistory.slice(-1),
          traderGrowth: data.traderGrowth.slice(-1),
        }
      } else if (period === '7d') {
        // Return last 7 days (current mock data)
      } else if (period === '30d') {
        // For demo, just repeat the pattern
        const extended = []
        for (let i = 0; i < 30; i++) {
          extended.push({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            volume: 3000000 + Math.random() * 3000000,
          })
        }
        data = {
          ...data,
          volumeHistory: extended,
        }
      }
      
      return NextResponse.json(data)
    }
    
    if (type === 'commodities') {
      return NextResponse.json({
        performance: historicalData.commodityPerformance.map(item => ({
          ...item,
          return: parseFloat(item.return.toFixed(1)),
          volume: Math.round(item.volume),
          change24h: (Math.random() - 0.5) * 10, // Random 24h change for demo
        })),
        lastUpdated: platformStats.lastUpdated,
      })
    }
    
    if (type === 'markets') {
      // Return active markets summary
      const markets = [
        {
          id: 1,
          commodity: 'tea',
          question: 'Kenya Tea Board auction >$2.50/kg',
          volume: 450000,
          participants: 156,
          yesPrice: 0.67,
          trending: true,
        },
        {
          id: 2,
          commodity: 'coffee',
          question: 'Ethiopian coffee SCA score >85',
          volume: 1100000,
          participants: 234,
          yesPrice: 0.73,
          trending: true,
        },
        {
          id: 3,
          commodity: 'avocado',
          question: 'Kenya exports >50,000 tons',
          volume: 520000,
          participants: 123,
          yesPrice: 0.55,
          trending: false,
        },
        {
          id: 4,
          commodity: 'macadamia',
          question: 'South African price >$13.00/kg',
          volume: 650000,
          participants: 145,
          yesPrice: 0.61,
          trending: false,
        },
      ]
      
      return NextResponse.json({
        markets: markets.map(market => ({
          ...market,
          volume: Math.round(market.volume),
        })),
        totalActiveMarkets: markets.length,
        trendingMarkets: markets.filter(m => m.trending).length,
        lastUpdated: platformStats.lastUpdated,
      })
    }
    
    // Default: return overview
    return NextResponse.json({
      totalVolume: Math.round(platformStats.totalVolume),
      activeMarkets: platformStats.activeMarkets,
      totalTraders: platformStats.totalTraders,
      averageReturn: parseFloat(platformStats.averageReturn.toFixed(1)),
      lastUpdated: platformStats.lastUpdated,
    })
    
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    
    if (action === 'update-volume') {
      // Update total volume (would be called after trades)
      const { amount } = data
      if (amount && amount > 0) {
        platformStats.totalVolume += amount
        platformStats.last24hVolume += amount
        platformStats.last24hTrades += 1
        platformStats.lastUpdated = new Date().toISOString()
        
        return NextResponse.json({
          success: true,
          newVolume: Math.round(platformStats.totalVolume),
          message: 'Volume updated successfully',
        })
      }
    }
    
    if (action === 'update-traders') {
      // Update trader count (would be called when new users join)
      platformStats.totalTraders += 1
      platformStats.lastUpdated = new Date().toISOString()
      
      return NextResponse.json({
        success: true,
        newTraderCount: platformStats.totalTraders,
        message: 'Trader count updated successfully',
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error updating stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}