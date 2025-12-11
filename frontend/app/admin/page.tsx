'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function AdminIndexPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    // Only redirect once the user state is loaded
    if (user !== undefined) {
      router.replace('/admin/dashboard')
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center h-screen bg-black text-gray-300">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}
