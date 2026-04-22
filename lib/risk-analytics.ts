/**
 * Risk Analytics Module
 * Provides volatility indices, confidence scores, and trend analysis for commodity prices
 */

import type { CommoditySymbol } from './live-prices'

export interface RiskMetrics {
  symbol: CommoditySymbol
  currentPrice: number
  currency: string
  timestamp: Date
  
  // Volatility metrics
  volatility: number
  volatilityLabel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  
  // Confidence metrics
  confidenceScore: number
  dataSourceCount: number
  confidenceLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  
  // Trend metrics
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS'
  trendStrength: number
  shortTermChange: number
  mediumTermChange: number
  
  // Risk signals
  riskSignal: 'BUY' | 'SELL' | 'HOLD'
  riskNarrative: string
  
  // Data quality
  lastUpdated: Date
  dataAge: number
}

export interface HistoricalPrice {
  date: Date
  price: number
  source: string
}

export interface PriceSeries {
  symbol: CommoditySymbol
  region: string
  prices: HistoricalPrice[]
}

// In-memory storage for historical prices (in production, use database)
const historicalPrices = new Map<string, PriceSeries>()
const MAX_HISTORY_DAYS = 90

const VOLATILITY_THRESHOLDS = {
  LOW: 0.15,
  MODERATE: 0.30,
  HIGH: 0.50,
  EXTREME: 1.0,
}

const CONFIDENCE_WEIGHTS = {
  KAMIS: 0.4,
  ALPHA_VANTAGE: 0.25,
  TRIDGE: 0.2,
  WORLD_BANK: 0.1,
  FALLBACK: 0.05,
}

/**
 * Add a price observation to historical data
 */
export function addPriceObservation(
  symbol: CommoditySymbol,
  price: number,
  source: string,
  region: string = 'AFRICA'
): void {
  const key = `${symbol}-${region}`
  
  if (!historicalPrices.has(key)) {
    historicalPrices.set(key, {
      symbol,
      region,
      prices: [],
    })
  }
  
  const series = historicalPrices.get(key)!
  const observation: HistoricalPrice = {
    date: new Date(),
    price,
    source,
  }
  
  series.prices.push(observation)
  
  // Trim old data
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS)
  series.prices = series.prices.filter(p => p.date >= cutoffDate)
  
  // Keep max 1000 points per series
  if (series.prices.length > 1000) {
    series.prices = series.prices.slice(-1000)
  }
}

/**
 * Calculate annualized volatility from price series
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0.15 // Default low volatility
  
  // Calculate daily returns
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    const ret = (prices[i] - prices[i - 1]) / prices[i - 1]
    returns.push(ret)
  }
  
  if (returns.length === 0) return 0.15
  
  // Calculate standard deviation
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
  const stdDev = Math.sqrt(variance)
  
  // Annualize (252 trading days)
  const annualized = stdDev * Math.sqrt(252)
  
  return Math.min(annualized, 1.0) // Cap at 100%
}

/**
 * Get volatility label
 */
function getVolatilityLabel(volatility: number): 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' {
  if (volatility < VOLATILITY_THRESHOLDS.LOW) return 'LOW'
  if (volatility < VOLATILITY_THRESHOLDS.MODERATE) return 'MODERATE'
  if (volatility < VOLATILITY_THRESHOLDS.HIGH) return 'HIGH'
  return 'EXTREME'
}

/**
 * Calculate confidence score based on data sources
 */
function calculateConfidence(
  hasKAMIS: boolean,
  hasAlphaVantage: boolean,
  hasTridge: boolean,
  dataAgeMinutes: number
): { score: number; label: string } {
  let score = 0
  
  if (hasKAMIS) score += CONFIDENCE_WEIGHTS.KAMIS
  if (hasAlphaVantage) score += CONFIDENCE_WEIGHTS.ALPHA_VANTAGE
  if (hasTridge) score += CONFIDENCE_WEIGHTS.TRIDGE
  
  // Reduce confidence for stale data (> 60 minutes old)
  if (dataAgeMinutes > 60) {
    score *= 0.7
  } else if (dataAgeMinutes > 30) {
    score *= 0.85
  }
  
  const label = score >= 0.75 ? 'VERY_HIGH' :
               score >= 0.5 ? 'HIGH' :
               score >= 0.25 ? 'MEDIUM' : 'LOW'
  
  return { score: Math.min(score, 1.0), label }
}

/**
 * Calculate trend from price series
 */
function calculateTrend(
  prices: number[]
): { trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS'; trendStrength: number } {
  if (prices.length < 7) {
    return { trend: 'SIDEWAYS', trendStrength: 0 }
  }
  
  const recent = prices.slice(-7)
  const older = prices.slice(-30, -7)
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.length > 0 
    ? older.reduce((a, b) => a + b, 0) / older.length 
    : recentAvg
  
  const percentChange = (recentAvg - olderAvg) / olderAvg
  
  if (Math.abs(percentChange) < 0.02) {
    return { trend: 'SIDEWAYS', trendStrength: Math.abs(percentChange) / 0.02 }
  }
  
  return {
    trend: percentChange > 0 ? 'BULLISH' : 'BEARISH',
    trendStrength: Math.min(Math.abs(percentChange) / 0.1, 1.0),
  }
}

