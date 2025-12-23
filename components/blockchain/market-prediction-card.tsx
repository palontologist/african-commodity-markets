'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, ArrowUpRight, ArrowDownRight, Trophy, Minus } from 'lucide-react'
import { type OnChainPrediction, getOdds, formatUSDC } from '@/lib/blockchain/polygon-client'
import { StakeModal } from '@/components/markets/stake-modal'
import { ClaimWinningsButton } from './claim-winnings-button'
import { useChain } from './chain-provider'

interface MarketPredictionCardProps {
  prediction: OnChainPrediction
  onStaked?: () => void
}

export function MarketPredictionCard({ prediction, onStaked }: MarketPredictionCardProps) {
  const { activeChain } = useChain()
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [odds, setOdds] = useState<{ yes: number; no: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOdds()
  }, [prediction.predictionId])

  async function loadOdds() {
    setLoading(true)
    try {
      const oddsData = await getOdds(prediction.predictionId)
      setOdds({
        yes: oddsData.yesOdds,
        no: oddsData.noOdds
      })
    } catch (error) {
      console.error('Failed to load odds:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = Number(prediction.currentPrice) / 100
  const predictedPrice = Number(prediction.predictedPrice) / 100
  const actualPrice = prediction.actualPrice ? Number(prediction.actualPrice) / 100 : null
  const priceChange = ((predictedPrice - currentPrice) / currentPrice) * 100
  const totalVolume = formatUSDC(prediction.yesStakes + prediction.noStakes)
  const targetDate = new Date(Number(prediction.targetDate) * 1000)
  const confidence = Number(prediction.confidence)
  const yesOdds = odds?.yes || (confidence > 50 ? confidence : 100 - confidence)
  const noOdds = odds?.no || 100 - yesOdds
  
  // Calculate days until resolution
  const now = new Date()
  const daysUntil = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysUntil <= 0
  const isResolved = prediction.resolved

  // Determine if price is above or below
  const isAbove = predictedPrice > currentPrice
  const question = `Will price be ${isAbove ? 'above' : 'below'} $${predictedPrice.toFixed(2)}?`
  
  // Format title: "Commodity - Timeframe"
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const targetMonth = monthNames[targetDate.getMonth()]
  const title = `${prediction.commodity} - ${targetMonth} Average Price`
  
  // Determine model tilt based on confidence and price direction
  let modelTilt: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral'
  if (confidence > 60) {
    modelTilt = isAbove ? 'Bullish' : 'Bearish'
  } else if (confidence < 40) {
    modelTilt = isAbove ? 'Bearish' : 'Bullish'
  }
  
  // Convert OnChainPrediction to Market format for StakeModal
  const marketData = {
    id: prediction.predictionId,
    commodity: prediction.commodity,
    question,
    thresholdPrice: Number(prediction.predictedPrice),
    expiryTime: Number(prediction.targetDate) * 1000,
    yesPool: Number(prediction.yesStakes) / 1e6, // Convert from USDC base units
    noPool: Number(prediction.noStakes) / 1e6,
    chain: activeChain, // Use active chain from context
    resolved: prediction.resolved,
  }

  return (
    <>
      <Card className="border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 bg-white">
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-base text-gray-700 font-medium">
            {question}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* YES/NO Percentages */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-3xl font-bold text-green-600 mb-1">
                YES {yesOdds.toFixed(0)}%
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-3xl font-bold text-red-600 mb-1">
                NO {noOdds.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Days Remaining and Model Tilt */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {isResolved ? 'Resolved' : isExpired ? 'Expired' : `${daysUntil} days left`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {modelTilt === 'Bullish' && <TrendingUp className="w-4 h-4 text-primary" />}
              {modelTilt === 'Bearish' && <TrendingDown className="w-4 h-4 text-red-600" />}
              {modelTilt === 'Neutral' && <Minus className="w-4 h-4 text-gray-500" />}
              <span className="text-sm text-gray-600">
                Model tilt: <span className="font-semibold">{modelTilt}</span>
              </span>
            </div>
          </div>

          {/* View & Trade Button */}
          {!isResolved && !isExpired && (
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => setShowStakingModal(true)}
            >
              View & Trade
            </Button>
          )}

          {/* Claim Winnings */}
          {isResolved && (
            <ClaimWinningsButton 
              prediction={prediction} 
              onClaimed={() => {
                loadOdds()
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Staking Modal */}
      <StakeModal
        market={marketData}
        open={showStakingModal}
        onOpenChange={setShowStakingModal}
        onSuccess={() => {
          setShowStakingModal(false)
          loadOdds()
          onStaked?.()
        }}
      />
    </>
  )
}
