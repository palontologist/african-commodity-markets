'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Globe, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#FE5102]/10 text-[#FE5102] border-[#FE5102]/20">B2B Data API</Badge>
          <h1 className="text-5xl font-bold text-[#E8E8E8] mb-4">
            Kenya Coffee Prices<br />
            <span className="text-[#FE5102]">Your Bloomberg Can't Match</span>
          </h1>
          <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-8">
            Real-time price data for Kenya Coffee sourced directly from KAMIS, UCDA, and national commodity exchanges.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#FE5102] hover:bg-[#FE5102]/90 text-white">
              <Link href="/enterprise/keys">Request Access</Link>
            </Button>
          </div>
        </div>

        {/* Why Use Afrifutures */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="pt-8 pb-8">
              <Globe className="w-12 h-12 text-[#FE5102] mb-4" />
              <h3 className="font-semibold text-xl mb-4 text-[#E8E8E8]">Primary Sources</h3>
              <p className="text-[#9CA3AF] mb-4">
                Direct data from UCDA (Uganda), TCB (Tanzania), and KAMIS (Kenya).<br/>
                No scraped or secondary sources.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="pt-8 pb-8">
              <TrendingUp className="w-12 h-12 text-[#FE5102] mb-4" />
              <h3 className="font-semibold text-xl mb-4 text-[#E8E8E8]">Risk Analytics</h3>
              <p className="text-[#9CA3AF]">
                Volatility indices, trend signals, and confidence scores for better risk assessment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8 text-[#E8E8E8]">African Exchange Network</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="border border-[#2C2C2C] rounded-lg p-6 bg-[#141414]">
              <div className="text-xl font-bold text-[#E8E8E8]">UCDA</div>
              <div className="text-sm text-[#9CA3AF] mt-1">Uganda</div>
              <div className="text-xs text-[#666] mt-1">Coffee Prices</div>
            </div>
            <div className="border border-[#2C2C2C] rounded-lg p-6 bg-[#141414]">
              <div className="text-xl font-bold text-[#E8E8E8]">TCB</div>
              <div className="text-sm text-[#9CA3AF] mt-1">Tanzania</div>
              <div className="text-xs text-[#666] mt-1">Coffee Prices</div>
            </div>
            <div className="border border-[#FE5102] rounded-lg p-6 bg-[#1C1C1C]">
              <div className="text-xl font-bold text-[#FE5102]">KAMIS</div>
              <div className="text-sm text-[#9CA3AF] mt-1">Kenya</div>
              <div className="text-xs text-[#666] mt-1">Coffee Prices</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#E8E8E8]">Ready to get started?</h2>
          <p className="text-[#9CA3AF] mb-6">
            Request access and our team will personally help you get started with Kenya Coffee price data.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#FE5102] hover:bg-[#FE5102]/90 text-white">
              <Link href="/enterprise/keys">
                Request Access
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
