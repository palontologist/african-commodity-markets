import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { dealInquiries, userDeals } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/deals/[id]/inquiries/[inquiryId]
 * Allows the deal owner (seller) to approve or reject a buyer inquiry.
 *
 * Body: { action: 'ACCEPT' | 'REJECT' | 'REPLY', replyMessage?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; inquiryId: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dealId = parseInt(params.id)
    const inquiryId = parseInt(params.inquiryId)

    if (isNaN(dealId) || isNaN(inquiryId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    // Verify the caller owns this deal
    const deal = await db
      .select()
      .from(userDeals)
      .where(and(eq(userDeals.id, dealId), eq(userDeals.userId, userId)))
      .limit(1)

    if (!deal.length) {
      return NextResponse.json(
        { success: false, error: 'Deal not found or unauthorized' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { action } = body as { action: 'ACCEPT' | 'REJECT' | 'REPLY'; replyMessage?: string }

    const allowedActions = ['ACCEPT', 'REJECT', 'REPLY'] as const
    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'action must be ACCEPT, REJECT or REPLY' },
        { status: 400 }
      )
    }

    const statusMap: Record<typeof action, string> = {
      ACCEPT: 'ACCEPTED',
      REJECT: 'REJECTED',
      REPLY: 'REPLIED',
    }

    const updated = await db
      .update(dealInquiries)
      .set({ status: statusMap[action], updatedAt: new Date() })
      .where(and(eq(dealInquiries.id, inquiryId), eq(dealInquiries.dealId, dealId)))
      .returning()

    if (!updated.length) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      inquiry: updated[0],
      message: `Inquiry ${statusMap[action].toLowerCase()} successfully`,
    })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}
