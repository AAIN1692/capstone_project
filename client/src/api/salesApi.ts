import {
  FilterOptions,
  SalesFilters,
  SummaryResult,
  TrendResult,
  Granularity,
  BreakdownResult,
  BreakdownDimension,
} from "../types/sales";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class ApiError extends Error {}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Something went wrong, please try again." }));
    throw new ApiError(body.error || "Something went wrong, please try again.");
  }
  return res.json();
}

function filterQuery(filters: SalesFilters): string {
  const params = new URLSearchParams();
  params.set("startDate", filters.startDate);
  params.set("endDate", filters.endDate);
  if (filters.repId) params.set("repId", String(filters.repId));
  if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
  if (filters.regionId) params.set("regionId", String(filters.regionId));
  return params.toString();
}

export function fetchFilterOptions(): Promise<FilterOptions> {
  return get<FilterOptions>("/filters/options");
}

export function fetchSummary(filters: SalesFilters): Promise<SummaryResult> {
  return get<SummaryResult>(`/summary?${filterQuery(filters)}`);
}

export function fetchTrend(filters: SalesFilters, granularity: Granularity): Promise<TrendResult> {
  return get<TrendResult>(`/trend?${filterQuery(filters)}&granularity=${granularity}`);
}

export function fetchBreakdown(dimension: BreakdownDimension, filters: SalesFilters): Promise<BreakdownResult> {
  return get<BreakdownResult>(`/breakdown/${dimension}?${filterQuery(filters)}`);
}

export { ApiError };
