'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Trophy, 
  Clock, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAccount } from 'wagmi'
import { useChain } from '@/components/blockchain/chain-provider'

interface Position {
  id: string
  marketId: string
  commodity: string
  question: string
  side: 'yes' | 'no'
  amount: number
  entryOdds: number
  currentOdds: number
  shares: number
  potentialPayout: number
  unrealizedPnL: number
  expiryTime: number
  chain: 'polygon' | 'solana'
  status: 'ACTIVE' | 'WINNING' | 'LOSING'
}

interface SettledMarket {
  id: string
  marketId: string
  commodity: string
  question: string
  outcome: 'YES' | 'NO'
  userSide: 'yes' | 'no'
  stakeAmount: number
  payoutAmount: number
  result: 'WON' | 'LOST'
  settledAt: string
  claimed: boolean
  chain: 'polygon' | 'solana'
}

interface WithdrawalOption {
  type: 'claim' | 'restake' | 'bridge'
  label: string
  description: string
  icon: typeof DollarSign
  enabled: boolean
}

export default function SettlementsPage() {
  const [activePositions, setActivePositions] = useState<Position[]>([])
  const [settledMarkets, setSettledMarkets] = useState<SettledMarket[]>([])
  const [totalStaked, setTotalStaked] = useState(0)
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [totalClaimed, setTotalClaimed] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState<string | null>(null)
  const [isClaimingAll, setIsClaimingAll] = useState(false)

  const { activeChain } = useChain()
  const { publicKey: solanaPublicKey, connected: isSolanaConnected } = useWallet()
  const { address: polygonAddress, isConnected: isPolygonConnected } = useAccount()

  const isConnected = isSolanaConnected || isPolygonConnected
  const walletAddress = solanaPublicKey?.toBase58() || polygonAddress

  useEffect(() => {
    if (isConnected) {
      fetchPositions()
      fetchSettledMarkets()
    }
  }, [isConnected, walletAddress, activeChain])

  async function fetchPositions() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/positions?wallet=${walletAddress}&chain=${activeChain}`)
      const data = await response.json()
      
      if (data.success) {
        setActivePositions(data.positions)
        setTotalStaked(data.totalStaked)
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error)
      toast.error('Failed to load positions')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchSettledMarkets() {
    try {
      const response = await fetch(`/api/settlements?wallet=${walletAddress}&chain=${activeChain}`)
      const data = await response.json()
      
      if (data.success) {
        setSettledMarkets(data.markets)
        setTotalWinnings(data.totalWinnings)
        setTotalClaimed(data.totalClaimed)
      }
    } catch (error) {
      console.error('Failed to fetch settled markets:', error)
    }
  }

  async function handleClaim(marketId: string, chain: 'polygon' | 'solana') {
    setIsClaiming(marketId)
    try {
      const response = await fetch('/api/markets/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId,
          chain,
          walletAddress
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Successfully claimed ${data.amount} USDC!`)
        fetchSettledMarkets()
      } else {
        toast.error(data.message || 'Failed to claim winnings')
      }
    } catch (error) {
      console.error('Claim error:', error)
      toast.error('Failed to claim winnings')
    } finally {
      setIsClaiming(null)
    }
  }

  async function handleClaimAll() {
    const unclaimedMarkets = settledMarkets.filter(m => !m.claimed && m.result === 'WON')
    
    if (unclaimedMarkets.length === 0) {
      toast.error('No unclaimed winnings available')
      return
    }

    setIsClaimingAll(true)
    try {
      const response = await fetch('/api/markets/claim-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketIds: unclaimedMarkets.map(m => m.marketId),
          chain: activeChain,
          walletAddress
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Successfully claimed ${data.totalAmount} USDC from ${data.count} markets!`)
        fetchSettledMarkets()
      } else {
        toast.error(data.message || 'Failed to claim all winnings')
      }
    } catch (error) {
      console.error('Batch claim error:', error)
      toast.error('Failed to claim all winnings')
    } finally {
      setIsClaimingAll(false)
    }
  }

  function getDaysUntilExpiry(expiryTime: number): number {
    const now = Date.now()
    const diff = expiryTime - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  function getPnLColor(pnl: number): string {
    if (pnl > 0) return 'text-green-600'
    if (pnl < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  const unclaimedWinnings = totalWinnings - totalClaimed

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settlements</h1>
            <p className="text-muted-foreground">
              Track your positions, claim winnings, and manage your staked assets
            </p>
          </div>

          {!isConnected && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <p>Please connect your wallet to view your settlements</p>
                </div>
              </CardContent>
            </Card>
          )}

          {isConnected && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Staked</span>
                    </div>
                    <p className="text-2xl font-bold">${totalStaked.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Winnings</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${totalWinnings.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Claimed</span>
                    </div>
                    <p className="text-2xl font-bold">${totalClaimed.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Unclaimed</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">${unclaimedWinnings.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Claim All Button */}
              {unclaimedWinnings > 0 && (
                <Card className="mb-8 bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">Unclaimed Winnings Available</h3>
                        <p className="text-sm text-muted-foreground">
                          You have ${unclaimedWinnings.toLocaleString()} USDC ready to claim
                        </p>
                      </div>
                      <Button
                        onClick={handleClaimAll}
                        disabled={isClaimingAll}
                        size="lg"
                      >
                        {isClaimingAll && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Claim All Winnings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs */}
              <Tabs defaultValue="active" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="active">
                    Active Positions ({activePositions.length})
                  </TabsTrigger>
                  <TabsTrigger value="settled">
                    Settled Markets ({settledMarkets.length})
                  </TabsTrigger>
                  <TabsTrigger value="withdrawals">
                    Withdrawal Options
                  </TabsTrigger>
                </TabsList>

                {/* Active Positions Tab */}
                <TabsContent value="active">
                  {isLoading ? (
                    <Card>
                      <CardContent className="pt-6 text-center py-12">
                        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading positions...</p>
                      </CardContent>
                    </Card>
                  ) : activePositions.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center py-12">
                        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">No active positions</p>
                        <Button asChild>
                          <a href="/marketplace">Browse Markets</a>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {activePositions.map((position) => {
                        const daysLeft = getDaysUntilExpiry(position.expiryTime)
                        const isExpiring = daysLeft <= 3

                        return (
                          <Card key={position.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{position.commodity}</Badge>
                                    <Badge variant={position.chain === 'solana' ? 'default' : 'secondary'}>
                                      {position.chain}
                                    </Badge>
                                  </div>
                                  <h3 className="font-semibold mb-1">{position.question}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Staked on {position.side.toUpperCase()}
                                  </p>
                                </div>
                                {position.side === 'yes' ? (
                                  <TrendingUp className="w-6 h-6 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-6 h-6 text-red-600" />
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Amount Staked</p>
                                  <p className="font-semibold">${position.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Entry Odds</p>
                                  <p className="font-semibold">{position.entryOdds.toFixed(1)}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Current Odds</p>
                                  <p className="font-semibold">{position.currentOdds.toFixed(1)}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Potential Payout</p>
                                  <p className="font-semibold text-green-600">
                                    ${position.potentialPayout.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Unrealized P&L</p>
                                  <p className={`font-semibold ${getPnLColor(position.unrealizedPnL)}`}>
                                    {position.unrealizedPnL > 0 ? '+' : ''}
                                    ${position.unrealizedPnL.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className={isExpiring ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
                                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expired - Awaiting settlement'}
                                  </span>
                                </div>
                                <Badge variant={position.status === 'ACTIVE' ? 'default' : position.status === 'WINNING' ? 'default' : 'secondary'}>
                                  {position.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* Settled Markets Tab */}
                <TabsContent value="settled">
                  {settledMarkets.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center py-12">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No settled markets yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {settledMarkets.map((market) => (
                        <Card key={market.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">{market.commodity}</Badge>
                                  <Badge variant={market.chain === 'solana' ? 'default' : 'secondary'}>
                                    {market.chain}
                                  </Badge>
                                  <Badge variant={market.result === 'WON' ? 'default' : 'destructive'}>
                                    {market.result}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold mb-1">{market.question}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Outcome: {market.outcome} • You staked: {market.userSide.toUpperCase()}
                                </p>
                              </div>
                              {market.result === 'WON' ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-600" />
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Staked</p>
                                <p className="font-semibold">${market.stakeAmount.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {market.result === 'WON' ? 'Payout' : 'Lost'}
                                </p>
                                <p className={`font-semibold ${market.result === 'WON' ? 'text-green-600' : 'text-red-600'}`}>
                                  ${market.payoutAmount.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Net P&L</p>
                                <p className={`font-semibold ${market.result === 'WON' ? 'text-green-600' : 'text-red-600'}`}>
                                  {market.result === 'WON' ? '+' : '-'}
                                  ${Math.abs(market.payoutAmount - market.stakeAmount).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Settled</p>
                                <p className="font-semibold text-sm">
                                  {new Date(market.settledAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {market.result === 'WON' && !market.claimed && (
                              <Button
                                onClick={() => handleClaim(market.marketId, market.chain)}
                                disabled={isClaiming === market.marketId}
                                className="w-full"
                              >
                                {isClaiming === market.marketId && (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Claim ${market.payoutAmount.toFixed(2)} USDC
                              </Button>
                            )}

                            {market.claimed && (
                              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Claimed</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Withdrawal Options Tab */}
                <TabsContent value="withdrawals">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <DollarSign className="w-8 h-8 mb-2 text-primary" />
                        <CardTitle>Claim to Wallet</CardTitle>
                        <CardDescription>
                          Withdraw your winnings directly to your connected wallet
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="w-full"
                          disabled={unclaimedWinnings === 0}
                          onClick={handleClaimAll}
                        >
                          Claim ${unclaimedWinnings.toFixed(2)}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <TrendingUp className="w-8 h-8 mb-2 text-green-600" />
                        <CardTitle>Restake Winnings</CardTitle>
                        <CardDescription>
                          Automatically compound your winnings into new predictions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="w-full"
                          variant="outline"
                          disabled={unclaimedWinnings === 0}
                        >
                          Auto-Compound
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <ArrowRight className="w-8 h-8 mb-2 text-blue-600" />
                        <CardTitle>Bridge to Another Chain</CardTitle>
                        <CardDescription>
                          Use Wormhole to move your funds between Polygon and Solana
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="w-full"
                          variant="outline"
                          asChild
                        >
                          <a href="/test-bridge">Open Bridge</a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Emergency Withdrawal</CardTitle>
                      <CardDescription>
                        Withdraw your active positions early (7-day cooldown, 5% fee)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Warning</p>
                            <p>Emergency withdrawals incur a 5% penalty and require a 7-day cooldown period. Only use this if you need immediate access to your funds.</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={activePositions.length === 0}
                      >
                        Request Emergency Withdrawal
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