/**
 * Calculate period-over-period changes
 */
function calculateChanges(
  prices: HistoricalPrice[]
): { shortTerm: number; mediumTerm: number } {
  if (prices.length < 2) return { shortTerm: 0, mediumTerm: 0 }
  
  const currentPrice = prices[prices.length - 1].price
  
  // 7-day change
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const shortTermPrice = prices.find(p => p.date >= sevenDaysAgo)?.price || currentPrice
  const shortTerm = shortTermPrice ? (currentPrice - shortTermPrice) / shortTermPrice : 0
  
  // 30-day change
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const mediumTermPrice = prices.find(p => p.date >= thirtyDaysAgo)?.price || shortTermPrice
  const mediumTerm = mediumTermPrice ? (currentPrice - mediumTermPrice) / mediumTermPrice : 0
  
  return { shortTerm, mediumTerm }
}

/**
 * Generate risk signal based on metrics
 */
function generateRiskSignal(
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS',
  trendStrength: number,
  volatility: number,
  confidenceScore: number
): { signal: 'BUY' | 'SELL' | 'HOLD'; narrative: string } {
  const volPenalty = volatility > 0.4 ? 0.2 : 0
  
  if (trend === 'BULLISH' && trendStrength > 0.5 && confidenceScore > 0.5 && volatility < 0.4) {
    return {
      signal: 'BUY',
      narrative: `Bullish trend with ${(trendStrength * 100).toFixed(0)}% confidence. Moderate volatility (${(volatility * 100).toFixed(0)}%) supports price appreciation.`,
    }
  }
  
  if (trend === 'BEARISH' && trendStrength > 0.5 && volatility > 0.3) {
    return {
      signal: 'SELL',
      narrative: `Bearish trend with ${(trendStrength * 100).toFixed(0)}% confidence. High volatility (${(volatility * 100).toFixed(0)}%) indicates increased downside risk.`,
    }
  }
  
  return {
    signal: 'HOLD',
    narrative: `Sideways trend. Waiting for clearer signals. Current volatility: ${(volatility * 100).toFixed(0)}%, Confidence: ${(confidenceScore * 100).toFixed(0)}%.`,
  }
}

/**
 * Get risk metrics for a commodity
 */
export async function getRiskMetrics(
  symbol: CommoditySymbol,
  currentPrice: number,
  sources: string[],
  timestamp: Date,
  dataAgeMinutes: number = 0
): Promise<RiskMetrics> {
  const region = 'AFRICA'
  const key = `${symbol}-${region}`
  
  // Add current observation
  addPriceObservation(symbol, currentPrice, sources[0] || 'UNKNOWN', region)
  
  // Get historical data
  const series = historicalPrices.get(key)
  const prices = series?.prices.map(p => p.price) || []
  
  // Ensure we have enough data points
  if (prices.length > 0) {
    prices.push(currentPrice)
  }
  
  // Calculate metrics
  const volatility = calculateVolatility(prices)
  const volatilityLabel = getVolatilityLabel(volatility)
  
  const { score: confidenceScore, label: confidenceLabel } = calculateConfidence(
    sources.includes('KAMIS'),
    sources.includes('Alpha Vantage'),
    sources.includes('Tridge'),
    dataAgeMinutes
  )
  
  const { trend, trendStrength } = calculateTrend(prices)
  const { shortTerm: shortTermChange, mediumTerm: mediumTermChange } = 
    series ? calculateChanges(series.prices) : { shortTerm: 0, mediumTerm: 0 }
  
  const { signal: riskSignal, narrative: riskNarrative } = generateRiskSignal(
    trend,
    trendStrength,
    volatility,
    confidenceScore
  )
  
  return {
    symbol,
    currentPrice,
    currency: 'USD',
    timestamp,
    volatility,
    volatilityLabel,
    confidenceScore,
    dataSourceCount: sources.length,
    confidenceLabel: confidenceLabel as 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH',
    trend,
    trendStrength,
    shortTermChange,
    mediumTermChange,
    riskSignal,
    riskNarrative,
    lastUpdated: timestamp,
    dataAge: dataAgeMinutes,
  }
}

/**
 * Get price history for a commodity
 */
export function getPriceHistory(
  symbol: CommoditySymbol,
  region: string = 'AFRICA'
): PriceSeries | null {
  const key = `${symbol}-${region}`
  return historicalPrices.get(key) || null
}

/**
 * Get mock risk metrics for testing
 */
export function getMockRiskMetrics(symbol: CommoditySymbol): RiskMetrics {
  return {
    symbol,
    currentPrice: 3.65,
    currency: 'USD',
    timestamp: new Date(),
    volatility: 0.28,
    volatilityLabel: 'MODERATE',
    confidenceScore: 0.75,
    dataSourceCount: 3,
    confidenceLabel: 'HIGH',
    trend: 'BULLISH',
    trendStrength: 0.65,
    shortTermChange: 0.032,
    mediumTermChange: 0.087,
    riskSignal: 'BUY',
    riskNarrative: 'Coffee prices showing bullish momentum with moderate volatility. East African supply constraints support higher prices.',
    lastUpdated: new Date(),
    dataAge: 5,
  }
}