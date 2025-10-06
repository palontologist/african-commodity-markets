import { NextRequest, NextResponse } from 'next/server'
import { generatePrediction } from '@/lib/agents'
import type { CommoditySymbol } from '@/lib/live-prices'
import { z } from 'zod'

/**
 * Request validation schema
 */
const PredictionRequestSchema = z.object({
  symbol: z.enum(['COFFEE', 'COCOA', 'COTTON', 'CASHEW', 'RUBBER', 'GOLD'], {
    errorMap: () => ({ message: 'Invalid commodity symbol' })
  }),
  region: z.enum(['AFRICA', 'LATAM'], {
    errorMap: () => ({ message: 'Invalid region. Must be AFRICA or LATAM' })
  }),
  horizon: z.enum(['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'], {
    errorMap: () => ({ message: 'Invalid horizon. Must be SHORT_TERM, MEDIUM_TERM, or LONG_TERM' })
  }),
  includeHistorical: z.boolean().optional().default(true)
})

/**
 * POST /api/agents/commodity/predict
 * 
 * Generate an AI-powered commodity price prediction
 * 
 * @example
 * ```json
 * {
 *   "symbol": "COFFEE",
 *   "region": "AFRICA",
 *   "horizon": "SHORT_TERM"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const params = PredictionRequestSchema.parse(body)
    
    // Check for GROQ_API_KEY
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Prediction service unavailable',
          message: 'GROQ_API_KEY not configured'
        },
        { status: 503 }
      )
    }
    
            // Generate prediction
    console.log(`Generating prediction for ${params.symbol} in ${params.region}...`)
    
    const prediction = await generatePrediction({
      symbol: params.symbol as CommoditySymbol,
      region: params.region,
      horizon: params.horizon
    })
    
    // Return successful response
    return NextResponse.json({
      success: true,
      data: prediction,
      metadata: {
        timestamp: new Date().toISOString(),
        symbol: params.symbol,
        region: params.region,
        horizon: params.horizon
      }
    })
    
  } catch (error) {
    console.error('Prediction API error:', error)
    
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
        error: 'Prediction failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents/commodity/predict
 * 
 * Get API documentation and available options
 */
export async function GET() {
  return NextResponse.json({
    name: 'Commodity Price Prediction API',
    version: '1.0.0',
    description: 'Generate AI-powered commodity price predictions using Groq LLM',
    endpoints: {
      POST: {
        description: 'Generate a new prediction',
        parameters: {
          symbol: {
            type: 'enum',
            required: true,
            options: ['COCOA', 'COFFEE', 'TEA', 'GOLD', 'AVOCADO', 'MACADAMIA'],
            description: 'The commodity to predict'
          },
          region: {
            type: 'enum',
            required: true,
            options: ['AFRICA', 'LATAM'],
            description: 'The region for the prediction'
          },
          horizon: {
            type: 'enum',
            required: true,
            options: ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'],
            description: 'The prediction time horizon (7-30 days, 1-3 months, 6-12 months)'
          },
          includeHistorical: {
            type: 'boolean',
            required: false,
            default: true,
            description: 'Include historical price data in the analysis'
          }
        },
        response: {
          success: 'boolean',
          data: {
            predictedPrice: 'number',
            confidence: 'number (0-1)',
            narrative: 'string',
            signals: 'array (optional)',
            currentPrice: 'number | null',
            predictionId: 'number'
          }
        }
      }
    },
    examples: [
      {
        description: 'Short-term coffee prediction for Africa',
        request: {
          method: 'POST',
          body: {
            symbol: 'COFFEE',
            region: 'AFRICA',
            horizon: 'SHORT_TERM'
          }
        }
      },
      {
        description: 'Long-term cocoa prediction for Latin America',
        request: {
          method: 'POST',
          body: {
            symbol: 'COCOA',
            region: 'LATAM',
            horizon: 'LONG_TERM',
            includeHistorical: true
          }
        }
      }
    ]
  })
}
