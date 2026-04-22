/**
 * MCP (Model Context Protocol) Server for A2A Commodity Marketplace
 * 
 * This server exposes tools that external AI agents can use to:
 * - Register on the marketplace
 * - Post and manage orders
 * - Negotiate with other agents
 * - Execute trades
 * - Query market data
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agents, agentOrders, agentTrades, negotiations, agentApiKeys } from '@/lib/db/a2a-schema';
import { eq, and, desc } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

const MCP_TOOLS: MCPTool[] = [
  {
    name: 'register_agent',
    description: 'Register a new trading agent on the A2A marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Agent name' },
        owner: { type: 'string', description: 'Wallet address of owner' },
        capabilities: { type: 'array', description: 'Capabilities: HEDGE, ARBITRAGE, MARKET_MAKE, SPECULATE' },
        fee_tier: { type: 'string', description: 'FREE, BASIC, PREMIUM, ENTERPRISE' }
      },
      required: ['name', 'owner']
    }
  },
  {
    name: 'list_orders',
    description: 'Get order book for a commodity',
    inputSchema: {
      type: 'object',
      properties: {
        commodity: { type: 'string', description: 'Commodity code: COCOA, COFFEE, etc.' },
        side: { type: 'string', description: 'BUY or SELL' },
        min_price: { type: 'number', description: 'Minimum price filter' },
        max_price: { type: 'number', description: 'Maximum price filter' },
        limit: { type: 'number', description: 'Max results (default 50)' }
      },
      required: ['commodity']
    }
  },
  {
    name: 'post_order',
    description: 'Post a buy or sell order',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: { type: 'string', description: 'Your agent ID' },
        side: { type: 'string', description: 'BUY or SELL' },
        commodity: { type: 'string', description: 'Commodity code' },
        quantity: { type: 'number', description: 'Quantity in MT' },
        price: { type: 'number', description: 'Price per MT in USDC' },
        order_type: { type: 'string', description: 'LIMIT (default) or MARKET' }
      },
      required: ['agent_id', 'side', 'commodity', 'quantity', 'price']
    }
  },
  {
    name: 'negotiate',
    description: 'Start negotiation with another agent',
    inputSchema: {
      type: 'object',
      properties: {
        buyer_agent_id: { type: 'string', description: 'Buyer agent ID' },
        seller_agent_id: { type: 'string', description: 'Seller agent ID' },
        commodity: { type: 'string', description: 'Commodity code' },
        quantity: { type: 'number', description: 'Quantity in MT' },
        price: { type: 'number', description: 'Proposed price per MT' },
        unit: { type: 'string', description: 'Unit (default MT)' }
      },
      required: ['buyer_agent_id', 'seller_agent_id', 'commodity', 'quantity', 'price']
    }
  },
  {
    name: 'execute_trade',
    description: 'Execute a matched trade',
    inputSchema: {
      type: 'object',
      properties: {
        buyer_agent_id: { type: 'string', description: 'Buyer agent ID' },
        seller_agent_id: { type: 'string', description: 'Seller agent ID' },
        commodity: { type: 'string', description: 'Commodity code' },
        quantity: { type: 'number', description: 'Quantity in MT' },
        price: { type: 'number', description: 'Agreed price per MT' },
        negotiation_id: { type: 'string', description: 'Negotiation ID if negotiated' }
      },
      required: ['buyer_agent_id', 'seller_agent_id', 'commodity', 'quantity', 'price']
    }
  },
  {
    name: 'get_trade_history',
    description: 'Get trade history for an agent',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: { type: 'string', description: 'Agent ID' },
        limit: { type: 'number', description: 'Max results (default 50)' }
      },
      required: ['agent_id']
    }
  },
  {
    name: 'get_reputation',
    description: 'Get agent reputation score',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: { type: 'string', description: 'Agent ID' }
      },
      required: ['agent_id']
    }
  },
  {
    name: 'get_market_price',
    description: 'Get current market price for a commodity',
    inputSchema: {
      type: 'object',
      properties: {
        commodity: { type: 'string', description: 'Commodity code' },
        region: { type: 'string', description: 'AFRICA or LATAM' }
      },
      required: ['commodity']
    }
  }
];

// MCP Protocol: List tools
export async function GET() {
  return NextResponse.json({
    tools: MCP_TOOLS
  });
}

// MCP Protocol: Call tool
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, arguments: args } = body;

    if (!tool) {
      return NextResponse.json({ error: 'Tool name required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    switch (tool) {
      case 'register_agent': {
        const { name, owner, capabilities = [], fee_tier = 'FREE' } = args;
        const agentId = `did:agent:${randomBytes(8).toString('hex')}`;
        const apiKey = `ag_${randomBytes(32).toString('hex')}`;
        
        await db.insert(agents).values({
          id: agentId,
          owner,
          name,
          capabilities: JSON.stringify(capabilities),
          feeTier: fee_tier,
          status: 'ACTIVE',
          lastSeen: new Date()
        });

        return NextResponse.json({
          success: true,
          result: {
            agent_id: agentId,
            api_key: apiKey,
            message: 'Agent registered. Store API key securely.'
          }
        });
      }

      case 'list_orders': {
        const { commodity, side, min_price, max_price, limit = 50 } = args;
        
        let conditions = [eq(agentOrders.status, 'OPEN'), eq(agentOrders.commodity, commodity)];
        if (side) conditions.push(eq(agentOrders.side, side));
        
        const orders = await db
          .select()
          .from(agentOrders)
          .where(and(...conditions))
          .orderBy(desc(agentOrders.createdAt))
          .limit(limit);

        const filtered = orders.filter(o => {
          if (min_price && o.price < min_price) return false;
          if (max_price && o.price > max_price) return false;
          return true;
        });

        return NextResponse.json({
          success: true,
          result: {
            orders: filtered.map(o => ({
              id: o.id,
              agent_id: o.agentId,
              side: o.side,
              commodity: o.commodity,
              quantity: o.quantity,
              price: o.price,
              total_value: o.totalValue,
              created_at: o.createdAt
            })),
            count: filtered.length
          }
        });
      }

      case 'post_order': {
        const { agent_id, side, commodity, quantity, price, order_type = 'LIMIT' } = args;
        
        const [agent] = await db.select().from(agents).where(eq(agents.id, agent_id));
        if (!agent) {
          return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        const orderId = `ord:${randomBytes(8).toString('hex')}`;
        const totalValue = quantity * price;

        await db.insert(agentOrders).values({
          id: orderId,
          agentId: agent_id,
          side,
          commodity,
          quantity,
          price,
          totalValue,
          orderType: order_type,
          status: 'OPEN'
        });

        return NextResponse.json({
          success: true,
          result: {
            order_id: orderId,
            status: 'OPEN'
          }
        });
      }

      case 'negotiate': {
        const { buyer_agent_id, seller_agent_id, commodity, quantity, price, unit = 'MT' } = args;
        
        const negotiationId = `neg:${randomBytes(8).toString('hex')}`;
        
        await db.insert(negotiations).values({
          id: negotiationId,
          buyerAgentId: buyer_agent_id,
          sellerAgentId: seller_agent_id,
          commodity,
          quantity,
          unit,
          currentOffer: JSON.stringify({ price, quantity }),
          offerHistory: JSON.stringify([{ price, quantity, timestamp: new Date() }]),
          status: 'PROPOSED'
        });

        return NextResponse.json({
          success: true,
          result: {
            negotiation_id: negotiationId,
            status: 'PROPOSED'
          }
        });
      }

      case 'execute_trade': {
        const { buyer_agent_id, seller_agent_id, commodity, quantity, price, negotiation_id } = args;
        
        const totalValue = quantity * price;
        const tradeId = `trd:${randomBytes(8).toString('hex')}`;
        const platformFee = (totalValue * 50) / 10000; // 0.5% default fee

        await db.insert(agentTrades).values({
          id: tradeId,
          buyerAgentId: buyer_agent_id,
          sellerAgentId: seller_agent_id,
          commodity,
          quantity,
          unit: 'MT',
          price,
          totalValue,
          platformFee,
          platformFeeBps: 50,
          negotiationId: negotiation_id,
          status: 'PENDING',
          executedAt: new Date()
        });

        // Update negotiation if provided
        if (negotiation_id) {
          await db.update(negotiations)
            .set({ status: 'EXECUTED', executedTradeId: tradeId })
            .where(eq(negotiations.id, negotiation_id));
        }

        return NextResponse.json({
          success: true,
          result: {
            trade_id: tradeId,
            status: 'PENDING',
            total_value: totalValue,
            platform_fee: platformFee
          }
        });
      }

      case 'get_trade_history': {
        const { agent_id, limit = 50 } = args;
        
        const trades = await db
          .select()
          .from(agentTrades)
          .orderBy(desc(agentTrades.createdAt))
          .limit(limit);

        const filtered = trades.filter(t => 
          t.buyerAgentId === agent_id || t.sellerAgentId === agent_id
        );

        return NextResponse.json({
          success: true,
          result: {
            trades: filtered.map(t => ({
              id: t.id,
              commodity: t.commodity,
              quantity: t.quantity,
              price: t.price,
              total_value: t.totalValue,
              is_buyer: t.buyerAgentId === agent_id,
              status: t.status,
              executed_at: t.executedAt
            })),
            count: filtered.length
          }
        });
      }

      case 'get_reputation': {
        const { agent_id } = args;
        
        const [agent] = await db.select().from(agents).where(eq(agents.id, agent_id));
        
        if (!agent) {
          return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          result: {
            agent_id: agent.id,
            reputation: agent.reputation,
            total_trades: agent.totalTrades,
            total_volume: agent.totalVolume,
            fee_tier: agent.feeTier
          }
        });
      }

      case 'get_market_price': {
        const { commodity, region = 'AFRICA' } = args;
        
        // Import live prices
        const { getLivePrice } = await import('@/lib/live-prices');
        const priceData = await getLivePrice(commodity as any, region as any);

        return NextResponse.json({
          success: true,
          result: {
            commodity,
            price: priceData.price,
            currency: priceData.currency,
            source: priceData.source,
            timestamp: priceData.timestamp
          }
        });
      }

      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }

  } catch (error) {
    console.error('MCP tool error:', error);
    return NextResponse.json(
      { error: 'Tool execution failed' },
      { status: 500 }
    );
  }
}
