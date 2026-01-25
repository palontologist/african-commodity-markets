'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Coffee, 
  Flower2, 
  Leaf, 
  Palmtree, 
  Apple, 
  Nut, 
  Coins, 
  Zap, 
  Sun,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowRight,
  Check,
  Sprout,
  LineChart,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CommodityInterest {
  id: string
  name: string
  icon: any
  selected: boolean
}

const COMMODITY_OPTIONS: CommodityInterest[] = [
  { id: 'coffee', name: 'Coffee', icon: Coffee, selected: false },
  { id: 'cocoa', name: 'Cocoa', icon: Flower2, selected: false },
  { id: 'tea', name: 'Tea', icon: Leaf, selected: false },
  { id: 'cotton', name: 'Cotton', icon: Palmtree, selected: false },
  { id: 'avocado', name: 'Avocado', icon: Apple, selected: false },
  { id: 'macadamia', name: 'Macadamia', icon: Nut, selected: false },
  { id: 'gold', name: 'Gold', icon: Coins, selected: false },
  { id: 'copper', name: 'Copper', icon: Zap, selected: false },
  { id: 'sunflower', name: 'Sunflower', icon: Sun, selected: false },
]

export function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<'farmer' | 'trader' | 'coop' | null>(null)
  const [commodities, setCommodities] = useState<CommodityInterest[]>(COMMODITY_OPTIONS)
  const [preferences, setPreferences] = useState({
    priceAlerts: true,
    aiInsights: true,
    riskSharing: false,
    mobileNotifications: false
  })
  const router = useRouter()

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleCommodityToggle = (id: string) => {
    setCommodities(prev => 
      prev.map(commodity => 
        commodity.id === id 
          ? { ...commodity, selected: !commodity.selected }
          : commodity
      )
    )
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      completeOnboarding()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const completeOnboarding = () => {
    // Save onboarding data to localStorage or backend
    const onboardingData = {
      userType,
      selectedCommodities: commodities.filter(c => c.selected).map(c => c.id),
      preferences,
      completed: true,
      completedAt: new Date().toISOString()
    }
    
    localStorage.setItem('onboarding', JSON.stringify(onboardingData))
    
    // Set cookie for middleware
    document.cookie = 'onboarding_completed=true; path=/; max-age=31536000' // 1 year
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  const skipOnboarding = () => {
    const onboardingData = {
      userType: null,
      selectedCommodities: [],
      preferences: {},
      skipped: true,
      skippedAt: new Date().toISOString()
    }
    
    localStorage.setItem('onboarding', JSON.stringify(onboardingData))
    
    // Set cookie for middleware
    document.cookie = 'onboarding_completed=true; path=/; max-age=31536000' // 1 year
    
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of {totalSteps}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipOnboarding}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip onboarding
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: User Type Selection */}
        {step === 1 && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to African Commodity Markets
              </CardTitle>
              <p className="text-gray-600">
                How do you plan to use our platform?
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    userType === 'farmer' 
                      ? 'border-primary border-2 bg-primary/5' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setUserType('farmer')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Sprout className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Farmer</h3>
                    <p className="text-sm text-gray-600">
                      List crops, get prices, access financing
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    userType === 'trader' 
                      ? 'border-primary border-2 bg-primary/5' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setUserType('trader')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <LineChart className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Trader</h3>
                    <p className="text-sm text-gray-600">
                      Trade commodities, analyze markets
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    userType === 'coop' 
                      ? 'border-primary border-2 bg-primary/5' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setUserType('coop')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Co-operative</h3>
                    <p className="text-sm text-gray-600">
                      Manage members, access analytics
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={skipOnboarding}>
                  Skip
                </Button>
                <Button onClick={handleNext} disabled={!userType}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Commodity Interests */}
        {step === 2 && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Select Your Commodities
              </CardTitle>
              <p className="text-gray-600">
                Choose the commodities you're interested in tracking
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commodities.map((commodity) => {
                  const IconComponent = commodity.icon
                  return (
                    <Card 
                      key={commodity.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        commodity.selected 
                          ? 'border-primary border-2 bg-primary/5' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleCommodityToggle(commodity.id)}
                    >
                      <CardContent className="pt-4 pb-3 text-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {commodity.name}
                        </h4>
                        {commodity.selected && (
                          <div className="mt-1">
                            <Check className="w-4 h-4 text-primary mx-auto" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  {commodities.filter(c => c.selected).length} commodities selected
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Customize Your Experience
              </CardTitle>
              <p className="text-gray-600">
                Set your preferences for notifications and insights
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Card className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium text-gray-900">Price Alerts</h4>
                          <p className="text-sm text-gray-600">
                            Get notified when prices hit your targets
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.priceAlerts}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          priceAlerts: e.target.checked
                        }))}
                        className="w-4 h-4 text-primary rounded"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium text-gray-900">AI Insights</h4>
                          <p className="text-sm text-gray-600">
                            Receive AI-powered market analysis
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.aiInsights}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          aiInsights: e.target.checked
                        }))}
                        className="w-4 h-4 text-primary rounded"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium text-gray-900">Risk Sharing</h4>
                          <p className="text-sm text-gray-600">
                            Participate in risk-sharing pools
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.riskSharing}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          riskSharing: e.target.checked
                        }))}
                        className="w-4 h-4 text-primary rounded"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium text-gray-900">Mobile Notifications</h4>
                          <p className="text-sm text-gray-600">
                            Get push notifications on mobile
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.mobileNotifications}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          mobileNotifications: e.target.checked
                        }))}
                        className="w-4 h-4 text-primary rounded"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                You're All Set!
              </CardTitle>
              <p className="text-gray-600">
                Here's a summary of your preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-gray-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">User Type</h4>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {userType === 'farmer' && 'Farmer'}
                      {userType === 'trader' && 'Trader'}
                      {userType === 'coop' && 'Co-operative'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Commodities</h4>
                    <div className="flex flex-wrap gap-1">
                      {commodities.filter(c => c.selected).map((commodity) => (
                        <Badge key={commodity.id} variant="secondary" className="text-xs">
                          {commodity.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-gray-200">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Active Features</h4>
                  <div className="space-y-1">
                    {preferences.priceAlerts && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Price Alerts</span>
                      </div>
                    )}
                    {preferences.aiInsights && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">AI Insights</span>
                      </div>
                    )}
                    {preferences.riskSharing && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Risk Sharing</span>
                      </div>
                    )}
                    {preferences.mobileNotifications && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Mobile Notifications</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Your personalized dashboard is ready
                </p>
                <p className="text-xs text-gray-500">
                  You can change these preferences anytime in your settings
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={completeOnboarding} className="bg-primary hover:bg-primary/90">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}