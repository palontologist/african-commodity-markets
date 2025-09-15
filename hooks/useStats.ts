'use client'

import { useState, useEffect } from 'react'
import { statsApi, ApiError } from '@/lib/api'

export function useStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
        const data = await statsApi.getOverview()
        setStats(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to fetch stats')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const refetch = async () => {
    try {
      setError(null)
      const data = await statsApi.getOverview()
      setStats(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch stats')
      }
    }
  }

  return { stats, loading, error, refetch }
}

export function useHistoricalData(period: string = '7d') {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const result = await statsApi.getHistoricalData(period)
        setData(result)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to fetch historical data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  return { data, loading, error }
}

export function useCommodityPerformance() {
  const [performance, setPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPerformance() {
      try {
        setLoading(true)
        setError(null)
        const data = await statsApi.getCommodityPerformance()
        setPerformance(data.performance || [])
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to fetch commodity performance')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [])

  return { performance, loading, error }
}