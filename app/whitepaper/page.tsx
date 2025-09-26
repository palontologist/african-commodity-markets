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

        {/* How Tokenization Works Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              3. How Tokenization Works on Afrifutures
            </CardTitle>
            <CardDescription>Blockchain-powered commodity trading and community rewards system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Commodity Tokenization</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Each physical batch (grain, oil, metals, etc.) is represented as a unique, traceable digital asset (token/NFT) onchain, recording origin, ownership, value-addition, and certifications.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Platform Utility Token</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Launch of an Afrifutures Token ($AFF), serving as the utility and governance backbone of the marketplace. All user actions (listing, bidding, settlement, trade financing) are facilitated by or rewarded with tokens.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Trade Settlement</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Use of stablecoins (e.g., USDC), local currency-pegged tokens, and $AFF for instant, global settlement—removing delays and FX risk.
                </p>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-foreground mb-4">Liquidity Creation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <h5 className="font-medium text-foreground text-sm mb-2">Fractional Trading</h5>
                    <p className="text-xs text-muted-foreground">
                      Tokenization allows users to trade fractional shares in commodity lots, attracting more buyers and improving secondary market activity.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg bg-purple-50">
                    <h5 className="font-medium text-foreground text-sm mb-2">Market-Making Pools</h5>
                    <p className="text-xs text-muted-foreground">
                      RWA (real world asset) tokens can be staked into DeFi liquidity pools, where users earn yield for providing market liquidity to the marketplace and to institutional or DeFi partners.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg bg-green-50">
                    <h5 className="font-medium text-foreground text-sm mb-2">Trade Finance Access</h5>
                    <p className="text-xs text-muted-foreground">
                      Commodities staked as RWA tokens can be used as collateral for instant trade loans, supplier credit, or insurance, supporting working capital needs for producers and traders.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-foreground mb-4">RWA Staking & Community Rewards</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <h5 className="font-medium text-foreground text-sm mb-2">Stake-and-Earn</h5>
                    <p className="text-xs text-muted-foreground">
                      Users (farmers, traders, community members) can stake $AFF or RWA tokens to earn premium features, yield, or shared trading revenue—aligning interests across the ecosystem.
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <h5 className="font-medium text-foreground text-sm mb-2">Onchain Escrow & Insurance</h5>
                    <p className="text-xs text-muted-foreground">
                      Staked tokens act as escrow, reducing counterparty risk in trades. Community-verified staking allows for group insurance or "risk pools" against weather/logistics loss.
                    </p>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <h5 className="font-medium text-foreground text-sm mb-2">Network Bootstrapping</h5>
                    <p className="text-xs text-muted-foreground">
                      Early power users, partner co-ops, and liquidity providers receive $AFF airdrops and bonding curve incentives to kickstart platform activity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Scope Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. Marketplace Scope</CardTitle>
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
              5. Ideal Customer Profiles (ICP)
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
            <CardTitle>6. Business Model</CardTitle>
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

        {/* Afrifutures Will Win Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              7. Afrifutures Will Win
            </CardTitle>
            <CardDescription>Our competitive advantages in the African commodity market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">1. Regionally Tailored, Multi-Commodity Platform</h4>
                <p className="text-muted-foreground text-sm">
                  Unlike global platforms, Afrifutures is bespoke for African realities—multi-lingual, supports local currencies, and covers oil/metals/agri/niche value chains in one ecosystem. Entry built for rural/mobile-first users and also scalable for international traders/investors.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">2. Direct Access and Disintermediation</h4>
                <p className="text-muted-foreground text-sm">
                  Farmers, co-ops, and domestic traders connect directly with global buyers, banks, and insurers—cutting out costly middlemen. Onchain automation (smart contracts, digital escrow, programmable finance) brings trust and speed.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">3. Instant, Transparent Payments</h4>
                <p className="text-muted-foreground text-sm">
                  Stablecoin/local token settlement allows for near-instant payment—solving one of the biggest pain points for African producers and SMEs.
                </p>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">4. Data & Intelligence as a Differentiator</h4>
                <p className="text-muted-foreground text-sm">
                  Real-time price, weather, risk, and logistics analytics—delivered via dashboards with actionable, localized insights (not global generalities).
                </p>
              </div>
              
              <div className="border-l-4 border-cyan-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">5. Tokenization and Community Ownership</h4>
                <p className="text-muted-foreground text-sm">
                  Commodity and platform tokenization unlocks supply chain liquidity and broadens investment—users can stake, earn, and participate in governance. Early adopters (farm co-ops, traders, fintechs) receive incentives/rewards and become ecosystem champions.
                </p>
              </div>
              
              <div className="border-l-4 border-teal-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">6. ESG and Traceability for Premium Market Access</h4>
                <p className="text-muted-foreground text-sm">
                  Integrated impact and traceability metrics empower African producers to access ESG-driven and premium international markets, not just bulk commodity export.
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-foreground mb-2">7. Ecosystem Partnerships</h4>
                <p className="text-muted-foreground text-sm">
                  APIs and partnerships: Banks, logistics firms, insurance, and data partners plug in easily—Afrifutures becomes the go-to "infrastructure layer" for African commodity digitization.
                </p>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <p className="text-muted-foreground text-sm font-medium text-center">
                  <strong>In short:</strong> Afrifutures focuses on the high-value, export, and digitally ready segment of African commodities, especially where traceability, instant payment, and price efficiency can unlock value. We will win by combining deep regional context, mobile-first access, onchain liquidity, and a tokenized community model with advanced data and an open partner ecosystem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Size Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              8. Market Size for Afrifutures
            </CardTitle>
            <CardDescription>African commodity marketplace & tokenization opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Africa's Total Commodity Market Value</h4>
                  <p className="text-lg font-bold text-blue-600 mb-2">$2.23 trillion in 2025</p>
                  <p className="text-sm text-muted-foreground">
                    Projected to reach US$2.23 trillion in 2025 (energy, metals, agriculture, niche commodities) with a steady annual growth rate (~3.3% CAGR through 2030).
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Active Market Participants</h4>
                  <p className="text-lg font-bold text-green-600 mb-2">500,000+ traders</p>
                  <p className="text-sm text-muted-foreground">
                    Over 500,000 commodity traders in Africa (including farmers, SMEs, brokers, and corporates), with numbers expected to cross 1 million by 2030 as digital platforms expand and entry barriers fall.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Digital Platform Penetration</h4>
                  <p className="text-lg font-bold text-purple-600 mb-2">&lt;10% currently</p>
                  <p className="text-sm text-muted-foreground">
                    Currently, less than 10% of agri/product trades go through formal platforms—multiple millions of smallholder farmers, co-ops, and artisanal miners remain underserved.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Tokenized Real-World Assets (RWA)</h4>
                  <p className="text-lg font-bold text-amber-600 mb-2">$24B → $30T by 2035</p>
                  <p className="text-sm text-muted-foreground">
                    RWA tokenization globally is $24 billion in 2025, expected to reach $1.2 trillion by 2030 and possibly $30 trillion in total by 2035. Commodities make up a fast-growing segment in Africa, LATAM, and Asia.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3 text-center">Summary</h4>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground text-sm">
                  <strong>Afrifutures addresses a market worth $2.23 trillion annually</strong>, serving up to a million African traders and producers in the next few years.
                </p>
                <p className="text-muted-foreground text-sm">
                  The <strong>UNLOCKED and underserved segment</strong> (with digital, onchain penetration still below 10%) means huge upside for first-movers.
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong>By 2030, tokenized commodity trading volume and platform activity could represent tens of billions in Africa alone</strong>, aligning with global trends.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              9. Roadmap
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
            <CardTitle>10. Use Case: "From Farm to Finance, Onchain"</CardTitle>
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
              11. Conclusion
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