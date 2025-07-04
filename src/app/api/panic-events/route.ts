import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db('guardianpath')
    
    // Get the user's panic events
    const panicEvents = await db.collection('panic_events')
      .find({ userEmail: session.user.email })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(20) // Limit to last 20 events
      .toArray()

    // Transform the data to match the expected format
    const transformedEvents = panicEvents.map(event => ({
      _id: event._id.toString(),
      panicId: event.panicId,
      location: event.location,
      timestamp: event.timestamp || event.createdAt,
      status: event.status,
      imageAnalysis: event.imageAnalysis,
      safetyData: event.safetyData,
      notificationResult: event.notificationResult
    }))

    return NextResponse.json({
      success: true,
      panicEvents: transformedEvents,
      count: transformedEvents.length
    })

  } catch (error) {
    console.error('Failed to fetch panic events:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch panic events',
        message: 'An error occurred while retrieving panic events'
      },
      { status: 500 }
    )
  }
}
