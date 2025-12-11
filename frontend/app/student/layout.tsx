'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function StudentLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, initialized, finishInit } = useAuthStore()

  // Restore localStorage user only once
  useEffect(() => {
    if (!initialized) finishInit()
  }, [initialized, finishInit])

  // Wait until Zustand hydrates
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking authentication…
      </div>
    )
  }

  // Not logged in
  if (!user) {
    router.replace('/auth/login')
    return null
  }

  // Logged in but not a student
  if (user.activeRole !== 'STUDENT') {
    router.replace('/auth/login')
    return null
  }

  return <>{children}</>
}
