import React from 'react'
import { LucideIcon } from 'lucide-react'

export interface TabItem {
  key: string
  label: string
  icon?: LucideIcon
  count?: number
}

interface PillTabsProps {
  tabs: TabItem[]
  active: string
  onChange: (key: string) => void
  size?: 'sm' | 'md'
}

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  active,
  onChange,
  size = 'md',
}) => {
  return (
    <div className="glass inline-flex items-center gap-1.5 rounded-[26px] p-1.5 flex-wrap">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer ${
              size === 'sm' ? 'px-3 py-1.5 text-xs rounded-xl' : 'px-4 py-2 text-sm rounded-xl'
            } ${
              isActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/15 text-neutral-600 dark:text-neutral-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default PillTabs
