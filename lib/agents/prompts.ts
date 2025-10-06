/**
 * Prompt templates for commodity price prediction
 * Structured to guide the Groq model in producing actionable forecasts
 */

import type { CommoditySymbol, Region } from '@/lib/live-prices'

export type PredictionHorizon = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM'

export interface PromptContext {
  symbol: CommoditySymbol
  region: Region
  currentPrice: number | null
  horizon: PredictionHorizon
  historicalData?: {
    avgPrice: number
    volatility: number
    trend: 'UP' | 'DOWN' | 'STABLE'
  }
}

/**
 * Base system prompt establishing agent persona and expertise
 */
export const BASE_SYSTEM_PROMPT = `You are an expert agricultural commodities analyst specializing in African and Latin American markets. 

Your expertise includes:
- Price forecasting based on supply/demand dynamics
- Weather impact analysis on crop yields
- Geopolitical factors affecting commodity flows
- Market sentiment and speculator behavior
- Historical price patterns and seasonal trends

You produce structured, data-driven forecasts with clear confidence levels and actionable narratives.`

/**
 * Horizon-specific guidance for predictions
 */
export const HORIZON_GUIDANCE: Record<PredictionHorizon, string> = {
  SHORT_TERM: `Focus on immediate market factors (next 7-30 days):
- Current inventory levels and supply constraints
- Weather forecasts for growing regions
- Shipping and logistics disruptions
- Recent price momentum and technical indicators
- Upcoming harvest schedules`,

  MEDIUM_TERM: `Focus on quarterly trends (next 1-3 months):
- Seasonal production cycles and expected yields
- Export/import policy changes
- Currency fluctuations affecting purchasing power
- Emerging consumer demand patterns
- Storage capacity and carry costs`,

  LONG_TERM: `Focus on structural trends (next 6-12 months):
- Climate change impacts on growing regions
- Infrastructure development affecting supply chains
- Market consolidation and producer power dynamics
- Long-term demand shifts (urbanization, diet changes)
- Investment in alternative commodities or substitutes`
}

/**
 * Commodity-specific context and factors
 */
export const COMMODITY_CONTEXT: Record<CommoditySymbol, string> = {
  COCOA: `West Africa (Côte d'Ivoire, Ghana) produces 70% of global cocoa. Key factors:
- Weather patterns (El Niño/La Niña effects)
- Swollen shoot virus impact on trees
- Child labor regulations affecting supply
- Chocolate demand in developed markets
- Certification premiums (Fair Trade, Rainforest Alliance)`,

  COFFEE: `East Africa (Ethiopia, Kenya) and Latin America (Brazil, Colombia) dominate. Key factors:
- Arabica vs Robusta price differentials
- Frost risk in Brazil, drought in East Africa
- Global coffee consumption growth (specialty market)
- Currency strength (BRL, COP, ETB)
- Rust disease and aging tree stock`,

  TEA: `East Africa (Kenya, Tanzania) is a major exporter. Key factors:
- Monsoon patterns affecting yields
- Competition with Asian producers (India, Sri Lanka)
- Shift toward specialty/organic teas
- Auction prices in Mombasa
- Export logistics through Kenyan ports`,

  GOLD: `Gold as a commodity and financial asset. Key factors:
- USD strength and interest rates
- Geopolitical tensions driving safe-haven demand
- Mining output from African producers (South Africa, Ghana)
- Central bank purchasing patterns
- Inflation hedging demand`,

  AVOCADO: `Kenya and South Africa are growing exporters. Key factors:
- European and Middle Eastern demand growth
- Competition with Mexico and Peru
- Water scarcity affecting cultivation
- Shipping cold chain reliability
- Certification requirements for export markets`,

  MACADAMIA: `East Africa (Kenya, Malawi, South Africa) produces premium nuts. Key factors:
- Chinese demand growth (largest importer)
- Tree maturation timeline (7-10 years to full yield)
- Processing capacity constraints
- Competition with Australia
- Premium pricing for in-shell vs kernel`
}

/**
 * Generate prediction prompt for a specific commodity and horizon
 */
