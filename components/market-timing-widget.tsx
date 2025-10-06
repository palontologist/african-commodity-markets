"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock, TrendingUp, XCircle } from "lucide-react"

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

interface MarketTimingWidgetProps {
  markets: Record<string, MarketData>
  className?: string
}

export function MarketTimingWidget({ markets, className }: MarketTimingWidgetProps) {
  // Calculate aggregate market health
  const calculateOverallHealth = () => {
    const marketValues = Object.values(markets)
    if (marketValues.length === 0) return 0
    
    let totalScore = 0
    
    for (const market of marketValues) {
      let score = 0
      
      // Volume score
      const volumeValue = parseFloat(market.volume.replace(/[^0-9.]/g, '')) || 0
      if (volumeValue > 1000000) score += 30
      else if (volumeValue > 500000) score += 25
      else if (volumeValue > 100000) score += 20
      else if (volumeValue > 50000) score += 15
      else score += 5
      
      // Participation score
      if (market.participants > 200) score += 25
      else if (market.participants > 150) score += 20
      else if (market.participants > 100) score += 15
      else if (market.participants > 50) score += 10
      else score += 3
      
      // Price balance score
      const priceBalance = Math.abs(market.yesPrice - market.noPrice)
      if (priceBalance < 0.1) score += 20
      else if (priceBalance < 0.2) score += 15
      else if (priceBalance < 0.4) score += 10
      else if (priceBalance < 0.6) score += 5
      else score += 0
      
      // Time to settlement score
      const settlementDate = new Date(market.deadline)
      const now = new Date()
      const daysToSettlement = Math.ceil((settlementDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysToSettlement > 60) score += 25
      else if (daysToSettlement > 30) score += 20
      else if (daysToSettlement > 14) score += 15
      else if (daysToSettlement > 7) score += 10
      else if (daysToSettlement > 1) score += 5
      else score += 0
      
      totalScore += Math.min(100, Math.max(0, score))
    }
    
    return Math.round(totalScore / marketValues.length)
  }
  
  const overallHealth = calculateOverallHealth()
  
  // Get current market conditions
  const getMarketConditions = () => {
    const marketValues = Object.values(markets)
    const totalVolume = marketValues.reduce((sum, market) => {
      return sum + (parseFloat(market.volume.replace(/[^0-9.]/g, '')) || 0)
    }, 0)
    
    const totalParticipants = marketValues.reduce((sum, market) => sum + market.participants, 0)
    const avgParticipants = Math.round(totalParticipants / marketValues.length)
    
    // Check for markets close to settlement
    const now = new Date()
    const urgentMarkets = marketValues.filter(market => {
      const settlementDate = new Date(market.deadline)
      const daysToSettlement = Math.ceil((settlementDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysToSettlement <= 7
    }).length
    
    return {
      totalVolume: totalVolume / 1000000, // Convert to millions
      avgParticipants,
      urgentMarkets,
      totalMarkets: marketValues.length
    }
  }
  
  const conditions = getMarketConditions()
  
  // Get recommendation
  const getRecommendation = () => {
    if (overallHealth >= 80) return { 
      level: "excellent", 
      text: "Excellent trading conditions", 
      color: "text-green-600", 
      icon: CheckCircle,
      advice: "Multiple markets with high liquidity and good time horizons"
    }
    if (overallHealth >= 65) return { 
      level: "good", 
      text: "Good trading opportunities", 
      color: "text-green-500", 
      icon: CheckCircle,
      advice: "Favorable conditions across most markets"
    }
    if (overallHealth >= 50) return { 
      level: "fair", 
      text: "Mixed market conditions", 
      color: "text-yellow-600", 
      icon: AlertTriangle,
      advice: "Some markets offer better opportunities than others"
    }
    if (overallHealth >= 35) return { 
      level: "poor", 
      text: "Challenging conditions", 
      color: "text-orange-600", 
      icon: AlertTriangle,
      advice: "Consider waiting for better market conditions"
    }
    return { 
      level: "very-poor", 
      text: "Not recommended", 
      color: "text-red-600", 
      icon: XCircle,
      advice: "Low liquidity and poor timing across markets"
    }
  }
  
  const recommendation = getRecommendation()
  const Icon = recommendation.icon
  
  return (
    <Card className={`border-l-4 ${
      overallHealth >= 80 ? 'border-l-green-500' :
      overallHealth >= 65 ? 'border-l-green-400' :
      overallHealth >= 50 ? 'border-l-yellow-500' :
      overallHealth >= 35 ? 'border-l-orange-500' :
      'border-l-red-500'
    } ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className={`w-5 h-5 ${recommendation.color}`} />
            Market Timing
          </CardTitle>
          <Badge variant={
            overallHealth >= 80 ? "default" :
            overallHealth >= 65 ? "secondary" :
            overallHealth >= 50 ? "outline" :
            "destructive"
          }>
            {overallHealth}/100
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
            <span className="text-sm font-medium">Market Health</span>
            <span className="text-sm text-muted-foreground">{overallHealth}%</span>
          </div>
          <Progress value={overallHealth} className="h-3" />
        </div>
        
        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Volume</p>
                <p className="text-xs text-muted-foreground">${conditions.totalVolume.toFixed(1)}M</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium">Avg. Traders</p>
                <p className="text-xs text-muted-foreground">{conditions.avgParticipants}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Advice */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">{recommendation.advice}</p>
        </div>
        
        {/* Warnings */}
        {conditions.urgentMarkets > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-2">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {conditions.urgentMarkets} market{conditions.urgentMarkets > 1 ? 's' : ''} settling within 7 days
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Consider timing risk for short-term positions
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}