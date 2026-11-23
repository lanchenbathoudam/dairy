import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  chip?: string
  label: string
  value: string | number
  subValue?: string
  accent?: string
  seed?: number
}

function Sparkline({ seed = 0 }: { seed?: number }) {
  const paths = [
    'M0,28 C10,26 18,14 28,16 C38,18 44,30 54,26 C64,22 70,6 80,10 C90,14 94,24 100,20',
    'M0,20 C8,10 16,26 26,20 C36,14 42,4 52,10 C62,16 68,28 78,22 C88,16 94,8 100,14',
    'M0,24 C10,30 16,10 26,12 C36,14 40,26 50,24 C60,22 66,8 76,12 C86,16 92,26 100,18',
    'M0,16 C10,22 18,6 28,12 C38,18 42,28 52,22 C62,16 70,10 80,18 C90,26 94,14 100,20',
  ]
  const d = paths[seed % paths.length]
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-6 sparkline-fade">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
    </svg>
  )
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  chip = 'icon-chip-emerald',
  label,
  value,
  subValue,
  accent = 'text-emerald-500',
  seed = 0,
}) => {
  return (
    <div className="glass glass-interactive rounded-2xl p-4 flex flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between">
        <div className={`icon-chip ${chip} !w-9 !h-9 !rounded-xl`}>
          <Icon size={18} strokeWidth={2.1} />
        </div>
        {subValue && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
            {subValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-0.5">
          {value}
        </p>
      </div>
      <div className={accent}>
        <Sparkline seed={seed} />
      </div>
    </div>
  )
}

export default StatCard
