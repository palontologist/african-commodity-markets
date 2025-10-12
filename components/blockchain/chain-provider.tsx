'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { SupportedChain } from '@/lib/blockchain/unified-client'

interface ChainContextType {
  activeChain: SupportedChain
  setActiveChain: (chain: SupportedChain) => void
  isPolygon: boolean
  isSolana: boolean
}

const ChainContext = createContext<ChainContextType | undefined>(undefined)

export function ChainProvider({ children }: { children: ReactNode }) {
  const [activeChain, setActiveChainState] = useState<SupportedChain>('polygon')
  
  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeChain') as SupportedChain
      if (stored === 'polygon' || stored === 'solana') {
        setActiveChainState(stored)
      }
    }
  }, [])
  
  // Save to localStorage when changed
  const setActiveChain = (chain: SupportedChain) => {
    setActiveChainState(chain)
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeChain', chain)
    }
  }
  
  return (
    <ChainContext.Provider
      value={{
        activeChain,
        setActiveChain,
        isPolygon: activeChain === 'polygon',
        isSolana: activeChain === 'solana',
      }}
    >
      {children}
    </ChainContext.Provider>
  )
}

export function useChain() {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('useChain must be used within ChainProvider')
  }
  return context
}
