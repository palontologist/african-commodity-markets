'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  Settings, 
  Bell,
  Activity,
  DollarSign,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { 
  Coffee, 
  Flower2, 
  Leaf, 
  Palmtree, 
  Apple, 
  Nut, 
  Coins, 
  Zap, 
  Sun 
} from 'lucide-react'
import { type CommoditySymbol } from '@/lib/live-prices'
import Link from 'next/link'

interface WatchlistItem {
  id: string
  name: string
  symbol: CommoditySymbol
  icon: any
  currentPrice: number
  change: number
  changePercent: number
  alertPrice?: number
  alertsEnabled: boolean
  visible: boolean
}

interface AIInsight {
  id: string
  commodity: string
  type: 'price_prediction' | 'risk_alert' | 'opportunity'
  title: string
  description: string
  confidence: number
  timeAgo: string
}

// Mock commodity data with new additions
const COMMODITY_DATA = [
  { id: 'coffee', name: 'Coffee', symbol: 'COFFEE' as CommoditySymbol, icon: Coffee },
  { id: 'cocoa', name: 'Cocoa', symbol: 'COCOA' as CommoditySymbol, icon: Flower2 },
  { id: 'tea', name: 'Tea', symbol: 'TEA' as CommoditySymbol, icon: Leaf },
  { id: 'cotton', name: 'Cotton', symbol: 'COTTON' as CommoditySymbol, icon: Palmtree },
  { id: 'avocado', name: 'Avocado', symbol: 'AVOCADO' as CommoditySymbol, icon: Apple },
  { id: 'macadamia', name: 'Macadamia', symbol: 'MACADAMIA' as CommoditySymbol, icon: Nut },
  { id: 'gold', name: 'Gold', symbol: 'GOLD' as CommoditySymbol, icon: Coins },
  { id: 'copper', name: 'Copper', symbol: 'COPPER' as CommoditySymbol, icon: Zap },
  { id: 'sunflower', name: 'Sunflower', symbol: 'SUNFLOWER' as CommoditySymbol, icon: Sun },
]

