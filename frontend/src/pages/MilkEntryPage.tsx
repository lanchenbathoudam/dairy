import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sunrise,
  Sunset,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Milk,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useFarm } from '../context/FarmContext'
import { MilkingSession } from '../types'

export const MilkEntryPage: React.FC = () => {
  const { cows, records, recordMilkingSession } = useFarm()
  const navigate = useNavigate()

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [session, setSession] = useState<MilkingSession>(() => {
    return new Date().getHours() < 14 ? 'MORNING' : 'EVENING'
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Initialize input values with existing records for this (date, session) if present
  const [yieldInputs, setYieldInputs] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {}
    cows.forEach(cow => {
      if (cow.status === 'ACTIVE') {
        // Pre-fill with a default estimation or leave blank
        map[cow.id] = ''
      }
    })
    return map
  })

  // Whenever date or session changes, populate with existing data if already recorded
  React.useEffect(() => {
    const existing = records.filter(r => r.production_date === date && r.session === session)
    const map: Record<number, string> = {}
    cows.forEach(c => {
      const found = existing.find(r => r.cow_id === c.id)
      map[c.id] = found ? String(found.quantity_litres) : ''
    })
    setYieldInputs(map)
  }, [date, session, records, cows])

  const handleInputChange = (cowId: number, val: string) => {
    // Only permit valid numerical decimal input
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setYieldInputs(prev => ({ ...prev, [cowId]: val }))
    }
  }

  // Live running session total
  const liveTotalLitres = useMemo(() => {
    return Object.values(yieldInputs).reduce((sum, val) => {
      const num = parseFloat(val)
      return sum + (isNaN(num) ? 0 : num)
    }, 0)
  }, [yieldInputs])

  // Count active cows entered
  const enteredCount = useMemo(() => {
    return Object.values(yieldInputs).filter(val => val !== '' && !isNaN(parseFloat(val))).length
  }, [yieldInputs])

  const activeCows = cows.filter(c => c.status === 'ACTIVE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const entries = activeCows.map(cow => {
      const raw = yieldInputs[cow.id]
      const litres = raw ? parseFloat(raw) : 0
      return { cowId: cow.id, litres }
    })

    recordMilkingSession(date, session, entries)
    setSuccessMessage(`Successfully logged ${session.toLowerCase()} session for ${date}: ${liveTotalLitres.toFixed(1)} Litres.`)

    setTimeout(() => {
      setSuccessMessage(null)
      navigate('/records')
    }, 1800)
  }

  const handleQuickFillAverage = () => {
    const map: Record<number, string> = {}
    activeCows.forEach(cow => {
      // Half of last yield for single session
      const half = cow.last_yield ? (cow.last_yield * 0.5).toFixed(1) : '6.0'
      map[cow.id] = half
    })
    setYieldInputs(map)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Milking Session Data Capture
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Fast barn-side entry. Totals auto-calculate in real time.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl glass border border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Control Strip: Date, Session Toggle, Live Running Total */}
      <div className="glass rounded-3xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Date Selector */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar size={13} />
            Milking Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl glass text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Session Toggle */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
            Milking Session
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSession('MORNING')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                session === 'MORNING'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  : 'glass text-neutral-600 dark:text-neutral-300 hover:bg-black/5'
              }`}
            >
              <Sunrise size={16} />
              Morning
            </button>
            <button
              type="button"
              onClick={() => setSession('EVENING')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                session === 'EVENING'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'glass text-neutral-600 dark:text-neutral-300 hover:bg-black/5'
              }`}
            >
              <Sunset size={16} />
              Evening
            </button>
          </div>
        </div>

        {/* Live Running Total Badge */}
        <div className="flex flex-col justify-center items-start md:items-end p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Session Running Total
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
            {liveTotalLitres.toFixed(1)} <span className="text-sm font-semibold">Litres</span>
          </span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {enteredCount} of {activeCows.length} active cows logged
          </span>
        </div>
      </div>

      {/* Main Milk Entry Form Table */}
      <form onSubmit={handleSubmit} className="glass rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Cows in Active Milking ({activeCows.length})
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Input milk yield in litres per cow for this session.
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickFillAverage}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} /> Quick Fill Averages
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeCows.map(cow => {
            const val = yieldInputs[cow.id] || ''
            const num = parseFloat(val)
            const isAbnormal = num > 18 // Warning threshold per session

            return (
              <div
                key={cow.id}
                className="p-3.5 rounded-2xl glass flex flex-col justify-between gap-2 border border-white/60 dark:border-white/10 focus-within:border-emerald-500/60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      {cow.display_name}
                    </h4>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                      {cow.cow_code} · {cow.breed.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-neutral-400">
                    Prev: {cow.last_yield ? `${(cow.last_yield * 0.5).toFixed(1)}L` : '—'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={val}
                    onChange={e => handleInputChange(cow.id, e.target.value)}
                    className="w-full text-right pr-12 pl-3 py-2 rounded-xl glass font-bold text-base text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 pointer-events-none">
                    Litres
                  </span>
                </div>

                {isAbnormal && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={11} /> High yield threshold
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Resting Cows Notice */}
        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <span>
            {cows.filter(c => c.status !== 'ACTIVE').length} cows currently dry or under vet treatment (excluded from milking session).
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            DGCA / FSSAI Dairy Compliant
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-2xl glass text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-black/5 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <Sparkles size={15} />
            <span>Submit {session.toLowerCase()} Session ({liveTotalLitres.toFixed(1)} L)</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default MilkEntryPage
