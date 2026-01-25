'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Link as LinkIcon
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
import { ethers } from 'ethers'
import { getReadContract } from '@/lib/blockchain/polygon-client'
import { formatPrice } from '@/lib/blockchain/polygon-client'

interface OraclePrice {
  commodity: string
  symbol: string
  icon: any
  currentPrice: string
  change: number
  changePercent: number
  lastUpdated: string
  confidence: number
  sources: number
  onChain: boolean
  txHash?: string
}

const COMMODITY_ICONS = {
  coffee: Coffee,
  cocoa: Flower2,
  tea: Leaf,
  cotton: Palmtree,
  avocado: Apple,
  macadamia: Nut,
  gold: Coins,
  copper: Zap,
  sunflower: Sun,
}

export function PriceOracle() {
  const [oraclePrices, setOraclePrices] = useState<OraclePrice[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Mock oracle price data - in production this would come from your price oracle contract
  useEffect(() => {
    const mockPrices: OraclePrice[] = [
      {
        commodity: 'Coffee',
        symbol: 'COFFEE',
        icon: Coffee,
        currentPrice: '$2.45',
        change: 0.05,
        changePercent: 2.08,
        lastUpdated: '2 minutes ago',
        confidence: 95,
        sources: 3,
        onChain: true,
        txHash: '0x1234...5678'
      },
      {
        commodity: 'Gold',
        symbol: 'GOLD',
        icon: Coins,
        currentPrice: '$1,850.75',
        change: -12.25,
        changePercent: -0.66,
        lastUpdated: '1 minute ago',
        confidence: 98,
        sources: 4,
        onChain: true,
        txHash: '0xabcd...efgh'
      },
      {
        commodity: 'Copper',
        symbol: 'COPPER',
        icon: Zap,
        currentPrice: '$3.82',
        change: 0.08,
        changePercent: 2.14,
        lastUpdated: '3 minutes ago',
        confidence: 92,
        sources: 3,
        onChain: true,
        txHash: '0x5678...9abc'
      },
      {
        commodity: 'Sunflower',
        symbol: 'SUNFLOWER',
        icon: Sun,
        currentPrice: '$650.00',
        change: 5.50,
        changePercent: 0.85,
        lastUpdated: '5 minutes ago',
        confidence: 88,
        sources: 2,
        onChain: false,
      }
    ]
    
    setOraclePrices(mockPrices)
    setLastSync(new Date())
  }, [])

  const handleRefreshOracle = async () => {
    setIsUpdating(true)
    
    try {
      // In production, this would call your oracle contract to update prices
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update prices with mock data
      setOraclePrices(prev => prev.map(price => ({
        ...price,
        currentPrice: price.onChain 
          ? `$${(parseFloat(price.currentPrice.replace('$', '').replace(',', '')) + (Math.random() - 0.5) * 0.1).toFixed(2)}`
          : price.currentPrice,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 3,
        lastUpdated: 'Just now',
        onChain: Math.random() > 0.2, // 80% chance of being on-chain
        confidence: Math.floor(Math.random() * 15) + 85 // 85-99%
      })))
      
      setLastSync(new Date())
    } catch (error) {
      console.error('Failed to refresh oracle:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600 bg-green-100'
    if (confidence >= 90) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const onChainPrices = oraclePrices.filter(p => p.onChain)
  const totalConfidence = oraclePrices.length > 0 
    ? oraclePrices.reduce((sum, p) => sum + p.confidence, 0) / oraclePrices.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Price Oracle</h2>
          <p className="text-gray-600 mt-1">
            Blockchain-verified commodity prices from trusted sources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Database className="w-4 h-4" />
            {lastSync && `Last sync: ${lastSync.toLocaleTimeString()}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshOracle}
            disabled={isUpdating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Chain Prices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{onChainPrices.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalConfidence.toFixed(0)}%
                </p>
              </div>
              <Database className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Sources</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {oraclePrices.reduce((sum, p) => sum + p.sources, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Updates</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">288</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Oracle Price List */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Live Oracle Prices</CardTitle>
          <CardDescription>
            Real-time commodity prices with blockchain verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {oraclePrices.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No oracle data available
              </h3>
              <p className="text-gray-600 mb-4">
                Connect to price oracle to start receiving data
              </p>
              <Button onClick={handleRefreshOracle}>
                <Database className="w-4 h-4 mr-2" />
                Connect Oracle
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {oraclePrices.map((price) => {
                const IconComponent = price.icon
                const isPositive = price.changePercent > 0
                
                return (
                  <Card key={price.symbol} className="border-gray-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{price.commodity}</h4>
                              {price.onChain && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  On-Chain
                                </Badge>
                              )}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {price.currentPrice}
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
                              {isPositive ? '+' : ''}{price.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <Badge className={`text-xs ${getConfidenceColor(price.confidence)}`}>
                              {price.confidence}%
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-sm text-gray-600">Sources:</span>
                            <span className="text-sm font-medium">{price.sources}</span>
                          </div>
                          
                          <div className="flex items-center justify-end space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{price.lastUpdated}</span>
                          </div>

                          {price.txHash && (
                            <div className="flex items-center justify-end space-x-1">
                              <LinkIcon className="w-3 h-3 text-gray-400" />
                              <a 
                                href={`https://amoy.polygonscan.com/tx/${price.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View TX
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Oracle Information */}
      <Card className="border-gray-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <Database className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">About Price Oracles</h4>
              <p className="text-sm text-blue-800 mb-3">
                Our price oracles aggregate data from multiple trusted sources and store them on-chain for smart contracts to use. 
                Prices are updated every 5 minutes with confidence scores based on data source reliability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-blue-800">Multi-source validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-blue-800">Tamper-proof storage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-blue-800">Real-time updates</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}