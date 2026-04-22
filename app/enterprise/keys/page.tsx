'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppHeader } from "@/components/app-header"
import { Key, Plus, Copy, Trash2, Check, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

export default function EnterpriseKeysPage() {
  const { user, isLoaded } = useUser()
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchKeys()
    }
  }, [isLoaded, user])

  async function fetchKeys() {
    try {
      const res = await fetch('/api/enterprise/api-keys')
      const data = await res.json()
      if (data.success) {
        setKeys(data.keys || [])
      }
    } catch (e) {
      console.error('Failed to fetch keys:', e)
    } finally {
      setLoading(false)
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) return
    
    setCreating(true)
    setError(null)
    setNewKey(null)
    
    try {
      const res = await fetch('/api/enterprise/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          tier: 'FREE',
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        setNewKey(data.key.apiKey)
        fetchKeys()
      } else {
        setError(data.error || 'Failed to create key')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(keyId: number) {
    if (!confirm('Are you sure you want to revoke this API key?')) return
    
    try {
      const res = await fetch(`/api/enterprise/api-keys?keyId=${keyId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchKeys()
      }
    } catch (e) {
      console.error('Failed to revoke key:', e)
    }
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const tierColors: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-800',
    BASIC: 'bg-blue-100 text-blue-800',
    PREMIUM: 'bg-primary/20 text-primary',
    ENTERPRISE: 'bg-purple-100 text-purple-800',
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
              <p className="text-gray-600 mb-4">
                Please sign in to manage your API keys
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-gray-600">
            Manage your B2B API keys for accessing commodity price data
          </p>
        </div>

        {/* Create New Key */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New API Key
            </CardTitle>
            <CardDescription>
              Generate a new API key to access the B2B price data endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production, Development, Testing"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={createKey} 
                  disabled={creating || !newKeyName.trim()}
                >
                  {creating ? 'Creating...' : 'Create Key'}
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 text-red-500 text-sm">{error}</div>
            )}
            
            {newKey && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Check className="w-4 h-4" />
                  API Key Created
                </div>
                <p className="text-sm text-green-600 mb-2">
                  Copy this key now - you won't be able to see it again!
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-white border rounded font-mono text-sm break-all">
                    {newKey}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyKey(newKey)}
                  >
                    {copied === newKey ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Your API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            {keys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No API keys yet. Create one above to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {keys.map((key: any) => (
                  <div 
                    key={key.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{key.name}</span>
                        <Badge className={tierColors[key.tier] || 'bg-gray-100'}>
                          {key.tier}
                        </Badge>
                        {!key.isActive && (
                          <Badge variant="destructive">Revoked</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {key.apiKey} • Created {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                      {key.monthlyQuota && (
                        <div className="text-xs text-gray-400 mt-1">
                          {key.currentUsage || 0} / {key.monthlyQuota} requests used this month
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyKey(key.apiKey.replace(/^afr_/, 'afr_'))}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {key.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeKey(key.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Get all prices</h4>
                <code className="block p-3 bg-gray-900 text-gray-100 rounded text-sm overflow-x-auto">
                  curl "https://your-domain.com/api/b2b/prices?symbols=COFFEE,COCOA" ^
                  -H "X-API-Key: afr_your_key_here"
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Get East African coffee</h4>
                <code className="block p-3 bg-gray-900 text-gray-100 rounded text-sm overflow-x-auto">
                  curl "https://your-domain.com/api/b2b/africa?country=ALL" ^
                  -H "X-API-Key: afr_your_key_here"
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}