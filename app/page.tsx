'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { TrendingUp, ArrowRight, Activity, Phone } from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [price, setPrice] = useState("$3.63")
  const [change, setChange] = useState("+2.1%")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("2 min ago")

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />
      
      {/* Hero - One Product, Simple */}
      <div className="px-4 pt-12 pb-8">
        <div className="container mx-auto max-w-2xl text-center">
          <Badge className="mb-4 bg-[#FE5102]/10 text-[#FE5102] hover:bg-[#FE5102]/20 border-[#FE5102]/20">
            <Activity className="w-3 h-3 mr-1" />
            Live Markets
          </Badge>
          <h1 className="text-5xl font-bold text-[#E8E8E8] mb-3">
            Kenya AA Coffee Price
          </h1>
          <p className="text-xl text-[#9CA3AF]">
            Real-time prices from ECX Nairobi exchange
          </p>
        </div>
      </div>

      {/* Big Price Display */}
      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-[#141414] border-[#2C2C2C] hover:border-[#FE5102] transition-all">
            <CardContent className="p-8 text-center">
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
                Last updated: {lastUpdated}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Two Simple Paths */}
      <div className="px-4 pb-12">
        <div className="container mx-auto max-w-2xl">
          <p className="text-center text-sm text-[#9CA3AF] mb-6 uppercase tracking-wider">
            I'm a
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 border-[#2C2C2C] hover:border-[#FE5102] bg-[#141414] group"
              onClick={() => {
                localStorage.setItem('userType', 'farmer')
                window.location.href = '/consult'
              }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#FE5102]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FE5102]/20 transition-colors">
                  <Phone className="w-6 h-6 text-[#FE5102]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#E8E8E8]">Farmer</h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Schedule a call about price protection for your coffee
                </p>
                <div className="flex items-center text-[#FE5102] text-sm font-medium">
                  Schedule Consultation <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 border-[#2C2C2C] hover:border-[#FE5102] bg-[#141414] group"
              onClick={() => {
                localStorage.setItem('userType', 'trader')
                window.location.href = '/enterprise/keys'
              }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#FE5102]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FE5102]/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-[#FE5102]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#E8E8E8]">Trader/Buyer</h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Request real-time price data API access
                </p>
                <div className="flex items-center text-[#FE5102] text-sm font-medium">
                  Request Access <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
