import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('guardianpath')

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      emergencyContacts: [],
      preferences: {
        autoLocation: true,
        autoPhoto: true,
        notificationMethods: ['email', 'sms']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: result.insertedId 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
