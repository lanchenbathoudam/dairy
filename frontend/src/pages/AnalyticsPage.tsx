import React, { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Award, TrendingUp, Milk, Zap, Calendar } from 'lucide-react'
import { useFarm } from '../context/FarmContext'
import PillTabs from '../components/PillTabs'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']

export const AnalyticsPage: React.FC = () => {
  const { records, cows } = useFarm()
  const [timeRange, setTimeRange] = useState('7D')

  // Group records by cow
  const cowTotals = useMemo(() => {
    const map = new Map<number, { code: string; name: string; total: number; count: number }>()
    records.forEach(r => {
      const cur = map.get(r.cow_id) || { code: r.cow_code, name: r.cow_name, total: 0, count: 0 }
      cur.total += r.quantity_litres
      cur.count += 1
      map.set(r.cow_id, cur)
    })
    return Array.from(map.values())
      .map(item => ({
        ...item,
        avg: Number((item.total / (item.count || 1)).toFixed(1)),
        total: Number(item.total.toFixed(1)),
      }))
      .sort((a, b) => b.total - a.total)
  }, [records])

  // Morning vs Evening Breakdown
  const sessionBreakdown = useMemo(() => {
    let morning = 0
    let evening = 0
    records.forEach(r => {
      if (r.session === 'MORNING') morning += r.quantity_litres
      else evening += r.quantity_litres
    })
    return [
      { name: 'Morning Milking', value: Number(morning.toFixed(1)), color: '#f59e0b' },
      { name: 'Evening Milking', value: Number(evening.toFixed(1)), color: '#0ea5e9' },
    ]
  }, [records])

  // Daily totals over time
  const dailyHistory = useMemo(() => {
    const map = new Map<string, { morning: number; evening: number }>()
    records.forEach(r => {
      const cur = map.get(r.production_date) || { morning: 0, evening: 0 }
      if (r.session === 'MORNING') cur.morning += r.quantity_litres
      else cur.evening += r.quantity_litres
      map.set(r.production_date, cur)
    })

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, val]) => ({
        date: date.slice(5),
        Morning: Number(val.morning.toFixed(1)),
        Evening: Number(val.evening.toFixed(1)),
        Total: Number((val.morning + val.evening).toFixed(1)),
      }))
  }, [records])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Production Trends & Yield Analytics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Statistical breakdown of milking efficiency, session volumes, and top-yielding cows
          </p>
        </div>
        <PillTabs
          tabs={[
            { key: '7D', label: 'Last 7 Days' },
            { key: '30D', label: '30 Days' },
            { key: 'YTD', label: 'Year to Date' },
          ]}
          active={timeRange}
          onChange={setTimeRange}
          size="sm"
        />
      </div>

      {/* Main Bar Chart: Morning vs Evening Stacked per Day */}
      <div className="glass rounded-3xl p-5">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-1">
          Daily Yield Comparison (Litres)
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Visual comparison of morning and evening output per farm day
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 20, 0.85)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="Morning" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Evening" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Split: Cow Rankings & Session Proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cow Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Cow Productivity Rankings
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Total Litres Produced in Period
            </span>
          </div>

          <div className="space-y-3">
            {cowTotals.slice(0, 6).map((c, i) => (
              <div
                key={c.code}
                className="flex items-center justify-between p-3 rounded-2xl glass border border-white/40 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-neutral-300 text-neutral-800' : i === 2 ? 'bg-amber-700 text-white' : 'bg-black/10 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{c.name}</h4>
                    <span className="text-[10px] text-neutral-500 font-mono">{c.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-neutral-400 block text-[10px]">Session Avg</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{c.avg} L</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 block text-[10px]">Total Output</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{c.total} L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Breakdown (1 Col) */}
        <div className="glass rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              Morning vs. Evening Split
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Total volume distribution between sessions
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessionBreakdown}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sessionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 text-xs">
              {sessionBreakdown.map(s => (
                <div key={s.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">{s.value} L</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
