import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, TrendingUp, Globe, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Afrifutures Whitepaper
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            African Onchain Commodity Marketplace & Data Platform
          </p>
          <Badge variant="secondary" className="mt-4">
            Version 1.0 - Q4 2025
          </Badge>
        </div>

        {/* Summary Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Afrifutures is building Africa's first regionally specialized onchain marketplace and data platform for commodities—empowering producers, traders, processors, and buyers with real-time, transparent, and efficient access across oil, metals, agri-products, and emerging niche commodities. This whitepaper defines the problem, solution, marketplace scope, ideal users (ICP), and a clear business and product roadmap.
            </p>
          </CardContent>
        </Card>

        {/* Market Problem Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. Market Problem</CardTitle>
            <CardDescription>The challenges facing African commodity markets today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Volatility & Margin Compression</h4>
                <p className="text-muted-foreground">
                  African commodity markets, especially oil, metals, and agri, are facing shrinking EBIT due to price swings, fragmented supply chains, and legacy trading processes.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Lack of Transparency</h4>
                <p className="text-muted-foreground">
                  Middlemen, manual contracts, and delayed settlements result in opaque pricing and limited farmer/trader trust.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Access Gaps</h4>
                <p className="text-muted-foreground">
                  Many farmers, co-ops, and SMEs lack direct market access, trade finance, and tools to hedge risk.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Data & Efficiency Deficit</h4>
                <p className="text-muted-foreground">
                  Existing solutions are not tailored to Africa's unique weather/climate, logistics, and local languages/regulations.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Missed Value-Addition</h4>
                <p className="text-muted-foreground">
                  Niche commodities like gum arabic, cocoa, and shea fail to capture premium prices without traceable, value-added links to global buyers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solution Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              2. Afrifutures Solution
            </CardTitle>
            <CardDescription>Our comprehensive approach to transforming African commodity markets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Onchain Marketplace</h4>
                  <p className="text-muted-foreground text-sm">
                    Multi-commodity platform leveraging blockchain for instant, transparent transactions—directly connecting African producers and buyers. Commodity trades, settlements, and contracts handled programmatically (crypto, stablecoins, local currency support).
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Integrated Data & Analytics</h4>
                  <p className="text-muted-foreground text-sm">
                    Localized dashboards for margin optimization, weather/climate risk, logistics status, price movements, and export tracking—delivered in real time and local languages.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Smart Financing & Risk Tools</h4>
                  <p className="text-muted-foreground text-sm">
                    Embedded credit scoring, programmable trade finance, real-time derivatives, weather and logistics insurance—giving access to banked and unbanked users.
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Value-Addition Focus</h4>
                  <p className="text-muted-foreground text-sm">
                    Traceability, impact scoring, ESG compliance baked into sales for niche agri-products—enabling better prices, new global partnerships, and export growth.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Mobile-First, Low-Bandwidth Design</h4>
              <p className="text-muted-foreground text-sm">
                Accessible to rural farmers, agri co-ops, and SMEs as well as large traders and buyers—built for African connectivity realities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Scope Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3. Marketplace Scope</CardTitle>
            <CardDescription>What commodities to launch with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Badge variant="destructive">Tier 1</Badge>
                  Immediate Launch
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Oil & LNG (Nigeria, Angola, Ghana)</li>
                  <li>• Copper, Cobalt, Manganese (DRC, Zambia, Botswana)</li>
                  <li>• Grains (maize, wheat, rice; Nigeria, Kenya, Ethiopia)</li>
                  <li>• Cocoa (Ghana, Ivory Coast, Nigeria)</li>
                  <li>• Gum Arabic (Sudan, Chad, Senegal, Nigeria)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Badge variant="secondary">Tier 2</Badge>
                  Expansion
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Palm Oil (Ghana, Nigeria, Cameroon)</li>
                  <li>• Shea, Baobab, Cashews (West/Central Africa)</li>
                  <li>• Tea & Coffee (Kenya, Ethiopia, Uganda)</li>
                  <li>• Sugar & Cotton (Mozambique, Egypt, Sudan)</li>
                  <li>• Renewables/Carbon Credits (pan-African expansion)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ICP Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              4. Ideal Customer Profiles (ICP)
            </CardTitle>
            <CardDescription>Who we serve across the African commodity value chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Farmer Co-operatives</h4>
                <p className="text-sm text-muted-foreground mb-2">Agri, Cocoa, Gum Arabic, Grains</p>
                <p className="text-xs text-muted-foreground">Seeking direct sales, better prices, instant settlement, visibility.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Commodity Traders</h4>
                <p className="text-sm text-muted-foreground mb-2">Oil, Metals, Grains</p>
                <p className="text-xs text-muted-foreground">Need transparent pricing, risk management, fast trade.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Processors & Refiners</h4>
                <p className="text-sm text-muted-foreground mb-2">Raw Materials</p>
                <p className="text-xs text-muted-foreground">Sourcing traceable raw materials, compliance dashboards.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Institutional Buyers</h4>
                <p className="text-sm text-muted-foreground mb-2">Global Supply Chains</p>
                <p className="text-xs text-muted-foreground">Reliable supply, sustainability info, automated compliance.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Agri-Fintechs & Insurers</h4>
                <p className="text-sm text-muted-foreground mb-2">Financial Services</p>
                <p className="text-xs text-muted-foreground">Instant onboarding, data-driven underwriting, embedded lending.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Development Agencies/NGOs</h4>
                <p className="text-sm text-muted-foreground mb-2">Impact & Development</p>
                <p className="text-xs text-muted-foreground">Trade facilitation, ESG tracking, donor-backed project reporting.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Model Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>5. Business Model</CardTitle>
            <CardDescription>Revenue streams and monetization strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-foreground">Transaction Fees</h4>
                  <p className="text-sm text-muted-foreground">Small % per trade or settlement, flexible for volume/market segment.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-foreground">Premium Analytics/Data</h4>
                  <p className="text-sm text-muted-foreground">Subscription for real-time market insights, risk analytics, climate dashboards.</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-foreground">Value-Addition Tools</h4>
                  <p className="text-sm text-muted-foreground">Extra fees/services for traceability, impact scoring, and ESG compliance verification.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-foreground">Partner APIs</h4>
                  <p className="text-sm text-muted-foreground">SaaS-style integration for finance, insurance, warehousing, logistics platforms.</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-foreground">Token Utilities/Farming</h4>
                  <p className="text-sm text-muted-foreground">Native platform tokens used for staking, voting, and rewards as adoption grows.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-foreground">Education & Support</h4>
                  <p className="text-sm text-muted-foreground">Paid onboarding, training, and tech support for rural partners.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              6. Roadmap
            </CardTitle>
            <CardDescription>Development timeline and key milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Q4 2025</Badge>
                  <h4 className="font-semibold text-foreground">MVP Launch</h4>
                </div>
                <p className="text-muted-foreground text-sm">
                  Oil, Copper, Cocoa, Grains, Gum Arabic; pilot in West/East Africa; mobile/web beta; partner onboarding
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Q1 2026</Badge>
                  <h4 className="font-semibold text-foreground">Agricultural Expansion</h4>
                </div>
                <p className="text-muted-foreground text-sm">
                  Expand to agri-niche goods (Palm, Shea, Tea, Sugar); release programmable finance, trade insurance modules
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Q2 2026</Badge>
                  <h4 className="font-semibold text-foreground">ESG & Analytics</h4>
                </div>
                <p className="text-muted-foreground text-sm">
                  Launch ESG/impact reporting, value-addition services, and multilingual dashboards; integrate carbon/renewable credits
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Q3 2026</Badge>
                  <h4 className="font-semibold text-foreground">Global Expansion</h4>
                </div>
                <p className="text-muted-foreground text-sm">
                  Pan-African expansion; open LATAM/Asia trade bridging; advanced AI-powered analytics modules
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Q4 2026</Badge>
                  <h4 className="font-semibold text-foreground">Platform Maturation</h4>
                </div>
                <p className="text-muted-foreground text-sm">
                  Full partner SDK/APIs, cross-chain and multi-currency support, extensive partner & buyer outreach
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Case Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7. Use Case: "From Farm to Finance, Onchain"</CardTitle>
            <CardDescription>A real-world example of our platform in action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <p className="text-muted-foreground leading-relaxed">
                A cocoa co-op in Nigeria lists their crop batch, gets instant market bids, accepts the highest price via smart contract, and receives stablecoin payout direct to their mobile phone, backed by automated credit scoring. The buyer—a chocolatier in Europe—gets full traceability and impact scoring in their dashboard. A local fintech uses the marketplace data to offer micro-insurance for weather and logistics, directly embedded in the contract.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Conclusion Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              8. Conclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Afrifutures puts <strong>African producers, traders, and buyers at the center of onchain, real-time commodity markets</strong>—delivering efficiency, price discovery, access, and sustainable global trading.
              </p>
              <p className="text-muted-foreground mb-8">
                Join us on the journey to transform African trade: <strong>from volatility and opacity to digital value creation and global connectivity.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/market">Explore Markets</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/compare">Compare Prices</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact/Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Get involved with the Afrifutures platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-semibold text-foreground mb-2">Join the Community</h4>
                <p className="text-sm text-muted-foreground">Connect with other traders and stay updated on developments</p>
              </div>
              <div className="text-center p-4">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-semibold text-foreground mb-2">Partner with Us</h4>
                <p className="text-sm text-muted-foreground">Become an early partner in the African commodity transformation</p>
              </div>
              <div className="text-center p-4">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-semibold text-foreground mb-2">Start Trading</h4>
                <p className="text-sm text-muted-foreground">Experience the future of African commodity markets today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}