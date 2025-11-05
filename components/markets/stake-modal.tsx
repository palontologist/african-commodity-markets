'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, TrendingUp, TrendingDown, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { parseUnits, maxUint256 } from 'viem'

interface Market {
  id: string
  commodity: string
  question: string
  thresholdPrice: number
  expiryTime: number
  yesPool: number
  noPool: number
  chain: 'polygon' | 'solana'
  resolved: boolean
}

interface StakeModalProps {
  market: Market
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function StakeModal({ market, open, onOpenChange, onSuccess }: StakeModalProps) {
  const [amount, setAmount] = useState('')
  const [side, setSide] = useState<'yes' | 'no'>('yes')
  const [isLoading, setIsLoading] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<number>(0)
  const [step, setStep] = useState<'input' | 'confirming' | 'success'>('input')
  
  // Polygon wallet
  const { address: polygonAddress, isConnected: isPolygonConnected } = useAccount()
  
  // Solana wallet
  const { publicKey: solanaPublicKey, connected: isSolanaConnected } = useWallet()
  
  const isConnected = market.chain === 'polygon' ? isPolygonConnected : isSolanaConnected
  const walletAddress = market.chain === 'polygon' ? polygonAddress : solanaPublicKey?.toBase58()

  // Wagmi hooks for contract interaction
  const { 
    data: approveHash, 
    isPending: isApproving,
    writeContract: writeApprove,
    error: approveError 
  } = useWriteContract()

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = 
    useWaitForTransactionReceipt({ hash: approveHash })

  // Calculate odds and potential payout
  const totalPool = market.yesPool + market.noPool
  const yesOdds = totalPool > 0 ? (market.yesPool / totalPool) * 100 : 50
  const noOdds = totalPool > 0 ? (market.noPool / totalPool) * 100 : 50
  
  const currentOdds = side === 'yes' ? yesOdds : noOdds
  const potentialPayout = amount ? calculatePayout(parseFloat(amount), side) : 0
  const potentialReturn = amount ? ((potentialPayout - parseFloat(amount)) / parseFloat(amount)) * 100 : 0

  // Fetch USDC balance
  useEffect(() => {
    if (open && isConnected) {
      fetchUSDCBalance()
      checkApprovalNeeded()
    }
  }, [open, isConnected, walletAddress])

  // Handle approval transaction success
  useEffect(() => {
    if (isApproveSuccess) {
      toast.success('USDC spending approved!')
      setNeedsApproval(false)
    }
  }, [isApproveSuccess])

  // Handle approval errors
  useEffect(() => {
    if (approveError) {
      console.error('Approval error:', approveError)
      toast.error('Failed to approve USDC spending')
    }
  }, [approveError])

  async function fetchUSDCBalance() {
    try {
      if (market.chain === 'polygon' && polygonAddress) {
        // Fetch ERC-20 USDC balance
        const response = await fetch(`/api/balance/usdc?address=${polygonAddress}&chain=polygon`)
        const data = await response.json()
        setUsdcBalance(data.balance || 0)
      } else if (market.chain === 'solana' && solanaPublicKey) {
        // Fetch SPL USDC balance
        const response = await fetch(`/api/balance/usdc?address=${solanaPublicKey.toBase58()}&chain=solana`)
        const data = await response.json()
        setUsdcBalance(data.balance || 0)
      }
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error)
      toast.error('Failed to fetch your USDC balance')
    }
  }

  async function checkApprovalNeeded() {
    if (market.chain !== 'polygon') {
      setNeedsApproval(false)
      return
    }

    try {
      // Check if user has approved the contract to spend USDC
      const response = await fetch(`/api/contracts/allowance?address=${polygonAddress}`)
      const data = await response.json()
      setNeedsApproval(data.needsApproval || false)
    } catch (error) {
      console.error('Failed to check approval:', error)
    }
  }

  function calculatePayout(stakeAmount: number, stakeSide: 'yes' | 'no'): number {
    if (!stakeAmount || stakeAmount <= 0) return 0
    
    // AMM-style calculation
    const currentPool = stakeSide === 'yes' ? market.yesPool : market.noPool
    const oppositePool = stakeSide === 'yes' ? market.noPool : market.yesPool
    const newPool = currentPool + stakeAmount
    const newTotal = totalPool + stakeAmount
    
    // If you win, you get a share of the total pool proportional to your share of the winning side
    const winningShare = stakeAmount / newPool
    const payout = winningShare * newTotal
    
    return Math.round(payout * 100) / 100 // Round to 2 decimals
  }