export function SellerDashboard() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    {
      id: 'coffee',
      name: 'Coffee',
      symbol: 'COFFEE' as CommoditySymbol,
      icon: Coffee,
      currentPrice: 2.45,
      change: 0.05,
      changePercent: 2.08,
      alertPrice: 2.50,
      alertsEnabled: true,
      visible: true
    },
    {
      id: 'gold',
      name: 'Gold',
      symbol: 'GOLD' as CommoditySymbol,
      icon: Coins,
      currentPrice: 1850.75,
      change: -12.25,
      changePercent: -0.66,
      alertsEnabled: false,
      visible: true
    }
  ])

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      commodity: 'Coffee',
      type: 'price_prediction',
      title: 'Coffee prices expected to rise',
      description: 'Based on weather patterns and harvest forecasts, coffee prices may increase by 8-12% in the next quarter.',
      confidence: 85,
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      commodity: 'Gold',
      type: 'risk_alert',
      title: 'Gold volatility warning',
      description: 'Increased market volatility expected. Consider hedging positions or setting tighter stop-losses.',
      confidence: 72,
      timeAgo: '4 hours ago'
    },
    {
      id: '3',
      commodity: 'Copper',
      type: 'opportunity',
      title: 'Copper demand surge',
      description: 'Industrial demand from renewable energy projects driving copper prices up. Good entry opportunity.',
      confidence: 78,
      timeAgo: '6 hours ago'
    }
  ])

  const [availableCommodities, setAvailableCommodities] = useState(
    COMMODITY_DATA.filter(c => !watchlist.some(w => w.id === c.id))
  )

  const [isCustomizing, setIsCustomizing] = useState(false)
  const [showAddCommodity, setShowAddCommodity] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(item => ({
        ...item,
        currentPrice: item.currentPrice + (Math.random() - 0.5) * item.currentPrice * 0.002,
        change: (Math.random() - 0.5) * item.currentPrice * 0.05,
        changePercent: (Math.random() - 0.5) * 3
      })))
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const addToWatchlist = (commodity: typeof COMMODITY_DATA[0]) => {
    const newItem: WatchlistItem = {
      id: commodity.id,
      name: commodity.name,
      symbol: commodity.symbol,
      icon: commodity.icon,
      currentPrice: Math.random() * 100 + 1,
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 3,
      alertsEnabled: true,
      visible: true
    }

    setWatchlist(prev => [...prev, newItem])
    setAvailableCommodities(prev => prev.filter(c => c.id !== commodity.id))
    setShowAddCommodity(false)
  }

  const removeFromWatchlist = (id: string) => {
    const item = watchlist.find(w => w.id === id)
    if (item) {
      setWatchlist(prev => prev.filter(w => w.id !== id))
      setAvailableCommodities(prev => [...prev, {
        id: item.id,
        name: item.name,
        symbol: item.symbol,
        icon: item.icon
      }])
    }
  }

  const toggleVisibility = (id: string) => {
    setWatchlist(prev => prev.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ))
  }

  const toggleAlerts = (id: string) => {
    setWatchlist(prev => prev.map(item => 
      item.id === id ? { ...item, alertsEnabled: !item.alertsEnabled } : item
    ))
  }

  const updateAlertPrice = (id: string, price: string) => {
    const numPrice = parseFloat(price)
    if (!isNaN(numPrice)) {
      setWatchlist(prev => prev.map(item => 
        item.id === id ? { ...item, alertPrice: numPrice } : item
      ))
    }
  }

  const visibleWatchlist = watchlist.filter(item => item.visible)
  const totalAlertsEnabled = watchlist.filter(item => item.alertsEnabled).length

  return (
    <div className="space-y-6">
      {/* Header with Customization Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Monitor your commodity interests and AI insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isCustomizing ? 'Done' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Watchlist Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{watchlist.length}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalAlertsEnabled}</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Insights</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{aiInsights.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Change</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  +{watchlist.reduce((sum, item) => sum + item.changePercent, 0).toFixed(1)}%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Your Watchlist</CardTitle>
              <CardDescription>
                Real-time prices for your selected commodities
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isCustomizing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddCommodity(!showAddCommodity)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Commodity
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Commodity Section */}
          {showAddCommodity && (
            <Card className="border-dashed border-gray-300 bg-gray-50">
              <CardContent className="pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Add to Watchlist</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableCommodities.map((commodity) => {
                    const IconComponent = commodity.icon
                    return (
                      <Button
                        key={commodity.id}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center gap-2"
                        onClick={() => addToWatchlist(commodity)}
                      >
                        <IconComponent className="w-6 h-6 text-primary" />
                        <span className="text-sm">{commodity.name}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Watchlist Items */}
          {visibleWatchlist.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No commodities in watchlist
              </h3>
              <p className="text-gray-600 mb-4">
                Add commodities to track their prices and set alerts
              </p>
              <Button onClick={() => setShowAddCommodity(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Commodity
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {visibleWatchlist.map((item) => {
                const IconComponent = item.icon
                const isPositive = item.changePercent > 0
                
                return (
                  <Card key={item.id} className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-2xl font-bold text-gray-900">
                              ${item.currentPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isPositive ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`font-semibold ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {item.alertsEnabled && item.alertPrice && (
                            <Badge variant="secondary" className="text-xs">
                              Alert: ${item.alertPrice.toFixed(2)}
                            </Badge>
                          )}
                          
                          {isCustomizing && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleVisibility(item.id)}
                              >
                                <EyeOff className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromWatchlist(item.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/marketplace/${item.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Customization Controls */}
                      {isCustomizing && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                              <Switch
                                checked={item.alertsEnabled}
                                onCheckedChange={() => toggleAlerts(item.id)}
                              />
                              <Label className="text-sm">Enable price alerts</Label>
                            </div>
                            
                            {item.alertsEnabled && (
                              <div className="flex items-center space-x-2">
                                <Label className="text-sm whitespace-nowrap">Alert price:</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.alertPrice || ''}
                                  onChange={(e) => updateAlertPrice(item.id, e.target.value)}
                                  placeholder="Set price"
                                  className="w-24"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">AI Insights</CardTitle>
          <CardDescription>
            AI-powered analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiInsights.map((insight) => (
            <Card key={insight.id} className="border-gray-100">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.commodity}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            insight.type === 'price_prediction' 
                              ? 'bg-blue-100 text-blue-800'
                              : insight.type === 'risk_alert'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {insight.type === 'price_prediction' && 'Prediction'}
                          {insight.type === 'risk_alert' && 'Risk Alert'}
                          {insight.type === 'opportunity' && 'Opportunity'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-500">Confidence:</span>
                          <span className="text-sm font-medium">{insight.confidence}%</span>
                        </div>
                        <span className="text-xs text-gray-400">{insight.timeAgo}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Hidden Items Alert */}
      {isCustomizing && watchlist.some(item => !item.visible) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800">
                {watchlist.filter(item => !item.visible).length} item(s) hidden from view
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}