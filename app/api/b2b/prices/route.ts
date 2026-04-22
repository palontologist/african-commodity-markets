/**
 * B2B Commodity Prices API
 * Professional API for agricultural finance companies and commodity traders
 * 
 * Access: Enterprise API keys only
 * Rate limits: Based on tier
 * 
 * GET /api/b2b/prices?symbols=COFFEE,COCOA&region=AFRICA
 */

import { NextRequest, NextResponse } from 'next/server'
import { getLivePrice, type CommoditySymbol, type Region } from '@/lib/live-prices'
import { getRiskMetrics, type RiskMetrics } from '@/lib/risk-analytics'
import { db } from '@/lib/db'
import { enterpriseApiKeys, apiAccessLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const VALID_SYMBOLS: CommoditySymbol[] = ['COFFEE', 'COCOA', 'COTTON', 'CASHEW', 'RUBBER', 'GOLD', 'TEA', 'AVOCADO', 'MACADAMIA', 'WHEAT', 'MAIZE', 'SUNFLOWER', 'COPPER']

async function validateApiKey(apiKey: string): Promise<{ valid: boolean; keyData?: any; error?: string }> {
  if (!db) {
    return { valid: false, error: 'Database not configured' }
  }

  if (!apiKey || !apiKey.startsWith('afr_')) {
    return { valid: false, error: 'Invalid API key format' }
  }

  const keyRecord = await db.select()
    .from(enterpriseApiKeys)
    .where(eq(enterpriseApiKeys.apiKey, apiKey))
    .limit(1)

  if (!keyRecord.length) {
    return { valid: false, error: 'API key not found' }
  }

  const key = keyRecord[0]

  if (!key.isActive) {
    return { valid: false, error: 'API key is revoked' }
  }

  if (key.expiresAt && key.expiresAt < new Date()) {
    return { valid: false, error: 'API key has expired' }
  }

  const usage = key.currentUsage ?? 0
  const quota = key.monthlyQuota ?? 10000

  if (usage >= quota) {
    return { valid: false, error: 'Monthly quota exceeded' }
  }

  await db.update(enterpriseApiKeys)
    .set({
      currentUsage: usage + 1,
      lastUsedAt: new Date(),
    })
    .where(eq(enterpriseApiKeys.apiKey, apiKey))

  return { valid: true, keyData: key }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey')
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key required. Include it in X-API-Key header or apiKey query param.',
        docs: 'https://yourdomain.com/api-docs/b2b'
      }, { status: 401 })
    }

    const validation = await validateApiKey(apiKey)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
      }, { status: 401 })
    }

    const key = validation.keyData
    const symbolsParam = request.nextUrl.searchParams.get('symbols')
    const region = (request.nextUrl.searchParams.get('region') || 'AFRICA') as Region
    const includeRisk = request.nextUrl.searchParams.get('includeRisk') !== 'false'
    const format = request.nextUrl.searchParams.get('format') || 'json'

    const rawSymbols = symbolsParam 
      ? symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(s => VALID_SYMBOLS.includes(s as CommoditySymbol))
      : ['COFFEE']
    
    const symbols = rawSymbols as CommoditySymbol[]

    if (!symbols.length) {
      return NextResponse.json({
        success: false,
        error: 'Invalid symbols. Valid: COFFEE,COCOA,COTTON,CASHEW,RUBBER,GOLD,TEA,AVOCADO,MACADAMIA,WHEAT,MAIZE,SUNFLOWER,COPPER'
      }, { status: 400 })
    }

    if (db) {
      await db.insert(apiAccessLogs).values({
        userId: key.userId,
        apiKey,
        endpoint: '/api/b2b/prices',
        method: 'GET',
        responseStatus: 200,
        paymentStatus: 'FREE',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      })
    }

    const results = await Promise.all(
      symbols.map(async (symbol): Promise<any> => {
        try {
          const priceData = await getLivePrice(symbol, region)
          
          let riskMetrics: RiskMetrics | null = null
          if (includeRisk && priceData.price) {
            riskMetrics = await getRiskMetrics(
              symbol,
              priceData.price,
              [priceData.source],
              priceData.timestamp,
              Math.floor((Date.now() - priceData.timestamp.getTime()) / 60000)
            )
          }

          const result: any = {
            symbol,
            success: true,
            price: {
              current: priceData.price,
              currency: priceData.currency,
              unit: 'USD/lb',
              timestamp: priceData.timestamp.toISOString(),
              source: priceData.source,
            },
          }

          if (riskMetrics) {
            result.risk = {
              volatility: riskMetrics.volatility,
              volatilityLabel: riskMetrics.volatilityLabel,
              confidenceScore: riskMetrics.confidenceScore,
              confidenceLabel: riskMetrics.confidenceLabel,
              trend: riskMetrics.trend,
              trendStrength: riskMetrics.trendStrength,
              shortTermChange: riskMetrics.shortTermChange,
              mediumTermChange: riskMetrics.mediumTermChange,
              riskSignal: riskMetrics.riskSignal,
              narrative: riskMetrics.riskNarrative,
            }
          }

          return result
        } catch (error: any) {
          return {
            symbol,
            success: false,
            error: error.message || 'Failed to fetch price data'
          }
        }
      })
    )

    const usage = (key.currentUsage ?? 0) + 1
    const quota = key.monthlyQuota ?? 10000

    const response: any = {
      success: true,
      tier: key.tier,
      data: {
        region,
        count: results.length,
        prices: results,
      },
      meta: {
        timestamp: new Date().toISOString(),
        sources: ['KAMIS (Kenya)', 'Alpha Vantage', 'World Bank'],
        attribution: 'Data provided by Afrifutures. For B2B use only.',
        docs: 'https://yourdomain.com/api-docs/b2b',
      },
      quota: {
        used: usage,
        limit: quota,
        remaining: quota - usage,
      }
    }

    if (format === 'csv') {
      const csvRows = results
        .filter((r: any) => r.success && r.price?.current)
        .map((r: any) => `${r.symbol},${r.price.current},${r.price.currency},${r.price.timestamp},${r.risk?.riskSignal || 'N/A'}`)
      
      const csv = 'symbol,price,currency,timestamp,risk_signal\n' + csvRows.join('\n')
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'X-API-Tier': key.tier,
          'Cache-Control': 'no-cache',
        }
      })
    }

    return NextResponse.json(response, {
      headers: {
        'X-API-Tier': key.tier,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })

  } catch (error: any) {
    console.error('B2B prices API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}