'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, CheckCircle, TrendingUp } from 'lucide-react'
import { claimWinnings, getUserPosition, formatUSDC, type OnChainPrediction } from '@/lib/blockchain/polygon-client'
import { BrowserProvider } from 'ethers'

interface ClaimWinningsButtonProps {
  prediction: OnChainPrediction
  onClaimed?: () => void
}

export function ClaimWinningsButton({ prediction, onClaimed }: ClaimWinningsButtonProps) {
  const { address, isConnected } = useAccount()
  const [isClaiming, setIsClaiming] = useState(false)
  const [position, setPosition] = useState<any>(null)
  const [winnings, setWinnings] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [claimed, setClaimed] = useState(false)

  // Load user position
  useState(() => {
    if (address && prediction.resolved) {
      loadPosition()
    }
  })

  async function loadPosition() {
    if (!address) return
    
    try {
      const pos = await getUserPosition(prediction.predictionId, address)
      setPosition(pos)
      
      // Check if user has winnings
      if (!pos.claimed && (pos.yesAmount > BigInt(0) || pos.noAmount > BigInt(0))) {
        // Calculate if user won
        const predictedPrice = Number(prediction.predictedPrice)
        const actualPrice = Number(prediction.actualPrice)
        const tolerance = predictedPrice * 0.05
        const accurate = Math.abs(actualPrice - predictedPrice) <= tolerance
        
        const userSide = pos.yesAmount > pos.noAmount ? 'yes' : 'no'
        const won = (accurate && userSide === 'yes') || (!accurate && userSide === 'no')
        
        if (won) {
          // Calculate winnings (simplified - actual contract does this better)
          const totalStake = pos.yesAmount + pos.noAmount
          const totalPool = prediction.yesStakes + prediction.noStakes
          const userShare = Number(totalStake) / Number(totalPool)
          const payout = Number(totalPool) * userShare * 0.98 // 2% fee
          
          setWinnings(formatUSDC(BigInt(Math.round(payout))))
        }
      } else if (pos.claimed) {
        setClaimed(true)
      }
    } catch (error) {
      console.error('Failed to load position:', error)
    }
  }

  async function handleClaim() {
    if (!address || !isConnected) return

    setIsClaiming(true)
    setError(null)

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Web3 provider not available')
      }

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const txHash = await claimWinnings(prediction.predictionId, signer)

      console.log('✅ Claim transaction successful:', txHash)
      
      setClaimed(true)
      if (onClaimed) onClaimed()
      
      // Reload position
      await loadPosition()
    } catch (err: any) {
      console.error('Failed to claim:', err)
      setError(err.message || 'Failed to claim winnings. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  // Don't show if prediction not resolved
  if (!prediction.resolved) return null

  // Don't show if user has no position or already claimed
  if (!position || position.claimed || claimed) {
    if (claimed) {
      return (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Winnings Claimed!</span>
            </div>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  // Don't show if user didn't win
  if (!winnings) return null

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">You Won!</span>
            </div>
            <Badge variant="default" className="bg-green-600">
              Accurate Prediction
            </Badge>
          </div>

          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-1">Your Winnings</p>
            <p className="text-4xl font-bold text-green-600">{winnings} USDC</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {isClaiming ? 'Claiming...' : 'Claim Winnings'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Winnings will be sent to your connected wallet
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
