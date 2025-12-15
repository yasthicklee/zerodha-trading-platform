import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const strategyId = searchParams.get('strategyId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      strategy: {
        userId
      }
    }

    if (strategyId) {
      whereClause.strategyId = strategyId
    }

    const signals = await db.strategySignal.findMany({
      where: whereClause,
      include: {
        strategy: {
          select: {
            id: true,
            name: true,
            basket: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      signals
    })
  } catch (error) {
    console.error('Get signals error:', error)
    return NextResponse.json(
      { error: 'Failed to get signals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      strategyId, 
      symbol, 
      exchange, 
      signalType, 
      signalStrength, 
      price, 
      quantity, 
      notes 
    } = await request.json()

    if (!strategyId || !symbol || !signalType) {
      return NextResponse.json(
        { error: 'Strategy ID, symbol, and signal type are required' },
        { status: 400 }
      )
    }

    // Create signal
    const signal = await db.strategySignal.create({
      data: {
        strategyId,
        symbol,
        exchange: exchange || 'NSE',
        signalType,
        signalStrength: signalStrength || 1.0,
        price: price || 0,
        quantity: quantity || 1,
        notes
      },
      include: {
        strategy: {
          select: {
            id: true,
            name: true,
            basket: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      signal
    })
  } catch (error) {
    console.error('Create signal error:', error)
    return NextResponse.json(
      { error: 'Failed to create signal' },
      { status: 500 }
    )
  }
}