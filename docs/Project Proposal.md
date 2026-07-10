Phase 1: Project Brief and Requirements Clarification:
------------------------------------------------------
## Problem Statement:
Regional and department sales managers at small-to-mid-size B2B companies currently track
performance by manually pulling numbers into spreadsheets or waiting on a weekly report from
an analyst. By the time they see the data, it's stale — often 3-7 days old — and it's rarely
broken down the way *they* need it (by rep, by product line, by region, by time period).
This delay means managers react to problems (missed quota, a slumping product line) a week
after they started, instead of catching them early.

**Who has this problem:** Sales managers and regional/department heads who are accountable
for revenue numbers but don't have direct access to a live, filterable view of their own data.

**Why it matters:** Slow visibility into sales performance means slower course-correction —
underperforming reps, regions, or products go unaddressed longer, and forecasting to leadership
becomes guesswork instead of grounded in current numbers.

## Target User:
**Primary persona: Siva, Regional Sales Manager**
- Manages a team of 6-10 sales reps across one region
- Not technical — comfortable with spreadsheets, not with SQL or BI tools like Looker/Tableau
- Currently gets a weekly PDF/email report from an ops analyst
- Needs to answer, in under a minute: "How are we doing this month vs. last month? Which
  reps/products are driving or dragging performance? Are we on pace for quota?"
- Checks this most often on a laptop, occasionally on mobile during travel or check-ins

## Value Proposition:
Sales Pulse gives non-technical sales managers a live, filterable view of their team's revenue
performance — replacing a stale weekly report with an always-current dashboard they can filter
and drill into themselves, in plain business language, with zero training required.

## MVP Scope:
**In scope:**
- Summary view: total revenue, deals closed, average deal size, quota attainment % (current period)
- Trend chart: revenue over time (daily/weekly/monthly toggle)
- Breakdown charts: revenue by sales rep, revenue by product/category, revenue by region
- Filtering: date range picker, filter by rep and by product category
- Clean, non-technical presentation suitable for a screenshot-into-Slack use case
- Mock but realistic dataset (seeded, representing ~6 months of transactions for a mid-size
  B2B sales org) — generated/seeded rather than pulled from a live third-party API

**Out of scope:
1. Multi-tenant support / multiple companies or organizations
2. Real integration with a live CRM (Salesforce, HubSpot, etc.) — mock data only
3. User-configurable custom dashboards or saved views
4. Forecasting / predictive analytics
5. Role-based permissions beyond a single manager view
6. Data export (CSV/PDF export of charts)
7. Notifications or alerting (e.g. "quota at risk" emails)

## Top 3 Risks:
1. **Data realism risk** — a mock dataset that's too clean or too random won't produce
   interesting patterns (trends, underperformers, seasonality), making the dashboard look
   flat and the insights unconvincing. *Mitigation:* deliberately seed patterns — a slumping
   region, a star rep, a seasonal dip — when generating the dataset.
2. **Scope creep risk** — "analytics dashboard" invites endless chart types. Without a hard
   MVP boundary, Sprint 1 could balloon. *Mitigation:* the Out of Scope list above is locked
   before Phase 4; new chart ideas go on a backlog, not into Sprint 1.
3. **Non-technical UX risk** — it's easy to build a dashboard that's technically correct but
   reads like an engineering tool (raw tables, unclear labels, dense charts). *Mitigation:*
   every screen gets checked against "would Siva understand this in 10 seconds without
   explanation?"

## Biggest Assumption:
That a well-designed **mock but realistic** dataset is an acceptable and sufficient stand-in
for "live data" for this capstone — i.e., the evaluation cares about the dashboard correctly
visualizing, filtering, and summarizing time-series business data, not about the specific
data source being a real third-party API. This will be stated explicitly and justified in the
PRD's constraints section.
