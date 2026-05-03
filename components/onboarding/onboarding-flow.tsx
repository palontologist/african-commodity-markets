'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Sprout, 
  LineChart, 
  Users, 
  Building2,
  ArrowRight,
  Check
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const ROLES = [
  { 
    id: 'farmer', 
    name: 'Farmer', 
    icon: Sprout,
    description: 'I grow crops and want price protection',
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  { 
    id: 'trader', 
    name: 'Trader', 
    icon: LineChart,
    description: 'I trade commodities and need price data',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  { 
    id: 'cooperative', 
    name: 'Cooperative', 
    icon: Users,
    description: 'I manage a farmer cooperative',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  },
  { 
    id: 'enterprise', 
    name: 'Enterprise', 
    icon: Building2,
    description: 'I need API access and risk analytics',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  },
]

export function OnboardingFlow() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem('user_type', selectedRole)
      localStorage.setItem('onboarding', JSON.stringify({ completed: true, role: selectedRole }))
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 1 of 1</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-full" />
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Afrifutures
              </h1>
              <p className="text-gray-600">
                What best describes you?
              </p>
            </div>

            <div className="grid gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon
                const isSelected = selectedRole === role.id
                
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : role.color
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-primary text-white' : 'bg-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{role.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 space-y-3">
              <Button 
                className="w-full" 
                disabled={!selectedRole}
                onClick={handleContinue}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-gray-500"
                onClick={() => {
                  localStorage.setItem('user_type', 'trader')
                  router.push('/dashboard')
                }}
              >
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
