import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { commodityListings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/lots - Fetch lots for a wallet
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'Wallet address required' },
        { status: 400 }
      )
    }

    const lots = await db
      .select()
      .from(commodityListings)
      .where(eq(commodityListings.userId, wallet))

    // Transform to match frontend interface
    const transformedLots = lots.map(lot => ({
      id: lot.id.toString(),
      commodity: lot.commodityId.toString(), // TODO: Join with commodities table
      quantity: lot.quantity,
      currentValue: lot.askingPrice,
      advanceTaken: lot.askingPrice * 0.7, // Mock 70% LTV
      collateralRatio: 170, // Mock ratio
      healthFactor: 170,
      status: lot.status,
      createdAt: lot.createdAt?.toISOString() || new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      lots: transformedLots
    })
  } catch (error) {
    console.error('Fetch lots error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch lots' },
      { status: 500 }
    )
  }
}

// POST /api/lots - Create new lot
// Temporarily disabled due to TypeScript build issue
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { userId, commodityId, quantity, grade, dvcScore, collateralRatio } = body;

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: 'User ID required' },
//         { status: 401 }
//       )
//     }

//     // Validate input
//     if (!commodityId || !quantity || !grade) {
//       return NextResponse.json(
//         { success: false, message: 'Commodity, quantity, and grade are required' },
//         { status: 400 }
//       )
//     }

//     // Create lot
//     const newLot = await db.insert(commodityListings).values({
//       userId,
//       commodityId,
//       quantity,
//       grade,
//       dvcScore,
//       collateralRatio: collateralRatio || 170,
//       status: 'ACTIVE',
//     }).returning()

//     return NextResponse.json({
//       success: true,
//       lot: newLot[0],
//       message: 'Lot created successfully'
//     })
//   } catch (error) {
//     console.error('Create lot error:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to create lot' },
//       { status: 500 }
//     )
//   }
// }
