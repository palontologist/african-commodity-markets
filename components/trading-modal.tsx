"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { MarketHealthIndicator } from "@/components/market-health-indicator"
import { AlertTriangle, TrendingUp, TrendingDown, Wallet, Calculator } from "lucide-react"

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  market: {
    id: number
    question: string
    yesPrice: number
    noPrice: number
    volume: string
    participants: number
    deadline: string
    description: string
  }
  commodity: string
  initialTradeType?: "yes" | "no"
}

export function TradingModal({ isOpen, onClose, market, commodity, initialTradeType = "yes" }: TradingModalProps) {
  const [tradeType, setTradeType] = useState<"yes" | "no">(initialTradeType)
  const [amount, setAmount] = useState("")
  const [shares, setShares] = useState(0)
  const [slippage, setSlippage] = useState([0.5])

  useEffect(() => {
    setTradeType(initialTradeType)
  }, [initialTradeType, market?.id])

  const currentPrice = tradeType === "yes" ? market.yesPrice : market.noPrice
  const potentialShares = amount ? Math.floor(Number.parseFloat(amount) / currentPrice) : 0
  const potentialReturn = potentialShares * (tradeType === "yes" ? 1 - market.yesPrice : 1 - market.noPrice)
  const maxReturn = potentialShares * 1
  const breakEven = currentPrice

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value) {
      const calculatedShares = Math.floor(Number.parseFloat(value) / currentPrice)
      setShares(calculatedShares)
    } else {
      setShares(0)
    }
  }

  const handleSharesChange = (value: string) => {
    const shareCount = Number.parseInt(value) || 0
    setShares(shareCount)
    setAmount((shareCount * currentPrice).toFixed(2))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Trade Market Position</DialogTitle>
          <DialogDescription className="text-balance">{market.question}</DialogDescription>
        </DialogHeader>

        {/* Market Health Indicator */}
        <div className="mb-4">
          <MarketHealthIndicator market={market} />
        </div>

        <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as "yes" | "no")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="yes" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Buy YES</span>
            </TabsTrigger>
            <TabsTrigger value="no" className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4" />
              <span>Buy NO</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yes" className="space-y-6">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-700 dark:text-green-400">YES Position</CardTitle>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ${market.yesPrice.toFixed(2)} per share
                  </Badge>
                </div>
                <CardDescription className="text-green-600 dark:text-green-500">
                  You believe the outcome will be YES. Profit if the market resolves to YES.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="no" className="space-y-6">
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-700 dark:text-red-400">NO Position</CardTitle>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    ${market.noPrice.toFixed(2)} per share
                  </Badge>
                </div>
                <CardDescription className="text-red-600 dark:text-red-500">
                  You believe the outcome will be NO. Profit if the market resolves to NO.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trading Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shares">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                placeholder="0"
                value={shares}
                onChange={(e) => handleSharesChange(e.target.value)}
                className="text-lg"
              />
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="space-y-3">
            <Label>Slippage Tolerance: {slippage[0]}%</Label>
            <Slider value={slippage} onValueChange={setSlippage} max={5} min={0.1} step={0.1} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0.1%</span>
              <span>5%</span>
            </div>
          </div>

          {/* Trade Summary */}
          {amount && Number.parseFloat(amount) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Trade Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Investment</p>
                    <p className="font-semibold text-foreground">${Number.parseFloat(amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shares</p>
                    <p className="font-semibold text-foreground">{potentialShares}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Break Even</p>
                    <p className="font-semibold text-foreground">${breakEven.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Return</p>
                    <p className="font-semibold text-primary">${maxReturn.toFixed(2)}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Potential Profit</span>
                    <span className="font-bold text-primary text-lg">
                      ${potentialReturn.toFixed(2)} ({((potentialReturn / Number.parseFloat(amount)) * 100).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Warning */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Risk Warning</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Prediction markets involve risk. You may lose your entire investment if the market resolves against
                    your position. Only invest what you can afford to lose.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              className={`flex-1 ${
                tradeType === "yes" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700 text-white"
              }`}
              disabled={!amount || Number.parseFloat(amount) <= 0}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {tradeType === "yes" ? "Buy YES Shares" : "Buy NO Shares"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          {/* Market Info */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Market Volume</p>
                <p className="font-medium text-foreground">{market.volume}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Participants</p>
                <p className="font-medium text-foreground">{market.participants}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Settlement Date</p>
                <p className="font-medium text-foreground">{market.deadline}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Commodity</p>
                <p className="font-medium text-foreground capitalize">{commodity}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
