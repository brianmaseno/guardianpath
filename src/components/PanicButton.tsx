'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Camera, MapPin, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { Location } from '@/types'

interface PanicButtonProps {
  onPanicActivated: (data: {
    timestamp: Date
    location?: Location
    photo?: string
  }) => void
}

export function PanicButton({ onPanicActivated }: PanicButtonProps) {
  const [isActivating, setIsActivating] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const handlePanicMode = async () => {
    setIsActivating(true)
    
    try {
      // Step 1: Get current location
      let location: Location | undefined
      try {
        location = await getCurrentLocation()
      } catch (error) {
        console.warn('Failed to get location:', error)
        // Continue without location
      }
      
      // Step 2: Capture photo (simulated)
      let photo: string | undefined
      try {
        photo = await capturePhoto()
      } catch (error) {
        console.warn('Failed to capture photo:', error)
        // Continue without photo
      }
      
      // Step 3: Create panic data
      const panicData = {
        timestamp: new Date(),
        location,
        photo
      }
      
      // Step 4: Call the panic API
      const response = await fetch('/api/panic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(panicData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Step 5: Activate panic mode
        setIsActive(true)
        onPanicActivated(panicData)
        
        toast.success('🚨 Panic mode activated! Emergency contacts notified.')
        console.log('Panic response:', result)
      } else {
        throw new Error(result.message || 'Failed to activate panic mode')
      }
      
    } catch (error) {
      console.error('Failed to activate panic mode:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to activate panic mode: ${errorMessage}`)
    } finally {
      setIsActivating(false)
    }
  }

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          reject(error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    })
  }

  const capturePhoto = (): Promise<string> => {
    return new Promise((resolve) => {
      // Simulated photo capture
      // In a real app, this would access the camera
      setTimeout(() => {
        resolve('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...')
      }, 1000)
    })
  }

  const deactivatePanic = () => {
    setIsActive(false)
    toast.success('Panic mode deactivated')
  }

  if (isActive) {
    return (
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(239, 68, 68, 0.5)',
              '0 0 40px rgba(239, 68, 68, 0.8)',
              '0 0 20px rgba(239, 68, 68, 0.5)'
            ]
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block p-6 bg-red-600 rounded-full"
        >
          <AlertTriangle className="h-12 w-12 text-white" />
        </motion.div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-red-600">PANIC MODE ACTIVE</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Emergency contacts have been notified
          </p>
          
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Camera className="h-4 w-4" />
              <span>Photo captured</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Location shared</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={deactivatePanic}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Deactivate
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="text-center"
    >
      <button
        onClick={handlePanicMode}
        disabled={isActivating}
        className={`relative group px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 ${
          isActivating 
            ? 'bg-red-700 cursor-not-allowed opacity-75' 
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
      >
        <div className="flex items-center space-x-2">
          <AlertTriangle className={`h-6 w-6 ${isActivating ? 'animate-spin' : ''}`} />
          <span>
            {isActivating ? 'ACTIVATING...' : 'PANIC MODE'}
          </span>
        </div>
        
        {!isActivating && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-red-400 opacity-0 group-hover:opacity-20"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </button>
      
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Press and hold for emergency assistance
      </p>
    </motion.div>
  )
}
