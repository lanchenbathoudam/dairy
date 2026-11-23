# Software Requirements Specification (SRS)
## DAIRYTRACK: Dairy Farm Production & Management System

**Version:** 1.0.0  
**Target:** Family-operated dairy farm (~15 cows, twice-daily collection, one wholesale buyer)  
**Baseline Date:** November 2026

---

## 1. Introduction

### 1.1 Purpose
This document provides the definitive specification of functional and non-functional requirements for **DairyTrack**, a digitized management system for family-run dairy farms. It serves as the baseline for implementation, testing, and deployment.

### 1.2 Scope
- **In Scope:**
  - Cow registry (permanent IDs, display labels, breeds, statuses: Active, Dry, Sick, Inactive).
  - Daily twice-daily milking session capture (Morning and Evening) with cow-level yields in litres.
  - Automatic calculation of session totals and daily farm production.
  - Historical data retrieval by date, date range, cow, month, year, and session.
  - Wholesale buyer profile and supply reconciliation (tracking milk handed over to buyer vs. milk produced).
  - Milk rate management with effective date ranges.
  - Buyer payments ledger, partial payment tracking, and outstanding balance calculation.
  - Production trend analytics and cow-performance reporting.
  - Role-based access control (Admin, Recorder, Read-Only Viewer) and audit trail.
- **Out of Scope (MVP):**
  - Public e-commerce or customer retail ordering.
  - Multiple buyers / automated retail billing.
  - Hardware IoT sensor integration (manual entry optimized for mobile barn use).
  - Milk processing / secondary product manufacturing (cheese, butter, curd).

---

## 2. Overall Description

### 2.1 User Roles & Personas

| Role | Permissions & Responsibilities |
| :--- | :--- |
| **Administrator (Farm Owner)** | Full access: cow CRUD, edit historical records, manage wholesale buyer and milk rates, record payments and expenses, view audit logs, manage user accounts. |
| **Recorder (Milking Hand / Family Member)** | Fast daily access: record morning and evening milking sessions, view cow profiles and today's status, flag sick/dry cows. Cannot edit historical records older than 24 hours without admin approval. |
| **Viewer (Accountant / Family Viewer)** | Read-only access: view production dashboards, records, analytics, financial ledgers, and export PDF/Excel reports. Cannot insert or modify records. |

### 2.2 Operational Assumptions
1. **Cow Herd:** Approximately 15 cows on the farm. System must remain configurable to support 1 to 100+ cows.
2. **Measurement Unit:** Metric Litres (`L`), stored with exact 2-decimal precision (e.g. `12.50 L`).
3. **Sessions:** Exactly two collection sessions per calendar day: **Morning (`MORNING`)** and **Evening (`EVENING`)**.
4. **Wholesale Model:** Milk is collected by a single wholesale partner (e.g. cooperative or private dairy). Payment is based on agreed rate per litre with periodic reconciliations.

---

## 3. Core Business Rules

1. **Uniqueness Constraint:** A cow can have at most **one** record for Morning session and **one** record for Evening session per calendar date. Duplicate entries are rejected at the database level.
2. **Missing Record $\neq$ Zero Yield:** If a cow was not recorded in a session, it is marked as `MISSING` rather than `0.00 L`, alerting the recorder of missed data.
3. **Producing Status Gating:** Cows marked as `DRY`, `SICK`, or `INACTIVE` default to non-producing. If a yield is entered for a dry/sick cow, a confirmation prompt is required and an audit event is logged.
4. **Decoupled Entities:**
   $$\text{Daily Production} = \sum \text{Morning Yields} + \sum \text{Evening Yields}$$
   $$\text{Supplied Volume} \neq \text{Produced Volume}$$
   Difference accounts for home consumption, calves, or spillages.
5. **Rate Preservation:** Each supply entry captures the exact rate per litre in effect on that date. Retroactive rate changes do not alter closed past records.
6. **Outstanding Balance:**
   $$\text{Balance Due} = \sum (\text{Supplied Litres} \times \text{Applied Rate}) - \sum \text{Payments Received}$$
7. **Auditability:** Any edit, deletion, or backdated insertion creates an immutable `AuditLog` entry indicating who, when, and previous vs. new values.

