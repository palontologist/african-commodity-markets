/**
 * Africa Commodities Intelligence Layer
 * Structured data + market intelligence + execution for SoSoValue buildathon
 * 
 * This layer transforms raw commodity data into actionable market intelligence
 * for the research-to-trade stack.
 */

import { Database } from '@libsql/client';

export interface CommodityMarketData {
  commodity: string;
  region: string;
  price: number;
  priceUSD: number;
  timestamp: number;
  source: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  volatility: number;
  volume24h: number;
  tradingActive: boolean;
}

export interface IntelligenceSignal {
  type: 'opportunity' | 'risk' | 'arbitrage' | 'trend' | 'sentiment';
  commodity: string;
  region: string;
  strength: number; // 0-100
  description: string;
  actionable: boolean;
  expectedReturn: number;
  riskLevel: number;
  timestamp: number;
}

export interface TradeRecommendation {
  id: string;
  commodity: string;
  action: 'buy' | 'sell' | 'hold' | 'arbitrage';
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  stopLoss: number;
  profitTarget: number;
  confidence: number;
  signals: IntelligenceSignal[];
  timeframe: 'short' | 'medium' | 'long';
  createdAt: number;
  expiresAt: number;
}

export class AfricaCommoditiesIntelligence {
  private db: Database | null = null;
  private priceCache: Map<string, CommodityMarketData> = new Map();
  private signals: Map<string, IntelligenceSignal[]> = new Map();
  
  private readonly AFRICAN_REGIONS = [
    'West Africa', 'East Africa', 'Southern Africa',
    'North Africa', 'Central Africa'
  ];
  
  private readonly KEY_COMMODITIES = {
    COFFEE: { min: 1.0, max: 5.0, usd: true },
    COCOA: { min: 2000, max: 4000, usd: true },
    COTTON: { min: 60, max: 100, usd: true },
    MAIZE: { min: 3, max: 8, usd: true },
    WHEAT: { min: 5, max: 12, usd: true },
    GOLD: { min: 1200, max: 2500, usd: true },
    COPPER: { min: 3, max: 10, usd: true },
  };

  constructor(database?: Database) {
    this.db = database || null;
  }

