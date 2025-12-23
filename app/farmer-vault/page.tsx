'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, AlertCircle, CheckCircle2, Loader2, TrendingUp, Wallet, FileText, MapPin, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAccount } from 'wagmi'

interface LotFormData {
  commodityType: string
  quantity: string
  unit: string
  grade: string
  targetPrice: string
  deliveryDate: string
  location: string
  description: string
  warehouseReceipt: File | null
  certifications: File | null
  photos: File[]
}

interface AdvanceOffer {
  totalValue: number
  advanceAmount: number
  fee: number
  netAmount: number
  ltv: number
  oraclePrice: number
}

interface ActiveLot {
  id: string
  commodity: string
  quantity: number
  currentValue: number
  advanceTaken: number
  collateralRatio: number
  healthFactor: number
  status: 'ACTIVE' | 'PENDING_SALE' | 'SOLD'
  createdAt: string
}

export default function FarmerVaultPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<LotFormData>({
    commodityType: '',
    quantity: '',
    unit: 'kg',
    grade: '',
    targetPrice: '',
    deliveryDate: '',
    location: '',
    description: '',
    warehouseReceipt: null,
    certifications: null,
    photos: []
  })
  const [advanceOffer, setAdvanceOffer] = useState<AdvanceOffer | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLots, setActiveLots] = useState<ActiveLot[]>([])
  const [dvcBalance, setDvcBalance] = useState(0)

  // Wallet connections
  const { publicKey: solanaPublicKey, connected: isSolanaConnected } = useWallet()
  const { address: polygonAddress, isConnected: isPolygonConnected } = useAccount()

  const isConnected = isSolanaConnected || isPolygonConnected
  const walletAddress = solanaPublicKey?.toBase58() || polygonAddress

  useEffect(() => {
    if (isConnected) {
      fetchActiveLots()
      fetchDVCBalance()
    }
  }, [isConnected, walletAddress])

  async function fetchActiveLots() {
    try {
      const response = await fetch(`/api/lots?wallet=${walletAddress}`)
      const data = await response.json()
      if (data.success) {
        setActiveLots(data.lots)
      }
    } catch (error) {
      console.error('Failed to fetch lots:', error)
    }
  }

  async function fetchDVCBalance() {
    // TODO: Implement DVC balance fetching
    setDvcBalance(250) // Mock for now
  }

  async function calculateAdvance() {
    if (!formData.commodityType || !formData.quantity || !formData.grade) {
      toast.error('Please fill in commodity type, quantity, and grade')
      return
    }

    setIsCalculating(true)
    try {
      const response = await fetch('/api/lots/calculate-advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: formData.commodityType,
          quantity: parseFloat(formData.quantity),
          grade: formData.grade,
          dvcScore: dvcBalance
        })
      })

      const data = await response.json()
      if (data.success) {
        setAdvanceOffer(data.offer)
        setCurrentStep(3)
      } else {
        toast.error(data.message || 'Failed to calculate advance')
      }
    } catch (error) {
      console.error('Calculate advance error:', error)
      toast.error('Failed to calculate advance offer')
    } finally {
      setIsCalculating(false)
    }
  }

  async function handleAcceptAdvance() {
    setIsSubmitting(true)
    try {
      // Upload files first
      const formDataObj = new FormData()
      if (formData.warehouseReceipt) {
        formDataObj.append('warehouseReceipt', formData.warehouseReceipt)
      }
      if (formData.certifications) {
        formDataObj.append('certifications', formData.certifications)
      }
      formData.photos.forEach((photo, index) => {
        formDataObj.append(`photo${index}`, photo)
      })

      // Add lot data
      formDataObj.append('commodity', formData.commodityType)
      formDataObj.append('quantity', formData.quantity)
      formDataObj.append('unit', formData.unit)
      formDataObj.append('grade', formData.grade)
      formDataObj.append('targetPrice', formData.targetPrice)
      formDataObj.append('deliveryDate', formData.deliveryDate)
      formDataObj.append('location', formData.location)
      formDataObj.append('description', formData.description)
      formDataObj.append('walletAddress', walletAddress || '')

      const response = await fetch('/api/lots', {
        method: 'POST',
        body: formDataObj
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Lot created! Processing advance...')
        
        // Request advance
        const advanceResponse = await fetch(`/api/lots/${data.lotId}/advance`, {
          method: 'POST'
        })

        const advanceData = await advanceResponse.json()
        if (advanceData.success) {
          setCurrentStep(4)
          toast.success(`Advance of ${advanceOffer?.netAmount} USDC approved!`)
          fetchActiveLots()
        } else {
          toast.error('Failed to process advance')
        }
      } else {
        toast.error(data.message || 'Failed to create lot')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit lot')
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setFormData({
      commodityType: '',
      quantity: '',
      unit: 'kg',
      grade: '',
      targetPrice: '',
      deliveryDate: '',
      location: '',
      description: '',
      warehouseReceipt: null,
      certifications: null,
      photos: []
    })
    setAdvanceOffer(null)
    setCurrentStep(1)
  }

  function getHealthColor(healthFactor: number) {
    if (healthFactor >= 150) return 'text-green-600'
    if (healthFactor >= 120) return 'text-yellow-600'
    return 'text-red-600'
  }

  function getHealthBadge(healthFactor: number) {
    if (healthFactor >= 150) return 'default'
    if (healthFactor >= 120) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Farmer Vault</h1>
            <p className="text-muted-foreground">
              List your commodities and get instant USDC liquidity
            </p>
          </div>

          {!isConnected && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <p>Please connect your wallet to access the Farmer Vault</p>
                </div>
              </CardContent>
            </Card>
          )}

          {isConnected && (
            <Tabs defaultValue="add-lot" className="space-y-6">
              <TabsList>
                <TabsTrigger value="add-lot">Add Commodity</TabsTrigger>
                <TabsTrigger value="my-lots">My Lots</TabsTrigger>
              </TabsList>

              {/* Add Lot Tab */}
              <TabsContent value="add-lot">
                <Card>
                  <CardHeader>
                    <CardTitle>List Your Commodity</CardTitle>
                    <CardDescription>
                      Get instant USDC advance backed by your produce
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Indicator */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${currentStep >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          1. Basic Info
                        </span>
                        <span className={`text-sm ${currentStep >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          2. Documents
                        </span>
                        <span className={`text-sm ${currentStep >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          3. Offer
                        </span>
                        <span className={`text-sm ${currentStep >= 4 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          4. Complete
                        </span>
                      </div>
                      <Progress value={(currentStep / 4) * 100} />
                    </div>

                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="commodityType">Commodity Type *</Label>
                            <Select
                              value={formData.commodityType}
                              onValueChange={(value) => setFormData({ ...formData, commodityType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select commodity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="COFFEE">Coffee</SelectItem>
                                <SelectItem value="COCOA">Cocoa</SelectItem>
                                <SelectItem value="MAIZE">Maize</SelectItem>
                                <SelectItem value="WHEAT">Wheat</SelectItem>
                                <SelectItem value="TEA">Tea</SelectItem>
                                <SelectItem value="COTTON">Cotton</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="grade">Grade/Quality *</Label>
                            <Select
                              value={formData.grade}
                              onValueChange={(value) => setFormData({ ...formData, grade: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Grade A (Premium)</SelectItem>
                                <SelectItem value="B">Grade B (Standard)</SelectItem>
                                <SelectItem value="C">Grade C (Economy)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="quantity">Quantity *</Label>
                            <div className="flex gap-2">
                              <Input
                                id="quantity"
                                type="number"
                                placeholder="1000"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                              />
                              <Select
                                value={formData.unit}
                                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="MT">MT</SelectItem>
                                  <SelectItem value="bags">bags</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="deliveryDate">Expected Delivery Date *</Label>
                            <Input
                              id="deliveryDate"
                              type="date"
                              value={formData.deliveryDate}
                              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>

                          <div>
                            <Label htmlFor="location">Location *</Label>
                            <Input
                              id="location"
                              placeholder="e.g., Nairobi, Kenya"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label htmlFor="targetPrice">Target Price (optional)</Label>
                            <Input
                              id="targetPrice"
                              type="number"
                              placeholder="Auto-calculated from oracle"
                              value={formData.targetPrice}
                              onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Additional details about your commodity..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={() => setCurrentStep(2)}
                          disabled={!formData.commodityType || !formData.quantity || !formData.grade}
                          className="w-full"
                        >
                          Next: Upload Documents
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Documents */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <Label>Warehouse Receipt *</Label>
                          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) setFormData({ ...formData, warehouseReceipt: file })
                              }}
                              className="hidden"
                              id="receipt-upload"
                            />
                            <label htmlFor="receipt-upload" className="cursor-pointer">
                              <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {formData.warehouseReceipt
                                  ? formData.warehouseReceipt.name
                                  : 'Click to upload warehouse receipt'}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div>
                          <Label>Certifications (Optional)</Label>
                          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) setFormData({ ...formData, certifications: file })
                              }}
                              className="hidden"
                              id="cert-upload"
                            />
                            <label htmlFor="cert-upload" className="cursor-pointer">
                              <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {formData.certifications
                                  ? formData.certifications.name
                                  : 'Organic, Fair Trade, etc.'}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                            Back
                          </Button>
                          <Button
                            onClick={calculateAdvance}
                            disabled={!formData.warehouseReceipt || isCalculating}
                            className="flex-1"
                          >
                            {isCalculating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Calculate Offer
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Advance Offer */}
                    {currentStep === 3 && advanceOffer && (
                      <div className="space-y-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">Your Instant Liquidity Offer</h3>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Valuation</span>
                              <span className="font-semibold">${advanceOffer.totalValue.toLocaleString()} USDC</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Advance Amount ({advanceOffer.ltv}% LTV)</span>
                              <span className="font-semibold">${advanceOffer.advanceAmount.toLocaleString()} USDC</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Platform Fee (2.5%)</span>
                              <span className="text-red-600">-${advanceOffer.fee.toLocaleString()} USDC</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                              <span className="font-medium">Net to Your Wallet</span>
                              <span className="text-2xl font-bold text-green-600">
                                ${advanceOffer.netAmount.toLocaleString()} USDC
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 text-sm text-muted-foreground">
                            <p>• Oracle Price: ${advanceOffer.oraclePrice}/kg</p>
                            <p>• DVC Boost: {dvcBalance >= 200 ? '+10% advance' : 'Earn 200+ DVCs for higher advance'}</p>
                            <p>• Settlement: When lot sells, remaining value sent to you</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                            Back
                          </Button>
                          <Button
                            onClick={handleAcceptAdvance}
                            disabled={isSubmitting}
                            className="flex-1"
                          >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Accept Advance
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Success */}
                    {currentStep === 4 && (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
                        <h3 className="text-2xl font-bold mb-2">Lot Created Successfully!</h3>
                        <p className="text-muted-foreground mb-6">
                          Your advance of ${advanceOffer?.netAmount.toLocaleString()} USDC is being processed
                        </p>
                        <div className="space-y-2 text-sm text-left max-w-md mx-auto mb-6">
                          <p>✓ Lot listed on marketplace</p>
                          <p>✓ USDC advance queued for transfer</p>
                          <p>✓ +50 DVCs earned for new listing</p>
                        </div>
                        <Button onClick={resetForm}>
                          List Another Commodity
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My Lots Tab */}
              <TabsContent value="my-lots">
                <div className="space-y-4">
                  {/* DVC Balance Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Your DVC Balance</p>
                          <p className="text-3xl font-bold">{dvcBalance} DVCs</p>
                        </div>
                        <Badge variant={dvcBalance >= 200 ? 'default' : 'secondary'}>
                          {dvcBalance >= 200 ? 'Premium Farmer' : 'Standard'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Lots */}
                  {activeLots.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No active lots yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    activeLots.map((lot) => (
                      <Card key={lot.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{lot.commodity}</h3>
                              <p className="text-sm text-muted-foreground">{lot.quantity} kg</p>
                            </div>
                            <Badge variant={lot.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {lot.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Current Value</p>
                              <p className="font-semibold">${lot.currentValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Advance Taken</p>
                              <p className="font-semibold">${lot.advanceTaken.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Collateral Ratio</p>
                              <p className="font-semibold">{lot.collateralRatio}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Health Factor</p>
                              <p className={`font-semibold ${getHealthColor(lot.healthFactor)}`}>
                                {lot.healthFactor}%
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Health Status</span>
                              <Badge variant={getHealthBadge(lot.healthFactor)}>
                                {lot.healthFactor >= 150 ? 'Healthy' : lot.healthFactor >= 120 ? 'Warning' : 'At Risk'}
                              </Badge>
                            </div>
                            <Progress
                              value={Math.min(lot.healthFactor, 200) / 2}
                              className={lot.healthFactor < 120 ? 'bg-red-200' : ''}
                            />
                          </div>

                          {lot.healthFactor < 150 && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                              <p className="text-sm text-amber-800">
                                {lot.healthFactor < 120
                                  ? '⚠️ Low health factor! Add collateral within 24h to avoid liquidation'
                                  : 'Consider adding collateral to improve health factor'}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              Add Collateral
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
