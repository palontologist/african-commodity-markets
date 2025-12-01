'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppHeader } from "@/components/app-header"
import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewDealPage() {
  const router = useRouter()
  // Auth temporarily disabled; allow listing without sign-in
  const isSignedIn = true
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    dealType: 'COMMODITY',
    description: '',
    category: '',
    quantity: '',
    unit: '',
    askingPrice: '',
    currency: 'USD',
    location: '',
    settlementTerms: '',
    paymentMethod: 'USDC',
    contactEmail: '',
    contactPhone: '',
  })

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Sign in required</h2>
              <p className="text-muted-foreground mb-6">
                You need to be signed in to list a deal
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: formData.quantity ? parseFloat(formData.quantity) : null,
          askingPrice: parseFloat(formData.askingPrice),
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/deals/${data.deal.id}`)
      } else {
        alert(data.error || 'Failed to create deal')
      }
    } catch (error) {
      console.error('Error creating deal:', error)
      alert('Failed to create deal')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/deals">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </Link>
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              List a New Deal
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill in the details to list your commodity, property, or equipment
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Deal Information</CardTitle>
                <CardDescription>
                  Provide accurate details to attract potential buyers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Premium Grade AA Coffee - 50 MT"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>

                {/* Deal Type */}
                <div className="space-y-2">
                  <Label htmlFor="dealType">Deal Type *</Label>
                  <Select value={formData.dealType} onValueChange={(value) => handleChange('dealType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMMODITY">Commodity</SelectItem>
                      <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                      <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your deal in detail..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Arabica Coffee, Agricultural Land"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  />
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      placeholder="50"
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="MT, kg, acres"
                      value={formData.unit}
                      onChange={(e) => handleChange('unit', e.target.value)}
                    />
                  </div>
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="askingPrice">Asking Price *</Label>
                    <Input
                      id="askingPrice"
                      type="number"
                      step="0.01"
                      placeholder="10000"
                      value={formData.askingPrice}
                      onChange={(e) => handleChange('askingPrice', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="GHS">GHS</SelectItem>
                        <SelectItem value="ZAR">ZAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Nairobi, Kenya"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>

                {/* Settlement Terms */}
                <div className="space-y-2">
                  <Label htmlFor="settlementTerms">Settlement Terms</Label>
                  <Textarea
                    id="settlementTerms"
                    placeholder="Payment terms, delivery conditions, etc."
                    rows={3}
                    value={formData.settlementTerms}
                    onChange={(e) => handleChange('settlementTerms', e.target.value)}
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleChange('paymentMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC (Crypto)</SelectItem>
                      <SelectItem value="M-PESA">M-PESA</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" asChild className="flex-1">
                    <Link href="/deals">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'List Deal'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  )
}
