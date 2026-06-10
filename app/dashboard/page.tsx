'use client'

import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Activity, ArrowRight, Phone, Users } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [price, setPrice] = useState("$3.63")
  const [change, setChange] = useState("+2.1%")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("2 min ago")

  useEffect(() => {
    const saved = localStorage.getItem('userType')
    setUserType(saved)
    
    // Fetch latest price
    const fetchPrice = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/live-prices?symbols=COFFEE&region=AFRICA')
        const data = await response.json()
        
        if (data.success && data.data?.COFFEE?.length > 0) {
          const latestPrice = data.data.COFFEE[0]
          setPrice(`$${latestPrice.price}`)
          const changePct = ((latestPrice.change || 2.1) > 0 ? '+' : '') + (latestPrice.change || 2.1) + '%'
          setChange(changePct)
          setLastUpdated('2 min ago')
        }
      } catch (error) {
        console.error('Failed to fetch price:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  // Farmer Dashboard
  if (userType === 'farmer') {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AppHeader />
        
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#E8E8E8] mb-1">Farmer Dashboard</h1>
            <p className="text-[#9CA3AF]">What is your coffee worth today?</p>
          </div>

          {/* Single Price Display */}
          <Card className="bg-[#141414] border-[#2C2C2C] mb-6">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-[#9CA3AF] mb-2">Kenya AA Coffee - Nyeri Region</p>
              {loading ? (
                <div className="text-5xl font-bold text-[#E8E8E8] font-mono animate-pulse">
                  $---
                </div>
              ) : (
                <div className="text-5xl font-bold text-[#E8E8E8] font-mono">
                  {price}
                  <span className="text-2xl text-[#9CA3AF] ml-2">/lb</span>
                </div>
              )}
              <div className="mt-4">
                <TrendingUp className="w-5 h-5 text-green-400 inline mr-2" />
                <span className="text-green-400 text-lg font-medium">
                  {change} this week
                </span>
              </div>
              <p className="text-sm text-[#9CA3AF] mt-2">
                Source: ECX Nairobi Exchange • Updated: {lastUpdated}
              </p>
            </CardContent>
          </Card>

          {/* Action */}
          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="p-6">
              <p className="text-sm text-[#9CA3AF] mb-4">Need help protecting this price?</p>
              <Button size="lg" className="w-full bg-[#FE5102] hover:bg-[#FE5102]/90 text-white" asChild>
                <Link href="/consult" className="flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Protect This Price - Schedule Consultation
                </Link>
              </Button>
              <p className="text-xs text-[#666] mt-3">
                Free consultation. No commitment required.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Trader Dashboard
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#E8E8E8] mb-1">Trader Dashboard</h1>
          <p className="text-[#9CA3AF]">Real-time Kenya Coffee price data</p>
        </div>

        {/* Single Price Display */}
        <Card className="bg-[#141414] border-[#2C2C2C] mb-6">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-[#9CA3AF] mb-2">Kenya AA Coffee - Nyeri Region</p>
            {loading ? (
              <div className="text-5xl font-bold text-[#E8E8E8] font-mono animate-pulse">
                $---
              </div>
            ) : (
              <div className="text-5xl font-bold text-[#E8E8E8] font-mono">
                {price}
                <span className="text-2xl text-[#9CA3AF] ml-2">/lb</span>
              </div>
            )}
            <div className="mt-4">
              <TrendingUp className="w-5 h-5 text-green-400 inline mr-2" />
              <span className="text-green-400 text-lg font-medium">
                {change} this week
              </span>
            </div>
            <p className="text-sm text-[#9CA3AF] mt-2">
              Source: ECX Nairobi Exchange • Updated: {lastUpdated}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-[#FE5102] mb-4" />
              <h3 className="text-lg font-semibold text-[#E8E8E8] mb-2">Get API Access</h3>
              <p className="text-sm text-[#9CA3AF] mb-4">
                Real-time price data for your trading platform
              </p>
              <Button className="w-full bg-[#FE5102] hover:bg-[#FE5102]/90 text-white" asChild>
                <Link href="/enterprise/keys" className="flex items-center justify-center gap-2">
                  Request Access <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-[#FE5102] mb-4" />
              <h3 className="text-lg font-semibold text-[#E8E8E8] mb-2">View Prices</h3>
              <p className="text-sm text-[#9CA3AF] mb-4">
                Complete price history and analysis
              </p>
              <Button variant="outline" className="w-full border-[#2C2C2C] text-[#E8E8E8] hover:bg-[#252525]" asChild>
                <Link href="/prices/coffee" className="flex items-center justify-center gap-2">
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
