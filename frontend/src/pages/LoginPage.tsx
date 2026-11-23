import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Milk, Shield, ArrowRight, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'RECORDER' | 'VIEWER'>('ADMIN')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login(selectedRole)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div
        className="liquid-blob"
        style={{
          top: '-10%',
          left: '10%',
          width: '38rem',
          height: '24rem',
          background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.45), transparent 72%)',
        }}
      />
      <div
        className="liquid-blob"
        style={{
          bottom: '-10%',
          right: '10%',
          width: '36rem',
          height: '22rem',
          background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.4), transparent 72%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md glass rounded-4xl p-8 shadow-2xl border border-white/60 dark:border-white/10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl icon-chip icon-chip-emerald mx-auto shadow-lg">
            <Milk size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            DairyTrack
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Dairy Farm Production & Management Operations System
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
              Select Operator Role
            </label>
            <div className="space-y-2">
              {[
                { role: 'ADMIN', title: 'Farm Owner (Admin)', desc: 'Full operational, pricing & financial control' },
                { role: 'RECORDER', title: 'Milking Hand (Recorder)', desc: 'Fast daily morning & evening milk logging' },
                { role: 'VIEWER', title: 'Family Member / Auditor (Viewer)', desc: 'Read-only production & financial analytics' },
              ].map(item => (
                <label
                  key={item.role}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedRole === item.role
                      ? 'border-emerald-500/80 bg-emerald-500/10 shadow-sm'
                      : 'border-white/40 dark:border-white/10 glass hover:bg-black/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={selectedRole === item.role}
                    onChange={() => setSelectedRole(item.role as any)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">{item.title}</h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <span>Enter Farm Operations Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-[10px] text-center text-neutral-400">
          Protected with role-based authorization & exact Decimal ledger accounting.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
