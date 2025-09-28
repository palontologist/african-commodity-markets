"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Volume2, XCircle } from "lucide-react"

interface MarketData {
  id: number
  question: string
  yesPrice: number
  noPrice: number
  volume: string
  participants: number
  deadline: string
  description: string
}

interface MarketHealthIndicatorProps {
  market: MarketData
  className?: string
}

export function MarketHealthIndicator({ market, className }: MarketHealthIndicatorProps) {
  // Calculate market health score (0-100)
  const calculateHealthScore = () => {
    let score = 0
    
    // Liquidity Score (30 points max) - based on volume
    const volumeValue = parseFloat(market.volume.replace(/[^0-9.]/g, '')) || 0
    if (volumeValue > 1000000) score += 30      // >$1M = excellent
    else if (volumeValue > 500000) score += 25  // >$500K = very good
    else if (volumeValue > 100000) score += 20  // >$100K = good
    else if (volumeValue > 50000) score += 15   // >$50K = fair
    else score += 5                             // <$50K = poor
    
    // Participation Score (25 points max) - based on number of traders
    if (market.participants > 200) score += 25      // >200 = excellent
    else if (market.participants > 150) score += 20 // >150 = very good
    else if (market.participants > 100) score += 15 // >100 = good
    else if (market.participants > 50) score += 10  // >50 = fair
    else score += 3                                  // <50 = poor
    
    // Price Balance Score (20 points max) - how balanced the market is
    const priceBalance = Math.abs(market.yesPrice - market.noPrice)
    if (priceBalance < 0.1) score += 20        // Very balanced
    else if (priceBalance < 0.2) score += 15   // Well balanced
    else if (priceBalance < 0.4) score += 10   // Somewhat balanced
    else if (priceBalance < 0.6) score += 5    // Unbalanced
    else score += 0                            // Very unbalanced
    
    // Time to Settlement Score (25 points max)
    const settlementDate = new Date(market.deadline)
    const now = new Date()
    const daysToSettlement = Math.ceil((settlementDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysToSettlement > 60) score += 25         // >2 months = excellent
    else if (daysToSettlement > 30) score += 20    // >1 month = very good
    else if (daysToSettlement > 14) score += 15    // >2 weeks = good
    else if (daysToSettlement > 7) score += 10     // >1 week = fair
    else if (daysToSettlement > 1) score += 5      // >1 day = poor
    else score += 0                                // <1 day = very poor
    
    return Math.min(100, Math.max(0, score))
  }
  
  const healthScore = calculateHealthScore()
  
  // Determine overall recommendation
  const getRecommendation = () => {
    if (healthScore >= 80) return { level: "excellent", text: "Excellent time to trade", color: "text-green-600", icon: CheckCircle }
    if (healthScore >= 65) return { level: "good", text: "Good time to trade", color: "text-green-500", icon: CheckCircle }
    if (healthScore >= 50) return { level: "fair", text: "Proceed with caution", color: "text-yellow-600", icon: AlertTriangle }
    if (healthScore >= 35) return { level: "poor", text: "High risk - consider waiting", color: "text-orange-600", icon: AlertTriangle }
    return { level: "very-poor", text: "Not recommended", color: "text-red-600", icon: XCircle }
  }
  
  const recommendation = getRecommendation()
  const Icon = recommendation.icon
  
  // Calculate individual metrics
  const volumeValue = parseFloat(market.volume.replace(/[^0-9.]/g, '')) || 0
  const priceBalance = Math.abs(market.yesPrice - market.noPrice)
  const settlementDate = new Date(market.deadline)
  const now = new Date()
  const daysToSettlement = Math.ceil((settlementDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return (
    <TooltipProvider>
      <Card className={`border-l-4 ${
        healthScore >= 80 ? 'border-l-green-500' :
        healthScore >= 65 ? 'border-l-green-400' :
        healthScore >= 50 ? 'border-l-yellow-500' :
        healthScore >= 35 ? 'border-l-orange-500' :
        'border-l-red-500'
      } ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon className={`w-5 h-5 ${recommendation.color}`} />
              Market Health
            </CardTitle>
            <Badge variant={
              healthScore >= 80 ? "default" :
              healthScore >= 65 ? "secondary" :
              healthScore >= 50 ? "outline" :
              "destructive"
            }>
              {healthScore}/100
            </Badge>
          </div>
          <CardDescription className={`font-medium ${recommendation.color}`}>
            {recommendation.text}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Overall Health Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Health</span>
              <span className="text-sm text-muted-foreground">{healthScore}%</span>
            </div>
            <Progress value={healthScore} className="h-3" />
          </div>
          
          {/* Individual Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Liquidity</p>
                    <p className="text-xs text-muted-foreground">{market.volume}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Higher trading volume indicates better liquidity and easier entry/exit</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Participants</p>
                    <p className="text-xs text-muted-foreground">{market.participants} traders</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>More participants typically means better price discovery and market efficiency</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Balance</p>
                    <p className="text-xs text-muted-foreground">
                      {priceBalance < 0.2 ? 'Well balanced' : 
                       priceBalance < 0.4 ? 'Moderate' : 
                       'Unbalanced'}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Balanced YES/NO prices indicate healthy market sentiment without extreme bias</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time Left</p>
                    <p className="text-xs text-muted-foreground">
                      {daysToSettlement > 1 ? `${daysToSettlement} days` : `${Math.max(0, daysToSettlement)} day`}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>More time until settlement allows for better information gathering and reduces timing risk</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Risk Warnings */}
          {healthScore < 50 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Market Conditions Warning</p>
                  <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                    {volumeValue < 100000 && <li>• Low liquidity may impact trade execution</li>}
                    {market.participants < 100 && <li>• Limited participants may affect price accuracy</li>}
                    {daysToSettlement < 7 && <li>• Close to settlement increases timing risk</li>}
                    {priceBalance > 0.6 && <li>• Heavily skewed market sentiment</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}