'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserType = 'farmer' | 'trader' | 'coop' | null

interface UserTypeContextType {
  userType: UserType
  setUserType: (type: UserType) => void
  isFarmer: boolean
  isTrader: boolean
  isCoop: boolean
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined)

export function UserTypeProvider({ children }: { children: ReactNode }) {
  const [userType, setUserTypeState] = useState<UserType>(null)
  
  // Load from localStorage on mount - check both onboarding and userType
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First check if there's onboarding data with userType
      const onboardingData = localStorage.getItem('onboarding')
      if (onboardingData) {
        try {
          const parsed = JSON.parse(onboardingData)
          if (parsed.userType && (parsed.userType === 'farmer' || parsed.userType === 'trader' || parsed.userType === 'coop')) {
            setUserTypeState(parsed.userType)
            // Also save to userType storage for consistency
            localStorage.setItem('userType', parsed.userType)
            return
          }
        } catch (e) {
          console.error('Failed to parse onboarding data:', e)
        }
      }
      
      // Fallback to userType storage
      const stored = localStorage.getItem('userType') as UserType
      if (stored === 'farmer' || stored === 'trader' || stored === 'coop' || stored === null) {
        setUserTypeState(stored)
      }
    }
  }, [])
  
  // Save to localStorage when changed
  const setUserType = (type: UserType) => {
    setUserTypeState(type)
    if (typeof window !== 'undefined') {
      if (type) {
        localStorage.setItem('userType', type)
        // Also update onboarding data if it exists
        const onboardingData = localStorage.getItem('onboarding')
        if (onboardingData) {
          try {
            const parsed = JSON.parse(onboardingData)
            parsed.userType = type
            localStorage.setItem('onboarding', JSON.stringify(parsed))
          } catch (e) {
            console.error('Failed to update onboarding data:', e)
          }
        }
      } else {
        localStorage.removeItem('userType')
      }
    }
  }
  
  return (
    <UserTypeContext.Provider
      value={{
        userType,
        setUserType,
        isFarmer: userType === 'farmer',
        isTrader: userType === 'trader',
        isCoop: userType === 'coop',
      }}
    >
      {children}
    </UserTypeContext.Provider>
  )
}

export function useUserType() {
  const context = useContext(UserTypeContext)
  if (!context) {
    throw new Error('useUserType must be used within UserTypeProvider')
  }
  return context
}

