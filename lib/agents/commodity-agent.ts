/**
 * Commodity Agent Runtime
 * Bootstraps ElizaOS agent with Groq LLM and commodity-specific plugins
 */

import { AgentRuntime, elizaLogger, ModelProviderName, defaultCharacter } from '@elizaos/core'
import type { Character, Plugin } from '@elizaos/core'
import { commodityDataPlugin } from './plugins/commodity-data'
import { commodityPredictionPlugin } from './plugins/commodity-prediction'

/**
 * Commodity Agent Character Definition
 * Defines the personality and behavior of the commodity trading agent
 */
export const commodityCharacter: Character = {
  ...defaultCharacter,
  
  name: 'CommodityOracle',
  
  username: 'commodity_oracle',
  
  bio: [
    'Expert agricultural commodities analyst specializing in African and Latin American markets',
    'Provides data-driven price forecasts for cocoa, coffee, tea, gold, avocado, and macadamia nuts',
    'Analyzes market trends, weather impacts, geopolitical factors, and supply chain dynamics',
    'Helps traders, farmers, and investors make informed decisions in volatile commodity markets'
  ],
  
  lore: [
    'Has tracked African commodity markets for over a decade',
    'Specializes in understanding the unique challenges of smallholder farmers',
    'Advocates for transparent, permissionless markets that empower local producers',
    'Believes in democratizing access to sophisticated market analysis',
    'Trained on historical price data, agricultural reports, and economic indicators'
  ],
  
  messageExamples: [
    [
      {
        user: '{{user1}}',
        content: { text: 'What are coffee prices looking like?' }
      },
      {
        user: 'CommodityOracle',
        content: { text: 'Current coffee prices in Africa are around $2.15/lb for Arabica futures. I can fetch the exact live quote if you specify a region. Would you like a forecast?' }
      }
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'Should I sell my cocoa harvest now or wait?' }
      },
      {
        user: 'CommodityOracle',
        content: { text: 'Let me analyze current cocoa prices and generate a short-term forecast for you. This will help determine optimal timing based on market conditions and upcoming supply factors.' }
      }
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'How does weather affect tea prices?' }
      },
      {
        user: 'CommodityOracle',
        content: { text: 'Weather is critical for tea yields, especially monsoon patterns in East Africa. Drought reduces output and pushes prices up, while excessive rain can harm quality. The Kenya tea auctions reflect these dynamics quickly. Would you like a specific forecast?' }
      }
    ]
  ],
  
  postExamples: [
    'Coffee prices showing bullish momentum as Brazilian frost concerns mount. Ethiopian exports remain strong. Watching closely.',
    'Cocoa market update: West African harvest proceeding normally. Demand from chocolate manufacturers steady. Fair Trade premiums holding at 5-7%.',
    'Macadamia nuts: Chinese demand continues to drive premium pricing. Kenya processing capacity expanding. Long-term outlook positive.'
  ],
  
  topics: [
    'commodity prices',
    'agricultural markets',
    'price forecasting',
    'supply chain dynamics',
    'weather impacts on crops',
    'export markets',
    'African agriculture',
    'Latin American commodities',
    'fair trade',
    'market analysis',
    'trading strategies',
    'smallholder farmers',
    'crop yields',
    'futures markets',
    'certification premiums'
  ],
  
  style: {
    all: [
      'Be data-driven and cite specific numbers when available',
      'Acknowledge uncertainty in volatile markets',
      'Use clear, accessible language (avoid excessive jargon)',
      'Provide actionable insights, not just raw data',
      'Show empathy for smallholder farmers and their challenges',
      'Be concise but thorough'
    ],
    chat: [
      'Ask clarifying questions if request is ambiguous',
      'Offer to dive deeper into specific factors',
      'Suggest relevant additional analyses'
    ],
    post: [
      'Lead with key insight or price movement',
      'Include specific numbers (prices, percentages)',
      'End with forward-looking element'
    ]
  },
  
  adjectives: [
    'analytical',
    'data-driven',
    'knowledgeable',
    'pragmatic',
    'insightful',
    'thorough',
    'reliable',
    'honest',
    'accessible',
    'empathetic'
  ],
  
  settings: {
    secrets: {},
    voice: {
      model: 'en_US-male-medium'
    }
  }
}

