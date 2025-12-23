import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { commodityListings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lotId = parseInt(params.id)

    // Fetch lot from database
    const [lot] = await db
      .select()
      .from(commodityListings)
      .where(eq(commodityListings.id, lotId))

    if (!lot) {
      return NextResponse.json(
        { success: false, message: 'Lot not found' },
        { status: 404 }
      )
    }

    if (lot.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Lot is not active' },
        { status: 400 }
      )
    }

    // Calculate advance amount (70% of asking price)
    const advanceAmount = lot.askingPrice * 0.7
    const fee = advanceAmount * 0.025
    const netAmount = advanceAmount - fee

    // TODO: Implement actual USDC transfer logic
    // This would involve:
    // 1. Pulling USDC from liquidity pool
    // 2. Transferring to farmer's wallet or off-ramp partner
    // 3. Recording the advance on-chain
    // 4. Updating database with advance details

    // For MVP, just update the lot status
    await db
      .update(commodityListings)
      .set({
        status: 'PENDING_SALE',
        updatedAt: new Date()
      })
      .where(eq(commodityListings.id, lotId))

    // Mock transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    return NextResponse.json({
      success: true,
      advanceAmount: netAmount,
      txHash,
      message: `Advance of ${netAmount} USDC queued for transfer`
    })
  } catch (error) {
    console.error('Advance funding error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process advance' },
      { status: 500 }
    )
  }
}
