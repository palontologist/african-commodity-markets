import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const calculateSchema = z.object({
  commodity: z.string(),
  quantity: z.number().positive(),
  grade: z.string(),
  dvcScore: z.number().default(0),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = calculateSchema.parse(body)

    // Step 1: Get oracle price for commodity
    const oraclePrice = await getOraclePrice(data.commodity, data.grade)
    
    // Step 2: Calculate total value
    const totalValue = data.quantity * oraclePrice

    // Step 3: Calculate LTV based on DVC score
    let ltv = 60 // Base 60% LTV
    if (data.dvcScore >= 200) {
      ltv = 70 // Premium farmers get 70%
    } else if (data.dvcScore >= 100) {
      ltv = 65 // Good farmers get 65%
    }

    // Step 4: Calculate advance and fees
    const advanceAmount = totalValue * (ltv / 100)
    const fee = advanceAmount * 0.025 // 2.5% platform fee
    const netAmount = advanceAmount - fee

    return NextResponse.json({
      success: true,
      offer: {
        totalValue: Math.round(totalValue * 100) / 100,
        advanceAmount: Math.round(advanceAmount * 100) / 100,
        fee: Math.round(fee * 100) / 100,
        netAmount: Math.round(netAmount * 100) / 100,
        ltv,
        oraclePrice: Math.round(oraclePrice * 100) / 100
      }
    })
  } catch (error) {
    console.error('Calculate advance error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid calculation data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to calculate advance' },
      { status: 500 }
    )
  }
}

async function getOraclePrice(commodity: string, grade: string): Promise<number> {
  // TODO: Integrate with actual price oracle API
  // For now, return mock prices based on commodity and grade
  
  const basePrices: Record<string, number> = {
    'COFFEE': 2.50,
    'COCOA': 3200.00,
    'MAIZE': 0.25,
    'WHEAT': 0.30,
    'TEA': 4.50,
    'COTTON': 1.80
  }

  const gradeMultipliers: Record<string, number> = {
    'A': 1.2,  // Premium 20% above
    'B': 1.0,  // Standard
    'C': 0.8   // Economy 20% below
  }

  const basePrice = basePrices[commodity] || 1.00
  const multiplier = gradeMultipliers[grade] || 1.0

  return basePrice * multiplier
}
