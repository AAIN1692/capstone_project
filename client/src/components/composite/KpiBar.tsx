import KpiCard from "../atomic/KpiCard";
import { SummaryResult } from "../../types/sales";

interface KpiBarProps {
  summary: SummaryResult | null;
  loading: boolean;
  error: string | null;
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Top-of-page summary row: revenue, deals closed, avg deal size, quota attainment. */
export default function KpiBar({ summary, loading, error }: KpiBarProps) {
  if (error) {
    return (
      <div className="bg-ledger-panel border border-ledger-line rounded-lg px-5 py-4 text-pulse-down text-sm">
        {error}
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-ledger-panel border border-ledger-line rounded-lg px-5 py-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const quotaTone = summary.quotaAttainmentPct >= 100 ? "up" : summary.quotaAttainmentPct >= 80 ? "neutral" : "down";
  const quotaCaption = summary.quotaAttainmentPct >= 100 ? "On pace" : summary.quotaAttainmentPct >= 80 ? "Tracking behind" : "Behind pace";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard label="Total Revenue" value={currency.format(summary.totalRevenue)} />
      <KpiCard label="Deals Closed" value={String(summary.dealsClosed)} />
      <KpiCard label="Avg Deal Size" value={currency.format(summary.avgDealSize)} />
      <KpiCard
        label="Quota Attainment"
        value={`${summary.quotaAttainmentPct}%`}
        tone={quotaTone}
        caption={quotaCaption}
      />
    </div>
  );
}
