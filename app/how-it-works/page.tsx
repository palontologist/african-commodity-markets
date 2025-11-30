'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { ArrowLeft, Circle, BarChart3, TrendingUp } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Afrifutures simplifies commodity trading for everyone. See your future, backed by data.
          </p>
        </div>

        {/* Three-Step Visual Flow */}
        <div className="flex items-center justify-center gap-8 mb-16">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Circle className="w-8 h-8 text-primary fill-primary" />
            </div>
            <p className="text-sm font-medium text-gray-700">Connect</p>
          </div>
          
          <div className="flex-1 h-0.5 bg-primary/20 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <div className="flex gap-1">
                <Circle className="w-3 h-3 text-primary fill-primary" />
                <Circle className="w-3 h-3 text-primary fill-primary" />
                <Circle className="w-3 h-3 text-primary fill-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Market</p>
          </div>
          
          <div className="flex-1 h-0.5 bg-primary/20 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-700">Yield</p>
          </div>
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {/* Card 1: Connect Your Wallet */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div>
                  <CardTitle className="text-xl mb-2">Connect Your Wallet</CardTitle>
                  <CardDescription className="text-base">
                    Securely link your crypto wallet to Afrifutures, giving you full control over your assets.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Card 2: Choose a Market */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div>
                  <CardTitle className="text-xl mb-2">Choose a Market</CardTitle>
                  <CardDescription className="text-base">
                    Browse real-world agricultural markets and back a future price outcome with USDC.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Abstract Decorative Shapes */}
        <div className="flex justify-center gap-4 mb-12 opacity-20">
          <div className="w-32 h-32 bg-primary/20 rounded-2xl transform rotate-12"></div>
          <div className="w-24 h-24 bg-accent/20 rounded-full transform -rotate-12"></div>
          <div className="w-28 h-28 bg-primary/20 rounded-lg transform rotate-6"></div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/marketplace">Get Started</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

