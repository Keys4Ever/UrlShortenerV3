type DashboardStatsHeaderProps = {
  listLoading: boolean;
  total: number;
  totalClicks: number;
  aggregateClicks24h: number;
};

export function DashboardStatsHeader({
  listLoading,
  total,
  totalClicks,
  aggregateClicks24h,
}: DashboardStatsHeaderProps) {
  return (
    <div className="border-b border-border px-safe py-3 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] flex flex-wrap gap-x-8 gap-y-3">
      <StatBlock label="Short links" value={listLoading ? "…" : total} />
      <StatBlock
        label="Clicks (all time)"
        value={listLoading ? "…" : totalClicks.toLocaleString()}
      />
      <StatBlock
        label="Clicks (last 24h)"
        value={listLoading ? "…" : aggregateClicks24h.toLocaleString()}
        accent
      />
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`font-mono text-lg font-bold ${accent ? "text-neon" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
