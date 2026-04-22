/**
 * B2B East African Coffee Prices API
 * Specialized endpoint for regional coffee data
 * 
 * GET /api/b2b/africa?country=ET&commodity=COFFEE
 */

import { NextRequest, NextResponse } from 'next/server'
import { getEastAfricanCoffeePrices, getCoffeeByCountry } from '@/lib/scrapers/african-commodity-scrapers'
import { db } from '@/lib/db'
import { enterpriseApiKeys, apiAccessLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const VALID_COUNTRIES = ['ET', 'UG', 'TZ', 'ALL']
const VALID_COMMODITIES = ['COFFEE', 'COCOA', 'TEA', 'COTTON']

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
        error: 'API key required',
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
    
    const country = request.nextUrl.searchParams.get('country')?.toUpperCase() || 'ALL'
    const commodity = request.nextUrl.searchParams.get('commodity')?.toUpperCase() || 'COFFEE'

    if (!VALID_COUNTRIES.includes(country)) {
      return NextResponse.json({
        success: false,
        error: `Invalid country. Valid: ${VALID_COUNTRIES.join(', ')}`,
      }, { status: 400 })
    }

    if (!VALID_COMMODITIES.includes(commodity)) {
      return NextResponse.json({
        success: false,
        error: `Invalid commodity. Valid: ${VALID_COMMODITIES.join(', ')}`,
      }, { status: 400 })
    }

    // Log access
    if (db) {
      await db.insert(apiAccessLogs).values({
        userId: key.userId,
        apiKey,
        endpoint: '/api/b2b/africa',
        method: 'GET',
        responseStatus: 200,
        paymentStatus: 'FREE',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      })
    }

    let data: any = {}

    if (country === 'ALL') {
      const prices = await getEastAfricanCoffeePrices()
      data = {
        summary: {
          totalMarkets: prices.ethiopia.length + prices.uganda.length + prices.tanzania.length,
          countries: ['Ethiopia', 'Uganda', 'Tanzania'],
        },
        ethiopia: {
          country: 'Ethiopia',
          countryCode: 'ET',
          region: 'East Africa',
          source: 'ECX',
          prices: prices.ethiopia,
        },
        uganda: {
          country: 'Uganda',
          countryCode: 'UG',
          region: 'East Africa',
          source: 'UCDA',
          prices: prices.uganda,
        },
        tanzania: {
          country: 'Tanzania',
          countryCode: 'TZ',
          region: 'East Africa',
          source: 'TCB',
          prices: prices.tanzania,
        },
      }
    } else {
      const prices = await getCoffeeByCountry(country as 'ET' | 'UG' | 'TZ')
      const countryNames: Record<string, string> = {
        ET: 'Ethiopia',
        UG: 'Uganda',
        TZ: 'Tanzania',
      }
      const sources: Record<string, string> = {
        ET: 'ECX',
        UG: 'UCDA',
        TZ: 'TCB',
      }
      
      data = {
        country: countryNames[country],
        countryCode: country,
        region: 'East Africa',
        source: sources[country],
        prices,
      }
    }

    const usage = (key.currentUsage ?? 0) + 1
    const quota = key.monthlyQuota ?? 10000

    return NextResponse.json({
      success: true,
      tier: key.tier,
      commodity,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        sources: [
          { name: 'ECX', country: 'Ethiopia', url: 'https://www.ecx.com.et' },
          { name: 'UCDA', country: 'Uganda', url: 'https://ugandacoffee.go.ug' },
          { name: 'TCB', country: 'Tanzania', url: 'https://www.coffee.go.tz' },
        ],
        attribution: 'Data provided by Afrifutures East African Commodity Exchange Network',
      },
      quota: {
        used: usage,
        limit: quota,
        remaining: quota - usage,
      },
    }, {
      headers: {
        'X-API-Tier': key.tier,
        'Cache-Control': 'public, max-age=900', // 15 min cache
      }
    })

  } catch (error: any) {
    console.error('B2B Africa API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 })
  }
}