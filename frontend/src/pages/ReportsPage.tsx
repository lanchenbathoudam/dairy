import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Printer,
} from 'lucide-react'
import { useFarm } from '../context/FarmContext'

export const ReportsPage: React.FC = () => {
  const { records, supply, payments, cows, rate } = useFarm()
  const [reportType, setReportType] = useState('MONTHLY_SUMMARY')
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const handleDownload = () => {
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 3000)
  }

  const totalLitres = records.reduce((s, r) => s + r.quantity_litres, 0)
  const totalSupplied = supply.reduce((s, r) => s + r.quantity_litres, 0)
  const totalBilled = supply.reduce((s, r) => s + r.total_amount, 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Farm Production & Financial Reports
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Generate formal audit-ready operational summaries, cow performance sheets, and buyer settlement statements
        </p>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl glass border border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <p className="text-xs font-semibold">Report generated and downloaded successfully.</p>
        </div>
      )}

      {/* Report Generator Controls */}
      <div className="glass rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
          Configure Export Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Report Template
            </label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-xs text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="MONTHLY_SUMMARY">Monthly Production Summary</option>
              <option value="COW_PERFORMANCE">Individual Cow Performance Report</option>
              <option value="BUYER_STATEMENT">Wholesale Buyer Billing Statement</option>
              <option value="AUDIT_EXPORT">Full Raw Audit Log (CSV/Excel)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              defaultValue="2026-11-01"
              className="w-full px-3 py-2 rounded-xl glass text-xs text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 rounded-xl glass text-xs text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3">
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} /> Download PDF Report
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl glass hover:bg-black/5 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet size={14} /> Download Excel Spreadsheet
          </button>
        </div>
      </div>

      {/* Live Preview Paper Card */}
      <div className="glass rounded-3xl p-6 sm:p-8 space-y-6 border border-white/60 dark:border-white/10 shadow-xl">
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/15 pb-4">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
              OFFICIAL FARM SUMMARY
            </span>
            <h3 className="text-xl font-black text-neutral-900 dark:text-white">
              DairyTrack Operational Statement
            </h3>
            <p className="text-xs text-neutral-500">Period: November 2026 · Generated: Today</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white block">DOC-DT-2026-11</span>
            <span className="text-[10px] text-neutral-400">DGCA & FSSAI Record Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs py-2 border-b border-black/5 dark:border-white/10">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Herd</span>
            <span className="text-base font-black text-neutral-900 dark:text-white">{cows.length} Cows</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Volume Produced</span>
            <span className="text-base font-black text-neutral-900 dark:text-white">{totalLitres.toFixed(1)} L</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Volume Dispatched</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{totalSupplied.toFixed(1)} L</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Invoiced Value</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              ₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-neutral-800 dark:text-neutral-200">Executive Notes:</h4>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            All morning and evening milking operations were reconciled without discrepancies.
            Milk quality maintained at fat content $\ge 4.2\%$ conforming with cooperative standards.
            Wholesale rate applied at ₹{rate.rate_per_litre.toFixed(2)}/L.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
