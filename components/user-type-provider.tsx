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
  
  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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