  /**
   * Ingest structured commodity price data
   */
  async ingestPriceData(data: CommodityMarketData): Promise<void> {
    const key = `${data.commodity}_${data.region}`;
    this.priceCache.set(key, data);
    
    if (this.db) {
      // Store in persistent database
      await this.db.execute({
        sql: `
          INSERT OR REPLACE INTO commodity_prices 
          (commodity, region, price, priceUSD, source, confidence, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          data.commodity,
          data.region,
          data.price,
          data.priceUSD,
          data.source,
          data.confidence,
          data.timestamp
        ]
      });
    }
  }

  /**
   * Generate market intelligence signals from data
   */
  generateSignals(data: CommodityMarketData[]): IntelligenceSignal[] {
    const signals: IntelligenceSignal[] = [];

    data.forEach((current) => {
      // Check for price anomalies
      const priceAnomalySignal = this.detectPriceAnomaly(current);
      if (priceAnomalySignal) signals.push(priceAnomalySignal);

      // Check for volume anomalies
      const volumeSignal = this.detectVolumeAnomaly(current);
      if (volumeSignal) signals.push(volumeSignal);

      // Check for regional arbitrage opportunities
      const arbitrageSignals = this.detectArbitrage(current, data);
      signals.push(...arbitrageSignals);

      // Check for trend strength
      const trendSignal = this.detectTrend(current);
      if (trendSignal) signals.push(trendSignal);
    });

    return signals.sort((a, b) => b.strength - a.strength);
  }

  private detectPriceAnomaly(data: CommodityMarketData): IntelligenceSignal | null {
    const spec = this.KEY_COMMODITIES[data.commodity as keyof typeof this.KEY_COMMODITIES];
    if (!spec) return null;

    const normalizedPrice = data.priceUSD / ((spec.max + spec.min) / 2);
    
    if (normalizedPrice > 1.3 || normalizedPrice < 0.7) {
      return {
        type: 'opportunity',
        commodity: data.commodity,
        region: data.region,
        strength: Math.abs((normalizedPrice - 1) * 100),
        description: normalizedPrice > 1.3 
          ? `${data.commodity} overbought by ${((normalizedPrice - 1) * 100).toFixed(1)}%`
          : `${data.commodity} oversold by ${((1 - normalizedPrice) * 100).toFixed(1)}%`,
        actionable: true,
        expectedReturn: normalizedPrice > 1.3 ? 8 : 12,
        riskLevel: 45,
        timestamp: data.timestamp
      };
    }

    return null;
  }

  private detectVolumeAnomaly(data: CommodityMarketData): IntelligenceSignal | null {
    const averageVolume = 1000000; // baseline
    const volumeRatio = data.volume24h / averageVolume;

    if (volumeRatio > 1.5 || volumeRatio < 0.5) {
      return {
        type: 'sentiment',
        commodity: data.commodity,
        region: data.region,
        strength: Math.abs((volumeRatio - 1) * 50),
        description: volumeRatio > 1.5
          ? `High trading volume (${(volumeRatio * 100).toFixed(0)}% above average) - strong interest`
          : `Low trading volume (${((1 - volumeRatio) * 100).toFixed(0)}% below average) - thin market`,
        actionable: volumeRatio > 1.5,
        expectedReturn: 5,
        riskLevel: volumeRatio > 1.5 ? 35 : 60,
        timestamp: data.timestamp
      };
    }

    return null;
  }

  private detectArbitrage(current: CommodityMarketData, allData: CommodityMarketData[]): IntelligenceSignal[] {
    const signals: IntelligenceSignal[] = [];
    const sameCommModity = allData.filter(d => d.commodity === current.commodity);

    const maxPrice = Math.max(...sameCommModity.map(d => d.priceUSD));
    const minPrice = Math.min(...sameCommModity.map(d => d.priceUSD));
    const spread = ((maxPrice - minPrice) / minPrice) * 100;

    if (spread > 5) {
      signals.push({
        type: 'arbitrage',
        commodity: current.commodity,
        region: current.region,
        strength: Math.min(spread * 2, 95),
        description: `Regional arbitrage opportunity: ${spread.toFixed(2)}% price spread across Africa`,
        actionable: true,
        expectedReturn: spread * 0.7,
        riskLevel: 25,
        timestamp: current.timestamp
      });
    }

    return signals;
  }

  private detectTrend(data: CommodityMarketData): IntelligenceSignal | null {
    if (data.trend === 'stable') return null;

    const isUptrend = data.trend === 'up';
    return {
      type: 'trend',
      commodity: data.commodity,
      region: data.region,
      strength: 70 - (data.volatility * 10),
      description: isUptrend
        ? `${data.commodity} in uptrend with ${(data.volatility * 100).toFixed(1)}% volatility`
        : `${data.commodity} in downtrend - potential reversal zone approaching`,
      actionable: true,
      expectedReturn: isUptrend ? 10 : 15,
      riskLevel: 40 + (data.volatility * 20),
      timestamp: data.timestamp
    };
  }

  /**
   * Generate trade recommendations from signals
   */
  generateRecommendations(signals: IntelligenceSignal[]): TradeRecommendation[] {
    const recommendations: TradeRecommendation[] = [];
    const groupedBySymbol = this.groupSignalsByCommodity(signals);

    Object.entries(groupedBySymbol).forEach(([commodity, commoditySignals]) => {
      const totalStrength = commoditySignals.reduce((sum, s) => sum + s.strength, 0);
      const avgConfidence = totalStrength / commoditySignals.length;

      if (avgConfidence > 60) {
        const dominantType = commoditySignals[0].type;
        const action = this.determineAction(dominantType, commoditySignals);

        const rec: TradeRecommendation = {
          id: `${commodity}_${Date.now()}`,
          commodity,
          action,
          entryPrice: 100, // Placeholder - should be current market price
          exitPrice: 110, // Placeholder
          positionSize: 1000,
          stopLoss: 95,
          profitTarget: 115,
          confidence: Math.min(avgConfidence, 95),
          signals: commoditySignals,
          timeframe: this.determineTimeframe(commoditySignals),
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // Valid for 24 hours
        };

        recommendations.push(rec);
      }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private groupSignalsByCommodity(signals: IntelligenceSignal[]): Record<string, IntelligenceSignal[]> {
    return signals.reduce((acc, signal) => {
      if (!acc[signal.commodity]) acc[signal.commodity] = [];
      acc[signal.commodity].push(signal);
      return acc;
    }, {} as Record<string, IntelligenceSignal[]>);
  }

  private determineAction(
    dominantType: IntelligenceSignal['type'],
    signals: IntelligenceSignal[]
  ): TradeRecommendation['action'] {
    switch (dominantType) {
      case 'arbitrage':
        return 'arbitrage';
      case 'opportunity':
        return signals.some(s => s.expectedReturn > 10) ? 'buy' : 'sell';
      case 'trend':
        return signals.some(s => s.description.includes('uptrend')) ? 'buy' : 'sell';
      default:
        return 'hold';
    }
  }

  private determineTimeframe(signals: IntelligenceSignal[]): TradeRecommendation['timeframe'] {
    const avgRisk = signals.reduce((sum, s) => sum + s.riskLevel, 0) / signals.length;
    if (avgRisk > 50) return 'short';
    if (avgRisk > 35) return 'medium';
    return 'long';
  }

  /**
   * Get market overview for all tracked commodities
   */
  getMarketOverview(): {
    commodities: CommodityMarketData[];
    signals: IntelligenceSignal[];
    recommendations: TradeRecommendation[];
  } {
    const commodities = Array.from(this.priceCache.values());
    const signals = this.generateSignals(commodities);
    const recommendations = this.generateRecommendations(signals);

    return {
      commodities,
      signals: signals.slice(0, 10), // Top 10 signals
      recommendations: recommendations.slice(0, 5) // Top 5 recommendations
    };
  }

  /**
   * Get historical volatility for a commodity
   */
  async getVolatilityAnalysis(commodity: string): Promise<{
    current: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    forecast: number;
  }> {
    // In production, this would query historical data from DB
    return {
      current: Math.random() * 0.3,
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
      forecast: Math.random() * 0.35
    };
  }

  /**
   * Correlation analysis between commodities (for portfolio building)
   */
  getCorrelationMatrix(commodities: string[]): Record<string, Record<string, number>> {
    const matrix: Record<string, Record<string, number>> = {};

    commodities.forEach(c1 => {
      matrix[c1] = {};
      commodities.forEach(c2 => {
        if (c1 === c2) {
          matrix[c1][c2] = 1;
        } else {
          // In production, calculate real correlation from historical data
          matrix[c1][c2] = Math.random() * 0.8 - 0.4; // -0.4 to +0.4
        }
      });
    });

    return matrix;
  }
}

export default AfricaCommoditiesIntelligence;
