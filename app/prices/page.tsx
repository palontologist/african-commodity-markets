'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import Link from 'next/link'
import { AppHeader } from '@/components/app-header'

interface CommodityCard {
  id: string
  name: string
  icon: string
  price: number
  change: number
  up: boolean
  source: string
  grade?: string
}

const COMMODITIES = ['COFFEE', 'WHEAT', 'MAIZE']

const ICONS: Record<string, string> = {
  COFFEE: '☕',
  WHEAT: '🌾',
  MAIZE: '🌽',
}

const NAMES: Record<string, string> = {
  COFFEE: 'Coffee',
  WHEAT: 'Wheat',
  MAIZE: 'Maize',
}

export default function PricesPage() {
  const [commodities, setCommodities] = useState<CommodityCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/live-prices?symbols=COFFEE,WHEAT,MAIZE&region=AFRICA')
        const data = await res.json()
        if (data.success) {
          const items = (data.data || []).map((item: any) => ({
            id: item.commodity.toLowerCase(),
            name: NAMES[item.commodity] || item.commodity,
            icon: ICONS[item.commodity] || '📦',
            price: item.price,
            change: item.change || 0,
            up: (item.change || 0) >= 0,
            source: item.source || 'Unknown',
            grade: item.quality || undefined,
          }))
          setCommodities(items)
        }
      } catch (err) {
        console.error('Failed to fetch prices:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrices()
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />
      
      <div className="px-4 pt-12 pb-8">
        <div className="container mx-auto max-w-2xl">
          <Badge className="mb-4 bg-[#FE5102]/10 text-[#FE5102] hover:bg-[#FE5102]/20 border-[#FE5102]/20">
            <Activity className="w-3 h-3 mr-1" />
            Live Markets
          </Badge>
          <h1 className="text-3xl font-bold text-[#E8E8E8] mb-2">African Commodities</h1>
          <p className="text-[#9CA3AF]">Real-time price data from African exchanges</p>
        </div>
      </div>

      <div className="px-4 pb-12">
        <div className="container mx-auto max-w-2xl space-y-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#141414] border-[#2C2C2C]">
                  <CardContent className="p-8 animate-pulse">
                    <div className="h-8 w-48 bg-[#252525] rounded mb-4" />
                    <div className="h-10 w-32 bg-[#252525] rounded" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            commodities.map((commodity) => (
              <Link key={commodity.id} href={`/prices/${commodity.id}`}>
                <Card className="bg-[#141414] border-[#2C2C2C] hover:border-[#FE5102] transition-all cursor-pointer group">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{commodity.icon}</span>
                        <div>
                          <h2 className="text-2xl font-bold text-[#E8E8E8] group-hover:text-[#FE5102] transition-colors">
                            {commodity.name}
                          </h2>
                          {commodity.grade && (
                            <p className="text-[#9CA3AF]">{commodity.grade}</p>
                          )}
                        </div>
                      </div>
                      {commodity.up ? (
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-[#E8E8E8] font-mono">
                          ${commodity.price.toFixed(2)}
                        </span>
                        <span className="text-[#9CA3AF]">/lb</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          commodity.up ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {commodity.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {commodity.change >= 0 ? '+' : ''}{commodity.change.toFixed(2)} this week
                        </div>
                        <span className="text-xs text-[#666]">•</span>
                        <span className="text-xs text-[#666]">{commodity.source}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
