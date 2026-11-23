import { Cow, MilkRecord, Buyer, MilkRate, SupplyRecord, Payment } from '../types'

export const INITIAL_COWS: Cow[] = [
  { id: 1, cow_code: 'COW-001', display_name: 'Lakshmi', breed: 'Holstein Friesian Cross', joined_on: '2023-01-15', status: 'ACTIVE', last_yield: 14.8, days_in_lactation: 110, notes: 'Highest yielding cow, calm temperament.' },
  { id: 2, cow_code: 'COW-002', display_name: 'Gauri', breed: 'Jersey Cross', joined_on: '2023-02-10', status: 'ACTIVE', last_yield: 13.2, days_in_lactation: 95, notes: 'High butterfat content, consistent producer.' },
  { id: 3, cow_code: 'COW-003', display_name: 'Kamadhenu', breed: 'Sahiwal', joined_on: '2023-04-01', status: 'ACTIVE', last_yield: 11.5, days_in_lactation: 140, notes: 'Disease resilient indigenous cow.' },
  { id: 4, cow_code: 'COW-004', display_name: 'Nandini', breed: 'Gir Cross', joined_on: '2023-05-12', status: 'ACTIVE', last_yield: 12.0, days_in_lactation: 75, notes: 'Strong appetite, peak lactation phase.' },
  { id: 5, cow_code: 'COW-005', display_name: 'Radha', breed: 'Holstein Friesian Cross', joined_on: '2023-06-20', status: 'ACTIVE', last_yield: 15.0, days_in_lactation: 85, notes: 'Consistent morning producer.' },
  { id: 6, cow_code: 'COW-006', display_name: 'Kaveri', breed: 'Jersey', joined_on: '2023-08-04', status: 'ACTIVE', last_yield: 10.8, days_in_lactation: 160, notes: 'Docile, responsive to scheduled feeds.' },
  { id: 7, cow_code: 'COW-007', display_name: 'Yamuna', breed: 'Red Sindhi Cross', joined_on: '2023-09-15', status: 'ACTIVE', last_yield: 11.2, days_in_lactation: 125, notes: 'Solid evening session yield.' },
  { id: 8, cow_code: 'COW-008', display_name: 'Sita', breed: 'Holstein Friesian Cross', joined_on: '2023-11-01', status: 'ACTIVE', last_yield: 14.0, days_in_lactation: 50, notes: 'Recently calved, yield ramping upward.' },
  { id: 9, cow_code: 'COW-009', display_name: 'Ganga', breed: 'Jersey Cross', joined_on: '2023-12-10', status: 'ACTIVE', last_yield: 12.5, days_in_lactation: 65, notes: 'Very gentle, likes morning grooming.' },
  { id: 10, cow_code: 'COW-010', display_name: 'Saraswati', breed: 'Sahiwal Cross', joined_on: '2024-01-18', status: 'ACTIVE', last_yield: 9.8, days_in_lactation: 180, notes: 'Steady daily yields.' },
  { id: 11, cow_code: 'COW-011', display_name: 'Parvati', breed: 'Holstein Friesian Cross', joined_on: '2024-02-22', status: 'ACTIVE', last_yield: 13.6, days_in_lactation: 40, notes: 'Second lactation cycle.' },
  { id: 12, cow_code: 'COW-012', display_name: 'Bhavani', breed: 'Gir', joined_on: '2024-03-30', status: 'ACTIVE', last_yield: 10.4, days_in_lactation: 195, notes: 'Heat tolerant indigenous breed.' },
  { id: 13, cow_code: 'COW-013', display_name: 'Annapurna', breed: 'Jersey Cross', joined_on: '2024-05-14', status: 'DRY', last_yield: 0.0, days_in_lactation: 0, notes: 'Dry period before expected calving in 4 weeks.' },
  { id: 14, cow_code: 'COW-014', display_name: 'Shanti', breed: 'Holstein Friesian Cross', joined_on: '2024-07-01', status: 'SICK', last_yield: 0.0, days_in_lactation: 100, notes: 'Mastitis treatment in progress. Milk discarded per vet orders.' },
  { id: 15, cow_code: 'COW-015', display_name: 'Tara', breed: 'Local Hill Breed', joined_on: '2024-08-20', status: 'ACTIVE', last_yield: 8.5, days_in_lactation: 210, notes: 'Low volume but high protein density.' }
]

