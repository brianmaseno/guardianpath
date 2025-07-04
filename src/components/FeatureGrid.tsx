'use client'

import { motion } from 'framer-motion'
import { 
  Camera, 
  MapPin, 
  Route, 
  Users, 
  Brain, 
  Clock,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react'

export function FeatureGrid() {
  const features = [
    {
      icon: Camera,
      title: "Smart Photo Capture",
      description: "AI-powered image analysis with Azure Cognitive Services for object detection and scene understanding",
      gradient: "from-purple-500 to-pink-500",
      delay: 0.1
    },
    {
      icon: MapPin,
      title: "Real-time Location",
      description: "Precise GPS tracking with timestamp capture for accurate emergency response",
      gradient: "from-blue-500 to-cyan-500",
      delay: 0.2
    },
    {
      icon: Route,
      title: "Safe Route Planning",
      description: "Optimal and safest routes using Azure Maps with real-time traffic and safety data",
      gradient: "from-green-500 to-emerald-500",
      delay: 0.3
    },
    {
      icon: Users,
      title: "Emergency Contacts",
      description: "Instant alerts to your trusted contacts with location and photo evidence",
      gradient: "from-red-500 to-orange-500",
      delay: 0.4
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Intelligent scene analysis to provide context and assess potential threats",
      gradient: "from-indigo-500 to-purple-500",
      delay: 0.5
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live status updates and continuous monitoring for maximum safety",
      gradient: "from-yellow-500 to-orange-500",
      delay: 0.6
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Seamless experience across all devices with offline capabilities",
      gradient: "from-teal-500 to-blue-500",
      delay: 0.7
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "End-to-end encryption ensures your data remains secure and private",
      gradient: "from-gray-500 to-gray-700",
      delay: 0.8
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: feature.delay, duration: 0.5 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {/* Background gradient on hover */}
          <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          {/* Icon with gradient background */}
          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
            <feature.icon className="h-6 w-6 text-white" />
          </div>
          
          {/* Content */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors">
            {feature.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {feature.description}
          </p>

          {/* Hover effect - floating icon */}
          <motion.div
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            animate={{ 
              y: [0, -5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Zap className="h-6 w-6 text-gray-400" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
