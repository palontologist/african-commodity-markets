'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface PricePoint {
  time: string
  price: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Sample Kenya Coffee price data (last 30 days)
const generatePriceData = (): PricePoint[] => {
  const data: PricePoint[] = []
  const basePrice = 3.63
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const volatility = 0.08
    const trend = Math.sin(i * 0.3) * 0.15
    const randomWalk = (Math.random() - 0.5) * volatility
    const price = basePrice + trend + randomWalk
    
    data.push({
      time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(price.toFixed(2)),
      open: Number((price + (Math.random() - 0.5) * 0.05).toFixed(2)),
      high: Number((price + Math.random() * 0.1).toFixed(2)),
      low: Number((price - Math.random() * 0.1).toFixed(2)),
      close: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000) + 500
    })
  }
  
  return data
}

const TIME_FRAMES = [
  { label: '1H', value: '1h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-3 shadow-xl">
        <p className="text-[#9CA3AF] text-xs mb-1">{label}</p>
        <p className="text-[#E8E8E8] font-mono font-bold">
          ${data.close}
        </p>
        <div className="mt-1 space-y-0.5 text-xs text-[#9CA3AF]">
          <p>O: ${data.open} H: ${data.high}</p>
          <p>L: ${data.low} C: ${data.close}</p>
          <p className="text-[#666]">Vol: {data.volume}</p>
        </div>
      </div>
    )
  }
  return null
}

export default function PriceChart() {
  const [timeFrame, setTimeFrame] = useState('1m')
  const priceData = generatePriceData()
  const currentPrice = priceData[priceData.length - 1].close
  const previousPrice = priceData[priceData.length - 2].close
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2)
  const isPositive = priceChange >= 0

  return (
    <Card className="bg-[#141414] border-[#2C2C2C]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-[#E8E8E8] text-lg">Kenya Coffee (AA)</CardTitle>
              <Badge variant="outline" className="border-[#FE5102] text-[#FE5102] text-xs">
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#E8E8E8] font-mono">
                ${currentPrice.toFixed(2)}
              </span>
              <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent}%)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
            <Clock className="w-3 h-3" />
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Time Frame Selector */}
        <div className="flex gap-1 mb-4">
          {TIME_FRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeFrame(tf.value)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                timeFrame === tf.value
                  ? 'bg-[#FE5102] text-white font-medium'
                  : 'text-[#9CA3AF] hover:text-[#E8E8E8] hover:bg-[#252525]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#666" 
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="#666"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={currentPrice} stroke="#FE5102" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#FE5102', stroke: '#141414', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#2C2C2C]">
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">24h High</p>
            <p className="text-sm font-mono text-[#E8E8E8]">
              ${Math.max(...priceData.map(d => d.high)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">24h Low</p>
            <p className="text-sm font-mono text-[#E8E8E8]">
              ${Math.min(...priceData.map(d => d.low)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">24h Vol</p>
            <p className="text-sm font-mono text-[#E8E8E8]">
              {priceData[priceData.length - 1].volume.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">Source</p>
            <p className="text-sm font-mono text-[#FE5102]">KAMIS</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
