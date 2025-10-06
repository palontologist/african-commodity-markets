import { NextRequest, NextResponse } from 'next/server'
import { listRecentPredictions } from '@/lib/db/predictions'
import { z } from 'zod'

/**
 * Query parameters validation schema
 */
const paramsSchema = z.object({
  commodityId: z.string().optional(),
  region: z.enum(['AFRICA', 'LATAM']).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val, 10), 100)).default('10')
})

/**
 * GET /api/agents/commodity/predictions
 * 
 * Fetch recent commodity predictions from the database
 * 
 * @example
 * GET /api/agents/commodity/predictions?region=AFRICA&limit=5
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = paramsSchema.parse({
      commodityId: searchParams.get('commodityId'),
      region: searchParams.get('region'),
      limit: searchParams.get('limit') || '10'
    })
    
    // Fetch predictions from database
    const predictions = await listRecentPredictions({
      commodityId: params.commodityId ? parseInt(params.commodityId, 10) : undefined,
      region: params.region,
      limit: Math.min(params.limit, 100) // Cap at 100
    })
    
    // Return successful response
    return NextResponse.json({
      success: true,
      data: predictions,
      metadata: {
        count: predictions.length,
        timestamp: new Date().toISOString(),
        filters: {
          commodityId: params.commodityId,
          region: params.region,
          limit: params.limit
        }
      }
    })
    
  } catch (error) {
    console.error('Predictions fetch error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid query parameters',
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
        error: 'Failed to fetch predictions',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}
