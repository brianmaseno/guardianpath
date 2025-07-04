import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface SessionUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as SessionUser
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('guardianpath')
    
    const userData = await db.collection('users').findOne({
      _id: new ObjectId(user.id)
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      emergencyContacts: userData.emergencyContacts || []
    })
  } catch (error) {
    console.error('Error fetching emergency contacts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as SessionUser
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, phone, email, relationship, isPrimary } = await req.json()

    if (!name || !phone || !email || !relationship) {
      return NextResponse.json(
        { error: 'Name, phone, email, and relationship are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('guardianpath')

    const newContact = {
      _id: new ObjectId(),
      name,
      phone,
      email,
      relationship,
      isPrimary: isPrimary || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      { 
        $push: { emergencyContacts: newContact } as any,
        $set: { updatedAt: new Date() }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to add emergency contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Emergency contact added successfully',
      contact: newContact
    })
  } catch (error) {
    console.error('Error adding emergency contact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as SessionUser
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contactId, name, phone, email, relationship, isPrimary, isActive } = await req.json()

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('guardianpath')

    const result = await db.collection('users').updateOne(
      { 
        _id: new ObjectId(user.id),
        'emergencyContacts._id': new ObjectId(contactId)
      },
      { 
        $set: {
          'emergencyContacts.$.name': name,
          'emergencyContacts.$.phone': phone,
          'emergencyContacts.$.email': email,
          'emergencyContacts.$.relationship': relationship,
          'emergencyContacts.$.isPrimary': isPrimary,
          'emergencyContacts.$.isActive': isActive,
          'emergencyContacts.$.updatedAt': new Date(),
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update emergency contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Emergency contact updated successfully'
    })
  } catch (error) {
    console.error('Error updating emergency contact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as SessionUser
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const contactId = url.searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('guardianpath')

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      { 
        $pull: { emergencyContacts: { _id: new ObjectId(contactId) } } as any,
        $set: { updatedAt: new Date() }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete emergency contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Emergency contact deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting emergency contact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
