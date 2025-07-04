import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { azureMaps, azureVision } from '@/lib/azure'
import { emailService } from '@/lib/email'
import { Location } from '@/types'

interface PanicRequestBody {
  location?: Location
  timestamp: string
  photo?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: PanicRequestBody = await request.json()
    const { location, timestamp, photo } = body

    console.log('Panic mode activated by:', session.user.email, { 
      location: location ? `${location.lat}, ${location.lng}` : 'No location',
      timestamp,
      hasPhoto: !!photo
    })

    // Get user's emergency contacts
    const client = await clientPromise
    const db = client.db('guardianpath')
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const emergencyContacts = user.emergencyContacts || []
    if (emergencyContacts.length === 0) {
      return NextResponse.json(
        { error: 'No emergency contacts found. Please add emergency contacts first.' },
        { status: 400 }
      )
    }

    // Generate unique panic ID
    const panicId = `panic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 1. Store panic event in MongoDB
    let mongoResult = null
    try {
      const panicEventsCollection = db.collection('panic_events')
      
      const panicEvent = {
        userId: user._id,
        userEmail: session.user.email,
        panicId,
        location,
        timestamp: new Date(timestamp),
        photo: photo ? 'stored' : null,
        status: 'active',
        safetyData: null, // Will be updated after safety data is retrieved
        imageAnalysis: null, // Will be updated after image analysis
        notificationResult: null, // Will be updated after notifications are sent
        createdAt: new Date()
      }
      
      mongoResult = await panicEventsCollection.insertOne(panicEvent)
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
        
        // Store safety data in database
        if (mongoResult) {
          const client = await clientPromise
          const db = client.db('guardianpath')
          await db.collection('panic_events').updateOne(
            { _id: mongoResult.insertedId },
            { $set: { safetyData } }
          )
        }
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
    }, emergencyContacts, {
      email: session.user.email,
      name: session.user.name || 'Unknown User'
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
              notificationResult,
              response,
              status: 'processed', // Update status to show it's been fully processed
              updatedAt: new Date()
            }
          }
        )
        console.log('✅ Panic event fully stored in database with all data')
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

async function notifyEmergencyContacts(data: Record<string, unknown>, contacts: any[], userInfo: { email: string; name: string }) {
  try {
    // Use the user's actual emergency contacts
    const emergencyContacts = contacts.filter(contact => contact.isActive !== false)

    // Prepare email data
    const emergencyEmailData = {
      panicId: data.panicId as string,
      userEmail: userInfo.email,
      userName: userInfo.name,
      timestamp: data.timestamp as string,
      location: data.location as { lat: number; lng: number } | undefined,
      currentAddress: (data.safetyData as { currentAddress?: string } | undefined)?.currentAddress,
      nearbyHospitals: (data.safetyData as { nearbyHospitals?: any[] } | undefined)?.nearbyHospitals,
      nearbyPoliceStations: (data.safetyData as { nearbyPoliceStations?: any[] } | undefined)?.nearbyPoliceStations,
      imageAnalysis: data.imageAnalysis as { description: string; confidence: number } | undefined,
      googleMapsUrl: data.location ? `https://maps.google.com/maps?q=${(data.location as { lat: number; lng: number }).lat},${(data.location as { lat: number; lng: number }).lng}` : undefined
    }

    // Get email addresses from contacts
    const contactEmails = emergencyContacts
      .filter(contact => contact.email && contact.email.trim() !== '')
      .map(contact => contact.email)

    if (contactEmails.length === 0) {
      console.warn('No valid email addresses found in emergency contacts')
      return {
        success: false,
        error: 'No valid email addresses found',
        message: 'Emergency contacts do not have valid email addresses'
      }
    }

    console.log(`📧 Sending emergency emails to: ${contactEmails.join(', ')}`)

    // Send the actual emergency emails
    const emailResult = await emailService.sendEmergencyAlert(emergencyEmailData, contactEmails)

    // Also send SMS if phone numbers are available (keeping existing logic)
    const notifications = emergencyContacts.map(contact => {
      const methods = []
      
      if (contact.email && contactEmails.includes(contact.email)) {
        methods.push('email')
        console.log(`📧 Emergency email queued for ${contact.name} (${contact.email})`)
      }
      
      if (contact.phone) {
        methods.push('sms')
        console.log(`📱 Emergency SMS simulation for ${contact.name} (${contact.phone})`)
      }
      
      return {
        contact: contact.name,
        phone: contact.phone || 'N/A',
        email: contact.email || 'N/A',
        status: emailResult.success ? 'sent' : 'failed',
        method: methods,
        primaryMethod: contact.email ? 'email' : 'sms',
        timestamp: new Date().toISOString(),
        messageId: emailResult.details.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        emailResult: emailResult.success ? 'delivered' : 'failed'
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
          emailDetails: emailResult.details,
          createdAt: new Date()
        }))
      )
    } catch (error) {
      console.error('Failed to store notifications:', error)
    }

    return {
      success: emailResult.success,
      contactsNotified: emergencyContacts.length,
      emailsSent: contactEmails.length,
      notifications,
      emailResult: emailResult.details,
      message: emailResult.success 
        ? `✅ Emergency emails sent successfully to ${contactEmails.length} contacts` 
        : `❌ Failed to send emergency emails: ${emailResult.details.error}`
    }
  } catch (error) {
    console.error('Notification error:', error)
    return {
      success: false,
      error: 'Failed to notify emergency contacts',
      message: 'Notification system encountered an error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
