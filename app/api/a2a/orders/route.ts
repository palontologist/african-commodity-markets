import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentOrders, agentTrades, negotiations } from '@/lib/db/a2a-schema';
import { eq, and, desc } from 'drizzle-orm';

function generateOrderId(): string {
  const bytes = randomBytes(8);
  return `ord:${bytes.toString('hex')}`;
}

function calculatePlatformFee(orderValue: number, feeTier: string): { fee: number; bps: number } {
  const tierFees: Record<string, number> = {
    FREE: 50,
    BASIC: 30,
    PREMIUM: 20,
    ENTERPRISE: 10
  };
  const bps = tierFees[feeTier] || 50;
  return { fee: (orderValue * bps) / 10000, bps };
}

import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      agentId,
      side,
      commodity,
      quantity,
      unit = 'MT',
      price,
      orderType = 'LIMIT',
      timeInForce = 'GTC',
      visibility = 'PUBLIC',
      allowedAgents = [],
      expiresAt
    } = body;

    if (!agentId || !side || !commodity || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, side, commodity, quantity, price' },
        { status: 400 }
      );
    }

    if (!['BUY', 'SELL'].includes(side)) {
      return NextResponse.json(
        { error: 'Side must be BUY or SELL' },
        { status: 400 }
      );
    }

    const totalValue = quantity * price;
    const orderId = generateOrderId();

    const [order] = await db.insert(agentOrders).values({
      id: orderId,
      agentId,
      side,
      commodity,
      quantity,
      unit,
      price,
      totalValue,
      orderType,
      timeInForce,
      visibility,
      allowedAgents: JSON.stringify(allowedAgents),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: 'OPEN'
    }).returning();

    // Broadcast to SSE subscribers (in real implementation)
    // await broadcastOrderUpdate(order);

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        agentId,
        side,
        commodity,
        quantity,
        unit,
        price,
        totalValue,
        status: 'OPEN',
        createdAt: order.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity');
    const side = searchParams.get('side');
    const status = searchParams.get('status') || 'OPEN';
    const limit = parseInt(searchParams.get('limit') || '100');

    let conditions = [eq(agentOrders.status, status)];
    if (commodity) conditions.push(eq(agentOrders.commodity, commodity));
    if (side) conditions.push(eq(agentOrders.side, side));

    const orders = await db
      .select()
      .from(agentOrders)
      .where(and(...conditions))
      .orderBy(desc(agentOrders.createdAt))
      .limit(limit);

    return NextResponse.json({
      orders: orders.map(o => ({
        ...o,
        allowedAgents: JSON.parse(o.allowedAgents || '[]')
      })),
      count: orders.length
    });

  } catch (error) {
    console.error('Order list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
