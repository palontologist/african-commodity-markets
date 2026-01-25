import { PriceOracle } from '@/components/oracle/price-oracle'

export default function OraclePage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <PriceOracle />
      </main>
    </div>
  )
}