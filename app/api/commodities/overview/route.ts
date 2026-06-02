import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/commodities/overview
 * Returns comprehensive market overview for African commodities
 * 
 * Query params:
 * - region?: filter by region (AFRICA, LATAM, ASIA, etc)
 * - includeForecasts?: include 24h forecasts (default true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'AFRICA';
    const includeForecasts = searchParams.get('includeForecasts') !== 'false';

    // Mock data - replace with actual intelligence layer call
    const overview = {
      timestamp: Date.now(),
      region: region,
      marketStatus: 'active',
      summary: {
        totalCommodities: 8,
        activeSignals: 12,
        recommendationCount: 4,
        marketSentiment: 'bullish',
        volatilityIndex: 42.5
      },
      commodities: [
        {
          name: 'wheat',
          icon: '🌾',
          currentPrice: 245.50,
          priceChangePercent: -0.82,
          priceChange24h: -2.05,
          volume24h: 1240000,
          volumeChange: 5.3,
          highPrice: 250.25,
          lowPrice: 243.75,
          openPrice: 247.55,
          confidence: 0.94,
          grades: [
            { grade: 'Hard Red Winter', price: 245.50, volume: 450000 },
            { grade: 'Soft Red Winter', price: 242.00, volume: 380000 },
            { grade: 'Hard White', price: 248.75, volume: 410000 }
          ],
          locations: [
            { location: 'Nairobi, Kenya', price: 242.50, distance: 'local' },
            { location: 'Kampala, Uganda', price: 248.30, distance: 'regional' },
            { location: 'Dar es Salaam, Tanzania', price: 250.10, distance: 'regional' }
          ],
          forecast24h: includeForecasts ? { direction: 'up', expectedPrice: 248.75, confidence: 0.72 } : null,
          signals: ['opportunity', 'trend'],
          lastUpdate: Date.now() - 5000,
          source: 'FHENIX_ORACLE'
        },
        {
          name: 'maize',
          icon: '🌽',
          currentPrice: 310.25,
          priceChangePercent: 1.23,
          priceChange24h: 3.75,
          volume24h: 890000,
          volumeChange: 8.9,
          highPrice: 315.50,
          lowPrice: 305.00,
          openPrice: 306.50,
          confidence: 0.88,
          grades: [
            { grade: 'Yellow Dent', price: 310.25, volume: 520000 },
            { grade: 'White Corn', price: 315.50, volume: 370000 }
          ],
          locations: [
            { location: 'Kampala, Uganda', price: 312.50, distance: 'local' },
            { location: 'Dar es Salaam, Tanzania', price: 278.50, distance: 'regional' },
            { location: 'Kigali, Rwanda', price: 308.00, distance: 'regional' }
          ],
          forecast24h: includeForecasts ? { direction: 'down', expectedPrice: 307.50, confidence: 0.65 } : null,
          signals: ['arbitrage'],
          lastUpdate: Date.now() - 8000,
          source: 'CROWD_DATA'
        },
        {
          name: 'cocoa',
          icon: '🍫',
          currentPrice: 1850.75,
          priceChangePercent: 2.15,
          priceChange24h: 39.50,
          volume24h: 450000,
          volumeChange: 12.4,
          highPrice: 1860.00,
          lowPrice: 1825.00,
          openPrice: 1811.25,
          confidence: 0.85,
          grades: [
            { grade: 'Fermented', price: 1850.75, volume: 280000 },
            { grade: 'Unfermented', price: 1820.00, volume: 170000 }
          ],
          locations: [
            { location: 'Accra, Ghana', price: 1860.00, distance: 'local' },
            { location: 'Abidjan, Ivory Coast', price: 1845.00, distance: 'local' }
          ],
          forecast24h: includeForecasts ? { direction: 'up', expectedPrice: 1890.00, confidence: 0.78 } : null,
          signals: ['trend'],
          lastUpdate: Date.now() - 3000,
          source: 'CME'
        },
        {
          name: 'coffee',
          icon: '☕',
          currentPrice: 2100.50,
          priceChangePercent: 0.45,
          priceChange24h: 9.35,
          volume24h: 620000,
          volumeChange: 3.2,
          highPrice: 2115.00,
          lowPrice: 2085.50,
          openPrice: 2091.15,
          confidence: 0.82,
          grades: [
            { grade: 'Arabica', price: 2120.00, volume: 380000 },
            { grade: 'Robusta', price: 2080.00, volume: 240000 }
          ],
          locations: [
            { location: 'Addis Ababa, Ethiopia', price: 2095.00, distance: 'local' },
            { location: 'Kampala, Uganda', price: 2105.00, distance: 'regional' }
          ],
          forecast24h: includeForecasts ? { direction: 'up', expectedPrice: 2135.00, confidence: 0.72 } : null,
          signals: ['sentiment'],
          lastUpdate: Date.now() - 12000,
          source: 'LIFFE'
        }
      ],
      regionalArbitrage: [
        {
          commodity: 'maize',
          regions: ['Kampala, Uganda', 'Dar es Salaam, Tanzania'],
          spread: 34.00,
          spreadPercent: 12.2,
          opportunity: 'sell_kampala_buy_dar',
          estimatedProfit: 3400
        },
        {
          commodity: 'wheat',
          regions: ['Nairobi, Kenya', 'Dar es Salaam, Tanzania'],
          spread: 7.60,
          spreadPercent: 3.1,
          opportunity: 'sell_dar_buy_nairobi',
          estimatedProfit: 760
        }
      ],
      riskMetrics: {
        volatility: 0.425,
        maxDrawdown: 0.085,
        sharpRatio: 1.34,
        valueAtRisk: 0.045
      },
      recommendations: {
        totalCount: 4,
        highConfidence: 2,
        mediumConfidence: 1,
        lowConfidence: 1
      }
    };

    return NextResponse.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market overview' },
      { status: 500 }
    );
  }
}
