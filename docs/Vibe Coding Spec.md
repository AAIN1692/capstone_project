Phase 4 — Vibe Coding Spec and Prompt Library:
-----------------------------------------------
# PART A — VIBE CODING SPEC (8 Sections)

## 1. Project Overview
Sales Pulse is a two-part app: an Express + SQLite backend serving aggregated sales metrics
from a seeded dataset, and a React + TypeScript frontend rendering that data as a filterable
dashboard for a non-technical sales manager. Built and reviewed incrementally — every diff
read before acceptance, committed after each completed task.

## 2. Tech Stack & Conventions
- Backend: Node.js, Express, TypeScript, `better-sqlite3`
- Frontend: React, TypeScript, Vite, Recharts, Tailwind CSS
- Naming: camelCase for functions/variables, PascalCase for components, kebab-case for files
  except components (`KpiCard.tsx`)
- No `any` types — all API responses and props strictly typed via `types/sales.ts`
- All service functions are pure with respect to the DB connection (take params, return data,
  no side effects beyond the query)
- Commits: one commit per completed task in the sequence below, message format
  `[phase] short description` (e.g. `[backend] add salesService summary aggregation`)

## 3. File Structure
```
/server
  /db        -> schema.ts, seed.ts, connection.ts
  /services  -> salesService.ts
  /routes    -> salesRoutes.ts
  /middleware-> validateQuery.ts, errorHandler.ts
  server.ts
/client
  /src
    /types       -> sales.ts
    /api         -> salesApi.ts
    /components
      /atomic    -> KpiCard.tsx, FilterControl.tsx
      /composite -> KpiBar.tsx, TrendChart.tsx, BreakdownChart.tsx, FilterBar.tsx
    /pages       -> DashboardPage.tsx
    App.tsx
```

## 4. Data Models
(As specified in Architecture Section 3 — `Rep`, `Region`, `ProductCategory`, `Deal`,
`QuotaTarget`.) TypeScript interfaces in `types/sales.ts` must mirror the API response shapes
exactly as documented in Architecture Section 4, not the raw DB row shapes.

## 5. API Contracts
Reference: Architecture Section 4 (Phase3_Architecture.md) — the 6 endpoints
(`/api/filters/options`, `/api/summary`, `/api/trend`, `/api/breakdown/reps`,
`/api/breakdown/categories`, `/api/breakdown/regions`) are the binding contract. No endpoint
changes without updating that document first.

## 6. Task Breakdown (Implementation Order)
Matches Architecture Section 5, formatted here as discrete, reviewable units:

**Backend**
1. Schema + connection setup
2. Seed script (with deliberate patterns)
3. `salesService` — summary aggregation
4. `salesService` — trend aggregation
5. `salesService` — breakdown aggregations (reps/categories/regions)
6. Routes wiring all 6 endpoints
7. Validation + error-handling middleware
8. Deploy backend, smoke-test all endpoints

**Frontend**
9. Types + typed API client
10. `KpiCard`, `FilterControl` (atomic)
11. `KpiBar` (composite)
12. `TrendChart` with granularity toggle
13. `BreakdownChart` (reused for reps/categories/regions)
14. `FilterBar` with combined filter state
15. `DashboardPage` wiring everything together
16. Deploy frontend, verify against live backend URL

## 7. UI/UX Requirements
- Plain-language labels only — no raw field names (`rep_id`, `category_id`) ever shown
- KPI bar is the first thing visible on load, above the fold
- Charts use a consistent color per rep/category/region across all views
- Empty/no-data states show a clear message, not a blank chart
- (Sprint 2 target, designed for now) mobile-responsive KpiBar and TrendChart

## 8. Definition of Done
A task is done when: the diff has been read and understood (not just accepted blind), it
matches its Architecture/PRD contract, it's committed with a descriptive message, and — for
backend tasks — it's been manually smoke-tested against a real request before moving to the
next task.
