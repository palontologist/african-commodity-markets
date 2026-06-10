import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/lots/[id]/advance - Take advance on a lot
 */
// Temporarily disabled due to TypeScript build issue
// export async function POST(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = await auth();
//     const lotId = params.id;

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     // Verify user owns this lot
//     const lot = await db
//       .select()
//       .from(commodityListings)
//       .where(eq(commodityListings.id, lotId), eq(commodityListings.userId, userId))
//       .limit(1);

//     if (!lot.length) {
//       return NextResponse.json(
//         { success: false, message: 'Lot not found or unauthorized' },
//         { status: 404 }
//       );
//     }

//     const { advanceAmount } = await request.json();

//     if (!advanceAmount || advanceAmount <= 0) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid advance amount' },
//         { status: 400 }
//       );
//     }

//     // Calculate new advance and health metrics
//     const currentAdvance = lot[0].currentAdvance || 0;
//     const newTotalAdvance = currentAdvance + advanceAmount;
//     const totalValue = lot[0].askingPrice;
//     const healthFactor = Math.max(100, Math.min(300, ((totalValue - newTotalAdvance) / newTotalAdvance) * 100));

//     // Update lot with new advance
//     await db
//       .update(commodityListings)
//       .set({
//         currentAdvance: newTotalAdvance,
//         updatedAt: new Date()
//       })
//       .where(eq(commodityListings.id, lotId));

//     return NextResponse.json({
//       success: true,
//       message: 'Advance taken successfully',
//       advanceAmount: newTotalAdvance,
//       healthFactor: Math.round(healthFactor),
//       collateralRatio: Math.min(400, Math.max(120, 200 - (healthFactor - 100) * 0.8)),
//       status: healthFactor < 140 ? 'RISKY' : 'ACTIVE'
//     });
//   } catch (error) {
//     console.error('Take advance error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to take advance' },
//       { status: 500 }
//     );
//   }
// }
