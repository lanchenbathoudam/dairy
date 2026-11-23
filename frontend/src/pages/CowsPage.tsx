import React, { useState, useMemo } from 'react'
import {
  Milk,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Ban,
  Calendar,
  Tag,
  CheckCircle2,
} from 'lucide-react'
import { useFarm } from '../context/FarmContext'
import { Cow, CowStatus } from '../types'
import PillTabs from '../components/PillTabs'
import Modal from '../components/Modal'

export const CowsPage: React.FC = () => {
  const { cows, addCow, updateCowStatus } = useFarm()
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCowForEdit, setSelectedCowForEdit] = useState<Cow | null>(null)

  // Form states for new cow
  const [newCode, setNewCode] = useState('')
  const [newName, setNewName] = useState('')
  const [newBreed, setNewBreed] = useState('Holstein Friesian Cross')
  const [newJoinedOn, setNewJoinedOn] = useState(new Date().toISOString().split('T')[0])
  const [newStatus, setNewStatus] = useState<CowStatus>('ACTIVE')
  const [newNotes, setNewNotes] = useState('')

  // Edit status modal state
  const [editStatus, setEditStatus] = useState<CowStatus>('ACTIVE')
  const [editNotes, setEditNotes] = useState('')

  const statusCounts = useMemo(() => {
    return {
      ALL: cows.length,
      ACTIVE: cows.filter(c => c.status === 'ACTIVE').length,
      DRY: cows.filter(c => c.status === 'DRY').length,
      SICK: cows.filter(c => c.status === 'SICK').length,
      INACTIVE: cows.filter(c => c.status === 'INACTIVE').length,
    }
  }, [cows])

  const filteredCows = useMemo(() => {
    return cows.filter(c => {
      const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus
      const matchSearch =
        c.cow_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.breed.toLowerCase().includes(searchQuery.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [cows, selectedStatus, searchQuery])

  const handleCreateCow = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode || !newName) return
    addCow({
      cow_code: newCode,
      display_name: newName,
      breed: newBreed,
      joined_on: newJoinedOn,
      status: newStatus,
      notes: newNotes,
    })
    setIsAddModalOpen(false)
    setNewCode('')
    setNewName('')
    setNewNotes('')
  }

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCowForEdit) return
    updateCowStatus(selectedCowForEdit.id, editStatus, editNotes)
    setSelectedCowForEdit(null)
  }

  const openEditModal = (cow: Cow) => {
    setSelectedCowForEdit(cow)
    setEditStatus(cow.status)
    setEditNotes(cow.notes || '')
  }

  const getStatusBadge = (status: CowStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <ShieldCheck size={12} /> Active Milking
          </span>
        )
      case 'DRY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <AlertTriangle size={12} /> Dry Period
          </span>
        )
      case 'SICK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            <HeartPulse size={12} /> Under Treatment
          </span>
        )
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
            <Ban size={12} /> Inactive
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Herd Register
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Individual cow identities, physiological status, and lactation records
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={16} />
          <span>Register New Cow</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <PillTabs
          tabs={[
            { key: 'ALL', label: 'All Herd', count: statusCounts.ALL },
            { key: 'ACTIVE', label: 'Active', count: statusCounts.ACTIVE },
            { key: 'DRY', label: 'Dry', count: statusCounts.DRY },
            { key: 'SICK', label: 'Under Treatment', count: statusCounts.SICK },
            { key: 'INACTIVE', label: 'Inactive', count: statusCounts.INACTIVE },
          ]}
          active={selectedStatus}
          onChange={setSelectedStatus}
          size="sm"
        />

        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by tag, name or breed..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Cow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCows.map(cow => (
          <div
            key={cow.id}
            className="glass glass-interactive rounded-3xl p-5 flex flex-col justify-between gap-4 border border-white/60 dark:border-white/10"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl icon-chip icon-chip-emerald text-sm font-black shrink-0">
                    {cow.cow_code.replace('COW-', '')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                      {cow.display_name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      {cow.cow_code}
                    </p>
                  </div>
                </div>
                {getStatusBadge(cow.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2.5 my-2 border-y border-black/5 dark:border-white/10">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">Breed</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cow.breed}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">Lactation Day</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {cow.status === 'ACTIVE' ? `Day ${cow.days_in_lactation || 45}` : 'Resting'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">Joined Farm</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cow.joined_on}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">Last Recorded Yield</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {cow.last_yield ? `${cow.last_yield} L` : '—'}
                  </span>
                </div>
              </div>

              {cow.notes && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 italic line-clamp-2">
                  "{cow.notes}"
                </p>
              )}
            </div>

            <button
              onClick={() => openEditModal(cow)}
              className="w-full py-2 text-xs font-semibold rounded-xl glass hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              Update Status / Observations
            </button>
          </div>
        ))}
      </div>

      {filteredCows.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center text-neutral-400">
          <p className="text-sm">No cows found matching the filter.</p>
        </div>
      )}

      {/* Modal: Register New Cow */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Cow in Herd">
        <form onSubmit={handleCreateCow} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
              Permanent Ear Tag Code (Unique)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. COW-016"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
              Display / Barn Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ganga II"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Breed</label>
              <select
                value={newBreed}
                onChange={e => setNewBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
              >
                <option value="Holstein Friesian Cross">Holstein Friesian Cross</option>
                <option value="Jersey Cross">Jersey Cross</option>
                <option value="Sahiwal">Sahiwal</option>
                <option value="Gir">Gir</option>
                <option value="Red Sindhi">Red Sindhi</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as CowStatus)}
                className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
              >
                <option value="ACTIVE">Active Milking</option>
                <option value="DRY">Dry (Pre-calving)</option>
                <option value="SICK">Sick (Quarantine)</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Joined Farm Date</label>
            <input
              type="date"
              value={newJoinedOn}
              onChange={e => setNewJoinedOn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Notes / Behavioral Traits</label>
            <textarea
              rows={2}
              placeholder="e.g. Docile, healthy eater..."
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl glass text-neutral-600 dark:text-neutral-300 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/30"
            >
              Save Cow
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Cow Status */}
      <Modal
        isOpen={!!selectedCowForEdit}
        onClose={() => setSelectedCowForEdit(null)}
        title={`Update ${selectedCowForEdit?.display_name} (${selectedCowForEdit?.cow_code})`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Operational Status</label>
            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value as CowStatus)}
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="ACTIVE">Active Milking (Include in daily milking)</option>
              <option value="DRY">Dry Period (Exclude from daily milking)</option>
              <option value="SICK">Sick / Quarantine (Discard milk)</option>
              <option value="INACTIVE">Inactive / Sold</option>
            </select>
          </div>
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">Veterinary / Status Notes</label>
            <textarea
              rows={3}
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              placeholder="Reason for status change, medication given, expected dry period end date..."
              className="w-full px-3 py-2 rounded-xl glass text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setSelectedCowForEdit(null)}
              className="px-4 py-2 rounded-xl glass text-neutral-600 dark:text-neutral-300 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/30"
            >
              Update Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CowsPage
