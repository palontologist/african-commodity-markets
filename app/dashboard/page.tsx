import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/app-header'

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName || user.emailAddresses[0].emailAddress}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your African commodity market portfolio and watchlists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Market Overview
            </h3>
            <p className="text-gray-600">
              View real-time commodity prices across African markets.
            </p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-green-600">24</div>
              <div className="text-sm text-gray-500">Active Markets</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Watchlist
            </h3>
            <p className="text-gray-600">
              Track your favorite commodities and price alerts.
            </p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-500">Watched Items</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Price Alerts
            </h3>
            <p className="text-gray-600">
              Get notified when prices hit your target levels.
            </p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-500">Active Alerts</div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Market Activity
          </h3>
          <div className="text-gray-600">
            <p>Market data and activity will be displayed here once connected to live data sources.</p>
          </div>
        </div>
      </main>
    </div>
  )
}