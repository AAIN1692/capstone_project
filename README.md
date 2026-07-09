# Sales Pulse

A live sales/revenue dashboard for non-technical sales managers. Built for the Vibe Coding
Capstone (Option B: Analytics Dashboard with Live Data).

This repo is Sprint-1-ready: it implements all 6 must-have features (F1-F6) from the PRD
against a seeded, realistic dataset. Open it in Cursor to review, extend, and take through
Sprint 2 (stakeholder change request + polish).

## Structure
```
/server   Express + TypeScript API, SQLite database, seed script
/client   React + TypeScript + Vite frontend, Recharts, Tailwind
```

## Getting Started in Cursor

**1. Backend**
```bash
cd server
npm install
cp .env.example .env
npm run seed      # generates ~6 months of seeded sales data
npm run dev        # starts API on http://localhost:4000
```

**2. Frontend** (in a second terminal)
```bash
cd client
npm install
cp .env.example .env
npm run dev        # starts app on http://localhost:5173
```

Open http://localhost:5173 — the dashboard should load with seeded data.

## What's already built (Sprint 1)
- All 6 API endpoints (see `Phase3_Architecture.md` Section 4 for the full contract)
- Seeded dataset with deliberate patterns (a star rep, a slumping region, a seasonal dip)
  so the charts have something real to show
- Full dashboard UI: KPI summary bar, revenue trend chart (daily/weekly/monthly), and
  rep/category/region breakdown charts with tabs
- Date range presets + custom range, rep/category/region filtering, clear-filters control
- Plain-language error handling (no stack traces reach the UI)
- Empty-state handling for filter combinations with no data

## What's next (Sprint 2 — per the capstone's simulated change request)
1. User-facing error messages are already in place server-side; extend polish on the
   frontend for edge cases (network failures, slow connections)
2. Mobile-responsive layout — `KpiBar` and `TrendChart` were designed with this in mind
   (they already use responsive Tailwind grid/flex), but should be tested and refined on
   real small viewports
3. Loading states are implemented for all three data-fetching sections (KPI bar, trend,
   breakdown) — review and polish the skeleton/animation treatment

## Design notes
The visual direction is a "ledger" aesthetic — clean panels, a serif display face
(Fraunces) for headings, tabular monospace numerals for financial figures, and a single
confident green accent for "on pace" signals (with a warm red reserved for "behind pace" or
errors) rather than a decorative color palette. This was a deliberate choice for a
finance-adjacent, non-technical audience — see the frontend-design skill notes if
extending it further.

## Known limitation
SQLite is file-based; on some free-tier hosts (e.g. Railway) the filesystem is ephemeral
across redeploys. `server.ts` re-initializes the schema on boot, but seeded data will need
to be re-run (`npm run seed`) after a redeploy unless a persistent volume is attached. See
`Phase3_Architecture.md` Section 6 (Risks) for the accepted tradeoff.
