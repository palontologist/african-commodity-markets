'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAccount } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'

export type UserRole = 'PUBLIC' | 'FARMER' | 'TRADER' | 'COOPERATIVE'

interface UserProfile {
  id: string
  userId: string
  walletAddress: string
  roles: UserRole[]
  activeRole: UserRole
  dvcScore: number
  kycVerified: boolean
  metadata?: Record<string, any>
}

interface UserProfileContextType {
  profile: UserProfile | null
  loading: boolean
  switchRole: (role: UserRole) => Promise<void>
  hasRole: (role: UserRole) => boolean
  refreshProfile: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser()
  const { address: polygonAddress } = useAccount()
  const { publicKey: solanaPublicKey } = useWallet()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const walletAddress = polygonAddress || solanaPublicKey?.toBase58() || ''

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user?.id || !walletAddress) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/profile?userId=${user.id}&walletAddress=${walletAddress}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else if (response.status === 404) {
        // Profile doesn't exist yet, create default PUBLIC profile
        const createResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            walletAddress,
            roles: ['PUBLIC'],
            activeRole: 'PUBLIC',
          }),
        })
        if (createResponse.ok) {
          const newProfile = await createResponse.json()
          setProfile(newProfile)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Switch active role
  const switchRole = async (role: UserRole) => {
    if (!profile || !profile.roles.includes(role)) {
      throw new Error(`User doesn't have role: ${role}`)
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.userId,
          activeRole: role,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setProfile(updated)
      }
    } catch (error) {
      console.error('Failed to switch role:', error)
      throw error
    }
  }

  // Check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    return profile?.roles?.includes(role) || false
  }

  const refreshProfile = async () => {
    await fetchProfile()
  }

  useEffect(() => {
    if (userLoaded) {
      fetchProfile()
    }
  }, [user?.id, walletAddress, userLoaded])

  return (
    <UserProfileContext.Provider value={{ profile, loading, switchRole, hasRole, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}
