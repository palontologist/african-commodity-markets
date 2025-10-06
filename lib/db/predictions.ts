import { and, desc, eq } from 'drizzle-orm'
import { db as drizzleDb } from './index'
import {
  commodityPredictions,
  predictionSignals,
  type CommodityPrediction,
  type NewCommodityPrediction,
  type NewPredictionSignal,
} from './schema'

function db() {
  if (!drizzleDb) {
    throw new Error('Database client is not initialised')
  }
  return drizzleDb
}

export async function insertCommodityPrediction(data: NewCommodityPrediction): Promise<CommodityPrediction> {
  const [record] = await db().insert(commodityPredictions).values(data).returning()
  return record
}

export async function upsertCommodityPrediction(data: NewCommodityPrediction): Promise<CommodityPrediction> {
  const existing = await db()
    .select()
    .from(commodityPredictions)
    .where(
      and(
        eq(commodityPredictions.commodityId, data.commodityId),
        eq(commodityPredictions.region, data.region),
        eq(commodityPredictions.horizon, data.horizon),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    const record = existing[0]
    const [updated] = await db()
      .update(commodityPredictions)
      .set({
        predictedPrice: data.predictedPrice,
        currency: data.currency,
        confidence: data.confidence,
        narrative: data.narrative,
        model: data.model,
        asOf: data.asOf,
        updatedAt: data.updatedAt ?? data.asOf,
      })
      .where(eq(commodityPredictions.id, record.id))
      .returning()
    return updated
  }

  return insertCommodityPrediction(data)
}

export async function listRecentPredictions(options: {
  commodityId?: number
  region?: string
  limit?: number
} = {}): Promise<CommodityPrediction[]> {
  let query = db().select().from(commodityPredictions).orderBy(desc(commodityPredictions.asOf))

  if (options.commodityId) {
    query = query.where(eq(commodityPredictions.commodityId, options.commodityId))
  }

  if (options.region) {
    const whereClause = eq(commodityPredictions.region, options.region)
    query = query.where(whereClause)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  return query
}

export async function attachPredictionSignal(data: NewPredictionSignal) {
  const [signal] = await db().insert(predictionSignals).values(data).returning()
  return signal
}

export async function listSignalsForPrediction(predictionId: number) {
  return db().select().from(predictionSignals).where(eq(predictionSignals.predictionId, predictionId))
}
