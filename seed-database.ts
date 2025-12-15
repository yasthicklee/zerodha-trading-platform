import { db } from '@/lib/db'

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create default strategy templates
    const existingTemplates = await db.strategyTemplate.findMany()
    
    if (existingTemplates.length === 0) {
      const supertrendTemplate = await db.strategyTemplate.create({
        data: {
          name: 'SuperTrend Indicator',
          description: 'SuperTrend trend-following indicator strategy that generates buy/sell signals based on trend changes',
          strategyType: 'supertrend',
          scriptPath: 'strategies/supertrend.py',
          isActive: true,
          version: '1.0'
        }
      })

      const movingAverageTemplate = await db.strategyTemplate.create({
        data: {
          name: 'Moving Average Crossover',
          description: 'Buy when short MA crosses above long MA, sell when crosses below',
          strategyType: 'moving_average',
          scriptPath: 'strategies/moving_average.py',
          isActive: false,
          version: '1.0'
        }
      })

      const rsiTemplate = await db.strategyTemplate.create({
        data: {
          name: 'RSI Mean Reversion',
          description: 'Buy when RSI is oversold, sell when overbought',
          strategyType: 'rsi',
          scriptPath: 'strategies/rsi.py',
          isActive: false,
          version: '1.0'
        }
      })

      console.log('✅ Strategy templates created:', {
        supertrend: supertrendTemplate.id,
        movingAverage: movingAverageTemplate.id,
        rsi: rsiTemplate.id
      })
    } else {
      console.log('✅ Strategy templates already exist')
    }

    // Get or create demo user
    let demoUser = await db.user.findUnique({
      where: { email: 'demo@example.com' }
    })

    if (!demoUser) {
      demoUser = await db.user.create({
        data: {
          username: 'demo_user',
          email: 'demo@example.com',
          passwordHash: 'demo_password_hash', // In production, use proper hashing
          isActive: true,
          lastLogin: new Date()
        }
      })
      console.log('✅ Demo user created:', demoUser.id)
    } else {
      console.log('✅ Demo user already exists:', demoUser.id)
    }

    // Get or create demo baskets
    const existingBaskets = await db.tradingBasket.findMany({
      where: { userId: demoUser.id }
    })

    let techBasket, bankingBasket

    if (existingBaskets.length === 0) {
      techBasket = await db.tradingBasket.create({
        data: {
          userId: demoUser.id,
          name: 'Tech Giants',
          description: 'Top technology companies in Indian market',
          isActive: true,
          stocks: {
            create: [
              { symbol: 'RELIANCE', exchange: 'NSE', quantity: 10, weight: 0.3, isActive: true },
              { symbol: 'TCS', exchange: 'NSE', quantity: 5, weight: 0.25, isActive: true },
              { symbol: 'INFY', exchange: 'NSE', quantity: 15, weight: 0.2, isActive: true },
              { symbol: 'HDFCBANK', exchange: 'NSE', quantity: 8, weight: 0.15, isActive: true },
              { symbol: 'ICICIBANK', exchange: 'NSE', quantity: 12, weight: 0.1, isActive: true }
            ]
          }
        }
      })

      bankingBasket = await db.tradingBasket.create({
        data: {
          userId: demoUser.id,
          name: 'Banking Sector',
          description: 'Major banking and financial institutions',
          isActive: true,
          stocks: {
            create: [
              { symbol: 'HDFCBANK', exchange: 'NSE', quantity: 10, weight: 0.3, isActive: true },
              { symbol: 'ICICIBANK', exchange: 'NSE', quantity: 15, weight: 0.25, isActive: true },
              { symbol: 'SBIN', exchange: 'NSE', quantity: 20, weight: 0.2, isActive: true },
              { symbol: 'KOTAKBANK', exchange: 'NSE', quantity: 8, weight: 0.15, isActive: true },
              { symbol: 'AXISBANK', exchange: 'NSE', quantity: 12, weight: 0.1, isActive: true }
            ]
          }
        }
      })

      console.log('✅ Demo baskets created:', {
        tech: techBasket.id,
        banking: bankingBasket.id
      })
    } else {
      techBasket = existingBaskets.find(b => b.name === 'Tech Giants')
      bankingBasket = existingBaskets.find(b => b.name === 'Banking Sector')
      console.log('✅ Demo baskets already exist')
    }

    // Get or create demo strategies
    const existingStrategies = await db.userStrategy.findMany({
      where: { userId: demoUser.id }
    })

    if (existingStrategies.length === 0) {
      const supertrendTemplate = await db.strategyTemplate.findFirst({
        where: { strategyType: 'supertrend' }
      })
      const movingAverageTemplate = await db.strategyTemplate.findFirst({
        where: { strategyType: 'moving_average' }
      })

      if (supertrendTemplate && techBasket) {
        const techStrategy = await db.userStrategy.create({
          data: {
            userId: demoUser.id,
            basketId: techBasket.id,
            templateId: supertrendTemplate.id,
            name: 'Tech SuperTrend',
            supertrendPeriod: 10,
            supertrendMultiplier: 3.0,
            supertrendAtrPeriod: 10,
            timeframe: '1d',
            signalType: 'both',
            entryCondition: 'trend_change',
            exitCondition: 'reverse_signal',
            stopLossPercent: 2.0,
            targetPercent: 5.0,
            isActive: true,
            isRunning: false
          }
        })
        console.log('✅ Tech strategy created:', techStrategy.id)

        // Create demo signals for tech strategy
        const demoSignals = [
          {
            strategyId: techStrategy.id,
            symbol: 'RELIANCE',
            exchange: 'NSE',
            signalType: 'BUY',
            signalStrength: 0.85,
            price: 2456.80,
            quantity: 10,
            notes: 'SuperTrend BUY signal. Trend changed from DOWNTREND to UPTREND.'
          },
          {
            strategyId: techStrategy.id,
            symbol: 'TCS',
            exchange: 'NSE',
            signalType: 'SELL',
            signalStrength: 0.72,
            price: 3421.50,
            quantity: 5,
            notes: 'SuperTrend SELL signal. Trend changed from UPTREND to DOWNTREND.'
          }
        ]

        for (const signalData of demoSignals) {
          await db.strategySignal.create({
            data: signalData
          })
        }
        console.log('✅ Demo signals created:', demoSignals.length)
      }

      if (movingAverageTemplate && bankingBasket) {
        const bankingStrategy = await db.userStrategy.create({
          data: {
            userId: demoUser.id,
            basketId: bankingBasket.id,
            templateId: movingAverageTemplate.id,
            name: 'Banking MA Crossover',
            supertrendPeriod: 10,
            supertrendMultiplier: 3.0,
            supertrendAtrPeriod: 10,
            timeframe: '1d',
            signalType: 'both',
            entryCondition: 'trend_change',
            exitCondition: 'reverse_signal',
            stopLossPercent: 1.5,
            targetPercent: 3.0,
            isActive: true,
            isRunning: false
          }
        })
        console.log('✅ Banking strategy created:', bankingStrategy.id)
      }
    } else {
      console.log('✅ Demo strategies already exist')
    }

    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seeding function only if not in production
if (process.env.NODE_ENV !== 'production') {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
} else {
  console.log('Skipping database seeding in production')
}