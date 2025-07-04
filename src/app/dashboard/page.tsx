'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  Clock,
  MapPin,
  Users,
  Camera,
  Activity,
  CheckCircle,
  Phone,
  Building2,
  Navigation
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { PanicButton } from '@/components/PanicButton'
import { PanicEvent } from '@/types'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [panicEvents, setPanicEvents] = useState<PanicEvent[]>([])
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([])
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [currentAddress, setCurrentAddress] = useState<string>('')

  // Function to get readable address from coordinates
  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a free geocoding service
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
      const data = await response.json()
      
      if (data.locality && data.principalSubdivision) {
        return `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
      } else if (data.city && data.principalSubdivision) {
        return `${data.city}, ${data.principalSubdivision}, ${data.countryName}`
      } else {
        return `${data.principalSubdivision}, ${data.countryName}`
      }
    } catch (error) {
      console.error('Failed to get location name:', error)
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}` // Fallback to coordinates
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchDashboardData()
      getUserLocation()
    }
  }, [status, router])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          
          // Get readable address
          const address = await getLocationName(location.lat, location.lng)
          setCurrentAddress(address)
          
          fetchNearbyLocations(location.lat, location.lng)
        },
        async (error) => {
          console.log('Location access denied or failed:', error)
          // Use default location (New York City) for demo
          const defaultLocation = { lat: 40.7128, lng: -74.0060 }
          setUserLocation(defaultLocation)
          
          const address = await getLocationName(defaultLocation.lat, defaultLocation.lng)
          setCurrentAddress(address)
          
          fetchNearbyLocations(defaultLocation.lat, defaultLocation.lng)
        }
      )
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch emergency contacts
      const contactsResponse = await fetch('/api/emergency-contacts')
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json()
        setEmergencyContacts(contactsData.emergencyContacts || [])
      }

      fetchPanicEvents()
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      // Get Azure Maps key from environment
      const azureMapsKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY
      
      if (!azureMapsKey) {
        console.error('Azure Maps key not configured')
        setNearbyLocations([])
        return
      }
      
      // Search for police stations
      const policeResponse = await fetch(
        `https://atlas.microsoft.com/search/fuzzy/json?api-version=1.0&subscription-key=${azureMapsKey}&query=police%20station&lat=${lat}&lon=${lng}&radius=10000&limit=5`
      )
      
      // Search for hospitals
      const hospitalResponse = await fetch(
        `https://atlas.microsoft.com/search/fuzzy/json?api-version=1.0&subscription-key=${azureMapsKey}&query=hospital&lat=${lat}&lon=${lng}&radius=10000&limit=5`
      )

      const locations: any[] = []

      if (policeResponse.ok) {
        const policeData = await policeResponse.json()
        policeData.results?.forEach((result: any) => {
          if (result.poi && result.position) {
            const distance = calculateDistance(lat, lng, result.position.lat, result.position.lon)
            locations.push({
              name: result.poi.name,
              type: 'police',
              distance: distance,
              address: result.address?.freeformAddress || 'Address not available',
              phone: result.poi.phone || 'Phone not available',
              position: result.position
            })
          }
        })
      }

      if (hospitalResponse.ok) {
        const hospitalData = await hospitalResponse.json()
        hospitalData.results?.forEach((result: any) => {
          if (result.poi && result.position) {
            const distance = calculateDistance(lat, lng, result.position.lat, result.position.lon)
            locations.push({
              name: result.poi.name,
              type: 'hospital',
              distance: distance,
              address: result.address?.freeformAddress || 'Address not available',
              phone: result.poi.phone || 'Phone not available',
              position: result.position
            })
          }
        })
      }

      // Sort by distance and take closest 6
      locations.sort((a, b) => a.distance - b.distance)
      setNearbyLocations(locations.slice(0, 6))

    } catch (error) {
      console.error('Failed to fetch nearby locations:', error)
      // Fallback to showing message about location services
      setNearbyLocations([])
    }
  }

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c // Distance in kilometers
    return Math.round(distance * 10) / 10 // Round to 1 decimal place
  }

  const fetchPanicEvents = async () => {
    try {
      // Fetch real panic events from the database
      const response = await fetch('/api/panic-events')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPanicEvents(data.panicEvents || [])
          console.log('📊 Loaded panic events from database:', data.count)
        } else {
          console.error('Failed to fetch panic events:', data.error)
          // Fallback to mock data if database fetch fails
          setPanicEvents([])
        }
      } else {
        console.error('Panic events API returned error:', response.status)
        setPanicEvents([])
      }
    } catch (error) {
      console.error('Failed to fetch panic events:', error)
      setPanicEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePanicActivated = (data: { timestamp: Date; location?: { lat: number; lng: number }; photo?: string }) => {
    // Refresh the panic events to show the new event
    fetchPanicEvents()
    // You could also add the new event directly to the state for immediate UI update
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

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'police': return <Shield className="h-5 w-5 text-blue-600" />
      case 'hospital': return <Building2 className="h-5 w-5 text-red-600" />
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      default: return <MapPin className="h-5 w-5 text-gray-600" />
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header location={userLocation} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header location={userLocation} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Safety Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your safety status and manage emergency resources
          </p>
          {currentAddress && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              📍 Current location: {currentAddress}
            </p>
          )}
        </div>

        {/* Emergency Panic Button */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <PanicButton onPanicActivated={handlePanicActivated} />
          </div>
        </div>

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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{panicEvents.length}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{panicEvents.filter(e => e.status === 'active').length}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Emergency Contacts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{emergencyContacts.length}</p>
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

        {/* Emergency Contacts & Nearby Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Emergency Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Emergency Contacts
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {emergencyContacts.length} contacts
                </span>
              </div>
            </div>
            <div className="p-6">
              {emergencyContacts.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">No emergency contacts</p>
                  <a 
                    href="/emergency-contacts" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Add your first contact →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {emergencyContacts.slice(0, 3).map((contact, index) => (
                    <div key={contact._id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {contact.relationship}
                        </p>
                      </div>
                      {contact.isPrimary && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                  {emergencyContacts.length > 3 && (
                    <a 
                      href="/emergency-contacts" 
                      className="block text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                    >
                      View all {emergencyContacts.length} contacts →
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Nearby Safety Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Nearby Safety Locations
                </h2>
                {userLocation && (
                  <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Navigation className="h-4 w-4 mr-1" />
                    Your location
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              {nearbyLocations.length === 0 ? (
                <div className="text-center py-6">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Finding nearby safety locations...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nearbyLocations.map((location, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        {getLocationIcon(location.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {location.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {location.address}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {location.distance} km away
                          </span>
                          <a 
                            href={`tel:${location.phone}`}
                            className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {location.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                            {event.safetyData?.currentAddress || currentAddress || `${event.location.lat.toFixed(4)}, ${event.location.lng.toFixed(4)}`}
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

                    {event.safetyData && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Safety Information
                          </span>
                        </div>
                        
                        {event.safetyData.currentAddress && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">📍 Address:</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{event.safetyData.currentAddress}</p>
                          </div>
                        )}

                        {event.safetyData.nearbyHospitals && event.safetyData.nearbyHospitals.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">🏥 Nearby Hospitals:</span>
                            <div className="mt-1 space-y-1">
                              {event.safetyData.nearbyHospitals.slice(0, 2).map((hospital, idx) => (
                                <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                  • <strong>{hospital.name}</strong> - {(hospital.distance / 1000).toFixed(1)}km away
                                  <br />
                                  <span className="ml-2 text-gray-500">{hospital.address}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {event.safetyData.nearbyPoliceStations && event.safetyData.nearbyPoliceStations.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">🚔 Nearby Police:</span>
                            <div className="mt-1 space-y-1">
                              {event.safetyData.nearbyPoliceStations.slice(0, 2).map((station, idx) => (
                                <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                  • <strong>{station.name}</strong> - {(station.distance / 1000).toFixed(1)}km away
                                  <br />
                                  <span className="ml-2 text-gray-500">{station.address}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
