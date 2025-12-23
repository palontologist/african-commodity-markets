'use client'

import { useState, useEffect } from 'react'
import { useUserProfile } from '@/components/user-profile-provider'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserCheck, Package, Shield, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CooperativeDashboard() {
  const { profile, loading } = useUserProfile()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalMembers: 0,
    verifiedMembers: 0,
    totalCommodities: 0,
    pendingVerifications: 0,
  })

  useEffect(() => {
    if (!loading && (!profile || !profile.roles.includes('COOPERATIVE'))) {
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

  if (!profile || !profile.roles.includes('COOPERATIVE')) {
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
              <h1 className="text-3xl font-bold mb-2">Cooperative Dashboard</h1>
              <p className="text-gray-600">
                Manage your farmer network and verify commodities
              </p>
            </div>
            {profile.kycVerified && (
              <Badge variant="default" className="text-sm">
                ✓ Verified Cooperative
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">Registered farmers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedMembers}</div>
              <p className="text-xs text-muted-foreground">KYC completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commodities</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommodities}</div>
              <p className="text-xs text-muted-foreground">Listed by members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">Need verification</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="commodities">Commodities</TabsTrigger>
            <TabsTrigger value="api">API Access</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Farmer Members</CardTitle>
                    <CardDescription>
                      Manage your cooperative's farmer network
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">No members yet</p>
                  <Button variant="outline">
                    Invite Your First Member
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Member Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Cooperative Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-purple-100 p-2 rounded">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Fast-Track Verification</p>
                      <p className="text-sm text-gray-600">
                        Verify member farmers to help them access instant USDC advances
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-purple-100 p-2 rounded">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Commodity Validation</p>
                      <p className="text-sm text-gray-600">
                        Review and approve commodity listings from your members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-purple-100 p-2 rounded">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Network Analytics</p>
                      <p className="text-sm text-gray-600">
                        Track performance and earnings across your farmer network
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
                <CardDescription>
                  Review and approve member submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">No pending verifications</p>
                  <p className="text-sm text-gray-400">
                    Member submissions will appear here for your review
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commodities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Member Commodities</CardTitle>
                <CardDescription>
                  Commodities listed by your farmer members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">No commodities listed yet</p>
                  <p className="text-sm text-gray-400">
                    Once members list commodities, they'll appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  Integrate Afrifutures data into your systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Enterprise API Access</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Access real-time commodity prices, prediction markets, and member data
                    </p>
                    <div className="flex gap-3">
                      <Link href="/api-docs">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Documentation
                        </Button>
                      </Link>
                      <Button size="sm">
                        Generate API Key
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Available Endpoints</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="font-mono text-sm">/api/commodities</span>
                        <Badge variant="secondary">GET</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="font-mono text-sm">/api/markets</span>
                        <Badge variant="secondary">GET</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="font-mono text-sm">/api/wheat-maize</span>
                        <Badge variant="secondary">GET</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
