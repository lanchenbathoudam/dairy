# DAIRYTRACK

> **Dairy Farm Production & Management System**  
> A full-stack web application designed for family-operated dairy farms (~15 cows, twice-daily collection, wholesale buyer reconciliation).  
> Built with **React + TypeScript + Vite + Tailwind CSS** (featuring the Aero-Ground liquid glassmorphism design system) and **Python + Django REST Framework + PostgreSQL/SQLite**.

---

## 📋 Implementation Status

| Phase | Milestone | Status | Details |
| :--- | :--- | :---: | :--- |
| **Phase 1** | **Requirements & Project Foundation** | ✅ **Complete** | SRS, architecture, decision log, ER diagram, repo scaffolding |
| **Phase 2** | **UI/UX & Aero-Ground Design System** | ✅ **Complete** | Full glassmorphism UI, dual theme (light/dark), 9 responsive operational views, component library |
| **Phase 3** | **Database Design & Data Integrity** | ✅ **Complete** | Django models, PostgreSQL/SQLite schema, `Decimal` precision, unique constraints, audit log, seed data & unit tests |
| **Phase 4** | **Backend & API Development** | ⏳ Scheduled | REST APIs, authentication, permissions, filtering, pagination |
| **Phase 5** | **Frontend API Integration** | ⏳ Scheduled | TanStack Query, Axios client, end-to-end form validation |
| **Phase 6** | **Milk Production Operations** | ⏳ Scheduled | Live barcode/quick-entry barn workflow, offline resilience |
| **Phase 7** | **Analytics & Reporting** | ⏳ Scheduled | Production trends, cow ranking, PDF & Excel export generation |
| **Phase 8** | **Wholesale Supply & Finance** | ⏳ Scheduled | Buyer reconciliation, automated rate calculations, ledger |
| **Phase 9** | **QA & Security Hardening** | ⏳ Scheduled | Automated tests, penetration checks, backup restore drills |
| **Phase 10** | **Deployment & Maintenance** | ⏳ Scheduled | Production deployment with Nginx, Gunicorn, SSL |

---

## 🏛️ System Architecture

```mermaid
graph TD
    User["👨‍🌾 Farm Staff / Manager<br>(Mobile & Desktop)"] -->|HTTPS / UI| ReactApp["Frontend (React 19 + TypeScript + Vite)"]
    ReactApp -->|REST API (JSON)| DjangoAPI["Backend (Django 5 + Django REST Framework)"]
    DjangoAPI -->|ORM Transactions| DB[("Database (PostgreSQL / SQLite)")<br>Exact Decimal Math]
    DjangoAPI -->|Audit Signal| AuditLog["Traceability & Audit Logs"]
    DjangoAPI -->|Aggregation| Reports["Analytics & Reconciliation Engine"]
```

---

## 📂 Repository Structure

