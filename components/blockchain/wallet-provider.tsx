'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { type Config, WagmiProvider, createConfig, http } from 'wagmi'
import { polygonAmoy, polygon } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactNode, useEffect, useState } from 'react'

const queryClient = new QueryClient()
const fallbackConfig = createConfig({
  chains: [polygonAmoy, polygon],
  transports: {
    [polygonAmoy.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [] as const,
  ssr: true,
}) as Config

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(fallbackConfig)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fullConfig = getDefaultConfig({
      appName: 'Afrifutures - African Commodity Markets',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'afrifutures-commodity-markets',
      chains: [polygonAmoy, polygon],
      ssr: false,
    }) as Config

    setConfig(fullConfig)
    setReady(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {ready ? (
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        ) : (
          <>{children}</>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
