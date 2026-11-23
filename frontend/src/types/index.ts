export type CowStatus = 'ACTIVE' | 'DRY' | 'SICK' | 'INACTIVE'

export interface Cow {
  id: number
  cow_code: string
  display_name: string
  breed: string
  joined_on: string
  status: CowStatus
  notes?: string
  last_yield?: number
  days_in_lactation?: number
}

export type MilkingSession = 'MORNING' | 'EVENING'

export interface MilkRecord {
  id: number
  cow_id: number
  cow_code: string
  cow_name: string
  production_date: string
  session: MilkingSession
  quantity_litres: number
  notes?: string
  entered_by?: string
  created_at?: string
}

export interface Buyer {
  id: number
  name: string
  contact_person: string
  phone: string
  email: string
  address: string
  is_active: boolean
}

export interface MilkRate {
  id: number
  rate_per_litre: number
  effective_from: string
  effective_to?: string | null
  notes?: string
}

export interface SupplyRecord {
  id: number
  buyer_id: number
  buyer_name: string
  supply_date: string
  session: 'MORNING' | 'EVENING' | 'FULL_DAY'
  quantity_litres: number
  rate_per_litre_applied: number
  total_amount: number
  notes?: string
}

export interface Payment {
  id: number
  buyer_id: number
  payment_date: string
  amount: number
  method: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE'
  reference_no: string
  notes?: string
}

export interface User {
  id: number
  username: string
  email: string
  role: 'ADMIN' | 'RECORDER' | 'VIEWER'
  first_name: string
  last_name: string
}
