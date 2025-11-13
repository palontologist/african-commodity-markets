'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { ArrowLeft, Eye, Mail, Phone, MapPin, Calendar, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"

interface Deal {
  id: number
  userId: string
  title: string
  dealType: string
  description: string
  category: string | null
  quantity: number | null
  unit: string | null
  askingPrice: number
  currency: string
  location: string | null
  settlementTerms: string | null
  paymentMethod: string | null
  status: string
  viewCount: number
  contactEmail: string | null
  contactPhone: string | null
  createdAt: string
}

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [inquiryData, setInquiryData] = useState({
    inquirerName: '',
    inquirerEmail: '',
    inquirerPhone: '',
    message: '',
    offerAmount: '',
  })

  useEffect(() => {
    fetchDeal()
  }, [params.id])

  async function fetchDeal() {
    try {
      const response = await fetch(`/api/deals/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setDeal(data.deal)
      }
    } catch (error) {
      console.error('Error fetching deal:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/deals/${params.id}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inquiryData,
          offerAmount: inquiryData.offerAmount ? parseFloat(inquiryData.offerAmount) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Inquiry sent successfully!')
        setShowInquiryForm(false)
        setInquiryData({
          inquirerName: '',
          inquirerEmail: '',
          inquirerPhone: '',
          message: '',
          offerAmount: '',
        })
      } else {
        alert(data.error || 'Failed to send inquiry')
      }
    } catch (error) {
      console.error('Error sending inquiry:', error)
      alert('Failed to send inquiry')
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this deal?')) {
      return
    }

    try {
      const response = await fetch(`/api/deals/${params.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        router.push('/deals')
      } else {
        alert(data.error || 'Failed to delete deal')
      }
    } catch (error) {
      console.error('Error deleting deal:', error)
      alert('Failed to delete deal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center">Loading...</p>
        </main>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Deal not found</h2>
              <Button asChild>
                <Link href="/deals">Back to Deals</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const isOwner = userId === deal.userId

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/deals">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Link>
          </Button>

          {/* Deal Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary">{deal.dealType.replace('_', ' ')}</Badge>
                    <Badge variant={deal.status === 'ACTIVE' ? 'default' : 'outline'}>
                      {deal.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{deal.title}</h1>
                  {deal.category && (
                    <p className="text-muted-foreground">{deal.category}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {deal.currency} {deal.askingPrice.toLocaleString()}
                  </div>
                  {deal.quantity && deal.unit && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {deal.quantity} {deal.unit}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(deal.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Actions */}
          {isOwner && (
            <Card className="mb-6 bg-muted">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">This is your listing</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{deal.description}</p>
                </CardContent>
              </Card>

              {/* Settlement Terms */}
              {deal.settlementTerms && (
                <Card>
                  <CardHeader>
                    <CardTitle>Settlement Terms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{deal.settlementTerms}</p>
                  </CardContent>
                </Card>
              )}

              {/* Inquiry Form */}
              {!isOwner && deal.status === 'ACTIVE' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Seller</CardTitle>
                    <CardDescription>
                      Send an inquiry to the seller
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showInquiryForm ? (
                      <Button onClick={() => setShowInquiryForm(true)} className="w-full">
                        Send Inquiry
                      </Button>
                    ) : (
                      <form onSubmit={handleInquiry} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Your Name</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            value={inquiryData.inquirerName}
                            onChange={(e) => setInquiryData({ ...inquiryData, inquirerName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email *</label>
                          <input
                            type="email"
                            required
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            value={inquiryData.inquirerEmail}
                            onChange={(e) => setInquiryData({ ...inquiryData, inquirerEmail: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <input
                            type="tel"
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            value={inquiryData.inquirerPhone}
                            onChange={(e) => setInquiryData({ ...inquiryData, inquirerPhone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Message *</label>
                          <textarea
                            required
                            rows={4}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            value={inquiryData.message}
                            onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Your Offer Amount (Optional)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            value={inquiryData.offerAmount}
                            onChange={(e) => setInquiryData({ ...inquiryData, offerAmount: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowInquiryForm(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button type="submit" className="flex-1">
                            Send Inquiry
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Deal Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deal.paymentMethod && (
                    <div>
                      <div className="text-sm text-muted-foreground">Payment Method</div>
                      <div className="font-medium">{deal.paymentMethod.replace('_', ' ')}</div>
                    </div>
                  )}
                  {deal.contactEmail && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </div>
                      <a href={`mailto:${deal.contactEmail}`} className="text-primary hover:underline">
                        {deal.contactEmail}
                      </a>
                    </div>
                  )}
                  {deal.contactPhone && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone
                      </div>
                      <a href={`tel:${deal.contactPhone}`} className="text-primary hover:underline">
                        {deal.contactPhone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Safety Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Meet in a safe, public location</p>
                  <p>• Verify the quality before payment</p>
                  <p>• Use secure payment methods</p>
                  <p>• Never share sensitive information</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
