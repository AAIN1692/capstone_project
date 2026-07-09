# Product Requirements Document — Sales Pulse
**Analytics Dashboard with Live Data (Option B)**
Version 1.1 — iterated after gap-check pass (see Section 9)

---

## 1. Problem
Regional and department sales managers currently rely on manually-compiled spreadsheets or a
weekly analyst report to understand their team's revenue performance. This introduces a
3-7 day lag between when something happens (a slump, a strong week, a missed quota) and when
the manager sees it — delaying course-correction and making forecasting to leadership harder
than it needs to be. Sales Pulse replaces that lag with a live, self-service dashboard a
non-technical manager can filter and read in under a minute.

## 2. Users
**Primary: Priya, Regional Sales Manager**
- Manages 6-10 reps in one region; accountable for a quarterly revenue quota
- Not technical: comfortable in spreadsheets and Slack, not in SQL/BI tools
- Needs daily/weekly check-ins on performance, and a fast read before 1:1s with reps
- Access pattern: mostly desktop/laptop, occasional mobile check during travel

**Secondary: Sam, Sales Ops Analyst (light touch in MVP)**
- Currently the one manually building the weekly report Priya waits on
- Not a primary user of the UI in MVP, but is the implicit "data owner" — relevant to the
  data model even though no admin UI is built for them in MVP (see Out of Scope)

## 3. User Stories
| ID | Story | Priority |
|----|-------|----------|
| US-1 | As Priya, I want to see total revenue, deals closed, and quota attainment for the current period at a glance, so I know immediately if we're on pace. | Must-have |
| US-2 | As Priya, I want to see a revenue trend over time, so I can spot slumps or spikes. | Must-have |
| US-3 | As Priya, I want to filter by date range, so I can compare periods (e.g. this month vs last). | Must-have |
| US-4 | As Priya, I want to see revenue broken down by rep, so I know who's driving or dragging performance. | Must-have |
| US-5 | As Priya, I want to see revenue broken down by product category and region, so I can spot which lines/areas need attention. | Must-have |
| US-6 | As Priya, I want to filter the whole dashboard by rep or product category, so I can drill into one rep's or product's numbers specifically. | Should-have |
| US-7 | As Priya, I want the dashboard to load fast and clearly on a laptop, so I can check it in under a minute between meetings. | Must-have |
| US-8 | As Priya, I want charts and labels in plain business language (not raw field names), so I don't need training to read it. | Must-have |

## 4. Features (Must-Have with Acceptance Criteria)

**F1 — Summary KPI bar**
- Displays: total revenue, deals closed, average deal size, quota attainment % for the
  selected period
- AC: updates automatically when the date range filter changes; quota attainment shown as a
  percentage with a visual indicator (on-pace / behind / ahead)

**F2 — Revenue trend chart**
- Line/bar chart of revenue over time
- AC: user can toggle granularity between daily, weekly, and monthly views; chart re-renders
  correctly at each granularity without breaking on partial-period data

**F3 — Breakdown by rep**
- Bar chart or ranked list of revenue by sales rep for the selected period
- AC: sorted descending by revenue by default; each rep shows revenue and deal count

**F4 — Breakdown by product category and region**
- Two chart views: revenue by product category, revenue by region
- AC: both respect the active date-range filter; each is switchable via tabs or a toggle,
  not simultaneously cluttering one screen

**F5 — Date range filter**
- Global filter affecting all charts and the KPI bar
- AC: supports at minimum "last 7 days," "last 30 days," "this quarter," and a custom range
  picker; invalid ranges (start after end) are blocked with a clear message

**F6 — Rep / product category filter**
- Secondary filters that narrow all charts to a specific rep or product category
- AC: filters are combinable with the date range; a visible "clear filters" control exists

## 5. Non-Functional Requirements
- **Performance:** dashboard initial load under 3 seconds on a typical broadband connection
  with the seeded dataset (~6 months of transactions, target ~2,000-5,000 rows)
