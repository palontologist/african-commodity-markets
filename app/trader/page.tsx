'use client'

import { useState, useEffect } from 'react'
import { useUserProfile } from '@/components/user-profile-provider'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, BarChart3, Target, DollarSign, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TraderDashboard() {
  const { profile, loading } = useUserProfile()
  const router = useRouter()
  const [stats, setStats] = useState({
    activeMarkets: 0,
    totalVolume: 0,
    totalStaked: 0,
    profitLoss: 0,
  })

  useEffect(() => {
    if (!loading && (!profile || !profile.roles.includes('TRADER'))) {
      router.push('/marketplace')
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile || !profile.roles.includes('TRADER')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Trader Dashboard</h1>
              <p className="text-gray-600">
                Create prediction markets and manage your portfolio
              </p>
            </div>
            {profile.kycVerified && (
              <Badge variant="default" className="text-sm">
                ✓ Verified Trader
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMarkets}</div>
              <p className="text-xs text-muted-foreground">Markets created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all markets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalStaked.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Current positions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(stats.profitLoss).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.profitLoss >= 0 ? 'Profit' : 'Loss'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create">Create Market</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="markets">All Markets</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Prediction Market</CardTitle>
                <CardDescription>
                  Create a new prediction market for commodity prices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-6 text-gray-600">
                    Market creation interface coming soon. For now, contact our team to list a new prediction market.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline">
                      Contact Team
                    </Button>
                    <Link href="/marketplace">
                      <Button>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Browse Existing Markets
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Creation Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Market Creation Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-blue-100 p-2 rounded">
                      <Badge className="bg-blue-600">1</Badge>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">KYC Verification</p>
                      <p className="text-sm text-gray-600">
                        {profile.kycVerified ? '✓ Completed' : 'Required to create markets'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-blue-100 p-2 rounded">
                      <Badge className="bg-blue-600">2</Badge>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Collateral Deposit</p>
                      <p className="text-sm text-gray-600">Minimum 1,000 USDC to back market liquidity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-blue-100 p-2 rounded">
                      <Badge className="bg-blue-600">3</Badge>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Market Parameters</p>
                      <p className="text-sm text-gray-600">Commodity, price range, settlement date, oracle source</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Portfolio</CardTitle>
                    <CardDescription>Active positions and performance</CardDescription>
                  </div>
                  <Link href="/settlements">
                    <Button variant="outline" size="sm">
                      View Settlements
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">No active positions yet</p>
                  <Link href="/marketplace">
                    <Button variant="outline">
                      Browse Markets to Stake
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Prediction Markets</CardTitle>
                <CardDescription>
                  Browse and stake on available markets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4 text-gray-600">
                    View all available prediction markets
                  </p>
                  <Link href="/marketplace">
                    <Button>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Markets
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
