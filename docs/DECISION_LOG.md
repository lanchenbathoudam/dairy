# Architectural Decision Records (ADRs) & Decision Log
## DAIRYTRACK: Dairy Farm Production & Management System

---

## ADR-001: Separation of Frontend and Backend (Decoupled SPA)
- **Status:** Accepted
- **Context:** The farm needs a fast, mobile-friendly interface for barn workers that can function smoothly on mobile browsers and desktops, while maintaining strong data validation and security on the server.
- **Decision:** Build a separated frontend in React + TypeScript + Vite and a backend in Django REST Framework. The browser communicates exclusively via authenticated JSON APIs.
- **Consequences:** Clean boundary between presentation and business logic, independent testability, easy path to future offline PWA capabilities.

---

## ADR-002: Exact Decimal Arithmetic for Quantities and Currency
- **Status:** Accepted
- **Context:** Standard IEEE 754 floating-point numbers (`float` / `double`) introduce rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`). In production tracking and wholesale financial settlements, fractional litres and monetary pennies accumulate discrepancies over months.
- **Decision:** Mandate Python `Decimal` and PostgreSQL `NUMERIC(6, 2)` for milk volumes, and `NUMERIC(10, 2)` for currency.
- **Consequences:** Guarantees exact ledger reconciliations with zero floating-point drift.

---

## ADR-003: Database-Level Uniqueness Constraint for Milking Sessions
- **Status:** Accepted
- **Context:** In a busy barn environment, two family members or workers might accidentally log the same morning session for the same cow twice, artificially inflating production records.
- **Decision:** Enforce a composite database unique constraint:
  ```python
  UniqueConstraint(fields=['cow', 'production_date', 'session'], name='unique_cow_date_session')
  ```
- **Consequences:** Double submissions fail at the database level regardless of network retry races or user interface double-clicks.

---

## ADR-004: Decoupling Production, Supply, and Payments
- **Status:** Accepted
- **Context:** Many basic farm apps mistakenly equate total milk produced with total milk sold. In reality, a farm retains milk for calves, household consumption, farm workers, or occasional spillage. Furthermore, buyers pay on delayed cycles or in partial installments.
- **Decision:** Model `MilkRecord`, `SupplyRecord`, and `Payment` as three independent entities with explicit reconciliation views.
- **Consequences:** Accurate tracking of farm loss / retention and crystal-clear buyer credit balances.

---

## ADR-005: Preserving Historical Rates on Supply Records
- **Status:** Accepted
- **Context:** Wholesale milk rates fluctuate over time based on cooperative policy or seasonal contracts. If a future rate increases, past unpaid invoices must not retroactively recalculate at the new rate.
- **Decision:** `SupplyRecord` stores both a foreign key reference to `MilkRate` and copies the frozen `rate_per_litre_applied` and computed `total_amount` onto the record at write time.
- **Consequences:** Past financial ledger entries remain 100% immutable against future pricing policy updates.

---

## ADR-006: Aero-Ground Liquid Glassmorphism UI Design System
- **Status:** Accepted
- **Context:** The client requires a modern, high-tech, aesthetically pleasing user interface that is inspiring to use, highly legible in both bright barn sunlight (light mode) and dawn/dusk milking hours (dark mode).
- **Decision:** Implement the Aero-Ground design system featuring liquid glassmorphism, 3D glossy icon squircles, ambient floating light blobs, and high-contrast typography.
- **Consequences:** Premium user experience, high visual polish, and clear information hierarchy.
