'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { TrendingUp, TrendingDown, RefreshCw, Database } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface PriceData {
  commodity: string
  price: number
  currency: string
  timestamp: string
  source: string
  unit?: string
  country?: string
  quality?: string
}

export default function WheatMaizeMarketsPage() {
  const [wheatData, setWheatData] = useState<PriceData | null>(null)
  const [maizeData, setMaizeData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/oracle/wheat-maize')
      const data = await response.json()
      
      if (data.success && data.data) {
        const wheat = data.data.find((item: PriceData) => item.commodity === 'WHEAT')
        const maize = data.data.find((item: PriceData) => item.commodity === 'MAIZE')
        
        setWheatData(wheat || null)
        setMaizeData(maize || null)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Wheat & Maize Markets</h1>
              <p className="text-gray-600">
                Live price data for wheat and maize flour commodities
              </p>
            </div>
            <Button
              onClick={fetchPrices}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Market Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Wheat Market */}
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Wheat</CardTitle>
                  <CardDescription>
                    {wheatData?.country || 'Kenya'} • {wheatData?.quality || 'Standard Grade'}
                  </CardDescription>
                </div>
                <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🌾</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading && !wheatData ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : wheatData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Price</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatPrice(wheatData.price)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      per {wheatData.unit || 'MT'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Source</p>
                      <Badge variant="outline">{wheatData.source}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Updated</p>
                      <p className="text-sm font-medium">{formatTime(wheatData.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maize Market */}
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Maize</CardTitle>
                  <CardDescription>
                    {maizeData?.country || 'Kenya'} • {maizeData?.quality || 'Yellow Maize'}
                  </CardDescription>
                </div>
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🌽</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading && !maizeData ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : maizeData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Price</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatPrice(maizeData.price)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      per {maizeData.unit || 'MT'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Source</p>
                      <Badge variant="outline">{maizeData.source}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Updated</p>
                      <p className="text-sm font-medium">{formatTime(maizeData.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Integration Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              <CardTitle>API Integration</CardTitle>
            </div>
            <CardDescription>
              Integrate live wheat and maize prices into your systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="border-primary text-primary">
                <Link href="/api-docs">View API Documentation</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <a href="/api/oracle/wheat-maize" target="_blank">Test API Endpoint</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

