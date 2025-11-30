'use client'

import { useUser } from '@clerk/nextjs'
import { redirect, useSearchParams } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, Bell, DollarSign, Sprout, LineChart, Users, Award, FileText, Database, BarChart3 } from 'lucide-react'
import { useEffect } from 'react'
import { useUserType } from '@/components/user-type-provider'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { userType, setUserType } = useUserType()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/sign-in')
    }
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    // Set user type from URL if provided
    const typeParam = searchParams.get('type')
    if (typeParam && (typeParam === 'farmer' || typeParam === 'trader' || typeParam === 'coop')) {
      setUserType(typeParam)
    }
  }, [searchParams, setUserType])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Redirecting to sign in...</div>
  }

  const getWelcomeMessage = () => {
    if (userType === 'farmer') {
      return {
        title: `Welcome, ${user.firstName || 'Farmer'}!`,
        subtitle: 'Access crop grades, live prices, and list your harvests on the marketplace.',
        icon: Sprout
      }
    } else if (userType === 'trader') {
      return {
        title: `Welcome, ${user.firstName || 'Trader'}!`,
        subtitle: 'Trade prediction markets and leverage AI insights for better outcomes.',
        icon: LineChart
      }
    } else if (userType === 'coop') {
      return {
        title: `Welcome, ${user.firstName || 'Co-op'}!`,
        subtitle: 'Access price oracles, API documentation, and analytics for better negotiations.',
        icon: Users
      }
    }
    return {
      title: `Welcome back, ${user.firstName || user.emailAddresses[0].emailAddress}!`,
      subtitle: 'Manage your Afrifutures portfolio and track your commodity market positions.',
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
              <p className="text-gray-600 mt-2">
                {welcome.subtitle}
              </p>
            </div>
          </div>
          {!userType && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Select your user type to see personalized features:
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

        {/* Personalized Quick Actions */}
        {userType === 'farmer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/grades">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Award className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Crop Grades</CardTitle>
                  <CardDescription>View quality standards for your crops</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/marketplace">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <DollarSign className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Live Prices</CardTitle>
                  <CardDescription>Check current market prices</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/deals/new">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <FileText className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">List Harvest</CardTitle>
                  <CardDescription>List your crops on marketplace</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/insights">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <BarChart3 className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">AI Insights</CardTitle>
                  <CardDescription>Get price predictions & advice</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        )}

        {userType === 'trader' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Link href="/marketplace">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <LineChart className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Prediction Markets</CardTitle>
                  <CardDescription>Trade on price outcomes</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/insights">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <BarChart3 className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">AI Insights</CardTitle>
                  <CardDescription>AI-powered market analysis</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Card className="border-gray-200 hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <Activity className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Trading Dashboard</CardTitle>
                <CardDescription>View your positions & history</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {userType === 'coop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/marketplace">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Activity className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Marketplace</CardTitle>
                  <CardDescription>Browse all markets</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/wheat-maize-markets">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Database className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Wheat & Maize</CardTitle>
                  <CardDescription>Live markets for wheat & maize</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/api-docs">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <FileText className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">API Documentation</CardTitle>
                  <CardDescription>Connect & consume API data</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Card className="border-gray-200 hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>Price trends & data</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats Cards */}
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg mb-2">Market Overview</CardTitle>
                  <CardDescription>
                    View real-time commodity prices across African markets.
                  </CardDescription>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">24</div>
              <div className="text-sm text-gray-500 mt-1">Active Markets</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg mb-2">Your Watchlist</CardTitle>
                  <CardDescription>
                    Track your favorite commodities and price alerts.
                  </CardDescription>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-500 mt-1">Watched Items</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg mb-2">Price Alerts</CardTitle>
                  <CardDescription>
                    Get notified when prices hit your target levels.
                  </CardDescription>
                </div>
                <Bell className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-500 mt-1">Active Alerts</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Recent Market Activity</CardTitle>
            <CardDescription>
              Your trading history and market positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600">
              <p>Market data and activity will be displayed here once connected to live data sources.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}