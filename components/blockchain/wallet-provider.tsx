'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { polygonAmoy, polygon } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'

const config = getDefaultConfig({
  appName: 'Afrifutures - African Commodity Markets',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'afrifutures-commodity-markets',
  chains: [polygonAmoy, polygon],
  ssr: true,
})

const queryClient = new QueryClient()

export function BlockchainProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
