'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Phone, Mail, User, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Header from '@/components/Header'

interface EmergencyContact {
  _id: string
  name: string
  phone: string
  email: string
  relationship: string
  isPrimary: boolean
  isActive: boolean
}

export default function EmergencyContacts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    isPrimary: false
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchContacts()
    }
  }, [status, router])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/emergency-contacts')
      const data = await response.json()
      
      if (response.ok) {
        setContacts(data.emergencyContacts || [])
      } else {
        toast.error(data.error || 'Failed to fetch contacts')
      }
    } catch (error) {
      toast.error('Error fetching emergency contacts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingContact 
        ? '/api/emergency-contacts' 
        : '/api/emergency-contacts'
      
      const payload = editingContact 
        ? { ...formData, contactId: editingContact._id }
        : formData

      const response = await fetch(url, {
        method: editingContact ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingContact ? 'Contact updated!' : 'Contact added!')
        setShowForm(false)
        setEditingContact(null)
        setFormData({ name: '', phone: '', email: '', relationship: '', isPrimary: false })
        fetchContacts()
      } else {
        toast.error(data.error || 'Failed to save contact')
      }
    } catch (error) {
      toast.error('Error saving contact')
    }
  }

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary
    })
    setShowForm(true)
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/emergency-contacts?contactId=${contactId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Contact deleted')
        fetchContacts()
      } else {
        toast.error(data.error || 'Failed to delete contact')
      }
    } catch (error) {
      toast.error('Error deleting contact')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Emergency Contacts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your emergency contacts for safety notifications
          </p>
        </div>

        {/* Add Contact Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowForm(true)
            setEditingContact(null)
            setFormData({ name: '', phone: '', email: '', relationship: '', isPrimary: false })
          }}
          className="mb-6 flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Emergency Contact</span>
        </motion.button>

        {/* Contact Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relationship
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select relationship</option>
                    <option value="parent">Parent</option>
                    <option value="spouse">Spouse/Partner</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Primary contact (will be notified first)
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingContact(null)
                  }}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Contacts List */}
        <div className="grid gap-4">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No emergency contacts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add your first emergency contact to get started
              </p>
            </div>
          ) : (
            contacts.map((contact) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {contact.name}
                        </h3>
                        {contact.isPrimary && (
                          <Shield className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {contact.relationship}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span>{contact.email}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
