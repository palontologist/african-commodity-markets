'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StakeModal } from '@/components/markets/stake-modal'
import { TrendingUp, Calendar, DollarSign } from 'lucide-react'

// Demo market data
const demoMarket = {
  id: 'market-1',
  commodity: 'COFFEE',
  question: 'Will COFFEE reach $3.00 by December 31, 2025?',
  thresholdPrice: 300, // $3.00 in cents
  expiryTime: new Date('2025-12-31').getTime(),
  yesPool: 150.50,
  noPool: 75.25,
  chain: 'solana' as const,
  resolved: false,
}

export default function StakeDemo() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState(demoMarket)

  const totalPool = selectedMarket.yesPool + selectedMarket.noPool
  const yesPercent = (selectedMarket.yesPool / totalPool) * 100

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stake Modal Demo</h1>
        <p className="text-muted-foreground">
          Test the staking interface with demo market data
        </p>
      </div>

      {/* Market Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {selectedMarket.commodity} Prediction Market
              </CardTitle>
              <CardDescription className="mt-2">
                {selectedMarket.question}
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {selectedMarket.chain}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Pool Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">YES</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {yesPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedMarket.yesPool.toFixed(2)} USDC
                </p>
              </div>
              
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">NO</span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {(100 - yesPercent).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedMarket.noPool.toFixed(2)} USDC
                </p>
              </div>
            </div>

            {/* Market Details */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Total Pool: {totalPool.toFixed(2)} USDC</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Expires: {new Date(selectedMarket.expiryTime).toLocaleDateString()}</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={() => setModalOpen(true)}
              className="w-full"
              size="lg"
            >
              Stake on this Market
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chain Switcher */}
      <Card>
        <CardHeader>
          <CardTitle>Test Different Chains</CardTitle>
          <CardDescription>Switch between Polygon and Solana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={selectedMarket.chain === 'polygon' ? 'default' : 'outline'}
              onClick={() => setSelectedMarket({ ...selectedMarket, chain: 'polygon' })}
            >
              Polygon (ERC-20 USDC)
            </Button>
            <Button
              variant={selectedMarket.chain === 'solana' ? 'default' : 'outline'}
              onClick={() => setSelectedMarket({ ...selectedMarket, chain: 'solana' })}
            >
              Solana (SPL USDC)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ol className="space-y-2">
            <li>
              <strong>Connect Wallet:</strong> 
              <ul>
                <li>Polygon: Click "Connect Wallet" in header → Select MetaMask</li>
                <li>Solana: Click "Connect Wallet" → Select Phantom</li>
              </ul>
            </li>
            <li>
              <strong>Get Test Tokens:</strong>
              <ul>
                <li>Polygon USDC: Visit <a href="https://faucet.polygon.technology" target="_blank" rel="noopener noreferrer">Polygon Faucet</a></li>
                <li>Solana USDC: Use <code>spl-token</code> CLI or contact dev team</li>
              </ul>
            </li>
            <li>
              <strong>Test Staking:</strong>
              <ul>
                <li>Enter amount (e.g., 10 USDC)</li>
                <li>Choose YES or NO</li>
                <li>Approve USDC (Polygon only, one-time)</li>
                <li>Confirm stake transaction</li>
              </ul>
            </li>
            <li>
              <strong>Verify:</strong>
              <ul>
                <li>Check transaction on explorer</li>
                <li>Balance should decrease</li>
                <li>Position should appear in "My Positions"</li>
              </ul>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Stake Modal */}
      <StakeModal
        market={selectedMarket}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          console.log('Stake successful!')
          // Refresh market data here
        }}
      />
    </div>
  )
}
