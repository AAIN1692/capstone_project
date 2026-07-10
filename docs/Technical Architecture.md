Phase 3 — Technical Architecture:
----------------------------------
## 1. Tech Stack
|--------------|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Layer        | Choice 									| Why 																													   |
|--------------|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Frontend     | React + TypeScript + Vite 				    | Recommended stack for Option B; Vite for fast dev/build 																   |
| Charts       | Recharts 								    | Recommended stack; good enough default chart set (line, bar) for MVP needs 											   |
| Styling 	   | Tailwind CSS 								| Fast to build clean, non-technical-friendly UI without custom CSS overhead 											   |
| Backend 	   | Node.js + Express 							| Lightweight REST API, matches team's JS/TS skillset, easy to deploy on free tiers 									   |
| Database     | SQLite (via `better-sqlite3`) 				| Zero-config, file-based, sufficient for a seeded ~6-month dataset; simplest thing that satisfies "API or DB" requirement |
| Data seeding | Node seed script 							| Generates realistic transactions with deliberately designed patterns (star rep, slumping region, seasonal dip)           |
| Hosting      | Vercel (frontend) + Railway (backend + DB) | Both free-tier eligible per capstone tooling requirement 																   |
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 2. Components:

**Backend**
|-------------------------------|---------------------------------------------------------------------------------------------------------|
| Component                     | Responsibility                                                                                          |
|-------------------------------|---------------------------------------------------------------------------------------------------------|
| `db/schema.ts` 				| Defines the SQLite table schema for reps, categories, regions, and deals 								  |
| `db/seed.ts` 					| Generates and inserts ~6 months of realistic, pattern-seeded transaction data							  |
| `services/salesService.ts` 	| Contains all query/aggregation logic (summary, trend, breakdowns) — the only layer that talks to the DB |
| `routes/salesRoutes.ts` 		| Maps HTTP requests to `salesService` calls; validates query params 									  |
| `middleware/validateQuery.ts` | Validates and normalizes date range / filter query params before they reach services 					  |
| `middleware/errorHandler.ts`  | Catches errors and returns consistent, user-safe JSON error responses 								  |
| `server.ts` 					| Express app entrypoint; wires routes, middleware, CORS 												  |
-------------------------------------------------------------------------------------------------------------------------------------------
**Frontend**
|-------------------------------------------|--------------------------------------------------------------------------------|
| Component                                 | Responsibility                                                                 |
|-------------------------------------------|--------------------------------------------------------------------------------|
| `types/sales.ts`                          | Shared TypeScript types for API responses (Summary, TrendPoint, BreakdownItem) |
| `api/salesApi.ts`                         | Typed fetch functions for each backend endpoint 								 |
| `components/atomic/KpiCard.tsx`           | Displays a single KPI value with label and trend indicator 					 |
| `components/atomic/FilterControl.tsx`     | A single filter input (date range, rep select, or category select) 			 |
| `components/composite/KpiBar.tsx`         | Composes multiple `KpiCard`s into the summary row 						     |
| `components/composite/TrendChart.tsx`     | Wraps Recharts line/bar chart with granularity toggle 						 |
| `components/composite/BreakdownChart.tsx` | Wraps Recharts bar chart for rep/category/region breakdowns 					 |
| `components/composite/FilterBar.tsx`      | Composes all `FilterControl`s and manages combined filter state 				 |
| `pages/DashboardPage.tsx`                 | Top-level page; owns filter state, fetches data, lays out KpiBar + charts 	 |
------------------------------------------------------------------------------------------------------------------------------
## 3. Data Model

Rep
- id (PK)
- name
- region_id (FK -> Region.id)

Region
- id (PK)
- name

ProductCategory
- id (PK)
- name

Deal
- id (PK)
- rep_id (FK -> Rep.id)
- category_id (FK -> ProductCategory.id)
- amount (decimal)
- closed_date (date)
- quota_period (string, e.g. "2026-Q2") -- used for quota attainment calc

QuotaTarget
- id (PK)
- rep_id (FK -> Rep.id)
- period (string, matches quota_period)
- target_amount (decimal)

**Relationships:** A `Rep` belongs to one `Region`. A `Deal` belongs to one `Rep` and one
`ProductCategory`. `QuotaTarget` gives each rep a target per period, enabling the quota
attainment % KPI (F1) without hardcoding a single global quota.

