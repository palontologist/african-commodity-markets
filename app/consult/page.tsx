'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppHeader } from "@/components/app-header"
import { Calendar, Phone, Users, TrendingDown, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function ConsultPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    cooperative: '',
    harvest: '',
    phone: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitting(false)
    setSubmitted(true)
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
                Consultation Scheduled
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Thanks for your interest! We'll contact you within 24 hours to discuss price protection for your Nyeri AA Coffee harvest.
              </p>
              <p className="text-sm text-[#9CA3AF] mb-4">
                Founder will personally review your request and call you at:
              </p>
              <p className="font-mono text-[#FE5102]">+254-XXX-XXXX</p>
              <div className="flex gap-3 justify-center mt-6">
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
          <h1 className="text-3xl font-bold text-[#E8E8E8] mb-2">Coffee Price Protection Consultation</h1>
          <p className="text-[#9CA3AF]">
            We help Nyeri AA Coffee farmers lock in prices before market drops
          </p>
        </div>

        {/* How It Works */}
        <Card className="mb-8 bg-[#141414] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-[#E8E8E8] flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#FE5102]" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#FE5102]/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-[#FE5102] text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-[#E8E8E8] font-medium">Tell us your harvest size</p>
                  <p className="text-sm text-[#9CA3AF]">e.g., "I expect 2,000 kg of AA grade coffee"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#FE5102]/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-[#FE5102] text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-[#E8E8E8] font-medium">We find buyers who pay minimums</p>
                  <p className="text-sm text-[#9CA3AF]">Guaranteed minimum price of $3.20/lb</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#FE5102]/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-[#FE5102] text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-[#E8E8E8] font-medium">We protect against price drops</p>
                  <p className="text-sm text-[#9CA3AF]">If market drops below $3.20, we cover the difference</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="border-[#2C2C2C] bg-[#141414]">
          <CardHeader>
            <CardTitle className="text-[#E8E8E8] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FE5102]" />
              Schedule Your Consultation
            </CardTitle>
            <CardDescription className="text-[#9CA3AF]">
              Founder will personally review and contact you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
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
                  <Label htmlFor="cooperative" className="text-[#E8E8E8]">
                    Cooperative Name
                  </Label>
                  <Input
                    id="cooperative"
                    placeholder="Nyeri AA Cooperative"
                    value={formData.cooperative}
                    onChange={(e) => setFormData({...formData, cooperative: e.target.value})}
                    className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvest" className="text-[#E8E8E8]">
                  Expected Harvest
                </Label>
                <Input
                  id="harvest"
                  placeholder="e.g., 2,000 kg of AA grade"
                  value={formData.harvest}
                  onChange={(e) => setFormData({...formData, harvest: e.target.value})}
                  className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                />
                <p className="text-xs text-[#9CA3AF]">Help us size the protection needed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#E8E8E8]">
                  <Phone className="w-4 h-4 inline mr-1 text-[#FE5102]" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+254-XXX-XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E8E8E8]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@cooperative.org"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-[#1C1C1C] border-[#2C2C2C] text-[#E8E8E8] placeholder:text-[#666]"
                />
              </div>

              <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#2C2C2C]">
                <p className="text-sm text-[#9CA3AF] mb-2">
                  <strong className="text-[#E8E8E8]">Service:</strong> 2% of harvest value
                </p>
                <p className="text-sm text-[#9CA3AF]">
                  <strong className="text-[#E8E8E8]">Response:</strong> Founder calls within 24 hours
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
                  'Schedule Consultation (15 min) - No Commitment'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}