---

## 4. Functional Requirements

### 4.1 Cow Management (Module: `COW`)
- `COW-01`: Register new cow with required permanent ID (`cow_code`), display name/tag, breed, acquisition/birth date, and initial status.
- `COW-02`: Update cow status (`ACTIVE`, `DRY`, `SICK`, `INACTIVE`) with status change timestamp and optional notes.
- `COW-03`: View cow detail profile with lifetime production totals, 30-day average yield, and lactation curve.
- `COW-04`: Archive inactive or sold cows without destroying historical milking records.

### 4.2 Milk Production & Entry (Module: `PROD`)
- `PROD-01`: Mobile-first barn entry screen selecting calendar date and session (`MORNING` / `EVENING`).
- `PROD-02`: Render all active milking cows in a clean list with numerical input fields formatted for touch keyboards.
- `PROD-03`: Dynamic client-side calculation of session total litres as quantities are typed.
- `PROD-04`: Validation checks preventing negative values and highlighting abnormal entries (> 25 L/session warning threshold).
- `PROD-05`: Bulk submission wrapped in a database transaction.
- `PROD-06`: Missing cow indicator alerting recorder if any active cow was omitted before submission.

### 4.3 Historical Retrieval & Corrections (Module: `REC`)
- `REC-01`: Search and filter records by date range, specific cow, and session.
- `REC-02`: Paginated table view displaying cow, date, session, quantity, recorded timestamp, and entered by.
- `REC-03`: Authorized inline edits for corrections, automatically creating an audit log with change rationale.
- `REC-04`: Export filtered view to CSV format.

### 4.4 Wholesale Supply & Reconciliation (Module: `SUPPLY`)
- `SUPPLY-01`: Record daily milk supplied to wholesale buyer (date, session, volume in litres).
- `SUPPLY-02`: Automatically associate currently effective `MilkRate` and compute line item total value.
- `SUPPLY-03`: Supply vs. Production reconciliation view displaying total produced, total supplied, and variance (farm consumption / calf feeding).
- `SUPPLY-04`: Buyer statement generation showing date, supplied litres, rate, value, payments received, and running balance.

### 4.5 Financials & Payments (Module: `FIN`)
- `FIN-01`: Log buyer payments with payment date, amount, payment method (Cash, UPI, Bank Transfer, Cheque), and reference ID.
- `FIN-02`: Support partial payments, advances, and full settlements.
- `FIN-03`: Real-time calculation of total billings, total payments, and outstanding receivable balance.
- `FIN-04`: Record discretionary farm expenses (feed, veterinary, medicine, utilities) for net profit insights.

### 4.6 Analytics & Reports (Module: `ANALYTICS`)
- `REP-01`: Production dashboard charts: daily production bar/area chart, morning vs. evening comparison.
- `REP-02`: Top/bottom performing cows over selected 7-day, 30-day, and custom periods.
- `REP-03`: Period-over-period percentage change (current week vs. prior week).
- `REP-04`: Summary report views ready for print and export.

---

## 5. Non-Functional Requirements

### 5.1 Usability & Responsive UI
- Must use the **Aero-Ground** optical glassmorphism design system with high-contrast text rendering.
- Must support both **Light Mode** (daytime barn visibility) and **Dark Mode** (early morning / night milking).
- Touch target sizes on mobile milk entry must be at least $44 \times 44 \text{ px}$ with clear numeric inputs.
- Keyboard navigation and reduced-motion media query support (`prefers-reduced-motion`).

### 5.2 Performance & Reliability
- Fast page load: bundle size optimized via Vite code splitting.
- Database queries for daily totals and summaries must execute in $< 50 \text{ ms}$ for historical datasets up to 10 years.
- Milking entry submissions must be atomic (`transaction.atomic`).

### 5.3 Data Integrity & Security
- Exact precision: Python `Decimal` / PostgreSQL `NUMERIC(6, 2)` for volumes and `NUMERIC(10, 2)` for monetary values. Floating-point types (`float`) are prohibited.
- Role-based authorization enforced server-side on every API endpoint.
- CSRF protection, secure HTTP-only cookies / JWT auth, and parameterized queries.
