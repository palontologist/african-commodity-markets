'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppHeader } from "@/components/app-header"
import { Mail, Building2, Users, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

export default function EnterpriseKeysPage() {
  const { user, isLoaded } = useUser()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
  })

  // Pre-fill email if user is signed in
  useEffect(() => {
    if (user?.primaryEmailAddress) {
      setFormData(prev => ({
        ...prev,
        email: user.primaryEmailAddress?.emailAddress || ''
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // In production, this would send to your backend/CRM
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitting(false)
    setSubmitted(true)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#9CA3AF]">Loading...</div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AppHeader />
        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="border-[#2C2C2C] bg-[#141414]">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#FE5102]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-[#FE5102]" />
              </div>
              <h2 className="text-2xl font-bold text-[#E8E8E8] mb-2">
                Request Received
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Thanks for your interest! We'll review your request and call you within 24 hours to personally help you get started with Kenya Coffee price data.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-[#FE5102] hover:bg-[#FE5102]/90 text-white">
                  <a href="/">Return to Homepage</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#E8E8E8] mb-2">Request API Access</h1>
          <p className="text-[#9CA3AF]">
            Real-time Kenya Coffee price data for your organization
          </p>
        </div>

        <Card className="border-[#2C2C2C] bg-[#141414]">
          <CardHeader>
            <CardTitle className="text-[#E8E8E8]">Contact Us</CardTitle>
            <CardDescription className="text-[#9CA3AF]">
              We personally review every request and call you within 24 hours to help you find the right solution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#E8E8E8]">
                  <Users className="w-4 h-4 inline mr-1 text-[#FE5102]" />
                  Your Name *
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-[#E8E8E8]">
                  <Building2 className="w-4 h-4 inline mr-1 text-[#FE5102]" />
                  Company / Organization *
                </Label>
                <Input
                  id="company"
                  placeholder="Trading Company Ltd"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E8E8E8]">
                  <Mail className="w-4 h-4 inline mr-1 text-[#FE5102]" />
                  Business Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                />
              </div>

              <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#2C2C2C]">
                <p className="text-sm text-[#9CA3AF]">
                  <strong className="text-[#E8E8E8]">Founder</strong> personally reviews each request
                </p>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  <strong className="text-[#E8E8E8]">Response time:</strong> 24 hours
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FE5102] hover:bg-[#FE5102]/90 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  'Submitting...'
                ) : (
                  'Submit Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
