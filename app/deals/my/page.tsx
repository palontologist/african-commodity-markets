'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Package, Plus, Eye, MapPin, Edit } from "lucide-react"
import Link from "next/link"

interface Deal {
  id: number
  title: string
  dealType: string
  description: string
  askingPrice: number
  currency: string
  location: string
  status: string
  viewCount: number
  createdAt: string
}

export default function MyDealsPage() {
  // Auth temporarily disabled; treat user as signed in for now
  const isSignedIn = true
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      fetchMyDeals()
    }
  }, [isSignedIn])

  async function fetchMyDeals() {
    try {
      setLoading(true)
      const response = await fetch('/api/deals?my=true')
      const data = await response.json()
      
      if (data.success) {
        setDeals(data.deals)
      }
    } catch (error) {
      console.error('Error fetching my deals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Sign in required</h2>
              <p className="text-muted-foreground mb-6">
                You need to be signed in to view your deals
              </p>
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              My Deals
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your listed deals and track inquiries
            </p>
          </div>
          
          <Button asChild>
            <Link href="/deals/new">
              <Plus className="w-4 h-4 mr-2" />
              List a New Deal
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Total Deals</div>
              <div className="text-2xl font-bold">
                {deals.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-green-600">
                {deals.filter(d => d.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Total Views</div>
              <div className="text-2xl font-bold">
                {deals.reduce((sum, d) => sum + d.viewCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Avg Price</div>
              <div className="text-2xl font-bold">
                ${deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + d.askingPrice, 0) / deals.length).toLocaleString() : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No deals yet</h3>
              <p className="text-muted-foreground mb-6">
                List your first deal to get started
              </p>
              <Button asChild>
                <Link href="/deals/new">
                  <Plus className="w-4 h-4 mr-2" />
                  List a Deal
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {deal.dealType.replace('_', ' ')}
                        </Badge>
                        <Badge variant={deal.status === 'ACTIVE' ? 'default' : 'outline'}>
                          {deal.status}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{deal.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {deal.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {deal.viewCount} views
                        </div>
                        {deal.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {deal.location}
                          </div>
                        )}
                        <div>
                          Listed {new Date(deal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-4">
                        {deal.currency} {deal.askingPrice.toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/deals/${deal.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
