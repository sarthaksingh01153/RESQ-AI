'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  AlertTriangle,
  Package,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Zap,
  Shield,
  ChevronRight,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/dashboard/incidents', label: 'Incidents', icon: <AlertTriangle className="h-4 w-4" /> },
  {
    href: '/dashboard/inventory',
    label: 'Inventory',
    icon: <Package className="h-4 w-4" />,
    roles: ['OFFICER', 'INVENTORY_MANAGER', 'ADMIN'],
  },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  {
    href: '/dashboard/demo',
    label: 'Flood Demo',
    icon: <Zap className="h-4 w-4" />,
    roles: ['OFFICER', 'ADMIN'],
  },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
]

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
        if (data.user.role === 'CITIZEN') {
          router.push('/')
          return
        }
        setUser(data.user)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications?unreadOnly=true')
        if (res.ok) {
          const data = await res.json()
          setNotifCount(data.total || 0)
        }
      } catch {}
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-slate-400 text-sm">Loading dashboard…</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  const allowedNav = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role))

  const ROLE_LABELS: Record<string, string> = {
    OFFICER: 'Emergency Officer',
    ADMIN: 'Administrator',
    INVENTORY_MANAGER: 'Inventory Manager',
    RESCUE_TEAM: 'Rescue Team',
    CITIZEN: 'Citizen',
  }

  const Sidebar = (
    <aside className="flex flex-col h-full bg-white border-r border-black/[0.06] w-60 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-black/[0.06]">
        <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-slate-900">RESQ</span>
          <span className="text-lg font-bold text-red-600"> AI</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {allowedNav.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {item.icon}
              {item.label}
              {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-blue-500" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-black/[0.06] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{ROLE_LABELS[user.role] || user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-60 flex-shrink-0">{Sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-60 z-10 flex flex-col">{Sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-14 bg-white/80 backdrop-blur-md border-b border-black/[0.06]">
          <button
            className="md:hidden text-slate-400 hover:text-slate-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link href="/dashboard/notifications" className="relative">
              <Bell className="h-5 w-5 text-slate-400 hover:text-slate-700 transition-colors" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4 text-slate-400" />
              <span className="hidden sm:block">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>

      <Toaster />
    </div>
  )
}
