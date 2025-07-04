'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Clock,
  MapPin,
  Users,
  Camera,
  Activity,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { PanicEvent } from '@/types'

export default function Dashboard() {
  const [panicEvents, setPanicEvents] = useState<PanicEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPanicEvents()
  }, [])

  const fetchPanicEvents = async () => {
    try {
      // In a real app, this would fetch from /api/panic-events
      // For now, we'll simulate some data
      const mockEvents: PanicEvent[] = [
        {
          _id: '1',
          panicId: 'panic_1735949400000_abc123',
          location: { lat: 40.7128, lng: -74.0060 },
          timestamp: new Date().toISOString(),
          status: 'resolved',
          imageAnalysis: {
            description: 'Person on a city street',
            confidence: 0.85,
            objects: [{ name: 'person', confidence: 0.9 }],
            tags: [{ name: 'street', confidence: 0.8 }],
            isAdultContent: false,
            isRacyContent: false,
            landmarks: []
          },
          safetyData: {
            currentAddress: '123 Main St, New York, NY',
            nearbyHospitals: [
              { name: 'City Hospital', distance: 500, address: '456 Health Ave' }
            ],
            nearbyPoliceStations: []
          },
          notificationResult: {
            success: true,
            contactsNotified: 2,
            notifications: [
              {
                contact: 'Emergency Contact',
                phone: '+1234567890',
                email: 'contact@example.com',
                status: 'sent',
                method: ['sms'],
                timestamp: new Date().toISOString(),
                messageId: 'msg123'
              }
            ],
            message: 'Contacts notified successfully'
          }
        }
      ]
      
      setPanicEvents(mockEvents)
    } catch (error) {
      console.error('Failed to fetch panic events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    return date.toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Safety Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Activity className="h-4 w-4" />
              <span>Real-time Monitoring</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Contacts Notified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>
        </div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Emergency Events
            </h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Loading events...</p>
              </div>
            ) : panicEvents.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No emergency events recorded</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your safety data will appear here when needed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {panicEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Emergency Event
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {event.panicId}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {event.safetyData?.currentAddress || `${event.location.lat.toFixed(4)}, ${event.location.lng.toFixed(4)}`}
                          </span>
                        </div>
                      )}

                      {event.notificationResult && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {event.notificationResult.contactsNotified} contacts notified
                          </span>
                        </div>
                      )}
                    </div>

                    {event.imageAnalysis && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Camera className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            AI Analysis
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.imageAnalysis.description} 
                          <span className="ml-2 text-xs text-gray-500">
                            (Confidence: {(event.imageAnalysis.confidence * 100).toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
