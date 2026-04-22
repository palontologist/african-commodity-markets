/**
 * Agent Payment History Route
 * 
 * GET /api/a2a/payments/history?agentId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { platformRevenue } from '@/lib/db/a2a-schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      );
    }

    const history = await db.select()
      .from(platformRevenue)
      .where(eq(platformRevenue.agentId, agentId))
      .orderBy(desc(platformRevenue.collectedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      payments: history.map(p => ({
        id: p.id,
        type: p.feeType,
        amount: p.amount,
        currency: p.currency,
        tradeId: p.tradeId,
        collectedAt: p.collectedAt,
      })),
      count: history.length,
      pagination: { limit, offset },
    });

  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