## 4. API Design
All endpoints are read-only, unauthenticated (per PRD Section 6 — no auth in MVP), and share
a common query-parameter shape: `startDate`, `endDate` (required), `repId`, `categoryId`,
`regionId` (all optional filters).

**GET /api/filters/options**
- Auth: none
- Request: none
- Response `200`:
```json
{ "reps": [{"id":1,"name":"Alex Chen"}], "categories": [{"id":1,"name":"Hardware"}], "regions": [{"id":1,"name":"West"}] }
```

**GET /api/summary**
- Auth: none
- Request (query): `startDate`, `endDate` (required), `repId?`, `categoryId?`, `regionId?`
- Response `200`:
```json
{ "totalRevenue": 128400, "dealsClosed": 42, "avgDealSize": 3057, "quotaAttainmentPct": 87 }
```
- Response `400` (invalid/missing date range):
```json
{ "error": "startDate and endDate are required and startDate must be before endDate" }
```

**GET /api/trend**
- Auth: none
- Request (query): `startDate`, `endDate`, `granularity` (`daily`|`weekly`|`monthly`, required), plus optional filters
- Response `200`:
```json
{ "granularity": "weekly", "points": [{"period":"2026-W23","revenue":18200}] }
```

**GET /api/breakdown/reps**
- Auth: none
- Request (query): `startDate`, `endDate`, optional `categoryId`, `regionId`
- Response `200`:
```json
{ "items": [{"repId":1,"repName":"Alex Chen","revenue":42100,"dealsClosed":14}] }
```
(sorted descending by revenue by server, per PRD F3 AC)

**GET /api/breakdown/categories**
- Same shape as `/api/breakdown/reps`, grouped by `categoryId`/`categoryName` instead of rep

**GET /api/breakdown/regions**
- Same shape, grouped by `regionId`/`regionName`

**Error handling (all endpoints):** invalid query params return `400` with a plain-language
`error` message (never a raw stack trace); unexpected server errors return `500` with a
generic `"Something went wrong, please try again"` message — full detail logged server-side
only, satisfying the Sprint 2 change request's "no technical jargon visible to users"
requirement ahead of time.

## 5. Implementation Sequence:
**Backend (Sprint 1):**
1. `db/schema.ts` — define tables
2. `db/seed.ts` — write and run seed script, verify data manually (spot-check totals)
3. `services/salesService.ts` — aggregation queries, one function per endpoint
4. `routes/salesRoutes.ts` — wire routes to services
5. `middleware/validateQuery.ts` and `errorHandler.ts`
6. Deploy backend + DB to Railway; smoke-test each endpoint with curl/Postman

**Frontend (Sprint 1, after backend is deployed):**
7. `types/sales.ts` — types matching the now-live API responses
8. `api/salesApi.ts` — typed fetch layer
9. Atomic components: `KpiCard`, `FilterControl`
10. Composite components: `KpiBar`, `TrendChart`, `BreakdownChart`, `FilterBar`
11. `DashboardPage.tsx` — wire filter state to all fetches and components
12. Deploy frontend to Vercel, point at deployed backend URL

**Sprint 2:** loading states, error messages, mobile responsiveness (KpiBar + TrendChart
first, per NFR), remaining polish/bugs.

## 6. Risks
|----------------------------------------------------------------------|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Risk 													               | Impact                                                  | Mitigation																																	   |
|----------------------------------------------------------------------|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| SQLite file resets on Railway redeploy                               | Data could reset unexpectedly between sessions          | Re-run seed script on container start so app is always in a consistent, demo-ready state                                                        |
| Seeded data reads as flat/unconvincing                               | Charts look boring, undermines "Product Thinking" score | Deliberately script 2-3 patterns into the seed data (a star rep, a slumping region, a seasonal dip) rather than pure random generation          |
| Aggregation queries get slow/complex as filters combine              | Risk to NFR performance target (<3s load)               | Keep dataset small (~2-5k rows) for MVP; add indexes on `closed_date`, `rep_id`, `category_id` if needed                                        |
| CORS/deployment mismatch between Vercel frontend and Railway backend | Frontend fails silently or shows CORS errors in console | Configure CORS explicitly in `server.ts`; test the deployed (not just local) frontend against the deployed backend before calling Sprint 1 done |
| Recharts learning curve mid-sprint                                   | Time pressure risk to Sprint 1 timeline                 | Keep to 2 chart types only (line + bar) for MVP; no custom chart types                                                                          |
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
