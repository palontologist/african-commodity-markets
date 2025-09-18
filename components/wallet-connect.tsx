'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ExternalLink } from 'lucide-react'

const walletOptions = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using MetaMask browser extension',
    isAvailable: typeof window !== 'undefined' && window.ethereum,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '📱',
    description: 'Connect using mobile wallet or QR code',
    isAvailable: true,
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔷',
    description: 'Connect using Coinbase Wallet',
    isAvailable: true,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Connect using Phantom wallet (Solana)',
    isAvailable: true,
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Connect using Trust Wallet',
    isAvailable: true,
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Connect using Rainbow wallet',
    isAvailable: true,
  },
]

interface WalletConnectProps {
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function WalletConnect({ children, variant = 'default', size = 'default' }: WalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

  const handleConnect = async (walletId: string) => {
    setIsConnecting(walletId)
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For demo purposes, we'll just set the wallet as connected
    setConnectedWallet(walletId)
    setIsConnecting(null)
    setIsOpen(false)
    
    // In a real implementation, you would integrate with actual wallet SDKs here
    console.log(`Connecting to ${walletId}...`)
  }

  const handleDisconnect = () => {
    setConnectedWallet(null)
  }

  if (connectedWallet) {
    const wallet = walletOptions.find(w => w.id === connectedWallet)
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
          <span>{wallet?.icon}</span>
          <span>{wallet?.name}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={variant} size={size}>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect and start trading
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {walletOptions.map((wallet) => (
            <Card 
              key={wallet.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !wallet.isAvailable ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => wallet.isAvailable && handleConnect(wallet.id)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium">{wallet.name}</h3>
                  <p className="text-sm text-muted-foreground">{wallet.description}</p>
                </div>
                {isConnecting === wallet.id ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : wallet.isAvailable ? (
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">Not available</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center mt-4">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}