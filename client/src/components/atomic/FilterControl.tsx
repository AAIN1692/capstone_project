interface Option {
  id: number;
  name: string;
}

interface FilterControlProps {
  label: string;
  value: number | "";
  options: Option[];
  onChange: (value: number | "") => void;
  loading?: boolean;
}

/** A single labeled select filter (rep, category, or region). */
export default function FilterControl({ label, value, options, onChange, loading = false }: FilterControlProps) {
  return (
    <label className="flex flex-col gap-1 text-sm w-full md:w-auto">
      <span className="text-ledger-slate text-xs uppercase tracking-wide">{label}</span>
      <select
        className={`border border-ledger-line rounded-md px-3 py-3 md:py-2 min-h-[44px] bg-ledger-panel text-ledger-ink focus:outline-none focus:ring-2 focus:ring-pulse-accent w-full ${
          loading ? "opacity-50 cursor-wait" : ""
        }`}
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      >
        <option value="">{loading ? "Loading..." : "All"}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </label>
  );
}
