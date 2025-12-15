import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZerodhaAPI } from '@/lib/zerodha-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestToken = searchParams.get('request_token')
    const userId = searchParams.get('user_id')

    if (!requestToken) {
      return NextResponse.json(
        { error: 'Request token is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's Zerodha profile
    const profile = await db.zerodhaProfile.findUnique({
      where: { userId }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Zerodha profile not found' },
        { status: 404 }
      )
    }

    // Decrypt API secret
    const apiSecret = decryptApiSecret(profile.apiSecretEncrypted)

    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Failed to decrypt API secret' },
        { status: 500 }
      )
    }

    // Generate access token
    const sessionData = await ZerodhaAPI.generateSession(
      requestToken,
      profile.apiKey,
      apiSecret
    )

    if (!sessionData || !sessionData.data?.access_token) {
      return NextResponse.json(
        { error: 'Failed to generate access token' },
        { status: 500 }
      )
    }

    const accessToken = sessionData.data.access_token

    // Get user profile info
    const userProfile = await ZerodhaAPI.getProfile(profile.apiKey, accessToken)

    // Update profile with access token and user info
    await db.zerodhaProfile.update({
      where: { id: profile.id },
      data: {
        accessTokenEncrypted: encryptAccessToken(accessToken),
        isConnected: true,
        connectionStatus: 'connected',
        lastConnected: new Date(),
        zerodhaUserId: userProfile.data?.user_id,
        userName: userProfile.data?.user_name,
        email: userProfile.data?.email,
        userType: userProfile.data?.user_type,
        broker: userProfile.data?.broker,
        exchanges: JSON.stringify(['NSE', 'BSE', 'NFO', 'CDS', 'MCX'])
      }
    })

    // Redirect to dashboard with success
    return NextResponse.redirect(new URL('/?zerodha=success', request.url))

  } catch (error) {
    console.error('Zerodha callback error:', error)
    return NextResponse.redirect(new URL('/?zerodha=error', request.url))
  }
}

function decryptApiSecret(encryptedSecret: string): string | null {
  try {
    // In a real implementation, you would use proper encryption/decryption
    // For now, we'll return the encrypted string as-is (this is just for demo)
    // In production, use a proper encryption library like crypto or iron-session
    return Buffer.from(encryptedSecret, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Decrypt API secret error:', error)
    return null
  }
}

function encryptAccessToken(token: string): string {
  // In a real implementation, you would use proper encryption
  // For now, we'll just base64 encode (this is just for demo)
  return Buffer.from(token).toString('base64')
}