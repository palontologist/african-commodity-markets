/**
 * Platform Revenue Stats Route
 * 
 * GET /api/a2a/payments/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { platformRevenue, agents } from '@/lib/db/a2a-schema';
import { sql, eq, gte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';

    // Calculate period start
    const now = new Date();
    let periodStart: Date;
    
    switch (period) {
      case '7d':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get total revenue
    const revenueResult = await db.select({
      totalRevenue: sql<number>`SUM(CAST(${platformRevenue.amount} AS REAL))`,
      count: sql<number>`COUNT(*)`,
    })
      .from(platformRevenue)
      .where(gte(platformRevenue.collectedAt, periodStart));

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const transactionCount = revenueResult[0]?.count || 0;

    // Get revenue by type
    const revenueByType = await db.select({
      feeType: platformRevenue.feeType,
      total: sql<number>`SUM(CAST(${platformRevenue.amount} AS REAL))`,
    })
      .from(platformRevenue)
      .where(gte(platformRevenue.collectedAt, periodStart))
      .groupBy(platformRevenue.feeType);

    // Get top agents by revenue
    const topAgents = await db.select({
      agentId: platformRevenue.agentId,
      total: sql<number>`SUM(CAST(${platformRevenue.amount} AS REAL))`,
    })
      .from(platformRevenue)
      .where(gte(platformRevenue.collectedAt, periodStart))
      .groupBy(platformRevenue.agentId)
      .orderBy(desc(sql`SUM(CAST(${platformRevenue.amount} AS REAL))`))
      .limit(10);

    // Get agent names for top agents
    const agentIds = topAgents.map(a => a.agentId);
    const agentDetails = await db.select({
      id: agents.id,
      name: agents.name,
    })
      .from(agents)
      .where(sql`${agents.id} IN ${agentIds.length > 0 ? agentIds : ['']}`);

    const agentMap = new Map(agentDetails.map(a => [a.id, a.name]));

    // Get total platform stats
    const platformStats = await db.select({
      totalAgents: sql<number>`COUNT(*)`,
      activeAgents: sql<number>`SUM(CASE WHEN ${agents.status} = 'ACTIVE' THEN 1 ELSE 0 END)`,
      totalVolume: sql<number>`SUM(CAST(${agents.totalVolume} AS REAL))`,
    })
      .from(agents);

    return NextResponse.json({
      period,
      periodStart: periodStart.toISOString(),
      periodEnd: now.toISOString(),
      revenue: {
        total: totalRevenue,
        transactionCount,
        averageTransaction: transactionCount > 0 ? totalRevenue / transactionCount : 0,
      },
      revenueByType: revenueByType.map(r => ({
        type: r.feeType,
        total: r.total,
      })),
      topAgents: topAgents.map(a => ({
        agentId: a.agentId,
        name: agentMap.get(a.agentId) || 'Unknown',
        revenue: a.total,
      })),
      platform: {
        totalAgents: platformStats[0]?.totalAgents || 0,
        activeAgents: platformStats[0]?.activeAgents || 0,
        totalVolume: platformStats[0]?.totalVolume || 0,
      },
    });

  } catch (error) {
    console.error('Revenue stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue stats' },
      { status: 500 }
    );
  }
}
