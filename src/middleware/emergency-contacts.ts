import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import clientPromise from '@/lib/mongodb'

export async function checkEmergencyContacts(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.email) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Check if user has emergency contacts
    const client = await clientPromise
    const db = client.db('guardianpath')
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne({ email: token.email })
    
    if (user && (!user.emergencyContacts || user.emergencyContacts.length === 0)) {
      // If accessing dashboard without emergency contacts, redirect to add contacts
      if (request.nextUrl.pathname === '/dashboard') {
        const emergencyContactsUrl = new URL('/emergency-contacts', request.url)
        emergencyContactsUrl.searchParams.set('required', 'true')
        return NextResponse.redirect(emergencyContactsUrl)
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Emergency contacts check failed:', error)
    return NextResponse.next()
  }
}
