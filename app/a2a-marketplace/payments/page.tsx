'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentStats {
  balance: number;
  totalPaid: number;
  monthlyFee: number;
  tradeFee: number;
}

interface Payment {
  id: string;
  type: string;
  amount: number;
  currency: string;
  date: string;
}

const MOCK_STATS: PaymentStats = {
  balance: 500_000_000, // in USDC smallest units
  totalPaid: 2_500_000_000,
  monthlyFee: 0,
  tradeFee: 0.5,
};

const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay_001', type: 'API_USAGE', amount: 50_000, currency: 'USDC', date: '2024-01-15' },
  { id: 'pay_002', type: 'TRADE_FEE', amount: 425_000, currency: 'USDC', date: '2024-01-14' },
  { id: 'pay_003', type: 'TOP_UP', amount: 1_000_000_000, currency: 'USDC', date: '2024-01-10' },
  { id: 'pay_004', type: 'API_USAGE', amount: 25_000, currency: 'USDC', date: '2024-01-09' },
  { id: 'pay_005', type: 'TRADE_FEE', amount: 850_000, currency: 'USDC', date: '2024-01-08' },
];

const TIERS = [
  { id: 'FREE', name: 'Free', price: 0, tradeFee: '0.5%', features: ['Basic API access', '10 requests/day'] },
  { id: 'BASIC', name: 'Basic', price: 99, tradeFee: '0.3%', features: ['Unlimited requests', 'Email support'] },
  { id: 'PREMIUM', name: 'Premium', price: 499, tradeFee: '0.15%', features: ['Priority matching', 'Advanced analytics'] },
  { id: 'ENTERPRISE', name: 'Enterprise', price: 999, tradeFee: '0.1%', features: ['Dedicated support', 'Custom integration'] },
];

export default function PaymentsPage() {
  const [selectedTier, setSelectedTier] = useState('FREE');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [activeTab, setActiveTab] = useState<'balance' | 'tiers' | 'history'>('balance');

  const formatUsdc = (amount: number) => {
    return (amount / 1_000_000).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <main className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Agent Payments</h1>
            <p className="text-gray-500">Manage your balance and subscriptions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'balance', label: 'Balance & Top-up', icon: 'M12 8c-1.657 0-3 .895-3 3s1.343 3 3 3 3 .895 3 3-1.343 3-3 3-3-.895 3-3-1.343-3-3-3zm0 2c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4 7 1.79 7 4-3.134 4-7 4z' },
            { id: 'tiers', label: 'Subscription Tiers', icon: 'M9 7c0-1.657 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3-1.343-3-3zm0 2c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4 7 1.79 7 4-3.134 4-7 4z' },
            { id: 'history', label: 'Payment History', icon: 'M9 5H7a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2zm0 0V9a2 2 0 002 2h6a2 2 0 002-2V5' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Balance Tab */}
        {activeTab === 'balance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Balance Card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-700/50 rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <p className="text-sm text-gray-500 mb-2">Current Balance</p>
                <p className="text-5xl font-bold text-white mb-1">
                  {formatUsdc(MOCK_STATS.balance)} <span className="text-2xl text-gray-400">USDC</span>
                </p>
                <p className="text-sm text-gray-500">
                  Total Paid: {formatUsdc(MOCK_STATS.totalPaid)} USDC
                </p>

                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-700/50">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Trade Fee</p>
                    <p className="text-lg font-semibold text-emerald-400">{MOCK_STATS.tradeFee}%</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Monthly Fee</p>
                    <p className="text-lg font-semibold text-white">
                      {MOCK_STATS.monthlyFee === 0 ? 'Free' : `$${MOCK_STATS.monthlyFee}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top-up Form */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Top Up Balance</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount (USDC)</label>
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Transaction Hash</label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-mono text-sm"
                    />
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
                    Top Up
                  </button>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-4">How to Top Up</h3>
                  <ol className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-medium">1</span>
                      <span>Transfer USDC to platform wallet</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-medium">2</span>
                      <span>Copy the transaction hash from your wallet</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-medium">3</span>
                      <span>Paste the hash and click Top Up</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-2 gap-6">
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative bg-gray-900/50 backdrop-blur-xl border rounded-2xl p-6 cursor-pointer transition-all ${
                    selectedTier === tier.id
                      ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'border-gray-800/50 hover:border-gray-700'
                  }`}
                >
                  {selectedTier === tier.id && (
                    <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">
                      Current Plan
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                    <span className="text-2xl font-bold text-white">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                      {tier.price > 0 && <span className="text-sm text-gray-500">/mo</span>}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Trade Fee</p>
                    <p className="text-lg font-semibold text-emerald-400">{tier.tradeFee}</p>
                  </div>

                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {selectedTier === tier.id && tier.id !== 'FREE' && (
                    <button className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity">
                      Upgrade to {tier.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800/50">
                <h2 className="text-lg font-semibold text-white">Payment History</h2>
              </div>
              
              <div className="divide-y divide-gray-800/50">
                {MOCK_PAYMENTS.map((payment) => (
                  <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        payment.type === 'TOP_UP'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : payment.type === 'TRADE_FEE'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        {payment.type === 'TOP_UP' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{payment.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{payment.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        payment.type === 'TOP_UP' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {payment.type === 'TOP_UP' ? '+' : '-'}{formatUsdc(payment.amount)} USDC
                      </p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
