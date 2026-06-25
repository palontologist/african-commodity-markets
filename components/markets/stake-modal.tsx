'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react'

interface MarketData {
  id: string | number
  commodity: string
  question: string
  thresholdPrice: number
  expiryTime: number
  yesPool: number
  noPool: number
  chain: string
  resolved: boolean
}

interface StakeModalProps {
  market: MarketData
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function StakeModal({ market, open, onOpenChange, onSuccess }: StakeModalProps) {
  const [position, setPosition] = useState<'yes' | 'no'>('yes')
  const [amount, setAmount] = useState('')

  const yesOdds = market.yesPool > 0 || market.noPool > 0
    ? (market.yesPool / (market.yesPool + market.noPool)) * 100
    : 50

  const noOdds = 100 - yesOdds

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Stake on {market.commodity}</DialogTitle>
          <DialogDescription>{market.question}</DialogDescription>
        </DialogHeader>

        <Tabs value={position} onValueChange={(v) => setPosition(v as 'yes' | 'no')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="yes" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              YES {yesOdds.toFixed(0)}%
            </TabsTrigger>
            <TabsTrigger value="no" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              NO {noOdds.toFixed(0)}%
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yes" className="space-y-4 pt-4">
            <Badge className="bg-green-100 text-green-800">Predicting price will rise</Badge>
          </TabsContent>
          <TabsContent value="no" className="space-y-4 pt-4">
            <Badge className="bg-red-100 text-red-800">Predicting price will fall</Badge>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="amount">Stake Amount (USDC)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pool YES</span>
            <span>{market.yesPool.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pool NO</span>
            <span>{market.noPool.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network</span>
            <span className="capitalize">{market.chain}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Prediction markets involve risk. You may lose your entire stake.</span>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={!amount || Number(amount) <= 0}
            onClick={onSuccess}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Stake {amount ? `${amount} USDC` : ''}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