```
dairy/
├── frontend/                     # React 19 + TypeScript + Tailwind CSS (Aero-Ground UI)
│   ├── public/                   # Static assets & brand icons
│   ├── src/
│   │   ├── components/           # Glass panels, stat cards, icon squircles, navigation
│   │   │   ├── AmbientBackground.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── IntelPanel.tsx
│   │   │   ├── PillTabs.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── WeatherSky.tsx
│   │   ├── context/              # Theme (Dark/Light) & Auth context
│   │   ├── pages/                # Complete interactive views
│   │   │   ├── Dashboard.tsx     # KPI cards, sparklines, production trend chart, leaderboard
│   │   │   ├── CowsPage.tsx      # Herd register, status filters (Active/Dry/Sick), cow drawer
│   │   │   ├── MilkEntryPage.tsx # Barn session capture (Morning/Evening) with live totals
│   │   │   ├── MilkRecordsPage.tsx # Historical retrieval with filters and CSV export
│   │   │   ├── AnalyticsPage.tsx # Yield trends, morning vs evening distribution
│   │   │   ├── SupplyPage.tsx    # Wholesale buyer dispatch & production reconciliation
│   │   │   ├── PaymentsPage.tsx  # Buyer payments, rate tracking, outstanding balance
│   │   │   ├── ReportsPage.tsx   # Report generation preview
│   │   │   ├── SettingsPage.tsx  # Farm configuration, backup status, rates
│   │   │   └── LoginPage.tsx     # Glass login screen
│   │   ├── services/             # Mock data store & typed API client
│   │   ├── types/                # TypeScript domain models
│   │   ├── App.tsx               # Client router & page wrapper
│   │   ├── index.css             # Aero-Ground liquid glassmorphism tokens & animations
│   │   └── main.tsx              # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Django + Django REST Framework
│   ├── apps/
│   │   ├── accounts/             # Custom User model (Admin, Recorder, Viewer)
│   │   ├── cows/                 # Cow entity, status management (Active, Dry, Sick, Inactive)
│   │   ├── production/           # MilkCollection & MilkRecord with (cow, date, session) uniqueness
│   │   ├── supply/               # Wholesale Buyer, MilkRate history, SupplyRecord
│   │   ├── finance/              # Payment ledger, FarmExpense
│   │   └── audit/                # Mutation tracking AuditLog
│   ├── config/                   # Django settings, URLs, WSGI
│   ├── tests/                    # Database integrity, uniqueness & precision unit tests
│   ├── manage.py
│   └── requirements.txt
│
└── docs/                         # Architecture & Specification Documents
    ├── SRS.md                    # Software Requirements Specification
    ├── ARCHITECTURE.md           # Technical Architecture & Data Flow
    ├── DECISION_LOG.md           # Architecture Decision Records (ADRs)
    ├── ERD.md                    # Entity Relationship Diagram (Mermaid)
    └── DATA_DICTIONARY.md        # Comprehensive Database Data Dictionary
```

---

## 🚀 Quickstart Guide

### 1. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_farm_data     # Seeds 15 cows, 30 days of records, buyer & rates
python manage.py test               # Runs data integrity & constraint unit tests
python manage.py runserver
```

---

## 🎨 Aero-Ground Design Tokens

The frontend uses the signature **Aero-Ground** optical design system:
- **Light Theme Canvas:** Sky aero daylight gradient (`linear-gradient(160deg, #a8d4ff 0%, #8dc3fb 25%, #7fb8fa 48%, #9ecdfb 70%, #c3e0fc 100%)`) with fixed attachment.
- **Dark Theme Canvas:** Deep cockpit obsidian (`radial-gradient(ellipse 1400px 900px at 20% -10%, #1a1a1a 0%, #101010 45%, #060606 100%)`).
- **Convex Specular Highlight:** Optical curved highlight via `.glass::before` radial gradient pseudo-element.
- **3D Glossy Icon Squircles:** `.icon-chip` components with specular bevel (`inset 0 1.5px 0`) and ambient colored glow halos.
- **Physics-Based Lift:** Interactive cards bounce with `cubic-bezier(0.34, 1.56, 0.64, 1)` on hover.
- **Weather Micro-Animation:** Real-time cloud drift animation for pasture & weather conditions.

---

## 🔒 Data Integrity Principles
1. **No Binary Floating-Point Math:** All milk volumes and financial figures use PostgreSQL `NUMERIC` / Python `Decimal` to avoid rounding errors.
2. **Double-Milking Prevention:** Enforced DB unique constraint: `UNIQUE (cow_id, production_date, session)`.
3. **Distinct Concepts:** Produced milk $\neq$ Supplied milk $\neq$ Payments. Each entity is separately tracked and reconciled.
4. **Historical Price Protection:** `SupplyRecord` locks in the applied rate at the moment of supply rather than referencing a floating live rate.
5. **Full Audit Traceability:** All updates and status changes are permanently recorded in `AuditLog`.