export function buildPredictionPrompt(context: PromptContext): string {
  const { symbol, region, currentPrice, horizon, historicalData } = context
  
  const horizonGuidance = HORIZON_GUIDANCE[horizon]
  const commodityContext = COMMODITY_CONTEXT[symbol]
  
  const currentPriceText = currentPrice !== null 
    ? `Current market price: $${currentPrice.toFixed(2)} USD`
    : 'Current market price unavailable (use historical baseline)'
  
  const historicalText = historicalData
    ? `Historical context: Avg price $${historicalData.avgPrice.toFixed(2)}, Volatility ${(historicalData.volatility * 100).toFixed(1)}%, Trend ${historicalData.trend}`
    : 'Limited historical data available'
  
  return `${BASE_SYSTEM_PROMPT}

## FORECAST REQUEST

Commodity: ${symbol}
Region: ${region}
Time Horizon: ${horizon}
${currentPriceText}
${historicalText}

${horizonGuidance}

## COMMODITY-SPECIFIC FACTORS
${commodityContext}

## OUTPUT REQUIREMENTS

Produce a JSON forecast with the following structure:
{
  "predictedPrice": <number>,  // Forecasted price in USD
  "confidence": <number>,       // Confidence level 0.0-1.0
  "narrative": <string>,        // 2-3 sentence explanation of key drivers
  "signals": [                  // Optional: specific actionable signals
    {
      "type": "BULLISH" | "BEARISH" | "NEUTRAL",
      "strength": <number>,     // 0.0-1.0
      "reason": <string>
    }
  ]
}

IMPORTANT:
- Base predictions on realistic market dynamics
- Confidence should reflect data quality and volatility
- Narrative must cite specific factors (weather, policy, demand)
- Avoid over-confidence in highly volatile commodities
- Consider regional differences (African vs Latin American supply chains)

Provide ONLY the JSON response, no additional commentary.`
}

/**
 * Generate a prompt for analyzing historical price patterns
 */
export function buildPatternAnalysisPrompt(
  symbol: CommoditySymbol,
  region: Region,
  prices: Array<{ date: string; price: number }>
): string {
  const priceList = prices
    .map(p => `${p.date}: $${p.price.toFixed(2)}`)
    .join('\n')
  
  return `${BASE_SYSTEM_PROMPT}

## PATTERN ANALYSIS REQUEST

Commodity: ${symbol}
Region: ${region}

Recent price history:
${priceList}

Analyze the price pattern and identify:
1. Overall trend (UP/DOWN/STABLE)
2. Volatility level (LOW/MEDIUM/HIGH)
3. Seasonal patterns if evident
4. Potential support/resistance levels
5. Notable anomalies or inflection points

Provide a JSON response:
{
  "trend": "UP" | "DOWN" | "STABLE",
  "volatility": <number>,  // Standard deviation as % of mean
  "avgPrice": <number>,
  "seasonalPattern": <string | null>,
  "keyLevels": {
    "support": <number | null>,
    "resistance": <number | null>
  },
  "analysis": <string>  // Brief summary
}

Provide ONLY the JSON response.`
}

/**
 * Generate a prompt for multi-commodity comparison
 */
export function buildComparativeAnalysisPrompt(
  commodities: Array<{ symbol: CommoditySymbol; currentPrice: number | null }>,
  region: Region
): string {
  const commodityList = commodities
    .map(c => `${c.symbol}: ${c.currentPrice !== null ? `$${c.currentPrice.toFixed(2)}` : 'N/A'}`)
    .join('\n')
  
  return `${BASE_SYSTEM_PROMPT}

## COMPARATIVE ANALYSIS REQUEST

Region: ${region}
Current prices:
${commodityList}

Analyze relative opportunities across these commodities for the next 30 days:
1. Which commodity shows strongest bullish signals?
2. Which faces near-term headwinds?
3. Are there correlations between these commodities?
4. Portfolio diversification recommendations

Provide a JSON response:
{
  "topOpportunity": "<symbol>",
  "topOpportunityReason": <string>,
  "weakestOutlook": "<symbol>",
  "weakestOutlookReason": <string>,
  "correlations": [
    {
      "pair": ["<symbol1>", "<symbol2>"],
      "relationship": <string>
    }
  ],
  "diversificationAdvice": <string>
}

Provide ONLY the JSON response.`
}
