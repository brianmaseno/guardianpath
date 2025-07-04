'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, MapPin, User, LogOut, Settings } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import React from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  
  return (
    <header>
      <h1>Header</h1>
    </header>
  )
}
