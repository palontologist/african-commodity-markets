'use client'

import { useState, useEffect } from 'react'
import { marketApi, ApiError } from '@/lib/api'

export function useMarkets() {
  const [markets, setMarkets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true)
        setError(null)
        const data = await marketApi.getMarkets()
        setMarkets(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to fetch markets')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [])

  const refetch = async () => {
    try {
      setError(null)
      const data = await marketApi.getMarkets()
      setMarkets(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch markets')
      }
    }
  }

  return { markets, loading, error, refetch }
}

export function useMarketPredictions(commodity: string) {
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPredictions() {
      if (!commodity) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await marketApi.getPredictions(commodity)
        setPredictions(data.predictions || [])
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to fetch predictions')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [commodity])

  const refetch = async () => {
    if (!commodity) return
    
    try {
      setError(null)
      const data = await marketApi.getPredictions(commodity)
      setPredictions(data.predictions || [])
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch predictions')
      }
    }
  }

  return { predictions, loading, error, refetch }
}