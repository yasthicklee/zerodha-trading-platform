'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ZerodhaConnectionDialog } from '@/components/zerodha-connection-dialog'
import { useAppStore } from '@/lib/store'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  Plus,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const {
    user,
    zerodhaProfile,
    baskets,
    strategies,
    signals,
    isLoading,
    error,
    portfolioValue,
    todayPnL,
    refreshData,
    executeStrategy,
    setError
  } = useAppStore()

  // Initialize mock user for demo
  useEffect(() => {
    if (!user) {
      // For demo purposes, create a mock user
      useAppStore.setState({
        user: {
          id: 'demo-user-1',
          username: 'demo_user',
          email: 'demo@example.com',
          isActive: true,
          lastLogin: new Date()
        }
      })
    }
  }, [user])

  // Load initial data
  useEffect(() => {
    if (user && !zerodhaProfile) {
      refreshData()
    }
  }, [user, zerodhaProfile, refreshData])

  // Calculate stats
  const activeStrategiesCount = strategies.filter(s => s.isActive).length
  const runningStrategiesCount = strategies.filter(s => s.isRunning).length
  const todaySignalsCount = signals.filter(s => {
    const signalDate = new Date(s.timestamp)
    const today = new Date()
    return signalDate.toDateString() === today.toDateString()
  }).length

  // Mock portfolio calculations for demo
  const mockPortfolioValue = 430000
  const mockTodayPnL = 2850

  const formatIndian = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  const handleExecuteStrategy = async (strategyId: string) => {
    try {
      await executeStrategy(strategyId)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to execute strategy')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Zerodha Trading Platform</h1>
                <p className="text-sm text-muted-foreground">Algorithmic Trading & Portfolio Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={zerodhaProfile?.isConnected ? 'default' : 'destructive'}>
                {zerodhaProfile?.isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <ZerodhaConnectionDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="border-b bg-destructive/10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-auto text-destructive hover:text-destructive"
              >
                ×
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatIndian(mockPortfolioValue)}</div>
              <p className="text-xs text-muted-foreground">
                Total across all baskets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
              {mockTodayPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${mockTodayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatIndian(mockTodayPnL)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage((mockTodayPnL / mockPortfolioValue) * 100)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStrategiesCount}</div>
              <p className="text-xs text-muted-foreground">
                {runningStrategiesCount} running, {todaySignalsCount} signals today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${zerodhaProfile?.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-2xl font-bold capitalize">
                  {zerodhaProfile?.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Zerodha API
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="baskets">Baskets ({baskets.length})</TabsTrigger>
            <TabsTrigger value="strategies">Strategies ({strategies.length})</TabsTrigger>
            <TabsTrigger value="signals">Signals ({signals.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest trading signals and executions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {signals.slice(0, 3).map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            signal.signalType === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{signal.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(signal.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            signal.signalType === 'BUY' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {signal.signalType}
                          </p>
                          <p className="text-sm">{signal.price ? formatIndian(signal.price) : 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                    {signals.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No signals generated yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategy Performance</CardTitle>
                  <CardDescription>Success rates and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategies.slice(0, 3).map((strategy) => (
                      <div key={strategy.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{strategy.name}</p>
                            <p className="text-sm text-muted-foreground">{strategy.basket.name}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={strategy.isRunning ? 'default' : 'secondary'}>
                              {strategy.isRunning ? 'Running' : 'Stopped'}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleExecuteStrategy(strategy.id)}
                              disabled={isLoading || strategy.isRunning}
                            >
                              {strategy.isRunning ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Total Signals</span>
                          <span>{strategy._count.signals}</span>
                        </div>
                        <Progress value={strategy.isRunning ? 100 : 0} className="h-2" />
                      </div>
                    ))}
                    {strategies.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No strategies created yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Baskets Tab */}
          <TabsContent value="baskets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Trading Baskets</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Basket
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {baskets.map((basket) => (
                <Card key={basket.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{basket.name}</CardTitle>
                      <Badge variant={basket.isActive ? 'default' : 'secondary'}>
                        {basket.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{basket.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Stocks</span>
                        <span className="font-medium">{basket._count.stocks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Strategies</span>
                        <span className="font-medium">{basket._count.userStrategies}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="font-medium">
                          {new Date(basket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {baskets.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No baskets created yet</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Basket
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Trading Strategies</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Strategy
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {strategies.map((strategy) => (
                <Card key={strategy.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{strategy.name}</CardTitle>
                        <CardDescription>
                          Basket: {strategy.basket.name} • Template: {strategy.template.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={strategy.isRunning ? 'default' : 'secondary'}>
                          {strategy.isRunning ? 'Running' : 'Stopped'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExecuteStrategy(strategy.id)}
                          disabled={isLoading || strategy.isRunning}
                        >
                          {strategy.isRunning ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{strategy._count.signals}</p>
                        <p className="text-sm text-muted-foreground">Total Signals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{strategy.supertrendPeriod}</p>
                        <p className="text-sm text-muted-foreground">ST Period</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{strategy.supertrendMultiplier}</p>
                        <p className="text-sm text-muted-foreground">ST Multiplier</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {strategy.lastRun 
                            ? new Date(strategy.lastRun).toLocaleTimeString()
                            : 'Never'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">Last Run</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {strategies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No strategies created yet</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Strategy
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Trading Signals</h2>
              <Button variant="outline" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Symbol</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Price</th>
                        <th className="text-left p-4">Quantity</th>
                        <th className="text-left p-4">Strength</th>
                        <th className="text-left p-4">Time</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signals.map((signal) => (
                        <tr key={signal.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{signal.symbol}</td>
                          <td className="p-4">
                            <Badge variant={signal.signalType === 'BUY' ? 'default' : 'destructive'}>
                              {signal.signalType}
                            </Badge>
                          </td>
                          <td className="p-4">{signal.price ? formatIndian(signal.price) : 'N/A'}</td>
                          <td className="p-4">{signal.quantity || 'N/A'}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${signal.signalStrength * 100}%` }}
                                />
                              </div>
                              <span className="text-sm">{(signal.signalStrength * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(signal.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <Badge variant={signal.isExecuted ? 'default' : 'secondary'}>
                              {signal.isExecuted ? 'Executed' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {signal.strategy.name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {signals.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No signals generated yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}