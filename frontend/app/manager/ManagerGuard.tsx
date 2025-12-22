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

    /**
     * ✅ SAFE ROLE CHECK
     * Supports:
     * - user.role = "COLLEGE_MANAGER"
     * - user.roles = ["COLLEGE_MANAGER"]
     */
    const role =
      (user as any).role ||
      ((user as any).roles && (user as any).roles[0])

    if (role !== 'COLLEGE_MANAGER') {
      router.replace('/auth/login')
    }
  }, [user, router])

  return <>{children}</>
}
