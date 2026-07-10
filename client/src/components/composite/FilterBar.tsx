import FilterControl from "../atomic/FilterControl";
import { FilterOptions, SalesFilters } from "../../types/sales";

interface FilterBarProps {
  filters: SalesFilters;
  options: FilterOptions | null;
  optionsLoading: boolean;
  onChange: (filters: SalesFilters) => void;
  onPreset: (preset: "7d" | "30d" | "quarter") => void;
  dateError: string | null;
}

const PRESETS: { key: "7d" | "30d" | "quarter"; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "quarter", label: "This quarter" },
];

/**
 * Global filter row: date range presets/custom range, rep, category, and region.
 * Layout: horizontal on md+ screens; stacked vertically on mobile, with the date
 * presets in a horizontally scrollable row so they don't wrap awkwardly.
 */
export default function FilterBar({ filters, options, optionsLoading, onChange, onPreset, dateError }: FilterBarProps) {
  const hasActiveFilters = Boolean(filters.repId || filters.categoryId || filters.regionId);

  return (
    <div className="bg-ledger-panel border border-ledger-line rounded-lg p-4 flex flex-col md:flex-row md:flex-wrap md:items-end gap-4">
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <span className="text-ledger-slate text-xs uppercase tracking-wide">Date Range</span>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:overflow-visible md:pb-0">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => onPreset(p.key)}
              className="shrink-0 px-3 py-3 md:py-2 min-h-[44px] text-sm border border-ledger-line rounded-md hover:border-pulse-accent hover:text-pulse-accent transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="border border-ledger-line rounded-md px-2 py-3 md:py-2 min-h-[44px] text-sm flex-1 min-w-0"
          />
          <span className="text-ledger-slate text-sm shrink-0">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="border border-ledger-line rounded-md px-2 py-3 md:py-2 min-h-[44px] text-sm flex-1 min-w-0"
          />
        </div>

        {dateError && <span className="text-pulse-down text-xs">{dateError}</span>}
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <FilterControl
          label="Sales Rep"
          value={filters.repId ?? ""}
          options={options?.reps ?? []}
          loading={optionsLoading}
          onChange={(v) => onChange({ ...filters, repId: v === "" ? undefined : v })}
        />

        <FilterControl
          label="Product Category"
          value={filters.categoryId ?? ""}
          options={options?.categories ?? []}
          loading={optionsLoading}
          onChange={(v) => onChange({ ...filters, categoryId: v === "" ? undefined : v })}
        />

        <FilterControl
          label="Region"
          value={filters.regionId ?? ""}
          options={options?.regions ?? []}
          loading={optionsLoading}
          onChange={(v) => onChange({ ...filters, regionId: v === "" ? undefined : v })}
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({ ...filters, repId: undefined, categoryId: undefined, regionId: undefined })}
          className="text-sm text-ledger-slate underline hover:text-pulse-down self-start md:self-auto min-h-[44px] flex items-center"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}