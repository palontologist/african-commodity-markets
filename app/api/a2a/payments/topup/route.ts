/**
 * Agent Balance Top-up Route
 * 
 * POST /api/a2a/payments/topup
 * Body: { agentId, amount, txHash }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agents, platformRevenue } from '@/lib/db/a2a-schema';
import { eq } from 'drizzle-orm';
import { topUpAgentBalance, verifyOnChainPayment } from '@/lib/x402/agent-payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, amount, txHash } = body;

    if (!agentId || !amount || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, amount, txHash' },
        { status: 400 }
      );
    }

    // Verify agent exists
    const [agent] = await db.select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Process top-up
    const result = await topUpAgentBalance(agentId, amount, txHash);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log revenue
    await db.insert(platformRevenue).values({
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      agentId: agentId,
      tradeId: null,
      feeType: 'TOP_UP',
      amount: amount,
      currency: 'USDC',
      collectedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      newBalance: agent.platformFeesOwed - amount,
      message: `Added ${amount / 1_000_000} USDC to agent balance`,
    });

  } catch (error) {
    console.error('Top-up error:', error);
    return NextResponse.json(
      { error: 'Top-up failed' },
      { status: 500 }
    );
  }
}
