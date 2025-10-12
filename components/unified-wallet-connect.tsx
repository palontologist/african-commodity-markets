'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useChain } from './blockchain/chain-provider'

export function WalletConnect() {
  const { isPolygon, isSolana } = useChain()
  
  return (
    <div className="flex items-center">
      {isPolygon && <ConnectButton />}
      {isSolana && (
        <WalletMultiButton 
          style={{
            background: '#10b981',
            borderRadius: '0.375rem',
            height: '36px',
            fontSize: '14px',
          }}
        />
      )}
    </div>
  )
}
