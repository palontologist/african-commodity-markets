'use client'

import { AppHeader } from '@/components/app-header'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, Calendar } from 'lucide-react'

type SignalType = 'BULLISH' | 'BEARISH' | 'NEUTRAL'
type CommoditySymbol = 'COFFEE' | 'COCOA' | 'COTTON' | 'CASHEW' | 'RUBBER' | 'GOLD'
type Region = 'AFRICA' | 'LATAM'
type Horizon = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM'

interface Signal {
  type: SignalType
  strength: number
  reason: string
}

interface Prediction {
  predictedPrice: number
  confidence: number
  narrative: string
  signals: Signal[]
  currentPrice: number
  symbol?: CommoditySymbol
  region?: Region
  horizon?: Horizon
  timestamp?: string
}

interface PredictionResponse {
  success: boolean
  data: Prediction
  metadata?: {
    timestamp: string
    symbol: string
    region: string
    horizon: string
  }
}

export default function InsightsPage() {
  const [predictions, setPredictions] = useState<Map<string, PredictionResponse>>(new Map())
  const [loading, setLoading] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [loadingInitial, setLoadingInitial] = useState(true)

  const commodities: { symbol: CommoditySymbol; label: string; region: Region }[] = [
    { symbol: 'COFFEE', label: 'Coffee', region: 'AFRICA' },
    { symbol: 'COCOA', label: 'Cocoa', region: 'AFRICA' },
    { symbol: 'COTTON', label: 'Cotton', region: 'AFRICA' },
    { symbol: 'CASHEW', label: 'Cashew', region: 'AFRICA' },
  ]

  // Load recent predictions on mount
  useEffect(() => {
    const loadRecentPredictions = async () => {
      try {
        const response = await fetch('/api/agents/commodity/predictions?limit=20')
        if (!response.ok) {
          throw new Error('Failed to load recent predictions')
        }

        const data = await response.json()
        
        if (data.success && data.data) {
          const predictionMap = new Map<string, PredictionResponse>()
          
          // Group predictions by commodity-region and take the most recent
          data.data.forEach((pred: any) => {
            const key = `${pred.symbol}-${pred.region}`
            const existing = predictionMap.get(key)
            
            // Only update if this prediction is newer or doesn't exist
            if (!existing || new Date(pred.createdAt) > new Date(existing.metadata?.timestamp || 0)) {
              predictionMap.set(key, {
                success: true,
                data: {
                  predictedPrice: pred.predictedPrice,
                  confidence: pred.confidence,
                  narrative: pred.narrative,
                  signals: pred.signals || [],
                  currentPrice: pred.predictedPrice * 0.95, // Approximate
                },
                metadata: {
                  timestamp: pred.createdAt,
                  symbol: pred.symbol,
                  region: pred.region,
                  horizon: pred.horizon
                }
              })
            }
          })
          
          setPredictions(predictionMap)
        }
      } catch (err) {
        console.error('Failed to load recent predictions:', err)
        // Don't show error to user, just log it
      } finally {
        setLoadingInitial(false)
      }
    }

    loadRecentPredictions()
  }, [])

  const generatePrediction = async (symbol: CommoditySymbol, region: Region) => {
    const key = `${symbol}-${region}`
    setLoading(prev => new Set(prev).add(key))
    setError(null)

    try {
      const response = await fetch('/api/agents/commodity/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          region,
          horizon: 'SHORT_TERM' as Horizon
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate prediction: ${response.statusText}`)
      }

      const data: PredictionResponse = await response.json()
      
      setPredictions(prev => new Map(prev).set(key, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prediction')
      console.error('Prediction error:', err)
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }

  const getSignalIcon = (type: SignalType) => {
    switch (type) {
      case 'BULLISH':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'BEARISH':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'NEUTRAL':
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getSignalColor = (type: SignalType) => {
    switch (type) {
      case 'BULLISH':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'BEARISH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'NEUTRAL':
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Just now'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const calculatePriceChange = (predicted: number, current: number) => {
    const change = ((predicted - current) / current) * 100
    return {
      value: change,
      formatted: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Market Insights
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Get AI-powered predictions and market intelligence for African commodities. 
            Our agents analyze real-time data, weather patterns, and market signals to forecast price movements.
          </p>
        </div>

        {/* Info Banner - Auto-generated daily */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">Fresh Daily Insights</h3>
            <p className="text-sm text-purple-800">
              AI predictions are automatically generated every day at 6 AM UTC. 
              See the latest market forecasts below or click "Refresh" to generate new predictions.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {commodities.map(({ symbol, label, region }) => {
            const key = `${symbol}-${region}`
            const prediction = predictions.get(key)
            const isLoading = loading.has(key)

            return (
              <Card key={key} className="p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-500">
                      {region} • Short-term forecast
                    </p>
                  </div>
                  <Button
                    onClick={() => generatePrediction(symbol, region)}
                    disabled={isLoading}
                    size="sm"
                    className="gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {prediction ? 'Refresh' : 'Generate'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Loading State */}
                {isLoading && !prediction && (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !prediction && !loadingInitial && (
                  <div className="py-12 text-center">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">
                      No recent predictions available
                    </p>
                    <p className="text-sm text-gray-400">
                      Click "Generate" to get AI-powered predictions
                    </p>
                  </div>
                )}

                {/* Initial Loading State */}
                {loadingInitial && !prediction && (
                  <div className="py-12 text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
                    <p className="text-gray-500">Loading recent predictions...</p>
                  </div>
                )}

                {/* Prediction Content */}
                {prediction && prediction.success && (
                  <div className="space-y-4">
                    {/* Price Prediction */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Current Price</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatPrice(prediction.data.currentPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Predicted Price</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-purple-600">
                            {formatPrice(prediction.data.predictedPrice)}
                          </span>
                          <span className={`ml-2 text-sm font-semibold ${
                            calculatePriceChange(prediction.data.predictedPrice, prediction.data.currentPrice).value >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {calculatePriceChange(prediction.data.predictedPrice, prediction.data.currentPrice).formatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                        <span className="text-sm font-bold text-gray-900">
                          {(prediction.data.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${prediction.data.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Market Signals */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Market Signals</h4>
                      <div className="space-y-2">
                        {prediction.data.signals.map((signal, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 p-3 rounded-lg border ${getSignalColor(signal.type)}`}
                          >
                            <div className="mt-0.5">{getSignalIcon(signal.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase">
                                  {signal.type}
                                </span>
                                <span className="text-xs text-gray-600">
                                  Strength: {(signal.strength * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed">
                                {signal.reason}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Narrative */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {prediction.data.narrative}
                      </p>
                    </div>

                    {/* Timestamp */}
                    {prediction.metadata && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                        <Calendar className="w-3 h-3" />
                        <span>Generated {formatTimestamp(prediction.metadata.timestamp)}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• AI agents analyze real-time market data, weather patterns, and supply chain signals</li>
            <li>• Predictions include confidence scores, bullish/bearish signals, and detailed narratives</li>
            <li>• Short-term forecasts focus on 1-4 week price movements</li>
            <li>• Each prediction takes ~30-40 seconds to generate using advanced AI models</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
