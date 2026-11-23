import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Milk,
  TrendingUp,
  Sunrise,
  Sunset,
  DollarSign,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Award,
  CloudSun,
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useFarm } from '../context/FarmContext'
import StatCard from '../components/StatCard'
import IntelPanel from '../components/IntelPanel'

export const Dashboard: React.FC = () => {
  const { cows, records, supply, payments, rate } = useFarm()

  // Calculate dynamic dashboard stats
  const activeCows = cows.filter(c => c.status === 'ACTIVE')
  const dryCows = cows.filter(c => c.status === 'DRY')
  const sickCows = cows.filter(c => c.status === 'SICK')

  // Group latest production records by date
  const latestDate = records.length > 0
    ? [...new Set(records.map(r => r.production_date))].sort().reverse()[0]
    : new Date().toISOString().split('T')[0]

  const todayRecords = records.filter(r => r.production_date === latestDate)
  const todayMorningLitres = todayRecords
    .filter(r => r.session === 'MORNING')
    .reduce((sum, r) => sum + r.quantity_litres, 0)
  const todayEveningLitres = todayRecords
    .filter(r => r.session === 'EVENING')
    .reduce((sum, r) => sum + r.quantity_litres, 0)
  const todayTotalLitres = todayMorningLitres + todayEveningLitres

  // 7-day trend data for chart
  const trendData = useMemo(() => {
    const dates = [...new Set(records.map(r => r.production_date))].sort().slice(-7)
    return dates.map(d => {
      const dayRecs = records.filter(r => r.production_date === d)
      const m = dayRecs.filter(r => r.session === 'MORNING').reduce((acc, r) => acc + r.quantity_litres, 0)
      const e = dayRecs.filter(r => r.session === 'EVENING').reduce((acc, r) => acc + r.quantity_litres, 0)
      return {
        date: d.slice(5), // MM-DD
        Morning: Number(m.toFixed(1)),
        Evening: Number(e.toFixed(1)),
        Total: Number((m + e).toFixed(1)),
      }
    })
  }, [records])

  // Financial calculations
  const totalSuppliedLitres = supply.reduce((sum, s) => sum + s.quantity_litres, 0)
  const totalSupplyValue = supply.reduce((sum, s) => sum + s.total_amount, 0)
  const totalPaymentsReceived = payments.reduce((sum, p) => sum + p.amount, 0)
  const outstandingBalance = Math.max(0, totalSupplyValue - totalPaymentsReceived)

  // Top producing cow today
  const cowPerformance = useMemo(() => {
    const map = new Map<number, { cow: typeof cows[0]; total: number }>()
    todayRecords.forEach(r => {
      const cow = cows.find(c => c.id === r.cow_id)
      if (cow) {
        const cur = map.get(cow.id) || { cow, total: 0 }
        cur.total += r.quantity_litres
        map.set(cow.id, cur)
      }
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [todayRecords, cows])

  const topCow = cowPerformance[0]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Farm Operations Control
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time dairy telemetry for {cows.length} cows · Collection date: {latestDate}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/milk-entry"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all hover:-translate-y-0.5"
          >
            <Sparkles size={15} />
            <span>Record Milking Session</span>
          </Link>
          <Link
            to="/supply"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:border-emerald-500/40 transition-all"
          >
            <Truck size={15} />
            <span>Record Supply</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (6 Glass Stat Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          icon={Milk}
          chip="icon-chip-emerald"
          label="Today's Yield"
          value={`${todayTotalLitres.toFixed(1)} L`}
          subValue="Total"
          accent="text-emerald-500"
          seed={0}
        />
        <StatCard
          icon={Sunrise}
          chip="icon-chip-amber"
          label="Morning Session"
          value={`${todayMorningLitres.toFixed(1)} L`}
          subValue={`${((todayMorningLitres / (todayTotalLitres || 1)) * 100).toFixed(0)}%`}
          accent="text-amber-500"
          seed={1}
        />
        <StatCard
          icon={Sunset}
          chip="icon-chip-sky"
          label="Evening Session"
          value={`${todayEveningLitres.toFixed(1)} L`}
          subValue={`${((todayEveningLitres / (todayTotalLitres || 1)) * 100).toFixed(0)}%`}
          accent="text-sky-500"
          seed={2}
        />
        <StatCard
          icon={TrendingUp}
          chip="icon-chip-blue"
          label="Active Milking"
          value={`${activeCows.length} / ${cows.length}`}
          subValue="Cows"
          accent="text-blue-500"
          seed={3}
        />
        <StatCard
          icon={Truck}
          chip="icon-chip-violet"
          label="Dispatched Supply"
          value={`${totalSuppliedLitres.toFixed(0)} L`}
          subValue={`₹${rate.rate_per_litre}/L`}
          accent="text-violet-500"
          seed={0}
        />
        <StatCard
          icon={DollarSign}
          chip="icon-chip-rose"
          label="Balance Due"
          value={`₹${outstandingBalance.toLocaleString('en-IN')}`}
          subValue="Co-op"
          accent="text-rose-500"
          seed={1}
        />
      </div>

      {/* Main Charts & Telemetry Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Trends Chart (2 Columns) */}
        <div className="lg:col-span-2 glass rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                7-Day Production Curve (Litres)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Session comparison between morning and evening milking
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Morning
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                Evening
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="morningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="eveningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="Morning" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#morningGrad)" />
                <Area type="monotone" dataKey="Evening" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#eveningGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Average Daily Yield: ~{(todayTotalLitres || 150).toFixed(1)} L</span>
            <Link to="/analytics" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1">
              Deep-Dive Analytics <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Right Side Stack: Top Cow & Weather Sky Card */}
        <div className="space-y-6">
          {/* Top Producing Cow Card */}
          <div className="glass rounded-3xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Top Performer Today
              </span>
              <Award className="text-amber-500" size={18} />
            </div>

            {topCow ? (
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl icon-chip icon-chip-amber text-lg font-black shrink-0">
                  {topCow.cow.cow_code.replace('COW-', '')}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-neutral-900 dark:text-white truncate">
                    {topCow.cow.display_name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {topCow.cow.breed} · {topCow.cow.cow_code}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {topCow.total.toFixed(1)} L
                    </span>
                    <span className="text-[11px] text-neutral-400">combined day yield</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No session logged yet today.</p>
            )}
          </div>

          {/* Pasture & Weather Micro-Animated Panel */}
          <IntelPanel
            icon={CloudSun}
            chip="icon-chip-sky"
            title="Farm Environment & Pasture"
            badge="Ideal Conditions"
            badgeTone="bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20"
            isWeather={true}
          >
            <div className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5">
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">24°C · Light Breeze</span>
              </div>
              <div className="flex justify-between">
                <span>Grazing Pasture:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Green Clover / Sudan Grass</span>
              </div>
              <div className="flex justify-between">
                <span>Clean Water Troughs:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">Verified 06:00 AM</span>
              </div>
            </div>
          </IntelPanel>
        </div>
      </div>

      {/* Herd Status Alert & Recent Milking Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Herd Status Summary (1 Col) */}
        <div className="glass rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              Herd Status Distribution
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Current operational status across all 15 registered cows
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck size={16} />
                  <span>Active Milking</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  {activeCows.length} Cows
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <AlertTriangle size={16} />
                  <span>Dry Period (Pre-calving)</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  {dryCows.length} Cow
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <AlertTriangle size={16} />
                  <span>Sick / Vet Quarantine</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300">
                  {sickCows.length} Cow
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/cows"
            className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1.5 py-2 rounded-xl glass"
          >
            Manage Herd Registry <ArrowRight size={13} />
          </Link>
        </div>

        {/* Today's Individual Cow Milking Summary Table (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Latest Milking Session Records
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Individual yield breakdown for {latestDate}
              </p>
            </div>
            <Link to="/records" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              View All Records →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 text-neutral-400 font-medium pb-2">
                  <th className="pb-2">Cow Code</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Breed</th>
                  <th className="pb-2 text-right">Morning Yield</th>
                  <th className="pb-2 text-right">Evening Yield</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {cows.slice(0, 7).map(cow => {
                  const m = todayRecords.find(r => r.cow_id === cow.id && r.session === 'MORNING')?.quantity_litres || 0
                  const e = todayRecords.find(r => r.cow_id === cow.id && r.session === 'EVENING')?.quantity_litres || 0
                  const t = m + e
                  return (
                    <tr key={cow.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-neutral-900 dark:text-white">
                        {cow.cow_code}
                      </td>
                      <td className="py-2.5 font-semibold text-neutral-800 dark:text-neutral-200">
                        {cow.display_name}
                      </td>
                      <td className="py-2.5 text-neutral-500 dark:text-neutral-400">
                        {cow.breed}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                        {m > 0 ? `${m.toFixed(1)} L` : '—'}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-sky-600 dark:text-sky-400">
                        {e > 0 ? `${e.toFixed(1)} L` : '—'}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {t > 0 ? `${t.toFixed(1)} L` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
