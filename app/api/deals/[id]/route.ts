import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userDeals } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/deals/[id] - Get deal details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid deal ID' },
        { status: 400 }
      );
    }

    const deal = await db.select()
      .from(userDeals)
      .where(eq(userDeals.id, dealId))
      .limit(1);

    if (!deal.length) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.update(userDeals)
      .set({ viewCount: sql`${userDeals.viewCount} + 1` })
      .where(eq(userDeals.id, dealId));

    return NextResponse.json({
      success: true,
      deal: deal[0],
    });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/deals/[id] - Update a deal
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dealId = parseInt(params.id);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid deal ID' },
        { status: 400 }
      );
    }

    // Check if user owns the deal
    const existingDeal = await db.select()
      .from(userDeals)
      .where(
        and(
          eq(userDeals.id, dealId),
          eq(userDeals.userId, userId)
        )
      )
      .limit(1);

    if (!existingDeal.length) {
      return NextResponse.json(
        { success: false, error: 'Deal not found or unauthorized' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Update the deal
    const updatedDeal = await db.update(userDeals)
      .set({
        ...body,
        images: body.images ? JSON.stringify(body.images) : undefined,
        documents: body.documents ? JSON.stringify(body.documents) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(userDeals.id, dealId))
      .returning();

    return NextResponse.json({
      success: true,
      deal: updatedDeal[0],
      message: 'Deal updated successfully',
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/deals/[id] - Delete a deal
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dealId = parseInt(params.id);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid deal ID' },
        { status: 400 }
      );
    }

    // Check if user owns the deal
    const existingDeal = await db.select()
      .from(userDeals)
      .where(
        and(
          eq(userDeals.id, dealId),
          eq(userDeals.userId, userId)
        )
      )
      .limit(1);

    if (!existingDeal.length) {
      return NextResponse.json(
        { success: false, error: 'Deal not found or unauthorized' },
        { status: 404 }
      );
    }

    // Soft delete - just mark as cancelled
    await db.update(userDeals)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(userDeals.id, dealId));

    return NextResponse.json({
      success: true,
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
