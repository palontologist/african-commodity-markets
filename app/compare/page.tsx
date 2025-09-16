import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getLivePrice, type CommoditySymbol } from "@/lib/live-prices"

export const dynamic = 'force-dynamic'

const symbols: { id: string; symbol: CommoditySymbol; label: string }[] = [
  { id: 'tea', symbol: 'TEA', label: 'Tea' },
  { id: 'coffee', symbol: 'COFFEE', label: 'Coffee' },
  { id: 'avocado', symbol: 'AVOCADO', label: 'Avocado' },
  { id: 'macadamia', symbol: 'MACADAMIA', label: 'Macadamia' },
]

async function fetchRegionPrices(region: 'AFRICA' | 'LATAM') {
  const list = await Promise.all(
    symbols.map(async (s) => ({ id: s.id, label: s.label, data: await getLivePrice(s.symbol, region) }))
  )
  return list
}

export default async function ComparePage() {
  const [africa, latam] = await Promise.all([fetchRegionPrices('AFRICA'), fetchRegionPrices('LATAM')])

  function renderRow(id: string) {
    const a = africa.find((x) => x.id === id)!
    const l = latam.find((x) => x.id === id)!
    const unit = a.data.unit || l.data.unit || ''
    const aVal = a.data.price ?? 0
    const lVal = l.data.price ?? 0
    const diff = lVal - aVal
    const pct = aVal ? (diff / aVal) * 100 : 0

    return (
      <Card key={id} className="hover:shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {a.label}
            <Badge variant="outline">{unit ? unit : 'price'}</Badge>
          </CardTitle>
          <CardDescription>Live proxy prices with regional fallbacks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Africa</p>
              <p className="text-2xl font-bold">{aVal ? `$${aVal.toFixed(2)}${unit ? `/${unit}` : ''}` : '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">{a.data.note}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">LATAM</p>
              <p className="text-2xl font-bold">{lVal ? `$${lVal.toFixed(2)}${unit ? `/${unit}` : ''}` : '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">{l.data.note}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Difference</p>
              <p className={`text-2xl font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {diff >= 0 ? '+' : ''}${Math.abs(diff).toFixed(2)} ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
              </p>
              <p className="text-xs text-muted-foreground mt-1">LATAM vs Africa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Regional Price Comparison</h1>
          <p className="text-muted-foreground mt-1">Contrast current prices between Africa and LATAM with quick analysis.</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agri">Agricultural</TabsTrigger>
            <TabsTrigger value="metals">Metals</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6 mt-6">
            {symbols.map((s) => renderRow(s.id))}
          </TabsContent>
          <TabsContent value="agri" className="space-y-6 mt-6">
            {['tea', 'coffee', 'avocado', 'macadamia'].map((id) => renderRow(id))}
          </TabsContent>
          <TabsContent value="metals" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gold</CardTitle>
                <CardDescription>Metals coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We will include gold and more metals next.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Quick Analysis</CardTitle>
            <CardDescription>Context to interpret regional differences</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Price gaps often reflect logistics, currency, and quality grade mixes.</li>
              <li>LATAM coffee may trend closer to futures benchmarks; Africa tea follows EATTA auction averages.</li>
              <li>Use region toggle on the homepage to see in-context markets and settlement schedules.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

