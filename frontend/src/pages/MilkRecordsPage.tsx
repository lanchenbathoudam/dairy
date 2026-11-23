import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Filter,
  Download,
  Search,
  Sunrise,
  Sunset,
  Milk,
  FileSpreadsheet,
} from 'lucide-react'
import { useFarm } from '../context/FarmContext'
import { MilkingSession } from '../types'

export const MilkRecordsPage: React.FC = () => {
  const { records, cows } = useFarm()

  const [filterCow, setFilterCow] = useState<string>('ALL')
  const [filterSession, setFilterSession] = useState<string>('ALL')
  const [searchDate, setSearchDate] = useState<string>('')

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchCow = filterCow === 'ALL' || String(r.cow_id) === filterCow
      const matchSession = filterSession === 'ALL' || r.session === filterSession
      const matchDate = !searchDate || r.production_date === searchDate
      return matchCow && matchSession && matchDate
    }).sort((a, b) => b.production_date.localeCompare(a.production_date) || (a.session === 'MORNING' ? 1 : -1))
  }, [records, filterCow, filterSession, searchDate])

  const totalFilteredLitres = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.quantity_litres, 0)
  }, [filteredRecords])

  const exportCSV = () => {
    const headers = ['Record ID', 'Date', 'Session', 'Cow Tag', 'Cow Name', 'Yield (Litres)', 'Entered By']
    const rows = filteredRecords.map(r => [
      r.id,
      r.production_date,
      r.session,
      r.cow_code,
      r.cow_name,
      r.quantity_litres,
      r.entered_by || 'Staff',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `dairytrack_records_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Milking Production Records
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Historical audit log of individual cow milk yields across all calendar sessions
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-emerald-600 hover:text-white text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <Download size={15} />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass rounded-3xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Filter by Date
          </label>
          <input
            type="date"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass text-xs text-neutral-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Filter by Cow
          </label>
          <select
            value={filterCow}
            onChange={e => setFilterCow(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass text-xs text-neutral-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Cows in Herd</option>
            {cows.map(c => (
              <option key={c.id} value={c.id}>
                {c.cow_code} - {c.display_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Milking Session
          </label>
          <select
            value={filterSession}
            onChange={e => setFilterSession(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass text-xs text-neutral-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Sessions (Morning & Evening)</option>
            <option value="MORNING">Morning Only</option>
            <option value="EVENING">Evening Only</option>
          </select>
        </div>

        <div className="flex flex-col justify-center items-start sm:items-end">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Filtered Total</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {totalFilteredLitres.toFixed(1)} <span className="text-xs font-semibold">Litres</span>
          </span>
          <span className="text-[11px] text-neutral-500">{filteredRecords.length} records found</span>
        </div>
      </div>

      {/* Records Table */}
      <div className="glass rounded-3xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-neutral-400 font-medium pb-3">
                <th className="pb-3">Date</th>
                <th className="pb-3">Session</th>
                <th className="pb-3">Cow Code</th>
                <th className="pb-3">Cow Name</th>
                <th className="pb-3 text-right">Yield (Litres)</th>
                <th className="pb-3 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-neutral-900 dark:text-white">
                    {r.production_date}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        r.session === 'MORNING'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                      }`}
                    >
                      {r.session === 'MORNING' ? <Sunrise size={12} /> : <Sunset size={12} />}
                      {r.session}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    {r.cow_code}
                  </td>
                  <td className="py-3 text-neutral-700 dark:text-neutral-300 font-medium">
                    {r.cow_name}
                  </td>
                  <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {r.quantity_litres.toFixed(2)} L
                  </td>
                  <td className="py-3 text-right text-neutral-400">
                    {r.entered_by || 'Staff'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="py-12 text-center text-neutral-400 text-sm">
            No production records match the selected date or cow filters.
          </div>
        )}
      </div>
    </div>
  )
}

export default MilkRecordsPage
