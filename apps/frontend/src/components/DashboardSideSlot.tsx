import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardSideSlotProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardSideSlot({ children, className }: DashboardSideSlotProps) {
  return (
    <aside
      className={cn(
        "flex min-h-[min(40vh,320px)] w-full flex-shrink-0 flex-col self-stretch border-t border-border bg-surface md:min-h-0 md:w-[min(360px,38vw)] md:border-l md:border-t-0",
        className,
      )}
      aria-label="Side panel"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface">{children}</div>
    </aside>
  );
}

const ttyBarBtn =
  "shrink-0 font-mono text-[11px] text-muted-foreground transition-interact hover:text-foreground focus-ring-terminal min-h-9 min-w-9 inline-flex items-center justify-center";

type DashboardSideTtyBarProps = {
  rightSlot?: ReactNode;
  srTitle?: string;
  onBack?: () => void;
  onCollapse?: () => void;
  closeAriaLabel?: string;
};

export function DashboardSideTtyBar({
  rightSlot,
  srTitle,
  onBack,
  onCollapse,
  closeAriaLabel = "Close side panel",
}: DashboardSideTtyBarProps) {
  return (
    <div className="flex min-h-9 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface/20 px-3 font-mono text-muted-foreground">
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="shrink-0 text-neon-dim" aria-hidden>
          ●
        </span>
        {srTitle ? <span className="sr-only">{srTitle}</span> : null}
        {rightSlot}
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        {onBack ? (
          <button type="button" onClick={onBack} className={ttyBarBtn} aria-label="Back to shorten a new URL">
            {"[<]"}
          </button>
        ) : null}
        {onCollapse ? (
          <button type="button" onClick={onCollapse} className={ttyBarBtn} aria-label={closeAriaLabel}>
            [×]
          </button>
        ) : null}
      </span>
    </div>
  );
}
