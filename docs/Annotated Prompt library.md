# PART B — ANNOTATED PROMPT LIBRARY

Each entry: **what it does** / **component targeted** / the actual Cursor Composer prompt.

### 1. Schema Generation
*Generates the initial SQLite schema matching the data model.*
**Targets:** `server/db/schema.ts`
```
Create server/db/schema.ts using better-sqlite3. Define tables for Rep, Region,
ProductCategory, Deal, and QuotaTarget exactly as specified in Phase3_Architecture.md
Section 3 (Data Model), including foreign keys. Export a function `initSchema(db)` that
creates all tables if they don't exist. Do not add any columns not listed in the spec.
```

### 2. Seed Script with Deliberate Patterns
*Generates realistic, pattern-seeded transaction data.*
**Targets:** `server/db/seed.ts`
```
Create server/db/seed.ts. Generate 6 months of Deal records across 8 reps, 4 regions,
5 product categories. Deliberately encode these patterns: one rep ("star performer") at
~180% of average, one region trending down over the last 6 weeks, and a seasonal dip in
one month. Also seed QuotaTarget rows per rep per month. Use realistic dollar amounts
($500-$15,000 per deal). Log a summary of total rows inserted when done.
```

### 3. Service Layer — Aggregation Logic
*Builds the core aggregation queries, isolated from routing.*
**Targets:** `server/services/salesService.ts`
```
Create server/services/salesService.ts implementing getSummary, getTrend, getRepBreakdown,
getCategoryBreakdown, and getRegionBreakdown, matching the request/response shapes in
Phase3_Architecture.md Section 4 exactly. Each function takes typed filter params
(startDate, endDate, repId?, categoryId?, regionId?) and returns typed results. No HTTP
concerns in this file — pure data functions only.
```

### 4. Routes + Validation Middleware
*Wires HTTP layer to the service layer with input validation.*
**Targets:** `server/routes/salesRoutes.ts`, `server/middleware/validateQuery.ts`
```
Create server/routes/salesRoutes.ts exposing the 6 endpoints from
Phase3_Architecture.md Section 4, calling the corresponding salesService functions.
Create server/middleware/validateQuery.ts that validates startDate/endDate are present
and startDate <= endDate, returning a 400 with a plain-language error message
(not a stack trace) on failure.
```

### 5. Frontend Types + API Client
*Generates matching TypeScript types and a typed fetch layer.*
**Targets:** `client/src/types/sales.ts`, `client/src/api/salesApi.ts`
```
Create client/src/types/sales.ts with TypeScript interfaces matching the 6 API response
shapes in Phase3_Architecture.md Section 4 exactly. Then create client/src/api/salesApi.ts
with a typed fetch function per endpoint, using these interfaces as return types. Base URL
should come from an environment variable VITE_API_URL.
```

### 6. KPI Bar Component
*Builds the top-of-page summary metrics display.*
**Targets:** `client/src/components/composite/KpiBar.tsx`, `atomic/KpiCard.tsx`
```
Create client/src/components/atomic/KpiCard.tsx: a card showing a label, a value, and an
optional trend indicator (up/down/flat). Then create composite/KpiBar.tsx that fetches
from getSummary and renders 4 KpiCards: Total Revenue, Deals Closed, Avg Deal Size,
Quota Attainment %. Use plain business language labels only. Style with Tailwind,
clean and readable at a glance.
```

### 7. Trend + Breakdown Charts
*Builds the two core Recharts-based visualizations.*
**Targets:** `client/src/components/composite/TrendChart.tsx`, `BreakdownChart.tsx`
```
Create client/src/components/composite/TrendChart.tsx using Recharts, showing revenue over
time from getTrend, with a toggle for daily/weekly/monthly granularity. Then create
BreakdownChart.tsx as a reusable bar chart component that accepts a title and a list of
{label, value} items, used for rep/category/region breakdowns. Show a clear "no data for
this selection" state if the items list is empty.
```

### 8. Filter Bar + Dashboard Page Wiring
*Composes all filters and wires state through the whole dashboard.*
**Targets:** `client/src/components/composite/FilterBar.tsx`, `pages/DashboardPage.tsx`
```
Create client/src/components/composite/FilterBar.tsx with a date range picker, rep select,
and category select, all backed by /api/filters/options. Then create
pages/DashboardPage.tsx that owns the combined filter state, passes it down to KpiBar,
TrendChart, and BreakdownChart (rendered for reps/categories/regions via tabs), and
re-fetches on filter change.
```

### 9. Security & Error-Handling Review
*Runs a targeted review pass before Sprint 1 sign-off.*
**Targets:** all backend route/middleware files
```
Review server/routes/salesRoutes.ts, server/middleware/validateQuery.ts, and
server/middleware/errorHandler.ts for: unvalidated input reaching the DB layer, any
error responses that leak stack traces or internal details to the client, and missing
CORS configuration. List issues found, then fix them.
```

### 10. Deployment Smoke-Test Prompt
*Generates a quick manual test checklist after deploy.*
**Targets:** N/A (process prompt, not code)
```
Given the 6 endpoints in Phase3_Architecture.md Section 4, generate a curl-based smoke
test checklist I can run against the deployed Railway URL: one request per endpoint,
including at least one request with an invalid date range to confirm the 400 error
path works correctly.
```