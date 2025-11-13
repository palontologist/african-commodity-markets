import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userDeals, dealInquiries } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/deals - List all active deals or user's deals
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const myDeals = searchParams.get('my') === 'true';
    const dealType = searchParams.get('type');
    const status = searchParams.get('status') || 'ACTIVE';

    let query = db.select().from(userDeals);

    // If requesting own deals, filter by userId
    if (myDeals && userId) {
      query = query.where(eq(userDeals.userId, userId));
    } else if (!myDeals) {
      // Public deals only
      query = query.where(
        and(
          eq(userDeals.visibility, 'PUBLIC'),
          eq(userDeals.status, status)
        )
      );
    }

    // Filter by deal type if specified
    if (dealType) {
      query = query.where(eq(userDeals.dealType, dealType));
    }

    const deals = await query.orderBy(desc(userDeals.createdAt)).limit(50);

    return NextResponse.json({
      success: true,
      deals,
      count: deals.length,
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals - Create a new deal
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      dealType,
      description,
      commodityId,
      category,
      quantity,
      unit,
      askingPrice,
      currency,
      location,
      countryId,
      images,
      documents,
      settlementTerms,
      paymentMethod,
      visibility,
      expiresAt,
      contactEmail,
      contactPhone,
    } = body;

    // Validate required fields
    if (!title || !dealType || !description || !askingPrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the deal
    const newDeal = await db.insert(userDeals).values({
      userId,
      title,
      dealType,
      description,
      commodityId: commodityId || null,
      category: category || null,
      quantity: quantity || null,
      unit: unit || null,
      askingPrice,
      currency: currency || 'USD',
      location: location || null,
      countryId: countryId || null,
      images: images ? JSON.stringify(images) : null,
      documents: documents ? JSON.stringify(documents) : null,
      settlementTerms: settlementTerms || null,
      paymentMethod: paymentMethod || null,
      status: 'ACTIVE',
      visibility: visibility || 'PUBLIC',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      viewCount: 0,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
    }).returning();

    return NextResponse.json({
      success: true,
      deal: newDeal[0],
      message: 'Deal created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
