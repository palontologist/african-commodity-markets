'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/unified-wallet-connect';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketStats {
  activeAgents: number;
  volume24h: number;
  openOrders: number;
  totalTrades: number;
  platformFee: number;
}

interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  feeTier: string;
  reputation: number;
  totalTrades: number;
  totalVolume: number;
  status: string;
  avatar?: string;
}

interface Order {
  id: string;
  agentId: string;
  side: 'BUY' | 'SELL';
  commodity: string;
  quantity: number;
  price: number;
  totalValue: number;
  status: string;
  createdAt?: string;
}

interface Trade {
  id: string;
  commodity: string;
  quantity: number;
  price: number;
  buyer: string;
  seller: string;
  totalValue: number;
  time: string;
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  source: string;
}

const COMMODITIES = [
  { code: 'COCOA', name: 'Cocoa', color: '#8B4513' },
  { code: 'COFFEE', name: 'Coffee', color: '#6F4E37' },
  { code: 'COTTON', name: 'Cotton', color: '#F5F5DC' },
  { code: 'CASHEW', name: 'Cashew', color: '#D2691E' },
  { code: 'GOLD', name: 'Gold', color: '#FFD700' },
  { code: 'WHEAT', name: 'Wheat', color: '#DEB887' },
  { code: 'MAIZE', name: 'Maize', color: '#F4A460' },
];

const MOCK_AGENTS: Agent[] = [
  { id: 'did:agent:001', name: 'HedgeBot Alpha', capabilities: ['HEDGE'], feeTier: 'PREMIUM', reputation: 94, totalTrades: 234, totalVolume: 1250000, status: 'ACTIVE' },
  { id: 'did:agent:002', name: 'ArbEdge Pro', capabilities: ['ARBITRAGE'], feeTier: 'BASIC', reputation: 91, totalTrades: 567, totalVolume: 890000, status: 'ACTIVE' },
  { id: 'did:agent:003', name: 'MarketFlow', capabilities: ['MARKET_MAKE'], feeTier: 'ENTERPRISE', reputation: 88, totalTrades: 1203, totalVolume: 4500000, status: 'ACTIVE' },
  { id: 'did:agent:004', name: 'CocoaHedge', capabilities: ['HEDGE', 'COOPERATIVE'], feeTier: 'FREE', reputation: 86, totalTrades: 89, totalVolume: 320000, status: 'ACTIVE' },
  { id: 'did:agent:005', name: 'FarmBot', capabilities: ['HEDGE'], feeTier: 'FREE', reputation: 82, totalTrades: 45, totalVolume: 180000, status: 'ACTIVE' },
  { id: 'did:agent:006', name: 'TraderX', capabilities: ['SPECULATE', 'ARBITRAGE'], feeTier: 'BASIC', reputation: 79, totalTrades: 312, totalVolume: 670000, status: 'ACTIVE' },
];

const MOCK_TRADES: Trade[] = [
  { id: 'trd:001', commodity: 'COCOA', quantity: 100, price: 8520, buyer: 'ArbEdge Pro', seller: 'CocoaHedge', totalValue: 852000, time: '2m ago' },
  { id: 'trd:002', commodity: 'COFFEE', quantity: 50, price: 4200, buyer: 'HedgeBot Alpha', seller: 'FarmBot', totalValue: 210000, time: '5m ago' },
  { id: 'trd:003', commodity: 'COCOA', quantity: 200, price: 8480, buyer: 'MarketFlow', seller: 'CocoaHedge', totalValue: 1696000, time: '12m ago' },
  { id: 'trd:004', commodity: 'GOLD', quantity: 10, price: 2345, buyer: 'TraderX', seller: 'MarketFlow', totalValue: 23450, time: '18m ago' },
  { id: 'trd:005', commodity: 'COTTON', quantity: 150, price: 0.82, buyer: 'ArbEdge Pro', seller: 'FarmBot', totalValue: 123000, time: '25m ago' },
];

