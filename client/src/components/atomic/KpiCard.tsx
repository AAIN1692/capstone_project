interface KpiCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "up" | "down";
  caption?: string;
}

const toneStyles: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  neutral: "text-ledger-ink",
  up: "text-pulse-up",
  down: "text-pulse-down",
};

/** A single KPI value with a label and optional tone-colored caption. */
export default function KpiCard({ label, value, tone = "neutral", caption }: KpiCardProps) {
  return (
    <div className="bg-ledger-panel border border-ledger-line rounded-lg px-5 py-4 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-ledger-slate">{label}</span>
      <span className={`font-mono text-2xl tabular-nums ${toneStyles[tone]}`}>{value}</span>
      {caption && <span className={`text-xs ${toneStyles[tone]}`}>{caption}</span>}
    </div>
  );
}