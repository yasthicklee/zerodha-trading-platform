import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZerodhaAPI } from '@/lib/zerodha-api'

export async function POST(request: NextRequest) {
  try {
    const { apiKey, apiSecret, redirectUri } = await request.json()

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'API key and secret are required' },
        { status: 400 }
      )
    }

    // Generate login URL
    const loginUrl = ZerodhaAPI.getLoginUrl(apiKey, redirectUri || 'http://localhost:3000/api/zerodha/callback')

    return NextResponse.json({
      success: true,
      loginUrl,
      message: 'Please visit the URL to authorize your Zerodha account'
    })
  } catch (error) {
    console.error('Zerodha connect error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to Zerodha' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's Zerodha profile
    const profile = await db.zerodhaProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        apiKey: true,
        isConnected: true,
        connectionStatus: true,
        lastConnected: true,
        zerodhaUserId: true,
        userName: true,
        email: true,
        broker: true,
        exchanges: true,
        createdAt: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Zerodha profile not found' },
        { status: 404 }
      )
    }

    // Mask API key for security
    const maskedApiKey = profile.apiKey 
      ? profile.apiKey.slice(0, 4) + '••••' + profile.apiKey.slice(-4)
      : null

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        apiKey: maskedApiKey
      }
    })
  } catch (error) {
    console.error('Get Zerodha profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get Zerodha profile' },
      { status: 500 }
    )
  }
}