  async function handleApprove() {
    if (market.chain !== 'polygon' || !polygonAddress) return

    try {
      // Get USDC and contract addresses from environment
      const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS
      const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS

      if (!usdcAddress || !contractAddress) {
        toast.error('Contract addresses not configured')
        return
      }

      // ERC-20 approve ABI
      const erc20ApproveAbi = [
        {
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ] as const

      // Write the approval transaction
      writeApprove({
        address: usdcAddress as `0x${string}`,
        abi: erc20ApproveAbi,
        functionName: 'approve',
        args: [contractAddress as `0x${string}`, maxUint256],
      })

      toast.info('Please confirm the transaction in your wallet...')
    } catch (error) {
      console.error('Approval error:', error)
      toast.error('Failed to approve USDC spending')
    }
  }

  async function handleStake() {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (parseFloat(amount) > usdcBalance) {
      toast.error('Insufficient USDC balance')
      return
    }

    if (market.chain === 'polygon' && needsApproval) {
      toast.error('Please approve USDC spending first')
      return
    }

    setIsLoading(true)
    setStep('confirming')

    try {
      const response = await fetch('/api/markets/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId: market.id,
          amount: parseFloat(amount),
          side: side,
          chain: market.chain,
          walletAddress: walletAddress,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Stake failed')
      }

      const result = await response.json()
      
      setStep('success')
      toast.success(`Successfully staked ${amount} USDC on ${side.toUpperCase()}!`)
      
      // Refresh balance
      await fetchUSDCBalance()
      
      // Notify parent
      if (onSuccess) onSuccess()
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onOpenChange(false)
        resetModal()
      }, 2000)
      
    } catch (error: any) {
      console.error('Stake error:', error)
      toast.error(error.message || 'Failed to stake. Please try again.')
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  function resetModal() {
    setAmount('')
    setSide('yes')
    setStep('input')
    setIsLoading(false)
    setIsApproving(false)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetModal()
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Stake on Market
          </DialogTitle>
          <DialogDescription>
            {market.question}
          </DialogDescription>
        </DialogHeader>

        {/* Connection Check */}
        {!isConnected && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Wallet not connected
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Please connect your {market.chain === 'polygon' ? 'MetaMask' : 'Phantom'} wallet to stake.
                </p>
              </div>
            </div>
          </div>
        )}

        {isConnected && (
          <>
            {/* Step: Input */}
            {step === 'input' && (
              <div className="space-y-4">
                {/* Balance Display */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">USDC Balance:</span>
                  </div>
                  <span className="text-sm font-semibold">{usdcBalance.toFixed(2)} USDC</span>
                </div>

                {/* Chain Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {market.chain}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Expires: {new Date(market.expiryTime).toLocaleDateString()}
                  </span>
                </div>

                {/* YES/NO Toggle */}
                <Tabs value={side} onValueChange={(v) => setSide(v as 'yes' | 'no')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="yes" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      YES ({yesOdds.toFixed(1)}%)
                    </TabsTrigger>
                    <TabsTrigger value="no" className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      NO ({noOdds.toFixed(1)}%)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Stake Amount (USDC)</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      max={usdcBalance}
                      className="pr-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                      onClick={() => setAmount(usdcBalance.toString())}
                    >
                      MAX
                    </Button>
                  </div>
                  {parseFloat(amount) > usdcBalance && (
                    <p className="text-xs text-red-500">Insufficient balance</p>
                  )}
                </div>

                {/* Pool Info */}
                <Card>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Odds:</span>
                      <span className="font-medium">{currentOdds.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">YES Pool:</span>
                      <span>{market.yesPool.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">NO Pool:</span>
                      <span>{market.noPool.toFixed(2)} USDC</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Potential Payout:</span>
                        <span className="text-green-600">{potentialPayout.toFixed(2)} USDC</span>
                      </div>
                      {potentialReturn > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Return:</span>
                          <span className={potentialReturn > 0 ? 'text-green-600' : 'text-red-600'}>
                            {potentialReturn > 0 ? '+' : ''}{potentialReturn.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Approval Button (Polygon only) */}
                {market.chain === 'polygon' && needsApproval && (
                  <Button
                    onClick={handleApprove}
                    disabled={(isApproving || isApproveConfirming) || !amount || parseFloat(amount) <= 0}
                    className="w-full"
                    variant="outline"
                  >
                    {(isApproving || isApproveConfirming) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isApproveConfirming ? 'Confirming...' : 'Approve USDC Spending'}
                  </Button>
                )}

                {/* Stake Button */}
                <Button
                  onClick={handleStake}
                  disabled={
                    isLoading ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    parseFloat(amount) > usdcBalance ||
                    (market.chain === 'polygon' && needsApproval)
                  }
                  className="w-full"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Stake {amount || '0'} USDC on {side.toUpperCase()}
                </Button>

                {/* Warning */}
                <p className="text-xs text-muted-foreground text-center">
                  By staking, you agree that this is a prediction market and outcomes are final.
                </p>
              </div>
            )}

            {/* Step: Confirming */}
            {step === 'confirming' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Confirming Transaction...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please confirm in your wallet
                  </p>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">Stake Successful!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You staked {amount} USDC on {side.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    View your position in "My Positions"
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
