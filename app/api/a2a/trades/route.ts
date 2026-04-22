import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentOrders, agentTrades, agents, negotiations } from '@/lib/db/a2a-schema';
import { eq, and, desc } from 'drizzle-orm';

function generateTradeId(): string {
  const bytes = randomBytes(8);
  return `trd:${bytes.toString('hex')}`;
}

function calculatePlatformFee(orderValue: number, tier: string): { fee: number; bps: number } {
  const tierBps: Record<string, number> = {
    FREE: 50,
    BASIC: 30,
    PREMIUM: 20,
    ENTERPRISE: 10
  };
  const bps = tierBps[tier] || 50;
  return { fee: (orderValue * bps) / 10000, bps };
}

import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      buyerOrderId,
      sellerOrderId,
      buyerAgentId,
      sellerAgentId,
      commodity,
      quantity,
      unit = 'MT',
      price,
      negotiationId
    } = body;

    if (!buyerAgentId || !sellerAgentId || !commodity || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify both agents exist
    const [buyer] = await db.select().from(agents).where(eq(agents.id, buyerAgentId));
    const [seller] = await db.select().from(agents).where(eq(agents.id, sellerAgentId));

    if (!buyer || !seller) {
      return NextResponse.json(
        { error: 'One or both agents not found' },
        { status: 404 }
      );
    }

    const totalValue = quantity * price;
    const tradeId = generateTradeId();

    // Calculate fees based on buyer tier
    const { fee: platformFee, bps: platformFeeBps } = calculatePlatformFee(totalValue, buyer.feeTier);

    const [trade] = await db.insert(agentTrades).values({
      id: tradeId,
      buyerAgentId,
      sellerAgentId,
      commodity,
      quantity,
      unit,
      price,
      totalValue,
      negotiationId,
      buyerOrderId,
      sellerOrderId,
      platformFee,
      platformFeeBps,
      status: 'PENDING',
      executedAt: new Date()
    }).returning();

    // Update seller order if provided
    if (sellerOrderId) {
      await db.update(agentOrders)
        .set({ status: 'EXECUTED', filledQuantity: quantity, matchedWith: tradeId, executionPrice: price })
        .where(eq(agentOrders.id, sellerOrderId));
    }

    // Update buyer order if provided
    if (buyerOrderId) {
      await db.update(agentOrders)
        .set({ status: 'EXECUTED', filledQuantity: quantity, matchedWith: tradeId, executionPrice: price })
        .where(eq(agentOrders.id, buyerOrderId));
    }

    // Update agent stats
    await db.update(agents)
      .set({
        totalTrades: (buyer.totalTrades || 0) + 1,
        totalVolume: (buyer.totalVolume || 0) + totalValue,
        platformFeesOwed: (buyer.platformFeesOwed || 0) + platformFee,
        updatedAt: new Date()
      })
      .where(eq(agents.id, buyerAgentId));

    await db.update(agents)
      .set({
        totalTrades: (seller.totalTrades || 0) + 1,
        totalVolume: (seller.totalVolume || 0) + totalValue,
        platformFeesPaid: (seller.platformFeesPaid || 0) + platformFee,
        updatedAt: new Date()
      })
      .where(eq(agents.id, sellerAgentId));

    // Update negotiation if provided
    if (negotiationId) {
      await db.update(negotiations)
        .set({ status: 'EXECUTED', executedTradeId: tradeId, updatedAt: new Date() })
        .where(eq(negotiations.id, negotiationId));
    }

    return NextResponse.json({
      success: true,
      trade: {
        id: tradeId,
        buyerAgentId,
        sellerAgentId,
        commodity,
        quantity,
        unit,
        price,
        totalValue,
        platformFee,
        platformFeeBps,
        status: 'PENDING',
        executedAt: trade.executedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Trade execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute trade' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = db.select().from(agentTrades).limit(limit).orderBy(desc(agentTrades.createdAt));

    const trades = await query;

    // Filter by agent if specified
    const filtered = agentId
      ? trades.filter(t => t.buyerAgentId === agentId || t.sellerAgentId === agentId)
      : trades;

    // Filter by status if specified
    const final = status ? filtered.filter(t => t.status === status) : filtered;

    return NextResponse.json({
      trades: final,
      count: final.length
    });

  } catch (error) {
    console.error('Trade list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}
