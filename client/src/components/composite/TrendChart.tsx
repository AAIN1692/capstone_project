import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Granularity, TrendResult } from "../../types/sales";

interface TrendChartProps {
  trend: TrendResult | null;
  loading: boolean;
  error: string | null;
  granularity: Granularity;
  onGranularityChange: (g: Granularity) => void;
}

const GRANULARITIES: Granularity[] = ["daily", "weekly", "monthly"];

const currencyShort = (v: number) => `$${(v / 1000).toFixed(0)}k`;

/** Revenue-over-time chart with a daily/weekly/monthly granularity toggle. */
export default function TrendChart({ trend, loading, error, granularity, onGranularityChange }: TrendChartProps) {
  return (
    <div className="bg-ledger-panel border border-ledger-line rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ledger-ink">Revenue Over Time</h2>
        <div className="flex gap-1 bg-ledger-bg rounded-md p-1">
          {GRANULARITIES.map((g) => (
            <button
              key={g}
              onClick={() => onGranularityChange(g)}
              className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                granularity === g ? "bg-pulse-accent text-white" : "text-ledger-slate hover:text-ledger-ink"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-pulse-down text-sm">{error}</p>}
      {!error && loading && <div className="h-64 animate-pulse bg-ledger-bg rounded-md" />}
      {!error && !loading && trend && trend.points.length === 0 && (
        <p className="text-ledger-slate text-sm h-64 flex items-center justify-center">
          No data for this selection.
        </p>
      )}
      {!error && !loading && trend && trend.points.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend.points}>
            <CartesianGrid stroke="#E4E7EC" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#5B6478" }} />
            <YAxis tickFormatter={currencyShort} tick={{ fontSize: 11, fill: "#5B6478" }} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
            <Line type="monotone" dataKey="revenue" stroke="#1E7F5C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
