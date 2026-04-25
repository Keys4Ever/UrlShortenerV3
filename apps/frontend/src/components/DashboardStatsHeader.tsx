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
    <div className="flex flex-col gap-3 border-b border-border px-safe py-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))]">
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
    <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider sm:text-xs">
        {label}
      </span>
      <span
        className={`font-mono text-base font-bold tabular-nums sm:text-lg ${accent ? "text-neon" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
