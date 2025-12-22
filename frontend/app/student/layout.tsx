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

    /**
     * ✅ ROLE CHECK (SAFE)
     * Works whether backend sends:
     *  - role: "STUDENT"
     *  - roles: ["STUDENT"]
     */
    const isStudent =
      user.role === 'STUDENT' ||
      (Array.isArray(user.roles) && user.roles.includes('STUDENT'))

    if (!isStudent) {
      router.replace('/auth/login')
    }
  }, [user, router])

  return <>{children}</>
}
