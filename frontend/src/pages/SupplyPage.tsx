import React, { useState } from 'react'
import {
  Truck,
  Plus,
  Scale,
  Receipt,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { useFarm } from '../context/FarmContext'
import Modal from '../components/Modal'

export const SupplyPage: React.FC = () => {
  const { supply, buyer, rate, records, recordSupply } = useFarm()
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false)

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [session, setSession] = useState<'FULL_DAY' | 'MORNING' | 'EVENING'>('FULL_DAY')
  const [litres, setLitres] = useState('')
  const [notes, setNotes] = useState('')

  // Calculate produced vs supplied on latest date
  const latestDate = supply.length > 0 ? supply[0].supply_date : new Date().toISOString().split('T')[0]
  const producedOnLatestDate = records
    .filter(r => r.production_date === latestDate)
    .reduce((sum, r) => sum + r.quantity_litres, 0)
  const suppliedOnLatestDate = supply
    .filter(s => s.supply_date === latestDate)
    .reduce((sum, s) => sum + s.quantity_litres, 0)
  const farmRetentionLitres = Math.max(0, producedOnLatestDate - suppliedOnLatestDate)

  const totalSuppliedAllTime = supply.reduce((sum, s) => sum + s.quantity_litres, 0)
  const totalAmountAllTime = supply.reduce((sum, s) => sum + s.total_amount, 0)

  const handleSubmitSupply = (e: React.FormEvent) => {
    e.preventDefault()
    const vol = parseFloat(litres)
    if (isNaN(vol) || vol <= 0) return
    recordSupply(date, session, vol, notes)
    setIsSupplyModalOpen(false)
    setLitres('')
    setNotes('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Wholesale Milk Supply & Buyer Dispatch
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Reconcile daily milk produced on farm against volume handed over to wholesale buyer
          </p>
        </div>
        <button
          onClick={() => setIsSupplyModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={16} />
          <span>Log Daily Supply Dispatch</span>
        </button>
      </div>

      {/* 3-Card Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Buyer Profile Card */}
        <div className="glass rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            <Building size={14} className="text-emerald-500" />
            <span>Designated Wholesale Buyer</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">{buyer.name}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{buyer.contact_person}</p>
          </div>
          <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-neutral-400" />
              <span>{buyer.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-neutral-400" />
              <span className="truncate">{buyer.address}</span>
            </div>
          </div>
        </div>

        {/* Pricing Agreement Card */}
        <div className="glass rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            <Receipt size={14} className="text-amber-500" />
            <span>Active Contract Pricing</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              ₹{rate.rate_per_litre.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-neutral-400 ml-1.5">per Litre</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Effective from: {rate.effective_from} · {rate.notes}
          </p>
        </div>

        {/* Reconciliation Ratio Card */}
        <div className="glass rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            <Scale size={14} className="text-blue-500" />
            <span>Latest Day Reconciliation ({latestDate})</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="text-neutral-400 block text-[10px] uppercase">Produced</span>
              <span className="font-bold text-neutral-900 dark:text-white">{producedOnLatestDate.toFixed(1)} L</span>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="text-neutral-400 block text-[10px] uppercase">Supplied</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{suppliedOnLatestDate.toFixed(1)} L</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Farm retention: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{farmRetentionLitres.toFixed(1)} L</span> (home consumption / calf feeding)
          </p>
        </div>
      </div>

      {/* Supply History Table */}
      <div className="glass rounded-3xl p-5">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
          Wholesale Supply Dispatch Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-neutral-400 font-medium pb-3">
                <th className="pb-3">Supply Date</th>
                <th className="pb-3">Buyer</th>
                <th className="pb-3">Session</th>
                <th className="pb-3 text-right">Volume (Litres)</th>
                <th className="pb-3 text-right">Applied Rate</th>
                <th className="pb-3 text-right">Total Billing Value</th>
                <th className="pb-3">Dispatch Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {supply.map(s => (
                <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-neutral-900 dark:text-white">{s.supply_date}</td>
                  <td className="py-3 font-medium text-neutral-800 dark:text-neutral-200">{s.buyer_name}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-500/10 text-neutral-600 dark:text-neutral-300">
                      {s.session}
                    </span>
                  </td>
                  <td className="py-3 text-right font-black text-neutral-900 dark:text-white">
                    {s.quantity_litres.toFixed(2)} L
                  </td>
                  <td className="py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                    ₹{s.rate_per_litre_applied.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                    ₹{s.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-neutral-500 dark:text-neutral-400 italic">
                    {s.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Supply */}
      <Modal isOpen={isSupplyModalOpen} onClose={() => setIsSupplyModalOpen(false)} title="Log Wholesale Supply Dispatch">
        <form onSubmit={handleSubmitSupply} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Dispatch Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Session</label>
            <select
              value={session}
              onChange={e => setSession(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="FULL_DAY">Full Day Combined</option>
              <option value="MORNING">Morning Tanker</option>
              <option value="EVENING">Evening Tanker</option>
            </select>
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Quantity Handed Over (Litres)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 145.5"
              value={litres}
              onChange={e => setLitres(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white font-bold text-sm focus:outline-none"
            />
            {litres && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Estimated Value: ₹{(parseFloat(litres) * rate.rate_per_litre).toFixed(2)} (at ₹{rate.rate_per_litre}/L)
              </p>
            )}
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Dispatch / Tanker Notes</label>
            <input
              type="text"
              placeholder="e.g. Tanker #04, driver signature on receipt #881"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsSupplyModalOpen(false)}
              className="px-4 py-2 rounded-xl glass text-neutral-600 dark:text-neutral-300 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/30"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SupplyPage
