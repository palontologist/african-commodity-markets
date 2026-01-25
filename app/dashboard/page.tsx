'use client'

import { useUser, RedirectToSignIn } from '@clerk/nextjs'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, Bell, DollarSign, Sprout, LineChart, Users, Award, FileText, Database, BarChart3, Coffee, Flower2, Leaf, Palmtree, Apple, Nut, Coins, Zap, Sun, Plus } from 'lucide-react'
import { useEffect, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUserType } from '@/components/user-type-provider'
import { SellerDashboard } from '@/components/dashboard/seller-dashboard'
import Link from 'next/link'

// Force dynamic rendering to avoid static generation issues with useSearchParams
export const dynamic = 'force-dynamic'

// Commodity icon mapping
const COMMODITY_ICONS: Record<string, any> = {
  coffee: Coffee,
  cocoa: Flower2,
  tea: Leaf,
  cotton: Palmtree,
  avocado: Apple,
  macadamia: Nut,
  gold: Coins,
  copper: Zap,
  sunflower: Sun,
}

function DashboardContent() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { userType, setUserType } = useUserType()
  const searchParams = useSearchParams()
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const [commodityPrices, setCommodityPrices] = useState<Record<string, any>>({})
  const [loadingPrices, setLoadingPrices] = useState(true)

  // Load onboarding data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('onboarding')
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          setOnboardingData(parsed)
          // Set user type from onboarding if not already set
          if (parsed.userType && !userType) {
            setUserType(parsed.userType)
          }
        } catch (e) {
          console.error('Failed to parse onboarding data:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Set user type from URL if provided
    const typeParam = searchParams.get('type')
    if (typeParam && (typeParam === 'farmer' || typeParam === 'trader' || typeParam === 'coop')) {
      setUserType(typeParam)
    }
  }, [searchParams, setUserType])

  // Fetch prices for selected commodities
  useEffect(() => {
    async function fetchPrices() {
      if (!onboardingData?.selectedCommodities || onboardingData.selectedCommodities.length === 0) {
        setLoadingPrices(false)
        return
      }

      setLoadingPrices(true)
      const prices: Record<string, any> = {}
      
      for (const commodityId of onboardingData.selectedCommodities) {
        try {
          const symbol = commodityId.toUpperCase()
          const response = await fetch(`/api/live-prices?symbol=${symbol}&region=AFRICA`)
          if (response.ok) {
            const data = await response.json()
            prices[commodityId] = data.data
          }
        } catch (error) {
          console.error(`Failed to fetch price for ${commodityId}:`, error)
        }
      }
      
      setCommodityPrices(prices)
      setLoadingPrices(false)
    }

    fetchPrices()
  }, [onboardingData])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'

  const getWelcomeMessage = () => {
    if (userType === 'farmer') {
      return {
        title: `Welcome back, ${userName}!`,
        subtitle: 'Manage your crops and access live prices',
        icon: Sprout
      }
    } else if (userType === 'trader') {
      return {
        title: `Welcome back, ${userName}!`,
        subtitle: 'Track your commodities and insights',
        icon: LineChart
      }
    } else if (userType === 'coop') {
      return {
        title: `Welcome back, ${userName}!`,
        subtitle: 'Access analytics and API data',
        icon: Users
      }
    }
    return {
      title: `Welcome back, ${userName}!`,
      subtitle: 'Track commodity markets',
      icon: Activity
    }
  }

  const welcome = getWelcomeMessage()
  const WelcomeIcon = welcome.icon

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <WelcomeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {welcome.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {welcome.subtitle}
              </p>
            </div>
          </div>
          {!userType && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Select your profile type:
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setUserType('farmer')}>
                  <Sprout className="w-4 h-4 mr-2" /> Farmer
                </Button>
                <Button size="sm" variant="outline" onClick={() => setUserType('trader')}>
                  <LineChart className="w-4 h-4 mr-2" /> Trader
                </Button>
                <Button size="sm" variant="outline" onClick={() => setUserType('coop')}>
                  <Users className="w-4 h-4 mr-2" /> Co-op
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Seller Dashboard for Farmers */}
        {userType === 'farmer' && (
          <>
            <SellerDashboard />
            
            {/* Show selected commodities prices if available */}
            {onboardingData?.selectedCommodities && onboardingData.selectedCommodities.length > 0 && (
              <Card className="mt-8 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl">Your Commodity Prices</CardTitle>
                  <CardDescription>
                    Live prices for your selected commodities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPrices ? (
                    <p className="text-gray-600">Loading prices...</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {onboardingData.selectedCommodities.map((commodityId: string) => {
                        const IconComponent = COMMODITY_ICONS[commodityId] || Activity
                        const priceData = commodityPrices[commodityId]
                        return (
                          <Card key={commodityId} className="text-center border-gray-200">
                            <CardContent className="pt-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <IconComponent className="w-5 h-5 text-primary" />
                              </div>
                              <p className="text-sm font-medium text-gray-900 capitalize">{commodityId}</p>
                              {priceData ? (
                                <>
                                  <p className="text-lg font-bold text-primary mt-1">
                                    ${priceData.price?.toFixed(2) || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500">{priceData.unit || ''}</p>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500 mt-1">No data</p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {userType === 'trader' && (
          <>
            {/* Show selected commodities prices */}
            {onboardingData?.selectedCommodities && onboardingData.selectedCommodities.length > 0 ? (
              <Card className="mb-8 border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Your Commodity Prices</CardTitle>
                      <CardDescription>
                        Live prices for commodities you're tracking
                      </CardDescription>
                    </div>
                    <Link href="/insights">
                      <Button size="sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Insights
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingPrices ? (
                    <p className="text-gray-600">Loading prices...</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {onboardingData.selectedCommodities.map((commodityId: string) => {
                        const IconComponent = COMMODITY_ICONS[commodityId] || Activity
                        const priceData = commodityPrices[commodityId]
                        return (
                          <Card key={commodityId} className="text-center border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="pt-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <IconComponent className="w-5 h-5 text-primary" />
                              </div>
                              <p className="text-sm font-medium text-gray-900 capitalize">{commodityId}</p>
                              {priceData ? (
                                <>
                                  <p className="text-lg font-bold text-primary mt-1">
                                    ${priceData.price?.toFixed(2) || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500">{priceData.unit || ''}</p>
                                  <Badge variant="outline" className="text-[10px] mt-2">
                                    {priceData.source || 'Live'}
                                  </Badge>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500 mt-1">No data</p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8 border-gray-200 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Complete onboarding to select commodities you want to track
                    </p>
                    <Link href="/onboarding">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Select Commodities
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link href="/">
                <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <LineChart className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Markets</CardTitle>
                    <CardDescription>View all commodity markets</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/insights">
                <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <BarChart3 className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">AI Insights</CardTitle>
                    <CardDescription>AI-powered analysis</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Card className="border-gray-200 hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Activity className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Portfolio</CardTitle>
                  <CardDescription>Your positions & history</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </>
        )}

        {userType === 'coop' && (
          <>
            {onboardingData?.selectedCommodities && onboardingData.selectedCommodities.length > 0 && (
              <Card className="mb-8 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl">Tracked Commodity Prices</CardTitle>
                  <CardDescription>
                    Real-time data for your commodities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPrices ? (
                    <p className="text-gray-600">Loading prices...</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {onboardingData.selectedCommodities.map((commodityId: string) => {
                        const IconComponent = COMMODITY_ICONS[commodityId] || Activity
                        const priceData = commodityPrices[commodityId]
                        return (
                          <Card key={commodityId} className="text-center border-gray-200">
                            <CardContent className="pt-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <IconComponent className="w-5 h-5 text-primary" />
                              </div>
                              <p className="text-sm font-medium text-gray-900 capitalize">{commodityId}</p>
                              {priceData ? (
                                <>
                                  <p className="text-lg font-bold text-primary mt-1">
                                    ${priceData.price?.toFixed(2) || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500">{priceData.unit || ''}</p>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500 mt-1">No data</p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link href="/">
                <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <Activity className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Markets</CardTitle>
                    <CardDescription>Browse all markets</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/wheat-maize-markets">
                <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <Database className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Wheat & Maize</CardTitle>
                    <CardDescription>Live market data</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/api-docs">
                <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <FileText className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">API Docs</CardTitle>
                    <CardDescription>API integration</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Card className="border-gray-200 hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <BarChart3 className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <CardDescription>Price trends</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </>
        )}

        {/* Only show these cards if user hasn't completed onboarding */}
        {(!onboardingData || !onboardingData.completed) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">Get Started</CardTitle>
                    <CardDescription>
                      Complete onboarding to personalize your dashboard
                    </CardDescription>
                  </div>
                  <Activity className="w-8 h-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/onboarding">
                  <Button className="w-full">
                    Start Onboarding
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">Live Markets</CardTitle>
                    <CardDescription>
                      View real-time commodity prices
                    </CardDescription>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    View Markets
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">AI Insights</CardTitle>
                    <CardDescription>
                      Get market analysis
                    </CardDescription>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/insights">
                  <Button variant="outline" className="w-full">
                    View Insights
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}