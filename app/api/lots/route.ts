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
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const commodity = formData.get('commodity') as string
    const quantity = parseFloat(formData.get('quantity') as string)
    const unit = formData.get('unit') as string
    const grade = formData.get('grade') as string
    const targetPrice = formData.get('targetPrice') as string
    const deliveryDate = formData.get('deliveryDate') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string
    const walletAddress = formData.get('walletAddress') as string

    // Handle file uploads (mock for now)
    const warehouseReceipt = formData.get('warehouseReceipt') as File
    const certifications = formData.get('certifications') as File

    // Verify warehouse receipt
    let receiptBase64 = ''
    if (warehouseReceipt) {
      const buffer = await warehouseReceipt.arrayBuffer()
      receiptBase64 = Buffer.from(buffer).toString('base64')
    }

    const verificationResponse = await fetch(`${req.nextUrl.origin}/api/warehouse/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiptImage: receiptBase64,
        commodityType: commodity,
        quantity,
        location,
        farmerWallet: walletAddress
      })
    })

    const verification = await verificationResponse.json()

    if (verification.verification?.status === 'REJECTED') {
      return NextResponse.json(
        { success: false, message: 'Warehouse receipt verification failed' },
        { status: 400 }
      )
    }

    // Create lot in database
    const [newLot] = await db.insert(commodityListings).values({
      userId: walletAddress,
      commodityId: 1, // TODO: Map commodity string to ID
      quantity,
      askingPrice: parseFloat(targetPrice) || quantity * 2, // Mock price
      currency: 'USDC',
      location,
      description,
      status: 'ACTIVE',
      onChainTokenId: null,
      verificationStatus: verification.verification?.status || 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    return NextResponse.json({
      success: true,
      lotId: newLot.id,
      verification: verification.verification
    })
  } catch (error) {
    console.error('Create lot error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create lot' },
      { status: 500 }
    )
  }
}
