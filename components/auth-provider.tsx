'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // If no publishable key is available, render children without auth provider
  if (!publishableKey || publishableKey === 'pk_test_placeholder') {
    return <>{children}</>
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  )
}