import React from 'react'
import { LucideIcon } from 'lucide-react'
import WeatherSky from './WeatherSky'

interface IntelPanelProps {
  icon: LucideIcon
  chip?: string
  title: string
  badge?: string
  badgeTone?: string
  isWeather?: boolean
  children: React.ReactNode
  className?: string
}

export const IntelPanel: React.FC<IntelPanelProps> = ({
  icon: Icon,
  chip = 'icon-chip-emerald',
  title,
  badge,
  badgeTone,
  isWeather = false,
  children,
  className = '',
}) => {
  return (
    <div className={`glass rounded-[26px] p-5 flex flex-col gap-3 relative overflow-hidden ${className}`}>
      {isWeather && <WeatherSky />}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`icon-chip ${chip} !w-10 !h-10 !rounded-xl`}>
            <Icon size={18} strokeWidth={2.1} />
          </div>
          <h3 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base truncate">
            {title}
          </h3>
        </div>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${
            badgeTone || 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        {children}
      </div>
    </div>
  )
}

export default IntelPanel
