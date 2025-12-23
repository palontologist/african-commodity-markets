'use client'

import { useState, useEffect } from 'react'
import { useUserProfile } from '@/components/user-profile-provider'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sprout, Package, TrendingUp, Award, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function FarmerDashboard() {
  const { profile, loading } = useUserProfile()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCommodities: 0,
    activeListings: 0,
    totalValueLocked: 0,
    pendingSettlements: 0,
  })

  useEffect(() => {
    if (!loading && (!profile || !profile.roles.includes('FARMER'))) {
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

  if (!profile || !profile.roles.includes('FARMER')) {
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
              <h1 className="text-3xl font-bold mb-2">Farmer Dashboard</h1>
              <p className="text-gray-600">
                Manage your commodities and unlock instant USDC advances
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                <Award className="h-3 w-3 mr-1" />
                DVC Score: {profile.dvcScore || 0}
              </Badge>
              {profile.kycVerified && (
                <Badge variant="default" className="text-sm">
                  ✓ Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commodities</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommodities}</div>
              <p className="text-xs text-muted-foreground">Listed on platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeListings}</div>
              <p className="text-xs text-muted-foreground">Currently available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValueLocked.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">In USDC advances</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settlements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingSettlements}</div>
              <p className="text-xs text-muted-foreground">Pending resolution</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="commodities" className="space-y-6">
          <TabsList>
            <TabsTrigger value="commodities">My Commodities</TabsTrigger>
            <TabsTrigger value="markets">Prediction Markets</TabsTrigger>
            <TabsTrigger value="rewards">DVC Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="commodities" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Commodities</CardTitle>
                    <CardDescription>
                      List commodities to get instant USDC advances
                    </CardDescription>
                  </div>
                  <Link href="/farmer-vault">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Commodity
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Sprout className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">No commodities listed yet</p>
                  <Link href="/farmer-vault">
                    <Button variant="outline">
                      List Your First Commodity
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Markets</CardTitle>
                <CardDescription>
                  Stake on commodity price predictions or hedge your production risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4 text-gray-600">
                    View and participate in prediction markets
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

          <TabsContent value="rewards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Digital Verifiable Credentials (DVC)</CardTitle>
                <CardDescription>
                  Build your reputation score to unlock better advance rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current DVC Score */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Your DVC Score</h3>
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {profile.dvcScore || 0} Points
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Advance Rate</span>
                        <span className="font-medium">
                          {profile.dvcScore >= 200 ? '70%' : profile.dvcScore >= 100 ? '65%' : '60%'} LTV
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Next Tier</span>
                        <span className="text-gray-600">
                          {profile.dvcScore >= 200 
                            ? 'Maximum tier reached' 
                            : `${profile.dvcScore >= 100 ? '200' : '100'} points (${profile.dvcScore >= 100 ? 200 - profile.dvcScore : 100 - profile.dvcScore} more)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* How to Earn DVC */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">How to Earn DVC Points</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="bg-green-100 p-2 rounded">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">List & Deliver Commodities</p>
                          <p className="text-sm text-gray-600">+50 points per successful delivery</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="bg-blue-100 p-2 rounded">
                          <Award className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Complete KYC Verification</p>
                          <p className="text-sm text-gray-600">+100 points (one-time bonus)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="bg-purple-100 p-2 rounded">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Maintain Good Standing</p>
                          <p className="text-sm text-gray-600">+20 points monthly with no defaults</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!profile.kycVerified && (
                    <Button className="w-full">
                      <Award className="h-4 w-4 mr-2" />
                      Start KYC Verification (+100 DVC)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
