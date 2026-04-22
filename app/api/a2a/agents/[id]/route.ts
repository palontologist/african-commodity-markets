import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agents, agentApiKeys } from '@/lib/db/a2a-schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [agent] = await db.select().from(agents).where(eq(agents.id, id));

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        avatar: agent.avatar,
        capabilities: JSON.parse(agent.capabilities),
        feeTier: agent.feeTier,
        commissionBps: agent.commissionBps,
        reputation: agent.reputation,
        totalTrades: agent.totalTrades,
        totalVolume: agent.totalVolume,
        avgRating: agent.avgRating,
        status: agent.status,
        createdAt: agent.createdAt
      }
    });

  } catch (error) {
    console.error('Get agent error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, avatar, capabilities, metadataCID } = body;

    const [agent] = await db.select().from(agents).where(eq(agents.id, id));

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (avatar !== undefined) updates.avatar = avatar;
    if (capabilities) updates.capabilities = JSON.stringify(capabilities);
    if (metadataCID !== undefined) updates.metadataCID = metadataCID;

    await db.update(agents).set(updates).where(eq(agents.id, id));

    return NextResponse.json({
      success: true,
      message: 'Agent updated successfully'
    });

  } catch (error) {
    console.error('Update agent error:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}
