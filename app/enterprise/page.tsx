'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Database, Key, BarChart3, Shield, Zap, Globe, MapPin, ArrowRight, Check, DollarSign, Building2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Try before you buy',
    features: [
      '10,000 requests/month',
      'Basic prices',
      '100 requests/hour',
      'Community support',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Basic',
    price: 150,
    period: 'month',
    description: 'For small teams',
    features: [
      '50,000 requests/month',
      'Full price data',
      'Risk analytics',
      '1,000 requests/hour',
      'Email support',
    ],
    cta: 'Get Basic',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: 500,
    period: 'month',
    description: 'For finance companies',
    features: [
      '100,000 requests/month',
      'All commodities',
      'Risk analytics',
      'Historical data',
      'East African sources',
      '5,000 requests/hour',
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
      'On-premise option',
      'Volume discounts',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

const SOURCES = [
  { name: 'ECX', country: 'Ethiopia', url: 'ecx.com.et', commodity: 'Coffee' },
  { name: 'UCDA', country: 'Uganda', url: 'ugandacoffee.go.ug', commodity: 'Coffee' },
  { name: 'TCB', country: 'Tanzania', url: 'coffee.go.tz', commodity: 'Coffee' },
  { name: 'KAMIS', country: 'Kenya', url: 'kamis.kilimo.go.ke', commodity: 'Various' },
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
    <div className="min-h-screen bg-white">
      <AppHeader />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary">B2B Data API</Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            African Commodity Prices<br />
            Your Bloomberg Can't Match
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Real-time price data for East African coffee, cocoa, and agricultural commodities. 
            Source directly from ECX, UCDA, and national commodity exchanges.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary">
              <Link href="/api-docs">View Documentation</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/enterprise/keys">Get API Key</Link>
            </Button>
          </div>
        </div>

        {/* Live Demo */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Live East African Coffee Prices
            </CardTitle>
            <CardDescription>Real-time data from our exchange network</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : prices?.success ? (
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(prices.data)
                  .filter(([k]) => k !== 'summary')
                  .map(([key, country]: [string, any]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">{country.country}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {country.source}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {country.prices?.slice(0, 3).map((p: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-500">{p.grade || 'Default'}</span>
                            <span className="font-mono">
                              {p.currency} {p.price.toFixed(2)}/{p.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Demo temporarily unavailable
              </div>
            )}
          </CardContent>
        </Card>

        {/* Why Us */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardContent className="pt-6">
              <Globe className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Primary Sources</h3>
              <p className="text-gray-600">
                Data directly from Ethiopian ECX, Uganda UCDA, Tanzania TCB, and Kenya KAMIS. 
                Not scraped from secondary sources.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <BarChart3 className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Risk Analytics</h3>
              <p className="text-gray-600">
                Volatility indices, confidence scores, trend signals, and risk narratives 
                built into every response.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Enterprise Grade</h3>
              <p className="text-gray-600">
                99.9% uptime SLA, usage tracking, rate limiting, and 
                dedicated support for paid plans.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Our Data Sources</CardTitle>
            <CardDescription>Direct connections to African commodity exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SOURCES.map((source) => (
                <div key={source.name} className="border rounded-lg p-4">
                  <div className="font-semibold">{source.name}</div>
                  <div className="text-sm text-gray-500">{source.country}</div>
                  <div className="text-xs text-gray-400">{source.commodity}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Pricing Plans</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={plan.highlighted ? 'border-primary border-2' : ''}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {plan.price === null ? (
                      <span className="text-3xl font-bold">Custom</span>
                    ) : plan.price === 0 ? (
                      <span className="text-3xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-gray-500">/{plan.period}</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    asChild 
                    className="w-full" 
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    <Link href="/enterprise/keys">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison with Bloomberg */}
        <Card className="bg-gray-50 mb-16">
          <CardContent className="pt-8 pb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Bloomberg Terminal
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>$24,000/year</li>
                  <li>No East African coffee data</li>
                  <li>Limited to major exchanges</li>
                  <li>No risk analytics</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-primary">
                  <TrendingUp className="w-5 h-5" />
                  Afrifutures B2B API
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>$500/month (Premium)</li>
                  <li>ECX, UCDA, TCB, KAMIS</li>
                  <li>Primary exchange data</li>
                  <li>Volatility & risk signals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6">
            Start with the free tier. No credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary">
              <Link href="/enterprise/keys">
                Get Free API Key
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}