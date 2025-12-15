import crypto from 'crypto'

export class ZerodhaAPI {
  private static readonly BASE_URL = 'https://api.kite.trade'
  private static readonly LOGIN_URL = 'https://kite.zerodha.com/connect/login'

  static getLoginUrl(apiKey: string, redirectUri: string): string {
    const params = new URLSearchParams({
      api_key: apiKey,
      redirect_uri: redirectUri,
      v: '3'
    })
    return `${this.LOGIN_URL}?${params.toString()}`
  }

  static async generateSession(
    requestToken: string,
    apiKey: string,
    apiSecret: string
  ): Promise<any> {
    try {
      // Calculate checksum
      const checksumInput = `${apiKey}${requestToken}${apiSecret}`
      const checksum = crypto.createHash('sha256').update(checksumInput).digest('hex')

      const formData = new URLSearchParams({
        api_key: apiKey,
        request_token: requestToken,
        checksum: checksum
      })

      const response = await fetch(`${this.BASE_URL}/session/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Kite-version': '3'
        },
        body: formData.toString()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Session generation error:', error)
      throw error
    }
  }

  static async getProfile(apiKey: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `token ${apiKey}:${accessToken}`,
          'X-Kite-version': '3'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  }

  static async getHistoricalData(
    apiKey: string,
    accessToken: string,
    symbol: string,
    interval: string = 'day',
    from_date?: string,
    to_date?: string,
    period: number = 100
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        from: from_date || new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: to_date || new Date().toISOString().split('T')[0],
        oi: '1'
      })

      const response = await fetch(
        `${this.BASE_URL}/instruments/historical/${symbol}/${interval}?${params.toString()}`,
        {
          headers: {
            'Authorization': `token ${apiKey}:${accessToken}`,
            'X-Kite-version': '3'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get historical data error:', error)
      throw error
    }
  }

  static async getQuote(apiKey: string, accessToken: string, symbols: string[]): Promise<any> {
    try {
      const symbolsParam = symbols.join(',')
      const response = await fetch(`${this.BASE_URL}/quote?i=${symbolsParam}`, {
        headers: {
          'Authorization': `token ${apiKey}:${accessToken}`,
          'X-Kite-version': '3'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get quote error:', error)
      throw error
    }
  }

  static async placeOrder(
    apiKey: string,
    accessToken: string,
    orderParams: {
      exchange: string
      tradingsymbol: string
      transaction_type: 'BUY' | 'SELL'
      quantity: number
      order_type: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M'
      product: 'CNC' | 'NRML' | 'MIS'
      price?: number
      trigger_price?: number
      validity?: string
      disclosed_quantity?: number
    }
  ): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/orders/regular`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${apiKey}:${accessToken}`,
          'X-Kite-version': '3',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderParams)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Place order error:', error)
      throw error
    }
  }

  static async getOrders(apiKey: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/orders`, {
        headers: {
          'Authorization': `token ${apiKey}:${accessToken}`,
          'X-Kite-version': '3'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get orders error:', error)
      throw error
    }
  }

  static async getPositions(apiKey: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/positions`, {
        headers: {
          'Authorization': `token ${apiKey}:${accessToken}`,
          'X-Kite-version': '3'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get positions error:', error)
      throw error
    }
  }

  static async getHoldings(apiKey: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/portfolio/holdings`, {
        headers: {
          'Authorization': `token ${apiKey}:${accessToken}`,
          'X-Kite-version': '3'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get holdings error:', error)
      throw error
    }
  }
}