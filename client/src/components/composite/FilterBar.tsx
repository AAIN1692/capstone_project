import FilterControl from "../atomic/FilterControl";
import { FilterOptions, SalesFilters } from "../../types/sales";

interface FilterBarProps {
  filters: SalesFilters;
  options: FilterOptions | null;
  onChange: (filters: SalesFilters) => void;
  onPreset: (preset: "7d" | "30d" | "quarter") => void;
  dateError: string | null;
}

const PRESETS: { key: "7d" | "30d" | "quarter"; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "quarter", label: "This quarter" },
];

/** Global filter row: date range presets/custom range, rep, and category. */
export default function FilterBar({ filters, options, onChange, onPreset, dateError }: FilterBarProps) {
  const hasActiveFilters = Boolean(filters.repId || filters.categoryId || filters.regionId);

  return (
    <div className="bg-ledger-panel border border-ledger-line rounded-lg p-4 flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-ledger-slate text-xs uppercase tracking-wide">Date Range</span>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => onPreset(p.key)}
              className="px-3 py-2 text-sm border border-ledger-line rounded-md hover:border-pulse-accent hover:text-pulse-accent transition-colors"
            >
              {p.label}
            </button>
          ))}
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="border border-ledger-line rounded-md px-2 py-2 text-sm"
          />
          <span className="self-center text-ledger-slate text-sm">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="border border-ledger-line rounded-md px-2 py-2 text-sm"
          />
        </div>
        {dateError && <span className="text-pulse-down text-xs">{dateError}</span>}
      </div>

      <FilterControl
        label="Sales Rep"
        value={filters.repId ?? ""}
        options={options?.reps ?? []}
        onChange={(v) => onChange({ ...filters, repId: v === "" ? undefined : v })}
      />

      <FilterControl
        label="Product Category"
        value={filters.categoryId ?? ""}
        options={options?.categories ?? []}
        onChange={(v) => onChange({ ...filters, categoryId: v === "" ? undefined : v })}
      />

      <FilterControl
        label="Region"
        value={filters.regionId ?? ""}
        options={options?.regions ?? []}
        onChange={(v) => onChange({ ...filters, regionId: v === "" ? undefined : v })}
      />

      {hasActiveFilters && (
        <button
          onClick={() => onChange({ ...filters, repId: undefined, categoryId: undefined, regionId: undefined })}
          className="text-sm text-ledger-slate underline hover:text-pulse-down"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
