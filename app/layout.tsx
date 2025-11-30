import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-provider'
import { BlockchainProvider } from '@/components/blockchain/wallet-provider'
import { SolanaWalletProvider } from '@/components/blockchain/solana-wallet-provider'
import { ChainProvider } from '@/components/blockchain/chain-provider'
import { UserTypeProvider } from '@/components/user-type-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Afrifutures',
  description: 'Trade the future of African crops. Back price outcomes, earn yield, and unlock instant USDC for farmers.',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <UserTypeProvider>
            <ChainProvider>
              <BlockchainProvider>
                <SolanaWalletProvider>
                  {children}
                </SolanaWalletProvider>
              </BlockchainProvider>
            </ChainProvider>
          </UserTypeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
