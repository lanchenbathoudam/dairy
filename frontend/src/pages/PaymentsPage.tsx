import React, { useState } from 'react'
import {
  Wallet,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Building,
  CreditCard,
  DollarSign,
} from 'lucide-react'
import { useFarm } from '../context/FarmContext'
import Modal from '../components/Modal'

export const PaymentsPage: React.FC = () => {
  const { payments, supply, buyer, recordPayment } = useFarm()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'UPI' | 'CASH' | 'CHEQUE'>('BANK_TRANSFER')
  const [refNo, setRefNo] = useState('')
  const [notes, setNotes] = useState('')

  const totalBilled = supply.reduce((sum, s) => sum + s.total_amount, 0)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balanceOutstanding = Math.max(0, totalBilled - totalPaid)

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return

    recordPayment({
      buyer_id: buyer.id,
      payment_date: paymentDate,
      amount: amt,
      method,
      reference_no: refNo || `TXN-${Date.now().toString().slice(-6)}`,
      notes,
    })

    setIsPaymentModalOpen(false)
    setAmount('')
    setRefNo('')
    setNotes('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Buyer Payments & Settlement Ledger
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Track remittances received from {buyer.name} and monitor outstanding credit balance
          </p>
        </div>
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={16} />
          <span>Record Remittance</span>
        </button>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-3xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Supply Invoiced</span>
          <p className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
            ₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-neutral-500">Cumulative value of milk supplied</p>
        </div>

        <div className="glass rounded-3xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Payments Cleared</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-neutral-500">{payments.length} cleared payment transactions</p>
        </div>

        <div className="glass rounded-3xl p-5 space-y-1">
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Outstanding Balance Due</span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            ₹{balanceOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-neutral-500">Pending buyer settlement</p>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="glass rounded-3xl p-5">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
          Remittance Transaction Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-neutral-400 font-medium pb-3">
                <th className="pb-3">Payment Date</th>
                <th className="pb-3">Buyer</th>
                <th className="pb-3">Payment Channel</th>
                <th className="pb-3">Transaction Reference</th>
                <th className="pb-3 text-right">Amount Cleared</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-neutral-900 dark:text-white">{p.payment_date}</td>
                  <td className="py-3 font-medium text-neutral-800 dark:text-neutral-200">{buyer.name}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-neutral-600 dark:text-neutral-300">
                    {p.reference_no}
                  </td>
                  <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-neutral-500 dark:text-neutral-400 italic">
                    {p.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Remittance */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Buyer Remittance">
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Payment Date</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Amount Received (₹)</label>
            <input
              type="number"
              step="1"
              required
              placeholder="e.g. 20000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white font-bold text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Payment Method</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="CHEQUE">Bank Cheque</option>
              <option value="CASH">Cash in Hand</option>
            </select>
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Transaction Ref / Cheque No.</label>
            <input
              type="text"
              placeholder="e.g. UTR-994102941"
              value={refNo}
              onChange={e => setRefNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Ledger Notes</label>
            <input
              type="text"
              placeholder="e.g. Cleared via cooperative accounts department"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl glass text-neutral-600 dark:text-neutral-300 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/30"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PaymentsPage