const MOCK_PRICES: Record<string, PriceData> = {
  COCOA: { symbol: 'COCOA', price: 8500, change24h: 2.3, high24h: 8620, low24h: 8310, source: 'Alpha Vantage' },
  COFFEE: { symbol: 'COFFEE', price: 4180, change24h: -1.2, high24h: 4250, low24h: 4120, source: 'Alpha Vantage' },
  GOLD: { symbol: 'GOLD', price: 2345, change24h: 0.5, high24h: 2360, low24h: 2320, source: 'Metal API' },
};

export default function A2AMarketplace() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'orders' | 'trade'>('dashboard');
  const [selectedCommodity, setSelectedCommodity] = useState('COCOA');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES);
  const [stats, setStats] = useState<MarketStats>({ activeAgents: 24, volume24h: 2430000, openOrders: 156, totalTrades: 892, platformFee: 0.5 });
  const [registerForm, setRegisterForm] = useState({ name: '', capabilities: [] as string[], feeTier: 'FREE' });
  const [orderForm, setOrderForm] = useState({ quantity: '', price: '', agentId: '' });
  const [isLoading, setIsLoading] = useState(false);

  const currentPrice = MOCK_PRICES[selectedCommodity] || { symbol: selectedCommodity, price: 8500, change24h: 0, high24h: 0, low24h: 0, source: 'Fallback' };

  const handleRegister = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/a2a/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name || `Agent_${address.slice(0, 8)}`,
          owner: address,
          capabilities: registerForm.capabilities.length > 0 ? registerForm.capabilities : ['HEDGE'],
          feeTier: registerForm.feeTier
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowRegisterModal(false);
        alert(`Agent registered!\nID: ${data.agent?.id}\nAPI Key: ${data.apiKey?.slice(0, 20)}...`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
    setIsLoading(false);
  };

  const handlePostOrder = async () => {
    if (!orderForm.agentId || !orderForm.quantity || !orderForm.price) return;
    setIsLoading(true);
    try {
      await fetch('/api/a2a/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: orderForm.agentId,
          side: orderSide,
          commodity: selectedCommodity,
          quantity: parseFloat(orderForm.quantity),
          price: parseFloat(orderForm.price)
        })
      });
      setShowOrderModal(false);
      setOrderForm({ quantity: '', price: '', agentId: '' });
    } catch (error) {
      console.error('Order failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    A2A Marketplace
                  </span>
                </h1>
                <p className="text-xs text-gray-500">Agent-to-Agent Autonomous Trading</p>
              </div>
            </div>

            <nav className="flex items-center gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { id: 'agents', label: 'Agents', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                { id: 'orders', label: 'Order Book', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                { id: 'trade', label: 'Trade', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Active Agents', value: stats.activeAgents, color: 'emerald', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                  { label: '24h Volume', value: `$${(stats.volume24h / 1000000).toFixed(1)}M`, color: 'cyan', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { label: 'Open Orders', value: stats.openOrders, color: 'amber', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { label: 'Total Trades', value: stats.totalTrades, color: 'purple', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative overflow-hidden bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 group hover:border-gray-700/50 transition-all"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-${stat.color}-500/5 blur-2xl group-hover:bg-${stat.color}-500/10 transition-all`} />
                    <div className="relative">
                      <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                      <p className={`text-3xl font-bold bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-500 bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                    <svg className={`absolute bottom-3 right-3 w-8 h-8 text-${stat.color}-500/20`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                  </motion.div>
                ))}
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-3 gap-6">
                {/* Price Card */}
                <div className="col-span-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Live Market Prices</h2>
                      <p className="text-sm text-gray-500">Real-time commodity prices</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                      Live
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {COMMODITIES.map((commodity) => {
                      const price = MOCK_PRICES[commodity.code];
                      const isSelected = selectedCommodity === commodity.code;
                      return (
                        <button
                          key={commodity.code}
                          onClick={() => setSelectedCommodity(commodity.code)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30'
                              : 'bg-gray-800/30 border border-transparent hover:bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                              style={{ backgroundColor: `${commodity.color}20`, color: commodity.color }}
                            >
                              {commodity.code[0]}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-white">{commodity.name}</p>
                              <p className="text-xs text-gray-500">{commodity.code}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">
                              {price ? `$${price.price.toLocaleString()}` : '--'}
                            </p>
                            {price && (
                              <p className={`text-xs ${price.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {price.change24h >= 0 ? '+' : ''}{price.change24h}%
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Trades */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Recent Trades</h2>
                  <div className="space-y-3">
                    {trades.slice(0, 5).map((trade) => (
                      <div key={trade.id} className="p-3 bg-gray-800/30 rounded-xl border border-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            {trade.commodity}
                          </span>
                          <span className="text-xs text-gray-500">{trade.time}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {trade.quantity} MT @ ${trade.price.toLocaleString()}
                          </span>
                          <span className="text-emerald-400 font-medium">
                            ${(trade.totalValue / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Agents */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Top Performing Agents</h2>
                    <p className="text-sm text-gray-500">Highest reputation scores</p>
                  </div>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    disabled={!isConnected}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Register Agent
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {agents.slice(0, 3).map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-5 group hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-lg font-bold text-white">
                            {agent.name[0]}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900 ${
                            agent.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.capabilities.join(', ')}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-2 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Reputation</p>
                          <p className="font-bold text-emerald-400">{agent.reputation}%</p>
                        </div>
                        <div className="p-2 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Volume</p>
                          <p className="font-bold text-cyan-400">${(agent.totalVolume / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          agent.feeTier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
                          agent.feeTier === 'PREMIUM' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {agent.feeTier}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Agent Directory</h2>
                  <p className="text-gray-500">Discover and connect with trading agents</p>
                </div>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  disabled={!isConnected}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Register Agent
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-500/20">
                          {agent.name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{agent.name}</h3>
                          <p className="text-xs text-gray-500">{agent.id.slice(0, 20)}...</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        agent.feeTier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        agent.feeTier === 'PREMIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        agent.feeTier === 'BASIC' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {agent.feeTier}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.capabilities.map((cap) => (
                        <span key={cap} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">
                          {cap}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                        <p className="text-xs text-gray-500">Reputation</p>
                        <p className="font-bold text-emerald-400">{agent.reputation}%</p>
                      </div>
                      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                        <p className="text-xs text-gray-500">Trades</p>
                        <p className="font-bold text-white">{agent.totalTrades}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="font-bold text-cyan-400">${(agent.totalVolume / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Order Book</h2>
                  <p className="text-gray-500">Real-time order book for {selectedCommodity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-gray-800/50 rounded-lg p-1">
                    <button
                      onClick={() => { setOrderSide('BUY'); setShowOrderModal(true); }}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-emerald-500/20 text-emerald-400"
                    >
                      + Buy
                    </button>
                    <button
                      onClick={() => { setOrderSide('SELL'); setShowOrderModal(true); }}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-red-500/20 text-red-400"
                    >
                      + Sell
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedCommodity}</h3>
                    <p className="text-sm text-gray-500">Current market price</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">${currentPrice.price.toLocaleString()}</p>
                    <p className={`text-sm ${currentPrice.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {currentPrice.change24h >= 0 ? '+' : ''}{currentPrice.change24h}% (24h)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">24h High</p>
                    <p className="font-semibold text-white">${currentPrice.high24h.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">24h Low</p>
                    <p className="font-semibold text-white">${currentPrice.low24h.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="font-semibold text-cyan-400">{currentPrice.source}</p>
                  </div>
                </div>
              </div>

              {/* Order Book */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 bg-emerald-500/10 border-b border-emerald-500/20">
                    <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      Buy Orders
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-800/50">
                    {[
                      { qty: 100, price: 8450, agent: 'ArbEdge Pro', total: 845000 },
                      { qty: 50, price: 8420, agent: 'HedgeBot Alpha', total: 421000 },
                      { qty: 200, price: 8400, agent: 'MarketFlow', total: 1680000 },
                      { qty: 75, price: 8380, agent: 'TraderX', total: 628500 },
                      { qty: 150, price: 8350, agent: 'CocoaHedge', total: 1252500 },
                    ].map((bid, i) => (
                      <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 font-medium">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-white">{bid.qty} MT</p>
                            <p className="text-xs text-gray-500">{bid.agent}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-400">${bid.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">${(bid.total / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20">
                    <h3 className="font-semibold text-red-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      Sell Orders
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-800/50">
                    {[
                      { qty: 150, price: 8550, agent: 'CocoaHedge', total: 1282500 },
                      { qty: 75, price: 8580, agent: 'FarmBot', total: 643500 },
                      { qty: 300, price: 8600, agent: 'TraderX', total: 2580000 },
                      { qty: 100, price: 8620, agent: 'HedgeBot Alpha', total: 862000 },
                      { qty: 200, price: 8650, agent: 'ArbEdge Pro', total: 1730000 },
                    ].map((ask, i) => (
                      <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-medium">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-white">{ask.qty} MT</p>
                            <p className="text-xs text-gray-500">{ask.agent}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-400">${ask.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">${(ask.total / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spread */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-gray-800/50 to-red-500/10 border border-gray-700/50 rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Current Spread</p>
                <p className="text-2xl font-bold text-white">$100 <span className="text-sm font-normal text-gray-500">(1.18%)</span></p>
              </div>
            </motion.div>
          )}

          {/* Trade Tab */}
          {activeTab === 'trade' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-6">
                {/* Trade Form */}
                <div className="col-span-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Execute Trade</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Your Agent ID</label>
                      <input
                        type="text"
                        placeholder="did:agent:xxxx"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Commodity</label>
                      <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50">
                        {COMMODITIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Quantity (MT)</label>
                        <input
                          type="number"
                          placeholder="100"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Price (USDC/MT)</label>
                        <input
                          type="number"
                          placeholder="8500"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                    
                    {/* Fee Breakdown */}
                    <div className="bg-gray-800/30 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Order Value</span>
                        <span className="text-white font-medium">$850,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Platform Fee (0.5%)</span>
                        <span className="text-amber-400">$4,250</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Counterparty Risk</span>
                        <span className="text-cyan-400">Escrow Protected</span>
                      </div>
                      <div className="border-t border-gray-700 pt-3 flex justify-between font-semibold">
                        <span className="text-white">Total Cost</span>
                        <span className="text-emerald-400">$854,250</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors">
                        Buy
                      </button>
                      <button className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors">
                        Sell
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Trades */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Recent Trades</h2>
                  <div className="space-y-3">
                    {trades.map((trade) => (
                      <div key={trade.id} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            {trade.commodity}
                          </span>
                          <span className="text-xs text-gray-500">{trade.time}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-400">{trade.quantity} MT @ ${trade.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {trade.buyer} → {trade.seller}
                          </span>
                          <span className="text-emerald-400 font-medium">
                            ${(trade.totalValue / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 w-full max-w-md m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-6">Register New Agent</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Agent Name</label>
                  <input
                    type="text"
                    placeholder="My Trading Bot"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fee Tier</label>
                  <select
                    value={registerForm.feeTier}
                    onChange={(e) => setRegisterForm({ ...registerForm, feeTier: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white"
                  >
                    <option value="FREE">FREE (0.5% fee)</option>
                    <option value="BASIC">BASIC ($99/mo, 0.3% fee)</option>
                    <option value="PREMIUM">PREMIUM ($499/mo, 0.15% fee)</option>
                    <option value="ENTERPRISE">ENTERPRISE (Custom, 0.1% fee)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Capabilities</label>
                  <div className="flex flex-wrap gap-2">
                    {['HEDGE', 'ARBITRAGE', 'MARKET_MAKE', 'SPECULATE'].map((cap) => (
                      <button
                        key={cap}
                        onClick={() => {
                          const caps = registerForm.capabilities.includes(cap)
                            ? registerForm.capabilities.filter((c) => c !== cap)
                            : [...registerForm.capabilities, cap];
                          setRegisterForm({ ...registerForm, capabilities: caps });
                        }}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          registerForm.capabilities.includes(cap)
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-gray-600'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
