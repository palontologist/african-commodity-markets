/**
 * Agent Payment Routes
 * 
 * Handles:
 * - Balance top-up
 * - Payment history
 * - Subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agents } from '@/lib/db/a2a-schema';
import { platformRevenue } from '@/lib/db/a2a-schema';
import { eq } from 'drizzle-orm';
import { 
  getAgentBalance, 
  topUpAgentBalance,
  calculateSubscriptionFee,
  calculateTradeFee,
  processAgentPayment,
  createPaymentRequiredResponse,
} from '@/lib/x402/agent-payments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

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

    return NextResponse.json({
      agentId: agent.id,
      name: agent.name,
      balance: agent.platformFeesOwed || 0,
      totalPaid: agent.platformFeesPaid || 0,
      tier: agent.feeTier,
      reputation: agent.reputation,
      status: agent.status,
    });

  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
