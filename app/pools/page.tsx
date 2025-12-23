'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Coffee, Flower2, Leaf, Palmtree, Apple, Nut, TrendingUp, DollarSign, Clock, AlertCircle, Wallet, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const POOLS = [
  {
    id: 'coffee',
    name: 'Coffee Pool',
    symbol: 'COFFEE',
    icon: Coffee,
    currentPrice: 2.45,
    apy30: 8,
    apy90: 12,
    apy180: 15,
    tvl: 450000,
    stakers: 234,
    color: 'bg-amber-100 text-amber-800',
    description: 'Earn yield backed by specialty coffee markets across Africa and Latin America',
  },
  {
    id: 'cocoa',
    name: 'Cocoa Pool',
    symbol: 'COCOA',
    icon: Flower2,
    currentPrice: 3.21,
    apy30: 9,
    apy90: 13,
    apy180: 16,
    tvl: 380000,
    stakers: 189,
    color: 'bg-orange-100 text-orange-800',
    description: 'Yield from Grade I cocoa production in West Africa',
  },
  {
    id: 'tea',
    name: 'Tea Pool',
    symbol: 'TEA',
    icon: Leaf,
    currentPrice: 4.15,
    apy30: 7,
    apy90: 11,
    apy180: 14,
    tvl: 320000,
    stakers: 156,
    color: 'bg-green-100 text-green-800',
    description: 'CTC grade tea from Kenya and East African highlands',
  },
  {
    id: 'cotton',
    name: 'Cotton Pool',
    symbol: 'COTTON',
    icon: Palmtree,
    currentPrice: 1.85,
    apy30: 8.5,
    apy90: 12.5,
    apy180: 15.5,
    tvl: 420000,
    stakers: 203,
    color: 'bg-blue-100 text-blue-800',
    description: 'Grade A cotton from Egyptian and Burkina Faso farms',
  },
  {
    id: 'avocado',
    name: 'Avocado Pool',
    symbol: 'AVOCADO',
    icon: Apple,
    currentPrice: 2.95,
    apy30: 10,
    apy90: 14,
    apy180: 17,
    tvl: 290000,
    stakers: 145,
    color: 'bg-emerald-100 text-emerald-800',
    description: 'Export-grade avocados from Kenyan and Mexican farms',
  },
  {
    id: 'macadamia',
    name: 'Macadamia Pool',
    symbol: 'MACADAMIA',
    icon: Nut,
    currentPrice: 8.75,
    apy30: 9.5,
    apy90: 13.5,
    apy180: 16.5,
    tvl: 540000,
    stakers: 267,
    color: 'bg-orange-100 text-orange-800',
    description: 'Premium macadamia nuts from South African orchards',
  },
]

