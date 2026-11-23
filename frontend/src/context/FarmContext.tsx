import React, { createContext, useContext, useState } from 'react'
import { Cow, MilkRecord, SupplyRecord, Payment, Buyer, MilkRate } from '../types'
import { INITIAL_COWS, INITIAL_RECORDS, INITIAL_SUPPLY, INITIAL_PAYMENTS, BUYER_PROFILE, CURRENT_RATE } from '../services/mockData'

interface FarmContextType {
  cows: Cow[]
  records: MilkRecord[]
  supply: SupplyRecord[]
  payments: Payment[]
  buyer: Buyer
  rate: MilkRate
  addCow: (cow: Omit<Cow, 'id'>) => void
  updateCowStatus: (cowId: number, status: Cow['status'], notes?: string) => void
  recordMilkingSession: (date: string, session: 'MORNING' | 'EVENING', entries: { cowId: number; litres: number }[]) => void
  recordSupply: (date: string, session: 'MORNING' | 'EVENING' | 'FULL_DAY', litres: number, notes?: string) => void
  recordPayment: (payment: Omit<Payment, 'id'>) => void
}

const FarmContext = createContext<FarmContextType | undefined>(undefined)

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cows, setCows] = useState<Cow[]>(INITIAL_COWS)
  const [records, setRecords] = useState<MilkRecord[]>(INITIAL_RECORDS)
  const [supply, setSupply] = useState<SupplyRecord[]>(INITIAL_SUPPLY)
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS)
  const [buyer] = useState<Buyer>(BUYER_PROFILE)
  const [rate] = useState<MilkRate>(CURRENT_RATE)

  const addCow = (newCowData: Omit<Cow, 'id'>) => {
    const newCow: Cow = {
      ...newCowData,
      id: cows.length + 1,
      last_yield: 0,
      days_in_lactation: 0
    }
    setCows(prev => [...prev, newCow])
  }

  const updateCowStatus = (cowId: number, status: Cow['status'], notes?: string) => {
    setCows(prev => prev.map(c => c.id === cowId ? { ...c, status, notes: notes || c.notes } : c))
  }

  const recordMilkingSession = (date: string, session: 'MORNING' | 'EVENING', entries: { cowId: number; litres: number }[]) => {
    const newRecords: MilkRecord[] = entries.map((entry, idx) => {
      const cow = cows.find(c => c.id === entry.cowId)
      return {
        id: records.length + idx + 1,
        cow_id: entry.cowId,
        cow_code: cow?.cow_code || `COW-${entry.cowId}`,
        cow_name: cow?.display_name || `Cow #${entry.cowId}`,
        production_date: date,
        session,
        quantity_litres: entry.litres,
        entered_by: 'Staff',
        created_at: new Date().toISOString()
      }
    })

    // Remove any existing records for this (cow, date, session) to prevent duplicates
    const entryCowIds = new Set(entries.map(e => e.cowId))
    const filteredOldRecords = records.filter(r => !(r.production_date === date && r.session === session && entryCowIds.has(r.cow_id)))

    setRecords([...filteredOldRecords, ...newRecords])

    // Update cows last_yield
    setCows(prev => prev.map(c => {
      const found = entries.find(e => e.cowId === c.id)
      if (found) {
        return { ...c, last_yield: found.litres }
      }
      return c
    }))
  }

  const recordSupply = (date: string, session: 'MORNING' | 'EVENING' | 'FULL_DAY', litres: number, notes?: string) => {
    const totalAmount = Number((litres * rate.rate_per_litre).toFixed(2))
    const newSupplyItem: SupplyRecord = {
      id: supply.length + 1,
      buyer_id: buyer.id,
      buyer_name: buyer.name,
      supply_date: date,
      session,
      quantity_litres: litres,
      rate_per_litre_applied: rate.rate_per_litre,
      total_amount: totalAmount,
      notes: notes || 'Daily supply dispatch'
    }
    setSupply(prev => [newSupplyItem, ...prev])
  }

  const recordPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: payments.length + 1
    }
    setPayments(prev => [newPayment, ...prev])
  }

  return (
    <FarmContext.Provider value={{
      cows,
      records,
      supply,
      payments,
      buyer,
      rate,
      addCow,
      updateCowStatus,
      recordMilkingSession,
      recordSupply,
      recordPayment
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export const useFarm = () => {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarm must be used within FarmProvider')
  return ctx
}
