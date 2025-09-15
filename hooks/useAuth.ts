'use client'

import { useState, useEffect, useCallback } from 'react'
import { authApi, portfolioApi, tradingApi, ApiError } from '@/lib/api'

interface User {
  id: string
  walletAddress: string
  balance: number
  profile: {
    username: string
    totalTrades: number
    winRate: number
    isVerified: boolean
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('auth_token')
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await authApi.verifyToken(token)
      setUser(response.user)
      setError(null)
    } catch (err) {
      localStorage.removeItem('auth_token')
      setError('Session expired')
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = async (walletAddress?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      let address = walletAddress
      if (!address) {
        // Get demo wallet for testing
        const demoResponse = await authApi.getDemoWallet()
        address = demoResponse.walletAddress
      }
      
      const response = await authApi.connectWallet(address!)
      setUser(response.user)
      localStorage.setItem('auth_token', response.token)
      
      // Initialize portfolio for new users
      await portfolioApi.initializePortfolio(response.user.id)
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to connect wallet')
      }
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await authApi.disconnectWallet()
      setUser(null)
      setError(null)
      localStorage.removeItem('auth_token')
    } catch (err) {
      // Even if the API call fails, we should still disconnect locally
      setUser(null)
      localStorage.removeItem('auth_token')
    }
  }

  return {
    user,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    isAuthenticated: !!user,
  }
}

export function usePortfolio(userId?: string) {
  const [portfolio, setPortfolio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolio = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await portfolioApi.getPortfolio(userId)
      setPortfolio(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch portfolio')
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  const refetch = () => fetchPortfolio()

  return { portfolio, loading, error, refetch }
}

export function useTrades(userId?: string) {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tradingApi.getTradeHistory(userId, 20)
      setTrades(data.transactions || [])
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch trades')
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchTrades()
    }
  }, [fetchTrades, userId])

  const executeTrade = async (tradeData: any) => {
    try {
      setError(null)
      const result = await tradingApi.executeTrade(tradeData)
      // Refresh trades after successful trade
      await fetchTrades()
      return result
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        throw err
      } else {
        const error = new Error('Failed to execute trade')
        setError(error.message)
        throw error
      }
    }
  }

  return { trades, loading, error, executeTrade, refetch: fetchTrades }
}