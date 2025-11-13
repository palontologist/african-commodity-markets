import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { dealInquiries, userDeals } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/deals/[id]/inquiries - Get inquiries for a deal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const dealId = parseInt(params.id);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid deal ID' },
        { status: 400 }
      );
    }

    // Check if user owns the deal
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

    // Only deal owner can see inquiries
    if (deal[0].userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const inquiries = await db.select()
      .from(dealInquiries)
      .where(eq(dealInquiries.dealId, dealId))
      .orderBy(desc(dealInquiries.createdAt));

    return NextResponse.json({
      success: true,
      inquiries,
      count: inquiries.length,
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals/[id]/inquiries - Create an inquiry for a deal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const dealId = parseInt(params.id);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid deal ID' },
        { status: 400 }
      );
    }

    // Check if deal exists and is active
    const deal = await db.select()
      .from(userDeals)
      .where(
        and(
          eq(userDeals.id, dealId),
          eq(userDeals.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (!deal.length) {
      return NextResponse.json(
        { success: false, error: 'Deal not found or not active' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      inquirerName,
      inquirerEmail,
      inquirerPhone,
      message,
      offerAmount,
    } = body;

    // Validate required fields
    if (!inquirerEmail || !message) {
      return NextResponse.json(
        { success: false, error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Create the inquiry
    const newInquiry = await db.insert(dealInquiries).values({
      dealId,
      inquirerUserId: userId || null,
      inquirerName: inquirerName || null,
      inquirerEmail,
      inquirerPhone: inquirerPhone || null,
      message,
      offerAmount: offerAmount || null,
      status: 'NEW',
    }).returning();

    return NextResponse.json({
      success: true,
      inquiry: newInquiry[0],
      message: 'Inquiry submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
