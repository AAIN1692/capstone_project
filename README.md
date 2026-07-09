# Sales Pulse

A live sales/revenue dashboard for non-technical sales managers. Built for the Vibe Coding
Capstone (Option B: Analytics Dashboard with Live Data).

## Live URLs
- **Application:** https://capstone-project-plum-six-96.vercel.app
- **API:** https://capstoneproject-production-826b.up.railway.app/api
- **API Health Check:** https://capstoneproject-production-826b.up.railway.app/api/health

## Feature List
- Live-updating KPI summary bar: total revenue, deals closed, average deal size, quota attainment
- Revenue trend chart with daily / weekly / monthly granularity toggle
- Breakdown charts by sales rep, product category, and region (tabbed)
- Date range filtering (presets + custom range) combinable with rep / category / region filters
- Plain-language error handling — no technical jargon ever reaches the UI
- Loading states on every data-fetching section, including filter dropdown options
- Mobile-responsive layout (Filter Bar and KPI Bar tested down to iPhone SE width)
- Seeded, realistic dataset with deliberately designed patterns (a star performer, a slumping
  region, a seasonal dip) so the charts have genuine signal to show

## Structure
```
/server   Express + TypeScript API, SQLite database, seed script, tests
/client   React + TypeScript + Vite frontend, Recharts, Tailwind
/docs     Capstone planning deliverables (Phase 1-7 documents)
```

## Environment Variables

**`server/.env`** (copy from `server/.env.example`)
| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Port the API listens on | `4000` |
| `DB_PATH` | Path to the SQLite database file | `./sales_pulse.db` |
| `CLIENT_ORIGIN` | Allowed CORS origin (must match the frontend's real URL in production) | `https://capstone-project-plum-six-96.vercel.app` |

**`client/.env`** (copy from `client/.env.example`)
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Base URL the frontend calls for API requests | `https://capstoneproject-production-826b.up.railway.app/api` |

## Local Setup

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

Open http://localhost:5173.

## Running Tests
```bash
cd server
npm install
npm test
```
Covers unit tests for the aggregation service layer (`salesService.test.ts`) and integration
tests for all 6 API endpoints against the real Express app (`salesRoutes.integration.test.ts`),
including explicit checks that error responses never leak stack traces to the client.

## Deployment Guide

**Backend (Railway)**
1. New Project → Deploy from GitHub repo → select this repo
2. Settings → Source → Root Directory → `server`
3. Settings → Build → Build Command `npm install && npm run build`, Start Command `node dist/server.js`
4. Variables → set `CLIENT_ORIGIN` to your deployed frontend's exact origin (including
   `https://`, no trailing slash) and `DB_PATH` to `./sales_pulse.db`
5. Settings → Networking → Generate Domain
6. The database auto-seeds on first boot (and on any redeploy that resets the filesystem) via
   `seedIfEmpty()` in `server.ts` — no manual seed step needed after the first deploy

**Frontend (Vercel)**
1. Add New Project → select this repo → Root Directory → `client`
2. Framework preset auto-detects as Vite
3. Environment Variables → `VITE_API_URL` → your Railway URL + `/api`
4. Deploy
5. Go back to Railway and update `CLIENT_ORIGIN` to the real Vercel URL, then redeploy the
   backend so CORS allows the live frontend

## Known Limitation
SQLite is file-based; Railway's filesystem is ephemeral across redeploys. `seedIfEmpty()`
handles this automatically by re-seeding on boot if the database comes back empty — documented
as an accepted tradeoff for this MVP rather than a defect (see `docs/Phase3_Architecture.md`
Section 6).

## Security
See `docs/Phase7_Security_Audit.md` for the full pre-deployment checklist. No critical or high
findings; no auth in MVP is a documented scope decision, not an oversight.

## Design Notes
The visual direction is a "ledger" aesthetic — clean panels, a serif display face (Fraunces)
for headings, tabular monospace numerals for financial figures, and a single confident green
accent for "on pace" signals (red reserved for "behind pace" or errors). Chosen deliberately
for a finance-adjacent, non-technical audience.
