/**
 * Agent Subscription Route
 * 
 * GET /api/a2a/payments/subscription?agentId=xxx
 * POST /api/a2a/payments/subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agents, agentSubscriptions } from '@/lib/db/a2a-schema';
import { eq, and } from 'drizzle-orm';
import { calculateSubscriptionFee } from '@/lib/x402/agent-payments';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      );
    }

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

    const subscription = await db.select()
      .from(agentSubscriptions)
      .where(and(
        eq(agentSubscriptions.agentId, agentId),
        eq(agentSubscriptions.status, 'ACTIVE')
      ))
      .limit(1);

    const tiers = {
      FREE: { price: 0, name: 'Free', tradeFee: '0.5%' },
      BASIC: { price: 99, name: 'Basic', tradeFee: '0.3%' },
      PREMIUM: { price: 499, name: 'Premium', tradeFee: '0.15%' },
      ENTERPRISE: { price: 999, name: 'Enterprise', tradeFee: '0.1%' },
    };

    return NextResponse.json({
      agentId,
      currentTier: agent.feeTier,
      currentTierInfo: tiers[agent.feeTier as keyof typeof tiers],
      subscription: subscription[0] || null,
      availableTiers: tiers,
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, tier, txHash } = body;

    if (!agentId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, tier' },
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

    // Calculate fee
    const fee = calculateSubscriptionFee(tier);

    if (fee > 0 && !txHash) {
      return NextResponse.json(
        { 
          error: 'Payment required',
          fee,
          message: `Tier upgrade to ${tier} costs ${fee / 1_000_000} USDC/month`,
          instructions: {
            step1: 'Send USDC to platform wallet',
            step2: 'Include txHash in request',
          }
        },
        { status: 402 }
      );
    }

    // Update agent tier
    await db.update(agents)
      .set({ 
        feeTier: tier,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    // Create subscription record
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await db.insert(agentSubscriptions).values({
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      agentId,
      tier,
      billingCycle: 'MONTHLY',
      priceUsdc: fee / 1_000_000,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      paymentTxHash: txHash || null,
    });

    return NextResponse.json({
      success: true,
      message: `Upgraded to ${tier} tier`,
      tier,
      periodEnd: periodEnd.toISOString(),
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Subscription upgrade failed' },
      { status: 500 }
    );
  }
}
