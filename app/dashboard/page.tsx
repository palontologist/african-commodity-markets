'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import PriceChart from '@/components/charts/price-chart'

export default function UnifiedDashboard() {
  const [userType, setUserType] = useState<string>('trader')

  useEffect(() => {
    const saved = localStorage.getItem('user_type')
    if (saved) setUserType(saved)
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="capitalize border-[#FE5102] text-[#FE5102]">
              {userType}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-500 text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-[#E8E8E8] mb-1">Dashboard</h1>
          <p className="text-[#9CA3AF]">Real-time Kenya Coffee prices and market data</p>
        </div>

        {/* Price Chart */}
        <div className="mb-6">
          <PriceChart />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Current Price</p>
                  <p className="text-3xl font-bold text-[#E8E8E8] font-mono">$3.63</p>
                  <p className="text-sm text-green-400 mt-1">+2.1% (24h)</p>
                </div>
                <div className="w-12 h-12 bg-[#FE5102]/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#FE5102]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-[#2C2C2C] flex flex-col justify-center">
            <CardContent className="p-6">
              <p className="text-sm text-[#9CA3AF] mb-3">Actions</p>
              <div className="flex gap-3">
                <Button size="lg" className="bg-[#FE5102] hover:bg-[#FE5102]/90 text-white" asChild>
                  <Link href="/prices" className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-[#2C2C2C] text-[#E8E8E8] hover:bg-[#252525]" asChild>
                  <Link href="/enterprise/keys">
                    API Access
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Info */}
        <Card className="bg-[#141414] border-[#2C2C2C]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#E8E8E8] mb-4">Market Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Grade</p>
                <p className="text-sm font-mono text-[#E8E8E8]">AA</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Origin</p>
                <p className="text-sm font-mono text-[#E8E8E8]">Nyeri, Kenya</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Exchange</p>
                <p className="text-sm font-mono text-[#FE5102]">KAMIS</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Unit</p>
                <p className="text-sm font-mono text-[#E8E8E8]">USD/lb</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