- **Usability:** every chart has a plain-language title and axis labels; no raw database
  field names exposed in the UI
- **Responsiveness:** the summary KPI view and revenue trend chart must be usable on a
  mobile viewport (this satisfies the Sprint 2 change request ahead of time as a target,
  not yet implemented in Sprint 1)
- **Reliability:** the dashboard must not crash or show a blank screen on an empty filter
  result — it should show a clear "no data for this selection" state
- **Data integrity:** the seeded dataset must be internally consistent (deal amounts sum
  correctly to displayed KPIs; no orphaned records)

## 6. Out of Scope (MVP)
1. Multi-tenant support / multiple companies or organizations
2. Real integration with a live CRM (Salesforce, HubSpot, etc.) — mock/seeded data only
3. User-configurable custom dashboards or saved views
4. Forecasting / predictive analytics
5. Role-based permissions or authentication beyond a single manager view
6. Data export (CSV/PDF export of charts)
7. Notifications or alerting (e.g., "quota at risk" emails)
8. Admin UI for Sam (the ops analyst) to edit/manage source data

## 7. Success Metrics
- **Task success:** a first-time non-technical user can answer "are we on pace this month?"
  within 10 seconds of loading the dashboard (usability proxy, self-tested)
- **Load performance:** initial load < 3s (measured, not just targeted)
- **Coverage:** all 6 must-have features (F1-F6) functional against the seeded dataset with
  zero console errors
- **Correctness:** KPI totals reconcile exactly with the underlying seeded transaction data
  (spot-checked against a manual sum)

## 8. Open Questions (Resolved with Rationale)
| Question | Decision | Rationale |
|----------|----------|-----------|
| Real API vs. mock data? | Mock/seeded dataset | Stated assumption in Idea Brief — evaluation is about correct visualization/filtering of time-series business data, not a specific live source. A seeded dataset lets patterns be intentionally designed (see Risk 1 in Idea Brief). |
| Single dashboard or per-rep drill-down pages? | Single dashboard with filters, no separate drill-down pages | Keeps MVP scope tight; filtering achieves the same outcome (US-6) without extra routing/pages. |
| Auth required? | No auth in MVP | Single-user assumption for MVP; explicitly out of scope (#5). Flagged as a known simplification, not an oversight. |
| Mobile responsiveness now or later? | Targeted as NFR now, implemented in Sprint 2 | Matches the capstone's known Sprint 2 change request (mobile responsive layout on 2 key screens), so the architecture is designed not to fight it later. |

## 9. Constraints & Iteration Notes
- **Tech constraint:** must use React + TypeScript + Recharts per the recommended stack for
  Option B; data layer can be a lightweight local API (e.g. Express serving the seeded
  dataset) or a static JSON/DB read — decided in Phase 3 (Architecture).
- **Time constraint:** built within an 8-12 hour capstone sprint — MVP scope (Section 6) is
  deliberately narrow to fit Phase 5-6 time budgets.
- **Gap check (pass 1 → pass 2):** first draft had no explicit empty-state or invalid-filter
  handling — added NFR "Reliability" and AC on F5 to close this gap.
- **Conflict check:** F4 (category *and* region breakdown) initially implied two charts shown
  simultaneously, which conflicted with the "under 10 seconds to read" success metric —
  resolved by making them a toggle/tab instead of a permanently split view.
- **MVP focus check:** US-6 (drill-down filtering) was initially drafted as "Must-have" but
  demoted to "Should-have" in the user story table to protect Sprint 1 timeline; F5/F6 still
  ship in MVP because they're low-effort given the filter architecture is shared, but if time
  runs short, US-6's *combinability* (filters stacking) is the first thing to cut per the
  Time Pressure guidance (cut from Should-have, not from tests/docs).

---
*Next: Phase 3 — Technical Architecture Document (all 6 sections), built from this PRD.*
