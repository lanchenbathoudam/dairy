import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Milk,
  ClipboardList,
  LineChart,
  Truck,
  Wallet,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AmbientBackground from './AmbientBackground'
import Topbar from './Topbar'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cows', label: 'Cows Register', icon: Milk, badge: '15' },
  { to: '/milk-entry', label: 'Milking Session', icon: Sparkles, badge: 'New' },
  { to: '/records', label: 'Milk Records', icon: ClipboardList },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/supply', label: 'Wholesale Supply', icon: Truck },
  { to: '/payments', label: 'Payments Ledger', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen relative flex bg-transparent">
      {/* Dynamic Fluid Glass Ambient Blobs */}
      <AmbientBackground />

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Glass Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 p-3 transition-transform duration-300 ease-in-out shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="glass h-full rounded-4xl flex flex-col overflow-hidden">
          {/* Logo & Brand Header */}
          <div className="px-5 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl icon-chip icon-chip-emerald shrink-0">
                <Milk size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-neutral-900 dark:text-white leading-tight tracking-tight">
                  DairyTrack
                </h1>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Farm Ops & Production
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Barn Milk Entry Highlight Button */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <NavLink
              to="/milk-entry"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl overflow-hidden transition-all duration-300 border ${
                  isActive
                    ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/20 bg-emerald-500/15 text-emerald-900 dark:text-white font-semibold'
                    : 'border-white/40 dark:border-white/10 hover:shadow-md bg-white/50 dark:bg-white/5 hover:border-emerald-500/40 text-neutral-800 dark:text-neutral-200'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500 text-white shadow-sm">
                  <Sparkles size={14} />
                </div>
                <span className="text-xs font-semibold">Record Milking</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                LIVE
              </span>
            </NavLink>
          </div>

          {/* Main Navigation Links */}
          <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-200 overflow-hidden ${
                      isActive
                        ? 'bg-linear-to-br from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={17} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/20">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* User Profile & Logout Bottom Card */}
          <div className="px-3 pb-3 pt-2 border-t border-black/5 dark:border-white/10 shrink-0">
            <div className="glass rounded-2xl p-2.5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl icon-chip icon-chip-emerald shrink-0 text-xs font-bold">
                  {user?.first_name?.[0] || 'F'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Farm User'}
                  </p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
                    {user?.role?.toLowerCase() || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 py-1.5 rounded-xl hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar />
        {/* Mobile Header Toggle */}
        <div className="lg:hidden px-4 py-2 flex items-center justify-between border-b border-black/5 dark:border-white/10 glass">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg icon-chip icon-chip-emerald">
              <Milk size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">DairyTrack</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-xl glass text-neutral-700 dark:text-neutral-200"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
