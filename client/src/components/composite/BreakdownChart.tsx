import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BreakdownResult } from "../../types/sales";
import { useIsNarrowViewport } from "../../hooks/useIsNarrowViewport";

interface BreakdownChartProps {
  title: string;
  data: BreakdownResult | null;
  loading: boolean;
  error: string | null;
}

const currencyShort = (v: number) => `$${(v / 1000).toFixed(0)}k`;

/** Reusable ranked bar chart for rep / category / region breakdowns. */
export default function BreakdownChart({ title, data, loading, error }: BreakdownChartProps) {
  const isNarrow = useIsNarrowViewport();
  return (
    <div className="bg-ledger-panel border border-ledger-line rounded-lg p-5">
      <h2 className="font-display text-lg text-ledger-ink mb-4">{title}</h2>

      {error && <p className="text-pulse-down text-sm">{error}</p>}
      {!error && loading && <div className="h-64 animate-pulse bg-ledger-bg rounded-md" />}
      {!error && !loading && data && data.items.length === 0 && (
        <p className="text-ledger-slate text-sm h-64 flex items-center justify-center">
          No data for this selection.
        </p>
      )}
      {!error && !loading && data && data.items.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.items} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid stroke="#E4E7EC" horizontal={false} />
            <XAxis type="number" tickFormatter={currencyShort} tick={{ fontSize: isNarrow ? 10 : 11, fill: "#5B6478" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={isNarrow ? 70 : 100}
              tick={{ fontSize: isNarrow ? 10 : 11, fill: "#5B6478" }}
            />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
            <Bar dataKey="revenue" fill="#1E7F5C" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
