'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Users, Shield, BarChart3, Globe, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-slate-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2 shadow-lg">
                <svg className="h-full w-full text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">African Commodity Markets</h2>
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              <Link className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="/">Home</Link>
              <Link className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="/market">Markets</Link>
              <Link className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="/insights">AI Insights</Link>
              <Link className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="/grades">Grades</Link>
              <Link className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="/whitepaper">Whitepaper</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/50 flex min-w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-5 text-sm font-bold transition-all shadow-lg"
              >
                <span className="truncate">Get Started</span>
              </Link>
              <button className="lg:hidden text-white">
                <svg fill="none" height="28" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg">
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-green-700"
            style={{
              backgroundImage: `
                linear-gradient(rgba(21, 33, 17, 0.7), rgba(21, 33, 17, 0.5)),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              `,
              backgroundPosition: 'center',
              backgroundSize: 'cover, 60px 60px',
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/20" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                <Sparkles className="h-4 w-4 text-green-400" />
                <span>AI-Powered Price Predictions</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
                Predicting the Future of
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  African Agriculture
                </span>
              </h1>
              
              <p className="mt-6 text-xl leading-8 text-white/90 max-w-2xl mx-auto">
                Empowering farmers and businesses with accurate price forecasts for key agricultural commodities across Africa using advanced AI technology.
              </p>
              
              <div className="mt-10 flex items-center justify-center gap-x-6 flex-wrap">
                <Link
                  href="/insights"
                  className="bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/50 flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-base font-bold transition-all shadow-xl gap-2"
                >
                  <span className="truncate">Explore Predictions</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  href="/market"
                  className="text-base font-semibold leading-6 text-white hover:text-green-400 transition-colors flex items-center gap-2" 
                >
                  View Markets <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">6+</div>
                  <div className="text-sm text-white/70 mt-1">Commodities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">Daily</div>
                  <div className="text-sm text-white/70 mt-1">AI Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">95%</div>
                  <div className="text-sm text-white/70 mt-1">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="h-12 w-8 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="h-2 w-1 bg-white/60 rounded-full" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl lg:text-center mx-auto">
              <h2 className="text-base font-semibold leading-7 text-green-600">Why Choose Us?</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Everything you need to navigate the agricultural market
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Our platform provides reliable and actionable insights to help you make informed decisions in the dynamic agricultural market.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-sm border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="rounded-lg bg-green-600 p-2 shadow-md">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    Accurate Predictions
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Leverage advanced machine learning models for precise price forecasting, giving you a competitive edge in the market with daily AI-generated insights.
                    </p>
                    <Link href="/insights" className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">
                      View Predictions <ArrowRight className="h-4 w-4" />
                    </Link>
                  </dd>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-sm border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="rounded-lg bg-blue-600 p-2 shadow-md">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    Real-Time Market Data
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Access live commodity prices, historical trends, and market analysis for coffee, cocoa, cotton, cashew, rubber, and gold across African markets.
                    </p>
                    <Link href="/market" className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Explore Markets <ArrowRight className="h-4 w-4" />
                    </Link>
                  </dd>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-sm border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="rounded-lg bg-purple-600 p-2 shadow-md">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    Secure and Reliable
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Trust in our secure system with enterprise-grade authentication, data encryption, and 99.9% uptime to protect your information and provide consistent performance.
                    </p>
                    <Link href="/dashboard" className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Commodities Section */}
        <section className="py-24 sm:py-32 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-green-600">Supported Commodities</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Track the commodities that matter
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: 'Coffee', emoji: '☕', color: 'from-amber-500 to-orange-600' },
                { name: 'Cocoa', emoji: '🍫', color: 'from-orange-500 to-red-600' },
                { name: 'Cotton', emoji: '🌾', color: 'from-blue-500 to-cyan-600' },
                { name: 'Cashew', emoji: '🥜', color: 'from-yellow-500 to-amber-600' },
                { name: 'Rubber', emoji: '⚫', color: 'from-gray-500 to-slate-600' },
                { name: 'Gold', emoji: '🥇', color: 'from-yellow-400 to-yellow-600' },
              ].map((commodity) => (
                <div key={commodity.name} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                  <div className={`text-4xl mb-3 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br ${commodity.color} shadow-md`}>
                    <span className="text-white text-2xl">{commodity.emoji}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{commodity.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-green-600 to-emerald-700 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Ready to transform your agricultural business?
              </h2>
              <p className="mt-6 text-lg leading-8 text-green-50">
                Join thousands of farmers and traders making smarter decisions with AI-powered predictions.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/dashboard"
                  className="bg-white text-green-600 hover:bg-green-50 focus:ring-4 focus:ring-white/50 flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-base font-bold transition-all shadow-xl"
                >
                  <span className="truncate">Start Free Trial</span>
                </Link>
                <Link 
                  href="/whitepaper"
                  className="text-base font-semibold leading-6 text-white hover:text-green-100 transition-colors flex items-center gap-2"
                >
                  Read Whitepaper <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-7xl overflow-hidden py-12 px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 shadow-lg">
              <svg className="h-full w-full text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">African Commodity Markets</h2>
          </div>
          
          <nav aria-label="Footer" className="mb-8 columns-2 sm:flex sm:justify-center sm:space-x-12">
            <div className="pb-6">
              <Link className="text-sm leading-6 text-slate-400 hover:text-white transition-colors" href="/market">Markets</Link>
            </div>
            <div className="pb-6">
              <Link className="text-sm leading-6 text-slate-400 hover:text-white transition-colors" href="/insights">AI Insights</Link>
            </div>
            <div className="pb-6">
              <Link className="text-sm leading-6 text-slate-400 hover:text-white transition-colors" href="/grades">Grades</Link>
            </div>
            <div className="pb-6">
              <Link className="text-sm leading-6 text-slate-400 hover:text-white transition-colors" href="/whitepaper">Whitepaper</Link>
            </div>
            <div className="pb-6">
              <a className="text-sm leading-6 text-slate-400 hover:text-white transition-colors" href="#">Contact</a>
            </div>
          </nav>
          
          <p className="text-center text-xs leading-5 text-slate-400">
            © {new Date().getFullYear()} African Commodity Markets. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
