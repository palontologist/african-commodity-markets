'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Code, Database, Link as LinkIcon, BookOpen, Terminal, Copy, Check } from "lucide-react"
import { useState } from "react"

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language = 'bash', id }: { code: string; language?: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">API Documentation</h1>
      <p className="text-gray-600 mt-2">
        Connect and consume real-time commodity price data for African commodities including wheat, maize, coffee, cocoa, and more
      </p>
            </div>
          </div>
        </div>

         {/* Quick Start */}
         <Card className="mb-8 border-primary/20 bg-primary/5">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Terminal className="w-5 h-5" />
               Quick Start
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-gray-700 mb-4">
               Get started with our API in minutes. All endpoints are publicly accessible for GET requests.
             </p>
             <CodeBlock
               id="quickstart"
               code={`curl "https://your-domain.com/api/live-prices?symbols=COFFEE,COCOA,WHEAT,MAIZE"`}
             />
           </CardContent>
         </Card>

        {/* Base URL */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
            <CardDescription>All API endpoints use this base URL</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              id="baseurl"
              code={`https://your-domain.com/api`}
            />
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-8 mb-12">
          {/* Wheat and Maize Oracle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Wheat & Maize Oracle API</CardTitle>
                  <CardDescription>
                    Real-time and historical price data for wheat and maize flour
                  </CardDescription>
                </div>
                <Badge className="bg-primary">GET /api/oracle/wheat-maize</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Get Current Prices</h3>
                <CodeBlock
                  id="get-prices"
                  code={`curl "https://your-domain.com/api/oracle/wheat-maize"`}
                />
                <p className="text-sm text-gray-600 mt-2">Returns current prices for both wheat and maize</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Get Specific Commodity</h3>
                <CodeBlock
                  id="get-wheat"
                  code={`curl "https://your-domain.com/api/oracle/wheat-maize?commodity=WHEAT"`}
                />
                <p className="text-sm text-gray-600 mt-2">Filter by WHEAT or MAIZE</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Get Historical Data</h3>
                <CodeBlock
                  id="get-historical"
                  code={`curl "https://your-domain.com/api/oracle/wheat-maize?historical=true"`}
                />
                <p className="text-sm text-gray-600 mt-2">Retrieve historical price data from database</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Example Response</h3>
                <CodeBlock
                  id="response"
                  language="json"
                  code={`{
  "success": true,
  "data": [
    {
      "commodity": "WHEAT",
      "price": 285.50,
      "currency": "USD",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge"
    },
    {
      "commodity": "MAIZE",
      "price": 225.75,
      "currency": "USD",
      "timestamp": "2025-11-16T14:30:00.000Z",
      "source": "Tridge"
    }
  ],
  "timestamp": "2025-11-16T14:30:00.000Z",
  "sources": ["Alpha Vantage", "Tridge", "World Bank", "Fallback"]
}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Live Prices API */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Live Prices API</CardTitle>
                  <CardDescription>
                    Get real-time prices for any commodity
                  </CardDescription>
                </div>
                <Badge className="bg-primary">GET /api/live-prices</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Get Single Commodity</h3>
                <CodeBlock
                  id="live-single"
                  code={`curl "https://your-domain.com/api/live-prices?symbol=WHEAT&region=AFRICA"`}
                />
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Get Multiple Commodities</h3>
                <CodeBlock
                  id="live-multiple"
                  code={`curl "https://your-domain.com/api/live-prices?symbols=WHEAT,MAIZE,COFFEE"`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Integration Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Integration Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">JavaScript/TypeScript</h3>
                <CodeBlock
                  id="js-example"
                  language="typescript"
                  code={`// Fetch wheat and maize prices
const response = await fetch('/api/oracle/wheat-maize')
const data = await response.json()

data.data.forEach(item => {
  console.log(\`\${item.commodity}: \${item.price} \${item.currency}\`)
})`}
                />
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Python</h3>
                <CodeBlock
                  id="python-example"
                  language="python"
                  code={`import requests

# Fetch wheat and maize prices
response = requests.get('https://your-domain.com/api/oracle/wheat-maize')
data = response.json()

for item in data['data']:
    print(f"{item['commodity']}: {item['price']} {item['currency']}")`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Data Sources</CardTitle>
              <CardDescription>
                The API automatically falls back through multiple sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Alpha Vantage</p>
                    <p className="text-sm text-gray-600">Real-time commodity prices (if API key configured)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Tridge.com</p>
                    <p className="text-sm text-gray-600">Kenya-specific market prices for wheat and maize</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">World Bank Pink Sheet</p>
                    <p className="text-sm text-gray-600">Monthly commodity price data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Fallback Prices</p>
                    <p className="text-sm text-gray-600">Static prices when all sources fail</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise B2B API */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Enterprise B2B API</CardTitle>
                <CardDescription>
                  Professional-grade commodity prices and risk analytics for finance companies
                </CardDescription>
              </div>
              <Badge className="bg-green-600">$500/month</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Get Prices with Risk Analytics</h3>
              <CodeBlock
                id="b2b-prices"
                code={`curl "https://your-domain.com/api/b2b/prices?symbols=COFFEE,COCOA" \\
  -H "X-API-Key: afr_your_api_key_here"`}
              />
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Response includes</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Current price with confidence score</li>
                <li>Volatility index (annualized)</li>
                <li>Trend signal (BULLISH/BEARISH/SIDEWAYS)</li>
                <li>Risk signal (BUY/SELL/HOLD)</li>
                <li>7-day and 30-day price changes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Example Response</h3>
              <CodeBlock
                id="b2b-response"
                language="json"
                code={`{
  "success": true,
  "tier": "PREMIUM",
  "data": {
    "region": "AFRICA",
    "prices": [
      {
        "symbol": "COFFEE",
        "success": true,
        "price": { "current": 3.65, "currency": "USD", "source": "KAMIS" },
        "risk": {
          "volatility": 0.28,
          "volatilityLabel": "MODERATE",
          "confidenceScore": 0.75,
          "confidenceLabel": "HIGH",
          "trend": "BULLISH",
          "trendStrength": 0.65,
          "shortTermChange": 0.032,
          "mediumTermChange": 0.087,
          "riskSignal": "BUY",
          "narrative": "Coffee prices showing bullish momentum..."
        }
      }
    ]
  },
  "quota": { "used": 150, "limit": 100000, "remaining": 99850 }
}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tiers */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Pricing Plans</CardTitle>
            <CardDescription>
              Choose the plan that fits your data needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Free</h4>
                <p className="text-2xl font-bold mt-2">$0</p>
                <p className="text-sm text-gray-500">10k requests/mo</p>
                <ul className="text-sm mt-4 space-y-2">
                  <li>Basic prices</li>
                  <li>100/hr rate limit</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Basic</h4>
                <p className="text-2xl font-bold mt-2">$150</p>
                <p className="text-sm text-gray-500">50k requests/mo</p>
                <ul className="text-sm mt-4 space-y-2">
                  <li>Full prices</li>
                  <li>Risk analytics</li>
                  <li>1k/hr rate limit</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4 border-primary">
                <h4 className="font-semibold">Premium</h4>
                <p className="text-2xl font-bold mt-2">$500</p>
                <p className="text-sm text-gray-500">100k requests/mo</p>
                <ul className="text-sm mt-4 space-y-2">
                  <li>All commodities</li>
                  <li>Risk analytics</li>
                  <li>Historical data</li>
                  <li>5k/hr rate limit</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Enterprise</h4>
                <p className="text-2xl font-bold mt-2">Custom</p>
                <p className="text-sm text-gray-500">Unlimited</p>
                <ul className="text-sm mt-4 space-y-2">
                  <li>Dedicated support</li>
                  <li>SLA guarantee</li>
                  <li>Custom endpoints</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supported Commodities */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Supported Commodities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {['COFFEE', 'COCOA', 'COTTON', 'CASHEW', 'RUBBER', 'GOLD', 'TEA', 'AVOCADO', 'MACADAMIA', 'WHEAT', 'MAIZE', 'SUNFLOWER', 'COPPER'].map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20 mt-8">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Integrate?</h3>
            <p className="text-gray-600 mb-6">
              Get reliable East African commodity data your Bloomberg can't match
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <a href="/api/b2b/prices?apiKey=afr_demo">Try Demo</a>
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary">
                <a href="/enterprise/keys">Request Access</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

