'use client'

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

interface ChartPoint {
  time: string
  price: number
}

interface PriceChartProps {
  commodity: string
  grade?: string
  priceData: ChartPoint[]
  currentPrice: number
  priceChange: number
  priceChangePercent: number
  isPositive: boolean
  source?: string
  updatedAt?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1C1C1C] border border-[#2C2C2C] rounded-lg p-3 shadow-xl">
        <p className="text-[#9CA3AF] text-xs mb-1">{label}</p>
        <p className="text-[#E8E8E8] font-mono font-bold">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    )
  }
  return null
}

export default function PriceChart({
  commodity,
  grade,
  priceData,
  currentPrice,
  priceChange,
  priceChangePercent,
  isPositive,
  source,
  updatedAt,
}: PriceChartProps) {
  return (
    <Card className="bg-[#141414] border-[#2C2C2C]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-[#E8E8E8] text-lg">{commodity}{grade ? ` (${grade})` : ''}</CardTitle>
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
            <span>Updated {updatedAt || new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                dataKey="price"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#FE5102', stroke: '#141414', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#2C2C2C]">
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">24h High</p>
            <p className="text-sm font-mono text-[#E8E8E8]">
              ${priceData.length > 0 ? Math.max(...priceData.map(d => d.price)).toFixed(2) : '---'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">24h Low</p>
            <p className="text-sm font-mono text-[#E8E8E8]">
              ${priceData.length > 0 ? Math.min(...priceData.map(d => d.price)).toFixed(2) : '---'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">24h Vol</p>
            <p className="text-sm font-mono text-[#E8E8E8]">---</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">Source</p>
            <p className="text-sm font-mono text-[#FE5102]">{source || 'Unknown'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
