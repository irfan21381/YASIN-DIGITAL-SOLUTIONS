'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function StudentLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    // Not logged in
    if (!user) {
      router.replace('/auth/login')
      return
    }

    // ✅ ONLY VALID CHECK (matches your User type)
    if (user.role !== 'STUDENT') {
      router.replace('/auth/login')
    }
  }, [user, router])

  return <>{children}</>
}
