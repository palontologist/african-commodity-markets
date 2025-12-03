'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { WalletConnect } from './unified-wallet-connect'
import { ChainSelector } from './blockchain/chain-selector'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Menu, X } from 'lucide-react'
import { useUserType } from './user-type-provider'

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { userType } = useUserType()

  const navLinks = (
    <>
      <Link 
        href="/marketplace" 
        className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
        onClick={() => setMobileMenuOpen(false)}
      >
        Markets
      </Link>
      <Link 
        href="/how-it-works" 
        className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
        onClick={() => setMobileMenuOpen(false)}
      >
        How it Works
      </Link>
      {userType === 'farmer' && (
        <Link 
          href="/grades" 
          className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          Crop Grades
        </Link>
      )}
      {userType === 'coop' && (
        <>
          <Link 
            href="/marketplace" 
            className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Marketplace
          </Link>
          <Link 
            href="/wheat-maize-markets" 
            className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Wheat & Maize
          </Link>
          <Link 
            href="/api-docs" 
            className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            API Docs
          </Link>
        </>
      )}
      {/* Dashboard link left visible; auth disabled so it behaves like a normal link */}
      <Link 
        href="/dashboard" 
        className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
        onClick={() => setMobileMenuOpen(false)}
      >
        Dashboard
      </Link>
      <Link 
        href="/insights" 
        className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
        onClick={() => setMobileMenuOpen(false)}
      >
        AI Insights
      </Link>
      {userType !== 'coop' && (
        <Link 
          href="/whitepaper" 
          className="text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          Docs
        </Link>
      )}
    </>
  )

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg sm:text-xl font-bold text-primary flex-shrink-0">
            Afrifutures
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks}
          </nav>
          
          {/* Right side: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Chain Selector - Hidden on very small screens */}
            <div className="hidden sm:block">
              <ChainSelector />
            </div>
            
            {/* Wallet Connect - Responsive sizing */}
            <div className="hidden sm:block">
              <WalletConnect />
            </div>
            
            {/* Auth */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            {/* Mobile Menu Button */}
            <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] p-0 top-4 right-4 left-auto translate-x-0 translate-y-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <div className="flex flex-col">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="text-lg font-bold text-primary">Menu</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col p-4 space-y-1">
                    {navLinks}
                  </nav>
                  
                  {/* Mobile Actions */}
                  <div className="border-t p-4 space-y-3">
                    <div className="block sm:hidden">
                      <ChainSelector />
                    </div>
                    <div className="block sm:hidden">
                      <WalletConnect />
                    </div>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setMobileMenuOpen(false)}>
                          Sign In
                        </Button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex items-center justify-center">
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </SignedIn>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  )
}