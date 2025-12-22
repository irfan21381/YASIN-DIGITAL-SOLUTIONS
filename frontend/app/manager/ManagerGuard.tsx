'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function ManagerGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login')
      return
    }

    // ✅ ONLY role check (NO activeRole)
    if (user.role !== 'COLLEGE_MANAGER') {
      router.replace('/auth/login')
    }
  }, [user, router])

  return <>{children}</>
}
