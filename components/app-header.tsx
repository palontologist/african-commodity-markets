'use client'

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { WalletConnect } from './unified-wallet-connect'
import { ChainSelector } from './blockchain/chain-selector'

export function AppHeader() {
  const [hasAuth, setHasAuth] = useState(true) // Default to true for build

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    setHasAuth(!!key && key !== 'pk_test_Y2xlcmsuYWZyaWNhbm1hcmtldHMuZGV2JA') // Exclude default build key
  }, [])

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold text-green-600">
            African Commodity Markets
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link href="/market" className="text-gray-600 hover:text-gray-900">
              Markets
            </Link>
            <Link href="/grades" className="text-gray-600 hover:text-gray-900">
              Grades
            </Link>
            <Link href="/insights" className="text-gray-600 hover:text-gray-900">
              AI Insights
            </Link>
            <Link href="/compare" className="text-gray-600 hover:text-gray-900">
              Compare
            </Link>
            <Link href="/whitepaper" className="text-gray-600 hover:text-gray-900">
              Whitepaper
            </Link>
            {hasAuth && (
              <>
                <SignedIn>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/watchlist" className="text-gray-600 hover:text-gray-900">
                    Watchlist
                  </Link>
                </SignedIn>
              </>
            )}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <ChainSelector />
          <WalletConnect />
          {hasAuth ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              Setup Clerk auth to sign in
            </div>
          )}
        </div>
      </div>
    </header>
  )
}