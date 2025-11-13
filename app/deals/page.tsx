'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Package, TrendingUp, Building2, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"

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

export default function DealsPage() {
  const { isSignedIn } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchDeals()
  }, [filter])

  async function fetchDeals() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'ALL') {
        params.append('type', filter)
      }
      
      const response = await fetch(`/api/deals?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setDeals(data.deals)
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const dealTypes = [
    { value: 'ALL', label: 'All Deals', icon: Package },
    { value: 'COMMODITY', label: 'Commodities', icon: TrendingUp },
    { value: 'REAL_ESTATE', label: 'Real Estate', icon: Building2 },
    { value: 'EQUIPMENT', label: 'Equipment', icon: Package },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Marketplace Deals
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse and list commodity deals, real estate, and equipment
            </p>
          </div>
          
          {isSignedIn && (
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/deals/my">
                  My Deals
                </Link>
              </Button>
              <Button asChild>
                <Link href="/deals/new">
                  <Plus className="w-4 h-4 mr-2" />
                  List a Deal
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {dealTypes.map((type) => (
            <Button
              key={type.value}
              variant={filter === type.value ? 'default' : 'outline'}
              onClick={() => setFilter(type.value)}
              className="whitespace-nowrap"
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No deals found</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to list a deal in this category
              </p>
              {isSignedIn && (
                <Button asChild>
                  <Link href="/deals/new">
                    <Plus className="w-4 h-4 mr-2" />
                    List a Deal
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">
                      {deal.dealType.replace('_', ' ')}
                    </Badge>
                    <Badge variant={deal.status === 'ACTIVE' ? 'default' : 'outline'}>
                      {deal.status}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{deal.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {deal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-xl font-bold text-primary">
                        {deal.currency} {deal.askingPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    {deal.location && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{deal.location}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-medium">{deal.viewCount}</span>
                    </div>
                    
                    <Button asChild className="w-full">
                      <Link href={`/deals/${deal.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>For Sellers</CardTitle>
              <CardDescription>
                List your commodities, real estate, or equipment to reach African buyers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Zero listing fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Secure USDC payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Reach verified buyers</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Buyers</CardTitle>
              <CardDescription>
                Discover verified deals from trusted sellers across Africa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Direct seller contact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Transparent pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Secure transactions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Enhanced features for the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">○</span>
                  <span>Escrow services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">○</span>
                  <span>Quality verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">○</span>
                  <span>Logistics integration</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
