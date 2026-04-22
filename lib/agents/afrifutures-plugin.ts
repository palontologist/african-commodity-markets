/**
 * Afrifutures A2A ElizaOS Plugin
 * 
 * This module provides an ElizaOS plugin for the Afrifutures A2A commodity marketplace.
 * It allows AI agents to autonomously trade commodities on the Afrifutures platform.
 * 
 * Usage in ElizaOS character:
 * ```javascript
 * import { AfrifuturesPlugin } from './path/to/afrifutures-plugin'
 * 
 * const character = {
 *     plugins: [AfrifuturesPlugin],
 *     settings: {
 *         afrifutures: {
 *             baseUrl: 'http://localhost:3000',
 *             agentId: 'did:agent:xxx',
 *             apiKey: 'ag_xxx'
 *         }
 *     }
 * }
 * ```
 */

import { Plugin, Action, Memory, State, IAgentRuntime } from '@elizaos/core'

// Action definitions
export const registerAgentAction: Action = {
    name: 'AFRIFUTURES_REGISTER_AGENT',
    description: 'Register a new trading agent on the Afrifutures A2A marketplace',
    similes: ['REGISTER_TRADING_AGENT', 'JOIN_MARKETPLACE'],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text || ''
        return /register|join|create.*agent/i.test(content)
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        const settings = runtime.settings?.afrifutures
        if (!settings?.baseUrl) {
            return { success: false, error: 'Afrifutures not configured' }
        }

        const body = {
            name: settings.name || 'ElizaOS Agent',
            owner: settings.wallet,
            capabilities: settings.capabilities || ['HEDGE'],
            feeTier: settings.feeTier || 'FREE'
        }

        try {
            const response = await fetch(`${settings.baseUrl}/api/a2a/agents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            const data = await response.json()
            return { success: true, ...data }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    }
}

export const postOrderAction: Action = {
    name: 'AFRIFUTURES_POST_ORDER',
    description: 'Post a buy or sell order on the Afrifutures marketplace',
    similes: ['PLACE_ORDER', 'POST_ORDER', 'SUBMIT_ORDER'],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text || ''
        return /order|buy|sell|trade|post/i.test(content)
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        const settings = runtime.settings?.afrifutures
        if (!settings?.baseUrl || !settings?.agentId) {
            return { success: false, error: 'Afrifutures not configured' }
        }

        // Parse order details from message
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text || ''

        const side = /buy/i.test(content) ? 'BUY' : 'SELL'
        const commodityMatch = content.match(/cocoa|coffee|gold|cotton|wheat/i)
        const commodity = commodityMatch?.[0]?.toUpperCase() || 'COCOA'
        const quantityMatch = content.match(/(\d+)\s*(mt|kg|ton)/i)
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 100
        const priceMatch = content.match(/\$?(\d+)/)
        const price = priceMatch ? parseInt(priceMatch[1]) : 8500

        try {
            const response = await fetch(`${settings.baseUrl}/api/a2a/orders`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': settings.apiKey,
                    'X-Agent-ID': settings.agentId
                },
                body: JSON.stringify({
                    agentId: settings.agentId,
                    side,
                    commodity,
                    quantity,
                    price
                })
            })
            const data = await response.json()
            return { success: true, ...data }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    }
}

export const executeTradeAction: Action = {
    name: 'AFRIFUTURES_EXECUTE_TRADE',
    description: 'Execute a trade between two agents',
    similes: ['TRADE', 'MAKE_DEAL', 'EXECUTE'],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text || ''
        return /trade|execute|deal|buy|sell/i.test(content)
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        const settings = runtime.settings?.afrifutures
        if (!settings?.baseUrl) {
            return { success: false, error: 'Afrifutures not configured' }
        }

        try {
            const response = await fetch(`${settings.baseUrl}/api/a2a/trades`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': settings.apiKey
                },
                body: JSON.stringify(message.content)
            })
            const data = await response.json()
            return { success: true, ...data }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    }
}

export const getMarketPriceAction: Action = {
    name: 'AFRIFUTURES_GET_PRICE',
    description: 'Get current market price for a commodity',
    similes: ['CHECK_PRICE', 'MARKET_PRICE', 'CURRENT_PRICE'],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text || ''
        return /price|worth|value|cost/i.test(content)
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        const settings = runtime.settings?.afrifutures
        if (!settings?.baseUrl) {
            return { success: false, error: 'Afrifutures not configured' }
        }

        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text || ''

        const commodityMatch = content.match(/cocoa|coffee|gold|cotton|wheat/i)
        const commodity = commodityMatch?.[0]?.toUpperCase() || 'COCOA'

        try {
            const response = await fetch(`${settings.baseUrl}/api/a2a/mcp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'get_market_price',
                    arguments: { commodity, region: 'AFRICA' }
                })
            })
            const data = await response.json()
            return data.success ? data.result : { success: false, error: data.error }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    }
}

export const getOrderBookAction: Action = {
    name: 'AFRIFUTURES_GET_ORDER_BOOK',
    description: 'Get order book for a commodity',
    similes: ['ORDER_BOOK', 'LIST_ORDERS', 'VIEW_ORDERS'],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text || ''
        return /order.*book|orders|market.*depth/i.test(content)
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        const settings = runtime.settings?.afrifutures
        if (!settings?.baseUrl) {
            return { success: false, error: 'Afrifutures not configured' }
        }

        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text || ''

        const commodityMatch = content.match(/cocoa|coffee|gold|cotton|wheat/i)
        const commodity = commodityMatch?.[0]?.toUpperCase() || 'COCOA'

        try {
            const bidsRes = await fetch(
                `${settings.baseUrl}/api/a2a/orders?commodity=${commodity}&side=BUY`,
                { headers: { 'X-API-Key': settings.apiKey } }
            )
            const asksRes = await fetch(
                `${settings.baseUrl}/api/a2a/orders?commodity=${commodity}&side=SELL`,
                { headers: { 'X-API-Key': settings.apiKey } }
            )

            const bidsData = await bidsRes.json()
            const asksData = await asksRes.json()

            return {
                success: true,
                commodity,
                bids: bidsData.orders || [],
                asks: asksData.orders || []
            }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    }
}

// Plugin definition
export const AfrifuturesPlugin: Plugin = {
    name: 'afrifutures',
    description: 'Afrifutures A2A Commodity Marketplace plugin for ElizaOS agents',
    actions: [
        registerAgentAction,
        postOrderAction,
        executeTradeAction,
        getMarketPriceAction,
        getOrderBookAction
    ],
    providers: [],
    evaluators: [],
    services: []
}

export default AfrifuturesPlugin
