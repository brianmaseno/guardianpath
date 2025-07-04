// Type definitions for GuardianPath application

export interface Location {
  lat: number
  lng: number
}

export interface PanicEvent {
  _id?: string
  panicId: string
  location?: Location
  timestamp: string | Date
  photo?: string
  status: 'active' | 'resolved' | 'cancelled'
  imageAnalysis?: ImageAnalysis
  safetyData?: SafetyData
  notificationResult?: NotificationResult
  createdAt?: Date
  updatedAt?: Date
}

export interface ImageAnalysis {
  description: string
  confidence: number
  objects: Array<{
    name: string
    confidence: number
    rectangle?: {
      x: number
      y: number
      w: number
      h: number
    }
  }>
  tags: Array<{
    name: string
    confidence: number
  }>
  isAdultContent: boolean
  isRacyContent: boolean
  landmarks: Array<{
    name: string
    confidence: number
  }>
}

export interface SafetyData {
  currentAddress: string
  nearbyHospitals: Array<{
    name: string
    distance: number
    address: string
  }>
  nearbyPoliceStations: Array<{
    name: string
    distance: number
    address: string
  }>
}

export interface NotificationResult {
  success: boolean
  contactsNotified: number
  notifications: Array<{
    contact: string
    phone: string
    email: string
    status: string
    method: string[]
    timestamp: string
    messageId: string
  }>
  message: string
}

export interface EmergencyContact {
  _id?: string
  name: string
  phone: string
  email: string
  relationship: string
  isPrimary?: boolean
  isActive?: boolean
}

export interface User {
  _id?: string
  email: string
  name: string
  emergencyContacts: EmergencyContact[]
  preferences: {
    autoLocation: boolean
    autoPhoto: boolean
    notificationMethods: string[]
  }
  createdAt?: Date
  updatedAt?: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}
