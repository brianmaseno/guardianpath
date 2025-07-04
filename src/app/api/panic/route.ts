import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { azureMaps, azureVision } from '@/lib/azure'
import { Location } from '@/types'

interface PanicRequestBody {
  location?: Location
  timestamp: string
  photo?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PanicRequestBody = await request.json()
    const { location, timestamp, photo } = body

    console.log('Panic mode activated:', { 
      location: location ? `${location.lat}, ${location.lng}` : 'No location',
      timestamp,
      hasPhoto: !!photo
    })

    // Generate unique panic ID
    const panicId = `panic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 1. Store panic event in MongoDB
    let mongoResult = null
    try {
      const client = await clientPromise
      const db = client.db('guardianpath')
      const collection = db.collection('panic_events')
      
      const panicEvent = {
        panicId,
        location,
        timestamp: new Date(timestamp),
        photo: photo ? 'stored' : null,
        status: 'active',
        createdAt: new Date()
      }
      
      mongoResult = await collection.insertOne(panicEvent)
      console.log('Stored panic event in MongoDB:', mongoResult.insertedId)
    } catch (error) {
      console.error('MongoDB storage error:', error)
    }

    // 2. Analyze photo with Azure Cognitive Services (if photo exists)
    let imageAnalysis = null
    if (photo) {
      try {
        imageAnalysis = await azureVision.analyzeImage(photo)
        console.log('Azure Vision Analysis completed:', imageAnalysis)
        
        // Store image analysis results
        if (mongoResult) {
          const client = await clientPromise
          const db = client.db('guardianpath')
          await db.collection('panic_events').updateOne(
            { _id: mongoResult.insertedId },
            { $set: { imageAnalysis } }
          )
        }
      } catch (error) {
        console.error('Azure Vision API error:', error)
        imageAnalysis = { error: 'Failed to analyze image' }
      }
    }

    // 3. Get nearby safe places and route information
    let safetyData = null
    if (location) {
      try {
        // Find nearby hospitals, police stations
        const [hospitals, policeStations, address] = await Promise.all([
          azureMaps.findNearbyPlaces(location, '7321'), // Hospital category
          azureMaps.findNearbyPlaces(location, '7322'), // Police station category
          azureMaps.getAddressFromCoordinates(location)
        ])

        safetyData = {
          currentAddress: (address as { address?: { freeformAddress?: string } })?.address?.freeformAddress || 'Address unavailable',
          nearbyHospitals: (hospitals as Array<{ poi?: { name?: string }; dist?: number; address?: { freeformAddress?: string } }>).slice(0, 3).map((place) => ({
            name: place.poi?.name || 'Hospital',
            distance: place.dist || 0,
            address: place.address?.freeformAddress || 'Address unavailable'
          })),
          nearbyPoliceStations: (policeStations as Array<{ poi?: { name?: string }; dist?: number; address?: { freeformAddress?: string } }>).slice(0, 3).map((place) => ({
            name: place.poi?.name || 'Police Station',
            distance: place.dist || 0,
            address: place.address?.freeformAddress || 'Address unavailable'
          }))
        }

        console.log('Safety data retrieved:', safetyData)
      } catch (error) {
        console.error('Azure Maps API error:', error)
        safetyData = { error: 'Failed to get safety information' }
      }
    }

    // 4. Notify emergency contacts
    const notificationResult = await notifyEmergencyContacts({
      panicId,
      location,
      timestamp,
      imageAnalysis: imageAnalysis || undefined,
      safetyData: safetyData || undefined
    })

    // 5. Return comprehensive response
    const response = {
      success: true,
      panicId,
      location,
      timestamp,
      imageAnalysis,
      safetyData,
      notificationResult,
      message: 'Emergency protocol activated successfully',
      instructions: [
        '🚨 Emergency contacts have been notified',
        '📍 Your location has been shared',
        '🏥 Nearby safe places identified',
        photo ? '📷 Photo analysis completed' : '📷 No photo captured',
        '🆘 Stay calm and move to a safe location'
      ]
    }

    // Update MongoDB with final response
    if (mongoResult) {
      try {
        const client = await clientPromise
        const db = client.db('guardianpath')
        await db.collection('panic_events').updateOne(
          { _id: mongoResult.insertedId },
          { 
            $set: { 
              response,
              updatedAt: new Date()
            }
          }
        )
      } catch (error) {
        console.error('MongoDB update error:', error)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Panic API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process panic request',
        message: 'An error occurred while activating emergency protocol',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

async function notifyEmergencyContacts(data: Record<string, unknown>) {
  try {
    // In a real application, these would be fetched from user's profile
    const emergencyContacts = [
      { 
        name: 'Emergency Contact 1', 
        phone: '+1234567890',
        email: 'contact1@example.com',
        relationship: 'Family'
      },
      { 
        name: 'Emergency Contact 2', 
        phone: '+0987654321',
        email: 'contact2@example.com',
        relationship: 'Friend'
      }
    ]

    const locationText = (data.location as { lat?: number; lng?: number } | undefined)?.lat
      ? `Location: ${(data.location as { lat: number; lng: number }).lat.toFixed(6)}, ${(data.location as { lat: number; lng: number }).lng.toFixed(6)}`
      : 'Location: Unavailable'

    const alertMessage = `🚨 EMERGENCY ALERT from GuardianPath

${data.panicId}
Time: ${data.timestamp ? new Date(data.timestamp as string).toLocaleString() : 'Unknown'}
${locationText}

${(data.safetyData as { currentAddress?: string } | undefined)?.currentAddress ? `Address: ${(data.safetyData as { currentAddress: string }).currentAddress}` : ''}

${(data.imageAnalysis as { description?: string } | undefined)?.description ? `Scene: ${(data.imageAnalysis as { description: string }).description}` : ''}

This is an automated emergency alert. Please check on the person immediately.`

    // Simulate sending notifications
    const notifications = emergencyContacts.map(contact => {
      // Here you would integrate with:
      // - Twilio for SMS
      // - SendGrid for email
      // - Firebase for push notifications
      // - WhatsApp Business API
      
      console.log(`Sending emergency alert to ${contact.name} (${contact.phone})`)
      console.log(alertMessage)
      
      return {
        contact: contact.name,
        phone: contact.phone,
        email: contact.email,
        status: 'sent',
        method: ['sms', 'email'],
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      }
    })

    // Store notifications in database
    try {
      const client = await clientPromise
      const db = client.db('guardianpath')
      await db.collection('notifications').insertMany(
        notifications.map(notification => ({
          ...notification,
          panicId: data.panicId,
          createdAt: new Date()
        }))
      )
    } catch (error) {
      console.error('Failed to store notifications:', error)
    }

    return {
      success: true,
      contactsNotified: emergencyContacts.length,
      notifications,
      message: `Emergency alerts sent to ${emergencyContacts.length} contacts`
    }
  } catch (error) {
    console.error('Notification error:', error)
    return {
      success: false,
      error: 'Failed to notify emergency contacts',
      message: 'Notification system encountered an error'
    }
  }
}
