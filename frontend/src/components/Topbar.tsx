import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sun, Moon, ChevronRight, Sunrise, Sunset, Milk } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES: Record<string, string> = {
  '': 'Farm Overview',
  dashboard: 'Farm Overview',
  cows: 'Herd & Cow Registry',
  'milk-entry': 'Milking Session Capture',
  records: 'Historical Milk Records',
  analytics: 'Production Trends & Yields',
  supply: 'Wholesale Buyer Dispatch',
  payments: 'Financial Ledger & Payments',
  reports: 'Farm Performance Reports',
  settings: 'Farm Settings & Backups',
}

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(tick)
  }, [])

  const segment = location.pathname.replace(/^\//, '').split('/')[0]
  const title = PAGE_TITLES[segment] || 'Operations'

  const currentHour = now.getHours()
  const isMorning = currentHour < 14

  return (
    <div className="sticky top-0 z-30 glass-topbar px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 text-sm">
        <span className="text-neutral-400 dark:text-neutral-500 font-medium hidden sm:inline">DairyTrack</span>
        <ChevronRight size={14} className="text-neutral-300 dark:text-neutral-600 shrink-0 hidden sm:inline" />
        <span className="font-semibold text-neutral-900 dark:text-white truncate">{title}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Session Indicator Pill */}
        <span className="glass-pill hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-500/25">
          {isMorning ? <Sunrise size={14} className="text-amber-500" /> : <Sunset size={14} className="text-orange-500" />}
          <span>{isMorning ? 'Morning Active' : 'Evening Active'}</span>
        </span>

        {/* Date/Time Pill */}
        <span className="glass-pill hidden md:inline text-xs font-medium text-neutral-500 dark:text-neutral-400 tabular-nums px-3.5 py-1.5">
          {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          {'  ·  '}
          {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>

        {/* User Role Badge */}
        {user && (
          <span className="glass-pill text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 text-emerald-800 dark:text-emerald-200 bg-emerald-500/10 border-emerald-500/30">
            {user.role}
          </span>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="glass-pill glass-interactive flex items-center justify-center w-9 h-9 text-neutral-600 dark:text-neutral-300 cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  )
}

export default Topbar
