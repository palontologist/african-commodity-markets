'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, ArrowUpRight, ArrowDownRight, Trophy } from 'lucide-react'
import { type OnChainPrediction, getOdds, formatUSDC } from '@/lib/blockchain/polygon-client'
import { PredictionStakingModal } from './prediction-staking-modal'
import { ClaimWinningsButton } from './claim-winnings-button'

interface MarketPredictionCardProps {
  prediction: OnChainPrediction
  onStaked?: () => void
}

export function MarketPredictionCard({ prediction, onStaked }: MarketPredictionCardProps) {
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

  // Format question
  const question = `Will ${prediction.commodity} reach $${predictedPrice.toFixed(2)} by ${targetDate.toLocaleDateString()}?`

  return (
    <>
      <Card className="border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {prediction.commodity}
                </Badge>
                {isResolved && (
                  <Badge className="bg-green-600 text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    Resolved
                  </Badge>
                )}
                {!isResolved && isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {question}
              </h3>
            </div>
            
            <div className="text-right">
              <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-lg font-bold">
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                from ${currentPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Odds Display - Kalshi Style */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                 onClick={() => !isResolved && setShowStakingModal(true)}>
              <p className="text-4xl font-bold text-green-600">
                {yesOdds.toFixed(0)}¢
              </p>
              <p className="text-sm text-gray-600 mt-1 font-medium">YES</p>
              {isResolved && actualPrice !== null && (
                <p className="text-xs text-gray-500 mt-1">
                  Actual: ${actualPrice.toFixed(2)}
                </p>
              )}
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                 onClick={() => !isResolved && setShowStakingModal(true)}>
              <p className="text-4xl font-bold text-red-600">
                {noOdds.toFixed(0)}¢
              </p>
              <p className="text-sm text-gray-600 mt-1 font-medium">NO</p>
              {isResolved && actualPrice !== null && (
                <p className="text-xs text-gray-500 mt-1">
                  Target: ${predictedPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>YES {yesOdds.toFixed(0)}%</span>
              <span>NO {noOdds.toFixed(0)}%</span>
            </div>
            <Progress value={yesOdds} className="h-2" />
          </div>

          {/* Action Buttons */}
          {!isResolved && (
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() => setShowStakingModal(true)}
                disabled={isExpired}
              >
                Buy YES
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={() => setShowStakingModal(true)}
                disabled={isExpired}
              >
                Buy NO
              </Button>
            </div>
          )}

          {/* Claim Winnings */}
          {isResolved && (
            <ClaimWinningsButton 
              prediction={prediction} 
              onClaimed={() => {
                // Reload odds or update UI
                loadOdds()
              }}
            />
          )}

          {/* Market Stats - Kalshi Style */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-900 font-semibold mb-1">
                <DollarSign className="w-4 h-4" />
                <p className="text-sm">{totalVolume}</p>
              </div>
              <p className="text-xs text-muted-foreground">Volume</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-900 font-semibold mb-1">
                <Users className="w-4 h-4" />
                <p className="text-sm">—</p>
              </div>
              <p className="text-xs text-muted-foreground">Traders</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-900 font-semibold mb-1">
                <Calendar className="w-4 h-4" />
                <p className="text-sm">
                  {isResolved ? 'Closed' : isExpired ? 'Expired' : `${daysUntil}d`}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {isResolved ? 'Resolved' : 'Closes'}
              </p>
            </div>
          </div>

          {/* AI Model Badge */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Badge variant="secondary" className="text-xs">
              AI Model: {prediction.model}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Confidence: {confidence}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Staking Modal */}
      <PredictionStakingModal
        open={showStakingModal}
        onOpenChange={setShowStakingModal}
        prediction={prediction}
      />
    </>
  )
}
