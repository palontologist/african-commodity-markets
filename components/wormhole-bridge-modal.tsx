'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowRightLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { BrowserProvider } from 'ethers'
import { toast } from 'sonner'
import {
  bridgeUSDCPolygonToSolana,
  bridgeAFFPolygonToSolana,
  getWormholeBridgeQuote,
  getVAA,
  estimateBridgeTime,
  type BridgeQuote,
  type BridgeTransaction,
} from '@/lib/blockchain/wormhole-client'

interface WormholeBridgeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultToken?: 'USDC' | 'AFF'
  defaultAmount?: string
}

export function WormholeBridgeModal({
  open,
  onOpenChange,
  defaultToken = 'USDC',
  defaultAmount = '',
}: WormholeBridgeModalProps) {
  const [amount, setAmount] = useState(defaultAmount)
  const [token, setToken] = useState<'USDC' | 'AFF'>(defaultToken)
  const [fromChain, setFromChain] = useState<'polygon' | 'solana'>('polygon')
  const [toChain, setToChain] = useState<'polygon' | 'solana'>('solana')
  const [quote, setQuote] = useState<BridgeQuote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'input' | 'bridging' | 'waiting-vaa' | 'success'>('input')
  const [bridgeTx, setBridgeTx] = useState<BridgeTransaction | null>(null)
  const [vaa, setVAA] = useState<string | null>(null)
  
  // Polygon wallet
  const { address: polygonAddress, isConnected: isPolygonConnected } = useAccount()
  
  // Solana wallet
  const { publicKey: solanaPublicKey, connected: isSolanaConnected } = useWallet()
  const { connection } = useConnection()
  
  const sourceConnected = fromChain === 'polygon' ? isPolygonConnected : isSolanaConnected
  const destConnected = toChain === 'polygon' ? isPolygonConnected : isSolanaConnected
  
  // Load quote when amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      loadQuote()
    }
  }, [amount, fromChain, toChain, token])
  
  async function loadQuote() {
    try {
      const quoteData = await getWormholeBridgeQuote(amount, fromChain, toChain)
      setQuote(quoteData)
    } catch (error) {
      console.error('Failed to load quote:', error)
    }
  }
  
  // Swap from/to chains
  function swapChains() {
    setFromChain(toChain)
    setToChain(fromChain)
  }
  
  async function handleBridge() {
    if (!sourceConnected) {
      toast.error('Please connect your wallet')
      return
    }
    
    setIsLoading(true)
    setStep('bridging')
    
    try {
      let tx: BridgeTransaction
      
      if (fromChain === 'polygon' && toChain === 'solana') {
        if (!solanaPublicKey) {
          throw new Error('Wallets not connected')
        }

        if (typeof window === 'undefined' || !(window as any).ethereum) {
          throw new Error('Ethereum provider not available')
        }

        const provider = new BrowserProvider((window as any).ethereum)
        const signer = await provider.getSigner()
        
        if (token === 'USDC') {
          tx = await bridgeUSDCPolygonToSolana({
            amount,
            solanaRecipient: solanaPublicKey.toBase58(),
            signer,
          })
        } else {
          tx = await bridgeAFFPolygonToSolana({
            amount,
            solanaRecipient: solanaPublicKey.toBase58(),
            signer,
          })
        }
        
        setBridgeTx(tx)
        toast.success('Transaction submitted to Polygon!')
        
        // Wait for VAA
        setStep('waiting-vaa')
        await fetchVAA(tx)
        
      } else if (fromChain === 'solana' && toChain === 'polygon') {
        // TODO: Implement Solana → Polygon bridge
        throw new Error('Solana to Polygon bridging coming soon')
      }
      
      setStep('success')
      toast.success('Bridge completed successfully!')
      
    } catch (error) {
      console.error('Bridge error:', error)
      toast.error(error instanceof Error ? error.message : 'Bridge failed')
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }
  
  async function fetchVAA(tx: BridgeTransaction) {
    try {
      // Convert emitter address to proper format
      const emitterAddress = tx.emitterAddress.replace('0x', '').padStart(64, '0')
      
      // Get VAA from Wormhole guardians
      const vaaBytes = await getVAA(
        5, // Polygon chain ID
        emitterAddress,
        tx.sequence
      )
      
      setVAA(vaaBytes)
      toast.success('VAA received! Bridge can be completed on Solana.')
      
    } catch (error) {
      console.error('Failed to fetch VAA:', error)
      toast.error('Failed to get bridge confirmation. Please try again later.')
    }
  }
  
  function reset() {
    setAmount('')
    setStep('input')
    setBridgeTx(null)
    setVAA(null)
    onOpenChange(false)
  }
  
  const estimatedTime = estimateBridgeTime(fromChain, toChain)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Wormhole Bridge
          </DialogTitle>
          <DialogDescription>
            Bridge {token} between Polygon and Solana
          </DialogDescription>
        </DialogHeader>
        
        {step === 'input' && (
          <div className="space-y-6">
            {/* Token Selection */}
            <Tabs value={token} onValueChange={(v) => setToken(v as 'USDC' | 'AFF')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="USDC">USDC</TabsTrigger>
                <TabsTrigger value="AFF">$AFF Token</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* From Chain */}
            <Card>
              <CardContent className="pt-6">
                <Label>From</Label>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={fromChain === 'polygon' ? 'default' : 'secondary'}>
                      {fromChain === 'polygon' ? 'Polygon' : 'Solana'}
                    </Badge>
                    {sourceConnected ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={swapChains}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* To Chain */}
            <Card>
              <CardContent className="pt-6">
                <Label>To</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={toChain === 'solana' ? 'default' : 'secondary'}>
                    {toChain === 'solana' ? 'Solana' : 'Polygon'}
                  </Badge>
                  {destConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                
                {toChain === 'solana' && solanaPublicKey && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Recipient: {solanaPublicKey.toBase58().slice(0, 8)}...{solanaPublicKey.toBase58().slice(-8)}
                  </p>
                )}
                {toChain === 'polygon' && polygonAddress && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Recipient: {polygonAddress.slice(0, 8)}...{polygonAddress.slice(-8)}
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Quote */}
            {quote && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bridge Fee</span>
                      <span className="font-medium">{quote.sourceFee} {fromChain === 'polygon' ? 'MATIC' : 'SOL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wormhole Fee</span>
                      <span className="font-medium">{quote.wormholeFee} {fromChain === 'polygon' ? 'MATIC' : 'SOL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Estimated Time
                      </span>
                      <span className="font-medium">{estimatedTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Info Banner */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Submit transaction on {fromChain}</li>
                  <li>Wait for Wormhole guardians (~15 seconds)</li>
                  <li>Receive tokens on {toChain}</li>
                </ol>
              </div>
            </div>
            
            {/* Bridge Button */}
            <Button
              onClick={handleBridge}
              disabled={!amount || parseFloat(amount) <= 0 || !sourceConnected || isLoading}
              className="w-full"
              size="lg"
            >
              {!sourceConnected ? (
                `Connect ${fromChain === 'polygon' ? 'MetaMask' : 'Phantom'}`
              ) : isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Bridging...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Bridge {amount} {token}
                </>
              )}
            </Button>
          </div>
        )}
        
        {step === 'bridging' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bridging {token}</h3>
              <p className="text-sm text-muted-foreground">
                Please confirm the transaction in your wallet
              </p>
            </div>
          </div>
        )}
        
        {step === 'waiting-vaa' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-12 h-12 text-blue-600 mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Waiting for Confirmation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Wormhole guardians are signing your transaction...
              </p>
              
              {bridgeTx && (
                <a
                  href={`https://amoy.polygonscan.com/tx/${bridgeTx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  View on Explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left w-full">
                <p className="text-xs text-muted-foreground">
                  This usually takes 15-30 seconds. You can close this modal - tokens will arrive automatically.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {step === 'success' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bridge Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your {token} has been bridged to {toChain}
              </p>
              
              <Card className="w-full">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">{amount} {token}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From</span>
                      <span className="font-medium capitalize">{fromChain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To</span>
                      <span className="font-medium capitalize">{toChain}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {bridgeTx && (
                <a
                  href={`https://wormholescan.io/#/tx/${bridgeTx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-4"
                >
                  View on Wormhole Scan <ExternalLink className="w-3 h-3" />
                </a>
              )}
              
              <Button onClick={reset} className="w-full mt-6">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