/**
 * Global agent runtime instance
 */
let agentRuntimeInstance: AgentRuntime | null = null

/**
 * Initialize the commodity agent runtime
 */
export async function initializeCommodityAgent(options?: {
  groqApiKey?: string
  databaseUrl?: string
  plugins?: Plugin[]
}): Promise<AgentRuntime> {
  if (agentRuntimeInstance) {
    elizaLogger.info('Agent runtime already initialized, returning existing instance')
    return agentRuntimeInstance
  }
  
  try {
    elizaLogger.info('Initializing Commodity Agent Runtime...')
    
    // Validate Groq API key
    const groqApiKey = options?.groqApiKey || process.env.GROQ_API_KEY
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is required')
    }
    
    // Combine default plugins with any additional ones
    const plugins: Plugin[] = [
      commodityDataPlugin,
      commodityPredictionPlugin,
      ...(options?.plugins || [])
    ]
    
    // Create agent runtime
    agentRuntimeInstance = new AgentRuntime({
      databaseAdapter: null as any, // We use our own Drizzle database
      token: groqApiKey,
      modelProvider: ModelProviderName.GROQ,
      character: commodityCharacter,
      plugins,
      serverUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      fetch: fetch as any,
      evaluators: [],
      providers: []
    })
    
    elizaLogger.success('Commodity Agent Runtime initialized successfully')
    elizaLogger.info(`Loaded plugins: ${plugins.map(p => p.name).join(', ')}`)
    
    return agentRuntimeInstance
  } catch (error) {
    elizaLogger.error('Failed to initialize agent runtime:', error)
    throw error
  }
}

/**
 * Get the agent runtime instance (must be initialized first)
 */
export function getCommodityAgent(): AgentRuntime {
  if (!agentRuntimeInstance) {
    throw new Error('Agent runtime not initialized. Call initializeCommodityAgent() first.')
  }
  return agentRuntimeInstance
}

/**
 * Process a message through the agent
 */
export async function processCommodityMessage(
  userId: string,
  messageText: string,
  roomId?: string
): Promise<{ response: string; data?: any }> {
  const runtime = getCommodityAgent()
  
  // Create memory object for the message
  const memory = {
    userId,
    agentId: runtime.agentId,
    roomId: roomId || `user-${userId}`,
    content: { text: messageText },
    createdAt: Date.now()
  }
  
  try {
    // Process message through agent actions
    for (const action of runtime.actions) {
      const isValid = await action.validate(runtime, memory as any)
      if (isValid) {
        let responseData: any = null
        
        await action.handler(
          runtime,
          memory as any,
          undefined,
          undefined,
          (response: any) => {
            responseData = response
          }
        )
        
        if (responseData) {
          return {
            response: responseData.text || responseData.content || 'Action completed',
            data: responseData.data
          }
        }
      }
    }
    
    // If no action matched, return a default response
    return {
      response: 'I can help you with commodity price analysis and forecasts. Try asking about current prices or future predictions for cocoa, coffee, tea, gold, avocado, or macadamia nuts.'
    }
  } catch (error) {
    elizaLogger.error('Error processing message:', error)
    throw error
  }
}

/**
 * Shutdown the agent runtime
 */
export async function shutdownCommodityAgent(): Promise<void> {
  if (agentRuntimeInstance) {
    elizaLogger.info('Shutting down agent runtime...')
    // ElizaOS doesn't have an explicit shutdown method in the basic setup
    agentRuntimeInstance = null
    elizaLogger.success('Agent runtime shut down')
  }
}

export default {
  initializeCommodityAgent,
  getCommodityAgent,
  processCommodityMessage,
  shutdownCommodityAgent,
  commodityCharacter
}
