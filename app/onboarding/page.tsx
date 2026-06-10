'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sprout, Briefcase, Building2 } from 'lucide-react'

const roles = [
  { id: 'farmer', label: 'Farmer', icon: Sprout, desc: 'View prices and protect your harvest' },
  { id: 'trader', label: 'Trader', icon: Briefcase, desc: 'Access real-time market data and API' },
  { id: 'cooperative', label: 'Cooperative', icon: Building2, desc: 'Manage bulk pricing for your members' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()

  async function completeOnboarding(role: string) {
    localStorage.setItem('userType', role)
    document.cookie = 'onboarding_completed=true; path=/; max-age=31536000; SameSite=Lax'
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#E8E8E8] mb-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-[#9CA3AF]">Choose how you&apos;ll use Afrifutures</p>
        </div>
        <div className="space-y-3">
          {roles.map((role) => (
            <Card
              key={role.id}
              className="bg-[#141414] border-[#2C2C2C] hover:border-[#FE5102] transition-all cursor-pointer group"
              onClick={() => completeOnboarding(role.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <role.icon className="w-10 h-10 text-[#FE5102]" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#E8E8E8] group-hover:text-[#FE5102] transition-colors">
                      {role.label}
                    </h3>
                    <p className="text-sm text-[#9CA3AF]">{role.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
