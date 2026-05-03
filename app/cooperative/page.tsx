'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CooperativePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Store role and redirect to unified dashboard
    localStorage.setItem('user_type', 'cooperative')
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  )
}
