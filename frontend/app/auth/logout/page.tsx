'use client'

import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutPage() {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    if (loading) return
    setLoading(true)

    logout()

    // small delay for UX smoothness
    setTimeout(() => {
      router.replace('/auth/login')
    }, 300)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-5">
      <h1 className="text-xl font-bold">Do you want to logout?</h1>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>

      <button
        onClick={() => router.back()}
        disabled={loading}
        className="text-gray-400 hover:text-gray-200 text-sm"
      >
        Cancel
      </button>
    </div>
  )
}
