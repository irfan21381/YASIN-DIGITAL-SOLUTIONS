'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/colleges', label: 'Colleges', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  // 🔐 Admin-only protection
  useEffect(() => {
    // Wait for Zustand hydration
    if (user === undefined) return;

    // Not logged in
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Support role switching (activeRole > role)
    const currentRole = user.activeRole ?? user.role;

    // Not SUPER_ADMIN
    if (currentRole !== 'SUPER_ADMIN') {
      router.replace('/dashboard'); // or /403
      return;
    }

    setChecking(false);
  }, [user, router]);

  if (checking) {
    return (
      <div className="text-white min-h-screen flex items-center justify-center">
        Checking admin access…
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <div className="min-h-screen flex bg-black text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-950 to-black border-r border-white/10 flex flex-col">

        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-lg font-black">YDS EduAI</div>
          <div className="text-[10px] text-purple-300 uppercase tracking-wide">
            Super Admin Panel
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm rounded-xl mb-1
                  ${
                    active
                      ? 'bg-purple-600/30 text-white border border-purple-500/70'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-white/10 text-xs text-gray-400">
          <div className="mb-2">
            {user.email}
            <div className="text-[10px] text-purple-300">
              Role: {user.activeRole ?? user.role}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full justify-center px-3 py-2 rounded-lg bg-red-500/20 text-red-100 text-xs hover:bg-red-500/30"
          >
            <LogOut className="h-3 w-3 mr-2" /> Logout
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
