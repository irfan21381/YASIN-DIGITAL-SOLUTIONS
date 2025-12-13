// /lib/store.ts
import { create } from 'zustand'

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'TEACHER'
  | 'STUDENT'
  | 'PUBLIC_STUDENT'
  | 'EMPLOYEE'

interface User {
  id: number
  email: string
  name?: string
  role: UserRole
  collegeId?: number | null
}

interface AuthState {
  user: User | null
  token: string | null
  initialized: boolean

  setAuth: (user: User, token: string) => void
  logout: () => void
  finishInit: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  initialized: false,

  // 🔁 Restore auth AFTER hydration
  finishInit: () => {
    if (typeof window === 'undefined') return

    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')

      set({
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken,
        initialized: true,
      })
    } catch (err) {
      console.error('Auth restore failed:', err)
      set({ initialized: true })
    }
  },

  // ✅ Login success
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
    }

    set({ user, token })
  },

  // 🚪 Logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }

    set({ user: null, token: null })
  },
}))
