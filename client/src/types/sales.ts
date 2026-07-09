export interface FilterOptions {
  reps: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  regions: { id: number; name: string }[];
}

export interface SalesFilters {
  startDate: string;
  endDate: string;
  repId?: number;
  categoryId?: number;
  regionId?: number;
}

export interface SummaryResult {
  totalRevenue: number;
  dealsClosed: number;
  avgDealSize: number;
  quotaAttainmentPct: number;
}

export type Granularity = "daily" | "weekly" | "monthly";

export interface TrendPoint {
  period: string;
  revenue: number;
}

export interface TrendResult {
  granularity: Granularity;
  points: TrendPoint[];
}

export interface BreakdownItem {
  id: number;
  name: string;
  revenue: number;
  dealsClosed: number;
}

export interface BreakdownResult {
  items: BreakdownItem[];
}

export type BreakdownDimension = "reps" | "categories" | "regions";
