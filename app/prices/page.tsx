'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, ArrowRight, Globe } from "lucide-react"
import Link from 'next/link'
import { AppHeader } from '@/components/app-header'

const COMMODITIES = [
  { id: "coffee", name: "Coffee", icon: "☕", grade: "Specialty 84+", price: "$3.63", change: "+2.1%", up: true, region: "AFRICA" },
  { id: "cocoa", name: "Cocoa", icon: "🍫", grade: "Grade I", price: "$8,500", change: "+1.5%", up: true, region: "AFRICA" },
  { id: "tea", name: "Tea", icon: "🍵", grade: "BOP Grade", price: "$3.20", change: "-0.8%", up: false, region: "AFRICA" },
  { id: "cotton", name: "Cotton", icon: "👕", grade: "Grade A", price: "$0.78", change: "+0.3%", up: true, region: "AFRICA" },
  { id: "avocado", name: "Avocado", icon: "🥑", grade: "Grade A", price: "$2.80", change: "+3.2%", up: true, region: "AFRICA" },
  { id: "macadamia", name: "Macadamia", icon: "🌰", grade: "MQA_I", price: "$14.50", change: "+1.1%", up: true, region: "AFRICA" },
  { id: "gold", name: "Gold", icon: "💰", grade: "24K", price: "$2,340", change: "+0.5%", up: true, region: "AFRICA" },
  { id: "copper", name: "Copper", icon: "🔶", grade: "Grade A", price: "$9,200", change: "-1.2%", up: false, region: "AFRICA" },
  { id: "sunflower", name: "Sunflower", icon: "🌻", grade: "Grade A", price: "$980", change: "+0.9%", up: true, region: "AFRICA" },
]

export default function PricesPage() {
  const [region, setRegion] = useState<'AFRICA' | 'LATAM'>('AFRICA')

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />
      
      {/* Header */}
      <div className="px-4 pt-12 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Badge className="mb-4 bg-[#FE5102]/10 text-[#FE5102] hover:bg-[#FE5102]/20 border-[#FE5102]/20">
                <Activity className="w-3 h-3 mr-1" />
                Live Markets
              </Badge>
              <h1 className="text-3xl font-bold text-[#E8E8E8] mb-2">Commodity Prices</h1>
              <p className="text-[#9CA3AF]">Real-time price data from African and Latin American markets</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#9CA3AF]">Region:</span>
              <button
                onClick={() => setRegion('AFRICA')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  region === 'AFRICA' ? 'bg-[#FE5102] text-white' : 'bg-[#1C1C1C] text-[#9CA3AF] hover:bg-[#252525]'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Africa
              </button>
              <button
                onClick={() => setRegion('LATAM')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  region === 'LATAM' ? 'bg-[#FE5102] text-white' : 'bg-[#1C1C1C] text-[#9CA3AF] hover:bg-[#252525]'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Latin America
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commodity Grid */}
      <div className="px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMODITIES.map((commodity) => (
              <Link key={commodity.id} href={`/prices/${commodity.id}?region=${region}`}>
                <Card className="bg-[#141414] border-[#2C2C2C] hover:border-[#FE5102] transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{commodity.icon}</span>
                        <div>
                          <h3 className="font-semibold text-[#E8E8E8] group-hover:text-[#FE5102] transition-colors">
                            {commodity.name}
                          </h3>
                          <p className="text-xs text-[#9CA3AF]">{commodity.grade}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#2C2C2C] group-hover:text-[#FE5102] transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#E8E8E8] font-mono">
                        {commodity.price}
                      </span>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        commodity.up ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className="w-4 h-4" />
                        {commodity.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
