'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Users, Info } from 'lucide-react'
import { getOdds, calculatePayout, stakePrediction, parseUSDC, formatUSDC, getUSDCBalance, type OnChainPrediction } from '@/lib/blockchain/polygon-client'
import { BrowserProvider } from 'ethers'

interface PredictionStakingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prediction: OnChainPrediction | null
}

export function PredictionStakingModal({ open, onOpenChange, prediction }: PredictionStakingModalProps) {
  const { address, isConnected } = useAccount()
  const [stakeAmount, setStakeAmount] = useState('')
  const [isYes, setIsYes] = useState(true)
  const [odds, setOdds] = useState<{ yesOdds: number; noOdds: number } | null>(null)
  const [potentialPayout, setPotentialPayout] = useState<string>('0')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<string>('0')
  const [error, setError] = useState<string | null>(null)

  // Load odds
  useEffect(() => {
    if (prediction && open) {
      loadOdds()
    }
  }, [prediction, open])

  // Load USDC balance
  useEffect(() => {
    if (address && open && typeof window !== 'undefined' && window.ethereum) {
      loadBalance()
    }
  }, [address, open])

  // Calculate potential payout
  useEffect(() => {
    if (prediction && stakeAmount && !isNaN(parseFloat(stakeAmount))) {
      calculatePotentialPayout()
    } else {
      setPotentialPayout('0')
    }
  }, [stakeAmount, isYes, prediction])

  async function loadOdds() {
    if (!prediction) return
    try {
      const oddsData = await getOdds(prediction.predictionId)
      setOdds(oddsData)
    } catch (err) {
      console.error('Failed to load odds:', err)
    }
  }

  async function loadBalance() {
    if (!address || typeof window === 'undefined' || !window.ethereum) return
    try {
      const provider = new BrowserProvider(window.ethereum)
      const balance = await getUSDCBalance(address, provider)
      setUsdcBalance(formatUSDC(balance))
    } catch (err) {
      console.error('Failed to load USDC balance:', err)
    }
  }

  async function calculatePotentialPayout() {
    if (!prediction || !stakeAmount) return
    try {
      const amount = parseUSDC(stakeAmount)
      const payout = await calculatePayout(prediction.predictionId, isYes, amount)
      setPotentialPayout(formatUSDC(payout))
    } catch (err) {
      console.error('Failed to calculate payout:', err)
    }
  }

  async function handleStake() {
    if (!prediction || !stakeAmount || !isConnected || !address) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Web3 provider not available')
      }

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const amount = parseUSDC(stakeAmount)

      const txHash = await stakePrediction({
        predictionId: prediction.predictionId,
        isYes,
        amount,
        signer
      })

      console.log('✅ Stake transaction successful:', txHash)
      
      // Refresh odds
      await loadOdds()
      await loadBalance()
      
      // Close modal
      setStakeAmount('')
      onOpenChange(false)
    } catch (err: any) {
      console.error('Failed to stake:', err)
      setError(err.message || 'Failed to stake. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!prediction) return null

  const yesStakesUSDC = formatUSDC(prediction.yesStakes)
  const noStakesUSDC = formatUSDC(prediction.noStakes)
  const totalStakes = Number(yesStakesUSDC) + Number(noStakesUSDC)
  const yesPercentage = totalStakes > 0 ? (Number(yesStakesUSDC) / totalStakes) * 100 : 50
  const currentPriceDollars = Number(prediction.currentPrice) / 100
  const predictedPriceDollars = Number(prediction.predictedPrice) / 100
  const priceChange = ((predictedPriceDollars - currentPriceDollars) / currentPriceDollars) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Stake on Prediction
          </DialogTitle>
          <DialogDescription>
            Place your bet on whether this AI prediction will be accurate
          </DialogDescription>
        </DialogHeader>

        {/* Prediction Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commodity</p>
                  <p className="text-lg font-semibold">{prediction.commodity}</p>
                </div>
                <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="text-lg px-3 py-1">
                  {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-xl font-bold">${currentPriceDollars.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Predicted Price</p>
                  <p className="text-xl font-bold">${predictedPriceDollars.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">AI Confidence</p>
                <Progress value={Number(prediction.confidence)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{prediction.confidence}% confident</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Odds */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Market Odds
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <Card className={isYes ? 'border-green-500 border-2' : ''}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-600">YES (Accurate)</p>
                  <p className="text-2xl font-bold">{odds?.yesOdds.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{yesStakesUSDC} USDC staked</p>
                </div>
              </CardContent>
            </Card>
            <Card className={!isYes ? 'border-red-500 border-2' : ''}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-red-600">NO (Inaccurate)</p>
                  <p className="text-2xl font-bold">{odds?.noOdds.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{noStakesUSDC} USDC staked</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-green-500 transition-all"
              style={{ width: `${yesPercentage}%` }}
            />
            <div 
              className="absolute right-0 top-0 h-full bg-red-500 transition-all"
              style={{ width: `${100 - yesPercentage}%` }}
            />
          </div>
        </div>

        {/* Stake Form */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={isYes ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setIsYes(true)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              YES - Will be accurate
            </Button>
            <Button
              variant={!isYes ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setIsYes(false)}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              NO - Will miss
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake-amount">Stake Amount (USDC)</Label>
            <div className="flex gap-2">
              <Input
                id="stake-amount"
                type="number"
                placeholder="10"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min="1"
                step="0.01"
              />
              <Button variant="outline" onClick={() => setStakeAmount(usdcBalance)}>
                Max
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {usdcBalance} USDC | Min stake: 1 USDC
            </p>
          </div>

          {stakeAmount && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Potential Payout</span>
                  <span className="text-lg font-bold">{potentialPayout} USDC</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">Profit if correct</span>
                  <span className="text-sm font-semibold text-green-600">
                    +{(parseFloat(potentialPayout) - parseFloat(stakeAmount || '0')).toFixed(2)} USDC
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2 items-start text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Platform fee: 2%. Winnings are automatically calculated based on the pool. You can claim after the prediction resolves.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleStake}
              disabled={!isConnected || !stakeAmount || isSubmitting || parseFloat(stakeAmount) < 1}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Place Stake'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
