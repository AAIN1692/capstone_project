Base URL (production): `https://capstoneproject-production-826b.up.railway.app/api`

All endpoints are **read-only** and **unauthenticated** by design 
All error responses share the shape `{ "error": "<plain-language message>" }` and
never include stack traces or internal implementation detail.

## GET /health
Health check. No parameters.
**Response `200`**
```json
{ "status": "ok" }
```

## GET /filters/options
Returns all available reps, product categories, and regions, for populating filter dropdowns.
**Auth:** none · **Parameters:** none
**Response `200`**
```json
{
  "reps": [{ "id": 1, "name": "Alex Chen" }],
  "categories": [{ "id": 1, "name": "Hardware" }],
  "regions": [{ "id": 1, "name": "West" }]
}
```

## GET /summary
Returns aggregate KPIs (total revenue, deals closed, average deal size, quota attainment) for
the given filters.
**Auth:** none
**Query Parameters**
|--------------|---------------------|----------|--------------------------------------|
| Param        |Type                 | Required | Notes                                |
|--------------|---------------------|----------|--------------------------------------|
| `startDate`  | string (YYYY-MM-DD) | Yes      |                                      |
| `endDate`    | string (YYYY-MM-DD) | Yes      | Must be ≥ `startDate`                |
| `repId`      | number              | No       | Filters to a single rep              |
| `categoryId` | number              | No       | Filters to a single product category |
| `regionId`   | number              | No       | Filters to a single region           |
----------------------------------------------------------------------------------------
**Response `200`**
```json
{ "totalRevenue": 128400, "dealsClosed": 42, "avgDealSize": 3057.14, "quotaAttainmentPct": 87 }
```
**Response `400`** — missing/invalid dates, invalid date ordering, or a non-numeric filter ID
```json
{ "error": "startDate and endDate are required (format YYYY-MM-DD)." }
```

## GET /trend
Returns revenue over time at a chosen granularity.
**Auth:** none
**Query Parameters**
|-----------------------------------|----------------------------------|---------------------------|-------------------|
| Param                             | Type                             | Required                  | Notes             |
|-----------------------------------|----------------------------------|---------------------------|-------------------|
| `startDate`                       | string (YYYY-MM-DD)              | Yes                       |                   |
| `endDate`                         | string (YYYY-MM-DD)              | Yes                       |                   |
| `granularity`                     | `daily` \| `weekly` \| `monthly` | No (defaults to `weekly`) |                   |
| `repId`, `categoryId`, `regionId` | number                           | No                        |Same as `/summary` |
------------------------------------------------------------------------------------------------------------------------
**Response `200`**
```json
{ "granularity": "weekly", "points": [{ "period": "2026-W23", "revenue": 18200 }] }
```
**Response `400`** — invalid `granularity` value
```json
{ "error": "granularity must be one of: daily, weekly, monthly." }
```

## GET /breakdown/reps
Returns revenue and deal count grouped by sales rep, sorted descending by revenue.
**Auth:** none · **Query Parameters:** `startDate`, `endDate` (required), `categoryId`,
`regionId` (optional)
**Response `200`**
```json
{ "items": [{ "id": 1, "name": "Alex Chen", "revenue": 42100, "dealsClosed": 14 }] }
```

## GET /breakdown/categories
Same shape as `/breakdown/reps`, grouped by product category.
**Auth:** none · **Query Parameters:** `startDate`, `endDate` (required), `repId`, `regionId`
(optional)
**Response `200`**
```json
{ "items": [{ "id": 1, "name": "Hardware", "revenue": 31200, "dealsClosed": 9 }] }
```

## GET /breakdown/regions
Same shape as `/breakdown/reps`, grouped by region.
**Auth:** none · **Query Parameters:** `startDate`, `endDate` (required), `repId`,
`categoryId` (optional)
**Response `200`**
```json
{ "items": [{ "id": 1, "name": "West", "revenue": 55400, "dealsClosed": 17 }] }
```

## Error Reference
|--------|--------------------------|---------------------------------------------------|
| Status | Meaning                  | Example message                                   |
|--------|--------------------------|---------------------------------------------------|
| `400`  | Invalid or missing input | `"startDate must be before or equal to endDate."` |
| `500`  | Unexpected server error  | `"Something went wrong, please try again."`       |
-----------------------------------------------------------------------------------------
No endpoint ever returns a raw stack trace, database error, or internal file path — verified
by an explicit integration test (see `server/tests/salesRoutes.integration.test.ts`).


Security Audit — Sales Pulse:
Scope:
All auth and data-handling code was reviewed: server/routes/salesRoutes.ts,
server/middleware/validateQuery.ts, server/middleware/errorHandler.ts,
server/services/salesService.ts, server/app.ts, and the frontend's client/src/api/salesApi.ts.

Checklist Results:
SQL injection protection - ✅ Pass - All queries use better-sqlite3 prepared statements with ? placeholders (see salesService.ts). No string-concatenated SQL anywhere in the codebase.
Input validation on all endpoints - ✅ Pass - validateQuery.ts validates date format, date ordering, and numeric filter IDs before any query runs. /api/trend's granularity param is validated against an explicit allow-list.
Error messages leak no internal detail✅ PasserrorHandler.ts returns a fixed generic message ("Something went wrong, please try again.") for all unhandled errors; full detail is console.error'd server-side only, never sent to the client. Verified by an explicit integration test asserting the response body does not contain stack-trace patterns (at Object, node_modules, Error:).
CORS configured, not wide open - ✅ Pass - cors({ origin: CLIENT_ORIGIN }) restricts allowed origins to a single configured value (the deployed frontend URL) rather than *.
Secrets not committed to the repo - ✅ Pass - .gitignore excludes .env and *.db* files at the repo root. Only .env.example (no real secrets — there are none required for this app) is committed.
Authentication / authorization - ⚠️ Accepted risk, documented - No auth in MVP — this was an explicit, documented decision in PRD Section 6 (Out of Scope #5) and Section 8 (Open Questions), not an oversight. All endpoints are read-only; there is no write/mutate surface for an unauthenticated user to abuse. Flagged here for the record, not treated as a finding requiring a fix.
Rate limiting - ⚠️ Not implemented - No rate limiting on the API. Acceptable for a capstone MVP with no auth-bypass or cost-abuse surface (all endpoints are cheap, read-only aggregation queries against a small seeded dataset), but would be a first addition before any real production use with real traffic.
Dependency vulnerabilities (npm audit) - ⬜ To be run locally - Requires network access this environment doesn't have. Action for you: run npm audit in both /server and /client after npm install, and fix any high or critical findings before final submission (see checklist item below).HTTPS enforced✅ Pass (via hosting)Both Railway and Vercel serve over HTTPS by default; no HTTP-only endpoints are exposed.Sensitive data in logs✅ PasserrorHandler.ts logs errors server-side for debugging, but no request bodies, tokens, or PII are logged anywhere (there is no PII in this app's data model).

Claude Security Review — Findings Detail:
No critical or high-severity issues found. The two items marked "Accepted risk" (no auth,
no rate limiting) are scope decisions documented in the PRD, not defects — they were assessed
and are appropriate for this capstone's MVP scope, not a gap that was missed.

One improvement made during this review: an integration test was added
(salesRoutes.integration.test.ts) that explicitly asserts error responses never contain
stack-trace-shaped text, turning "no jargon visible to users" from a design intention into a
tested, enforced contract.
