// /lib/store.ts
import { create } from 'zustand'

interface User {
  _id: string
  email: string
  name: string
  roles: string[]
  activeRole: string
  collegeId?: string | { _id: string, name: string, code: string }
  profilePicture?: string
}

interface AuthState {
  user: User | null
  token: string | null
  initialized: boolean                      // <-- IMPORTANT
  setAuth: (user: User, token: string) => void
  logout: () => void
  setActiveRole: (role: string) => void
  finishInit: () => void                    // <-- ADDED
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  initialized: false,                       // <-- prevents flicker

  // Run ONCE after hydration
  finishInit: () => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("token")

        set({
          user: storedUser ? JSON.parse(storedUser) : null,
          token: storedToken || null,
          initialized: true,
        })
      } catch (e) {
        console.error("Auth restore error:", e)
        set({ initialized: true })
      }
    }
  },

  // Login / Signup success
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)
    }
    set({ user, token })
  },

  // Logout
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
    set({ user: null, token: null })
  },

  // Role switcher
  setActiveRole: (role) => {
    set((state) => {
      if (!state.user) return { user: null }
      const updated = { ...state.user, activeRole: role }

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updated))
      }

      return { user: updated }
    })
  },
}))
