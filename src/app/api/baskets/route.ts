import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const baskets = await db.tradingBasket.findMany({
      where: { userId },
      include: {
        stocks: {
          select: {
            id: true,
            symbol: true,
            exchange: true,
            quantity: true,
            weight: true,
            isActive: true
          }
        },
        _count: {
          select: {
            stocks: true,
            userStrategies: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      baskets
    })
  } catch (error) {
    console.error('Get baskets error:', error)
    return NextResponse.json(
      { error: 'Failed to get baskets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, name, description, stocks } = await request.json()

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'User ID and name are required' },
        { status: 400 }
      )
    }

    // Create basket
    const basket = await db.tradingBasket.create({
      data: {
        userId,
        name,
        description,
        stocks: stocks ? {
          create: stocks.map((stock: any) => ({
            symbol: stock.symbol,
            exchange: stock.exchange || 'NSE',
            quantity: stock.quantity || 1,
            weight: stock.weight || 1.0,
            isActive: stock.isActive !== false
          }))
        } : undefined
      },
      include: {
        stocks: true
      }
    })

    return NextResponse.json({
      success: true,
      basket
    })
  } catch (error) {
    console.error('Create basket error:', error)
    return NextResponse.json(
      { error: 'Failed to create basket' },
      { status: 500 }
    )
  }
}