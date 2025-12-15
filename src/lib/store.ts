import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  isActive: boolean
  lastLogin?: Date
}

export interface ZerodhaProfile {
  id: string
  userId: string
  apiKey: string
  isConnected: boolean
  connectionStatus: string
  lastConnected?: Date
  zerodhaUserId?: string
  userName?: string
  email?: string
  userType?: string
  broker?: string
  exchanges?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface BasketStock {
  id: string
  symbol: string
  exchange: string
  quantity: number
  weight: number
  isActive: boolean
  addedAt: Date
}

export interface TradingBasket {
  id: string
  userId: string
  name: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  stocks: BasketStock[]
  _count: {
    stocks: number
    userStrategies: number
  }
}

export interface StrategyTemplate {
  id: string
  name: string
  description?: string
  strategyType: string
  scriptPath?: string
  isActive: boolean
  version: string
  createdAt: Date
  updatedAt: Date
}

export interface UserStrategy {
  id: string
  userId: string
  basketId: string
  templateId: string
  name: string
  supertrendPeriod: number
  supertrendMultiplier: number
  supertrendAtrPeriod: number
  timeframe: string
  signalType: string
  entryCondition: string
  exitCondition: string
  stopLossPercent: number
  targetPercent: number
  isActive: boolean
  isRunning: boolean
  lastRun?: Date
  createdAt: Date
  updatedAt: Date
  basket: {
    id: string
    name: string
    description?: string
  }
  template: {
    id: string
    name: string
    description?: string
    strategyType: string
  }
  _count: {
    signals: number
  }
}

export interface StrategySignal {
  id: string
  strategyId: string
  symbol: string
  exchange: string
  signalType: string
  signalStrength: number
  price?: number
  quantity?: number
  timestamp: Date
  isExecuted: boolean
  executedAt?: Date
  notes?: string
  strategy: {
    id: string
    name: string
    basket: {
      id: string
      name: string
    }
  }
}

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Zerodha profile state
  zerodhaProfile: ZerodhaProfile | null
  setZerodhaProfile: (profile: ZerodhaProfile | null) => void

  // Baskets state
  baskets: TradingBasket[]
  setBaskets: (baskets: TradingBasket[]) => void
  addBasket: (basket: TradingBasket) => void
  updateBasket: (id: string, updates: Partial<TradingBasket>) => void
  removeBasket: (id: string) => void

  // Strategies state
  strategies: UserStrategy[]
  setStrategies: (strategies: UserStrategy[]) => void
  addStrategy: (strategy: UserStrategy) => void
  updateStrategy: (id: string, updates: Partial<UserStrategy>) => void
  removeStrategy: (id: string) => void

  // Signals state
  signals: StrategySignal[]
  setSignals: (signals: StrategySignal[]) => void
  addSignal: (signal: StrategySignal) => void
  updateSignal: (id: string, updates: Partial<StrategySignal>) => void

  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  // Portfolio state
  portfolioValue: number
  todayPnL: number
  setPortfolioValue: (value: number) => void
  setTodayPnL: (pnl: number) => void

  // Actions
  refreshData: () => Promise<void>
  connectZerodha: (apiKey: string, apiSecret: string) => Promise<void>
  disconnectZerodha: () => Promise<void>
  executeStrategy: (strategyId: string) => Promise<void>
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      zerodhaProfile: null,
      baskets: [],
      strategies: [],
      signals: [],
      isLoading: false,
      error: null,
      portfolioValue: 0,
      todayPnL: 0,

      // User actions
      setUser: (user) => set({ user }),

      // Zerodha profile actions
      setZerodhaProfile: (profile) => set({ zerodhaProfile: profile }),

      // Basket actions
      setBaskets: (baskets) => set({ baskets }),
      addBasket: (basket) => set((state) => ({ baskets: [...state.baskets, basket] })),
      updateBasket: (id, updates) =>
        set((state) => ({
          baskets: state.baskets.map((basket) =>
            basket.id === id ? { ...basket, ...updates } : basket
          ),
        })),
      removeBasket: (id) =>
        set((state) => ({
          baskets: state.baskets.filter((basket) => basket.id !== id),
        })),

      // Strategy actions
      setStrategies: (strategies) => set({ strategies }),
      addStrategy: (strategy) => set((state) => ({ strategies: [...state.strategies, strategy] })),
      updateStrategy: (id, updates) =>
        set((state) => ({
          strategies: state.strategies.map((strategy) =>
            strategy.id === id ? { ...strategy, ...updates } : strategy
          ),
        })),
      removeStrategy: (id) =>
        set((state) => ({
          strategies: state.strategies.filter((strategy) => strategy.id !== id),
        })),

      // Signal actions
      setSignals: (signals) => set({ signals }),
      addSignal: (signal) => set((state) => ({ signals: [signal, ...state.signals] })),
      updateSignal: (id, updates) =>
        set((state) => ({
          signals: state.signals.map((signal) =>
            signal.id === id ? { ...signal, ...updates } : signal
          ),
        })),

      // UI actions
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Portfolio actions
      setPortfolioValue: (portfolioValue) => set({ portfolioValue }),
      setTodayPnL: (todayPnL) => set({ todayPnL }),

      // Combined actions
      refreshData: async () => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          // Fetch all data in parallel
          const [basketsRes, strategiesRes, signalsRes] = await Promise.all([
            fetch(`/api/baskets?userId=${user.id}`),
            fetch(`/api/strategies?userId=${user.id}`),
            fetch(`/api/signals?userId=${user.id}&limit=50`)
          ])

          if (!basketsRes.ok || !strategiesRes.ok || !signalsRes.ok) {
            throw new Error('Failed to fetch data')
          }

          const [basketsData, strategiesData, signalsData] = await Promise.all([
            basketsRes.json(),
            strategiesRes.json(),
            signalsRes.json()
          ])

          set({
            baskets: basketsData.baskets || [],
            strategies: strategiesData.strategies || [],
            signals: signalsData.signals || [],
            isLoading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to refresh data',
            isLoading: false
          })
        }
      },

      connectZerodha: async (apiKey: string, apiSecret: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/zerodha/connect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey, apiSecret }),
          })

          if (!response.ok) {
            throw new Error('Failed to connect to Zerodha')
          }

          const data = await response.json()
          
          // Redirect to Zerodha for authorization
          if (data.loginUrl) {
            window.location.href = data.loginUrl
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to connect to Zerodha',
            isLoading: false
          })
        }
      },

      disconnectZerodha: async () => {
        set({ isLoading: true, error: null })

        try {
          // Update local state
          set({
            zerodhaProfile: null,
            isLoading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to disconnect Zerodha',
            isLoading: false
          })
        }
      },

      executeStrategy: async (strategyId: string) => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/strategies/execute', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ strategyId, userId: user.id }),
          })

          if (!response.ok) {
            throw new Error('Failed to execute strategy')
          }

          const data = await response.json()

          // Update strategy status
          get().updateStrategy(strategyId, { isRunning: false, lastRun: new Date() })

          // Add new signals if any
          if (data.results?.stockResults) {
            // Refresh signals to get the latest
            get().refreshData()
          }

          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to execute strategy',
            isLoading: false
          })
        }
      },
    }),
    {
      name: 'zerodha-trading-store',
    }
  )
)