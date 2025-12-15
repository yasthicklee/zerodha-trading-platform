export interface SuperTrendSignal {
  type: 'BUY' | 'SELL' | 'HOLD'
  strength: number
  price: number
  notes: string
  trend: 'UPTREND' | 'DOWNTREND'
  distance: number
}

export interface OHLCData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export class SuperTrendStrategy {
  private period: number
  private multiplier: number

  constructor(period: number = 10, multiplier: number = 3.0) {
    this.period = period
    this.multiplier = multiplier
  }

  getSignal(ohlcData: OHLCData[]): SuperTrendSignal | null {
    if (!ohlcData || ohlcData.length < this.period + 10) {
      return null
    }

    // Calculate SuperTrend
    const superTrendResult = this.calculateSuperTrend(ohlcData)
    
    if (!superTrendResult || superTrendResult.supertrend.length < 2) {
      return null
    }

    const currentTrend = superTrendResult.trend[superTrendResult.trend.length - 1]
    const previousTrend = superTrendResult.trend[superTrendResult.trend.length - 2]
    const currentPrice = ohlcData[ohlcData.length - 1].close
    const currentSuperTrend = superTrendResult.supertrend[superTrendResult.supertrend.length - 1]

    // Determine signal
    let signal: SuperTrendSignal | null = null

    if (currentTrend === 1 && previousTrend === -1) {
      // Trend changed from downtrend to uptrend - BUY signal
      const strength = Math.min(1.0, Math.max(0.1, (currentPrice - currentSuperTrend) / currentSuperTrend * 10))
      signal = {
        type: 'BUY',
        strength,
        price: currentPrice,
        notes: `SuperTrend BUY signal. Trend changed from DOWNTREND to UPTREND. Distance: ${((currentPrice - currentSuperTrend) / currentSuperTrend * 100).toFixed(2)}%`,
        trend: 'UPTREND',
        distance: Math.abs((currentPrice - currentSuperTrend) / currentSuperTrend * 100)
      }
    } else if (currentTrend === -1 && previousTrend === 1) {
      // Trend changed from uptrend to downtrend - SELL signal
      const strength = Math.min(1.0, Math.max(0.1, (currentSuperTrend - currentPrice) / currentPrice * 10))
      signal = {
        type: 'SELL',
        strength,
        price: currentPrice,
        notes: `SuperTrend SELL signal. Trend changed from UPTREND to DOWNTREND. Distance: ${((currentSuperTrend - currentPrice) / currentPrice * 100).toFixed(2)}%`,
        trend: 'DOWNTREND',
        distance: Math.abs((currentSuperTrend - currentPrice) / currentPrice * 100)
      }
    } else {
      // No trend change - HOLD
      signal = {
        type: 'HOLD',
        strength: 0.5,
        price: currentPrice,
        notes: `No trend change. Current trend: ${currentTrend === 1 ? 'UPTREND' : 'DOWNTREND'}`,
        trend: currentTrend === 1 ? 'UPTREND' : 'DOWNTREND',
        distance: Math.abs((currentPrice - currentSuperTrend) / currentSuperTrend * 100)
      }
    }

    return signal
  }

  private calculateSuperTrend(ohlcData: OHLCData[]) {
    if (ohlcData.length < this.period) {
      return null
    }

    const high = ohlcData.map(d => d.high)
    const low = ohlcData.map(d => d.low)
    const close = ohlcData.map(d => d.close)

    // Calculate ATR
    const atr = this.calculateATR(high, low, close, this.period)
    if (!atr) {
      return null
    }

    // Calculate basic upper and lower bands
    const hl2 = high.map((h, i) => (h + low[i]) / 2)
    const basicUpper = hl2.slice(this.period).map((hl, i) => hl + (this.multiplier * atr[i]))
    const basicLower = hl2.slice(this.period).map((hl, i) => hl - (this.multiplier * atr[i]))

    // Adjust arrays to match length
    const closeAdj = close.slice(this.period)
    const highAdj = high.slice(this.period)
    const lowAdj = low.slice(this.period)

    // Initialize SuperTrend arrays
    const supertrend = new Array(closeAdj.length).fill(0)
    const trend = new Array(closeAdj.length).fill(0)
    const finalUpper = new Array(closeAdj.length).fill(0)
    const finalLower = new Array(closeAdj.length).fill(0)

    // First value
    supertrend[0] = basicUpper[0]
    trend[0] = -1  // Start with downtrend
    finalUpper[0] = basicUpper[0]
    finalLower[0] = basicLower[0]

    for (let i = 1; i < closeAdj.length; i++) {
      // Calculate final upper band
      if (basicUpper[i] < finalUpper[i - 1] || closeAdj[i - 1] > finalUpper[i - 1]) {
        finalUpper[i] = basicUpper[i]
      } else {
        finalUpper[i] = finalUpper[i - 1]
      }

      // Calculate final lower band
      if (basicLower[i] > finalLower[i - 1] || closeAdj[i - 1] < finalLower[i - 1]) {
        finalLower[i] = basicLower[i]
      } else {
        finalLower[i] = finalLower[i - 1]
      }

      // Determine trend direction
      if (supertrend[i - 1] === finalUpper[i - 1]) {
        if (closeAdj[i] <= finalUpper[i]) {
          supertrend[i] = finalUpper[i]
          trend[i] = -1  // Downtrend
        } else {
          supertrend[i] = finalLower[i]
          trend[i] = 1   // Uptrend
        }
      } else {  // supertrend[i-1] == finalLower[i-1]
        if (closeAdj[i] >= finalLower[i]) {
          supertrend[i] = finalLower[i]
          trend[i] = 1   // Uptrend
        } else {
          supertrend[i] = finalUpper[i]
          trend[i] = -1  // Downtrend
        }
      }
    }

    return {
      supertrend,
      trend,
      finalUpper,
      finalLower
    }
  }

  private calculateATR(high: number[], low: number[], close: number[], period: number): number[] | null {
    if (high.length < period || low.length < period || close.length < period) {
      return null
    }

    // Calculate True Range
    const tr: number[] = []
    for (let i = 1; i < high.length; i++) {
      const tr1 = high[i] - low[i]
      const tr2 = Math.abs(high[i] - close[i - 1])
      const tr3 = Math.abs(low[i] - close[i - 1])
      tr.push(Math.max(tr1, tr2, tr3))
    }

    // Calculate ATR
    const atr: number[] = new Array(tr.length).fill(0)
    atr[period - 1] = tr.slice(0, period).reduce((sum, val) => sum + val, 0) / period

    for (let i = period; i < tr.length; i++) {
      atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period
    }

    return atr
  }

  // Utility method to get current trend without signal
  getCurrentTrend(ohlcData: OHLCData[]): 'UPTREND' | 'DOWNTREND' | 'UNKNOWN' {
    const signal = this.getSignal(ohlcData)
    return signal ? signal.trend : 'UNKNOWN'
  }

  // Utility method to get distance from SuperTrend line
  getDistanceFromSuperTrend(ohlcData: OHLCData[]): number {
    const signal = this.getSignal(ohlcData)
    return signal ? signal.distance : 0
  }
}