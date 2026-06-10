'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import PriceChart from '@/components/charts/price-chart'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface HistoryPoint {
  time: string
  price: number
}

export default function CommodityPricePage() {
  const params = useParams()
  const commodity = (params.commodity as string).toUpperCase()
  const label = (params.commodity as string).charAt(0).toUpperCase() + (params.commodity as string).slice(1)

  const [loading, setLoading] = useState(true)
  const [price, setPrice] = useState(0)
  const [prevPrice, setPrevPrice] = useState(0)
  const [source, setSource] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [history, setHistory] = useState<HistoryPoint[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/live-prices?symbols=${commodity}&region=AFRICA&history=true&period=365`)
        const data = await res.json()
        if (data.success) {
          const priceData = data.data?.[0] || data
          const currentPrice = priceData.price
          setPrice(currentPrice)
          setSource(priceData.source || 'Unknown')
          setUpdatedAt(priceData.lastUpdated || '')

          let chartData: HistoryPoint[] = []
          let previousPrice = currentPrice

          if (priceData.historicalData?.length > 0) {
            const sorted = [...priceData.historicalData].sort(
              (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            chartData = sorted.map((p: any) => ({
              time: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              price: p.price
            }))
            previousPrice = sorted[sorted.length - 1]?.price ?? currentPrice
          }

          const now = new Date()
          chartData.push({
            time: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: currentPrice
          })

          setPrevPrice(previousPrice)
          setHistory(chartData)
        }
      } catch (err) {
        console.error('Failed to fetch price data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [commodity])

  const priceChange = price - prevPrice
  const priceChangePercent = prevPrice > 0 ? ((priceChange / prevPrice) * 100) : 0
  const isPositive = priceChange >= 0

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/prices"
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#E8E8E8] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to prices
        </Link>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-[#141414] rounded" />
            <div className="h-[400px] w-full bg-[#141414] rounded-lg" />
          </div>
        ) : (
          <PriceChart
            commodity={label}
            priceData={history}
            currentPrice={price}
            priceChange={priceChange}
            priceChangePercent={priceChangePercent}
            isPositive={isPositive}
            source={source}
            updatedAt={updatedAt}
          />
        )}
      </div>
    </div>
  )
}
