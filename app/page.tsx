'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { TrendingUp, ArrowRight, Activity } from "lucide-react"
import { useState, useEffect } from "react"

// Simple price ticker showing only Kenya Coffee
function LiveTicker() {
  const [prices] = useState([
    { name: "Kenya Coffee (AA)", price: "$3.63", change: "+2.1%", up: true },
  ])

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
      {prices.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm whitespace-nowrap">
          <span className="font-medium text-[#E8E8E8]">{p.name}</span>
          <span className="font-bold text-[#E8E8E8] font-mono">{p.price}</span>
          <span className={p.up ? "text-green-400" : "text-red-400"}>
            {p.change}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('user_type')
    if (saved) setUserType(saved)
  }, [])

  const selectType = (type: string) => {
    localStorage.setItem('user_type', type)
    setUserType(type)
  }

  // If no user type selected, show selector
  if (!userType) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AppHeader />
        
        {/* Hero */}
        <div className="px-4 pt-12 pb-8">
          <div className="container mx-auto max-w-2xl text-center">
            <Badge className="mb-4 bg-[#FE5102]/10 text-[#FE5102] hover:bg-[#FE5102]/20 border-[#FE5102]/20">
              <Activity className="w-3 h-3 mr-1" />
              Live Markets
            </Badge>
            <h1 className="text-4xl font-bold text-[#E8E8E8] mb-4">
              Kenya Coffee Intelligence
            </h1>
            <p className="text-lg text-[#9CA3AF] mb-2">
              Real-time price data from African markets
            </p>
            <div className="mt-4 text-sm">
              <LiveTicker />
            </div>
          </div>
        </div>

        {/* One Product */}
        <div className="px-4 pb-12">
          <div className="container mx-auto max-w-md">
            <p className="text-center text-sm text-[#9CA3AF] mb-6 uppercase tracking-wider">
              Get Started
            </p>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 border-[#2C2C2C] hover:border-[#FE5102] bg-[#141414] group"
              onClick={() => selectType('trader')}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#FE5102]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FE5102]/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-[#FE5102]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#E8E8E8]">Check Prices</h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Real-time Kenya Coffee prices from African exchanges
                </p>
                <div className="flex items-center text-[#FE5102] text-sm font-medium">
                  View Prices <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // If user type selected, redirect to appropriate view
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4 text-[#E8E8E8]">Welcome back!</h2>
        <p className="text-[#9CA3AF] mb-6">You are viewing as: <span className="font-semibold capitalize text-[#E8E8E8]">{userType}</span></p>
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-[#FE5102] hover:bg-[#FE5102]/90">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => {localStorage.removeItem('user_type'); setUserType(null)}} className="border-[#2C2C2C] text-[#E8E8E8] hover:bg-[#252525]">
            Change Role
          </Button>
        </div>
      </div>
    </div>
  )
}
