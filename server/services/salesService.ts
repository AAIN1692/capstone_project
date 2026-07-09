import db from "../db/connection";
import {
  SalesFilters,
  SummaryResult,
  TrendResult,
  Granularity,
  BreakdownResult,
  FilterOptions,
} from "../types";

/** Builds the shared WHERE clause + params for a filter set. */
function buildWhere(filters: SalesFilters): { clause: string; params: any[] } {
  const clauses = ["d.closed_date >= ?", "d.closed_date <= ?"];
  const params: any[] = [filters.startDate, filters.endDate];

  if (filters.repId) {
    clauses.push("d.rep_id = ?");
    params.push(filters.repId);
  }
  if (filters.categoryId) {
    clauses.push("d.category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters.regionId) {
    clauses.push("r.region_id = ?");
    params.push(filters.regionId);
  }

  return { clause: clauses.join(" AND "), params };
}

export function getFilterOptions(): FilterOptions {
  const reps = db.prepare("SELECT id, name FROM reps ORDER BY name").all() as FilterOptions["reps"];
  const categories = db
    .prepare("SELECT id, name FROM product_categories ORDER BY name")
    .all() as FilterOptions["categories"];
  const regions = db.prepare("SELECT id, name FROM regions ORDER BY name").all() as FilterOptions["regions"];
  return { reps, categories, regions };
}

export function getSummary(filters: SalesFilters): SummaryResult {
  const { clause, params } = buildWhere(filters);

  const revenueRow = db
    .prepare(
      `SELECT COALESCE(SUM(d.amount), 0) AS totalRevenue, COUNT(*) AS dealsClosed
       FROM deals d JOIN reps r ON d.rep_id = r.id
       WHERE ${clause}`
    )
    .get(...params) as { totalRevenue: number; dealsClosed: number };

  const avgDealSize = revenueRow.dealsClosed > 0 ? revenueRow.totalRevenue / revenueRow.dealsClosed : 0;

  // Quota attainment: sum of target_amount for quota periods overlapping the range,
  // scoped to the same rep/region filters if present.
  const quotaClauses = ["q.period IN (SELECT DISTINCT quota_period FROM deals WHERE closed_date >= ? AND closed_date <= ?)"];
  const quotaParams: any[] = [filters.startDate, filters.endDate];
  if (filters.repId) {
    quotaClauses.push("q.rep_id = ?");
    quotaParams.push(filters.repId);
  }
  if (filters.regionId) {
    quotaClauses.push("q.rep_id IN (SELECT id FROM reps WHERE region_id = ?)");
    quotaParams.push(filters.regionId);
  }

  const quotaRow = db
    .prepare(`SELECT COALESCE(SUM(q.target_amount), 0) AS totalTarget FROM quota_targets q WHERE ${quotaClauses.join(" AND ")}`)
    .get(...quotaParams) as { totalTarget: number };

  const quotaAttainmentPct = quotaRow.totalTarget > 0 ? Math.round((revenueRow.totalRevenue / quotaRow.totalTarget) * 100) : 0;

  return {
    totalRevenue: Math.round(revenueRow.totalRevenue * 100) / 100,
    dealsClosed: revenueRow.dealsClosed,
    avgDealSize: Math.round(avgDealSize * 100) / 100,
    quotaAttainmentPct,
  };
}

function periodExpr(granularity: Granularity): string {
  if (granularity === "daily") return "d.closed_date";
  if (granularity === "weekly") return "strftime('%Y-W%W', d.closed_date)";
  return "strftime('%Y-%m', d.closed_date)";
}

export function getTrend(filters: SalesFilters, granularity: Granularity): TrendResult {
  const { clause, params } = buildWhere(filters);
  const expr = periodExpr(granularity);

  const rows = db
    .prepare(
      `SELECT ${expr} AS period, COALESCE(SUM(d.amount), 0) AS revenue
       FROM deals d JOIN reps r ON d.rep_id = r.id
       WHERE ${clause}
       GROUP BY period
       ORDER BY period ASC`
    )
    .all(...params) as { period: string; revenue: number }[];

  return {
    granularity,
    points: rows.map((r) => ({ period: r.period, revenue: Math.round(r.revenue * 100) / 100 })),
  };
}

function breakdownBy(
  groupTable: "reps" | "product_categories" | "regions",
  groupJoin: string,
  groupIdCol: string,
  groupNameCol: string,
  filters: SalesFilters
): BreakdownResult {
  const { clause, params } = buildWhere(filters);

  const rows = db
    .prepare(
      `SELECT ${groupIdCol} AS id, ${groupNameCol} AS name,
              COALESCE(SUM(d.amount), 0) AS revenue, COUNT(*) AS dealsClosed
       FROM deals d
       JOIN reps r ON d.rep_id = r.id
       ${groupJoin}
       WHERE ${clause}
       GROUP BY ${groupIdCol}, ${groupNameCol}
       ORDER BY revenue DESC`
    )
    .all(...params) as { id: number; name: string; revenue: number; dealsClosed: number }[];

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      revenue: Math.round(row.revenue * 100) / 100,
      dealsClosed: row.dealsClosed,
    })),
  };
}

export function getRepBreakdown(filters: SalesFilters): BreakdownResult {
  return breakdownBy("reps", "", "r.id", "r.name", filters);
}

export function getCategoryBreakdown(filters: SalesFilters): BreakdownResult {
  return breakdownBy(
    "product_categories",
    "JOIN product_categories pc ON d.category_id = pc.id",
    "pc.id",
    "pc.name",
    filters
  );
}

export function getRegionBreakdown(filters: SalesFilters): BreakdownResult {
  return breakdownBy(
    "regions",
    "JOIN regions rg ON r.region_id = rg.id",
    "rg.id",
    "rg.name",
    filters
  );
}
