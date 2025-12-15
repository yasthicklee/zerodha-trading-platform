import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZerodhaAPI } from '@/lib/zerodha-api'
import { SuperTrendStrategy, SuperTrendSignal } from '@/lib/strategies/supertrend'

interface StrategyExecutionResult {
  strategyId: string
  strategyName: string
  basketName: string
  stockResults: Array<{
    symbol: any
    signal: "BUY" | "SELL" | "HOLD"
    strength: number
    price: number
    notes: string
  }>
  totalSignals: number
  buySignals: number
  sellSignals: number
}

export async function POST(request: NextRequest) {
  try {
    const { strategyId, userId } = await request.json()

    if (!strategyId || !userId) {
      return NextResponse.json(
        { error: 'Strategy ID and user ID are required' },
        { status: 400 }
      )
    }

    // Get strategy with basket and template
    const strategy = await db.userStrategy.findUnique({
      where: { id: strategyId },
      include: {
        basket: {
          include: {
            stocks: {
              where: { isActive: true }
            }
          }
        },
        template: true,
        user: {
          include: {
            zerodhaProfile: true
          }
        }
      }
    })

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      )
    }

    if (!strategy.user.zerodhaProfile?.isConnected) {
      return NextResponse.json(
        { error: 'Zerodha account not connected' },
        { status: 400 }
      )
    }

    // Update strategy status to running
    await db.userStrategy.update({
      where: { id: strategyId },
      data: {
        isRunning: true,
        lastRun: new Date()
      }
    })

    try {
      // Get Zerodha API credentials
      const profile = strategy.user.zerodhaProfile
      const accessToken = profile?.accessTokenEncrypted 
        ? decryptAccessToken(profile.accessTokenEncrypted) 
        : null

      if (!accessToken || !profile.apiKey) {
        throw new Error('Zerodha credentials not available')
      }

      // Execute strategy
      const results = await executeStrategyLogic(strategy, profile.apiKey, accessToken)

      // Update strategy status
      await db.userStrategy.update({
        where: { id: strategyId },
        data: {
          isRunning: false
        }
      })

      return NextResponse.json({
        success: true,
        results
      })

    } catch (executionError) {
      // Update strategy status to not running on error
      await db.userStrategy.update({
        where: { id: strategyId },
        data: {
          isRunning: false
        }
      })

      throw executionError
    }

  } catch (error) {
    console.error('Execute strategy error:', error)
    return NextResponse.json(
      { error: 'Failed to execute strategy' },
      { status: 500 }
    )
  }
}

async function executeStrategyLogic(strategy: any, apiKey: string, accessToken: string) {
  const basket = strategy.basket
  const stocks = basket.stocks

  if (stocks.length === 0) {
    throw new Error('No active stocks in basket')
  }

  const results: StrategyExecutionResult = {
    strategyId: strategy.id,
    strategyName: strategy.name,
    basketName: basket.name,
    stockResults: [],
    totalSignals: 0,
    buySignals: 0,
    sellSignals: 0
  }

  // Execute strategy for each stock
  for (const stock of stocks) {
    try {
      // Get historical data
      const historicalData = await ZerodhaAPI.getHistoricalData(
        apiKey,
        accessToken,
        `${stock.symbol}.${stock.exchange}`,
        strategy.timeframe,
        undefined,
        undefined,
        100
      )

      if (!historicalData.data?.candles || historicalData.data.candles.length < 20) {
        continue
      }

      // Convert to OHLC format
      const ohlcData = historicalData.data.candles.map((candle: any) => ({
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5] || 0
      }))

      // Execute SuperTrend strategy
      const superTrend = new SuperTrendStrategy(
        strategy.supertrendPeriod,
        strategy.supertrendMultiplier
      )

      const signal: SuperTrendSignal | null = superTrend.getSignal(ohlcData)

      if (signal) {
        // Create signal record
        await db.strategySignal.create({
          data: {
            strategyId: strategy.id,
            symbol: stock.symbol,
            exchange: stock.exchange,
            signalType: signal.type,
            signalStrength: signal.strength,
            price: signal.price,
            quantity: stock.quantity,
            notes: signal.notes
          }
        })

        results.stockResults.push({
          symbol: stock.symbol,
          signal: signal.type,
          strength: signal.strength,
          price: signal.price,
          notes: signal.notes
        })

        results.totalSignals++
        if (signal.type === 'BUY') {
          results.buySignals++
        } else if (signal.type === 'SELL') {
          results.sellSignals++
        }
      }

    } catch (stockError) {
      console.error(`Error processing stock ${stock.symbol}:`, stockError)
      continue
    }
  }

  return results
}

function decryptAccessToken(encryptedToken: string): string {
  try {
    // In a real implementation, you would use proper encryption/decryption
    // For now, we'll return the encrypted string as-is (this is just for demo)
    return Buffer.from(encryptedToken, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Decrypt access token error:', error)
    return ''
  }
}