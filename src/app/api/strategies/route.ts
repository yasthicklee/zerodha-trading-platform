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

    const strategies = await db.userStrategy.findMany({
      where: { userId },
      include: {
        basket: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            strategyType: true
          }
        },
        _count: {
          select: {
            signals: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      strategies
    })
  } catch (error) {
    console.error('Get strategies error:', error)
    return NextResponse.json(
      { error: 'Failed to get strategies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      basketId, 
      templateId, 
      name,
      supertrendPeriod,
      supertrendMultiplier,
      supertrendAtrPeriod,
      timeframe,
      signalType,
      entryCondition,
      exitCondition,
      stopLossPercent,
      targetPercent
    } = await request.json()

    if (!userId || !basketId || !templateId || !name) {
      return NextResponse.json(
        { error: 'User ID, basket ID, template ID, and name are required' },
        { status: 400 }
      )
    }

    // Create strategy
    const strategy = await db.userStrategy.create({
      data: {
        userId,
        basketId,
        templateId,
        name,
        supertrendPeriod: supertrendPeriod || 10,
        supertrendMultiplier: supertrendMultiplier || 3.0,
        supertrendAtrPeriod: supertrendAtrPeriod || 10,
        timeframe: timeframe || '1d',
        signalType: signalType || 'both',
        entryCondition: entryCondition || 'trend_change',
        exitCondition: exitCondition || 'reverse_signal',
        stopLossPercent: stopLossPercent || 2.0,
        targetPercent: targetPercent || 5.0
      },
      include: {
        basket: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            strategyType: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      strategy
    })
  } catch (error) {
    console.error('Create strategy error:', error)
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    )
  }
}