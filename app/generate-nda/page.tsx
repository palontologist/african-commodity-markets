'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NDAFormData {
  disclosingPartyName: string
  disclosingPartyAddress: string
  receivingPartyName: string
  receivingPartyAddress: string
  date: string
  purpose: string
}

export default function GenerateNDAPage() {
  const [formData, setFormData] = useState<NDAFormData>({
    disclosingPartyName: '',
    disclosingPartyAddress: '',
    receivingPartyName: '',
    receivingPartyAddress: '',
    date: new Date().toISOString().split('T')[0],
    purpose: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'docx'>('docx')

  const handleInputChange = (field: keyof NDAFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerateDocument = async () => {
    // Validate form
    if (!formData.disclosingPartyName || !formData.disclosingPartyAddress ||
        !formData.receivingPartyName || !formData.receivingPartyAddress ||
        !formData.date || !formData.purpose) {
      toast.error('Please fill in all fields')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nda',
          format,
          data: {
            disclosingParty: {
              name: formData.disclosingPartyName,
              address: formData.disclosingPartyAddress,
            },
            receivingParty: {
              name: formData.receivingPartyName,
              address: formData.receivingPartyAddress,
            },
            date: new Date(formData.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            purpose: formData.purpose,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate document')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NDA-${formData.disclosingPartyName.replace(/\s+/g, '_')}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Document generated successfully!')
    } catch (error) {
      console.error('Error generating document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate document')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Generate NDA</h1>
            <p className="text-muted-foreground">
              Create a Non-Disclosure Agreement for your business transactions
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>NDA Details</CardTitle>
              <CardDescription>
                Fill in the information below to generate your NDA document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date */}
              <div>
                <Label htmlFor="date">Agreement Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              {/* Disclosing Party Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Disclosing Party</h3>
                
                <div>
                  <Label htmlFor="disclosingPartyName">Full Name *</Label>
                  <Input
                    id="disclosingPartyName"
                    placeholder="e.g., Julia Wilkes"
                    value={formData.disclosingPartyName}
                    onChange={(e) => handleInputChange('disclosingPartyName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="disclosingPartyAddress">Address *</Label>
                  <Input
                    id="disclosingPartyAddress"
                    placeholder="e.g., HU6 7RX"
                    value={formData.disclosingPartyAddress}
                    onChange={(e) => handleInputChange('disclosingPartyAddress', e.target.value)}
                  />
                </div>
              </div>

              {/* Receiving Party Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Receiving Party</h3>
                
                <div>
                  <Label htmlFor="receivingPartyName">Full Name *</Label>
                  <Input
                    id="receivingPartyName"
                    placeholder="e.g., George Karani"
                    value={formData.receivingPartyName}
                    onChange={(e) => handleInputChange('receivingPartyName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="receivingPartyAddress">Address *</Label>
                  <Input
                    id="receivingPartyAddress"
                    placeholder="e.g., 00100"
                    value={formData.receivingPartyAddress}
                    onChange={(e) => handleInputChange('receivingPartyAddress', e.target.value)}
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="border-t pt-4">
                <Label htmlFor="purpose">Purpose of Agreement *</Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g., potential partnership in agricultural commodity trading"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Describe the business opportunity or reason for this NDA
                </p>
              </div>

              {/* Format Selection */}
              <div className="border-t pt-4">
                <Label>Document Format</Label>
                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormat('docx')}
                    className={`flex-1 py-3 px-4 border rounded-lg transition-colors ${
                      format === 'docx'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1" />
                    <div className="font-medium">DOCX</div>
                    <div className="text-xs text-muted-foreground">Editable Word document</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('pdf')}
                    className={`flex-1 py-3 px-4 border rounded-lg transition-colors ${
                      format === 'pdf'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1" />
                    <div className="font-medium">PDF</div>
                    <div className="text-xs text-muted-foreground">Print-ready document</div>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleGenerateDocument}
                  disabled={isGenerating}
                  className="flex-1"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate & Download NDA
                    </>
                  )}
                </Button>
              </div>

              {/* Preview Note */}
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Note:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>The document will be downloaded immediately after generation</li>
                  <li>DOCX format allows you to edit the document before signing</li>
                  <li>PDF format is ready for printing and electronic signatures</li>
                  <li>No duplication or repetition in the generated documents</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
