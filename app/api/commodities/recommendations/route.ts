import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/commodities/recommendations
 * Returns actionable trade recommendations based on market signals
 * 
 * Query params:
 * - minConfidence?: filter recommendations above confidence threshold (0-100)
 * - timeframe?: filter by timeframe (short, medium, long)
 * - maxRecommendations?: limit number of results (default 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minConfidence = parseInt(searchParams.get('minConfidence') || '60');
    const timeframe = searchParams.get('timeframe');
    const maxRecommendations = parseInt(searchParams.get('maxRecommendations') || '10');

    // Mock data - replace with actual intelligence layer call
    const recommendations = [
      {
        id: 'rec_wheat_buy_001',
        commodity: 'wheat',
        action: 'buy',
        confidence: 92,
        expectedReturn: 4.2,
        riskLevel: 2,
        timeframe: 'short',
        rationale: 'Nairobi wheat trading at 8% discount. Historical data suggests mean reversion within 48 hours.',
        entryPrice: 245,
        targetPrice: 255,
        stopLoss: 240,
        signals: [
          { type: 'opportunity', weight: 0.6 },
          { type: 'trend', weight: 0.4 }
        ]
      },
      {
        id: 'rec_maize_arbitrage_001',
        commodity: 'maize',
        action: 'sell',
        confidence: 88,
        expectedReturn: 6.5,
        riskLevel: 3,
        timeframe: 'short',
        rationale: 'Regional arbitrage: Kampala 12% premium. Execute sell in Kampala, buy in Dar es Salaam.',
        entryPrice: 310,
        targetPrice: 292,
        stopLoss: 325,
        signals: [
          { type: 'arbitrage', weight: 1.0 }
        ]
      },
      {
        id: 'rec_cocoa_hold_001',
        commodity: 'cocoa',
        action: 'hold',
        confidence: 85,
        expectedReturn: 3.1,
        riskLevel: 4,
        timeframe: 'medium',
        rationale: 'Sustained uptrend with positive momentum. Hold positions, no new entries until consolidation.',
        entryPrice: 1850,
        targetPrice: 1905,
        stopLoss: 1800,
        signals: [
          { type: 'trend', weight: 1.0 }
        ]
      },
      {
        id: 'rec_coffee_buy_001',
        commodity: 'coffee',
        action: 'buy',
        confidence: 78,
        expectedReturn: 5.8,
        riskLevel: 3,
        timeframe: 'medium',
        rationale: 'Volume spike detected. Accumulate positions gradually over 3-5 days.',
        entryPrice: 2100,
        targetPrice: 2223,
        stopLoss: 2050,
        signals: [
          { type: 'sentiment', weight: 0.7 },
          { type: 'trend', weight: 0.3 }
        ]
      }
    ];

    let filtered = recommendations;

    // Apply filters
    if (minConfidence > 0) {
      filtered = filtered.filter(r => r.confidence >= minConfidence);
    }
    if (timeframe) {
      filtered = filtered.filter(r => r.timeframe === timeframe);
    }

    // Sort by confidence descending
    filtered.sort((a, b) => b.confidence - a.confidence);

    // Limit results
    filtered = filtered.slice(0, maxRecommendations);

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      count: filtered.length,
      recommendations: filtered,
      portfolioMetrics: {
        avgConfidence: filtered.length > 0 ? filtered.reduce((sum, r) => sum + r.confidence, 0) / filtered.length : 0,
        avgExpectedReturn: filtered.length > 0 ? filtered.reduce((sum, r) => sum + r.expectedReturn, 0) / filtered.length : 0,
        avgRiskLevel: filtered.length > 0 ? filtered.reduce((sum, r) => sum + r.riskLevel, 0) / filtered.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
