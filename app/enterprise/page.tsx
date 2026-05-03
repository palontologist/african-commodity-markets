'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { BarChart3, Shield, Zap, Globe, MapPin, ArrowRight, Check, Building2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const PLANS = [
  {
    name: 'Basic',
    price: 150,
    period: 'month',
    description: 'For small teams',
    features: [
      '50,000 requests/month',
      'Kenya Coffee data',
      'Email support',
    ],
    cta: 'Request Access',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: 500,
    period: 'month',
    description: 'For finance companies',
    features: [
      '100,000 requests/month',
      'Kenya Coffee data',
      'Historical data',
      'Priority support',
    ],
    cta: 'Get Premium',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'custom',
    description: 'For large organizations',
    features: [
      'Unlimited requests',
      'Dedicated support',
      'SLA guarantee',
      'Custom endpoints',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

const AFRICA_SOURCES = [
  { name: 'UCDA', country: 'Uganda', url: 'ugandacoffee.go.ug', commodity: 'Coffee' },
  { name: 'TCB', country: 'Tanzania', url: 'coffee.go.tz', commodity: 'Coffee' },
  { name: 'KAMIS', country: 'Kenya', url: 'kamis.kilimo.go.ke', commodity: 'Coffee' },
]

export default function EnterprisePage() {
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState<any>(null)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/b2b/africa?country=ALL')
        const data = await res.json()
        setPrices(data)
      } catch (e) {
        console.error('Failed to fetch prices:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchPrices()
  }, [])

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
              <Link href="/api-docs">View Documentation</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-[#2C2C2C] text-[#E8E8E8] hover:bg-[#252525]">
              <Link href="/enterprise/keys">Request Access</Link>
            </Button>
          </div>
        </div>

        {/* Live Demo */}
        <Card className="mb-16 bg-[#141414] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#E8E8E8]">
              <Zap className="w-5 h-5 text-[#FE5102]" />
              Live Kenya Coffee Prices
            </CardTitle>
            <CardDescription className="text-[#9CA3AF]">Real-time data from our exchange network</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-[#9CA3AF]">Loading...</div>
            ) : prices?.success ? (
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(prices.data)
                  .filter(([k]) => k !== 'summary')
                  .map(([key, country]: [string, any]) => (
                    <div key={key} className="border border-[#2C2C2C] rounded-lg p-4 bg-[#1C1C1C]">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-[#FE5102]" />
                        <span className="font-semibold text-[#E8E8E8]">{country.country}</span>
                        <Badge variant="outline" className="ml-auto text-xs border-[#2C2C2C] text-[#9CA3AF]">
                          {country.source}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {country.prices?.slice(0, 3).map((p: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-[#9CA3AF]">{p.grade || 'Default'}</span>
                            <span className="font-mono text-[#E8E8E8]">
                              {p.currency} {p.price.toFixed(2)}/{p.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#9CA3AF]">
                Demo temporarily unavailable
              </div>
            )}
          </CardContent>
        </Card>

        {/* Why Us */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="pt-6">
              <Globe className="w-10 h-10 text-[#FE5102] mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-[#E8E8E8]">Primary Sources</h3>
              <p className="text-[#9CA3AF]">
                Data directly from UCDA, TCB, and Kenya KAMIS. 
                Not scraped from secondary sources.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="pt-6">
              <BarChart3 className="w-10 h-10 text-[#FE5102] mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-[#E8E8E8]">Risk Analytics</h3>
              <p className="text-[#9CA3AF]">
                Volatility indices, confidence scores, trend signals, and risk narratives 
                built into every response.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2C2C2C]">
            <CardContent className="pt-6">
              <Shield className="w-10 h-10 text-[#FE5102] mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-[#E8E8E8]">Enterprise Grade</h3>
              <p className="text-[#9CA3AF]">
                99.9% uptime SLA, usage tracking, rate limiting, and 
                dedicated support for paid plans.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources - Africa */}
        <Card className="mb-8 bg-[#141414] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-[#E8E8E8]">African Data Sources</CardTitle>
            <CardDescription className="text-[#9CA3AF]">Direct connections to African commodity exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AFRICA_SOURCES.map((source: any) => (
                <div key={source.name} className="border border-[#2C2C2C] rounded-lg p-4 bg-[#1C1C1C]">
                  <div className="font-semibold text-[#E8E8E8]">{source.name}</div>
                  <div className="text-sm text-[#9CA3AF]">{source.country}</div>
                  <div className="text-xs text-[#666]">{source.commodity}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#E8E8E8]">Pricing Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={`bg-[#141414] border-[#2C2C2C] ${plan.highlighted ? 'border-[#FE5102] border-2' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-[#E8E8E8]">{plan.name}</CardTitle>
                  <CardDescription className="text-[#9CA3AF]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {plan.price === null ? (
                      <span className="text-3xl font-bold text-[#E8E8E8]">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-[#E8E8E8]">${plan.price}</span>
                        <span className="text-[#9CA3AF]">/{plan.period}</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                        <Check className="w-4 h-4 text-[#FE5102]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    asChild 
                    className={`w-full ${plan.highlighted ? 'bg-[#FE5102] hover:bg-[#FE5102]/90 text-white' : 'border-[#2C2C2C] text-[#E8E8E8] hover:bg-[#252525]'}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    <Link href="/enterprise/keys">
                      Request Access
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison with Bloomberg */}
        <Card className="bg-[#141414] border-[#2C2C2C] mb-16">
          <CardContent className="pt-8 pb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-[#9CA3AF]">
                  <Building2 className="w-5 h-5" />
                  Bloomberg Terminal
                </h3>
                <ul className="space-y-2 text-[#9CA3AF]">
                  <li>$24,000/year</li>
                  <li>No East African coffee data</li>
                  <li>Limited to major exchanges</li>
                  <li>No risk analytics</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-[#FE5102]">
                  <TrendingUp className="w-5 h-5" />
                  Afrifutures B2B API
                </h3>
                <ul className="space-y-2 text-[#9CA3AF]">
                  <li>$500/month (Premium)</li>
                  <li>KAMIS, UCDA, TCB</li>
                  <li>Primary exchange data</li>
                  <li>Volatility & risk signals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#E8E8E8]">Ready to get started?</h2>
          <p className="text-[#9CA3AF] mb-6">
            Request access and our team will set you up with the right plan for your needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#FE5102] hover:bg-[#FE5102]/90 text-white">
              <Link href="/enterprise/keys">
                Request Access
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
