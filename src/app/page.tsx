'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Navigation,
  Users,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Header } from '@/components/Header'
import { PanicButton } from '@/components/PanicButton'
import { FeatureGrid } from '@/components/FeatureGrid'
import { Location } from '@/types'

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null)

  useEffect(() => {
    // Get user's location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          toast.success('Location access granted for enhanced safety')
        },
        (error) => {
          toast.error('Location access denied. Some safety features may be limited.')
        }
      )
    }
  }, [])

  const handlePanicActivated = (data: {
    timestamp: Date
    location?: { lat: number; lng: number }
    photo?: string
  }) => {
    console.log('Panic mode activated with data:', data)
    // Here we would implement the actual emergency protocol:
    // 1. Send data to emergency contacts
    // 2. Upload to Azure storage
    // 3. Trigger AI analysis
    // 4. Start route planning
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <Header location={location} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Hero Section */}
        <div className="text-center py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Floating badges */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-8 left-1/4 transform -translate-x-1/2 hidden md:block"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                AI-Powered
              </div>
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -top-8 right-1/4 transform translate-x-1/2 hidden md:block"
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                Azure-Enabled
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Your AI-Powered
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600">
                Safety Companion
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              Stay safer when walking alone with intelligent route planning, emergency features, 
              and real-time AI analysis powered by{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">Microsoft Azure</span>
            </motion.p>

            {/* Panic Button */}
            <div className="mb-16">
              <PanicButton onPanicActivated={handlePanicActivated} />
            </div>

            {/* Quick stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-8 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  <span className="inline-flex items-center">
                    <Sparkles className="h-6 w-6 mr-1" />
                    99.9%
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Response Rate</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  &lt;30s
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Alert Time</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                  24/7
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Monitoring</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Safety Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Advanced technology meets personal safety with features designed to keep you protected in any situation
            </p>
          </div>
          
          <FeatureGrid />
        </motion.section>

        {/* Quick Actions Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Safety Actions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access essential safety features with just one tap
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Navigation className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Plan Safe Route</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">AI-optimized paths</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-200 border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Emergency Contacts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Manage trusted contacts</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-green-500 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 transition-all duration-200 border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Safety Settings</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Customize preferences</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GP</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">GuardianPath</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Powered by <span className="font-semibold">Microsoft Azure</span> • Built for Safety • Made with ❤️
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © 2025 GuardianPath. Keeping you safe, one step at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
