/**
 * Commodity Agent - Main Entry Point
 * Exports all agent functionality for easy consumption
 */

// Simplified agent (recommended)
export {
  generatePrediction,
  fetchCurrentPrice,
  analyzePricePattern,
  compareCommodities
} from './agent'

// Advanced agent runtime (ElizaOS-based, optional)
export type { Character, Plugin } from '@elizaos/core'

// Plugins (reference implementations, may need API adjustments)
export { commodityDataPlugin } from './plugins/commodity-data'
export { commodityPredictionPlugin } from './plugins/commodity-prediction'

// Scheduler
export {
  getScheduler,
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  type ScheduleInterval
} from './scheduler'

// Prompts
export {
  buildPredictionPrompt,
  buildPatternAnalysisPrompt,
  buildComparativeAnalysisPrompt,
  type PredictionHorizon,
  type PromptContext,
  BASE_SYSTEM_PROMPT,
  HORIZON_GUIDANCE,
  COMMODITY_CONTEXT
} from './prompts'

// Groq client
export {
  getGroqClient,
  runGroqChat,
  type GroqChatOptions,
  type GroqChatResponse
} from './groq-client'

/**
 * Quick start function for the agent (no initialization needed)
 */
export async function startCommodityAgent(options?: {
  enableScheduler?: boolean
  schedulerInterval?: 'hourly' | 'daily' | 'weekly'
}) {
  const { startScheduler } = await import('./scheduler')
  
  // Start scheduler if enabled
  if (options?.enableScheduler) {
    startScheduler({
      enabled: true,
      interval: options.schedulerInterval || 'daily'
    })
  }
  
  return { ready: true }
}

/**
 * Generate a quick prediction (convenience function)
 */
export async function quickPredict(
  commodity: string,
  region: 'AFRICA' | 'LATAM' = 'AFRICA',
  horizon: 'short' | 'medium' | 'long' = 'short'
) {
  const { generatePrediction } = await import('./agent')
  
  const horizonMap = {
    short: 'SHORT_TERM' as const,
    medium: 'MEDIUM_TERM' as const,
    long: 'LONG_TERM' as const
  }
  
  return generatePrediction({
    symbol: commodity.toUpperCase() as any,
    region,
    horizon: horizonMap[horizon]
  })
}

/**
 * Fetch current price (convenience function)
 */
export async function quickFetchPrice(
  commodity: string,
  region: 'AFRICA' | 'LATAM' = 'AFRICA'
) {
  const { fetchCurrentPrice } = await import('./agent')
  
  return fetchCurrentPrice(commodity.toUpperCase() as any, region)
}

export default {
  startCommodityAgent,
  quickPredict,
  quickFetchPrice
}
