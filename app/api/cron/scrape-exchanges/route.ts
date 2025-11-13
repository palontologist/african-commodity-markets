import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scrapedExchangeData, commodities } from '@/lib/db/schema';
import { scrapeAllExchanges, getMockScrapedData } from '@/lib/scrapers/exchange-scraper';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/scrape-exchanges
 * Cron job to scrape data from African commodity exchanges
 * 
 * This endpoint should be called periodically (e.g., every hour or daily)
 * Can be triggered by Vercel Cron Jobs or external schedulers
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting exchange data scraping...');

    // For now, use mock data until real scrapers are implemented
    // In production, use: const scrapedData = await scrapeAllExchanges();
    const scrapedData = getMockScrapedData();

    if (scrapedData.length === 0) {
      console.log('No data scraped');
      return NextResponse.json({
        success: true,
        message: 'No data to scrape',
        count: 0,
      });
    }

    // Get all commodities for mapping
    const allCommodities = await db.select().from(commodities);
    const commodityMap = new Map(
      allCommodities.map(c => [c.name.toLowerCase(), c.id])
    );

    // Save scraped data to database
    const insertPromises = scrapedData.map(async (data) => {
      // Try to match commodity by name
      let commodityId = null;
      const commodityNameLower = data.commodityName.toLowerCase();
      
      // Simple matching logic - can be improved
      for (const [name, id] of commodityMap.entries()) {
        if (commodityNameLower.includes(name) || name.includes(commodityNameLower)) {
          commodityId = id;
          break;
        }
      }

      return db.insert(scrapedExchangeData).values({
        exchangeName: data.exchangeName,
        exchangeUrl: data.exchangeUrl,
        commodityId,
        commodityName: data.commodityName,
        price: data.price || null,
        currency: data.currency || null,
        volume: data.volume || null,
        unit: data.unit || null,
        quality: data.quality || null,
        scrapedAt: data.scrapedAt,
        rawData: JSON.stringify(data.rawData),
        status: 'ACTIVE',
      });
    });

    await Promise.all(insertPromises);

    console.log(`Successfully saved ${scrapedData.length} records`);

    return NextResponse.json({
      success: true,
      message: 'Exchange data scraped successfully',
      count: scrapedData.length,
      data: scrapedData,
    });
  } catch (error) {
    console.error('Error scraping exchanges:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to scrape exchange data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/scrape-exchanges
 * Alternative method to trigger scraping via POST
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
