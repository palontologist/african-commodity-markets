import { PriceOracle } from '@/components/oracle/price-oracle'
import { AppHeader } from '@/components/app-header'

export default function OraclePage() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <PriceOracle />
      </main>
    </div>
  )
}