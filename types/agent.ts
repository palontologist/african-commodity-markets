import { z } from 'zod'
import type { CommoditySymbol, Region } from '@/lib/live-prices'

export const predictionHorizonSchema = z.enum(['1d', '3d', '7d', '14d'])

export const commodityPredictionRequestSchema = z.object({
  symbol: z.custom<CommoditySymbol>(),
  region: z.custom<Region>().default('AFRICA'),
  horizon: predictionHorizonSchema.default('3d'),
  includeNarrative: z.boolean().default(true),
})

export type CommodityPredictionRequest = z.infer<typeof commodityPredictionRequestSchema>

export const commodityPredictionSchema = z.object({
  symbol: z.string(),
  region: z.string(),
  horizon: predictionHorizonSchema,
  predictedPrice: z.number().nullable(),
  currency: z.string(),
  confidence: z.number().min(0).max(1).nullable(),
  narrative: z.string().nullable(),
  asOf: z.string(),
  model: z.string(),
})

export type CommodityPrediction = z.infer<typeof commodityPredictionSchema>

export const commodityPredictionResponseSchema = z.object({
  prediction: commodityPredictionSchema,
  usage: z
    .object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    })
    .optional(),
})

export type CommodityPredictionResponse = z.infer<typeof commodityPredictionResponseSchema>
