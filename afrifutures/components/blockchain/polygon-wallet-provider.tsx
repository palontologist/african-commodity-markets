'use client'

import { useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'

interface EthereumContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

export function PolygonWalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  
  useEffect(() => {
    setMounted(true)
    
    // Check if MetaMask is installed
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const p = new ethers.BrowserProvider((window as any).ethereum)
      setProvider(p)
      
      // Check if already connected
      ;(window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0])
            p.getSigner().then(s => setSigner(s))
          }
        })
    }
  }, [])
  
  const connect = async () => {
    if (!provider) return
    
    try {
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      setAddress(accounts[0])
      const s = await provider.getSigner()
      setSigner(s)
      
      // Switch to Polygon Mumbai testnet
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // Mumbai = 80002
        })
      } catch (switchError: any) {
        // Chain doesn't exist, add it
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Mumbai',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              blockExplorerUrls: ['https://mumbai.polygonscan.com/']
            }]
          })
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }
  
  const disconnect = () => {
    setAddress(null)
    setSigner(null)
  }
  
  // Prevent SSR hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }
  
  const value: EthereumContextType = {
    provider,
    signer,
    address,
    isConnected: !!address,
    connect,
    disconnect,
  }
  
  return (
    <EthereumContext.Provider value={value}>
      {children}
    </EthereumContext.Provider>
  )
}

import { createContext, useContext } from 'react'

const EthereumContext = createContext<EthereumContextType>({
  provider: null,
  signer: null,
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
})

export function useEthereum() {
  return useContext(EthereumContext)
}
