'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

/* ---------------- Navigation Items ---------------- */
const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/colleges', label: 'Colleges', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

/* ---------------- Layout Component ---------------- */

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, loading } = useAuthStore()

  /* ---------------- Admin Route Protection ---------------- */
  useEffect(() => {
    if (loading) return

    if (!user || user.role !== 'SUPER_ADMIN') {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  const handleLogout = () => {
    logout()
    router.replace('/auth/login')
  }

  /* ---------------- Loading State ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    )
  }

  /* ------------------------- UI ------------------------- */

  return (
    <div className="min-h-screen flex bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-gray-950 to-black border-r border-white/10 flex flex-col">

        {/* LOGO SECTION */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-lg font-black tracking-wide">YDS EduAI</div>
          <div className="text-[10px] text-purple-300 uppercase tracking-wider">
            Super Admin Panel
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-2 text-sm rounded-xl transition-colors ${
                  active
                    ? 'bg-purple-600/30 text-white border border-purple-500/60'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* USER FOOTER */}
        <div className="px-3 py-3 border-t border-white/10 text-xs text-gray-400">
          <div className="mb-2">
            {user?.email}
            <div className="text-[10px] text-purple-300">
              Role: {user?.role}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full justify-center px-3 py-2 rounded-lg 
                       bg-red-500/20 text-red-100 text-xs hover:bg-red-500/30 transition"
          >
            <LogOut className="h-3 w-3 mr-2" /> Logout
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}

