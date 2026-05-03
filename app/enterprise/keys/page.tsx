'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppHeader } from "@/components/app-header"
import { Mail, Building2, Users, CheckCircle, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

export default function EnterpriseKeysPage() {
  const { user, isLoaded } = useUser()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
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
                Thanks for your interest! We'll review your request and get back to you within 24 hours.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-[#FE5102] hover:bg-[#FE5102]/90">
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
                <Button variant="outline" asChild className="border-[#2C2C2C] text-[#E8E8E8] hover:bg-[#252525]">
                  <a href="/api-docs">View API Docs</a>
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
            Get real-time Kenya Coffee price data for your organization
          </p>
        </div>

        <Card className="border-[#2C2C2C] bg-[#141414]">
          <CardHeader>
            <CardTitle className="text-[#E8E8E8]">Access Request Form</CardTitle>
            <CardDescription className="text-[#9CA3AF]">
              Fill in your details and we'll get back to you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-[#E8E8E8]">
                  <Building2 className="w-4 h-4 inline mr-1 text-[#FE5102]" />
                  Company / Organization *
                </Label>
                <Input
                  id="companyName"
                  placeholder="Acme Trading Ltd"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-[#E8E8E8]">
                  <Users className="w-4 h-4 inline mr-1 text-[#FE5102]" />
                  Your Name *
                </Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
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
                  placeholder="john@acmetrading.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FE5102] hover:bg-[#FE5102]/90 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  'Submitting...'
                ) : (
                  <>
                    Submit Request <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
