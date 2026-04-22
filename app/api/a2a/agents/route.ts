import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agents, agentApiKeys, agentCapabilities } from '@/lib/db/a2a-schema';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';

function generateAgentId(): string {
  const bytes = randomBytes(8);
  return `did:agent:${bytes.toString('hex')}`;
}

function generateApiKey(): string {
  return `ag_${randomBytes(32).toString('hex')}`;
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      owner,
      capabilities = [],
      feeTier = 'FREE',
      metadataCID
    } = body;

    if (!name || !owner) {
      return NextResponse.json(
        { error: 'Name and owner (wallet address) are required' },
        { status: 400 }
      );
    }

    const agentId = generateAgentId();
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    // Create agent
    const [agent] = await db.insert(agents).values({
      id: agentId,
      owner,
      name,
      description,
      capabilities: JSON.stringify(capabilities),
      feeTier,
      metadataCID,
      status: 'ACTIVE',
      lastSeen: new Date()
    }).returning();

    // Create initial API key with full permissions
    const apiKeyId = randomBytes(8).toString('hex');
    await db.insert(agentApiKeys).values({
      id: apiKeyId,
      agentId: agentId,
      keyHash,
      name: 'Primary API Key',
      permissions: JSON.stringify(['ORDER_READ', 'ORDER_WRITE', 'TRADE_READ', 'TRADE_EXECUTE', 'NEGOTIATE_READ', 'NEGOTIATE_WRITE']),
      rateLimit: 100,
      isActive: true
    });

    // Create capability entries
    if (capabilities.length > 0) {
      const capabilityEntries = capabilities.map((cap: string) => ({
        id: randomBytes(8).toString('hex'),
        agentId: agentId,
        side: cap.includes('BUY') ? 'BUY' : cap.includes('SELL') ? 'SELL' : 'BOTH',
        executionSpeed: 'STANDARD'
      }));
      await db.insert(agentCapabilities).values(capabilityEntries);
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        name,
        owner,
        feeTier,
        capabilities,
        status: 'ACTIVE'
      },
      apiKey: apiKey, // Only returned once!
      apiKeyId,
      message: 'Store this API key securely. It will not be shown again.'
    }, { status: 201 });

  } catch (error) {
    console.error('Agent registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const capability = searchParams.get('capability');
    const status = searchParams.get('status') || 'ACTIVE';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(agents).where(eq(agents.status, status)).limit(limit).offset(offset);

    const results = await query;

    // Filter by capability if specified
    const filtered = capability 
      ? results.filter(a => JSON.parse(a.capabilities).includes(capability))
      : results;

    const agentsList = filtered.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      capabilities: JSON.parse(a.capabilities),
      feeTier: a.feeTier,
      reputation: a.reputation,
      totalTrades: a.totalTrades,
      totalVolume: a.totalVolume,
      status: a.status,
      createdAt: a.createdAt
    }));

    return NextResponse.json({
      agents: agentsList,
      count: agentsList.length,
      pagination: { limit, offset }
    });

  } catch (error) {
    console.error('Agent list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