export const BUYER_PROFILE: Buyer = {
  id: 1,
  name: 'Apex Dairy Farmers Cooperative Union',
  contact_person: 'Ramesh Patel (Procurement Officer)',
  phone: '+91 98765 43210',
  email: 'procure@apexdairycoop.org',
  address: 'Regional Milk Chilling Centre, Sector 4, Anand Taluq',
  is_active: true
}

export const CURRENT_RATE: MilkRate = {
  id: 1,
  rate_per_litre: 42.50,
  effective_from: '2026-01-01',
  effective_to: null,
  notes: 'Revised cooperative seasonal rate for A-Grade raw fresh milk.'
}

// Generate last 7 days of realistic production & supply records
export function generatePastProduction(): { records: MilkRecord[], supply: SupplyRecord[], payments: Payment[] } {
  const records: MilkRecord[] = []
  const supply: SupplyRecord[] = []
  const payments: Payment[] = []

  const activeCows = INITIAL_COWS.filter(c => c.status === 'ACTIVE')
  const baseDate = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    let morningTotal = 0
    let eveningTotal = 0

    // Morning Session
    activeCows.forEach((cow, idx) => {
      // Small realistic variation around cow's last yield
      const variation = Math.sin(i * 1.5 + idx) * 0.8
      const morningYield = Math.max(3.0, Number((cow.last_yield! * 0.55 + variation).toFixed(2)))
      morningTotal += morningYield

      records.push({
        id: records.length + 1,
        cow_id: cow.id,
        cow_code: cow.cow_code,
        cow_name: cow.display_name,
        production_date: dateStr,
        session: 'MORNING',
        quantity_litres: morningYield,
        entered_by: 'Staff',
        created_at: `${dateStr}T06:30:00Z`
      })
    })

    // Evening Session
    activeCows.forEach((cow, idx) => {
      const variation = Math.cos(i * 1.5 + idx) * 0.7
      const eveningYield = Math.max(2.5, Number((cow.last_yield! * 0.45 + variation).toFixed(2)))
      eveningTotal += eveningYield

      records.push({
        id: records.length + 1,
        cow_id: cow.id,
        cow_code: cow.cow_code,
        cow_name: cow.display_name,
        production_date: dateStr,
        session: 'EVENING',
        quantity_litres: eveningYield,
        entered_by: 'Staff',
        created_at: `${dateStr}T17:45:00Z`
      })
    })

    // Supply record for the day (Total produced minus ~6 litres for home & calf feeding)
    const dayProduced = morningTotal + eveningTotal
    const daySupplied = Number((dayProduced - 6.5).toFixed(2))
    const totalAmount = Number((daySupplied * CURRENT_RATE.rate_per_litre).toFixed(2))

    supply.push({
      id: supply.length + 1,
      buyer_id: BUYER_PROFILE.id,
      buyer_name: BUYER_PROFILE.name,
      supply_date: dateStr,
      session: 'FULL_DAY',
      quantity_litres: daySupplied,
      rate_per_litre_applied: CURRENT_RATE.rate_per_litre,
      total_amount: totalAmount,
      notes: `Tanker route #3 pickup. Farm retention: 6.50 L`
    })

    // Generate payments on alternate days
    if (i === 5) {
      payments.push({
        id: 1,
        buyer_id: BUYER_PROFILE.id,
        payment_date: dateStr,
        amount: 25000.00,
        method: 'BANK_TRANSFER',
        reference_no: 'NEFT-AXIS-992144',
        notes: 'Weekly cooperative settlement cycle'
      })
    } else if (i === 1) {
      payments.push({
        id: 2,
        buyer_id: BUYER_PROFILE.id,
        payment_date: dateStr,
        amount: 22000.00,
        method: 'UPI',
        reference_no: 'UPI-SBIN-884129',
        notes: 'Mid-week advance against supply'
      })
    }
  }

  return { records, supply, payments }
}

const mockStore = generatePastProduction()
export const INITIAL_RECORDS = mockStore.records
export const INITIAL_SUPPLY = mockStore.supply
export const INITIAL_PAYMENTS = mockStore.payments
