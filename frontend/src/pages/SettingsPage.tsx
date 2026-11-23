import React, { useState } from 'react'
import {
  Settings,
  ShieldCheck,
  Database,
  CloudUpload,
  RefreshCw,
  Bell,
  Sliders,
  DollarSign,
  UserCheck,
} from 'lucide-react'
import { useFarm } from '../context/FarmContext'
import { useAuth } from '../context/AuthContext'

export const SettingsPage: React.FC = () => {
  const { rate, buyer } = useFarm()
  const { user, login } = useAuth()
  const [backupStatus, setBackupStatus] = useState('Idle')

  const triggerBackup = () => {
    setBackupStatus('Backing up database...')
    setTimeout(() => {
      setBackupStatus('Backup completed successfully: snapshot_dairytrack_20261123.sql')
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Farm System Settings
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Configure farm parameters, active wholesale pricing contracts, automated backups, and access roles
        </p>
      </div>

      {/* Role Switcher Demo Card */}
      <div className="glass rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          <UserCheck size={14} className="text-emerald-500" />
          <span>Active Session Role (Demo Switcher)</span>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-300">
          Switch roles to test how permissions adapt between the Farm Owner, Barn Hand Recorder, and Family Viewer.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {(['ADMIN', 'RECORDER', 'VIEWER'] as const).map(role => (
            <button
              key={role}
              onClick={() => login(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                user?.role === role
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'glass text-neutral-700 dark:text-neutral-300 hover:bg-black/5'
              }`}
            >
              {role === 'ADMIN' ? 'Farm Administrator (Full Control)' : role === 'RECORDER' ? 'Milking Recorder (Barn Hands)' : 'Read-Only Viewer'}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing & Units */}
      <div className="glass rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
          Operational Parameters & Units
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
              Measurement Unit
            </label>
            <input
              type="text"
              disabled
              value="Litres (L) — 2 Decimal Precision"
              className="w-full px-3 py-2 rounded-xl glass bg-black/5 dark:bg-white/5 text-neutral-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
              Active Wholesale Price per Litre
            </label>
            <input
              type="text"
              disabled
              value={`₹${rate.rate_per_litre.toFixed(2)} / Litre`}
              className="w-full px-3 py-2 rounded-xl glass bg-black/5 dark:bg-white/5 text-neutral-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Database & Automated Backups */}
      <div className="glass rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Data Integrity & PostgreSQL Backups
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Nightly automated snapshots stored on encrypted storage with point-in-time recovery
            </p>
          </div>
          <button
            onClick={triggerBackup}
            className="px-4 py-2 rounded-xl glass hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw size={13} /> Run Snapshot Now
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 text-xs space-y-1">
          <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
            <span>Last Automated Backup:</span>
            <span className="font-mono font-semibold">Today at 04:00 AM (3.2 MB)</span>
          </div>
          <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
            <span>Retention Period:</span>
            <span className="font-semibold">365 Days Rolling Archive</span>
          </div>
          <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
            <span>Current Status:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{backupStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
