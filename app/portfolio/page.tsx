'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth, usePortfolio, useTrades } from "@/hooks/useAuth"

export default function PortfolioPage() {
  const { user, isAuthenticated, connectWallet } = useAuth()
  const { portfolio, loading: portfolioLoading, error: portfolioError, refetch } = usePortfolio(user?.id)
  const { trades, loading: tradesLoading } = useTrades(user?.id)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Markets
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
              <div></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your portfolio and track your trading performance.
            </p>
            <Button onClick={() => connectWallet()} size="lg">
              Connect Wallet
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (portfolioLoading || tradesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Markets
              </Link>
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
              <p className="text-sm text-muted-foreground">{user?.profile.username}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-lg font-bold text-foreground">${user?.balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${portfolio?.totalInvested?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${portfolio?.currentValue?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Return</p>
                  <p className={`text-2xl font-bold ${
                    (portfolio?.totalReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(portfolio?.totalReturn || 0) >= 0 ? '+' : ''}
                    ${portfolio?.totalReturn?.toFixed(2) || '0.00'}
                  </p>
                </div>
                {(portfolio?.totalReturn || 0) >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {portfolio?.performance?.winRate?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error handling */}
        {portfolioError && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{portfolioError}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {/* Tabs for different sections */}
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-6">
            {portfolio?.positions?.length > 0 ? (
              <div className="space-y-4">
                {portfolio.positions.map((position: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg capitalize">{position.commodity}</CardTitle>
                          <CardDescription>Market #{position.marketId} - {position.orderType.toUpperCase()} position</CardDescription>
                        </div>
                        <Badge variant={position.unrealizedPnL >= 0 ? "default" : "destructive"}>
                          {position.unrealizedPnL >= 0 ? '+' : ''}
                          ${position.unrealizedPnL?.toFixed(2) || '0.00'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Shares</p>
                          <p className="font-semibold">{position.shares}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Price</p>
                          <p className="font-semibold">${position.averagePrice?.toFixed(3)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Price</p>
                          <p className="font-semibold">${position.currentPrice?.toFixed(3)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Return %</p>
                          <p className={`font-semibold ${
                            position.unrealizedPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {position.unrealizedPnLPercentage >= 0 ? '+' : ''}
                            {position.unrealizedPnLPercentage?.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">
                            Performance
                          </span>
                          <span className="text-sm font-medium">
                            ${position.currentValue?.toFixed(2)} / ${position.totalCost?.toFixed(2)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.max(0, Math.min(100, ((position.currentValue / position.totalCost) * 100)))} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No positions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start trading to see your positions here.
                  </p>
                  <Button asChild>
                    <Link href="/">Explore Markets</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            {trades?.length > 0 ? (
              <div className="space-y-4">
                {trades.map((trade: any) => (
                  <Card key={trade.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge variant={trade.orderType === 'yes' ? "default" : "secondary"}>
                              {trade.orderType.toUpperCase()}
                            </Badge>
                            <span className="font-medium capitalize">{trade.commodity}</span>
                            <span className="text-sm text-muted-foreground">
                              Market #{trade.marketId}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {new Date(trade.timestamp).toLocaleDateString()} at{' '}
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{trade.shares} shares</div>
                          <div className="text-sm text-muted-foreground">
                            ${trade.totalCost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your trading history will appear here.
                  </p>
                  <Button asChild>
                    <Link href="/">Start Trading</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trading Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Trades</span>
                    <span className="font-semibold">{portfolio?.performance?.totalTrades || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Winning Trades</span>
                    <span className="font-semibold text-green-600">{portfolio?.performance?.winningTrades || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Losing Trades</span>
                    <span className="font-semibold text-red-600">{portfolio?.performance?.losingTrades || 0}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-semibold">{portfolio?.performance?.winRate?.toFixed(1) || '0.0'}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Return Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Return</span>
                    <span className={`font-semibold ${
                      (portfolio?.totalReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(portfolio?.totalReturn || 0) >= 0 ? '+' : ''}
                      ${portfolio?.totalReturn?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return Percentage</span>
                    <span className={`font-semibold ${
                      (portfolio?.totalReturnPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(portfolio?.totalReturnPercentage || 0) >= 0 ? '+' : ''}
                      {portfolio?.totalReturnPercentage?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invested Capital</span>
                      <span className="font-semibold">${portfolio?.totalInvested?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}