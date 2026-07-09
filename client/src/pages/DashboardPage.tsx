import { useEffect, useState, useCallback } from "react";
import KpiBar from "../components/composite/KpiBar";
import TrendChart from "../components/composite/TrendChart";
import BreakdownChart from "../components/composite/BreakdownChart";
import FilterBar from "../components/composite/FilterBar";
import { fetchFilterOptions, fetchSummary, fetchTrend, fetchBreakdown, ApiError } from "../api/salesApi";
import {
  FilterOptions,
  SalesFilters,
  SummaryResult,
  TrendResult,
  BreakdownResult,
  Granularity,
  BreakdownDimension,
} from "../types/sales";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultFilters(): SalesFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

const BREAKDOWN_TABS: { key: BreakdownDimension; label: string }[] = [
  { key: "reps", label: "By Rep" },
  { key: "categories", label: "By Category" },
  { key: "regions", label: "By Region" },
];

export default function DashboardPage() {
  const [filters, setFilters] = useState<SalesFilters>(defaultFilters());
  const [dateError, setDateError] = useState<string | null>(null);

  const [options, setOptions] = useState<FilterOptions | null>(null);

  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const [trend, setTrend] = useState<TrendResult | null>(null);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);

  const [breakdownTab, setBreakdownTab] = useState<BreakdownDimension>("reps");
  const [breakdown, setBreakdown] = useState<BreakdownResult | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(true);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilterOptions()
      .then(setOptions)
      .catch(() => setOptions({ reps: [], categories: [], regions: [] }));
  }, []);

  const handleFilterChange = useCallback((next: SalesFilters) => {
    if (next.startDate > next.endDate) {
      setDateError("Start date must be before end date.");
      return;
    }
    setDateError(null);
    setFilters(next);
  }, []);

  const handlePreset = useCallback((preset: "7d" | "30d" | "quarter") => {
    const end = new Date();
    const start = new Date();
    if (preset === "7d") start.setDate(start.getDate() - 7);
    if (preset === "30d") start.setDate(start.getDate() - 30);
    if (preset === "quarter") start.setMonth(start.getMonth() - 3);
    setDateError(null);
    setFilters((f) => ({ ...f, startDate: isoDate(start), endDate: isoDate(end) }));
  }, []);

  // Fetch summary whenever filters change
  useEffect(() => {
    if (dateError) return;
    setSummaryLoading(true);
    setSummaryError(null);
    fetchSummary(filters)
      .then(setSummary)
      .catch((e) => setSummaryError(e instanceof ApiError ? e.message : "Something went wrong, please try again."))
      .finally(() => setSummaryLoading(false));
  }, [filters, dateError]);

  // Fetch trend whenever filters or granularity change
  useEffect(() => {
    if (dateError) return;
    setTrendLoading(true);
    setTrendError(null);
    fetchTrend(filters, granularity)
      .then(setTrend)
      .catch((e) => setTrendError(e instanceof ApiError ? e.message : "Something went wrong, please try again."))
      .finally(() => setTrendLoading(false));
  }, [filters, granularity, dateError]);

  // Fetch breakdown whenever filters or active tab change
  useEffect(() => {
    if (dateError) return;
    setBreakdownLoading(true);
    setBreakdownError(null);
    fetchBreakdown(breakdownTab, filters)
      .then(setBreakdown)
      .catch((e) => setBreakdownError(e instanceof ApiError ? e.message : "Something went wrong, please try again."))
      .finally(() => setBreakdownLoading(false));
  }, [filters, breakdownTab, dateError]);

  const breakdownTitle = BREAKDOWN_TABS.find((t) => t.key === breakdownTab)?.label ?? "Breakdown";

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl md:text-3xl text-ledger-ink">Sales Pulse</h1>
        <p className="text-ledger-slate text-sm">A live read on your team's revenue performance.</p>
      </header>

      <FilterBar
        filters={filters}
        options={options}
        onChange={handleFilterChange}
        onPreset={handlePreset}
        dateError={dateError}
      />

      <KpiBar summary={summary} loading={summaryLoading} error={summaryError} />

      <TrendChart
        trend={trend}
        loading={trendLoading}
        error={trendError}
        granularity={granularity}
        onGranularityChange={setGranularity}
      />

      <div className="bg-ledger-panel border border-ledger-line rounded-lg p-1 flex gap-1 w-fit">
        {BREAKDOWN_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setBreakdownTab(t.key)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              breakdownTab === t.key ? "bg-pulse-accent text-white" : "text-ledger-slate hover:text-ledger-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <BreakdownChart title={breakdownTitle} data={breakdown} loading={breakdownLoading} error={breakdownError} />
    </div>
  );
}