export default function PoolsPage() {
  const { address: polygonAddress } = useAccount()
  const { publicKey: solanaPublicKey } = useWallet()
  const walletConnected = !!(polygonAddress || solanaPublicKey)

  const [selectedPool, setSelectedPool] = useState(POOLS[0])
  const [amount, setAmount] = useState('')
  const [lockPeriod, setLockPeriod] = useState('90')
  const [userStakes, setUserStakes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (walletConnected) {
      // Fetch user's stakes from API
      // TODO: Implement actual API call
    }
  }, [walletConnected])

  const calculateReturns = () => {
    const amountNum = parseFloat(amount) || 0
    const apy = lockPeriod === '30' ? selectedPool.apy30 : 
                lockPeriod === '90' ? selectedPool.apy90 : 
                selectedPool.apy180
    const days = parseInt(lockPeriod)
    const returns = (amountNum * apy / 100 * days / 365).toFixed(2)
    const total = (amountNum + parseFloat(returns)).toFixed(2)
    return { returns, apy, total }
  }

  const { returns, apy, total } = calculateReturns()

  const handleStake = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      // TODO: Implement actual staking logic
      // 1. Approve USDC spend
      // 2. Call staking contract
      // 3. Update UI
      alert(`Staking ${amount} USDC in ${selectedPool.name} for ${lockPeriod} days`)
    } catch (error) {
      console.error('Staking failed:', error)
      alert('Staking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const IconComponent = selectedPool.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Commodity Staking Pools</h1>
              <p className="text-gray-600">
                Stake USDC in commodity-backed pools and earn yield based on real commodity performance
              </p>
            </div>
            <Link href="/settlements">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Returns
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total TVL</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    ${(POOLS.reduce((sum, p) => sum + p.tvl, 0) / 1000000).toFixed(2)}M
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Avg APY</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">12.4%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Stakers</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {POOLS.reduce((sum, p) => sum + p.stakers, 0).toLocaleString()}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Pools</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{POOLS.length}</p>
                </div>
                <Coffee className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pool Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Pool</CardTitle>
                <CardDescription>Choose a commodity to stake in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {POOLS.map((pool) => {
                  const PoolIcon = pool.icon
                  const isSelected = selectedPool.id === pool.id
                  return (
                    <button
                      key={pool.id}
                      onClick={() => setSelectedPool(pool)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${pool.color}`}>
                            <PoolIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{pool.name}</p>
                            <p className="text-xs text-gray-600">
                              ${(pool.tvl / 1000).toFixed(0)}K TVL · {pool.stakers} stakers
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {pool.apy90}%
                          </p>
                          <p className="text-xs text-gray-500">APY</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Your Stakes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stakes</CardTitle>
              </CardHeader>
              <CardContent>
                {!walletConnected ? (
                  <div className="text-center py-6 text-gray-500">
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm mb-3">Connect wallet to view your stakes</p>
                  </div>
                ) : userStakes.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm mb-1">No active stakes</p>
                    <Link href="/settlements" className="text-xs text-primary hover:underline">
                      View settlement history
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userStakes.map((stake, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{stake.pool}</p>
                            <p className="text-sm text-gray-600">{stake.amount} USDC</p>
                          </div>
                          <Badge variant="secondary">{stake.apy}% APY</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Staking Interface */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-3 rounded-lg ${selectedPool.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{selectedPool.name}</CardTitle>
                        <CardDescription>
                          Current price: ${selectedPool.currentPrice.toFixed(2)}/kg
                        </CardDescription>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-[60px]">
                      {selectedPool.description}
                    </p>
                  </div>
                  <Badge className={selectedPool.color}>
                    {selectedPool.symbol}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stake" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stake">Stake</TabsTrigger>
                    <TabsTrigger value="unstake">Unstake</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stake" className="space-y-4">
                    {/* Amount Input */}
                    <div>
                      <Label htmlFor="amount">Stake Amount (USDC)</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1"
                          min="0"
                          step="0.01"
                        />
                        <Button variant="outline" onClick={() => setAmount('1000')}>
                          Max
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Available: {walletConnected ? '1,000.00 USDC' : 'Connect wallet'}
                      </p>
                    </div>

                    {/* Lock Period */}
                    <div>
                      <Label htmlFor="lock-period">Lock Period</Label>
                      <Select value={lockPeriod} onValueChange={setLockPeriod}>
                        <SelectTrigger id="lock-period" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">
                            30 days - {selectedPool.apy30}% APY
                          </SelectItem>
                          <SelectItem value="90">
                            90 days - {selectedPool.apy90}% APY (Recommended)
                          </SelectItem>
                          <SelectItem value="180">
                            180 days - {selectedPool.apy180}% APY (Best)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 mt-1">
                        Higher lock periods earn better yields
                      </p>
                    </div>

                    {/* Estimated Returns */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Estimated Returns
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Stake Amount:</span>
                          <span className="font-semibold">{amount || '0.00'} USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">APY:</span>
                          <span className="font-semibold text-green-600">{apy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lock Period:</span>
                          <span className="font-semibold">{lockPeriod} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Unlock Date:</span>
                          <span className="font-semibold text-sm">
                            {new Date(Date.now() + parseInt(lockPeriod) * 86400000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-green-300">
                          <span className="text-sm text-gray-600">Expected Returns:</span>
                          <span className="font-bold text-green-600">+${returns} USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total at Maturity:</span>
                          <span className="font-bold text-lg">
                            ${total} USDC
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Early Withdrawal Fee</p>
                        <p>Unstaking before the lock period ends incurs a 2% fee, which is distributed to remaining pool members.</p>
                      </div>
                    </div>

                    {/* Stake Button */}
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleStake}
                      disabled={!walletConnected || !amount || parseFloat(amount) <= 0 || loading}
                    >
                      {!walletConnected ? (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Wallet to Stake
                        </>
                      ) : loading ? (
                        'Processing...'
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Stake {amount || '0'} USDC
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="unstake" className="space-y-4">
                    {!walletConnected ? (
                      <div className="text-center py-12 text-gray-500">
                        <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="mb-2">Connect your wallet to view stakes</p>
                      </div>
                    ) : userStakes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="mb-2">No active stakes in this pool</p>
                        <p className="text-sm">
                          Stakes you make will appear here and can be unstaked after the lock period.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userStakes.filter(s => s.poolId === selectedPool.id).map((stake, idx) => (
                          <Card key={idx}>
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold">{stake.amount} USDC</p>
                                  <p className="text-sm text-gray-600">Staked on {stake.date}</p>
                                </div>
                                <Badge variant="secondary">{stake.apy}% APY</Badge>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Current Value:</span>
                                  <span className="font-semibold">{stake.currentValue} USDC</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Unlock Date:</span>
                                  <span>{stake.unlockDate}</span>
                                </div>
                              </div>
                              <Button className="w-full mt-4" variant="outline">
                                Unstake (2% fee)
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Pool Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Value Locked</p>
                      <p className="text-xl font-bold mt-1">
                        ${(selectedPool.tvl / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Price</p>
                      <p className="text-xl font-bold mt-1">
                        ${selectedPool.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Best APY</p>
                      <p className="text-xl font-bold mt-1 text-green-600">
                        {selectedPool.apy180}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">180 days</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How it Works */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
              <CardHeader>
                <CardTitle className="text-lg">How Commodity Staking Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Lock Your USDC</p>
                    <p className="text-sm text-gray-600">
                      Choose a commodity pool and lock period (30, 90, or 180 days)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Earn Price-Linked Returns</p>
                    <p className="text-sm text-gray-600">
                      Your stake value tracks the real commodity price from verified oracles
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">Claim at Maturity</p>
                    <p className="text-sm text-gray-600">
                      After lock period ends, claim your principal + yield (or unstake early with 2% fee)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
