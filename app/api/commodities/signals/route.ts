import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/commodities/signals
 * Returns current market intelligence signals for all commodities
 * 
 * Query params:
 * - commodity?: filter by specific commodity (wheat, maize, etc)
 * - minConfidence?: filter signals above confidence threshold (0-100)
 * - signalType?: filter by type (opportunity, risk, arbitrage, trend, sentiment)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity');
    const minConfidence = parseInt(searchParams.get('minConfidence') || '0');
    const signalType = searchParams.get('signalType');

    // Mock data - replace with actual intelligence layer call
    const signals = [
      {
        id: 'sig_wheat_anomaly_001',
        type: 'opportunity',
        commodity: 'wheat',
        description: 'Price anomaly detected: Nairobi wheat trading 8% below East Asia average',
        strength: 85,
        confidence: 92,
        expectedReturn: 4.2,
        riskLevel: 2,
        detectedAt: Date.now(),
        expiresAt: Date.now() + 3600000,
        source: 'FHENIX_ORACLE'
      },
      {
        id: 'sig_maize_arbitrage_001',
        type: 'arbitrage',
        commodity: 'maize',
        description: 'Regional arbitrage: Kampala maize 12% premium vs Dar es Salaam',
        strength: 78,
        confidence: 88,
        expectedReturn: 6.5,
        riskLevel: 3,
        detectedAt: Date.now() - 300000,
        expiresAt: Date.now() + 5400000,
        source: 'CROWD_DATA'
      },
      {
        id: 'sig_cocoa_trend_001',
        type: 'trend',
        commodity: 'cocoa',
        description: 'Sustained uptrend: Cocoa prices up 22% over 14 days, momentum positive',
        strength: 72,
        confidence: 85,
        expectedReturn: 3.1,
        riskLevel: 4,
        detectedAt: Date.now() - 1200000,
        expiresAt: Date.now() + 7200000,
        source: 'CME'
      }
    ];

    let filtered = signals;

    // Apply filters
    if (commodity) {
      filtered = filtered.filter(s => s.commodity.toLowerCase() === commodity.toLowerCase());
    }
    if (minConfidence > 0) {
      filtered = filtered.filter(s => s.confidence >= minConfidence);
    }
    if (signalType) {
      filtered = filtered.filter(s => s.type === signalType);
    }

    // Sort by confidence descending
    filtered.sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      count: filtered.length,
      signals: filtered
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}
