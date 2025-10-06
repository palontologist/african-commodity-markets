import { NextRequest, NextResponse } from 'next/server'
import { fetchCurrentPrice } from '@/lib/agents'
import { z } from 'zod'

/**
 * Request validation schema
 */
const PriceRequestSchema = z.object({
  symbol: z.enum(['COCOA', 'COFFEE', 'TEA', 'GOLD', 'AVOCADO', 'MACADAMIA'], {
    errorMap: () => ({ message: 'Invalid commodity symbol' })
  }),
  region: z.enum(['AFRICA', 'LATAM'], {
    errorMap: () => ({ message: 'Invalid region. Must be AFRICA or LATAM' })
  })
})

/**
 * POST /api/agents/commodity/price
 * 
 * Fetch current live price for a commodity
 * 
 * @example
 * ```json
 * {
 *   "symbol": "COFFEE",
 *   "region": "AFRICA"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const params = PriceRequestSchema.parse(body)
    
    // Fetch current price
    const priceData = await fetchCurrentPrice(params.symbol, params.region)
    
    // Return successful response
    return NextResponse.json({
      success: true,
      data: priceData,
      metadata: {
        timestamp: new Date().toISOString(),
        symbol: params.symbol,
        region: params.region
      }
    })
    
  } catch (error) {
    console.error('Price fetch error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid request parameters',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        error: 'Price fetch failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents/commodity/price
 * 
 * Get API documentation
 */
export async function GET() {
  return NextResponse.json({
    name: 'Commodity Price Fetch API',
    version: '1.0.0',
    description: 'Fetch current live prices for commodities',
    endpoints: {
      POST: {
        description: 'Fetch current price',
        parameters: {
          symbol: {
            type: 'enum',
            required: true,
            options: ['COCOA', 'COFFEE', 'TEA', 'GOLD', 'AVOCADO', 'MACADAMIA']
          },
          region: {
            type: 'enum',
            required: true,
            options: ['AFRICA', 'LATAM']
          }
        }
      }
    }
  })
}
